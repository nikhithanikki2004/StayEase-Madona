import os
import django
import json
from rest_framework.test import APIRequestFactory
from rest_framework.serializers import Serializer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from maintenance.models import MaintenanceTask, MaintenanceLog
from maintenance.views import MaintenanceTaskViewSet, MaintenanceLogViewSet
from django.contrib.auth import get_user_model

User = get_user_model()
admin = User.objects.filter(role='admin').first()

if not admin:
    print("Admin user not found")
    exit()

factory = APIRequestFactory()

# Test Tasks API
request = factory.get('/api/maintenance/tasks/')
request.user = admin
view = MaintenanceTaskViewSet.as_view({'get': 'list'})
response = view(request)
print("--- TASK API RESPONSE ---")
print(json.dumps(response.data, indent=2))

# Test Logs API
request = factory.get('/api/maintenance/logs/')
request.user = admin
view = MaintenanceLogViewSet.as_view({'get': 'list'})
response = view(request)
print("\n--- LOG API RESPONSE ---")
print(json.dumps(response.data, indent=2))
