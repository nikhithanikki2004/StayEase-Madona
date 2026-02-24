from rest_framework import serializers
from .models import InventoryItem, InventoryLog

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class InventoryLogSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    complaint_id = serializers.CharField(source='related_complaint.id', read_only=True)

    class Meta:
        model = InventoryLog
        fields = ['id', 'item', 'item_name', 'user', 'user_name', 'quantity_changed', 'action', 'related_complaint', 'complaint_id', 'timestamp']
