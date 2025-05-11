import os
import uuid
from django.conf import settings
import openai
from .text_processor import TextProcessor
from .vector_store import VectorStore


class RAGManager:
    def __init__(self):
        self.text_processor = TextProcessor()
        self.vector_store = VectorStore()
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
    def process_document(self, file, filename, user_id):
        """Process a document and create a vector store for it"""
        # Extract text from the document
        text = self.text_processor.extract_text_from_file(file, filename)
        
        # Chunk the text
        chunks = self.text_processor.chunk_text(text)

        # Create metadata for each chunk
        metadatas = [{
            "source": filename,
            "chunk_index": i,
            "user_id": user_id
        } for i in range(len(chunks))]
        
        # Create vector store
        self.vector_store.add_texts(chunks, metadatas)
        
        # Save vector store
        store_id = str(uuid.uuid4())
        store_path = os.path.join(settings.MEDIA_ROOT, 'vector_stores', f"{user_id}_{store_id}.pkl")
        self.vector_store.save(store_path)
        
        return {
            "store_id": store_id,
            "chunk_count": len(chunks),
            "store_path": store_path
        }
    
    def process_raw_text(self, text, user_id):
        """
        Process raw text (not from a file), create chunks and build a vector store for it.
        """
        import uuid
        import os

        # Chunk the raw text
        chunks = self.text_processor.chunk_text(text)

        # Create metadata for each chunk
        metadatas = [{
            "source": "raw_text",
            "chunk_index": i,
            "user_id": user_id
        } for i in range(len(chunks))]

        # Add to vector store
        self.vector_store.add_texts(chunks, metadatas)

        # Save vector store
        store_id = str(uuid.uuid4())
        store_path = os.path.join(settings.MEDIA_ROOT, 'vector_stores', f"{user_id}_{store_id}.pkl")
        self.vector_store.save(store_path)

        return {
            "store_id": store_id,
            "chunk_count": len(chunks),
            "store_path": store_path
        }
        
    def load_vector_store(self, store_id, user_id):
        """Load a vector store for a specific user and document"""
        store_path = os.path.join(settings.MEDIA_ROOT, 'vector_stores', f"{user_id}_{store_id}.pkl")
        success = self.vector_store.load(store_path)
        return success
    
    
    def generate_flashcards(self, store_id, user_id, num_flashcards):
        """Generate flashcards from document using RAG"""
        import json

        # Load the vector store
        if not self.load_vector_store(store_id, user_id):
            return None

        # Combine all text from the vector store
        all_text = "\n\n".join(self.vector_store.texts)

        prompt = f"""
            You are a language assistant that helps learners understand new vocabulary from documents.

            First, extract **all named entities and key phrases** from the document using Named Entity Recognition (NER) and keyphrase extraction techniques. Return them as a flat list of strings, not duplicates.

            Then, **select {num_flashcards} of the most important or educational terms** and write short, relevant definitions based on their context in the document.

            Return the output strictly as a JSON object with the following format:

            {{
                "name": "Topic name",
                "entities": ["Entity1", "Entity2", ...],
                "flashcards": [
                    {{
                        "vocabulary": "Entity1",
                        "description": "Its meaning in context."
                    }},
                    ...
                ]
            }}

            Only return a valid JSON object. Do not add any explanation.
            """

        try:
            response = self.openai_client.responses.create(
                model=settings.USED_GPT_MODEL,
                input=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": all_text}
                ],
                temperature=0.3,
                text={
                    "format": {
                        "type": "json_schema",
                        "name": "flashcard_list",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "name" : {"type": "string"},
                                "entities": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "flashcards": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "vocabulary": {"type": "string"},
                                            "description": {"type": "string"}
                                        },
                                        "required": ["vocabulary", "description"],
                                        "additionalProperties": False
                                    }
                                }
                            },
                            "required": ["name", "entities", "flashcards"],
                            "additionalProperties": False
                        },
                        "strict": True
                    }
                }
            )

            result = json.loads(response.output_text)

            # Kiểm tra structure đúng như mong muốn
            if "name" in result and "flashcards" in result and "entities" in result:
                return result
            else:
                raise ValueError("Response JSON missing required keys")

        except Exception as e:
            print(f"[ERROR] generate_flashcards failed: {e}")
            return {
                "name": '',
                "flashcards": [],
                "entities": []
            }

    def answer_question(self, store_id, user_id, question):
        """Answer a question using RAG"""
        # Load the vector store
        if not self.load_vector_store(store_id, user_id):
            return "Sorry, I couldn't find the relevant knowledge base."
            
        # Retrieve relevant chunks
        relevant_chunks = self.vector_store.similarity_search(question, top_k=3)
        
        # Combine retrieved texts
        context = "\n\n---\n\n".join([chunk["text"] for chunk in relevant_chunks])
        
        # Generate answer
        response = self.openai_client.chat.completions.create(
            model=settings.USED_GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided context. If you don't know the answer based on the context, say so."},
                {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
            ],
            temperature=0.3
        )
        
        return response.choices[0].message.content