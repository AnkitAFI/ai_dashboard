import os
import logging
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

logger = logging.getLogger(__name__)

class BrevoService:
    @staticmethod
    def get_configuration():
        """
        Initializes and returns the Brevo API configuration.
        """
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = os.environ.get("BREVO_API_KEY", "")
        return configuration

    @staticmethod
    def add_contact_to_brevo(email: str, phone_number: str = None, first_name: str = None, last_name: str = None):
        """
        Adds a new contact to Brevo.
        Uses BREVO_SYNC_LIST_ID from environment variables if set.
        Designed to be run as a background task.
        """
        configuration = BrevoService.get_configuration()
        
        if not configuration.api_key['api-key']:
            logger.warning("[Brevo] BREVO_API_KEY not found in environment, skipping contact creation.")
            return False
            
        list_id_str = os.environ.get("BREVO_SYNC_LIST_ID", "")
        
        try:
            api_instance = sib_api_v3_sdk.ContactsApi(sib_api_v3_sdk.ApiClient(configuration))
            
            # create_contact payload
            # update_enabled=True ensures we don't throw an error if they are already in Brevo
            contact_payload = {
                "email": email,
                "update_enabled": True
            }
            
            attributes = {}
            if first_name:
                attributes["FIRSTNAME"] = first_name
            if last_name:
                attributes["LASTNAME"] = last_name
            
            if phone_number:
                # Format to E.164 standard if missing the + sign
                phone_number = phone_number.strip()
                if not phone_number.startswith('+'):
                    if len(phone_number) == 10 and phone_number.isdigit():
                        phone_number = f"+91{phone_number}"
                    elif phone_number.startswith("91") and len(phone_number) == 12:
                        phone_number = f"+{phone_number}"
                    else:
                        phone_number = f"+{phone_number}"
                        
                attributes["SMS"] = phone_number
                
            if attributes:
                contact_payload["attributes"] = attributes
            # If the user has provided a List ID, assign the contact to it
            if list_id_str.isdigit():
                contact_payload["list_ids"] = [int(list_id_str)]
                
            create_contact = sib_api_v3_sdk.CreateContact(**contact_payload)
            
            api_response = api_instance.create_contact(create_contact)
            logger.info(f"[Brevo] Contact {email} successfully synced to Brevo.")
            return True
            
        except ApiException as e:
            # If Brevo rejects the phone number format or it's a duplicate, retry without the phone number
            # so that the email sync doesn't fail completely.
            error_str = str(e)
            if "Invalid phone number" in error_str or "duplicate_parameter" in error_str:
                logger.warning(f"[Brevo] Phone number rejected for {email} (invalid or duplicate). Retrying without SMS...")
                return BrevoService.add_contact_to_brevo(email, phone_number=None, first_name=first_name, last_name=last_name)
                
            logger.error(f"[Brevo] Exception when calling ContactsApi->create_contact for {email}: {e}")
            return False
        except Exception as e:
            logger.error(f"[Brevo] Unexpected error during contact sync for {email}: {e}")
            return False

    @staticmethod
    def send_demo_booking_email(booking_data: dict, admin_email: str):
        """
        Sends an email notification via Brevo Transactional Email API for new demo bookings.
        """
        configuration = BrevoService.get_configuration()
        if not configuration.api_key['api-key']:
            logger.warning("[Brevo] BREVO_API_KEY not found in environment, skipping demo email notification.")
            return False
            
        try:
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
            
            sender_email = os.environ.get("BREVO_SENDER_EMAIL", "noreply@insydz.com")
            sender_name = os.environ.get("BREVO_SENDER_NAME", "Insydz")
            
            # Format HTML content
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>New Demo Booked! 🎉</h2>
                    <p>You have a new demo booking. Here are the details:</p>
                    <ul>
                        <li><strong>Name:</strong> {booking_data.get('name')}</li>
                        <li><strong>Email:</strong> {booking_data.get('email')}</li>
                        <li><strong>Phone:</strong> {booking_data.get('phone', 'N/A')}</li>
                        <li><strong>Date:</strong> {booking_data.get('date')}</li>
                        <li><strong>Time Slot (IST):</strong> {booking_data.get('time_slot')}</li>
                        <li><strong>Context:</strong> {booking_data.get('context', 'None')}</li>
                    </ul>
                </body>
            </html>
            """
            
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": admin_email}],
                sender={"email": sender_email, "name": sender_name},
                subject=f"New Demo Booking: {booking_data.get('name')} - {booking_data.get('date')} at {booking_data.get('time_slot')}",
                html_content=html_content
            )
            
            api_instance.send_transac_email(send_smtp_email)
            logger.info(f"[Brevo] Demo booking email sent to {admin_email}")
            return True
            
        except Exception as e:
            logger.error(f"[Brevo] Failed to send demo booking email to {admin_email}: {e}")
            return False

    @staticmethod
    def send_subscription_lead_alert(lead_data: dict, recipient_emails: str = None) -> bool:
        """
        Sends an instant high-priority lead notification when a free-tier user visits the subscription page.
        Recipients can be configured via SUBSCRIPTION_ALERT_EMAILS or ADMIN_EMAIL in .env.
        Supports multiple comma-separated emails.
        """
        configuration = BrevoService.get_configuration()
        if not configuration.api_key.get('api-key'):
            logger.warning("[Brevo] BREVO_API_KEY not found in environment, skipping subscription lead alert.")
            return False

        try:
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
            
            sender_email = os.environ.get("BREVO_SENDER_EMAIL", "noreply@insydz.com")
            sender_name = os.environ.get("BREVO_SENDER_NAME", "Insydz")
            
            name = lead_data.get("name", "Potential Customer")
            email = lead_data.get("email", "N/A")
            raw_phone = lead_data.get("phone", "N/A")
            business_name = lead_data.get("business_name", "Not specified")
            tier = lead_data.get("tier", "Free")
            time_str = lead_data.get("time", "Just now")
            page_path = lead_data.get("page_path", "/subscription")

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
                <tr>
                  <td align="center">
                    <table width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 30px; text-align: left; border-bottom: 3px solid #3b82f6;">
                          <div style="display: inline-block; background-color: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 20px; padding: 4px 12px; margin-bottom: 10px;">
                            <span style="color: #f87171; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">🔥 Hot Sales Lead</span>
                          </div>
                          <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; line-height: 1.3;">
                            {name} is on the Subscription Page!
                          </h1>
                          <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">
                            A free user is actively exploring subscription plans right now.
                          </p>
                        </td>
                      </tr>

                      <!-- Quick Action & Phone Block -->
                      <tr>
                        <td style="padding: 24px 30px 16px; text-align: center; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0 0 10px; font-size: 13px; color: #64748b; font-weight: 600;">
                            CALL IMMEDIATELY WHILE THEY ARE ON SCREEN:
                          </p>
                          <div style="display: inline-block; padding: 12px 24px; font-size: 18px; font-weight: 800; color: #15803d; background-color: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; letter-spacing: 0.5px;">
                            📞 {raw_phone}
                          </div>
                          <div style="margin-top: 12px;">
                            <a href="mailto:{email}?subject=Subscription%20Plan%20Inquiry" style="display: inline-block; padding: 10px 18px; font-size: 13px; font-weight: 600; color: #0284c7; text-decoration: none; border: 1px solid #bae6fd; border-radius: 6px; background-color: #f0f9ff;">
                              ✉️ Email Lead: {email}
                            </a>
                          </div>
                        </td>
                      </tr>

                      <!-- Lead Information -->
                      <tr>
                        <td style="padding: 24px 30px;">
                          <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                            📋 Customer Details
                          </h3>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                            <tr style="background-color: #f8fafc;">
                              <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #64748b; width: 35%; border-bottom: 1px solid #e2e8f0;">Full Name</td>
                              <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">{name}</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Phone Number</td>
                              <td style="padding: 10px 14px; font-size: 15px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                                {raw_phone}
                              </td>
                            </tr>
                            <tr style="background-color: #f8fafc;">
                              <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email</td>
                              <td style="padding: 10px 14px; font-size: 13px; color: #0284c7; border-bottom: 1px solid #e2e8f0;">
                                <a href="mailto:{email}" style="color: #0284c7; text-decoration: none;">{email}</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Business Name</td>
                              <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #e2e8f0;">{business_name}</td>
                            </tr>
                            <tr style="background-color: #f8fafc;">
                              <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Current Plan</td>
                              <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #f59e0b; border-bottom: 1px solid #e2e8f0;">{tier} Tier</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #64748b;">Visit Time</td>
                              <td style="padding: 10px 14px; font-size: 13px; color: #475569;">{time_str}</td>
                            </tr>
                          </table>

                          <div style="margin-top: 20px; padding: 12px 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px;">
                            <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
                              💡 <strong>Pro Tip:</strong> Reaching out within 5 minutes while the lead is actively reviewing pricing produces up to a <strong>9x higher conversion rate</strong>.
                            </p>
                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 16px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                            This automated alert was triggered by User Behavior Analytics. 24-hour per-user cooldown is active.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """

            target_emails = (
                recipient_emails
                or os.environ.get("SUBSCRIPTION_ALERT_EMAILS")
                or os.environ.get("ADMIN_EMAIL")
                or ""
            )

            # Handle single or comma-separated recipients
            recipients = []
            for addr in target_emails.split(","):
                addr = addr.strip()
                if addr:
                    recipients.append({"email": addr})

            if not recipients:
                logger.warning("[Brevo] No recipient email configured in SUBSCRIPTION_ALERT_EMAILS or ADMIN_EMAIL.")
                return False

            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=recipients,
                sender={"email": sender_email, "name": sender_name},
                subject=f"🚨 Hot Lead: {name} visited the Subscription Page! ({raw_phone})",
                html_content=html_content
            )

            api_instance.send_transac_email(send_smtp_email)
            recipient_list_str = ", ".join([r["email"] for r in recipients])
            logger.info(f"[Brevo] Subscription lead alert for {email} sent successfully to [{recipient_list_str}]")
            return True

        except Exception as e:
            logger.error(f"[Brevo] Failed to send subscription lead alert for {lead_data.get('email')}: {e}")
            return False
