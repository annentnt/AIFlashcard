from django.shortcuts import render, HttpResponse

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from elevenlabs.client import ElevenLabs

import tempfile
from django.conf import settings
from io import BytesIO
import re, librosa, os, nltk, jiwer, requests

# Create your views here.
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger_eng')

class WordPronunciation(APIView):
    permission_classes = [IsAuthenticated]
    def _get_pronunciation(self, word):

        url = f'https://api.dictionaryapi.dev/api/v2/entries/en/{word.lower()}'

        response = requests.get(url)
        if response.status_code != 200:
            return {'error': 'Not found'}
        
        data = response.json()
        audio_url, ipa, example, partOfSpeech = None, None, None, None
        
        for phonetics in data[0]['phonetics']:
            if 'audio' in phonetics and phonetics['audio'] != '' and 'text' in phonetics:        
                audio_url = phonetics['audio']
                ipa = phonetics['text']        
                break

            if 'audio' in phonetics and 'text' in phonetics:
                audio_url = phonetics['audio']
                ipa = phonetics['text']  
        
        for meanings in data[0]['meanings']:
            if 'definitions' in meanings and 'example' in meanings['definitions'][0]:
                partOfSpeech = meanings['partOfSpeech']
                example = meanings['definitions'][0]['example']
                break

        return {
            'partOfSpeech': partOfSpeech,
            'ipa': ipa, 
            'audio_url': audio_url,
            'example': example
        } 

    def get(self, request, word):
        
        response = self._get_pronunciation(word)
        if 'error' in response:
            return Response(response, status=status.HTTP_404_NOT_FOUND)
        
        return Response(response, status=status.HTTP_200_OK)
    
class SentencePronunciation(APIView):
    permission_classes = [IsAuthenticated]
    
    def _text_to_speech(self, text: str) -> bytes:

        client = ElevenLabs(
            api_key=settings.ELEVENLABS_API_KEY
        )

        audio = client.text_to_speech.convert(
            text=text,
            voice_id="JBFqnCBsd6RMkjVDRZzb",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128"
        )
        
        return b''.join(audio)
    
    def post(self, request):

        if not request.data['text']:
            return Response({"error": "Missing 'text'"}, status=status.HTTP_400_BAD_REQUEST)

        audio_data = self._text_to_speech(text=request.data['text'])
        response = HttpResponse(audio_data, content_type='audio/mpeg')
        response['Content-Disposition'] = 'inline; filename="speech.mp3"'

        return response

class Evaluate(APIView):
    permission_classes = [IsAuthenticated]
    
    def _normalize(self, text):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text) 
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _speech_to_text(self, audio_path):
            
        client = ElevenLabs(
            api_key=settings.ELEVENLABS_API_KEY
        )

        with open(audio_path, 'rb') as f:
            audio_data = BytesIO(f.read())

        transcription = client.speech_to_text.convert(
            file=audio_data,
            model_id="scribe_v1",
            tag_audio_events=True, 
            language_code="eng", 
            diarize=True, 
        )
        return re.sub(r'[^\w\s]', '', transcription.text)


    def _score_fluency(self, audio_path, transcript): 
        duration = librosa.get_duration(filename=audio_path)
        word_count = len(transcript.split())
        wpm = word_count / (duration / 60)
        
        fluency_score = min(wpm / 120 * 9, 9)
        return round(fluency_score, 1)

    def _score_vocabulary(self, transcript):
        tokens = nltk.word_tokenize(transcript.lower())
        words = [w for w in tokens if w.isalpha()]
        unique_words = set(words)
        ttr = len(unique_words) / len(words) if words else 0
        return round(min(ttr * 20, 9), 1)  

    def _score_grammar(self, transcript):
        words = nltk.word_tokenize(transcript)
        tagged = nltk.pos_tag(words)
        bad_tags = [tag for word, tag in tagged if tag in ("UH", "SYM")]  
        penalty = len(bad_tags)
        score = max(9 - penalty, 3)  
        return round(score, 1)

    def _score_content(self, reference_text, predicted_text):
        reference = self._normalize(reference_text)
        predicted = self._normalize(predicted_text)

        wer = jiwer.wer(reference, predicted)  
        content_score = round((1 - wer) * 9, 2)  
        return content_score, wer

    def _evaluate_speaking(self, audio_path, correct_text):
        correct_text = re.sub(r'[^\w\s]', '', correct_text)

        transcript = self._speech_to_text(audio_path)
        # fluency = self._score_fluency(audio_path, transcript)
        vocabulary = self._score_vocabulary(transcript)
        grammar = self._score_grammar(transcript)
        content_score, wer = self._score_content(correct_text, transcript)

        return {
            "content_score": content_score, 
            "wer": wer,
            # "fluency_score": fluency,
            "vocabulary_score": vocabulary,
            "grammar_score": grammar,
            "transcript": transcript
        }

    def post(self, request):

        file = request.FILES.get('file_audio')
        
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            for chunk in file.chunks():
                tmp.write(chunk)
            audio_path = tmp.name  
            # print(audio_path)

        correct_text = request.data['text']

        return Response(self._evaluate_speaking(audio_path, correct_text), status=status.HTTP_200_OK)