import os
import django
import sys
import random
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from authentication.models import Student
from complaints.models import Complaint, ComplaintRating

def fix_data():
    print("--- FIXING PERFORMANCE DATA ---")
    
    # 1. Get Active Staff
    staff_users = list(Student.objects.filter(role="staff", is_active=True))
    if not staff_users:
        print("❌ No active staff found!")
        return
    print(f"✅ Found {len(staff_users)} active staff members.")

    # 2. Get Resolved/Closed Complaints
    resolved_complaints = Complaint.objects.filter(status__in=["Resolved", "Closed"])
    print(f"✅ Found {resolved_complaints.count()} resolved/closed complaints.")

    # 3. Process Complaints
    for complaint in resolved_complaints:
        # A. Assign to Staff if missing or invalid
        if not complaint.assigned_to or complaint.assigned_to.role != 'staff':
            new_staff = random.choice(staff_users)
            complaint.assigned_to = new_staff
            print(f"  - Reassigned Complaint {complaint.id} to {new_staff.full_name}")

        # B. Set resolved_at if missing
        if not complaint.resolved_at:
            # Set resolved_at to created_at + random hours (1-48)
            random_duration = timedelta(hours=random.randint(1, 48))
            complaint.resolved_at = complaint.created_at + random_duration
            print(f"  - Set resolved_at for {complaint.id}")
        
        complaint.save()

        # C. Create/Update Rating
        if not hasattr(complaint, 'rating'):
            ComplaintRating.objects.create(
                complaint=complaint,
                student=complaint.student,
                rating=random.randint(3, 5),
                feedback="Automated feedback for testing."
            )
            print(f"  - Created Rating for {complaint.id}")

    print("\n--- VERIFICATION ---")
    for staff in staff_users:
        count = Complaint.objects.filter(assigned_to=staff, status__in=["Resolved", "Closed"]).count()
        print(f"Staff {staff.full_name}: {count} Resolved Complaints")

if __name__ == "__main__":
    fix_data()
