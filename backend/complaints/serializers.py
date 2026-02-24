from rest_framework import serializers
from .models import Complaint, ComplaintLog, ComplaintRating


# 🔹 LOG SERIALIZER (DEFINE FIRST)
class ComplaintLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(
        source="performed_by.full_name",
        read_only=True
    )

    class Meta:
        model = ComplaintLog
        fields = [
             "id",
            "action",
            "performed_by_name",
            "notes",
            "proof",
            "created_at",
        ]


# 🔹 RATING SERIALIZER (DEFINE BEFORE COMPLAINT)
class ComplaintRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintRating
        fields = ["rating", "feedback", "created_at"]


# 🔹 COMPLAINT SERIALIZER
class ComplaintSerializer(serializers.ModelSerializer):
    logs = ComplaintLogSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True)
    resolved_by_name = serializers.CharField(source="resolved_by.full_name", read_only=True)
    rating = ComplaintRatingSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "hostel_id",
            "student_name",
            "department",
            "year",
            "complaint_category",
            "description",
            "image",
            "priority",
            "status",
            "resolution_notes",
            "resolution_proof",     # ✅ ADDED
            "assigned_to_name",
            "resolved_by_name",
            "rating",
            "logs",
            "created_at",
        ]

        read_only_fields = [
            "student_name",
            "department",
            "year",
            "status",
            "priority",
            "resolution_notes",
            "created_at",
        ]


# Serializer for staff view
class StaffComplaintSerializer(serializers.ModelSerializer):
    logs = ComplaintLogSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "hostel_id",
            "student_name",
            "department",
            "year",
            "complaint_category",
            "description",
            "image",
            "priority",
            "status",
            "resolution_notes",
            "resolution_proof",     # ✅ ADDED
            "logs",
            "created_at",
        ]

