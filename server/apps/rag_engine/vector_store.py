
import numpy as np
from scipy.spatial.distance import cosine
import openai
import pickle
import os
from django.conf import settings

class VectorStore:
    def __init__(self):
        self.embeddings = []
        self.texts = []
        self.metadata = []
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
    def add_texts(self, texts, metadatas=None):
        """Add texts to the vector store with their embeddings"""
        if metadatas is None:
            metadatas = [{} for _ in texts]
            
        # Get embeddings for all texts
        embeddings = self._get_embeddings(texts)
        
        # Store texts, embeddings, and metadata
        self.texts.extend(texts)
        self.embeddings.extend(embeddings)
        self.metadata.extend(metadatas)
        
    def _get_embeddings(self, texts):
        """Generate embeddings for given texts using OpenAI's embedding API"""
        embeddings = []
        
        # Process in batches of 10 to avoid API limits
        batch_size = 10
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            
            response = self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=batch_texts
            )
            
            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)
            
        return embeddings
        
    def similarity_search(self, query, top_k=5):
        """Find the most similar documents to the query"""
        # Get the embedding for the query
        query_embedding = self._get_embeddings([query])[0]
        
        # Calculate similarities
        similarities = []
        for doc_embedding in self.embeddings:
            similarity = 1 - cosine(query_embedding, doc_embedding)
            similarities.append(similarity)
            
        # Get indices of top_k most similar documents
        indices = np.argsort(similarities)[-top_k:][::-1]
        
        # Return the texts and metadata of the top_k most similar documents
        results = []
        for idx in indices:
            results.append({
                "text": self.texts[idx],
                "metadata": self.metadata[idx],
                "similarity": similarities[idx]
            })
            
        return results
    
    def save(self, filepath):
        """Save the vector store to disk"""
        data = {
            "embeddings": self.embeddings,
            "texts": self.texts,
            "metadata": self.metadata
        }
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'wb') as f:
            pickle.dump(data, f)
            
    def load(self, filepath):
        """Load the vector store from disk"""
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                data = pickle.load(f)
                
            self.embeddings = data["embeddings"]
            self.texts = data["texts"]
            self.metadata = data["metadata"]
            
            return True
        return False