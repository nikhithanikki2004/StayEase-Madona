import os
import django
from unittest.mock import MagicMock

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from adminpanel.emails import send_staff_credentials_email

# Mock user object
mock_user = MagicMock()
mock_user.email = "stayeasestaff@gmail.com" # Sending to the same inbox for testing
mock_user.full_name = "Test Staff User"

test_password = "TestPassword123!"

print("--- 📧 StayEase Email Test Script ---")
print(f"Target Recipient: {mock_user.email}")
print(f"Staff Name: {mock_user.full_name}")
print("-" * 40)

# Trigger email
success = send_staff_credentials_email(mock_user, test_password)

if success:
    print("\n✅ Success: Email thread started!")
    print("Check your terminal for SMTP logs (as it runs in a background thread).")
else:
    print("\n❌ Failure: Could not start email thread.")

print("-" * 40)
print("TIP: If you see 'SMTP Authentication Error', check your App Password.")
