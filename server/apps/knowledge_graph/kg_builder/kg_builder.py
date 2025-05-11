from apps.knowledge_graph.models import Graph, GraphNode, GraphRelationship

import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.conf import settings
from django.db import transaction
from langchain.text_splitter import TokenTextSplitter
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_openai import ChatOpenAI
from langchain_core.documents import Document

class KnowledgeGraphBuilder:
    def __init__(
        self,
        openai_api_key = settings.OPENAI_API_KEY,
        model_name=settings.USED_GPT_MODEL,
    ):
        self.api_key = openai_api_key
        self.model_name = model_name

        self.llm = ChatOpenAI(
            model=self.model_name, 
            api_key=self.api_key
            )
        self.splitter = TokenTextSplitter(
            chunk_size=1000,
            chunk_overlap=500
        )

    def _normalize_key(self, label: str, name: str) -> str:
        def clean(text):
            # Convert to lowercase
            text = text.lower()
            # Remove accents (e.g., é → e)
            text = unicodedata.normalize('NFD', text)
            text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
            # Replace multiple spaces with one
            text = re.sub(r'\s+', ' ', text)
            # Remove punctuation
            text = re.sub(r'[^\w\s]', ' ', text)
            # Trim whitespace
            return text.strip()

        return f"{clean(label)}:{clean(name)}"
    
    def _process_chunk(self, chunk, transformer):
        documents = [Document(page_content=chunk)]
        result = transformer.convert_to_graph_documents(documents)
        return result[0] if result else None

    def build_graph_from_text(self, text, extracted_nodes, topic):
        """
        Build a knowledge graph from text and store it in models.
        This entire operation is wrapped in an atomic transaction.
        """
        with transaction.atomic():
            graph = Graph.objects.create(topic=topic)
            
            chunks = self.splitter.split_text(text)

            self.llm_transformer = LLMGraphTransformer(
                llm=self.llm,
                allowed_nodes=extracted_nodes,
            )

            # Run in parallel
            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = [executor.submit(self._process_chunk, chunk, self.llm_transformer) for chunk in chunks]
                chunk_results = [f.result() for f in as_completed(futures) if f.result()]

            node_map = {}
            relationship_map = {}

            for result in chunk_results:
                if not result:
                    continue

                for node in result.nodes:
                    key = self._normalize_key(node.type, node.id)
                    if key not in node_map:
                        node_map[key] = {
                            "label": node.type,
                            "name": node.id
                        }
                        # print(unique_key, node_map[unique_key])

                for rel in result.relationships:
                    start_key = self._normalize_key(rel.source.type, rel.source.id)
                    end_key = self._normalize_key(rel.target.type, rel.target.id)
                    unique_key = f"({start_key}):{rel.type}:({end_key})"
                    if unique_key not in relationship_map:
                        relationship_map[unique_key] = {
                            "type": rel.type,
                            "start_node_key": start_key,
                            "end_node_key": end_key,
                        }

            # Bulk create nodes
            created_nodes = GraphNode.objects.bulk_create([
                GraphNode(graph=graph, label=data['label'], name=data['name'])
                for data in node_map.values()
            ])

            # Map IDs back
            for created, key in zip(created_nodes, node_map.keys()):
                node_map[key]['id'] = created.pk

            # Bulk create relationships
            created_relationships = GraphRelationship.objects.bulk_create([
                GraphRelationship(
                    graph=graph,
                    type=rel['type'],
                    start_node_id=node_map[rel['start_node_key']]['id'],
                    end_node_id=node_map[rel['end_node_key']]['id'],
                )
                for rel in relationship_map.values()
                if rel['start_node_key'] in node_map and rel['end_node_key'] in node_map
            ])

            # print("Number of relationships missing nodes: ", len(relationship_map.keys()) - len(created_nodes))

            return {
                'graph': graph,
                'nodes': created_nodes,
                'relationships': created_relationships
            }