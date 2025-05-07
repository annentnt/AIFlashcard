from django.db import models
from apps.flashcards.models import Topic

# Create your models here.
class Graph(models.Model):
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name="graph")
    created_at = models.DateTimeField(auto_now_add=True)

class GraphNode(models.Model):
    graph = models.ForeignKey(Graph, on_delete=models.CASCADE, related_name="nodes")
    label = models.CharField(max_length=100)
    name = models.TextField()

class GraphRelationship(models.Model):
    graph = models.ForeignKey(Graph, on_delete=models.CASCADE, related_name="relationships")
    type = models.CharField(max_length=100)
    start_node_id = models.CharField(max_length=100)
    end_node_id = models.CharField(max_length=100)