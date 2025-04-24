from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Topic
from .serializers import TopicSerializer
from rag_engine.rag_manager import RAGManager
from rag_engine.text_processor import TextProcessor
from rag_engine.utils import is_content_safe

SUPPORTED_FORMATS = ['.pdf', '.docx', '.pptx', '.txt']


class GenerateFlashcardsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        filename = file.name
        num_flashcards = int(request.POST.get('num_flashcards', 10))

        if not file or not filename.endswith(tuple(SUPPORTED_FORMATS)):
            return Response({'error': 'Invalid file format. Supported formats are:' + ' '.join(SUPPORTED_FORMATS)}, status=status.HTTP_400_BAD_REQUEST)

        # Tăng giới hạn kích thước file khi sử dụng RAG
        max_size = 20 * 1024 * 1024  # 20MB
        if file.size > max_size:
            max_size_mb = max_size / (1024 * 1024)
            return Response({'error': f'File too large. Max size is {max_size_mb}MB.'}, status=status.HTTP_400_BAD_REQUEST)

        # Xử lý văn bản với RAG
        rag_manager = RAGManager()
        
        # Kiểm tra an toàn trước khi xử lý
        text_processor = TextProcessor()
        text = text_processor.extract_text_from_file(file, filename)
        
        if is_content_safe(text):
            return Response({'error': 'Content flagged as unsafe.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Reset file pointer cho việc đọc lại
        file.seek(0)
        
        # Xử lý tài liệu với RAG
        rag_result = rag_manager.process_document(file, filename, request.user.id)
        flashcards = rag_manager.generate_flashcards(rag_result['store_id'], request.user.id, num_flashcards)
        
        if not flashcards:
            return Response({'error': 'Failed to generate flashcards.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({
            'flashcards': flashcards,
            'store_id': rag_result['store_id']
        }, status=status.HTTP_200_OK)

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

