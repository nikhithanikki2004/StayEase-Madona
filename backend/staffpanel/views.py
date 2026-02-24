from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q
from django.shortcuts import get_object_or_404

from complaints.models import Complaint, ComplaintLog, ComplaintRating
from .permissions import IsStaffUser
from .serializers import ComplaintLogSerializer, StaffComplaintSerializer, StaffRatingSerializer
from django.utils.timezone import now
from .serializers import StaffResolutionHistorySerializer
from django.db.models import Avg




# ===============================
# STAFF DASHBOARD
# ===============================
class StaffDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def get(self, request):
        user = request.user

        # Distinct count of all complaints where staff was either assigned or resolver
        total_assigned = Complaint.objects.filter(
            Q(assigned_to=user) | Q(resolved_by=user)
        ).distinct().count()

        # "Submitted" counts as In Progress for staff visibility
        in_progress = Complaint.objects.filter(
            assigned_to=user,
            status__in=["Submitted", "In Progress"]
        ).count()

        # Include "Closed" complaints in resolved stats
        resolved = Complaint.objects.filter(
            resolved_by=user,
            status__in=["Resolved", "Closed"]
        ).count()

        return Response({
            "welcome_message": f"Welcome {user.full_name}",
            "total_assigned": total_assigned,
            "in_progress": in_progress,
            "resolved": resolved,
        })


# ===============================
# ASSIGNED COMPLAINTS (ACTIVE)
# ===============================
class StaffComplaintListView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def get(self, request):
        complaints = Complaint.objects.filter(
            assigned_to=request.user,
            status__in=["Submitted", "In Progress"]
        ).order_by("-created_at")

        serializer = StaffComplaintSerializer(complaints, many=True, context={'request': request})
        return Response(serializer.data)


# ===============================
# UPDATE COMPLAINT STATUS
# ===============================
class StaffUpdateComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def patch(self, request, complaint_id):
        complaint = get_object_or_404(
            Complaint,
            id=complaint_id,
            assigned_to=request.user
        )

        new_status = request.data.get("status")
        notes = request.data.get("resolution_notes")

        allowed_transitions = {
            "Submitted": ["In Progress"],
            "In Progress": ["Resolved"],
        }

        if new_status not in allowed_transitions.get(complaint.status, []):
            return Response(
                {"error": "Invalid status transition"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ---------------------------
        # IN PROGRESS
        # ---------------------------
        if new_status == "In Progress":
            complaint.status = "In Progress"

            ComplaintLog.objects.create(
                complaint=complaint,
                action="Marked In Progress",
                performed_by=request.user
            )

        # ---------------------------
        # RESOLVED
        # ---------------------------
        if new_status == "Resolved":
            if not notes:
                return Response(
                    {"error": "Resolution notes required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            complaint.status = "Resolved"
            complaint.resolution_notes = notes
            complaint.resolved_by = request.user   # ✅ IMPORTANT
            complaint.resolved_at = now()
            # complaint.assigned_to = None           # ❌ REMOVED: Keep assignment history
            
            # ✅ Save resolution proof to Complaint model
            proof_file = request.FILES.get("proof")
            if proof_file:
                complaint.resolution_proof = proof_file

            ComplaintLog.objects.create(
                complaint=complaint,
                action="Complaint Resolved",
                performed_by=request.user,
                notes=notes,
                proof=proof_file  # ✅ Also save to log for history
            )

        complaint.save()

        return Response({
            "message": "Complaint updated successfully",
            "status": complaint.status
        })


# ===============================
# ESCALATE TO ADMIN (STAFF)
# ===============================
class StaffEscalateComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def post(self, request, complaint_id):
        complaint = get_object_or_404(
            Complaint,
            id=complaint_id,
            assigned_to=request.user
        )

        note = request.data.get("note") or request.data.get("escalation_note")
        if not note:
            return Response({"error": "Escalation note is required"}, status=status.HTTP_400_BAD_REQUEST)

        complaint.escalated = True
        complaint.escalation_note = note
        complaint.escalated_by = request.user
        complaint.escalated_at = now()
        complaint.save()

        ComplaintLog.objects.create(
            complaint=complaint,
            action="Escalated to Admin",
            performed_by=request.user,
            notes=note
        )

        serializer = StaffComplaintSerializer(complaint, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


 
# RESOLUTION HISTORY (STAFF)
# ===============================
class StaffResolutionHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def get(self, request):
        complaints = Complaint.objects.filter(
            resolved_by=request.user,
            status__in=["Resolved", "Closed"],
            cleared_by_staff=False
        ).order_by("-resolved_at")

        serializer = StaffResolutionHistorySerializer(complaints, many=True)
        return Response(serializer.data)

class StaffClearResolvedComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def patch(self, request, complaint_id):
        complaint = get_object_or_404(
            Complaint,
            id=complaint_id,
            resolved_by=request.user,
            status__in=["Resolved", "Closed"]
        )

        complaint.cleared_by_staff = True
        complaint.save()

        return Response(
            {"message": "Complaint cleared from history"}
        )
    
class StaffBulkResolveView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def post(self, request):
        ids = request.data.get("ids", [])
        notes = request.data.get("resolution_notes")

        if not ids or not notes:
            return Response(
                {"error": "ids and resolution_notes are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Bulk update
        complaints = Complaint.objects.filter(
            id__in=ids,
            assigned_to=request.user,
            status="In Progress"
        )

        count = complaints.count()
        if count == 0:
            return Response(
                {"error": "No valid assigned complaints found to resolve"},
                status=status.HTTP_400_BAD_REQUEST
            )

        complaints.update(
            status="Resolved",
            resolution_notes=notes,
            resolved_by=request.user,
            resolved_at=now(),
            # assigned_to=None                     # ❌ REMOVED: Keep assignment history
        )

        # Create logs for each
        for cid in ids:
            ComplaintLog.objects.create(
                complaint_id=cid,
                action="Complaint Resolved (Bulk)",
                performed_by=request.user,
                notes=notes
            )

        return Response({"message": f"{count} complaints resolved successfully"})


class StaffEscalatedComplaintListView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def get(self, request):
        complaints = Complaint.objects.filter(
            escalated=True
        ).order_by("-escalated_at")

        serializer = StaffComplaintSerializer(complaints, many=True, context={'request': request})
        return Response(serializer.data)


class StaffComplaintTimelineView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def get(self, request, complaint_id):
        complaint = get_object_or_404(
            Complaint,
            id=complaint_id
        )

        logs = ComplaintLog.objects.filter(
            complaint=complaint
        ).order_by("created_at")

        serializer = ComplaintLogSerializer(logs, many=True)
        return Response(serializer.data)


# ===============================
# ESCALATION CHAT (STAFF REPLY)
# ===============================
class StaffEscalationReplyView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def post(self, request, complaint_id):
        complaint = get_object_or_404(
            Complaint,
            id=complaint_id
        )

        message = request.data.get("message")
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure complaint is actually escalated
        if not complaint.escalated:
            return Response({"error": "Complaint is not escalated"}, status=status.HTTP_400_BAD_REQUEST)

        ComplaintLog.objects.create(
            complaint=complaint,
            action="Escalated",
            performed_by=request.user,
            notes=message
        )

        serializer = StaffComplaintSerializer(complaint, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# ===============================
# STAFF RATINGS DASHBOARD
# ===============================
class StaffRatingsView(APIView):
    permission_classes = [IsAuthenticated, IsStaffUser]

    def get(self, request):
        # fetch ratings for complaints resolved by the logged-in staff
        ratings = ComplaintRating.objects.filter(
            complaint__resolved_by=request.user
        ).order_by("-created_at")

        total_ratings = ratings.count()
        average_rating = ratings.aggregate(Avg("rating"))["rating__avg"] or 0

        serializer = StaffRatingSerializer(ratings, many=True)

        return Response({
            "average_rating": round(average_rating, 1),
            "total_ratings": total_ratings,
            "ratings": serializer.data
        })
