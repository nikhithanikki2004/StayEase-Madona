import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

# Imports MUST happen after django.setup()
from rest_framework.test import APIRequestFactory
from maintenance.models import MaintenanceTask, MaintenanceLog
from maintenance.views import MaintenanceTaskViewSet, MaintenanceLogViewSet
from django.contrib.auth import get_user_model

User = get_user_model()
admin = User.objects.filter(role='admin').first()
staff = User.objects.filter(role='staff').first()

factory = APIRequestFactory()

def test_api(user, label):
    print(f"\n--- {label} (Role: {user.role}) ---")
    
    # Tasks
    req = factory.get('/api/maintenance/tasks/')
    req.user = user
    view = MaintenanceTaskViewSet.as_view({'get': 'list'})
    res = view(req)
    # Check if res.data is a list or dict
    if isinstance(res.data, list):
        print(f"Tasks Count: {len(res.data)}")
        for t in res.data:
            print(f"  ID: {t['id']} | Title: {t['title']} | Active: {t['is_active']}")
    else:
        results = res.data.get('results', [])
        print(f"Tasks Count (paginated): {len(results)}")
        for t in results:
            print(f"  ID: {t['id']} | Title: {t['title']} | Active: {t['is_active']}")
    
    # Logs
    req = factory.get('/api/maintenance/logs/')
    req.user = user
    view = MaintenanceLogViewSet.as_view({'get': 'list'})
    res = view(req)
    if isinstance(res.data, list):
        print(f"Logs Count: {len(res.data)}")
    else:
        print(f"Logs Count (paginated): {len(res.data.get('results', []))}")

if admin: test_api(admin, "ADMIN")
if staff: test_api(staff, "STAFF")
