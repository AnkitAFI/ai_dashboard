from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os
import httpx

from app.db.session import get_db
from app.api.deps import get_current_user_id
from app.models.listing_models import UserApiCredential

router = APIRouter(prefix="/integrations", tags=["Integrations"])

class CredentialUpsertRequest(BaseModel):
    platform: str
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    refresh_token: Optional[str] = None

class CredentialResponse(BaseModel):
    id: int
    platform: str
    is_active: bool
    # We do NOT return the client_secret or refresh_token for security reasons.
    # The client_id is usually safe to return, but let's just return what's necessary.
    has_keys: bool 

@router.get("/credentials", response_model=List[CredentialResponse])
def get_user_credentials(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Returns a masked list of platforms the user has connected.
    """
    creds = db.query(UserApiCredential).filter(UserApiCredential.user_id == user_id).all()
    
    result = []
    for cred in creds:
        result.append(CredentialResponse(
            id=cred.id,
            platform=cred.platform,
            is_active=cred.is_active,
            has_keys=bool(cred.refresh_token)
        ))
    return result

@router.get("/amazon/authorize")
def authorize_amazon(user_id: str = Depends(get_current_user_id)):
    """
    Redirects the user to the Amazon LWA authorization page.
    """
    client_id = os.environ.get("AMAZON_OAUTH_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="Master Amazon App is not configured.")
        
    # State parameter securely passes the user ID through the OAuth flow to the callback
    # In a real prod app, you should sign this state to prevent CSRF, but for now we just pass user_id
    redirect_uri = "https://insydz.com/api/v1/integrations/amazon/callback"
    amazon_auth_url = (
        f"https://sellercentral.amazon.in/apps/authorize/consent?"
        f"application_id={client_id}&state={user_id}&version=beta"
    )
    return RedirectResponse(url=amazon_auth_url)

@router.get("/amazon/callback")
async def callback_amazon(
    spapi_oauth_code: str = Query(...), 
    state: str = Query(...), # This is our user_id
    db: Session = Depends(get_db)
):
    """
    Amazon redirects here after the user approves the app.
    We exchange the spapi_oauth_code for a permanent Refresh Token.
    """
    user_id = state
    client_id = os.environ.get("AMAZON_OAUTH_CLIENT_ID")
    client_secret = os.environ.get("AMAZON_OAUTH_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Master Amazon OAuth keys are not configured.")
    
    # Exchange code for token
    token_url = "https://api.amazon.com/auth/o2/token"
    payload = {
        "grant_type": "authorization_code",
        "code": spapi_oauth_code,
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=payload)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange Amazon token. Invalid code or client credentials.")
        data = response.json()
        refresh_token = data.get("refresh_token")
        
        if not refresh_token:
            raise HTTPException(status_code=500, detail="Amazon did not return a refresh token.")
            
    # Upsert to database (it will be encrypted by the EncryptedString model)
    cred = db.query(UserApiCredential).filter(
        UserApiCredential.user_id == user_id,
        UserApiCredential.platform == "amazon"
    ).first()
    
    if cred:
        cred.refresh_token = refresh_token
    else:
        cred = UserApiCredential(
            user_id=user_id,
            platform="amazon",
            refresh_token=refresh_token
        )
        db.add(cred)
        
    db.commit()
    
    # Redirect back to the dashboard settings page with success
    return RedirectResponse(url="/seller/integrations?success=amazon")

@router.get("/flipkart/authorize")
def authorize_flipkart(user_id: str = Depends(get_current_user_id)):
    """
    Redirects the user to the Flipkart Seller API OAuth page.
    """
    client_id = os.environ.get("FLIPKART_OAUTH_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="Master Flipkart App is not configured.")
        
    redirect_uri = "https://insydz.com/api/v1/integrations/flipkart/callback"
    flipkart_auth_url = (
        f"https://api.flipkart.net/oauth-flow/authorize?"
        f"client_id={client_id}&response_type=code&state={user_id}&redirect_uri={redirect_uri}"
    )
    return RedirectResponse(url=flipkart_auth_url)

@router.get("/flipkart/callback")
async def callback_flipkart(
    code: str = Query(...), 
    state: str = Query(...), 
    db: Session = Depends(get_db)
):
    """
    Exchanges the Flipkart authorization code for a permanent refresh token.
    """
    user_id = state
    client_id = os.environ.get("FLIPKART_OAUTH_CLIENT_ID")
    client_secret = os.environ.get("FLIPKART_OAUTH_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Master Flipkart OAuth keys are not configured.")
        
    token_url = "https://api.flipkart.net/oauth-flow/token"
    # Flipkart uses Basic Auth for the token exchange
    auth_header = httpx.BasicAuth(client_id, client_secret)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{token_url}?grant_type=authorization_code&code={code}&state={state}",
            auth=auth_header
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange Flipkart token. Invalid code.")
            
        data = response.json()
        refresh_token = data.get("refresh_token")
        
        if not refresh_token:
            raise HTTPException(status_code=500, detail="Flipkart did not return a refresh token.")
    
    cred = db.query(UserApiCredential).filter(
        UserApiCredential.user_id == user_id,
        UserApiCredential.platform == "flipkart"
    ).first()
    
    if cred:
        cred.refresh_token = refresh_token
    else:
        cred = UserApiCredential(user_id=user_id, platform="flipkart", refresh_token=refresh_token)
        db.add(cred)
        
    db.commit()
    return RedirectResponse(url="/seller/integrations?success=flipkart")
