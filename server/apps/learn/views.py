from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.flashcards.models import Topic
from apps.flashcards.serializers import TopicSerializer
from apps.knowledge_graph.kg_builder.kg_manager import KnowledgeGraphManager
from apps.knowledge_graph.models import Graph

# Create your views here.
class TopicDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Topic.objects.get(pk=pk, user=user)
        except Topic.DoesNotExist:
            return None

    # READ one topic
    def get(self, request, pk):
        topic = self.get_object(pk, request.user)
        if topic is None:
            return Response({"error": "Topic not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TopicSerializer(topic)

        graph = Graph.objects.get(topic=topic)
        graph_manager = KnowledgeGraphManager()
        graph_manager.load_graph(graph)

        flashcards = serializer.data.get('flashcards', [])
        flashcards_map = {flashcard['vocabulary']: flashcard for flashcard in flashcards} # used to map the result list

        # Sort the list of flashcards
        flashcard_names = [flashcard['vocabulary'] for flashcard in flashcards]
        flashcard_names_sorted = graph_manager.sort_flashcards_by_similarity(flashcard_names)

        # Map the sorted list to flashcards
        flashcards_sorted = [flashcards_map[flashcard_name] for flashcard_name in flashcard_names_sorted]

        result = serializer.data
        result['flashcards'] = flashcards_sorted

        return Response(result)