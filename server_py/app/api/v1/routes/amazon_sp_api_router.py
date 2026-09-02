from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema_v2 import AmazonSPAPICredential, UserAuth, UserSubscription
from app.api.deps import get_current_user
from app.core.config import settings
from app.services.rate_limiter import SPAPIRateLimit
import httpx
import logging
from urllib.parse import urlencode
from typing import Optional
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/amazon-sp-api", tags=["Amazon SP-API"])
logger = logging.getLogger(__name__)

# SP-API endpoints for India (EU region endpoints handle IN)
# Developer initiated authorization for IN requires the EU endpoint
AMAZON_OAUTH_URL = "https://eu.account.amazon.com/ap/oa"
AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
REDIRECT_URI = settings.AMAZON_SP_API_LWA_REDIRECT_URI

@router.get("/connect", dependencies=[Depends(SPAPIRateLimit("auth", tokens=1))])
def get_sp_api_url(current_user = Depends(get_current_user)):
    """Generate Login with Amazon URL for SP-API."""
    params = {
        "client_id": settings.AMAZON_SP_API_LWA_CLIENT_ID.strip(),
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
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
        frontend_url = f"{settings.FRONTEND_URL}/seller/store/setup?error=access_denied"
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
    
    # Redirect back to the frontend dashboard
    frontend_url = f"{settings.FRONTEND_URL}/seller/store"
    return RedirectResponse(url=frontend_url)

@router.get("/status", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
def get_sp_api_status(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Check if the user has connected their Amazon SP-API account(s)."""
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

@router.delete("/disconnect/{selling_partner_id}", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
def disconnect_sp_api(selling_partner_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Disconnect and purge Amazon SP-API credentials."""
    creds = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id,
        AmazonSPAPICredential.selling_partner_id == selling_partner_id
    ).first()
    
    if creds:
        db.delete(creds)
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Account not found")
