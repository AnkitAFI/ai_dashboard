from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema_v2 import (
    AmazonSPAPICredential, UserAuth, UserSubscription,
    AmazonSPAPIHijackerAlert, AmazonSPAPIHijackerMonitoredASIN,
)
from app.api.deps import get_current_user
from app.core.config import settings
from app.services.rate_limiter import SPAPIRateLimit
import httpx
import asyncio
import logging
import time
from urllib.parse import urlencode
from typing import Optional
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/amazon-sp-api", tags=["Amazon SP-API"])
logger = logging.getLogger(__name__)

# SP-API endpoints for India (EU region endpoints handle IN)
AMAZON_OAUTH_URL = "https://sellercentral.amazon.in/apps/authorize/consent"
AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
SP_API_ENDPOINT = "https://sellingpartnerapi-eu.amazon.com"
MARKETPLACE_ID_IN = "A21TJRUUN4KGV"
REDIRECT_URI = settings.AMAZON_SP_API_LWA_REDIRECT_URI


async def _get_access_token(refresh_token: str) -> str:
    """Exchange a refresh token for a short-lived access token."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            AMAZON_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.AMAZON_SP_API_LWA_CLIENT_ID,
                "client_secret": settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        return response.json()["access_token"]


async def _call_create_subscription(access_token: str, selling_partner_id: str) -> bool:
    """
    Calls SP-API CreateSubscription for ANY_OFFER_CHANGED notifications.
    This tells Amazon to push price change events to our SQS queue.
    SP-API Notifications API rate limit: 1 req/sec, burst 5.
    We use exponential backoff with jitter to absorb 429s safely.
    """
    url = f"{SP_API_ENDPOINT}/notifications/v1/subscriptions/ANY_OFFER_CHANGED"
    headers = {
        "x-amz-access-token": access_token,
        "Content-Type": "application/json",
    }
    body = {
        "payloadVersion": "1.0",
        "destinationId": settings.AMAZON_SQS_DESTINATION_ID,
    }

    max_retries = 4
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=body, headers=headers)

            if response.status_code in (200, 201):
                logger.info(f"[HIJACKER] CreateSubscription SUCCESS for seller {selling_partner_id}")
                return True

            if response.status_code == 409:
                # Subscription already exists — this is fine, treat as success
                logger.info(f"[HIJACKER] Subscription already exists for seller {selling_partner_id}")
                return True

            if response.status_code == 429:
                # Rate limited — wait with exponential backoff + jitter
                wait_sec = (2 ** attempt) + (0.5 * attempt)
                logger.warning(f"[HIJACKER] CreateSubscription rate limited. Retrying in {wait_sec:.1f}s (attempt {attempt+1}/{max_retries})")
                await asyncio.sleep(wait_sec)
                continue

            logger.error(f"[HIJACKER] CreateSubscription failed [{response.status_code}]: {response.text}")
            return False

        except Exception as exc:
            logger.error(f"[HIJACKER] CreateSubscription exception on attempt {attempt+1}: {exc}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)

    return False


async def _call_delete_subscription(refresh_token: str, selling_partner_id: str) -> bool:
    """
    Calls SP-API DeleteSubscription to stop Amazon from sending SQS notifications.
    Called on store disconnect or subscription downgrade.
    """
    try:
        access_token = await _get_access_token(refresh_token)
        url = f"{SP_API_ENDPOINT}/notifications/v1/subscriptions/ANY_OFFER_CHANGED"
        headers = {"x-amz-access-token": access_token}
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.delete(url, headers=headers)
        if response.status_code in (200, 204, 404):
            # 404 means subscription didn't exist — still a success from our perspective
            logger.info(f"[HIJACKER] DeleteSubscription SUCCESS for seller {selling_partner_id}")
            return True
        logger.warning(f"[HIJACKER] DeleteSubscription returned {response.status_code} for seller {selling_partner_id}")
        return False
    except Exception as exc:
        logger.error(f"[HIJACKER] DeleteSubscription exception for seller {selling_partner_id}: {exc}")
        return False


@router.get("/connect")
def get_sp_api_url(current_user = Depends(get_current_user)):
    """Generate Login with Amazon URL for SP-API. Pure URL builder — no Amazon API call."""
    params = {
        "application_id": settings.AMAZON_SP_API_APP_ID.strip(),
        "state": str(current_user.id),
        "version": "beta"
    }
    url = f"{AMAZON_OAUTH_URL}?{urlencode(params)}"
    return {"url": url}

@router.get("/callback", dependencies=[Depends(SPAPIRateLimit("auth", tokens=1))])
async def sp_api_callback(
    state: str,
    spapi_oauth_code: Optional[str] = None, 
    selling_partner_id: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Handle Amazon SP-API LWA callback."""
    # state contains the user_id from the connect request
    try:
        user_id = int(state)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
        
    if error or not spapi_oauth_code:
        logger.warning(f"Amazon SP-API Auth Cancelled or Failed: {error} - {error_description}")
        # Redirect to store page (not /seller/store/setup which doesn't exist)
        frontend_url = f"{settings.FRONTEND_URL}/seller/store?error=access_denied"
        return RedirectResponse(url=frontend_url)

    # Exchange code for token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            AMAZON_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": spapi_oauth_code,
                "client_id": settings.AMAZON_SP_API_LWA_CLIENT_ID,
                "client_secret": settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
    
    if response.status_code != 200:
        logger.error(f"Failed to get SP-API token: {response.text}")
        raise HTTPException(status_code=400, detail="Failed to retrieve Amazon SP-API token")
    
    data = response.json()
    refresh_token = data.get("refresh_token")
    
    # Save to db
    # Ensure they aren't over their limit
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == user_id).first()
    max_accounts = sub.max_sp_api_accounts if sub else 1
    
    current_accounts_count = db.query(AmazonSPAPICredential).filter(AmazonSPAPICredential.user_id == user_id).count()

    # Check if this exact store is already connected
    creds = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == user_id,
        AmazonSPAPICredential.selling_partner_id == selling_partner_id
    ).first()
    
    if not creds:
        if current_accounts_count >= max_accounts:
            logger.warning(f"User {user_id} hit SP-API account limit ({max_accounts}).")
            frontend_url = f"{settings.FRONTEND_URL}/seller/store?error=limit_reached"
            return RedirectResponse(url=frontend_url)
            
        creds = AmazonSPAPICredential(user_id=user_id)
        db.add(creds)
        
    creds.refresh_token = refresh_token
    creds.selling_partner_id = selling_partner_id
    creds.sync_status = "PENDING"
    creds.region = "IN" # Focused on India as requested
    
    db.commit()

    # ── Hijacker Feature: Activate SQS subscription for Premium/Enterprise users ──
    # Only create a subscription if the user is on a qualifying tier AND
    # we have a valid SQS destination configured in settings.
    # This is the ONLY Amazon API call in this route — it is fire-and-forget
    # and uses exponential backoff, so a 429 will never crash the OAuth flow.
    if sub and sub.subscription_tier in ("premium", "enterprise") and getattr(settings, "AMAZON_SQS_DESTINATION_ID", None):
        try:
            fresh_token = await _get_access_token(refresh_token)
            await _call_create_subscription(fresh_token, selling_partner_id)
        except Exception as sub_exc:
            # Never block the user's store connection because of a subscription error
            logger.error(f"[HIJACKER] Non-fatal: Could not create SQS subscription for user {user_id}: {sub_exc}")

    # Redirect to Amazon Store Setup page so user sees their connected store
    frontend_url = f"{settings.FRONTEND_URL}/seller/store?connected=true"
    return RedirectResponse(url=frontend_url)


@router.get("/status")
def get_sp_api_status(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Check if the user has connected their Amazon SP-API account(s).
    Pure PostgreSQL read — no Amazon API call. No SPAPIRateLimit needed.
    Called on every page load by Financial Command Center, Store Integration,
    and Lost Money Recovery — must not be throttled aggressively.
    """
    creds = db.query(AmazonSPAPICredential).filter(AmazonSPAPICredential.user_id == current_user.id).all()
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == current_user.id).first()
    max_accounts = sub.max_sp_api_accounts if sub else 1
    
    if not creds:
        return {"connected": False, "accounts": [], "max_accounts": max_accounts, "can_add_more": True}
    
    accounts = []
    for c in creds:
        accounts.append({
            "region": c.region,
            "sync_status": c.sync_status,
            "selling_partner_id": c.selling_partner_id
        })
    
    return {
        "connected": True,
        "accounts": accounts,
        "max_accounts": max_accounts,
        "can_add_more": len(accounts) < max_accounts
    }

@router.delete("/disconnect/{selling_partner_id}")
async def disconnect_sp_api(selling_partner_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Disconnect and purge Amazon SP-API credentials.
    Before deleting credentials:
      1. Calls Amazon DeleteSubscription to stop SQS notifications immediately.
      2. Purges all hijacker alerts and monitored ASINs for this store (DPDP/GDPR).
      3. Deletes the credential record.
    """
    creds = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id,
        AmazonSPAPICredential.selling_partner_id == selling_partner_id
    ).first()

    if not creds:
        raise HTTPException(status_code=404, detail="Account not found")

    # Step 1: Tell Amazon to stop pushing SQS messages for this seller
    # Fire-and-forget — do NOT block the disconnect even if this call fails
    try:
        await _call_delete_subscription(creds.refresh_token, selling_partner_id)
    except Exception as exc:
        logger.error(f"[HIJACKER] Non-fatal: DeleteSubscription failed during disconnect for seller {selling_partner_id}: {exc}")

    # Step 2: Purge hijacker data for this store (DPDP / GDPR compliance)
    db.query(AmazonSPAPIHijackerAlert).filter(
        AmazonSPAPIHijackerAlert.user_id == current_user.id,
        AmazonSPAPIHijackerAlert.selling_partner_id == selling_partner_id,
    ).delete(synchronize_session=False)

    db.query(AmazonSPAPIHijackerMonitoredASIN).filter(
        AmazonSPAPIHijackerMonitoredASIN.user_id == current_user.id,
        AmazonSPAPIHijackerMonitoredASIN.selling_partner_id == selling_partner_id,
    ).delete(synchronize_session=False)

    # Step 3: Delete the credential itself
    db.delete(creds)
    db.commit()

    logger.info(f"[DISCONNECT] User {current_user.id} fully disconnected store {selling_partner_id}. All hijacker data purged.")
    return {"status": "success"}

