
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from complaints.models import ComplaintLog

actions = ComplaintLog.objects.values_list('action', flat=True).distinct()
print("Unique Actions in Database:")
for action in actions:
    print(f"- '{action}'")
