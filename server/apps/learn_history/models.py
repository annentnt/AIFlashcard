from django.db import models

# Create your models here.

class DeskHistory(models.Model):
    id_flashcard = models.CharField(max_length=1000)
    id_topic = models.CharField(max_length=1000)
    status = models.CharField(max_length=1000)

    class Meta:
        unique_together = ('id_flashcard', 'id_topic')
