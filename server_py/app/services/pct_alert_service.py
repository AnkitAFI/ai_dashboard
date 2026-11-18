import os
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

from app.models.pct_models import PctTrackedItem, PctPriceSnapshot, PctAlertLog
from app.models.schema_v2 import UserProfile
from app.core.cryptography import EncryptedString

logger = logging.getLogger(__name__)

# Brevo Configuration
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "alerts@insydz.com")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Insydz Price Tracker")

_crypto = EncryptedString()

def _encrypt_email(email: str) -> str:
    return _crypto.process_bind_param(email, None)

def _decrypt_email(cipher: str) -> str:
    return _crypto.process_result_value(cipher, None)

def _send_pct_email(to_emails: List[str], subject: str, html_content: str) -> bool:
    """Sends a transactional email via Brevo (SIB) SDK."""
    if not BREVO_API_KEY:
        logger.warning("BREVO_API_KEY is not configured; email dispatch skipped.")
        return False

    if not to_emails:
        return False

    try:
        config = sib_api_v3_sdk.Configuration()
        config.api_key["api-key"] = BREVO_API_KEY
        api_client = sib_api_v3_sdk.ApiClient(config)
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(api_client)

        recipients = [{"email": email} for email in to_emails if email and "@" in email]
        if not recipients:
            return False

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=recipients,
            sender={"name": BREVO_SENDER_NAME, "email": BREVO_SENDER_EMAIL},
            subject=subject,
            html_content=html_content
        )

        api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Price alert email successfully dispatched to {len(recipients)} recipient(s).")
        return True

    except ApiException as e:
        logger.error(f"Brevo API exception while sending alert email: {e}")
        return False
    except Exception as ex:
        logger.error(f"Unexpected error sending alert email: {ex}")
        return False


def build_alert_html(
    our_title: str,
    our_asin: str,
    our_price: float,
    comp_title: str,
    comp_asin: str,
    comp_price: float,
    diff_pct: float,
    currency: str = "INR"
) -> str:
    """Generates an HTML email for competitor price drops."""
    curr_sym = "₹" if currency == "INR" else "$"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .header {{ background: #2563eb; color: #ffffff; padding: 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; }}
        .content {{ padding: 24px; color: #1e293b; }}
        .badge {{ display: inline-block; background: #fee2e2; color: #b91c1c; font-weight: 700; padding: 6px 12px; border-radius: 9999px; font-size: 14px; margin-bottom: 16px; }}
        .comparison-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .comparison-table th, .comparison-table td {{ padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }}
        .comparison-table th {{ background: #f1f5f9; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }}
        .our-row {{ background: #f8fafc; font-weight: 600; }}
        .comp-row {{ background: #fff1f2; font-weight: 600; color: #991b1b; }}
        .btn {{ display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 16px; }}
        .footer {{ background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🚨 Competitor Price Drop Alert</h1>
        </div>
        <div class="content">
          <div class="badge">Competitor is {diff_pct:.1f}% Cheaper</div>
          <p>A competitor has lowered their price below your configured alert threshold.</p>
          
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>ASIN</th>
                <th>Current Price</th>
              </tr>
            </thead>
            <tbody>
              <tr class="our-row">
                <td><strong>Your Product</strong><br><span style="font-size: 12px; color: #64748b;">{our_title[:50]}</span></td>
                <td>{our_asin}</td>
                <td>{curr_sym}{our_price:,.2f}</td>
              </tr>
              <tr class="comp-row">
                <td><strong>Competitor</strong><br><span style="font-size: 12px; color: #64748b;">{comp_title[:50]}</span></td>
                <td>{comp_asin}</td>
                <td>{curr_sym}{comp_price:,.2f}</td>
              </tr>
            </tbody>
          </table>

          <p>Difference: <strong>{curr_sym}{(our_price - comp_price):,.2f} ({diff_pct:.1f}% lower)</strong></p>
          
          <div style="text-align: center;">
            <a href="https://www.amazon.in/dp/{comp_asin}" class="btn" target="_blank">View Competitor on Amazon</a>
          </div>
        </div>
        <div class="footer">
          This automated alert was sent by Insydz Price Comparison Tracker. Manage your alert preferences in your dashboard.
        </div>
      </div>
    </body>
    </html>
    """


async def check_and_send_alerts(
    item: PctTrackedItem,
    our_snap: PctPriceSnapshot,
    comp_snap: PctPriceSnapshot,
    diff_pct: float,
    db: Session
) -> bool:
    """
    Evaluates and dispatches a price drop alert for a specific tracked item and competitor.
    Respects per-competitor alert toggles.
    """
    comp_asin = comp_snap.asin
    
    # 1. Per-competitor alert check: Ensure this competitor has alerts toggled ON
    if item.alert_competitor_asins is not None and len(item.alert_competitor_asins) > 0:
        if comp_asin not in item.alert_competitor_asins:
            logger.info(f"Alert skipped: competitor {comp_asin} is not in alert_competitor_asins for Tracker {item.id}")
            return False

    # 2. Resolve recipient email addresses (decrypted)
    recipients = []
    if item.alert_emails:
        for enc in item.alert_emails:
            try:
                dec = _decrypt_email(enc)
                if dec:
                    recipients.append(dec)
            except Exception:
                # If stored plaintext in testing
                recipients.append(enc)

    # Fallback to user account email if no explicit alert emails configured
    if not recipients:
        profile = db.query(UserProfile).filter(UserProfile.user_id == item.user_id).first()
        if profile and profile.email:
            recipients.append(profile.email)

    if not recipients:
        logger.warning(f"No valid recipient email found for User {item.user_id}; alert skipped.")
        return False

    our_price = float(our_snap.product_price) if our_snap.product_price else 0.0
    comp_price = float(comp_snap.product_price) if comp_snap.product_price else 0.0

    html = build_alert_html(
        our_title=our_snap.product_title or item.our_asin,
        our_asin=item.our_asin,
        our_price=our_price,
        comp_title=comp_snap.product_title or comp_asin,
        comp_asin=comp_asin,
        comp_price=comp_price,
        diff_pct=diff_pct,
        currency=our_snap.currency or "INR"
    )

    subject = f"Price Alert: Competitor {comp_asin} is {diff_pct:.1f}% cheaper than your ASIN {item.our_asin}"
    
    # Send email
    sent = _send_pct_email(recipients, subject, html)

    # 3. Audit Logging (Store encrypted recipient list in pct_alert_logs)
    enc_recipients = [_encrypt_email(r) for r in recipients]
    log_entry = PctAlertLog(
        tracker_id=item.id,
        user_id=item.user_id,
        trigger_asin=comp_asin,
        our_price=our_price,
        their_price=comp_price,
        diff_pct=diff_pct,
        email_sent_to=enc_recipients
    )
    db.add(log_entry)
    db.commit()

    return sent
