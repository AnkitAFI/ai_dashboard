import os
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

from app.models.pct_models import PctTrackedItem, PctPriceSnapshot, PctAlertLog
from app.models.schema_v2 import UserProfile, UserSubscription
from app.services import pct_quota_service
from app.core.cryptography import EncryptedString

logger = logging.getLogger(__name__)

# Brevo Configuration
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@insydz.com")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Insydz")

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
    """Generates a clean, seller-friendly HTML email for competitor price drops."""
    curr_sym = "₹" if currency == "INR" else "$"
    gap_amount = max(0.0, our_price - comp_price)
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .header {{ background: #1e40af; color: #ffffff; padding: 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }}
        .content {{ padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.5; }}
        .badge {{ display: inline-block; background: #fee2e2; color: #b91c1c; font-weight: 700; padding: 6px 14px; border-radius: 9999px; font-size: 13px; margin-bottom: 16px; border: 1px solid #fecaca; }}
        .comparison-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .comparison-table th, .comparison-table td {{ padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }}
        .comparison-table th {{ background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }}
        .our-row {{ background: #ffffff; font-weight: 500; }}
        .comp-row {{ background: #fff5f5; font-weight: 600; color: #991b1b; }}
        .tip-box {{ margin-top: 20px; padding: 14px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; font-size: 13px; color: #166534; }}
        .footer {{ background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🚨 Competitor Price Drop Alert</h1>
        </div>
        <div class="content">
          <div class="badge">Competitor is {diff_pct:.1f}% Cheaper</div>
          <p style="margin: 0 0 16px 0;">A competitor on Amazon India has dropped their price and is now priced lower than your product.</p>
          
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Product Code</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr class="our-row">
                <td>
                  <strong>Your Product</strong><br>
                  <span style="font-size: 12px; color: #64748b;">{our_title[:60]}</span>
                </td>
                <td style="font-family: monospace; font-size: 12px;">{our_asin}</td>
                <td style="font-size: 15px; font-weight: 700;">{curr_sym}{our_price:,.2f}</td>
              </tr>
              <tr class="comp-row">
                <td>
                  <strong>Competitor Product</strong><br>
                  <span style="font-size: 12px; color: #991b1b;">{comp_title[:60]}</span>
                </td>
                <td style="font-family: monospace; font-size: 12px;">{comp_asin}</td>
                <td style="font-size: 15px; font-weight: 700; color: #dc2626;">{curr_sym}{comp_price:,.2f}</td>
              </tr>
            </tbody>
          </table>

          <div style="background: #f8fafc; padding: 12px 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px;">
            <strong>Price Gap:</strong> The competitor is <strong>{curr_sym}{gap_amount:,.2f}</strong> cheaper ({diff_pct:.1f}% lower than your price).
          </div>

          <div class="tip-box">
            💡 <strong>Recommended Action:</strong> Check your current listing on Amazon Seller Central. You may want to review your pricing or activate a promotional coupon to stay competitive.
          </div>
        </div>
        <div class="footer">
          You received this message because price drop alerts are turned on for this product. You can update or pause your alert preferences anytime from your Insydz dashboard.
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
    
    # 1. Master and per-competitor alert check:
    if not item.alert_enabled:
        logger.info(f"Alert skipped: Tracker {item.id} alert_enabled is False")
        return False

    active_alert_asins = item.alert_competitor_asins if item.alert_competitor_asins is not None else []
    if comp_asin not in active_alert_asins:
        logger.info(f"Alert skipped: competitor {comp_asin} is not in alert_competitor_asins for Tracker {item.id}")
        return False

    # 2. Unified Credit Balance Check:
    # Alert delivery draws from the exact same credit pool (plan quota + wallet) as data fetching/refreshing
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == item.user_id).first()
    tier = (sub.subscription_tier or "starter").lower() if sub else "starter"

    can_proceed, credit_source = pct_quota_service.can_fetch(item.user_id, tier, db)
    if not can_proceed:
        logger.warning(
            f"Alert delivery skipped for Tracker {item.id} (User {item.user_id}): "
            f"Insufficient credits. Both monthly plan quota and wallet balance are 0."
        )
        return False

    # 3. Resolve recipient email addresses (decrypted)
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

    product_name = (our_snap.product_title or f"Product {item.our_asin}").strip()
    short_name = (product_name[:35] + "...") if len(product_name) > 38 else product_name
    curr_sym = "₹" if (our_snap.currency or "INR") == "INR" else "$"
    subject = f"Price Drop Alert: Competitor is {diff_pct:.0f}% cheaper on {short_name} ({curr_sym}{comp_price:,.0f})"
    
    # 4. Dispatch Email
    sent = _send_pct_email(recipients, subject, html)

    # 5. Deduct 1 credit from the exact same pool upon successful delivery
    if sent and credit_source:
        pct_quota_service.deduct_credit(
            user_id=item.user_id,
            source=credit_source,
            db=db,
            description=f"Price drop alert sent for {item.our_asin}"
        )
        logger.info(f"Deducted 1 credit from '{credit_source}' for User {item.user_id} upon alert delivery.")

    # 6. Audit Logging (Store encrypted recipient list in pct_alert_logs)
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
