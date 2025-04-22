from django.shortcuts import render, HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import requests

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import os

# Create your views here.
load_dotenv()

class WordPronunciation(APIView):

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
    
    def _text_to_speech(self, text: str) -> bytes:

        client = ElevenLabs(
            api_key=os.getenv("ELEVENLABS_API_KEY")
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