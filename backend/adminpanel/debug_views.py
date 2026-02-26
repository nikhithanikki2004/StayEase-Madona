from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail, get_connection
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from .views import IsAdminUser
import traceback
import os

class AdminTestEmailView(APIView):
    """
    Diagnostic endpoint for SMTP testing.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        recipient = request.data.get("email", "stayeasestaff@gmail.com")
        
        # 1. Basic configuration check
        config = {
            "host": settings.EMAIL_HOST,
            "port": settings.EMAIL_PORT,
            "user": settings.EMAIL_HOST_USER,
            "has_password": bool(settings.EMAIL_HOST_PASSWORD),
            "password_len": len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 0,
            "use_tls": settings.EMAIL_USE_TLS,
            "timeout": getattr(settings, 'EMAIL_TIMEOUT', 'Not set')
        }
        
        print(f"--- 🩺 Diagnostic Start for {recipient} ---")
        print(f"Config: {config}")

        try:
            # 2. Test Connection ONLY first (to avoid long hangs)
            print("Connecting to SMTP server...")
            connection = get_connection(
                host=settings.EMAIL_HOST,
                port=settings.EMAIL_PORT,
                username=settings.EMAIL_HOST_USER,
                password=settings.EMAIL_HOST_PASSWORD,
                use_tls=settings.EMAIL_USE_TLS,
                timeout=10 # Force a short timeout for the connection test
            )
            connection.open()
            print("✅ Connection opened successfully!")
            
            # 3. Try sending the mail
            print(f"Sending test mail to {recipient}...")
            send_mail(
                subject="StayEase Diagnostic: Success",
                message=f"If you see this, StayEase can send emails from Render! Host: {settings.EMAIL_HOST_USER}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                connection=connection,
                fail_silently=False
            )
            connection.close()
            print("✅ Mail sent and connection closed.")
            
            return Response({
                "status": "success",
                "message": f"Email delivered to {recipient}",
                "config": config
            })

        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            print(f"❌ Diagnostic Failed: {error_type} - {error_msg}")
            # NO traceback here to avoid bloating the 500 response if it still 500s
            
            return Response({
                "status": "error",
                "error_type": error_type,
                "error_message": error_msg,
                "config": config,
                "hint": "Ensure your Google App Password is exactly 16 characters with NO spaces."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
