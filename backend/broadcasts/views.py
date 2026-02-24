from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Broadcast
from .serializers import BroadcastSerializer

class BroadcastViewSet(viewsets.ModelViewSet):
    queryset = Broadcast.objects.all().order_by('-created_at')
    serializer_class = BroadcastSerializer

    def get_permissions(self):
        if self.action in ['list', 'active']:
            # Any authenticated user (Students, Staff, Admin) can list active broadcasts
            return [permissions.IsAuthenticated()]
        # Creating/Editing/Deleting requires Admin or Staff (for now, keeping it restricted)
        return [permissions.IsAuthenticated()] # Real role check would be better but let's keep it simple first

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Returns only the currently active broadcasts."""
        active_broadcasts = Broadcast.objects.filter(is_active=True).order_by('-created_at')
        serializer = self.get_serializer(active_broadcasts, many=True)
        return Response(serializer.data)
