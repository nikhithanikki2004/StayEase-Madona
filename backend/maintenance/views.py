from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import MaintenanceTask, MaintenanceLog
from .serializers import MaintenanceTaskSerializer, MaintenanceLogSerializer
from django.utils import timezone
from django.db import models

class MaintenanceTaskViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = MaintenanceTask.objects.all().order_by('next_due_date')
        
        if user.role == 'staff':
            # Staff only sees active tasks assigned to them or unassigned
            # AND tasks that don't have a pending completion log
            return queryset.filter(
                models.Q(assigned_to=user) | models.Q(assigned_to__isnull=True),
                is_active=True
            ).exclude(logs__status='Pending').distinct()
            
        return queryset

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        
        # We manually create the log to assign the user easily
        log = MaintenanceLog.objects.create(
            task=task,
            completed_by=request.user,
            notes=request.data.get('notes', ''),
            completion_date=timezone.now(),
            status='Pending'
        )
        
        # Note: We NO LONGER update the next_due_date here. 
        # It happens after Admin APPROVAL.

        return Response({
            "status": "Task Completion Submitted for Approval", 
            "log_id": log.id
        }, status=status.HTTP_201_CREATED)

class MaintenanceLogViewSet(viewsets.ModelViewSet):
    """
    Manage history and approvals.
    """
    serializer_class = MaintenanceLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Fresh queryset every time
        queryset = MaintenanceLog.objects.all().order_by('-completion_date')
        task_id = self.request.query_params.get('task_id')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        log = self.get_object()
        if log.status == 'Approved':
            return Response({"status": "Already approved"})
            
        log.status = 'Approved'
        log.save()
        
        # Reschedule the task
        task = log.task
        task.update_next_due_date()
        
        return Response({"status": "Log Approved and Task Rescheduled", "next_due_date": task.next_due_date})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        log = self.get_object()
        admin_comment = request.data.get('admin_comment', '')
        
        if log.status == 'Rejected':
            return Response({"status": "Already rejected"})
            
        log.status = 'Rejected'
        log.admin_comment = admin_comment
        log.save()
        return Response({"status": "Log Rejected", "admin_comment": admin_comment})
