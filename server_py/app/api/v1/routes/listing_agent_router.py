from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging

from app.db.session import get_db
from app.api.deps import get_current_user_id
from app.services.listing_agent_service import generate_listings_for_product
from app.services.listing_api_integrations import publish_to_amazon, publish_to_flipkart
from app.services.image_processing_service import make_amazon_compliant_image

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/listing-agent", tags=["Listing Agent"])

class GenerateListingRequest(BaseModel):
    raw_description: str = ""
    category: str = "General"
    image_url: str = None
    image_base64: str = None
    use_hinglish: bool = False

class RemoveBackgroundRequest(BaseModel):
    image_base64: str

class PublishListingRequest(BaseModel):
    listing_id: int
    sku: str
    platform: str # 'amazon' or 'flipkart'
    
    # Commerce Data
    mrp: float
    selling_price: float
    quantity: int
    product_id: str
    product_id_type: str # 'UPC', 'EAN', 'ASIN', 'GCID'

@router.post("/remove-background")
async def api_remove_background(req: RemoveBackgroundRequest, user_id: str = Depends(get_current_user_id)):
    """
    Takes a base64 image, removes the background locally using rembg, 
    and returns a clean white background image for Amazon compliance.
    """
    try:
        if not req.image_base64:
            raise HTTPException(status_code=400, detail="Image base64 is required.")
        
        cleaned_base64 = make_amazon_compliant_image(req.image_base64)
        return {"status": "success", "image_base64": cleaned_base64}
    except Exception as e:
        logger.error(f"Error in remove_background: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def api_generate_listing(
    req: GenerateListingRequest, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Takes a raw product description and generates Amazon and Flipkart optimized 
    listings using the local Llama 3 AI.
    """
    try:
        new_listing = await generate_listings_for_product(
            db=db,
            user_id=user_id, 
            raw_description=req.raw_description,
            category=req.category,
            image_url=req.image_url,
            image_base64=req.image_base64,
            use_hinglish=req.use_hinglish
        )
        return {"status": "success", "listing_id": new_listing.id, "data": new_listing}
    except Exception as e:
        logger.error(f"Error generating listing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/publish")
async def api_publish_listing(
    req: PublishListingRequest, 
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Pushes an AI-generated listing to Amazon or Flipkart.
    This will raise an error if environment API keys are missing.
    """
    # Fetch listing from DB
    from app.models.listing_models import ProductListing
    listing = db.query(ProductListing).filter(ProductListing.id == req.listing_id).first()
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # SECURITY: Ensure the user actually owns this listing (Prevent IDOR)
    if str(listing.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to publish this listing.")
        
    try:
        if req.platform.lower() == "amazon":
            await publish_to_amazon(listing, req, db, user_id)
            return {"status": "success", "message": "Successfully published to Amazon"}
        elif req.platform.lower() == "flipkart":
            await publish_to_flipkart(listing, req, db, user_id)
            return {"status": "success", "message": "Successfully published to Flipkart"}
        else:
            raise HTTPException(status_code=400, detail="Invalid platform. Choose 'amazon' or 'flipkart'.")
            
    except ValueError as e:
        # Catch our specific environment variable missing errors
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error publishing listing: {e}")
        raise HTTPException(status_code=500, detail=str(e))
