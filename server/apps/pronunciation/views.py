from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import requests
# Create your views here.

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