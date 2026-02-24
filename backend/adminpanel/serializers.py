from rest_framework import serializers
from complaints.models import Complaint
from students.models import Student
from complaints.serializers import ComplaintRatingSerializer


class AssignedStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "full_name", "email"]

class ResolvedStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "full_name", "email"]


class AdminComplaintSerializer(serializers.ModelSerializer):
    assigned_to = AssignedStaffSerializer(read_only=True)
    resolved_by = ResolvedStaffSerializer(read_only=True)
    rating = ComplaintRatingSerializer(read_only=True)
    awaiting_feedback = serializers.SerializerMethodField()
    # Escalation fields
    escalated_by = AssignedStaffSerializer(read_only=True)
    admin_replied_by = AssignedStaffSerializer(read_only=True)

    def get_awaiting_feedback(self, obj):
        return obj.status == "Resolved" and not hasattr(obj, "rating")





    class Meta:
        model = Complaint
        fields = [
            "id",
            "student_name",
            "complaint_category",
            "description",
            "priority",
            "status",
            "assigned_to",
            "priority_locked",
            "resolved_by",
            "created_at",
            "rating",
            "resolution_notes",
            "awaiting_feedback",
            # Escalation / Admin reply
            "escalated",
            "escalation_note",
            "escalated_by",
            "escalated_at",
            "admin_reply",
            "admin_replied_by",
            "admin_reply_at",
            "hostel_id",
        ]


class AdminCreateStaffSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Student
        fields = ["full_name", "email", "password", "mobile_number"]

    def create(self, validated_data):
        return Student.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            mobile_number=validated_data.get("mobile_number"),
            role="staff",
            is_staff=True,
            is_available=True
        )
    
class StaffPerformanceSerializer(serializers.Serializer):
    staff_id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()

    total_assigned = serializers.IntegerField()
    resolved = serializers.IntegerField()
    active = serializers.IntegerField()

    avg_resolution_time = serializers.FloatField()
    avg_rating = serializers.FloatField(allow_null=True)

    performance_score = serializers.FloatField()


