from django.core.mail import send_mail
from django.conf import settings



def send_staff_credentials_email(user, password):
    """
    Send login credentials email to the shared staff inbox (stayeasestaff@gmail.com).
    Includes a password reset link (uid + token) that points to the frontend reset page.

    Args:
        user (Student): The created staff user instance
        password (str): Plain text password (only sent in email, not stored)
    """

    email = user.email
    full_name = user.full_name

    # No reset link included per latest requirement
    reset_url = None

    subject = "Your StayEase Staff Account"

    # Plain text body matching requested format and including reset link
    plain_message = (
        f"From: {settings.EMAIL_HOST_USER}\n"
        f"To: {email}\n\n"
        f"Subject: Your StayEase Staff Account\n\n"
        f"Hello {full_name},\n"
        f"Your staff account has been created.\n\n"
        f"Email: {email}\n"
        f"Password: {password}\n"
        f"Login: http://localhost:5173/login"
    )

    # HTML version styled to match the site's theme (stay-brown / stay-cream)
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

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=["stayeasestaff@gmail.com"],  # Send to shared staff inbox
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False
