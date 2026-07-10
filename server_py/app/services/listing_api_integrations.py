import os
import httpx
import logging
from sqlalchemy.orm import Session
from app.models.listing_models import ProductListing, UserApiCredential

logger = logging.getLogger(__name__)

async def test_amazon_connection() -> dict:
    """
    Tests the Amazon SP-API connection by requesting a Sandbox LWA token.
    Returns a success message and token prefix if successful.
    """
    from app.services.amazon_auth_service import amazon_auth_service
    
    try:
        logger.info("Initiating Amazon SP-API Test Connection...")
        token = await amazon_auth_service.get_lwa_access_token()
        
        # We don't want to expose the full token in logs or UI
        token_preview = f"{token[:15]}...{token[-5:]}" if token and len(token) > 20 else "Invalid Token Format"
        
        return {
            "status": "success",
            "message": "Successfully authenticated with Amazon Sandbox!",
            "token_preview": token_preview,
            "role_arn_configured": bool(amazon_auth_service.get_role_arn())
        }
    except Exception as e:
        logger.error(f"Amazon Sandbox Test Failed: {str(e)}")
        raise ValueError(f"Amazon Sandbox Authentication Failed: {str(e)}")

async def publish_to_amazon(listing: ProductListing, req, db: Session, user_id: str) -> bool:
    """
    Pushes a fully generated listing to Amazon India via the Selling Partner API (SP-API).
    Raises a ValueError if API credentials are not set for this specific user.
    """
    # === SANDBOX BYPASS ===
    # For testing the sandbox, we bypass the DB check and just use the global .env keys.
    sandbox_mode = True 
    
    if sandbox_mode:
        logger.info("SANDBOX MODE: Bypassing DB credentials and using global .env keys.")
    else:
        cred = db.query(UserApiCredential).filter(
            UserApiCredential.user_id == user_id, 
            UserApiCredential.platform == "amazon"
        ).first()
        
        if not cred or not cred.refresh_token:
            raise ValueError("Amazon SP-API credentials are not connected for your account. Please connect them in Integrations.")
        
    logger.info(f"Authenticating with Amazon SP-API for SKU: {req.sku}")
    
    # 1. Exchange Refresh Token for Access Token (LWA)
    # 2. Construct the JSON Listings Item payload using our AI-generated data
    
    attrs = listing.extracted_attributes or {}
    
    payload = {
        "productType": attrs.get("product_type", "PRODUCT"),
        "attributes": {
            "item_name": [{"value": listing.amazon_title, "language_tag": "en_IN"}],
            "bullet_point": [{"value": b, "language_tag": "en_IN"} for b in (listing.amazon_bullets or [])],
            "product_description": [{"value": listing.amazon_description, "language_tag": "en_IN"}],
            "generic_keyword": [{"value": listing.amazon_search_terms}],
            "purchasable_offer": [{
                "currency": "INR",
                "our_price": [{"schedule": [{"value_with_tax": req.selling_price}]}]
            }],
            "fulfillment_availability": [{"fulfillment_channel_code": "DEFAULT", "quantity": req.quantity}],
            "externally_assigned_product_identifier": [{
                "type": req.product_id_type,
                "value": req.product_id
            }],
            "list_price": [{"currency": "INR", "value": req.mrp}]
        }
    }
    
    # Merge dynamically extracted AI attributes (Brand, Color, Material, etc.)
    for key, val in attrs.items():
        if key not in ["product_type"] and val:
            payload["attributes"][key] = [{"value": val, "language_tag": "en_IN"}]
            
    # Send payload to Sandbox
    import requests
    from app.services.amazon_auth_service import amazon_auth_service
    
    if sandbox_mode:
        try:
            # 1. Get LWA Grantless Token
            access_token = await amazon_auth_service.get_lwa_access_token()
            
            # 2. Get AWS SigV4 Auth Object via STS
            auth = amazon_auth_service.get_signed_auth()
            
            # 3. Construct Sandbox Endpoint
            seller_id = os.getenv("AMAZON_SELLER_ID")
            if not seller_id:
                raise ValueError("AMAZON_SELLER_ID is missing in your .env file! This is your Merchant Token from Seller Central.")
                
            endpoint = f"https://sandbox.sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/{seller_id}/{req.sku}"
            
            headers = {
                "x-amz-access-token": access_token,
                "Content-Type": "application/json"
            }
            
            # Amazon SP-API requires query parameters for marketplace
            params = {
                "marketplaceIds": "A21TJRUUN4KGV" # Amazon India Marketplace ID
            }
            
            logger.info(f"Sending signed PUT request to Amazon Sandbox for SKU: {req.sku}")
            
            res = requests.put(
                endpoint,
                auth=auth,
                json=payload,
                headers=headers,
                params=params
            )
            if not res.ok:
                error_msg = f"Amazon API Error {res.status_code}: {res.text}"
                logger.error(error_msg)
                raise ValueError(error_msg)
                
            logger.info(f"Sandbox Response: {res.json()}")
            
            return {
                "status": "success",
                "message": "Successfully submitted to Amazon Sandbox",
                "platform": "amazon",
                "sandbox_response": res.json()
            }
            
        except ValueError as e:
            logger.error(f"Sandbox Publish Failed: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Sandbox Publish Failed: {str(e)}")
            raise ValueError(f"Amazon Sandbox Publish Error: {str(e)}")

    return True

async def publish_to_flipkart(listing: ProductListing, req, db: Session, user_id: str) -> bool:
    """
    Pushes a fully generated listing to Flipkart India via the Seller API.
    Raises a ValueError if API credentials are not set for this specific user.
    """
    cred = db.query(UserApiCredential).filter(
        UserApiCredential.user_id == user_id, 
        UserApiCredential.platform == "flipkart"
    ).first()
    
    if not cred or not cred.refresh_token:
        raise ValueError("Flipkart Seller API credentials are not connected for your account. Please connect them in Integrations.")
        
    logger.info(f"Authenticating with Flipkart API for SKU: {req.sku}")
    
    # Construct Flipkart payload
    attrs = listing.extracted_attributes or {}
    
    payload = {
        "skuId": req.sku,
        "title": listing.flipkart_title,
        "description": listing.flipkart_description,
        "price": {
            "mrp": req.mrp,
            "selling_price": req.selling_price,
            "currency": "INR"
        },
        "inventory": {
            "quantity": req.quantity
        },
        "tax": {
            "hsn": attrs.get("hsn", "85176290") # default fallback
        },
        "attributes": attrs
    }
    
    # In a fully connected environment, this makes the POST request to:
    # https://api.flipkart.net/sellers/listings/v3/update
    
    return True
