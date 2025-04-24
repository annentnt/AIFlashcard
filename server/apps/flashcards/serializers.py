
from rest_framework import serializers
from .models import Topic, Flashcard

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = ['id', 'vocabulary', 'description']

class TopicSerializer(serializers.ModelSerializer):
    flashcards = FlashcardSerializer(many=True)

    class Meta:
        model = Topic
        fields = ['id', 'name', 'flashcards', 'store_id']

    def create(self, validated_data):
        flashcards_data = validated_data.pop('flashcards', [])
        topic = Topic.objects.create(**validated_data)

        for fc_data in flashcards_data:
            Flashcard.objects.create(topic=topic, **fc_data)

        return topic

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.store_id = validated_data.get('store_id', instance.store_id)
        instance.save()

        new_flashcards_data = validated_data.pop('flashcards', [])

        # Get current flashcards as a dict for quick lookup
        existing_flashcards = {fc.id: fc for fc in instance.flashcards.all()}

        # Track flashcard IDs we are keeping
        incoming_ids = set()

        for fc_data in new_flashcards_data:
            fc_id = fc_data.get('id')

            if fc_id and fc_id in existing_flashcards:
                # Update existing flashcard
                flashcard = existing_flashcards[fc_id]
                flashcard.vocabulary = fc_data.get('vocabulary', flashcard.vocabulary)
                flashcard.description = fc_data.get('description', flashcard.description)
                flashcard.save()
                incoming_ids.add(fc_id)
            else:
                # New flashcard
                Flashcard.objects.create(topic=instance, **fc_data)

        # Delete flashcards not included in the incoming data
        to_delete_ids = set(existing_flashcards.keys()) - incoming_ids
        Flashcard.objects.filter(id__in=to_delete_ids).delete()

        return instance