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
        import socket
        
        # Security check
        is_admin = request.user.is_authenticated and getattr(request.user, 'role', '') == 'admin'
        if not is_admin and request.GET.get("secret") != "stayease_debug":
            return Response({"error": "Unauthorized"}, status=401)

        results = []
        
        # 1. DNS Check
        hosts = ["smtp.gmail.com", "smtp.googlemail.com", "google.com"]
        for host in hosts:
            try:
                ip = socket.gethostbyname(host)
                results.append(f"✅ DNS: {host} -> {ip}")
            except Exception as e:
                results.append(f"❌ DNS: {host} failed ({str(e)})")

        # 2. Port Scan (The real test)
        # Testing common SMTP ports to see what Render blocks
        test_targets = [
            ("smtp.gmail.com", 587),
            ("smtp.gmail.com", 465),
            ("smtp.gmail.com", 25),
            ("smtp.googlemail.com", 587),
            ("smtp.googlemail.com", 465),
        ]
        
        for host, port in test_targets:
            try:
                s = socket.create_connection((host, port), timeout=5)
                s.close()
                results.append(f"✅ Port {port} on {host}: OPEN")
            except Exception as e:
                results.append(f"❌ Port {port} on {host}: CLOSED ({str(e)})")

        # 3. Current Config Test
        try:
            from django.core.mail import get_connection
            conn = get_connection(timeout=10)
            conn.open()
            results.append("✅ Django SMTP Connection: Success")
            conn.close()
        except Exception as e:
            results.append(f"❌ Django SMTP Test: Failed ({str(e)})")

        return Response({
            "results": results,
            "current_settings": {
                "EMAIL_HOST": settings.EMAIL_HOST,
                "EMAIL_PORT": settings.EMAIL_PORT,
                "EMAIL_USE_SSL": getattr(settings, "EMAIL_USE_SSL", False),
                "EMAIL_USE_TLS": getattr(settings, "EMAIL_USE_TLS", False),
                "EMAIL_HOST_USER": settings.EMAIL_HOST_USER
            }
        })
