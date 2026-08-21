import os
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status

def verify_google_id_token(token: str) -> dict:
    """
    Verifies a Google ID token passed from the client side.
    Returns verified payload dictionary containing google_id (sub), email, first_name, last_name, picture.
    """
    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token is required"
        )
    
    client_id = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("NEXT_PUBLIC_GOOGLE_CLIENT_ID")
    # If placeholder is present or client_id not set, do not enforce audience matching during dev setup
    audience = client_id if (client_id and "your-google-client-id" not in client_id) else None
    
    try:
        request = requests.Request()
        id_info = id_token.verify_oauth2_token(token, request, audience=audience)
        
        # Verify token issuer
        iss = id_info.get("iss")
        if iss not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token issuer"
            )

        if not id_info.get("email_verified", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google email is not verified"
            )
            
        first_name = id_info.get("given_name")
        last_name = id_info.get("family_name")
        if not first_name:
            full_name = id_info.get("name", "").strip()
            parts = full_name.split(" ", 1)
            first_name = parts[0] if parts[0] else "Google"
            last_name = parts[1] if len(parts) > 1 else "User"

        return {
            "google_id": id_info.get("sub"),
            "email": id_info.get("email"),
            "first_name": first_name,
            "last_name": last_name or "User",
            "picture": id_info.get("picture"),
            "email_verified": id_info.get("email_verified", False)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error verifying Google token: {str(e)}"
        )
