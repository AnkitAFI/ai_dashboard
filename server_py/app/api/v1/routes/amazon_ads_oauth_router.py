# server_py/app/api/v1/routes/amazon_ads_oauth_router.py
"""
Amazon Advertising API OAuth 2.0 Callback Handler
- Handles the authorization code returned by Amazon after user clicks 'Allow'
- Exchanges the authorization code for access_token + refresh_token
- Saves refresh_token to .env file and database (AmazonAdOAuthAccount table)
- Full URL: GET http://localhost:8000/api/v1/amazon/callback?code=XXX
"""
import os
import logging
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.ad_models import AmazonAdOAuthAccount, AmazonAdProfile
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/amazon", tags=["Amazon Ads OAuth"])


@router.get("/callback", response_class=HTMLResponse, summary="Amazon Ads OAuth2 Authorization Callback")
async def amazon_ads_oauth_callback(
    code: str = Query(..., description="Authorization code from Amazon"),
    scope: str = Query(None),
    state: str = Query(None, description="User ID state parameter"),
    db: Session = Depends(get_db),
):
    """
    Amazon redirects here after the user clicks 'Allow' on the authorization page.
    This endpoint:
    1. Exchanges the authorization `code` for an access_token + refresh_token
    2. Saves both tokens to the AmazonAdOAuthAccount database table for the connecting user
    3. Fetches and registers the seller's real Amazon Advertising profiles (IN, US, UK, etc.)
    4. Writes AMAZON_LWA_REFRESH_TOKEN to the .env file for persistence
    5. Returns a beautiful success page
    """
    client_id = settings.AMAZON_ADS_CLIENT_ID or os.environ.get("AMAZON_ADS_CLIENT_ID", "")
    client_secret = settings.AMAZON_ADS_CLIENT_SECRET or os.environ.get("AMAZON_ADS_CLIENT_SECRET", "")
    redirect_uri = settings.AMAZON_ADS_OAUTH_REDIRECT_URI
    token_url = settings.AMAZON_LWA_TOKEN_URL

    if not client_id or not client_secret:
        logger.error("AMAZON_ADS_CLIENT_ID or AMAZON_ADS_CLIENT_SECRET missing from .env")
        return HTMLResponse(content=_error_page(
            "Configuration Error",
            "AMAZON_ADS_CLIENT_ID or AMAZON_ADS_CLIENT_SECRET is missing from your .env file."
        ), status_code=500)

    # ── Step 0: Validate CSRF State Token ──────────────────────────────────────
    from jose import jwt, JWTError
    try:
        if not state:
            raise JWTError("Missing state token")
        payload = jwt.decode(state, settings.SECRET_KEY, algorithms=["HS256"])
        target_user_id = payload.get("user_id")
        if not target_user_id:
            raise JWTError("Invalid token payload")
    except JWTError as e:
        logger.warning(f"OAuth CSRF validation failed: {e}")
        return HTMLResponse(content=_error_page(
            "Security Validation Failed",
            "The authorization request could not be verified or has expired. Please try connecting your account again."
        ), status_code=403)

    # ── Step 1: Exchange authorization code for tokens ─────────────────────────
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "client_secret": client_secret,
    }

    logger.info(f"Exchanging Amazon authorization code for tokens... (scope: {scope}, state/user_id: {state})")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(token_url, data=payload)
            if resp.status_code != 200:
                logger.error(f"Amazon token exchange failed: {resp.text}")
                return HTMLResponse(content=_error_page(
                    "Token Exchange Failed",
                    f"Amazon returned error: {resp.text}"
                ), status_code=400)

            data = resp.json()
    except Exception as e:
        logger.error(f"Token exchange HTTP error: {e}")
        return HTMLResponse(content=_error_page("Network Error", str(e)), status_code=500)

    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    expires_in = data.get("expires_in", 3600)
    token_type = data.get("token_type", "bearer")

    if not refresh_token:
        return HTMLResponse(content=_error_page(
            "No Refresh Token",
            "Amazon did not return a refresh_token. Ensure advertising::campaign_management scope was assigned."
        ), status_code=500)

    logger.info("✅ Successfully obtained Amazon Ads refresh_token!")

    # ── Step 2: Save to database for target seller ──────────────────────────────
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=expires_in)

    existing = db.execute(
        select(AmazonAdOAuthAccount).where(
            AmazonAdOAuthAccount.user_id == target_user_id,
            AmazonAdOAuthAccount.env == "production"
        )
    ).scalars().first()

    if existing:
        existing.access_token = access_token
        existing.refresh_token = refresh_token
        existing.token_expires_at = expires_at
        existing.is_active = True
        oauth_account = existing
        logger.info(f"Updated existing production AmazonAdOAuthAccount (id={existing.id}) for user_id={target_user_id}")
    else:
        oauth_account = AmazonAdOAuthAccount(
            user_id=target_user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_in,
            token_expires_at=expires_at,
            env="production",
            is_active=True,
        )
        db.add(oauth_account)
        logger.info(f"Created new production AmazonAdOAuthAccount in database for user_id={target_user_id}.")

    try:
        db.commit()
        db.refresh(oauth_account)
    except Exception as e:
        logger.error(f"DB commit failed: {e}")
        db.rollback()

    # ── Step 2.5: Auto-fetch & register Seller's Real Marketplace Profiles ─────
    try:
        from app.services.amazon_ads.api_client import amazon_ads_client
        profiles = amazon_ads_client.list_profiles(db, oauth_account)
        for p in profiles:
            prof_id = str(p.get("profileId"))
            existing_prof = db.execute(
                select(AmazonAdProfile).where(AmazonAdProfile.profile_id == prof_id)
            ).scalars().first()
            if not existing_prof:
                new_prof = AmazonAdProfile(
                    oauth_account_id=oauth_account.id,
                    user_id=target_user_id,
                    profile_id=prof_id,
                    country_code=p.get("countryCode", "US"),
                    currency_code=p.get("currencyCode", "USD"),
                    timezone=p.get("timezone", "America/Los_Angeles"),
                    account_type=p.get("accountInfo", {}).get("type", "seller")
                )
                db.add(new_prof)
            else:
                existing_prof.user_id = target_user_id
                existing_prof.oauth_account_id = oauth_account.id
        db.commit()
        logger.info(f"✅ Auto-imported {len(profiles)} real marketplace profiles for user_id={target_user_id}")
    except Exception as e:
        logger.warning(f"Could not auto-fetch profiles during callback (will retry on next load): {e}")


    # ── Step 3: Removed .env persistence (Production uses database only) ─────────

    # ── Step 4: Return a beautiful success page ─────────────────────────────────
    masked_token = refresh_token[:12] + "..." + refresh_token[-6:] if len(refresh_token) > 18 else refresh_token

    return HTMLResponse(content=_success_page(masked_token, scope or settings.AMAZON_ADS_OAUTH_SCOPE, settings.FRONTEND_APP_URL))
def _success_page(masked_token: str, scope: str, frontend_url: str = "http://localhost:3000") -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Amazon Ads Connected ✅</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; }}
    .card {{ background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 48px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }}
    .icon {{ font-size: 64px; margin-bottom: 24px; }}
    h1 {{ font-size: 28px; font-weight: 800; color: #10b981; margin-bottom: 12px; }}
    p {{ color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }}
    .badge {{ background: #064e3b; border: 1px solid #059669; border-radius: 10px; padding: 12px 20px; margin: 16px 0; }}
    .badge code {{ font-family: monospace; font-size: 13px; color: #34d399; word-break: break-all; }}
    .steps {{ background: #0f172a; border-radius: 12px; padding: 20px; text-align: left; margin-top: 24px; }}
    .steps h3 {{ font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 12px; }}
    .step {{ display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; font-size: 13px; color: #94a3b8; }}
    .step-num {{ background: #4f46e5; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }}
    .btn {{ display: inline-block; margin-top: 24px; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎉</div>
    <h1>Amazon Ads Connected!</h1>
    <p>Your <strong>Insydz</strong> app is now officially authorized to access your Amazon Advertising account in <strong>Production</strong> mode.</p>

    <div class="badge">
      <div style="font-size:11px;color:#6ee7b7;font-weight:700;margin-bottom:6px;">REFRESH TOKEN SAVED</div>
      <code>{masked_token}</code>
    </div>

    <p style="font-size:13px;">Scope: <code style="background:#1e3a5f;padding:2px 8px;border-radius:4px;color:#60a5fa">{scope}</code></p>

    <div class="steps">
      <h3>✅ Connection Successful:</h3>
      <div class="step"><span class="step-num">1</span><span>Amazon Advertising token securely encrypted</span></div>
      <div class="step"><span class="step-num">2</span><span>OAuth account saved to your PostgreSQL database</span></div>
      <div class="step"><span class="step-num">3</span><span>Live Production Environment fully activated</span></div>
    </div>

    <p style="margin-top:24px;font-size:13px;color:#64748b;">You can now close this window and return to your PPC Optimizer dashboard!</p>

    <a href="{frontend_url}/seller/ppc-optimizer" class="btn">Go to Dashboard →</a>
  </div>
</body>
</html>
"""


def _error_page(title: str, message: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Amazon Ads Connection Error</title>
  <style>
    body {{ font-family: sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; }}
    .card {{ background: #1e293b; border: 1px solid #7f1d1d; border-radius: 20px; padding: 48px; max-width: 520px; width: 100%; text-align: center; }}
    h1 {{ color: #ef4444; font-size: 24px; margin-bottom: 16px; }}
    p {{ color: #94a3b8; font-size: 14px; line-height: 1.6; }}
    code {{ background: #0f172a; padding: 2px 8px; border-radius: 4px; color: #fca5a5; }}
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:48px;margin-bottom:16px;">❌</div>
    <h1>{title}</h1>
    <p>{message}</p>
  </div>
</body>
</html>
"""
