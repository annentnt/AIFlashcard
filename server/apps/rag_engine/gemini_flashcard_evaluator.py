import pandas as pd
import numpy as np
import os
import json
import matplotlib.pyplot as plt
import seaborn as sns
import requests
import re
from typing import List, Dict, Any, Union

class ImprovedGeminiFlashcardEvaluator:
    """
    An improved flashcard evaluator using Gemini-2.0-flash model to evaluate flashcard quality
    with support for longer texts, more entities, and batch processing of flashcards.
    """
    def __init__(self, api_key):
        self.api_key = api_key
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        self.headers = {
            "Content-Type": "application/json"
        }
        # Maximum token context window for Gemini-2.0-flash
        self.max_tokens = 30000  # Adjust based on actual model limits
    
    def _extract_numeric_value(self, text, pattern, default=0.5):
        """Extract numeric value using regex pattern"""
        match = re.search(pattern, text)
        if match:
            try:
                return float(match.group(1))
            except (ValueError, IndexError):
                return default
        return default
    
    def _parse_gemini_response(self, response_text):
        """
        Parse Gemini response which might not be strictly JSON formatted
        """
        # First try standard JSON parsing
        try:
            if response_text.startswith('```json'):
                response_text = response_text.strip('```json').strip()
            elif response_text.endswith('```'):
                response_text = response_text.strip('```').strip()
                
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass
        
        # If that fails, try to extract values using regex
        result = {}
        
        # Look for coverage score
        coverage_score = self._extract_numeric_value(
            response_text, 
            r'coverage_score[:\s]+([0-9.]+)', 
            0.5
        )
        result["coverage_score"] = coverage_score
        
        # Look for precision
        precision = self._extract_numeric_value(
            response_text, 
            r'precision[:\s]+([0-9.]+)', 
            0.5
        )
        result["precision"] = precision
        
        # Look for recall
        recall = self._extract_numeric_value(
            response_text, 
            r'recall[:\s]+([0-9.]+)', 
            0.5
        )
        result["recall"] = recall
        
        # Look for f1
        f1 = self._extract_numeric_value(
            response_text, 
            r'f1[:\s]+([0-9.]+)', 
            0.5
        )
        result["f1"] = f1
        
        # If we have a table-like structure, try to parse it
        if "| Precision | Recall | F1" in response_text:
            # Extract average values from the table if present
            table_lines = response_text.split('\n')
            
            # Find lines with numeric values
            numeric_lines = []
            for line in table_lines:
                if '|' in line and any(char.isdigit() for char in line):
                    parts = line.split('|')
                    if len(parts) >= 4:  # Should have at least 4 parts (including empty parts)
                        numeric_lines.append(parts)
            
            if numeric_lines:
                # Calculate averages from all entries
                precision_values = []
                recall_values = []
                f1_values = []
                
                for line in numeric_lines:
                    try:
                        # Extract numeric values from the table cells
                        precision_str = line[-3].strip() if len(line) > 2 else "0.5"  
                        recall_str = line[-2].strip() if len(line) > 1 else "0.5"
                        f1_str = line[-1].strip() if len(line) > 0 else "0.5"
                        
                        # Convert to float and add to lists
                        precision_values.append(float(precision_str))
                        recall_values.append(float(recall_str))
                        f1_values.append(float(f1_str))
                    except (ValueError, IndexError):
                        continue
                
                # Calculate averages if we have values
                if precision_values:
                    result["precision"] = sum(precision_values) / len(precision_values)
                if recall_values:
                    result["recall"] = sum(recall_values) / len(recall_values)
                if f1_values:
                    result["f1"] = sum(f1_values) / len(f1_values)
        
        # Add an explanation about where the values came from
        result["explanation"] = "Values extracted from Gemini's non-JSON response"
        
        return result
    
    def _call_gemini_api(self, prompt: str) -> Dict[str, Any]:
        """
        Call the Gemini API with the given prompt.
        """
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "topK": 32,
                "topP": 0.95
            }
        }
        
        try:
            print(f"Sending request to Gemini API...")
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            
            if response.status_code != 200:
                print(f"API request error: {response.status_code} {response.reason}")
                # Return default values with error explanation
                return {
                    "coverage_score": 0.5,
                    "precision": 0.5,
                    "recall": 0.5,
                    "f1": 0.5,
                    "explanation": f"Default scores due to request error: {response.status_code} {response.reason}"
                }
            
            response_data = response.json()
            
            # Extract the text from the response
            if 'candidates' in response_data and len(response_data['candidates']) > 0:
                response_text = response_data['candidates'][0]['content']['parts'][0]['text']
                
                # Parse the response, handling non-JSON formats
                return self._parse_gemini_response(response_text)
            else:
                print(f"Unexpected response format: {response_data}")
                # Return default values with error explanation
                return {
                    "coverage_score": 0.5,
                    "precision": 0.5,
                    "recall": 0.5,
                    "f1": 0.5,
                    "explanation": "Unexpected response format from API"
                }
                
        except requests.exceptions.RequestException as e:
            print(f"API request error: {e}")
            # Return default values with error explanation
            return {
                "coverage_score": 0.5,
                "precision": 0.5,
                "recall": 0.5,
                "f1": 0.5,
                "explanation": f"Default score due to request error: {str(e)}"
            }
    
    def _chunk_text(self, text, max_length=100000):
        """
        Chunk the text into manageable segments while trying to preserve meaningful breaks.
        """
        # If text is already small enough, return it directly
        if len(text) <= max_length:
            return [text]
            
        chunks = []
        # Try to split at paragraph breaks
        paragraphs = text.split('\n\n')
        current_chunk = ""
        
        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) + 2 <= max_length:
                if current_chunk:
                    current_chunk += "\n\n" + paragraph
                else:
                    current_chunk = paragraph
            else:
                # If current chunk is not empty, add it to chunks
                if current_chunk:
                    chunks.append(current_chunk)
                
                # If the paragraph itself is too long, split it further
                if len(paragraph) > max_length:
                    # Split at sentence boundaries
                    sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                    current_chunk = ""
                    
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) + 1 <= max_length:
                            if current_chunk:
                                current_chunk += " " + sentence
                            else:
                                current_chunk = sentence
                        else:
                            # Add current chunk to chunks if not empty
                            if current_chunk:
                                chunks.append(current_chunk)
                            
                            # If the sentence itself is too long, just split it arbitrarily
                            if len(sentence) > max_length:
                                for i in range(0, len(sentence), max_length):
                                    chunks.append(sentence[i:i + max_length])
                                current_chunk = ""
                            else:
                                current_chunk = sentence
                    
                    # Add any remaining text in current_chunk
                    if current_chunk:
                        chunks.append(current_chunk)
                else:
                    current_chunk = paragraph
        
        # Add final chunk if not empty
        if current_chunk:
            chunks.append(current_chunk)
            
        return chunks
    
    def evaluate_content_coverage(self, text: str, entities: List[str]) -> float:
        """
        Evaluate how well extracted entities cover the important concepts in the text.
        Improved to handle longer texts and more entities.
        """
        if not text or not entities:
            return 0.5  # Return default value for empty input
        
        print(f"Evaluating content coverage for {len(entities)} entities...")
        
        # Split text into manageable chunks if needed
        text_chunks = self._chunk_text(text)
        chunk_scores = []
        
        # Process all entities without limiting
        all_entities = entities
        entities_str = "\n".join([f"- {entity}" for entity in all_entities])
        
        for i, chunk in enumerate(text_chunks):
            print(f"Processing text chunk {i+1}/{len(text_chunks)}...")
            
            prompt = f"""
            You are an AI assistant that evaluates the quality of educational flashcards.
            
            I will provide you with:
            1. A text document (chunk {i+1} of {len(text_chunks)})
            2. A list of extracted entities from the entire document
            
            Your task is to evaluate how well these entities cover the important concepts in this text chunk.
            
            Analyze what proportion of key concepts from the text chunk are represented in the extracted entities.
            Score from 0.0 (poor coverage) to 1.0 (excellent coverage).
            
            Text document (chunk {i+1}/{len(text_chunks)}):
            {chunk}
            
            Extracted entities:
            {entities_str}
            
            Return your evaluation as a number between 0.0 and 1.0 in the format:
            coverage_score: <value>
            """
            
            result = self._call_gemini_api(prompt)
            if result and 'coverage_score' in result:
                chunk_scores.append(result['coverage_score'])
            else:
                chunk_scores.append(0.5)  # Default value if evaluation fails
        
        # Average the scores across all chunks
        overall_score = sum(chunk_scores) / len(chunk_scores) if chunk_scores else 0.5
        print(f"Overall content coverage score: {overall_score:.2f}")
        
        return overall_score
        
    def find_term_context(self, term, full_text, context_window=500):
        """Find the relevant context for a term in the full text"""
        term_lower = term.lower()
        text_lower = full_text.lower()
        
        # Find position of term
        pos = text_lower.find(term_lower)
        if pos == -1:
            return None  # Term not found
            
        # Extract surrounding context
        start = max(0, pos - context_window)
        end = min(len(full_text), pos + len(term) + context_window)
        
        return full_text[start:end]

    def evaluate_semantic_quality(self, flashcards: List[Dict[str, str]], text: str) -> Dict[str, float]:
        """
        Evaluate semantic similarity between flashcard descriptions and related context from the text.
        Improved to find specific context for each flashcard.
        """
        if not text or not flashcards:
            return {"precision": 0.5, "recall": 0.5, "f1": 0.5}  # Default values
        
        print(f"Evaluating semantic quality for {len(flashcards)} flashcards...")
        
        # Process flashcards in batches
        batch_size = 5  # Smaller batch size to handle more detailed contextual evaluation
        precision_scores = []
        recall_scores = []
        f1_scores = []
        
        # Process all flashcards in batches
        for i in range(0, len(flashcards), batch_size):
            batch = flashcards[i:i+batch_size]
            print(f"Processing flashcard batch {i//batch_size + 1}/{(len(flashcards)-1)//batch_size + 1}...")
            
            # Prepare flashcards with their relevant contexts
            flashcards_with_context = []
            
            for card in batch:
                term = card.get('vocabulary', '')
                definition = card.get('description', '')
                
                # Find relevant context for this term
                context = self.find_term_context(term, text)
                
                # If term not found directly, try alternative approaches
                if not context:
                    # Try to find partial matches (e.g., plurals, different forms)
                    term_parts = term.split()
                    if len(term_parts) > 1:
                        for part in term_parts:
                            if len(part) > 3:  # Only try with meaningful parts
                                context = self.find_term_context(part, text)
                                if context:
                                    break
                
                # If still no context found, use a small sample of the text
                if not context:
                    # Use the beginning of the text as fallback
                    context = text[:2000] if len(text) > 2000 else text
                
                flashcards_with_context.append({
                    "term": term,
                    "definition": definition,
                    "context": context
                })
            
            # Format flashcards and their contexts for the prompt
            flashcards_text = "\n\n".join([
                f"Term: {card['term']}\nDefinition: {card['definition']}\nContext from document:\n{card['context'][:1000]}..."
                for card in flashcards_with_context
            ])
            
            prompt = f"""
            You are an AI assistant that evaluates the quality of educational flashcards.
            
            I will provide you with several flashcards (term-definition pairs) along with the relevant context
            from the original document for each term.
            
            Your task is to evaluate how accurately these flashcard definitions capture the meaning
            from their corresponding contexts in the original document.
            
            Flashcards to evaluate (batch {i//batch_size + 1}/{(len(flashcards)-1)//batch_size + 1}):
            {flashcards_text}
            
            For each flashcard, assess:
            - Precision: How accurate/correct is the definition compared to the context?
            - Recall: How completely does the definition capture the relevant information from the context?
            
            Then provide aggregated metrics in this format:
            precision: <average precision value>
            recall: <average recall value>
            f1: <harmonic mean of precision and recall>
            
            If a term doesn't have a clear context or appears in multiple places with different meanings,
            focus your evaluation on how well the definition captures the most relevant usage of the term
            based on the provided context.
            """
            
            result = self._call_gemini_api(prompt)
            
            if result and 'precision' in result and 'recall' in result and 'f1' in result:
                precision_scores.append(result['precision'])
                recall_scores.append(result['recall'])
                f1_scores.append(result['f1'])
            else:
                # Default values if evaluation fails
                precision_scores.append(0.5)
                recall_scores.append(0.5)
                f1_scores.append(0.5)
        
        # Calculate overall averages
        avg_precision = sum(precision_scores) / len(precision_scores) if precision_scores else 0.5
        avg_recall = sum(recall_scores) / len(recall_scores) if recall_scores else 0.5
        avg_f1 = sum(f1_scores) / len(f1_scores) if f1_scores else 0.5
        
        print(f"Overall semantic quality - Precision: {avg_precision:.2f}, Recall: {avg_recall:.2f}, F1: {avg_f1:.2f}")
        
        return {
            "precision": avg_precision,
            "recall": avg_recall,
            "f1": avg_f1
        }
    
    def evaluate_flashcards(self, flashcards_data: Dict[str, Any], original_text: str = None) -> Dict[str, Any]:
        """
        Evaluate flashcards using all available metrics.
        """
        results = {}
        
        if original_text:
            # Evaluate content coverage - now using all entities
            coverage = self.evaluate_content_coverage(original_text, flashcards_data.get("entities", []))
            results["content_coverage"] = coverage
        
        # Evaluate semantic quality - now processing all flashcards
        semantic_quality = self.evaluate_semantic_quality(flashcards_data.get("flashcards", []), original_text)
        results["semantic_quality"] = semantic_quality
        
        # Add basic metrics
        results["flashcard_count"] = len(flashcards_data.get("flashcards", []))
        results["entity_count"] = len(flashcards_data.get("entities", []))
        
        print(f"Evaluation complete: {results}")
        return results
    
    def visualize_results(self, results: Dict[str, Any], output_path: str) -> pd.DataFrame:
        """
        Visualize evaluation results and save them to files.
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            plot_data = []
            
            if "content_coverage" in results:
                plot_data.append({"Metric": "Content Coverage", "Score": results["content_coverage"]})
            
            if "semantic_quality" in results:
                for metric in ["precision", "recall", "f1"]:
                    plot_data.append({
                        "Metric": f"Semantic {metric.capitalize()}", 
                        "Score": results["semantic_quality"].get(metric, 0.5)  # Default to 0.5 if missing
                    })
            
            df = pd.DataFrame(plot_data)
            
            # Use Agg backend for non-interactive plots (works better in threads)
            plt.switch_backend('Agg')
            
            plt.figure(figsize=(12, 8))
            sns.barplot(x="Metric", y="Score", data=df)
            plt.title("Flashcard Quality Evaluation (Gemini)")
            plt.xticks(rotation=45)
            plt.ylim(0, 1)
            plt.tight_layout()
            plt.savefig(output_path)
            plt.close()  # Close figure to avoid memory leaks
            
            # Save to CSV and JSON for further analysis
            df.to_csv(output_path.replace('.png', '.csv'), index=False)
            with open(output_path.replace('.png', '.json'), 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)
            
            print(f"Visualization saved to {output_path}")
            return df
        except Exception as e:
            print(f"Error visualizing results: {e}")
            # Return empty DataFrame if visualization fails
            return pd.DataFrame()