from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction, IntegrityError
from django.conf import settings

from .models import Topic
from .serializers import TopicSerializer
from rag_engine.rag_manager import RAGManager
from rag_engine.text_processor import TextProcessor
from knowledge_graph.kg_builder.kg_builder import KnowledgeGraphBuilder

SUPPORTED_FORMATS = ['.pdf', '.docx', '.pptx', '.txt']

class GenerateFlashcardsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        raw_text = request.data.get('text', '').strip()
        filename = file.name if file else 'input.txt'
        num_flashcards = int(request.POST.get('num_flashcards', 10))

        if not file and not raw_text:
            return Response({'error': 'You must provide either a file or raw text.'}, status=status.HTTP_400_BAD_REQUEST)

        if file and not filename.endswith(tuple(SUPPORTED_FORMATS)):
            return Response({'error': f'Invalid file format. Supported formats are: {", ".join(SUPPORTED_FORMATS)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Giới hạn kích thước file
        if file:
            max_size = settings.DATA_UPLOAD_MAX_MEMORY_SIZE
            if file.size > max_size:
                max_size_mb = max_size / (1024 * 1024)
                return Response({'error': f'File too large. Max size is {max_size_mb}MB.'}, status=status.HTTP_400_BAD_REQUEST)

        # Extract text
        text_processor = TextProcessor()
        if file:
            text = text_processor.extract_text_from_file(file, filename)
            file.seek(0)  # Reset pointer for further reading
        else:
            text = raw_text

        # Content safety check
        if text_processor.check_content_safety(text):
            return Response({'error': 'Content flagged as unsafe.'}, status=status.HTTP_400_BAD_REQUEST)

        rag_manager = RAGManager()

        if file:
            rag_result = rag_manager.process_document(file, filename, request.user.id)
        else:
            rag_result = rag_manager.process_raw_text(text, request.user.id)

        flashcards = rag_manager.generate_flashcards(
            rag_result['store_id'],
            request.user.id,
            num_flashcards
        )

        if not flashcards:
            return Response({'error': 'Failed to generate flashcards.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'name': flashcards['name'],
            'flashcards': flashcards['flashcards'],
            'entities': flashcards['entities'],
            'original_text': text,
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
        """
        Create a topic with flashcards and build a knowledge graph from original text.
        Expects: { "name": "...", "flashcards": [...], "entities": [...], "original_text": "..." , "store_id": "..."}
        """
        user = request.user
        serializer = TopicSerializer(data=request.data, context={"request": request})
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # First save the topic - this commits it to the database
                    topic = serializer.save(user=user)
                    
                    # After the transaction is committed, proceed with graph building if needed
                    original_text = request.data.get("original_text")
                    flashcards = request.data.get("flashcards", [])
                    entities = request.data.get("entities", [])

                    if original_text and entities:
                        # Explicitly get the topic by ID from the database to ensure it exists
                        topic_id = topic.id
                        topic_obj = Topic.objects.get(id=topic_id)
                        
                        # Now build the graph in a separate transaction
                        try:
                            self._build_knowledge_graph(
                                topic_id=topic_id,
                                text=original_text,
                                entities=entities,
                            )
                        except Exception as e:
                            print(f"Error in graph creation: {str(e)}")

                    return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            except IntegrityError as e:
                return Response(
                    {"error": f"Database integrity error: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {"error": f"Error creating topic with graph: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _build_knowledge_graph(self, topic_id, text, entities):
        """
        Build a knowledge graph from text and flashcards using the Django-based graph builder.
        """
        try:
            # Get the topic object using the ID - this ensures it exists in the database
            topic = Topic.objects.get(id=topic_id)
            
            # Initialize the Django-based graph builder
            graph_builder = KnowledgeGraphBuilder()
            
            # Generate the graph - this method internally creates the Graph, GraphNode, 
            # and GraphRelationship records in the database
            result = graph_builder.build_graph_from_text(
                text=text,
                extracted_nodes=entities,
                topic=topic
            )
            return result
            
        except Topic.DoesNotExist:
            print(f"Topic with ID {topic_id} does not exist")
            return None
        except IntegrityError as ie:
            print(f"Database integrity error building knowledge graph: {str(ie)}")
            raise
        except Exception as e:
            print(f"Error building knowledge graph: {str(e)}")
            raise
    
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

