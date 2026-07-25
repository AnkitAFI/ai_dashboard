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
    image_base64_list: list[str] = []
    use_hinglish: bool = False
    verified_image_details: dict = None

class AnalyzeImageRequest(BaseModel):
    image_base64_list: list[str]

class RemoveBackgroundRequest(BaseModel):
    image_base64_list: list[str]

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
    
    agreed_to_accuracy: bool = False
    agreed_to_legal_responsibility: bool = False
    
    # Liability snapshot data
    images: list[str] = []
    data_snapshot: dict = None

class SaveEditRequest(BaseModel):
    listing_id: int
    edited_amazon_title: str = None
    edited_amazon_bullets: list[str] = None
    edited_amazon_description: str = None
    edited_amazon_search_terms: str = None
    edited_flipkart_title: str = None
    edited_flipkart_description: str = None

@router.post("/remove-background")
async def api_remove_background(req: RemoveBackgroundRequest, user_id: str = Depends(get_current_user_id)):
    """
    Takes a list of base64 images, checks if they need background removal,
    removes the background locally using rembg if necessary, places them on a pure white canvas
    and returns the new images.
    """
    try:
        if not req.image_base64_list:
            raise HTTPException(status_code=400, detail="Image base64 list is required.")
        
        cleaned_images = []
        ai_used_count = 0
        
        for img_b64 in req.image_base64_list:
            cleaned_base64, was_ai_used = make_amazon_compliant_image(img_b64)
            cleaned_images.append(cleaned_base64)
            if was_ai_used:
                ai_used_count += 1
                
        return {
            "status": "success", 
            "image_base64_list": cleaned_images,
            "stats": {
                "total": len(req.image_base64_list),
                "ai_processed": ai_used_count,
                "skipped_already_white": len(req.image_base64_list) - ai_used_count
            }
        }
    except Exception as e:
        logger.error(f"Error in remove_background: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-image")
async def api_analyze_image(req: AnalyzeImageRequest, user_id: str = Depends(get_current_user_id)):
    """
    Takes a list of base64 images, runs them through the local Vision AI (MiniCPM), 
    and returns the extracted raw JSON details for the frontend to verify.
    """
    try:
        from app.services.ollama_service import analyze_product_image_with_minicpm
        import json
        
        if not req.image_base64_list:
            raise HTTPException(status_code=400, detail="Images are required.")
            
        json_str = await analyze_product_image_with_minicpm(req.image_base64_list)
        if not json_str:
            raise HTTPException(status_code=500, detail="Vision AI failed to analyze the image.")
            
        from app.services.listing_agent_service import extract_json_from_llm
        details = extract_json_from_llm(json_str)
        
        # Hard filter out logistical fields that the user provides during publishing
        if "missing_critical_attributes" in details and isinstance(details["missing_critical_attributes"], list):
            forbidden = ["price", "mrp", "sku", "barcode", "quantity", "inventory"]
            filtered = []
            for attr in details["missing_critical_attributes"]:
                # The AI might occasionally return a dict like {"name": "Brand"} instead of just "Brand"
                attr_str = str(list(attr.values())[0]) if isinstance(attr, dict) and attr else str(attr)
                if not any(f in attr_str.lower() for f in forbidden):
                    filtered.append(attr_str)
            # Hard cap at 3 to prevent overwhelming the user
            details["missing_critical_attributes"] = filtered[:3]
        
        return {"status": "success", "data": details}
    except Exception as e:
        logger.error(f"Error in analyze_image: {e}")
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
        # ENFORCEMENT LOGIC
        from app.models.schema_v2 import UserSubscription
        sub = db.query(UserSubscription).filter(UserSubscription.user_id == user_id).first()
        
        if not sub or sub.subscription_tier != "enterprise":
            raise HTTPException(status_code=403, detail="AI Listing Studio is an exclusive feature for Enterprise users. Please upgrade your plan.")
        
        # === SANDBOX TESTING ===
        # Bypassing backend wallet balance check for infinite testing
        # if sub.ai_credits_balance <= 0:
        if False:
            raise HTTPException(status_code=402, detail="INSUFFICIENT_CREDITS")
            
        # Deduct balance and track generation
        sub.ai_credits_balance -= 1
        sub.ai_listings_generated += 1
        db.commit()

        new_listing = await generate_listings_for_product(
            db=db,
            user_id=user_id, 
            raw_description=req.raw_description,
            category=req.category,
            image_url=req.image_url,
            image_base64_list=req.image_base64_list,
            use_hinglish=req.use_hinglish,
            verified_image_details=req.verified_image_details
        )
        return {
            "status": "success", 
            "listing_id": new_listing.id, 
            "data": {
                "amazon_title": new_listing.amazon_title,
                "amazon_bullets": new_listing.amazon_bullets,
                "amazon_description": new_listing.amazon_description,
                "amazon_search_terms": new_listing.amazon_search_terms,
                "flipkart_title": new_listing.flipkart_title,
                "flipkart_description": new_listing.flipkart_description,
                "extracted_attributes": new_listing.extracted_attributes,
                "a_plus_content": new_listing.a_plus_content
            }
        }
    except HTTPException:
        # Re-raise HTTP exceptions so FastAPI can handle the proper status codes (like 402, 403)
        raise
    except Exception as e:
        import traceback
        logger.error(f"Error generating listing: {e}\n{traceback.format_exc()}")
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
        
    # COMPLIANCE: Require legal checkboxes
    if not req.agreed_to_accuracy or not req.agreed_to_legal_responsibility:
        raise HTTPException(status_code=400, detail="You must agree to the compliance checklist before publishing.")
        
    # Log the compliance agreement
    from app.models.listing_models import PublishComplianceLog
    compliance_log = PublishComplianceLog(
        listing_id=req.listing_id,
        user_id=int(user_id),
        agreed_to_accuracy=req.agreed_to_accuracy,
        agreed_to_legal_responsibility=req.agreed_to_legal_responsibility,
        published_images=req.images,
        published_data_snapshot=req.data_snapshot
    )
    db.add(compliance_log)
    db.commit()
        
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

async def check_abuse(text: str) -> bool:
    """Returns True if abuse is detected, False otherwise."""
    if not text: return False
    
    # 1. Static Dictionary Check (Fast)
    bad_words = ["fuck", "shit", "bitch", "asshole", "cunt", "nigger", "faggot", "chutiya", "madarchod", "bhenchod"]
    text_lower = text.lower()
    for word in bad_words:
        if word in text_lower:
            return True
            
    # 2. LLM Check (Robust multi-language)
    from app.services.ollama_service import complete_ollama
    prompt = f"Analyze the following text for severe profanity, hate speech, or explicit abuse in ANY language. Respond ONLY with YES if it contains abuse, or NO if it is clean.\n\nText: {text}"
    try:
        result = await complete_ollama(prompt, system="You are a strict content moderator.")
        if "YES" in result.upper():
            return True
    except:
        pass
    return False

@router.post("/save-edit")
async def api_save_edit(
    req: SaveEditRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    from app.models.listing_models import ProductListing, ListingRevision
    listing = db.query(ProductListing).filter(ProductListing.id == req.listing_id).first()
    
    if not listing or str(listing.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    # Combine text for abuse check
    all_text = " ".join(filter(None, [
        req.edited_amazon_title,
        " ".join(req.edited_amazon_bullets) if req.edited_amazon_bullets else "",
        req.edited_amazon_description,
        req.edited_amazon_search_terms,
        req.edited_flipkart_title,
        req.edited_flipkart_description
    ]))
    
    if await check_abuse(all_text):
        raise HTTPException(status_code=400, detail="ABUSE_DETECTED")
        
    # Update Draft Columns
    listing.user_edited_amazon_title = req.edited_amazon_title
    listing.user_edited_amazon_bullets = req.edited_amazon_bullets
    listing.user_edited_amazon_description = req.edited_amazon_description
    listing.user_edited_amazon_search_terms = req.edited_amazon_search_terms
    listing.user_edited_flipkart_title = req.edited_flipkart_title
    listing.user_edited_flipkart_description = req.edited_flipkart_description
    
    # Save Audit Trail Revision
    rev = ListingRevision(
        listing_id=req.listing_id,
        user_id=int(user_id),
        edited_fields=req.model_dump(exclude={"listing_id"})
    )
    db.add(rev)
    db.commit()
    return {"status": "success"}
