import os
import django
import sys
from django.db.models import Avg, F, ExpressionWrapper, DurationField

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from authentication.models import Student
from complaints.models import Complaint, ComplaintRating

def verify_performance():
    print("\n=== DEEP DATA VERIFICATION ===\n")
    
    staff_users = Student.objects.filter(role="staff", is_active=True)
    if not staff_users.exists():
        print("❌ CRITICAL: No active staff found.")
        return

    print(f"Checking {staff_users.count()} active staff members...\n")

    for staff in staff_users:
        print(f"👤 Staff: {staff.full_name} (ID: {staff.id})")
        
        # 1. Check Assignments
        assigned = Complaint.objects.filter(assigned_to=staff)
        print(f"   - Total Assigned: {assigned.count()}")
        
        # 2. Check Resolved Count (Status Based)
        resolved_qs = assigned.filter(status__in=["Resolved", "Closed"])
        resolved_count = resolved_qs.count()
        print(f"   - Resolved (Status='Resolved'/'Closed'): {resolved_count}")
        
        # 3. Check Resolved Timestamp (Crucial for Resolution Time)
        with_timestamp = resolved_qs.filter(resolved_at__isnull=False).count()
        print(f"   - With 'resolved_at' timestamp: {with_timestamp}")
        
        # 4. Check Ratings
        ratings_count = ComplaintRating.objects.filter(complaint__assigned_to=staff).count()
        print(f"   - Ratings found: {ratings_count}")

        # 5. Simulate View Logic Calculation
        if resolved_qs.exists():
             avg_time = resolved_qs.filter(resolved_at__isnull=False).aggregate(
                avg_time=Avg(
                    ExpressionWrapper(
                        F("resolved_at") - F("created_at"),
                        output_field=DurationField()
                    )
                )
            )["avg_time"]
             readable_time = round(avg_time.total_seconds() / 3600, 2) if avg_time else "None"
             print(f"   - Calculated Avg Resolution Time: {readable_time} hours")
        else:
            print("   - Calculated Avg Resolution Time: N/A (No resolved)")

        print("-" * 40)

if __name__ == "__main__":
    verify_performance()
