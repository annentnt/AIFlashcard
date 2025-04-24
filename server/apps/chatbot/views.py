

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rag_engine.rag_manager import RAGManager

class ConversationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all conversations for a user"""
        conversations = Conversation.objects.filter(user=request.user).order_by('-updated_at')
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new conversation"""
        data = request.data.copy()
        serializer = ConversationSerializer(data=data)
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            return Conversation.objects.get(pk=pk, user=user)
        except Conversation.DoesNotExist:
            return None
    
    def get(self, request, pk):
        """Get a specific conversation with its messages"""
        conversation = self.get_object(pk, request.user)
        if conversation is None:
            return Response({"error": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)
    
    def delete(self, request, pk):
        """Delete a specific conversation"""
        conversation = self.get_object(pk, request.user)
        if conversation is None:
            return Response({"error": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        
        conversation.delete()
        return Response({"message": "Conversation deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class ChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Send a message and get a response"""
        conversation_id = request.data.get('conversation_id')
        store_id = request.data.get('store_id')
        question = request.data.get('message')
        
        if not store_id or not question:
            return Response({
                'error': 'Both store_id and message are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create conversation
        conversation = None
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=request.user)
            except Conversation.DoesNotExist:
                return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Create new conversation with default title (can be updated later)
            conversation = Conversation.objects.create(
                user=request.user,
                store_id=store_id,
                title=f"Chat about {question[:30]}..." if len(question) > 30 else question
            )
        
        # Save user message
        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=question
        )
        
        # Generate answer with RAG
        rag_manager = RAGManager()
        answer = rag_manager.answer_question(store_id, request.user.id, question)
        
        # Save assistant message
        assistant_message = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=answer
        )
        
        # Update conversation's updated_at timestamp
        conversation.save()
        
        return Response({
            'conversation_id': conversation.id,
            'answer': answer,
            'user_message': MessageSerializer(user_message).data,
            'assistant_message': MessageSerializer(assistant_message).data
        }, status=status.HTTP_200_OK)
