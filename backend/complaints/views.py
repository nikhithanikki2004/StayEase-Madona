from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Complaint, ComplaintLog, ComplaintRating
from .serializers import ComplaintSerializer, ComplaintRatingSerializer


class StudentComplaintView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # 🔥 REQUIRED

    # ✅ GET → View student complaints
    def get(self, request):
        complaints = Complaint.objects.filter(
            student=request.user
        ).order_by("-created_at")

        serializer = ComplaintSerializer(complaints, many=True, context={'request': request})
        return Response(serializer.data)

    # ✅ POST → Register complaint
    def post(self, request):
        serializer = ComplaintSerializer(data=request.data)

        if serializer.is_valid():
            complaint = serializer.save(
                student=request.user,
                hostel_id=request.data.get("hostel_id"),
                student_name=request.user.full_name,
                department=request.user.profile.department,
                year=request.user.profile.year,
            )

            # 📝 First log
            ComplaintLog.objects.create(
                complaint=complaint,
                action="Submitted",
                performed_by=request.user,
                notes="Complaint submitted successfully"
            )

            return Response(
                ComplaintSerializer(complaint).data,
                status=status.HTTP_201_CREATED
            )

        # 🔴 DEBUG (keep this!)
        print("❌ Complaint validation errors:", serializer.errors)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ComplaintRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, complaint_id):
        try:
            complaint = Complaint.objects.get(
                id=complaint_id,
                student=request.user,
                status="Resolved"
            )
        except Complaint.DoesNotExist:
            return Response(
                {"error": "Complaint not eligible for rating"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent double rating
        if hasattr(complaint, "rating"):
            return Response(
                {"error": "Rating already submitted"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ComplaintRatingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                complaint=complaint,
                student=request.user
            )

            # ✅ AUTO-CLOSE COMPLAINT
            complaint.status = "Closed"
            complaint.save()

            # 📝 LOG THE CLOSURE
            ComplaintLog.objects.create(
                complaint=complaint,
                action="Closed",
                performed_by=request.user,
                notes="Complaint closed automatically after student rating."
            )

            return Response(
                {"message": "Thank you for your feedback! Complaint closed."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
