from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings


# ----------------------------
# Custom User Manager
# ----------------------------
class StudentManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        # Admin doesn't need student fields
        extra_fields.setdefault("mobile_number", "")
        extra_fields.setdefault("full_name", "Admin")

        return self.create_user(email, password, **extra_fields)

# ----------------------------
# Custom User Model
# ----------------------------
class Student(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("staff", "Staff"),
        ("admin", "Admin"),
    )

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="student")

    # ✅ ADD THIS LINE
    is_available = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = StudentManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self):
        return f"{self.email} ({self.role})"

# ----------------------------
# StudentProfile for extra info
# Only students need this
# ----------------------------
class StudentProfile(models.Model):
    user = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    department = models.CharField(max_length=100, blank=True, null=True)
    year = models.CharField(max_length=20, blank=True, null=True)
    hostel_name = models.CharField(max_length=100, blank=True, null=True)
    block = models.CharField(max_length=50, blank=True, null=True)
    room_number = models.CharField(max_length=10, blank=True, null=True)
    profile_picture = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return self.user.email

class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ("Open", "Open"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
        ("Closed", "Closed"),
    ]

    CATEGORY_CHOICES = [
        ("Account", "Account Issue"),
        ("Hostel", "Hostel Related"),
        ("Complaint", "Complaint Follow-up"),
        ("Technical", "Technical Issue"),
        ("General", "General Query"),
        ("Other", "Other"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="support_tickets"
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="support/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Open")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} ({self.status})"


class SupportMessage(models.Model):
    ticket = models.ForeignKey(
        SupportTicket,
        related_name="messages",
        on_delete=models.CASCADE
    )
    sender = models.CharField(max_length=20)  # student / admin
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

