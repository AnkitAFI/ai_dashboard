from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema_v2 import AmazonAdsCredential, UserAuth
from app.api.deps import get_current_user
from app.core.config import settings
from app.services.rate_limiter import RateLimit
import httpx
import logging

router = APIRouter(prefix="/amazon-ads", tags=["Amazon Ads"])
logger = logging.getLogger(__name__)

# Amazon Ads API uses region-specific LWA endpoints.
# For India/APAC, it is apac.account.amazon.com
AMAZON_OAUTH_URL = "https://apac.account.amazon.com/ap/oa"
AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token" # Token endpoint is global
REDIRECT_URI = settings.AMAZON_LWA_REDIRECT_URI

from urllib.parse import urlencode

@router.get("/connect", dependencies=[Depends(RateLimit("default"))])
def get_lwa_url(current_user = Depends(get_current_user)):
    """Generate Login with Amazon URL."""
    params = {
        "client_id": settings.AMAZON_LWA_CLIENT_ID.strip(),
        "scope": "advertising::campaign_management",
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "state": str(current_user.id)
    }
    url = f"{AMAZON_OAUTH_URL}?{urlencode(params)}"
    return {"url": url}

@router.get("/callback", dependencies=[Depends(RateLimit("default"))])
async def lwa_callback(code: str, state: str, db: Session = Depends(get_db)):
    """Handle Amazon LWA callback."""
    # state contains the user_id from the connect request
    try:
        user_id = int(state)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    # Exchange code for token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            AMAZON_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.AMAZON_LWA_CLIENT_ID,
                "client_secret": settings.AMAZON_LWA_CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
    
    if response.status_code != 200:
        logger.error(f"Failed to get LWA token: {response.text}")
        raise HTTPException(status_code=400, detail="Failed to retrieve Amazon Ads token")
    
    data = response.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    
    # Save to db
    creds = db.query(AmazonAdsCredential).filter(AmazonAdsCredential.user_id == user_id).first()
    if not creds:
        creds = AmazonAdsCredential(user_id=user_id)
        db.add(creds)
        
    creds.refresh_token = refresh_token
    creds.access_token = access_token
    creds.sync_status = "SYNCING"
    
    db.commit()
    
    # Spawn background sync worker
    import subprocess
    import os
    import sys
    
    worker_script = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "scripts", "amazon_ads_sync_worker.py")
    if os.path.exists(worker_script):
        subprocess.Popen([sys.executable, worker_script, "--user_id", str(user_id)])
    
    # Redirect back to frontend
    from fastapi.responses import RedirectResponse
    # Redirect explicitly to the frontend server on port 3000
    frontend_url = "http://localhost:3000/seller/ads/setup?success=true"
    return RedirectResponse(url=frontend_url)

@router.get("/status", dependencies=[Depends(RateLimit("default"))])
def get_amazon_ads_status(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Check if the user has connected their Amazon Ads account."""
    creds = db.query(AmazonAdsCredential).filter(AmazonAdsCredential.user_id == current_user.id).first()
    return {
        "connected": bool(creds and creds.refresh_token),
        "sync_status": creds.sync_status if creds else "COMPLETED"
    }

@router.delete("/disconnect", dependencies=[Depends(RateLimit("default"))])
def disconnect_amazon_ads(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Disconnect and purge Amazon Ads credentials."""
    creds = db.query(AmazonAdsCredential).filter(AmazonAdsCredential.user_id == current_user.id).first()
    if creds:
        db.delete(creds)
        db.commit()
        return {"message": "Amazon Ads disconnected"}
    raise HTTPException(status_code=404, detail="No connected account found")
