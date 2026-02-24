import os
import django
from django.db.models import Avg

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from students.models import Student
from complaints.models import Complaint, ComplaintRating

def check_ratings():
    print("Checking Staff Ratings...")
    
    # improved search for Arun Nair
    staff_members = Student.objects.filter(full_name__icontains="Arun")
    
    if not staff_members.exists():
        print("No staff found with name 'Arun'")
        all_staff = Student.objects.filter(is_staff=True) # Assuming is_staff flag or similar checks permissions
        print(f"Total staff in system: {all_staff.count()}")
        for s in all_staff[:5]:
            print(f" - {s.full_name} ({s.email})")
            
    for staff in staff_members:
        print(f"\nChecking for: {staff.full_name} ({staff.email})")
        
        # Check resolved complaints
        resolved_complaints = Complaint.objects.filter(resolved_by=staff)
        print(f"  Resolved complaints: {resolved_complaints.count()}")
        
        # Check ratings linked to these complaints
        ratings = ComplaintRating.objects.filter(complaint__resolved_by=staff)
        print(f"  Ratings found: {ratings.count()}")
        
        if ratings.exists():
            avg = ratings.aggregate(Avg("rating"))["rating__avg"]
            print(f"  Average Rating: {avg}")
            for r in ratings:
                print(f"    - {r.rating}★: {r.feedback} (Complaint ID: {r.complaint.id})")
        else:
            print("  No ratings found for this staff member.")
            
            # Check if there are any ratings at all
            all_ratings = ComplaintRating.objects.all()
            print(f"  Total ratings in system: {all_ratings.count()}")
            if all_ratings.count() > 0:
                print("  Sample rating:")
                r = all_ratings.first()
                print(f"    - Complaint Resolved By: {r.complaint.resolved_by}")

    # Specific check for Complaint 36
    try:
        c36 = Complaint.objects.get(id=36)
        print("\n--- Complaint 36 Details ---")
        print(f"ID: {c36.id}")
        print(f"Resolved By: {c36.resolved_by} (ID: {c36.resolved_by.id if c36.resolved_by else 'None'})")
        print(f"Status: {c36.status}")
        if hasattr(c36, 'rating'):
            print(f"Rating: {c36.rating.rating}★")
            print(f"Feedback: {c36.rating.feedback}")
        else:
            print("No rating linked.")
    except Complaint.DoesNotExist:
        print("Complaint 36 not found.")

if __name__ == "__main__":
    check_ratings()
