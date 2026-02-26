from django.core.mail import send_mail
from django.conf import settings



import threading
import traceback

def _send_email_thread(subject, plain_message, from_email, recipients, html_message):
    try:
        from django.conf import settings
        print(f"--- 📧 Attempting Gmail Send to {recipients} ---")
        print(f"SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        print(f"FROM: {from_email}")

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=from_email,
            recipient_list=recipients,
            html_message=html_message,
            fail_silently=False,
        )
        print(f"✅ Success: Email sent to {recipients}")
    except Exception as e:
        print(f"❌ Detailed SMTP Error: {str(e)}")
        print(f"Error Type: {type(e).__name__}")
        traceback.print_exc()
        
        if not getattr(settings, 'EMAIL_HOST_PASSWORD', None):
            print("⚠️ WARNING: EMAIL_HOST_PASSWORD environment variable is NOT SET or is EMPTY.")
        else:
            print(f"💡 TIP: You have a password set (length: {len(settings.EMAIL_HOST_PASSWORD)}).")
            print("Check if you are using a 16-character Google App Password (no spaces).")

def send_staff_credentials_email(user, password):
    """
    Send login credentials email to the shared staff inbox synchronously.
    """
    email = user.email
    full_name = user.full_name
    subject = "Your StayEase Staff Account"

    plain_message = (
        f"Hello {full_name},\n\n"
        f"Your staff account has been created.\n\n"
        f"Email: {email}\n"
        f"Password: {password}\n"
        f"Login: https://stay-ease-madona.vercel.app/login"
    )

    html_message = f"""
<html>
    <body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#f6f6f6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin:20px auto; background:#ffffff; border-radius:8px; overflow:hidden;">
                        <tr style="background: linear-gradient(90deg, #6F4E37 0%, #5a3e2b 100%);">
                            <td style="padding:24px; text-align:center; color:#FDF5E6;">
                                <h1 style="margin:0; font-size:20px;">StayEase Staff Portal</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:24px; color:#333;">
                                <p style="margin:0 0 12px 0; font-size:16px;">Hello <strong>{full_name}</strong>,</p>
                                <p style="margin:0 0 16px 0; color:#6b7280;">Your staff account has been created. Below are your Login credentials.</p>

                                <div style="background:#FDF5E6; border:1px solid #eee; padding:16px; border-radius:6px; margin:16px 0;">
                                    <p style="margin:0 0 6px 0;"><strong>Email:</strong> <span style="color:#6F4E37;">{email}</span></p>
                                    <p style="margin:0 0 6px 0;"><strong>Password:</strong> <span style="color:#6F4E37;">{password}</span></p>
                                </div>
                                   
                                <p style="margin:0; color:#9CA3AF; font-size:12px;">If you did not expect this email, contact your admin immediately.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:14px; background:#fafafa; text-align:center; font-size:12px; color:#6b7280;">
                                © 2026 StayEase Management System — Do not reply to this email.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>
"""
    recipients = ["stayeasestaff@gmail.com"]

    # ✅ Sync Send for Render Reliability
    try:
        print(f"--- 📧 Attempting Gmail Send to {recipients} ---")
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER, # Direct use of SMTP user
            recipient_list=recipients,
            html_message=html_message,
            fail_silently=True,
        )
        print(f"✅ Success: Email sent to {recipients}")
        return True
    except Exception as e:
        print(f"❌ Detailed SMTP Error: {str(e)}")
        traceback.print_exc()
        return False
