from rest_framework import serializers
from .models import MaintenanceTask, MaintenanceLog
class MaintenanceLogSerializer(serializers.ModelSerializer):
    completed_by_name = serializers.SerializerMethodField()
    task_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceLog
        fields = ['id', 'task', 'task_name', 'completed_by', 'completed_by_name', 'completion_date', 'status', 'notes', 'proof_image', 'admin_comment']
        read_only_fields = ['completed_by', 'completion_date']

    def get_completed_by_name(self, obj):
        return obj.completed_by.full_name if obj.completed_by else "Staff"

    def get_task_name(self, obj):
        return obj.task.title if obj.task else f"Task #{obj.task_id}"

class MaintenanceTaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    last_log = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceTask
        fields = '__all__'

    def get_last_log(self, obj):
        # Get the most recent log for this task
        last_log = obj.logs.order_by('-completion_date').first()
        if last_log:
            return MaintenanceLogSerializer(last_log).data
        return None

    # def get_status(self, obj):
    #     today = date.today()
    #     if obj.next_due_date < today:
    #         return "Overdue"
    #     elif obj.next_due_date == today:
    #         return "Due Today"
    #     return "Upcoming"
