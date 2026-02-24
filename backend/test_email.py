"""
Test script to verify email sending functionality
Run this in Django shell: python manage.py shell < test_email.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from adminpanel.emails import send_staff_credentials_email

# Test email sending
test_email = "test@example.com"
test_name = "John Doe"
test_password = "TestPassword123!"

print("Testing email sending functionality...")
print(f"Sending email to: {test_email}")
print(f"Staff Name: {test_name}")
print(f"Password: {test_password}")
print("-" * 50)

result = send_staff_credentials_email(
    email=test_email,
    full_name=test_name,
    password=test_password
)

if result:
    print("✅ Email sent successfully!")
else:
    print("❌ Email sending failed. Check your email configuration.")

print("-" * 50)
print("\nNote: If using Gmail, make sure you've generated an App Password")
print("Settings are configured in stayease_backend/settings.py")
