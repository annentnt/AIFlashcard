# rag/embedding.py
import openai
from memoria.settings import OPENAI_API_KEY

client = openai.OpenAI(api_key=OPENAI_API_KEY)

def get_embedding(text: str) -> list:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=[text]
    )
    return response.data[0].embedding
