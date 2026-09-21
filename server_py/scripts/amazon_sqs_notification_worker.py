"""
Amazon SQS Notification Worker — Hijacker & Buy Box Protection
===============================================================
This script is run every minute via cron (using flock to prevent overlap).
It long-polls the AWS SQS queue for Amazon ANY_OFFER_CHANGED notifications,
applies all user-defined filters, and saves alerts to the database.

Amazon SP-API Rate Limit Safety:
  - This worker makes ZERO calls to Amazon SP-API for monitoring.
  - Amazon pushes data to us via SQS. We receive it passively.
  - The ONLY Amazon interaction is receiving SQS messages from AWS
    (not from the SP-API endpoint), which has no rate limits that
    can get your developer keys suspended.

Multi-Tenancy Safety:
  - Every DB write includes both user_id AND selling_partner_id.
  - A seller's data can never be written to another seller's account.

DPDP / GDPR Compliance:
  - No PII is stored. Only ASINs, prices, and seller names (publicly
    visible on Amazon marketplace).
  - Competitor seller names are stored only for actionability.

Cron entry (add to production crontab):
  * * * * * /usr/bin/flock -n /tmp/sp_api_sqs.lock sh -c "cd /home/root-insydz/ai_dashboard/server_py && /home/root-insydz/ai_dashboard/venv/bin/python -m scripts.amazon_sqs_notification_worker" >> /home/root-insydz/ai_dashboard/server_py/sp_api_sqs.log 2>&1
"""

import os
import sys
import json
import logging
import asyncio
from decimal import Decimal, InvalidOperation
from typing import Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

from app.db.session import SessionLocal
from app.models.schema_v2 import (
    AmazonSPAPICredential,
    AmazonSPAPISettings,
    AmazonSPAPIHijackerAlert,
    AmazonSPAPIHijackerMonitoredASIN,
    UserSubscription,
)
from app.core.config import settings

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── AWS SQS Configuration ─────────────────────────────────────────────────────
SQS_QUEUE_URL = getattr(settings, "AMAZON_SQS_QUEUE_URL", None)
AWS_REGION = getattr(settings, "AWS_REGION", "ap-south-1")

# Batch size: Amazon SQS allows max 10 messages per receive call
SQS_BATCH_SIZE = 10
# Long polling: wait up to 20 seconds for a message (reduces empty poll API calls)
SQS_WAIT_SECONDS = 20

# ── Tier Constants ────────────────────────────────────────────────────────────
PREMIUM_ASIN_LIMIT = 20


# ── SQS Client ────────────────────────────────────────────────────────────────
def _get_sqs_client():
    """Create an SQS client using the existing AWS credentials from settings."""
    return boto3.client(
        "sqs",
        region_name=AWS_REGION,
        aws_access_key_id=getattr(settings, "AMAZON_SP_API_AWS_ACCESS_KEY", None),
        aws_secret_access_key=getattr(settings, "AMAZON_SP_API_AWS_SECRET_KEY", None),
    )


# ── Payload Parsing ───────────────────────────────────────────────────────────
def _parse_notification(sqs_body: str) -> Optional[dict]:
    """
    Parse the raw SQS message body into a structured dict.
    Amazon wraps the actual notification in an SNS envelope.
    Returns None if the message is malformed or not an offer change.
    """
    try:
        outer = json.loads(sqs_body)
        # SNS wraps the payload in a 'Message' string field
        if "Message" in outer:
            inner = json.loads(outer["Message"])
        else:
            inner = outer

        # Validate it is an ANY_OFFER_CHANGED notification
        notification_type = inner.get("notificationType", "")
        if notification_type != "ANY_OFFER_CHANGED":
            return None

        payload = inner.get("payload", {}).get("anyOfferChangedNotification", {})
        if not payload:
            return None

        return {
            "seller_id": inner.get("sellerId", ""),
            "asin": payload.get("offerChangeTrigger", {}).get("asin", ""),
            "marketplace_id": payload.get("offerChangeTrigger", {}).get("marketplaceId", ""),
            "offer_count": payload.get("offerChangeTrigger", {}).get("totalOfferCount", 1),
            "offers": payload.get("offers", []),
            "summary": payload.get("summary", {}),
        }
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        logger.warning(f"[SQS] Could not parse notification: {exc}")
        return None


def _detect_alert(parsed: dict, my_seller_id: str) -> Optional[dict]:
    """
    Apply the two hijacker detection rules:
      1. NEW_HIJACKER: offer_count > 1 (someone else is on the listing)
      2. LOST_BUY_BOX: the seller's offer does not have IsBuyBoxWinner=True

    Returns a dict with alert details, or None if no alert detected.
    """
    offers = parsed.get("offers", [])
    summary = parsed.get("summary", {})
    offer_count = parsed.get("offer_count", 1)

    my_offer = next(
        (o for o in offers if o.get("sellerId", "") == my_seller_id),
        None
    )

    # Extract my current price
    my_price = None
    if my_offer:
        listing_price = my_offer.get("listingPrice", {})
        try:
            my_price = Decimal(str(listing_price.get("amount", 0)))
        except InvalidOperation:
            my_price = None

    # Extract the best competitor (lowest price, NOT us)
    competitors = [o for o in offers if o.get("sellerId", "") != my_seller_id]
    best_competitor = None
    best_competitor_price = None

    for comp in competitors:
        try:
            price = Decimal(str(comp.get("listingPrice", {}).get("amount", 0)))
            if best_competitor_price is None or price < best_competitor_price:
                best_competitor_price = price
                best_competitor = comp
        except InvalidOperation:
            continue

    # Rule 1: New hijacker detected (more than 1 offer on listing)
    if offer_count > 1 and best_competitor:
        price_diff = None
        if my_price is not None and best_competitor_price is not None:
            price_diff = my_price - best_competitor_price

        return {
            "alert_type": "NEW_HIJACKER",
            "hijacker_seller_name": best_competitor.get("sellerFeedbackRating", {}).get("sellerName")
                or best_competitor.get("sellerId", "Unknown Seller"),
            "hijacker_price": best_competitor_price,
            "your_price": my_price,
            "price_difference": price_diff,
        }

    # Rule 2: Buy Box lost (we are not winning it)
    if my_offer and not my_offer.get("isBuyBoxWinner", False) and competitors:
        buy_box_winner = next(
            (o for o in offers if o.get("isBuyBoxWinner", False)),
            best_competitor
        )
        winner_price = None
        if buy_box_winner:
            try:
                winner_price = Decimal(str(buy_box_winner.get("listingPrice", {}).get("amount", 0)))
            except InvalidOperation:
                pass

        price_diff = None
        if my_price is not None and winner_price is not None:
            price_diff = my_price - winner_price

        return {
            "alert_type": "LOST_BUY_BOX",
            "hijacker_seller_name": buy_box_winner.get("sellerId", "Unknown Seller") if buy_box_winner else None,
            "hijacker_price": winner_price,
            "your_price": my_price,
            "price_difference": price_diff,
        }

    return None


# ── Main Processing Logic ─────────────────────────────────────────────────────
def _process_message(db, parsed: dict) -> bool:
    """
    Process a single parsed SQS notification.
    Returns True if an alert was saved, False if filtered/dropped.
    """
    seller_id = parsed.get("seller_id", "")
    asin = parsed.get("asin", "")

    if not seller_id or not asin:
        logger.warning("[SQS] Message missing seller_id or asin. Dropping.")
        return False

    # Step 1: Look up which platform user owns this seller account
    cred = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.selling_partner_id == seller_id
    ).first()

    if not cred:
        # This seller is not connected to any platform user — silently drop
        return False

    user_id = cred.user_id

    # Step 2: Verify user is still on Premium or Enterprise tier
    # This is the critical fallback check that ensures expired users get nothing
    sub = db.query(UserSubscription).filter(
        UserSubscription.user_id == user_id
    ).first()
    tier = sub.subscription_tier if sub else "free"

    if tier not in ("premium", "enterprise"):
        logger.info(f"[SQS] User {user_id} is on '{tier}' tier. Dropping message for {asin}.")
        return False

    # Step 3: ASIN Filter — Premium users can only monitor 20 selected ASINs
    if tier == "premium":
        is_monitored = db.query(AmazonSPAPIHijackerMonitoredASIN).filter(
            AmazonSPAPIHijackerMonitoredASIN.user_id == user_id,
            AmazonSPAPIHijackerMonitoredASIN.selling_partner_id == seller_id,
            AmazonSPAPIHijackerMonitoredASIN.asin == asin,
        ).first()

        if not is_monitored:
            # ASIN not in watchlist — silently drop to save DB writes
            return False

    # Step 4: Detect the alert type
    alert_data = _detect_alert(parsed, seller_id)
    if not alert_data:
        # No hijacker or buy box loss detected in this notification — normal event
        return False

    # Step 5: Load user's per-store alert settings
    store_settings = db.query(AmazonSPAPISettings).filter(
        AmazonSPAPISettings.user_id == user_id,
        AmazonSPAPISettings.selling_partner_id == seller_id,
    ).first()

    # Defaults if settings row doesn't exist yet
    alert_type_filter = (store_settings.hijacker_alert_type_filter or "BOTH") if store_settings else "BOTH"
    min_price_diff = Decimal(str(store_settings.hijacker_min_price_diff or 0)) if store_settings else Decimal("0")
    email_enabled = store_settings.hijacker_email_alerts_enabled if store_settings else True

    detected_type = alert_data["alert_type"]

    # Step 6: Alert Type Filter
    if alert_type_filter == "NEW_HIJACKER" and detected_type == "LOST_BUY_BOX":
        return False
    if alert_type_filter == "LOST_BUY_BOX" and detected_type == "NEW_HIJACKER":
        return False

    # Step 7: Minimum Price Difference Filter
    price_diff = alert_data.get("price_difference")
    if price_diff is not None and min_price_diff > 0:
        if price_diff < min_price_diff:
            # Hijacker is not cheap enough to trigger an alert
            return False

    # Step 8: Save the alert to the database
    new_alert = AmazonSPAPIHijackerAlert(
        user_id=user_id,
        selling_partner_id=seller_id,
        asin=asin,
        alert_type=detected_type,
        hijacker_seller_name=alert_data.get("hijacker_seller_name"),
        hijacker_price=alert_data.get("hijacker_price"),
        your_price=alert_data.get("your_price"),
        price_difference=price_diff,
        is_resolved=False,
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    logger.info(
        f"[SQS] ALERT SAVED: user={user_id}, seller={seller_id}, "
        f"asin={asin}, type={detected_type}"
    )

    # Step 9: Email Notification (via Brevo)
    # Only fires if the user has email alerts enabled
    if email_enabled:
        try:
            _send_hijacker_email(
                user_id=user_id,
                asin=asin,
                alert_type=detected_type,
                hijacker_price=alert_data.get("hijacker_price"),
                your_price=alert_data.get("your_price"),
                price_diff=price_diff,
                hijacker_name=alert_data.get("hijacker_seller_name"),
            )
        except Exception as email_exc:
            # Never let email failure block alert processing
            logger.error(f"[SQS] Non-fatal: Email send failed for user {user_id}: {email_exc}")

    return True


def _send_hijacker_email(
    user_id: int,
    asin: str,
    alert_type: str,
    hijacker_price,
    your_price,
    price_diff,
    hijacker_name: Optional[str],
):
    """
    Send a hijacker alert email via Brevo (SendinBlue).
    Imports brevo_service lazily so the worker can run without it if not configured.
    """
    try:
        from app.services.brevo_service import send_transactional_email  # noqa: local import
    except ImportError:
        logger.warning("[SQS] brevo_service not found. Skipping email notification.")
        return

    if alert_type == "NEW_HIJACKER":
        subject = f"🚨 Intruder Alert on Your Listing: {asin}"
        body = (
            f"A new seller has joined your product listing (ASIN: {asin}).\n\n"
            f"Intruder's Price: ₹{hijacker_price}\n"
            f"Your Price: ₹{your_price}\n"
            f"Price Difference: ₹{price_diff}\n\n"
            "Log in to your dashboard to take action now."
        )
    else:  # LOST_BUY_BOX
        subject = f"⚠️ You Lost the Buy Box: {asin}"
        body = (
            f"You have lost the 'Add to Cart' button on product (ASIN: {asin}).\n\n"
            f"Competitor's Price: ₹{hijacker_price}\n"
            f"Your Price: ₹{your_price}\n"
            f"Price Difference: ₹{price_diff}\n\n"
            "Lower your price by ₹1 to win it back. Log in to your dashboard now."
        )

    send_transactional_email(
        user_id=user_id,
        subject=subject,
        body=body,
        tags=["hijacker_alert", alert_type.lower()],
    )
    logger.info(f"[SQS] Email sent to user {user_id} for {alert_type} on {asin}")


# ── Main Entry Point ──────────────────────────────────────────────────────────
def main():
    if not SQS_QUEUE_URL:
        logger.error("[SQS] AMAZON_SQS_QUEUE_URL is not configured in settings. Worker exiting.")
        return

    logger.info("[SQS] Starting Hijacker Notification Worker...")

    try:
        sqs = _get_sqs_client()
    except NoCredentialsError:
        logger.error("[SQS] AWS credentials not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.")
        return

    # Receive up to 10 messages per cycle using long polling (20s wait)
    # Long polling means if the queue is empty, we hold the connection for up to
    # 20 seconds before returning — this drastically reduces empty-poll API calls
    # and keeps us comfortably within the 1,000,000 free tier requests/month.
    try:
        response = sqs.receive_message(
            QueueUrl=SQS_QUEUE_URL,
            MaxNumberOfMessages=SQS_BATCH_SIZE,
            WaitTimeSeconds=SQS_WAIT_SECONDS,
            AttributeNames=["All"],
        )
    except ClientError as exc:
        logger.error(f"[SQS] Failed to receive messages: {exc}")
        return

    messages = response.get("Messages", [])

    if not messages:
        logger.info("[SQS] Queue is empty. No alerts to process.")
        return

    logger.info(f"[SQS] Received {len(messages)} message(s). Processing...")

    db = SessionLocal()
    processed_receipts = []

    try:
        for msg in messages:
            receipt_handle = msg.get("ReceiptHandle", "")
            body = msg.get("Body", "")

            try:
                parsed = _parse_notification(body)
                if parsed is None:
                    # Not an offer change notification — delete from queue
                    processed_receipts.append(receipt_handle)
                    continue

                _process_message(db, parsed)
                # Always delete successfully processed messages
                processed_receipts.append(receipt_handle)

            except Exception as msg_exc:
                logger.error(f"[SQS] Error processing message: {msg_exc}", exc_info=True)
                # Do NOT delete — let it retry (SQS will make it visible again)

    finally:
        db.close()

    # Batch delete all successfully processed messages from SQS
    if processed_receipts:
        for i in range(0, len(processed_receipts), 10):
            batch = processed_receipts[i:i + 10]
            entries = [
                {"Id": str(idx), "ReceiptHandle": rh}
                for idx, rh in enumerate(batch)
            ]
            try:
                sqs.delete_message_batch(QueueUrl=SQS_QUEUE_URL, Entries=entries)
            except ClientError as del_exc:
                logger.error(f"[SQS] Failed to delete message batch: {del_exc}")

    logger.info(f"[SQS] Worker completed. Processed {len(processed_receipts)} message(s).")


if __name__ == "__main__":
    main()
