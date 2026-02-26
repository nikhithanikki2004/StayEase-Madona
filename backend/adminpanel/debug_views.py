from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .emails import _send_email_thread
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from .views import IsAdminUser
import threading

class AdminTestEmailView(APIView):
    """
    Temporary endpoint for admins to test SMTP connectivity and see logs.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        test_recipient = request.data.get("email", "stayeasestaff@gmail.com")
        subject = "StayEase Deployment SMTP Test"
        plain_message = f"SMTP Test from {settings.EMAIL_HOST_USER}. If you see this, email is working!"
        html_message = f"<h1>StayEase SMTP Test</h1><p>Sent from {settings.EMAIL_HOST_USER}</p>"
        
        # We call the same thread logic to test exactly how staff emails are sent
        thread = threading.Thread(
            target=_send_email_thread,
            args=(subject, plain_message, settings.DEFAULT_FROM_EMAIL, [test_recipient], html_message)
        )
        thread.daemon = True
        thread.start()

        return Response({
            "message": f"Test email triggered to {test_recipient}. Check server logs for results.",
            "smtp_user": settings.EMAIL_HOST_USER,
            "smtp_host": settings.EMAIL_HOST
        }, status=status.HTTP_200_OK)
