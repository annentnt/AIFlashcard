import networkx as nx
import matplotlib.pyplot as plt
from multipledispatch import dispatch
import re
import os
from django.conf import settings

from apps.knowledge_graph.models import Graph, GraphNode, GraphRelationship

class KnowledgeGraphManager:
    def __init__(self):
        self.graph_data = None        # Raw data from query_graph
        self.nx_graph = nx.DiGraph()  # Operatable graph

    def _normalize(self, text: str) -> str:
        """
        Normalize text for consistent comparison.
        - Lowercase
        - Strip whitespace
        - Remove punctuation (optional)
        """
        return re.sub(r"[^\w\s]", "", text.strip().lower())
    
    def _query_graph(self, graph_id : int):
        """Query the graph to return serialized data."""
        try:
            graph = Graph.objects.get(id=graph_id)
            nodes = GraphNode.objects.filter(graph=graph)
            relationships = GraphRelationship.objects.filter(graph=graph)
            
            return graph, nodes, relationships
        
        except Graph.DoesNotExist:
            return None
        
    def _convert_to_graph_data(self, graph: Graph, nodes: list[GraphNode], relationships: list[GraphRelationship]):
        result = {
                'graph_id': graph.id,
                'name': graph.topic.name,
                'nodes': [
                    {
                        'id': node.id,
                        'label': node.label,
                        'name': node.name
                    } for node in nodes
                ],
                'relationships': [
                    {
                        'id': rel.id,
                        'type': rel.type,
                        'start_node_id': rel.start_node_id,
                        'end_node_id': rel.end_node_id,
                    } for rel in relationships
                ]
            }
        
        self.graph_data = result

        return result
        
    def _convert_to_networkx_graph(self):
        self.nx_graph.clear()

        # Add nodes
        for node in self.graph_data['nodes']:
            self.nx_graph.add_node(
                int(node['id']), 
                label=node['label'], 
                name=node['name']
                )
        
        # Add relationships as directed edges
        for rel in self.graph_data['relationships']:
            self.nx_graph.add_edge(
                int(rel['start_node_id']),
                int(rel['end_node_id']),
                type=rel['type']
            )

        return self.nx_graph

    @dispatch(int)
    def load_graph(self, graph_id : int):
        """
        Load graph data from the database using graph id and convert it to a networkx graph.
        """
        # Query the graph from your database
        query_result = self._query_graph(graph_id)
        if not query_result:
            raise ValueError(f"Graph with ID {graph_id} not found.")
        
        # Serialize the graph
        graph, nodes, rels = query_result
        self._convert_to_graph_data(graph, nodes, rels)
        
        # Convert to networkx graph
        self._convert_to_networkx_graph()

    @dispatch(Graph)
    def load_graph(self, graph : Graph):
        """
        Convert graph to a networkx graph.
        """
        # Query the nodes and relationships relating to graph from database
        nodes = GraphNode.objects.filter(graph=graph)
        rels = GraphRelationship.objects.filter(graph=graph)

        # Serialize graph
        self._convert_to_graph_data(graph, nodes, rels)
        
        # Convert to networkx graph
        self._convert_to_networkx_graph()

    def visualize_graph(self, topic_id):
        """
        Visualize the current networkx graph using matplotlib.
        """
        if self.nx_graph.number_of_nodes() == 0:
            print("No graph loaded to visualize.")
            return

        pos = nx.spring_layout(self.nx_graph, seed=42, k=0.5, iterations=30)
        labels = {node: data['name'] for node, data in self.nx_graph.nodes(data=True)}
        edge_labels = {(u, v): data['type'] for u, v, data in self.nx_graph.edges(data=True)}

        nx.draw(self.nx_graph, pos, with_labels=True, labels=labels, node_color='lightblue', edge_color='gray')
        nx.draw_networkx_edge_labels(self.nx_graph, pos, edge_labels=edge_labels, font_color='red')
        plt.title(f"Knowledge Graph: {self.graph_data['name']}")
        plt.axis('off')
        plt.tight_layout()
        plt.savefig(os.path.join(settings.GRAPHS_DIR, str(topic_id) + '.png'))
        plt.show()

    def sort_flashcards_by_similarity(self, flashcard_names: list[str]) -> list[str]:
        """
        Given a list of flashcard names, sort them so that similar ones are adjacent.
        Similarity is based on graph connectivity.
        - Flashcards not found in the graph are placed at the end.
        - Isolated flashcards are appended after connected groups.
        """
        # Map name <-> ID
        name_to_id = {self._normalize(data['name']): node_id for node_id, data in self.nx_graph.nodes(data=True)}
        id_to_name = {v: k for k, v in name_to_id.items()}

        # Map normalized entity names <-> Original names
        norm_to_org = {self._normalize(name): name for name in flashcard_names}

        # Partition input
        existing_names = [name for norm, name in norm_to_org.items() if norm in name_to_id]
        missing_names = [name for norm, name in norm_to_org.items() if norm not in name_to_id]

        if not existing_names:
            return missing_names

        # Get node IDs for existing flashcards
        node_ids = [name_to_id[self._normalize(name)] for name in existing_names]

        # Subgraph of flashcard nodes only
        subgraph = self.nx_graph.subgraph(node_ids).copy()

        # Connected components
        connected_components = list(nx.connected_components(subgraph.to_undirected()))

        sorted_names = []

        for component in connected_components:
            component_ids = list(component)

            # Greedy path-based ordering within component
            ordered = [component_ids.pop(0)]
            while component_ids:
                last = ordered[-1]
                next_id = min(
                    component_ids,
                    key=lambda nid: nx.shortest_path_length(subgraph.to_undirected(), last, nid)
                )
                component_ids.remove(next_id)
                ordered.append(next_id)

            sorted_names.extend([id_to_name[nid] for nid in ordered])

        sorted_names = [norm_to_org[name] for name in sorted_names]
        return sorted_names + missing_names