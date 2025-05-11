from django.shortcuts import render, HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import DeskHistory
from .serializers import DeskHistorySerializer

class QeStatus(APIView):
    def post(self, request, Qstatus): 
        try:
            DeskHistory.objects.create(
                id_flashcard = request.POST.get("id_flashcard"),
                id_topic = request.POST.get("id_topic"),
                status = "new"
            ).save()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"message": "Saved successfully"}, status=status.HTTP_202_ACCEPTED)
    
    def get(self, request, Qstatus=None):
        try:
            if Qstatus == None:
                id_topic = request.data.get("id_topic")
                id_flashcard = request.data.get("id_flashcard")
                card = DeskHistory.objects.get(id_topic=id_topic, id_flashcard=id_flashcard)
                card = DeskHistorySerializer(card)
                return Response(card.data)
            else:
                cards = DeskHistory.objects.filter(status=Qstatus)
                cards = DeskHistorySerializer(cards, many=True)
                return Response(cards.data)
        except DeskHistory.DoesNotExist:
            return Response({"error": "Record not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
    def put(self, request):
        id_topic = request.data.get("id_topic")
        id_flashcard = request.data.get("id_flashcard")
        status_new = request.data.get("status")

        if not all([id_topic, id_flashcard, status_new]):
            return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            record = DeskHistory.objects.get(id_topic=id_topic, id_flashcard=id_flashcard)
            record.status = status_new
            record.save()
            return Response({"message": "Status updated successfully"}, status=status.HTTP_200_OK)
        except DeskHistory.DoesNotExist:
            return Response({"error": "Record not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        