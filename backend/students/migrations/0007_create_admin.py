from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin_user(apps, schema_editor):
    Student = apps.get_model('students', 'Student')
    email = 'admin@gmail.com'
    password = 'Admin123#'
    
    user, created = Student.objects.get_or_create(
        email=email,
        defaults={
            'full_name': 'Admin User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'password': make_password(password)
        }
    )
    
    if not created:
        user.set_password(password)
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        user.save()

def reverse_admin_user(apps, schema_editor):
    Student = apps.get_model('students', 'Student')
    Student.objects.filter(email='admin@gmail.com').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('students', '0006_supportticket_supportmessage'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, reverse_code=reverse_admin_user),
    ]
