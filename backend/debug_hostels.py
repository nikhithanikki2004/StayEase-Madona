import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from complaints.models import Complaint
from students.models import StudentProfile

with open('hostel_debug_results.txt', 'w') as f:
    f.write("--- Hostel Profiles ---\n")
    profiles = StudentProfile.objects.all()
    for p in profiles:
        f.write(f"User: {p.user.email}, Hostel: '{p.hostel_name}'\n")

    f.write("\n--- Complaint Counts by Hostel Profile ---\n")
    hostel_names = StudentProfile.objects.values_list('hostel_name', flat=True).distinct()
    for h in hostel_names:
        if h:
            count = Complaint.objects.filter(student__profile__hostel_name=h).count()
            f.write(f"Hostel: '{h}', Complaints: {count}\n")
        else:
            count = Complaint.objects.filter(student__profile__hostel_name__isnull=True).count()
            f.write(f"No Hostel in Profile: {count}\n")

    f.write("\n--- Global Complaint Count ---\n")
    f.write(f"Total Complaints: {Complaint.objects.count()}\n")
