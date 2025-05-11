from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from apps.flashcards.models import Topic
from apps.knowledge_graph.kg_builder.kg_manager import KnowledgeGraphManager
from apps.knowledge_graph.models import Graph
from apps.knowledge_graph.serializers import GraphSerializer

# Create your views here.
class KGView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        topic = Topic.objects.get(pk=pk, user=request.user)
        if topic is None:
            return Response({"error": "Topic not found."}, status=status.HTTP_404_NOT_FOUND)
        
        graph = Graph.objects.get(topic=topic)
        graph_manager = KnowledgeGraphManager()
        graph_manager.load_graph(graph)
        graph_manager.visualize_graph(topic.pk)

        serializer = GraphSerializer(graph)

        return Response(serializer.data)