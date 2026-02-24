from django.core.management.base import BaseCommand
from django.db.models import Avg, F, ExpressionWrapper, DurationField
from authentication.models import Student
from complaints.models import Complaint, ComplaintRating

class Command(BaseCommand):
    help = 'Verify staff performance data'

    def handle(self, *args, **kwargs):
        self.stdout.write("\n=== DEEP DATA VERIFICATION ===\n")
        
        staff_users = Student.objects.filter(role="staff", is_active=True)
        self.stdout.write(f"Checking {staff_users.count()} active staff members...\n")

        for staff in staff_users:
            self.stdout.write(f"👤 Staff: {staff.full_name} (ID: {staff.id})")
            
            # Check Assignments
            assigned = Complaint.objects.filter(assigned_to=staff)
            res_qs = assigned.filter(status__in=["Resolved", "Closed"])
            
            # Check Ratings
            ratings_count = ComplaintRating.objects.filter(complaint__assigned_to=staff).count()

            self.stdout.write(f"   - Total Assigned: {assigned.count()}")
            self.stdout.write(f"   - Resolved (Status match): {res_qs.count()}")
            self.stdout.write(f"   - Ratings found: {ratings_count}")

            if res_qs.exists():
                avg_time = res_qs.filter(resolved_at__isnull=False).aggregate(
                    avg_time=Avg(
                        ExpressionWrapper(
                            F("resolved_at") - F("created_at"),
                            output_field=DurationField()
                        )
                    )
                )["avg_time"]
                readable_time = round(avg_time.total_seconds() / 3600, 2) if avg_time else "None"
                self.stdout.write(f"   - Avg Time: {readable_time} hours")
            else:
                self.stdout.write("   - Avg Time: N/A")
            self.stdout.write("-" * 20)
