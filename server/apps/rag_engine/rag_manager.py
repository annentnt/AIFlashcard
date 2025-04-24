
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
        
    def load_vector_store(self, store_id, user_id):
        """Load a vector store for a specific user and document"""
        store_path = os.path.join(settings.MEDIA_ROOT, 'vector_stores', f"{user_id}_{store_id}.pkl")
        success = self.vector_store.load(store_path)
        return success
    
    
    def generate_flashcards(self, store_id, user_id, num_flashcards=10, topic_name="Internship"):
            """Generate flashcards from document using RAG"""
            import json

            # Load the vector store
            if not self.load_vector_store(store_id, user_id):
                return None

            # Combine all text from the vector store
            all_text = "\n\n".join(self.vector_store.texts)

            
            prompt = f"""
        You are a language assistant that helps learners understand new vocabulary from documents.

        Extract up to {num_flashcards} key vocabulary words or phrases using Named Entity Recognition (NER) and keyphrase extraction.

        For each vocabulary word or phrase:
        - Include a short, relevant definition in the context of the original text.

        Return the output as a JSON object with the following format:

        {{
        "name": "{topic_name}",
        "flashcards": [
            {{
            "vocabulary": "Example term",
            "description": "Its meaning in context."
            }},
            ...
        ]
        }}

        Only return a valid JSON object. Do not add any explanation.
            """

            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that returns JSON flashcards."},
                        {"role": "user", "content": prompt + "\n\n" + all_text}
                    ],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )

                raw_output = response.choices[0].message.content
                result = json.loads(raw_output)

                # Kiểm tra structure đúng như mong muốn
                if "name" in result and "flashcards" in result:
                    return result
                else:
                    raise ValueError("Response JSON missing required keys")

            except Exception as e:
                print(f"[ERROR] generate_flashcards failed: {e}")
                return {
                    "name": topic_name,
                    "flashcards": []
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
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided context. If you don't know the answer based on the context, say so."},
                {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
            ],
            temperature=0.3
        )
        
        return response.choices[0].message.content
    