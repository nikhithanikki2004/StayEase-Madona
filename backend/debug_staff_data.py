import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from authentication.models import Student
from complaints.models import Complaint

def check_data():
    staff_users = Student.objects.filter(role="staff", is_active=True)
    print(f"Found {staff_users.count()} active staff users.")

    for staff in staff_users:
        print(f"\nScanning Staff: {staff.full_name} (ID: {staff.id})")
        complaints = Complaint.objects.filter(assigned_to=staff)
        total = complaints.count()
        resolved = complaints.filter(status__in=["Resolved", "Closed"]).count()
        
        print(f"  - Total Assigned: {total}")
        print(f"  - Resolved Count (Database): {resolved}")
        
        # Breakdown by status
        print(f"  - Status Breakdown:")
        for status, _ in Complaint.STATUS_CHOICES:
            count = complaints.filter(status=status).count()
            print(f"    - {status}: {count}")

        if resolved == 0 and total > 0:
            print("  ⚠️ WARNING: No resolved complaints found despite assignments.")

if __name__ == "__main__":
    check_data()
