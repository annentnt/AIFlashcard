from rest_framework import serializers
from .models import GraphNode, GraphRelationship, Graph

class GraphNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GraphNode
        fields = ['id', 'label', 'name']

class GraphRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GraphRelationship
        fields = ['id', 'type', 'start_node_id', 'end_node_id']

class GraphSerializer(serializers.ModelSerializer):
    nodes = GraphNodeSerializer(many=True, read_only=True)
    relationships = GraphRelationshipSerializer(many=True, read_only=True)

    class Meta:
        model = Graph
        fields = ['id', 'topic', 'created_at', 'nodes', 'relationships']
        read_only_fields = ['topic', 'created_at']
