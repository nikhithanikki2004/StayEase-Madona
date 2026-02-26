from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from .views import IsAdminUser
import traceback

class AdminTestEmailView(APIView):
    """
    Endpoint for admins to test SMTP connectivity.
    Runs synchronously to return errors directly in the response.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        test_recipient = request.data.get("email", "stayeasestaff@gmail.com")
        subject = "StayEase SMTP Diagnostic Test"
        plain_message = f"SMTP Test from {settings.EMAIL_HOST_USER}. If you see this, email is working!"
        
        print(f"--- 🛡️ Manual SMTP Diagnostic for {test_recipient} ---")
        
        try:
            # RUN SYNCHRONOUSLY to catch errors
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[test_recipient],
                fail_silently=False
            )
            return Response({
                "status": "success",
                "message": f"Email sent successfully to {test_recipient}!",
                "details": {
                    "smtp_user": settings.EMAIL_HOST_USER,
                    "from_email": settings.DEFAULT_FROM_EMAIL
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            error_msg = str(e)
            stack_trace = traceback.format_exc()
            print(f"❌ Diagnostic Failure: {error_msg}")
            
            return Response({
                "status": "error",
                "error_type": type(e).__name__,
                "error_message": error_msg,
                "hint": "Check if your App Password is correct and 2FA is enabled.",
                "smtp_config": {
                    "user": settings.EMAIL_HOST_USER,
                    "host": settings.EMAIL_HOST,
                    "port": settings.EMAIL_PORT,
                    "use_tls": settings.EMAIL_USE_TLS
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
