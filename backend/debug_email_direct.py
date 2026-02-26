import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

def trigger_test_email():
    print("--- 📧 Email Debug Started ---")
    print(f"Using EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    
    # Check if Password exists
    if not settings.EMAIL_HOST_PASSWORD:
        print("❌ Error: EMAIL_HOST_PASSWORD is not set in environment or .env!")
        return

    subject = "StayEase Deployment Test"
    message = "This is a test email to verify credentials and SMTP settings."
    recipient_list = ["stayeasestaff@gmail.com"]

    try:
        print(f"Attempting to send mail to {recipient_list}...")
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False
        )
        print("✅ SUCCESS: Email sent successfully!")
    except Exception as e:
        print(f"❌ SMTP ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    trigger_test_email()
