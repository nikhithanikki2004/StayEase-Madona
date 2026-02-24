from django.urls import path
from .views import (
    StaffClearResolvedComplaintView,
    StaffComplaintTimelineView,
    StaffDashboardView,
    StaffComplaintListView,
    StaffResolutionHistoryView,
    StaffUpdateComplaintView,
    StaffEscalateComplaintView,
    StaffBulkResolveView,
    StaffEscalatedComplaintListView,
    StaffEscalationReplyView,
    StaffRatingsView,
)

urlpatterns = [
    path("dashboard/", StaffDashboardView.as_view()),
    path("complaints/", StaffComplaintListView.as_view()),
    path('complaints/bulk-resolve/', StaffBulkResolveView.as_view(), name='staff-bulk-resolve'),
    path('complaints/<int:complaint_id>/escalate-reply/', StaffEscalationReplyView.as_view(), name='staff-escalate-reply'),
    path("complaints/escalated/", StaffEscalatedComplaintListView.as_view()),
    path("complaints/<int:complaint_id>/update/", StaffUpdateComplaintView.as_view()),
    path("complaints/<int:complaint_id>/escalate/", StaffEscalateComplaintView.as_view()),
    path("history/", StaffResolutionHistoryView.as_view()),
    path("history/clear/<int:complaint_id>/", StaffClearResolvedComplaintView.as_view()),
    path("complaints/<int:complaint_id>/timeline/", StaffComplaintTimelineView.as_view()),
    path("ratings/", StaffRatingsView.as_view()),
]
