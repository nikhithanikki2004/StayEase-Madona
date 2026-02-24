from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MaintenanceTaskViewSet, MaintenanceLogViewSet

router = DefaultRouter()
router.register(r'tasks', MaintenanceTaskViewSet, basename='maintenancetask')
router.register(r'logs', MaintenanceLogViewSet, basename='maintenancelog')

urlpatterns = [
    path('', include(router.urls)),
]
