from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from .views import  AdminSupportReplyView, AdminSupportStatusUpdateView, StudentCreateSupport, StudentProfileUpdateView, StudentProfileView, StudentSignupView, CheckEmailView, StudentSupportList, StudentSupportReply, UserLoginView , StudentDashboardView,AdminSupportDetailView, AdminSupportListView, PasswordResetConfirmView, PingView
 
    
from .views import StudentProfilePictureUploadView


urlpatterns = [
    path("signup/", StudentSignupView.as_view(), name="student-signup"),
    path("check-email/", CheckEmailView.as_view(), name="check-email"),
    path("login/", UserLoginView.as_view(), name="user-login"),
    path("ping/", PingView.as_view(), name="ping"),
    path("dashboard/", StudentDashboardView.as_view(), name="student-dashboard"),
    path("profile/", StudentProfileView.as_view()),   # ✅ FIXED
    path(
    "profile-picture/",
    StudentProfilePictureUploadView.as_view(),
    name="student-profile-picture",
    
),
path(
    "profile/update/",
    StudentProfileUpdateView.as_view(),
    name="student-profile-update",
),

   # ================= STUDENT SUPPORT =================
    path("support/", StudentSupportList.as_view(), name="student-support-list"),
    path("support/create/", StudentCreateSupport.as_view(), name="student-support-create"),
    path("support/reply/<int:ticket_id>/", StudentSupportReply.as_view()),


    path("admin/support/", AdminSupportListView.as_view()),
    path("admin/support/<int:ticket_id>/", AdminSupportDetailView.as_view()),
    path("admin/support/reply/<int:ticket_id>/", AdminSupportReplyView.as_view()),
    path("admin/support/status/<int:ticket_id>/", AdminSupportStatusUpdateView.as_view()),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),

]  
 