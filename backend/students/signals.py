from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Student, StudentProfile

@receiver(post_save, sender=Student)
def create_student_profile(sender, instance, created, **kwargs):
    if created and instance.role == "student":
        StudentProfile.objects.create(
            user=instance,
            department="",
            year="",
            hostel_name="",
            block="",
            room_number=""
        )
