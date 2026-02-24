from django.urls import path
from .views import ComplaintRatingView, StudentComplaintView

urlpatterns = [
    path("student/", StudentComplaintView.as_view(), name="student-complaints"),
    path(
        "rate/<int:complaint_id>/",
        ComplaintRatingView.as_view(),
        name="complaint-rating"
    )
]
