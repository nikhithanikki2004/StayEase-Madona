

from rest_framework import serializers
from complaints.models import Complaint, ComplaintLog, ComplaintRating


class StaffRatingSerializer(serializers.ModelSerializer):
    complaint_id = serializers.IntegerField(source='complaint.id', read_only=True)
    complaint_category = serializers.CharField(source='complaint.complaint_category', read_only=True)
    complaint_description = serializers.CharField(source='complaint.description', read_only=True)
    student_name = serializers.CharField(source='complaint.student_name', read_only=True)
    resolved_at = serializers.DateTimeField(source='complaint.resolved_at', read_only=True)

    class Meta:
        model = ComplaintRating
        fields = [
            'id',
            'complaint_id',
            'complaint_category',
            'complaint_description',
            'student_name',
            'rating',
            'feedback',
            'created_at',
            'resolved_at',
        ]





class StaffComplaintSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='complaint_category', read_only=True)
    title = serializers.CharField(source='complaint_category', read_only=True)
    room_number = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            "id",
            "title",                # ✅ ADDED for search
            "student_name",
            "department",
            "complaint_category",
            "category",             # ✅ ADDED for frontend display
            "description",
            "image",
            "priority",
            "status",
            "created_at",
            "resolution_notes",
            "resolution_proof",     # ✅ ADDED
            "room_number",          # ✅ ADDED for frontend display
            # Escalation fields
            "escalated",
            "escalation_note",
            "escalated_by",
            "escalated_at",
            "admin_reply",
            "admin_replied_by",
            "admin_reply_at",
            "chat_history",
        ]

    chat_history = serializers.SerializerMethodField()

    def get_room_number(self, obj):
        try:
            return obj.student.profile.room_number
        except Exception:
            return "N/A"

    def get_chat_history(self, obj):
        logs = ComplaintLog.objects.filter(
            complaint=obj,
            action__in=["Escalated to Admin", "Admin replied to escalation", "Escalated", "Admin Reply"]
        ).order_by("created_at")
        
        history = []
        for log in logs:
            if log.action == "Escalated to Admin" or log.action == "Escalated":
                 history.append({
                    "type": "staff",
                    "message": log.notes,
                    "sender": log.performed_by.full_name if log.performed_by else "Staff",
                    "timestamp": log.created_at
                })
            elif log.action == "Admin replied to escalation" or log.action == "Admin Reply":
                history.append({
                    "type": "admin",
                    "message": log.notes,
                    "sender": "Admin",
                    "timestamp": log.created_at
                })
        return history

class StaffResolutionHistorySerializer(serializers.ModelSerializer):
    resolved_at = serializers.DateTimeField(format="%d %b %Y, %I:%M %p")

    title = serializers.CharField(source='complaint_category', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "title",                # ✅ ADDED
            "student_name",
            "complaint_category",   # ✅ FIXED
            "description",
            "resolution_notes",
            "resolution_proof",     # ✅ ADDED
            "status",
            "created_at",           # ✅ ADDED for timeline
            "resolved_at",
        ]

class ComplaintLogSerializer(serializers.ModelSerializer):
    performed_by = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintLog
        fields = [
            "id",
            "action",
            "performed_by",
            "notes",
            "proof",
            "created_at",
        ]
    
    def get_performed_by(self, obj):
        return obj.performed_by.full_name if obj.performed_by else "System"