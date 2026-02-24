from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import InventoryItem, InventoryLog
from .serializers import InventoryItemSerializer, InventoryLogSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def log_usage(self, request, pk=None):
        item = self.get_object()
        quantity_used = int(request.data.get('quantity', 0))
        complaint_id = request.data.get('complaint_id')
        
        if quantity_used <= 0:
            return Response({"error": "Quantity must be positive"}, status=status.HTTP_400_BAD_REQUEST)
        
        if item.available_quantity < quantity_used:
            return Response({"error": "Insufficient stock"}, status=status.HTTP_400_BAD_REQUEST)

        # Update Stock
        item.available_quantity -= quantity_used
        item.save()

        # Create Log
        InventoryLog.objects.create(
            item=item,
            user=request.user,
            quantity_changed=-quantity_used,  # Negative for usage
            action="USED",
            related_complaint_id=complaint_id
        )

        return Response({"status": "Stock updated", "remaining": item.available_quantity})

    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        item = self.get_object()
        quantity_added = int(request.data.get('quantity', 0))
        
        if quantity_added <= 0:
            return Response({"error": "Quantity must be positive"}, status=status.HTTP_400_BAD_REQUEST)

        item.total_quantity += quantity_added
        item.available_quantity += quantity_added
        item.save()

        InventoryLog.objects.create(
            item=item,
            user=request.user,
            quantity_changed=quantity_added,
            action="ADDED"
        )

        return Response({"status": "Stock added", "total": item.total_quantity})
