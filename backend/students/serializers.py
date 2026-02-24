from rest_framework import serializers
from .models import Student, StudentProfile, SupportTicket,SupportMessage
from complaints.models import Complaint
from django.utils.timezone import localtime


# =========================
# STUDENT PROFILE
# =========================
class StudentProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = StudentProfile
        fields = [
            "department",
            "year",
            "hostel_name",
            "block",
            "room_number",
            "profile_picture",
        ]


class StudentProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["profile_picture"]


# =========================
# STUDENT SIGNUP SERIALIZER
# =========================
class StudentSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    department = serializers.CharField(write_only=True, required=False, allow_blank=True)
    year = serializers.CharField(write_only=True, required=False, allow_blank=True)
    hostel_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    block = serializers.CharField(write_only=True, required=False, allow_blank=True)
    room_number = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Student
        fields = [
            "email",
            "full_name",
            "mobile_number",
            "password",
            "department",
            "year",
            "hostel_name",
            "block",
            "room_number",
        ]

    def create(self, validated_data):
        print(f"DEBUG: StudentSerializer.create validated_data keys: {list(validated_data.keys())}")
        password = validated_data.pop("password")
        
        # Extract profile data
        profile_data = {
            "department": validated_data.pop("department", ""),
            "year": validated_data.pop("year", ""),
            "hostel_name": validated_data.pop("hostel_name", ""),
            "block": validated_data.pop("block", ""),
            "room_number": validated_data.pop("room_number", ""),
        }
        print(f"DEBUG: Extracted profile_data: {profile_data}")

        student = Student.objects.create(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            mobile_number=validated_data.get("mobile_number"),
            role="student",
        )
        student.set_password(password)
        student.save()

        # ✅ Use update_or_create to be absolutely sure we don't hit race conditions with signals
        # and to ensure data is correctly persisted.
        StudentProfile.objects.update_or_create(
            user=student,
            defaults=profile_data
        )
        print(f"DEBUG: Profile updated for student {student.email}")

        return student


# =========================
# STUDENT DASHBOARD SERIALIZER ✅
# =========================
class StudentDashboardSerializer(serializers.ModelSerializer):
    profile = StudentProfileSerializer(read_only=True)
    profile_picture = serializers.SerializerMethodField()
    latest_update = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "email",
            "full_name",
            "mobile_number",
            "profile",
            "profile_picture",
            "latest_update",
        ]

    def get_profile_picture(self, obj):
        if hasattr(obj, "profile") and obj.profile.profile_picture:
            return obj.profile.profile_picture.url
        return None

    def get_latest_update(self, obj):
        latest_complaint = (
            Complaint.objects
            .filter(student=obj)
            .order_by("-created_at")
            .first()
        )

        if not latest_complaint:
            return None

        return {
            "status": latest_complaint.status,
            "updated_at": localtime(latest_complaint.created_at),
        }


class SupportMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportMessage
        fields = ["id", "sender", "message", "created_at"]


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "category",
            "subject",
            "description",
            "image",
            "status",
            "created_at",
            "messages",
        ]

class AdminSupportTicketSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True
    )
    messages = SupportMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "student_name",
            "category",
            "subject",
            "description",
            "status",
            "created_at",
            "messages",
        ]