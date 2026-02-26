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
    Can be hit via POST (Admin only) or GET (with ?secret=...)
    """
    permission_classes = [] # Handled manually for easier browser access

    def get(self, request):
        return self.handle_diagnostic(request)

    def post(self, request):
        return self.handle_diagnostic(request)

    def handle_diagnostic(self, request):
        # Security check: Either authenticated admin OR secret param matches
        is_admin = request.user.is_authenticated and getattr(request.user, 'role', '') == 'admin'
        secret = request.GET.get("secret")
        # Using a simple predictable secret for the user to click
        if not is_admin and secret != "stayease_debug":
            return Response({"error": "Unauthorized. Use ?secret=stayease_debug if not logged in."}, status=status.HTTP_401_UNAUTHORIZED)

        recipient = request.data.get("email") or request.GET.get("email") or "stayeasestaff@gmail.com"
        
        # 1. Basic configuration check
        config = {
            "host": settings.EMAIL_HOST,
            "port": settings.EMAIL_PORT,
            "user": settings.EMAIL_HOST_USER,
            "has_password": bool(settings.EMAIL_HOST_PASSWORD),
            "password_len": len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 0,
            "use_tls": settings.EMAIL_USE_TLS,
        }
        
        results = []
        try:
            # 2. Test Connection ONLY first (to avoid long hangs)
            connection = get_connection(
                host=settings.EMAIL_HOST,
                port=settings.EMAIL_PORT,
                username=settings.EMAIL_HOST_USER,
                password=settings.EMAIL_HOST_PASSWORD,
                use_tls=settings.EMAIL_USE_TLS,
                timeout=15
            )
            connection.open()
            results.append("✅ SMTP Connection: Success")
            
            # 3. Try sending the mail
            send_mail(
                subject="StayEase SMTP Test",
                message=f"StayEase Diagnostic: Connected as {settings.EMAIL_HOST_USER}. If you see this in {recipient}, SMTP is 100% working.",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[recipient],
                connection=connection,
                fail_silently=False
            )
            connection.close()
            results.append(f"✅ Email Delivery: Success (Check {recipient})")
            
            return Response({
                "status": "Success",
                "results": results,
                "config": config
            })

        except Exception as e:
            error_msg = str(e)
            results.append(f"❌ Failed: {error_msg}")
            return Response({
                "status": "Failed",
                "results": results,
                "config": config,
                "tip": "If this is an 'Authentication Failed' error, double check your Render App Password and EMAIL_HOST_USER."
            }, status=status.HTTP_200_OK) # Return 200 so user can read the JSON in browser
