from urllib import request
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny 
from django.contrib.auth import authenticate
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str  # Django 6 uses force_str
from django.contrib.auth.tokens import default_token_generator

from students.models import Student, StudentProfile, SupportMessage, SupportTicket
from students.permissions import IsAdminUser
from .serializers import StudentProfileSerializer, StudentSerializer, StudentDashboardSerializer, SupportTicketSerializer
from .serializers import AdminSupportTicketSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
import base64



# ------------------------
# STUDENT SIGNUP
# ------------------------
class StudentSignupView(APIView):
    def post(self, request):
        print("REQUEST DATA 👉", request.data)   # 👈 ADD THIS

        serializer = StudentSerializer(data=request.data)

        if not serializer.is_valid():
            print("SERIALIZER ERRORS 👉", serializer.errors)  # 👈 ADD THIS
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(
            {"message": "Student registered successfully"},
            status=status.HTTP_201_CREATED
        )




# ------------------------
# CHECK EMAIL (LIVE VALIDATION)
# ------------------------
class CheckEmailView(APIView):
    def post(self, request):
        email = request.data.get("email", "").strip()
        exists = Student.objects.filter(email=email).exists()
        return Response({"exists": exists})
    

# ------------------------
# PING VIEW (WARM-UP)
# ------------------------
class PingView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
     StudentProfile.objects.get_or_create(user=request.user)
     serializer = StudentDashboardSerializer(request.user)
     return Response(serializer.data)

# ------------------------
# ROLE-BASED LOGIN WITH JWT
# ------------------------
class UserLoginView(APIView):
    def post(self, request):
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "").strip()

        # Check if user exists
        try:
            user = Student.objects.get(email=email)
        except Student.DoesNotExist:
            return Response(
                {"error": "Email not registered"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user
        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response(
                {"error": "Incorrect password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Role-based message
        role_message = {
            "student": "Student login successful",
            "staff": "Staff login successful",
            "admin": "Admin login successful"
        }.get(user.role, "Login successful")

        return Response(
            {
                "message": role_message,
                "access": access_token,
                "refresh": refresh_token,
                "role": user.role,
            },
            status=status.HTTP_200_OK
        )
    

# ------------------------
# GET STUDENT PROFILE
# ------------------------
class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)

        return Response({
            "full_name": request.user.full_name,
            "email": request.user.email,
            "department": profile.department,
            "year": profile.year,
            "hostel_name": profile.hostel_name,
            "block": profile.block,
            "room_number": profile.room_number,
            "profile_picture": profile.profile_picture or None,
        })


class StudentProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)

        # Handle fields
        for field in ["department", "year", "hostel_name", "block", "room_number"]:
            if field in request.data:
                setattr(profile, field, request.data[field])

        # Convert uploaded image to base64 and store as text
        pic_file = request.FILES.get("profile_picture")
        if pic_file:
            raw = pic_file.read()
            mime = pic_file.content_type or "image/jpeg"
            b64 = base64.b64encode(raw).decode("utf-8")
            profile.profile_picture = f"data:{mime};base64,{b64}"

        profile.save()
        return Response(
            {"message": "Profile updated successfully"},
            status=status.HTTP_200_OK
        )

class StudentProfilePictureUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        profile = request.user.profile

        serializer = StudentProfilePictureSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Profile picture updated successfully",
                    "profile_picture": serializer.data["profile_picture"],
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# 🔹 LIST STUDENT TICKETS
class StudentSupportList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = SupportTicket.objects.filter(
            student=request.user
        ).order_by("-created_at")

        serializer = SupportTicketSerializer(tickets, many=True)
        return Response(serializer.data)


# 🔹 CREATE SUPPORT TICKET
class StudentCreateSupport(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SupportTicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# 🔹 REPLY TO TICKET
class StudentSupportReply(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ticket_id):
        SupportMessage.objects.create(
            ticket_id=ticket_id,
            sender="student",
            message=request.data.get("message"),
        )
        return Response({"success": True})
    
class AdminSupportListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        tickets = SupportTicket.objects.all().order_by("-created_at")
        serializer = AdminSupportTicketSerializer(tickets, many=True)
        return Response(serializer.data)
    
class AdminSupportDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, ticket_id):
        ticket = get_object_or_404(SupportTicket, id=ticket_id)
        serializer = AdminSupportTicketSerializer(ticket)
        return Response(serializer.data)
    
class AdminSupportReplyView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, ticket_id):
        ticket = get_object_or_404(SupportTicket, id=ticket_id)
        message = request.data.get("message")

        if not message:
            return Response(
                {"error": "Message is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        SupportMessage.objects.create(
            ticket=ticket,
            sender="admin",
            message=message
        )

        if ticket.status == "Open":
            ticket.status = "In Progress"
            ticket.save()

        return Response({"message": "Reply sent"})

class AdminSupportStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, ticket_id):
        ticket = get_object_or_404(SupportTicket, id=ticket_id)
        new_status = request.data.get("status")

        if new_status not in ["Open", "In Progress", "Resolved"]:
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = new_status
        ticket.save()

        return Response({"message": "Status updated"})


class PasswordResetConfirmView(APIView):
    """Accepts uid, token and a new password to reset the user's password.
    Expected payload: { "uid": "<uidb64>", "token": "<token>", "password": "newpass" }
    """
    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("password")

        if not (uidb64 and token and new_password):
            return Response({"error": "uid, token and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = Student.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Student.DoesNotExist):
            return Response({"error": "Invalid uid"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)


