from apps.knowledge_graph.models import Graph, GraphNode, GraphRelationship
from django.conf import settings

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
    
    def build_graph_from_text(self, text, extracted_nodes, topic):
        """Build a knowledge graph from text and store it in models."""
        # Create the graph record associated with the topic
        graph = Graph.objects.create(topic=topic)
            
        # Split text into chunks for processing
        chunks = self.splitter.split_text(text)

        self.llm_transformer = LLMGraphTransformer(
            llm=self.llm,
            allowed_nodes=extracted_nodes,
            )
        
        chunk_results = []
        # Process chunks in parallel
        for chunk in chunks:
            documents = [Document(page_content=chunk)]
            graph_documents = self.llm_transformer.convert_to_graph_documents(documents)

            chunk_results.append(graph_documents[0])
        
        # Process and deduplicate nodes and relationships
        node_map = {}  # To track unique nodes
        relationship_map = {}  # To track unique relationships
        
        for result in chunk_results:
            if not result:
                continue
                
            # Process nodes
            for node in result.nodes:
                name = node.id
                label = node.type
                
                # Create a unique identifier for the node
                unique_key = f"{label}:{name}"
                
                if unique_key not in node_map:
                    node_map[unique_key] = {
                        'label': label,
                        'name': name
                    }
                                
            # Process relationships
            for rel in result.relationships:
                rel_type = rel.type
                start_node_key = f"{rel.source.type}:{rel.source.id}"
                end_node_key = f"{rel.target.type}:{rel.target.id}"
                
                # Only add relationship if we have both nodes
                if start_node_key and end_node_key:
                    # Create a unique identifier for the relationship
                    unique_key = f"({start_node_key}):{rel_type}:({end_node_key})"
                    
                    if unique_key not in relationship_map:
                        relationship_map[unique_key] = {
                            'type': rel_type,
                            'start_node_key': start_node_key,
                            'end_node_key': end_node_key,
                        }
                        
        # Create model instances
        created_nodes = []
        for key in node_map.keys():
            node_data = node_map[key]
            node = GraphNode.objects.create(
                graph=graph,
                label=node_data['label'],
                name=node_data['name']
            )
            node_map[key]['id'] = node.pk
            created_nodes.append(node)
        
        created_relationships = []
        for rel_data in relationship_map.values():
            rel = GraphRelationship.objects.create(
                graph=graph,
                type=rel_data['type'],
                start_node_id=node_map[rel_data['start_node_key']]['id'],
                end_node_id=node_map[rel_data['end_node_key']]['id'],
            )
            created_relationships.append(rel)
        
        return {
            'graph': graph,
            'nodes': created_nodes,
            'relationships': created_relationships
        }