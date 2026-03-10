from django.db import models

class EmailLog(models.Model):
    recipient = models.EmailField()
    subject = models.CharField(max_length=255)
    body = models.TextField()
    status = models.CharField(max_length=20, default="Sent")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To: {self.recipient} - {self.subject} ({self.status})"
