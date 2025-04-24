from django.db import models
from django.contrib.auth.models import User

class Topic(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    # Field để lưu trữ RAG store_id
    store_id = models.CharField(max_length=255, null=True, blank=True)

class Flashcard(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='flashcards')
    vocabulary = models.CharField(max_length=255)
    description = models.TextField()

