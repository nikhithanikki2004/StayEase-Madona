from django.core.management.base import BaseCommand
from students.models import Student, StudentProfile

class Command(BaseCommand):
    help = 'Ensures all student users have a StudentProfile record'

    def handle(self, *args, **options):
        students = Student.objects.filter(role='student')
        count = 0
        for student in students:
            profile, created = StudentProfile.objects.get_or_create(
                user=student,
                defaults={
                    'department': '',
                    'year': '',
                    'hostel_name': '',
                    'block': '',
                    'room_number': ''
                }
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully checked profiles. Created {count} missing profiles.'))
