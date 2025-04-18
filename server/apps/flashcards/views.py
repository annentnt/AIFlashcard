from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Topic, Flashcard
from .serializers import TopicSerializer
from .utils import call_openai_extract_flashcards

SUPPORTED_FORMATS = ['.pdf', '.docx', '.pptx', '.txt']

class GenerateFlashcardsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        filename = file.name
        num_flashcards = int(request.POST.get('num_flashcards', 10))

        if not file or not filename.endswith(SUPPORTED_FORMATS):
            return Response({'error': 'Invalid file format. Supported formats are:' + ' '.join(SUPPORTED_FORMATS)}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > 5 * 1024 * 1024:
            return Response({'error': 'File too large. Max size is 5MB.'}, status=status.HTTP_400_BAD_REQUEST)

        # Important: pass the file *before reading it*
        flashcards = call_openai_extract_flashcards(file, filename, num_flashcards)

        if flashcards is None:
            return Response({'error': 'Content flagged as unsafe.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'flashcards': flashcards}, status=status.HTTP_200_OK)


class TopicView(APIView):
    permission_classes = [IsAuthenticated]

    # READ all topics
    def get(self, request):
        topics = Topic.objects.filter(user=request.user)
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)

    # CREATE one topic
    def post(self, request):
        serializer = TopicSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
        return Response(serializer.data)

    # UPDATE one topic
    def put(self, request, pk):
        topic = self.get_object(pk, request.user)
        if topic is None:
            return Response({"error": "Topic not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TopicSerializer(topic, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE one topic
    def delete(self, request, pk):
        topic = self.get_object(pk, request.user)
        if topic is None:
            return Response({"error": "Topic not found."}, status=status.HTTP_404_NOT_FOUND)
        topic.delete()
        return Response({"message": "Topic deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

