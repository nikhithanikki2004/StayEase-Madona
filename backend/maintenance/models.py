from django.db import models
from django.conf import settings
from datetime import timedelta, date

class MaintenanceTask(models.Model):
    FREQUENCY_CHOICES = (
        ("Daily", "Daily"),
        ("Weekly", "Weekly"),
        ("Monthly", "Monthly"),
        ("One-time", "One-time"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    frequency = models.CharField(max_length=50, choices=FREQUENCY_CHOICES, default="One-time")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_maintenance")
    next_due_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.frequency})"

    def update_next_due_date(self):
        """Calculates the next due date based on frequency."""
        from dateutil.relativedelta import relativedelta
        
        if self.frequency == "Daily":
            self.next_due_date += timedelta(days=1)
        elif self.frequency == "Weekly":
            self.next_due_date += timedelta(weeks=1)
        elif self.frequency == "Monthly":
            # Use relativedelta for accurate month increment (handles month lengths correctly)
            self.next_due_date += relativedelta(months=1)
        
        # One-time tasks do not update automatically
        self.save()

class MaintenanceLog(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    )

    task = models.ForeignKey(MaintenanceTask, on_delete=models.CASCADE, related_name="logs")
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    completion_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    notes = models.TextField(blank=True, null=True)
    proof_image = models.ImageField(upload_to="maintenance_proofs/", blank=True, null=True)
    admin_comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.task.title} - {self.completion_date.strftime('%Y-%m-%d')}"
