from django.db import models
from django.conf import settings
from complaints.models import Complaint

class Broadcast(models.Model):
    # Using the same categories as complaints for easy filtering/blocking
    CATEGORY_CHOICES = Complaint.CATEGORY_CHOICES

    title = models.CharField(max_length=255)
    message = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    start_time = models.DateTimeField(auto_now_add=True)
    expected_resolution_time = models.CharField(max_length=100, blank=True, null=True) # e.g. "2 hours", "Today 5 PM"
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category}: {self.title}"
