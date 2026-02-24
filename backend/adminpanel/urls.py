from django.urls import path
from .views import (
    AdminAssignStaffView,
    AdminAvailableStaffView,
    AdminCloseComplaintView,
    AdminCreateStaffView,
    AdminDashboardView,
    AdminComplaintListView,
    AdminDeleteStaffView,
    AdminStudentDetailView,
    AdminStudentListView,
    AdminToggleStudentStatusView,
    AdminDeleteStudentView,
    AdminUpdatePriorityView,
    AdminStaffListView,
    AdminStaffPerformanceView,
    AdminReplyEscalationView,
    AdminStaffUpdatesView,
    AdminClearUpdatesView,
    AdminClearComplaintsView,
    AdminComplaintDetailView,
    AdminReportView,
    AdminBulkAssignStaffView,
    AdminBulkUpdateStatusView,
)

urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view()),
    path("reports/", AdminReportView.as_view(), name="admin-reports"),
    path("complaints/", AdminComplaintListView.as_view()),

    path(
        "complaints/<int:complaint_id>/priority/",
        AdminUpdatePriorityView.as_view()
    ),
    path(
        "complaints/<int:complaint_id>/assign/",
        AdminAssignStaffView.as_view()
    ),
    path("staff/<int:staff_id>/delete/", AdminDeleteStaffView.as_view()),
    path(
    "complaints/<int:complaint_id>/close/",
    AdminCloseComplaintView.as_view(),
    name="admin-close-complaint"
),
path(
    "students/",
    AdminStudentListView.as_view(),
    name="admin-student-list"
),

path(
    "students/<int:student_id>/toggle/",
    AdminToggleStudentStatusView.as_view(),
    name="admin-toggle-student"
),

 path(
        "students/<int:student_id>/",
        AdminStudentDetailView.as_view(),
        name="admin-student-details"
    ),
    path(
        "students/<int:student_id>/remove/",
        AdminDeleteStudentView.as_view(),
        name="admin-remove-student"
    ),
    path(
    "complaints/<int:complaint_id>/close/",
    AdminCloseComplaintView.as_view(),
    name="admin-close-complaint"
),

path(
    "staff/performance/",
    AdminStaffPerformanceView.as_view(),
    name="admin-staff-performance"
),







    # ✅ Staff management
    path("staff/", AdminStaffListView.as_view()),       # GET
    path("staff/create/", AdminCreateStaffView.as_view()),  # POST
    path("staff/available/", AdminAvailableStaffView.as_view()),
    path("complaints/<int:complaint_id>/escalation/reply/", AdminReplyEscalationView.as_view()),
    path("complaints/<int:complaint_id>/", AdminComplaintDetailView.as_view()),
    path("complaints/clear/", AdminClearComplaintsView.as_view()),
    path("complaints/bulk-assign/", AdminBulkAssignStaffView.as_view()),
    path("complaints/bulk-update-status/", AdminBulkUpdateStatusView.as_view()),
    path("staff-updates/", AdminStaffUpdatesView.as_view()),
    path("staff-updates/clear/", AdminClearUpdatesView.as_view()),
]
