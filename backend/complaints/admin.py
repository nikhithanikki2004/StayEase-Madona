from django.contrib import admin
from .models import Complaint, ComplaintLog

admin.site.register(Complaint)
admin.site.register(ComplaintLog)
