
class AdminClearComplaintsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        ids_to_clear = request.data.get("ids", [])
        
        if not ids_to_clear:
             return Response({"message": "No IDs provided"}, status=400)

        Complaint.objects.filter(id__in=ids_to_clear).update(cleared_by_admin=True)
        return Response({"message": f"{len(ids_to_clear)} complaints cleared successfully"})
