import os
import logging
import httpx
from datetime import datetime, timedelta
from app.core.config import settings

logger = logging.getLogger(__name__)

class FlipkartAuthService:
    def __init__(self):
        # We will use the main OAuth credentials. 
        # In a real scenario, you might have separate Sandbox credentials in .env
        self.client_id = os.environ.get("FLIPKART_OAUTH_CLIENT_ID")
        self.client_secret = os.environ.get("FLIPKART_OAUTH_CLIENT_SECRET")
        
        # Flipkart Sandbox Auth Endpoint
        self.sandbox_token_endpoint = "https://sandbox-api.flipkart.net/oauth-flow/token"
        
        self._access_token = None
        self._token_expiry = None

    async def get_sandbox_access_token(self) -> str:
        """
        Retrieves a temporary access token from the Flipkart Sandbox API.
        This validates that your FLIPKART_OAUTH_CLIENT_ID and SECRET are correct.
        """
        if not self.client_id or not self.client_secret:
            raise ValueError(
                "FLIPKART_OAUTH_CLIENT_ID or FLIPKART_OAUTH_CLIENT_SECRET is missing in your .env file."
            )

        if self._access_token and self._token_expiry and datetime.now() < self._token_expiry:
            return self._access_token
            
        logger.info("Requesting Sandbox Access Token from Flipkart...")
        
        # Flipkart uses Basic Auth for the token exchange
        auth_header = httpx.BasicAuth(self.client_id, self.client_secret)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.sandbox_token_endpoint}?grant_type=client_credentials",
                    auth=auth_header
                )
                
                # If we get a 401/403, the credentials are bad.
                if response.status_code != 200:
                    logger.error(f"Flipkart Sandbox Auth Failed: {response.text}")
                    raise ValueError(f"Invalid Flipkart Credentials or unauthorized for Sandbox. Response: {response.text}")
                    
                data = response.json()
                self._access_token = data.get("access_token")
                
                if not self._access_token:
                     raise ValueError("Flipkart returned 200 OK but missing access_token in response.")
                     
                # Standard OAuth token expiration logic
                expires_in = data.get("expires_in", 3600)
                self._token_expiry = datetime.now() + timedelta(seconds=expires_in - 60)
                
                logger.info("Successfully retrieved Flipkart Sandbox Access Token!")
                return self._access_token
                
            except httpx.RequestError as e:
                logger.error(f"Network error connecting to Flipkart API: {str(e)}")
                raise ValueError(f"Network error connecting to Flipkart API: {str(e)}")

flipkart_auth_service = FlipkartAuthService()
