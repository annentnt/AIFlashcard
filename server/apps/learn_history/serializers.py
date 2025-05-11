from rest_framework import serializers
from .models import DeskHistory

class DeskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DeskHistory
        fields = ['id_flashcard', 'id_topic', 'status']
