from django.contrib import admin
from .models import Graph, GraphNode, GraphRelationship

# Register your models here.
admin.site.register(Graph)
admin.site.register(GraphNode)
admin.site.register(GraphRelationship)