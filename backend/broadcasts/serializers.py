from rest_framework import serializers
from .models import Broadcast

class BroadcastSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = Broadcast
        fields = ['id', 'category', 'title', 'message', 'start_time', 'expected_resolution_time', 'is_active', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_by', 'start_time', 'created_at']
