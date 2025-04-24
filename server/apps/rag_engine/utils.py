
import openai
from django.conf import settings

def is_content_safe(text: str) -> bool:
    """Check if content is safe using OpenAI's moderation API"""
    moderation_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    moderation_response = moderation_client.moderations.create(
        model="text-moderation-latest",
        input=text
    )

    result = moderation_response.results[0].flagged

    return result