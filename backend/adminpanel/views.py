from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated

from complaints.models import Complaint, ComplaintLog, ComplaintRating
from django.shortcuts import get_object_or_404
from .serializers import AdminComplaintSerializer
from students.models import Student
from rest_framework import status
from django.db.models import Avg, Count, Q, F, ExpressionWrapper, DurationField
from django.utils.timezone import now
from datetime import timedelta
from .emails import send_staff_credentials_email
import traceback





# 🔐 Admin-only permission
class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "admin"
        )


# 📊 Admin Dashboard API
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_complaints = Complaint.objects.count()
        pending_complaints = Complaint.objects.filter(status="Submitted").count()
        resolved_complaints = Complaint.objects.filter(status__in=["Resolved", "Closed"]).count()

        category_stats = (
            Complaint.objects
            .values("complaint_category")
            .annotate(count=models.Count("id"))
            .order_by("complaint_category")
        )

        return Response({
            "welcome_message": f"Welcome Admin {request.user.full_name}",
            "total_complaints": total_complaints,
            "pending_complaints": pending_complaints,
            "resolved_complaints": resolved_complaints,
            "category_stats": category_stats,
        })
    
class AdminComplaintListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get("status")
        priority_filter = request.query_params.get("priority")
        category_filter = request.query_params.get("category")
        hostel_filter = request.query_params.get("hostel")

        complaints = Complaint.objects.all().order_by("-created_at")

        if status_filter and status_filter != "All":
            complaints = complaints.filter(status=status_filter)
        if priority_filter and priority_filter != "All":
            complaints = complaints.filter(priority=priority_filter)
        if category_filter and category_filter != "All":
            complaints = complaints.filter(complaint_category=category_filter)
        if hostel_filter and hostel_filter != "All":
            complaints = complaints.filter(hostel_id=hostel_filter)

        serializer = AdminComplaintSerializer(complaints, many=True)
        return Response(serializer.data)


class AdminComplaintUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        complaint = get_object_or_404(Complaint, pk=pk)

        update_data = {}

        # ✅ Admin can update priority
        if "priority" in request.data:
            update_data["priority"] = request.data["priority"]

        # ✅ Admin can assign staff
        if "assigned_to" in request.data:
            update_data["assigned_to"] = request.data["assigned_to"]

        serializer = AdminComplaintSerializer(
            complaint,
            data=update_data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
    
class AdminUpdatePriorityView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, complaint_id):
        complaint = get_object_or_404(Complaint, id=complaint_id)

        # 🚫 BLOCK if already locked
        if complaint.priority_locked:
            return Response(
                {"error": "Priority is locked and cannot be changed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_priority = request.data.get("priority")
        if new_priority not in ["Low", "Medium", "High"]:
            return Response(
                {"error": "Invalid priority"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ UPDATE + LOCK
        complaint.priority = new_priority
        complaint.priority_locked = True
        complaint.save()

        ComplaintLog.objects.create(
            complaint=complaint,
            action=f"Priority changed to {new_priority}",
            performed_by=request.user
        )

        # ✅ RETURN FULL COMPLAINT (CRITICAL)
        serializer = AdminComplaintSerializer(complaint)

        return Response(serializer.data, status=status.HTTP_200_OK)




    

class AdminAssignStaffView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, complaint_id):
        complaint = get_object_or_404(Complaint, id=complaint_id)

        staff_id = request.data.get("staff_id")
        if not staff_id:
            return Response(
                {"error": "staff_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        staff = get_object_or_404(Student, id=staff_id)

        # ✅ Validate staff role
        if staff.role != "staff":
            return Response(
                {"error": "Only staff users can be assigned"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ❌ Check if staff is already busy
        is_busy = Complaint.objects.filter(
            assigned_to=staff,
            status__in=["Submitted", "In Progress"]
        ).exists()

        if is_busy:
            return Response(
                {"error": "Staff is already assigned to another complaint"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Assign staff
        complaint.assigned_to = staff
        complaint.status = "In Progress"  
        complaint.save()

        return Response({
            "message": "Staff assigned successfully",
            "complaint_id": complaint.id,
            "assigned_to": {
                "id": staff.id,
                "full_name": staff.full_name,
                "email": staff.email
            }
        })
    

class AdminCreateStaffView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        try:
            print(f"DEBUG: AdminCreateStaffView hit with data: {request.data}")
            data = request.data

            required_fields = ["full_name", "email", "password", "mobile_number"]
            for field in required_fields:
                if not data.get(field):
                    print(f"DEBUG: Missing field: {field}")
                    return Response(
                        {"error": f"{field} is required"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            if Student.objects.filter(email=data["email"]).exists():
                print(f"DEBUG: Email already exists: {data['email']}")
                return Response(
                    {"error": "Email already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            staff = Student.objects.create_user(
                email=data["email"],
                password=data["password"],
                full_name=data["full_name"],
                mobile_number=data["mobile_number"],
                role="staff",
                is_staff=True,
                is_active=True
            )
            print(f"DEBUG: Staff created: {staff.email}")

            # ✅ Send email with login credentials
            email_sent = False
            try:
                email_sent = send_staff_credentials_email(
                    staff,
                    password=data["password"]
                )
                print(f"DEBUG: Email task triggered: {email_sent}")
            except Exception as email_err:
                print(f"DEBUG: SMTP/Email Error (Caught): {str(email_err)}")
                traceback.print_exc()

            return Response({
                "message": "Staff created successfully",
                "email_sent": email_sent,
                "staff": {
                    "id": staff.id,
                    "name": staff.full_name,
                    "email": staff.email
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as global_err:
            print(f"DEBUG: GLOBAL CRASH in AdminCreateStaffView: {str(global_err)}")
            traceback.print_exc()
            return Response({
                "error": "Critical Server Error during creation",
                "details": str(global_err),
                "trace": traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class AdminAvailableStaffView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Staff who are currently handling active complaints
        busy_staff_ids = Complaint.objects.filter(
            status__in=["Submitted", "In Progress"],
            assigned_to__isnull=False
        ).values_list("assigned_to_id", flat=True)

        # Available staff = staff not in busy list
        available_staff = Student.objects.filter(
            role="staff",
            is_active=True
        ).exclude(id__in=busy_staff_ids)

        return Response([
            {
                "id": staff.id,
                "full_name": staff.full_name,
                "email": staff.email,
                "mobile_number": staff.mobile_number
            }
            for staff in available_staff
        ])
class AdminStaffListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        staff_users = Student.objects.filter(
            role="staff",
            is_active=True   # 🔥 IMPORTANT
        )

        staff_data = []
        for staff in staff_users:
            is_busy = Complaint.objects.filter(
                assigned_to=staff,
                status__in=["Submitted", "In Progress"]
            ).exists()

            staff_data.append({
                "id": staff.id,
                "full_name": staff.full_name,
                "email": staff.email,
                "mobile_number": staff.mobile_number,
                "available": not is_busy
            })

        return Response(staff_data)

    
class AdminDeleteStaffView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, staff_id):
        staff = get_object_or_404(Student, id=staff_id, role="staff")

        staff.is_active = False   # 🔥 SOFT DELETE
        staff.save()

        return Response(
            {"message": "Staff deleted successfully"},
            status=200
        )


class AdminCloseComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, complaint_id):
        complaint = get_object_or_404(Complaint, id=complaint_id)

        # 🔒 BLOCK CLOSING IF NO STUDENT RATING
        if not hasattr(complaint, "rating"):
            return Response(
                {"error": "Cannot close complaint before student feedback"},
                status=status.HTTP_400_BAD_REQUEST
            )

        complaint.status = "Closed"
        complaint.save()

        ComplaintLog.objects.create(
            complaint=complaint,
            action="Closed by Admin",
            performed_by=request.user,
            notes="Complaint closed after reviewing student feedback"
        )

        return Response({"message": "Complaint closed successfully"})


class AdminStudentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
         
        students = Student.objects.filter(role="student")


        data = []
        for student in students:
            complaints = Complaint.objects.filter(student=student)
            profile = getattr(student, "profile", None)

            data.append({
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "mobile_number": student.mobile_number,
                "department": profile.department if profile else "",
                "year": profile.year if profile else "",
                "hostel_name": profile.hostel_name if profile else "",
                "block": profile.block if profile else "",
                "room_number": profile.room_number if profile else "",
                "is_active": student.is_active,
                "total_complaints": complaints.count(),
                "resolved_complaints": complaints.filter(status__in=["Resolved", "Closed"]).count(),
                "active_complaints": complaints.filter(
                    status__in=["Submitted", "In Progress"]
                ).count(),
            })

        return Response(data)
    
class AdminToggleStudentStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, student_id):
        student = get_object_or_404(Student, id=student_id, role="student")
        student.is_active = not student.is_active
        student.save()

        return Response({
            "message": "Student status updated",
            "is_active": student.is_active
        })

class AdminDeleteStudentView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, student_id):
        student = get_object_or_404(Student, id=student_id, role="student")
        
        # Security Check: Only allow removal if account is disabled (as per user request)
        if student.is_active:
            return Response(
                {"error": "Cannot remove an active student. Please disable the account first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        student.delete()
        return Response(
            {"message": "Student record permanently removed"},
            status=status.HTTP_200_OK
        )

class AdminStudentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, student_id):
        student = get_object_or_404(Student, id=student_id, role="student")

        complaints = Complaint.objects.filter(student=student).order_by("-created_at")

        complaint_data = []
        for complaint in complaints:
            complaint_data.append({
                "id": complaint.id,
                "category": complaint.complaint_category,
                "status": complaint.status,
                "priority": complaint.priority,
                "assigned_to": (
                    {
                        "id": complaint.assigned_to.id,
                        "name": complaint.assigned_to.full_name
                    } if complaint.assigned_to else None
                ),
                "created_at": complaint.created_at,
                "resolution_notes": complaint.resolution_notes,
                "rating": (
                    {
                        "rating": complaint.rating.rating,
                        "feedback": complaint.rating.feedback,
                        "created_at": complaint.rating.created_at
                    } if hasattr(complaint, "rating") else None
                ),
                "logs": [
                    {
                        "action": log.action,
                        "performed_by": log.performed_by.full_name if log.performed_by else None,
                        "notes": log.notes,
                        "created_at": log.created_at
                    }
                    for log in complaint.logs.all().order_by("created_at")
                ]
            })

        profile = getattr(student, "profile", None)

        return Response({
            "student": {
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "mobile_number": student.mobile_number,
                "department": profile.department if profile else "",
                "year": profile.year if profile else "",
                "hostel_name": profile.hostel_name if profile else "",
                "block": profile.block if profile else "",
                "room_number": profile.room_number if profile else "",
                "is_active": student.is_active
            },
            "statistics": {
                "total": complaints.count(),
                "active": complaints.filter(
                    status__in=["Submitted", "In Progress"]
                ).count(),
                "resolved": complaints.filter(status="Resolved").count(),
                "closed": complaints.filter(status="Closed").count(),
            },
            "complaints": complaint_data
        })
    
class AdminStaffPerformanceView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        staff_users = Student.objects.filter(role="staff", is_active=True)

        performance_data = []

        for staff in staff_users:
            # 📊 All complaints this staff was involved in (as original assignee OR resolver)
            complaints = Complaint.objects.filter(
                models.Q(assigned_to=staff) | models.Q(resolved_by=staff)
            ).distinct()

            total_assigned = complaints.count()
            resolved = complaints.filter(
                status__in=["Resolved", "Closed"],
                resolved_by=staff
            ).count()
            active = complaints.filter(
                assigned_to=staff,
                status__in=["Submitted", "In Progress"]
            ).count()

            # ⏱ Average Resolution Time (in hours)
            resolved_complaints = complaints.filter(
                status__in=["Resolved", "Closed"],
                resolved_by=staff,
                resolved_at__isnull=False
            )

            avg_resolution_time = None
            if resolved_complaints.exists():
                avg_time = resolved_complaints.aggregate(
                    avg_time=Avg(
                        ExpressionWrapper(
                            F("resolved_at") - F("created_at"),
                            output_field=DurationField()
                        )
                    )
                )["avg_time"]

                avg_resolution_time = round(avg_time.total_seconds() / 3600, 2)

            # ⭐ Average Rating
            avg_rating = ComplaintRating.objects.filter(
                complaint__resolved_by=staff
            ).aggregate(avg=Avg("rating"))["avg"]

            avg_rating = round(avg_rating, 2) if avg_rating else None

            # 🧮 Performance Score
            performance_score = (
                (resolved * 2)
                + ((avg_rating or 0) * 5)
                - ((avg_resolution_time or 0) * 0.5)
            )

            performance_data.append({
                "staff_id": staff.id,
                "full_name": staff.full_name,
                "email": staff.email,
                "total_assigned": total_assigned,
                "resolved": resolved,
                "active": active,
                "avg_resolution_time": avg_resolution_time,
                "avg_rating": avg_rating,
                "performance_score": round(performance_score, 2),
            })

        # 🔝 Sort by best performers
        performance_data.sort(
            key=lambda x: x["performance_score"],
            reverse=True
        )

        return Response(performance_data)


# ===============================
# ADMIN REPLY TO ESCALATION
# ===============================
class AdminReplyEscalationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, complaint_id):
        complaint = get_object_or_404(Complaint, id=complaint_id)

        reply = request.data.get("reply") or request.data.get("admin_reply")
        if not reply:
            return Response({"error": "Reply text is required"}, status=status.HTTP_400_BAD_REQUEST)

        complaint.admin_reply = reply
        complaint.admin_replied_by = request.user
        complaint.admin_reply_at = now()
        # keep escalated flag as True (record remains), or optionally set False
        complaint.save()

        ComplaintLog.objects.create(
            complaint=complaint,
            action="Admin replied to escalation",
            performed_by=request.user,
            notes=reply
        )

        serializer = AdminComplaintSerializer(complaint)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ===============================
# ADMIN STAFF UPDATES (Escalations + Resolutions)
# ===============================
class AdminStaffUpdatesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # 1. Fetch Escalations
        escalations = Complaint.objects.filter(
            escalated=True, 
            cleared_by_admin=False
        ).select_related("escalated_by")
        
        # 2. Fetch Resolutions
        resolutions = Complaint.objects.filter(
            status__in=["Resolved", "Closed"],
            resolved_by__isnull=False,
            cleared_by_admin=False
        ).select_related("resolved_by")

        updates = []

        # Process Escalations
        for c in escalations:
            updates.append({
                "id": f"esc_{c.id}",
                "note_type": "Escalation",
                "complaint_id": c.id,
                "complaint_category": c.complaint_category,
                "staff_name": c.escalated_by.full_name if c.escalated_by else "Unknown",
                "timestamp": c.escalated_at or c.created_at, # Fallback
                "note_content": c.escalation_note,
                "icon": "🚨"
            })

        # Process Resolutions
        for c in resolutions:
            updates.append({
                "id": f"res_{c.id}",
                "note_type": "Resolution",
                "complaint_id": c.id,
                "complaint_category": c.complaint_category,
                "staff_name": c.resolved_by.full_name if c.resolved_by else "Unknown",
                "timestamp": c.resolved_at or c.created_at, # Fix: Ensure datetime type
                "note_content": c.resolution_notes,
                "icon": "✅"
            })

        # Sort by timestamp descending (newest first)
        # All items now have a datetime timestamp (created_at is required in model)
        updates.sort(key=lambda x: x["timestamp"], reverse=True)

        return Response(updates)


class AdminClearUpdatesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        ids_to_clear = request.data.get("ids", [])
        
        # If specific IDs provided
        if ids_to_clear:
            complaint_ids = []
            for item_id in ids_to_clear:
                # expecting format "esc_123" or "res_123"
                if "_" in str(item_id):
                    try:
                        _, c_id = str(item_id).split("_")
                        complaint_ids.append(int(c_id))
                    except ValueError:
                        continue
            
            if complaint_ids:
                Complaint.objects.filter(id__in=complaint_ids).update(cleared_by_admin=True)
                return Response({"message": f"{len(complaint_ids)} updates cleared successfully"})
            else:
                 return Response({"message": "No valid IDs provided"}, status=400)

        # Fallback: Clear All (if no IDs provided, or specific flag used)
        # 1. Clear Escalations
        Complaint.objects.filter(
            escalated=True,
            cleared_by_admin=False
        ).update(cleared_by_admin=True)

        # 2. Clear Resolutions
        Complaint.objects.filter(
            status__in=["Resolved", "Closed"],
            resolved_by__isnull=False,
            cleared_by_admin=False
        ).update(cleared_by_admin=True)

        return Response({"message": "All staff updates cleared successfully"})




class AdminClearComplaintsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        ids_to_clear = request.data.get("ids", [])
        
        if not ids_to_clear:
             return Response({"message": "No IDs provided"}, status=400)

        Complaint.objects.filter(id__in=ids_to_clear).update(cleared_by_admin=True)
        return Response({"message": f"{len(ids_to_clear)} complaints cleared successfully"})


class AdminBulkAssignStaffView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        ids = request.data.get("ids", [])
        staff_id = request.data.get("staff_id")

        if not ids or not staff_id:
            return Response({"error": "ids and staff_id are required"}, status=400)

        staff = get_object_or_404(Student, id=staff_id, role="staff")

        # Update complaints
        Complaint.objects.filter(id__in=ids).update(
            assigned_to=staff,
            status="In Progress"
        )

        # Create logs for each
        for cid in ids:
            ComplaintLog.objects.create(
                complaint_id=cid,
                action=f"Assigned to {staff.full_name} (Bulk)",
                performed_by=request.user
            )

        return Response({"message": f"{len(ids)} complaints assigned successfully"})


class AdminBulkUpdateStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        ids = request.data.get("ids", [])
        new_status = request.data.get("status")

        if not ids or not new_status:
            return Response({"error": "ids and status are required"}, status=400)

        if new_status not in ["Submitted", "In Progress", "Resolved", "Closed"]:
            return Response({"error": "Invalid status"}, status=400)

        update_fields = {"status": new_status}
        if new_status in ["Resolved", "Closed"]:
            update_fields["resolved_at"] = now()
            update_fields["resolved_by"] = request.user

        Complaint.objects.filter(id__in=ids).update(**update_fields)

        # Create logs
        for cid in ids:
            ComplaintLog.objects.create(
                complaint_id=cid,
                action=f"Status updated to {new_status} (Bulk)",
                performed_by=request.user
            )

        return Response({"message": f"{len(ids)} complaints updated successfully"})


class AdminComplaintDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, complaint_id):
        complaint = get_object_or_404(Complaint, id=complaint_id)
        
        # Get logs relevant to chat (escalation notes, admin replies)
        logs = ComplaintLog.objects.filter(
            complaint=complaint, 
            action__in=["Escalated to Admin", "Admin replied to escalation", "Escalated", "Admin Reply"]
        ).order_by('created_at')

        # Construct chat history
        chat_history = []
        
        for log in logs:
            if log.action == "Escalated to Admin" or log.action == "Escalated":
                chat_history.append({
                    "type": "staff",
                    "message": log.notes,
                    "sender": log.performed_by.full_name if log.performed_by else "Staff",
                    "timestamp": log.created_at
                })
            elif log.action == "Admin replied to escalation" or log.action == "Admin Reply":
                chat_history.append({
                    "type": "admin",
                    "message": log.notes,
                    "sender": "Admin",
                    "timestamp": log.created_at
                })

        serializer = AdminComplaintSerializer(complaint)
        data = serializer.data
        data['chat_history'] = chat_history
        
        return Response(data)

class AdminReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        report_type = request.query_params.get("type")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        hostel = request.query_params.get("hostel")

        # 📅 Base Filter (Date Range)
        filters = {}
        if start_date:
            filters["created_at__date__gte"] = start_date
        if end_date:
            filters["created_at__date__lte"] = end_date
        if hostel:
            filters["student__profile__hostel_name"] = hostel

        # 1️⃣ Complaint Reports
        if report_type == "complaints":
            complaints = Complaint.objects.filter(**filters)
            
            # Stats by Category
            category_stats = list(complaints.values("complaint_category").annotate(count=Count("id")).order_by("-count"))
            
            # Stats by Status
            status_stats = list(complaints.values("status").annotate(count=Count("id")))
            
            # Stats by Priority
            priority_stats = list(complaints.values("priority").annotate(count=Count("id")))

            return Response({
                "type": "complaints",
                "category_stats": category_stats,
                "status_stats": status_stats,
                "priority_stats": priority_stats,
                "total": complaints.count()
            })

        # 2️⃣ Staff Performance Reports
        elif report_type == "staff":
            staff_users = Student.objects.filter(role="staff")
            data = []

            for staff in staff_users:
                # 📊 All complaints this staff was involved in (as original assignee OR resolver)
                staff_complaints = Complaint.objects.filter(
                    models.Q(assigned_to=staff) | models.Q(resolved_by=staff),
                    **filters
                ).distinct()

                resolved_count = staff_complaints.filter(
                    status__in=["Resolved", "Closed"],
                    resolved_by=staff
                ).count()
                
                # Calc Avg Resolution Time
                resolved_complaints = staff_complaints.filter(
                    status__in=["Resolved", "Closed"],
                    resolved_by=staff,
                    resolved_at__isnull=False
                )
                
                avg_time = 0
                if resolved_complaints.exists():
                     avg = resolved_complaints.aggregate(
                        avg_time=Avg(
                            ExpressionWrapper(
                                F("resolved_at") - F("created_at"),
                                output_field=DurationField()
                            )
                        )
                    )["avg_time"]
                     if avg:
                        avg_time = round(avg.total_seconds() / 3600, 2)

                data.append({
                    "name": staff.full_name,
                    "assigned": staff_complaints.count(),
                    "resolved": resolved_count,
                    "avg_time": avg_time
                })
            
            # Sort by most resolved
            data.sort(key=lambda x: x["resolved"], reverse=True)
            return Response({"type": "staff", "data": data})

        # 3️⃣ Student Activity Reports
        elif report_type == "student":
            complaints = Complaint.objects.filter(**filters)
            
            # Top Complainers
            top_students = list(complaints.values("student__full_name", "student__email")
                                .annotate(count=Count("id"))
                                .order_by("-count")[:10])
            
            # Hostel-wise density
            hostel_stats = list(complaints.values(hostel_name=F("student__profile__hostel_name"))
                                .annotate(count=Count("id"))
                                .order_by("-count"))

            return Response({
                "type": "student",
                "top_students": top_students,
                "hostel_stats": hostel_stats
            })
            
        # 4️⃣ Escalation Reports
        elif report_type == "escalation":
            escalated_complaints = Complaint.objects.filter(escalated=True, **filters)
            
            data = []
            for c in escalated_complaints:
                data.append({
                    "id": c.id,
                    "category": c.complaint_category,
                    "staff": c.escalated_by.full_name if c.escalated_by else "Unknown",
                    "reason": c.escalation_note,
                    "date": c.escalated_at
                })
                
            return Response({"type": "escalation", "data": data})

        return Response({"error": "Invalid report type"}, status=400)
