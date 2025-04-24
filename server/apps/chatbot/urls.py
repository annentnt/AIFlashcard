
from django.urls import path
from .views import ConversationView, ConversationDetailView, ChatView

urlpatterns = [
    path('conversations/', ConversationView.as_view(), name='conversations'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('chat/', ChatView.as_view(), name='chat'),
]