import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from students.models import StudentProfile

print("Starting hostel quote fix...")
# Replace smart quote ’ with straight quote '
profiles = StudentProfile.objects.filter(hostel_name__contains="’")
count = profiles.count()
for p in profiles:
    old_name = p.hostel_name
    p.hostel_name = old_name.replace("’", "'")
    p.save()
    print(f"Updated: '{old_name}' -> '{p.hostel_name}'")

print(f"Finished. Updated {count} profiles.")
