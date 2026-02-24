from django.db import models
from students.models import Student


class Complaint(models.Model):

    # 🔹 Status choices (STAFF controls this)
    STATUS_CHOICES = (
        ("Submitted", "Submitted"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
        ("Closed", "Closed"),
    )

    # 🔹 Priority choices (ADMIN controls this)
    PRIORITY_CHOICES = (
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
    )

    # 🔹 Complaint categories
    CATEGORY_CHOICES = (
        ("Electricity", "Electricity"),
        ("Plumbing", "Plumbing"),
        ("Furniture", "Furniture"),
        ("Cleaning", "Cleaning"),
        ("Water", "Water"),
        ("Internet", "Internet"),
        ("Food", "Food / Mess"),
        ("Security", "Security"),
        ("Noise", "Noise / Discipline"),
        ("Staff", "Staff / Management"),
        ("Medical", "Medical"),
        ("Other", "Other"),
    )

    # 🔹 Relations
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="complaints"
    )

    assigned_to = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_complaints"
    )

    resolved_by = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_complaints"
    )
    
    # Escalation fields (for staff to escalate to admin)
    escalated = models.BooleanField(default=False)
    escalation_note = models.TextField(blank=True, null=True)
    escalated_by = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="escalated_complaints"
    )
    escalated_at = models.DateTimeField(null=True, blank=True)
    
    # Admin reply fields
    admin_reply = models.TextField(blank=True, null=True)
    admin_replied_by = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_replies"
    )
    admin_reply_at = models.DateTimeField(null=True, blank=True)
    
    # 🔹 Snapshot of student info (at time of complaint)
    hostel_id = models.CharField(max_length=50)
    student_name = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    year = models.CharField(max_length=20)
    cleared_by_staff = models.BooleanField(default=False)
    cleared_by_admin = models.BooleanField(default=False)

    # 🔹 Complaint details
    complaint_category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    description = models.TextField()

    image = models.ImageField(
        upload_to="complaints/",
        blank=True,
        null=True
    )

    # 🔹 Workflow fields
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Submitted"
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="Low"
    )
    priority_locked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(
    null=True,
    blank=True
)

    resolution_notes = models.TextField(
        blank=True,
        null=True
    )

    resolution_proof = models.ImageField(
        upload_to="resolutions/",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.student_name} - {self.complaint_category}"

class ComplaintLog(models.Model):
    complaint = models.ForeignKey(
        "Complaint",
        on_delete=models.CASCADE,
        related_name="logs"
    )
    action = models.CharField(max_length=50)
    performed_by = models.ForeignKey(
        Student,
        on_delete=models.SET_NULL,
        null=True
    )
    notes = models.TextField(blank=True, null=True)
    proof = models.FileField(
        upload_to="complaint_proofs/",
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} - {self.complaint.id}"
    
class ComplaintRating(models.Model):
    complaint = models.OneToOneField(
        Complaint,
        on_delete=models.CASCADE,
        related_name="rating"
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE
    )
    rating = models.IntegerField()  # 1 to 5
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating}★ - Complaint {self.complaint.id}"


