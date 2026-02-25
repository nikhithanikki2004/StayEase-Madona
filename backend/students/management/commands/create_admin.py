from django.core.management.base import BaseCommand
from students.models import Student

class Command(BaseCommand):
    help = 'Create or update the admin user with specific credentials'

    def handle(self, *args, **options):
        email = 'admin@gmail.com'
        password = 'Admin123#'
        
        user, created = Student.objects.get_or_create(
            email=email,
            defaults={
                'full_name': 'Admin User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        user.set_password(password)
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Successfully created admin user: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully updated admin user: {email}'))
