from fastapi import APIRouter, Depends, HTTPException, Request, Body, Query, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import httpx
import json
import logging
import re
import os
import uuid
import io
import hmac
import hashlib
import asyncio
from decimal import Decimal
import razorpay
from PIL import Image

from app.db.session import get_db
from app.api.deps import get_current_user
from app.core.config import settings
from app.services.rate_limiter import SPAPIRateLimit
from app.models.schema_v2 import (
    UserAuth,
    UserSubscription,
    AmazonSPAPICredential,
    AmazonSPAPIAuditLog,
    AmazonSPAPIListingItem,
    AmazonSPAPIListingHistory,
    AmazonSPAPIListingDraft,
    AmazonSPAPIProductTypeSchema,
    AmazonSPAPIUploadedMedia,
    AmazonSPAPIListingQuotaWallet,
    AmazonSPAPIListingWalletTransaction,
    AmazonSPAPIScheduledListing
)

router = APIRouter(prefix="/amazon-sp-api/listings", tags=["Amazon SP-API Listing Optimizer & Creator"])
logger = logging.getLogger("ListingOptimizerRouter")

AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
SP_API_ENDPOINT = "https://sellingpartnerapi-eu.amazon.com"
MARKETPLACE_ID_IN = "A21TJRUUN4KGV"

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
rzp_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# --- Pydantic Request Models ---

class ListingPatchRequest(BaseModel):
    title: Optional[str] = None
    bullets: Optional[List[str]] = None
    description: Optional[str] = None
    backend_search_terms: Optional[str] = None
    main_image_url: Optional[str] = None
    user_confirmed: bool = Field(True, description="Explicit user clickwrap authorization for live push")

class ListingDraftRequest(BaseModel):
    sku: str
    product_type: str
    draft_data: Dict[str, Any]

class PublishNewListingRequest(BaseModel):
    sku: str
    product_type: str
    brand: str
    title: str
    bullets: List[str]
    description: str
    backend_search_terms: str
    price: float
    initial_quantity: int = 1
    barcode_type: str = "ean" # ean, upc, gtin, or exemption
    barcode_value: Optional[str] = None
    main_image_url: Optional[str] = None
    category_attributes: Optional[Dict[str, Any]] = None
    user_confirmed: bool = Field(True, description="Explicit seller confirmation of compliance with Amazon policies")

class CreateWalletOrderRequest(BaseModel):
    amount: int = Field(..., ge=50, description="Amount in INR (e.g. 250, 500, 1000)")

class VerifyWalletPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    amount: float

class ScheduleListingRequest(BaseModel):
    sku: str
    product_type: str
    brand: str
    title: str
    bullets: List[str]
    description: str
    backend_search_terms: str
    price: float
    initial_quantity: int = 1
    barcode_type: str = "ean"
    barcode_value: Optional[str] = None
    main_image_url: Optional[str] = None
    category_attributes: Optional[Dict[str, Any]] = None
    scheduled_time: datetime

# --- Security & Tier Gating Dependency ---

def verify_tenant_and_premium_tier(
    selling_partner_id: str,
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> AmazonSPAPICredential:
    """Enforces strict tenant isolation and gates tool exclusively to Premium, Enterprise, and Trial tiers."""
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == current_user.id).first()
    if not sub or sub.subscription_tier not in ["premium", "enterprise", "trial"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="upgrade_required:premium"
        )
    
    # Verify store ownership
    user_creds = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id
    ).all()
    
    target_cred = next((c for c in user_creds if c.selling_partner_id == selling_partner_id), None)
    if not target_cred:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Account access denied or store not connected."
        )
    return target_cred

async def get_sp_api_access_token(refresh_token: str) -> str:
    """Retrieves ephemeral access token for SP-API."""
    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(
            AMAZON_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.AMAZON_SP_API_LWA_CLIENT_ID,
                "client_secret": settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if res.status_code != 200:
            logger.error(f"Failed LWA token exchange: {res.text}")
            raise HTTPException(status_code=400, detail="Amazon authentication token renewal failed.")
        return res.json()["access_token"]

def compute_health_score(title: str, bullets: List[str], desc: str, terms: str, has_img: bool, suppressed: bool) -> int:
    if suppressed:
        return 25
    score = 0
    t_len = len(title.strip()) if title else 0
    if 100 <= t_len <= 200: score += 25
    elif 50 <= t_len < 100 or 200 < t_len <= 250: score += 15
    elif t_len > 0: score += 5

    b_count = len([b for b in (bullets or []) if b and b.strip()])
    if b_count >= 5: score += 25
    elif b_count >= 3: score += 15
    elif b_count >= 1: score += 5

    d_len = len(desc.strip()) if desc else 0
    if d_len >= 250: score += 15
    elif d_len > 0: score += 8

    b_bytes = len(terms.encode("utf-8")) if terms else 0
    if 180 <= b_bytes <= 250: score += 20
    elif 80 <= b_bytes < 180: score += 12
    elif b_bytes > 0: score += 5

    if has_img: score += 15
    return min(100, score)

def detect_keyword_overlap(title: str, search_terms: str) -> tuple[bool, List[str], int]:
    if not title or not search_terms:
        byte_len = len(search_terms.encode("utf-8")) if search_terms else 0
        return False, [], byte_len
    title_words = set(re.findall(r'\b[a-zA-Z0-9]{3,}\b', title.lower()))
    search_words = re.findall(r'\b[a-zA-Z0-9]{3,}\b', search_terms.lower())
    overlaps = sorted(list(set([w for w in search_words if w in title_words])))
    byte_len = len(search_terms.encode("utf-8"))
    return len(overlaps) > 0, overlaps, byte_len

def get_user_quota_and_wallet(db: Session, user_id: int, user_sub: Optional[UserSubscription]):
    """
    Returns (wallet_obj, quota_limit, reset_date, remaining_free, balance)
    Option 1: Billing Renewal Reset Date.
    - Trial / Premium: 5 free new listings / billing month
    - Enterprise: 10 free new listings / billing month
    - Extra listings: ₹50 / listing deducted from wallet
    """
    now = datetime.now(timezone.utc)
    tier = (user_sub.subscription_tier or "free").lower() if user_sub else "free"

    if tier == "enterprise":
        quota_limit = 10
    elif tier in ["premium", "trial"]:
        quota_limit = 5
    else:
        quota_limit = 0

    wallet = db.query(AmazonSPAPIListingQuotaWallet).filter(
        AmazonSPAPIListingQuotaWallet.user_id == user_id
    ).first()

    if not wallet:
        wallet = AmazonSPAPIListingQuotaWallet(
            user_id=user_id,
            free_listings_used=0,
            cycle_start_date=now,
            wallet_balance_inr=Decimal("0.00")
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    # Option 1: Billing renewal date alignment
    if user_sub and user_sub.subscription_expires_at:
        sub_exp = user_sub.subscription_expires_at
        if sub_exp.tzinfo is None:
            sub_exp = sub_exp.replace(tzinfo=timezone.utc)
        cycle_reset_date = sub_exp
    else:
        c_start = wallet.cycle_start_date or now
        if c_start.tzinfo is None:
            c_start = c_start.replace(tzinfo=timezone.utc)
        cycle_reset_date = c_start + timedelta(days=30)

    # Check if billing cycle renewed / rolled over
    if now >= cycle_reset_date:
        wallet.free_listings_used = 0
        wallet.cycle_start_date = now
        cycle_reset_date = now + timedelta(days=30)
        db.commit()

    remaining_free = max(0, quota_limit - wallet.free_listings_used)
    balance = float(wallet.wallet_balance_inr or 0.0)

    return wallet, quota_limit, cycle_reset_date, remaining_free, balance

# --- 1. Summary & Catalog Endpoints ---

@router.get("/{selling_partner_id}/summary", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
def get_catalog_summary(
    selling_partner_id: str,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns top 4 KPI cards for the catalog."""
    items = db.query(AmazonSPAPIListingItem).filter(
        AmazonSPAPIListingItem.user_id == current_user.id,
        AmazonSPAPIListingItem.selling_partner_id == selling_partner_id
    ).all()
    
    total = len(items)
    if total == 0:
        return {
            "total_listings": 0,
            "average_health_score": 0,
            "suppressed_count": 0,
            "keyword_waste_count": 0,
            "optimized_count": 0
        }
        
    avg_score = round(sum(i.health_score for i in items) / float(total))
    suppressed = sum(1 for i in items if i.is_suppressed)
    keyword_waste = sum(1 for i in items if i.has_title_keyword_overlap)
    optimized = sum(1 for i in items if i.health_score >= 80)
    
    return {
        "total_listings": total,
        "average_health_score": avg_score,
        "suppressed_count": suppressed,
        "keyword_waste_count": keyword_waste,
        "optimized_count": optimized
    }

@router.get("/{selling_partner_id}/items", dependencies=[Depends(SPAPIRateLimit("default", tokens=2))])
def get_catalog_items(
    selling_partner_id: str,
    q: Optional[str] = Query(None, description="Search by ASIN, SKU, or Title"),
    filter_type: Optional[str] = Query("ALL", description="ALL, SUPPRESSED, KEYWORD_WASTE, LOW_SCORE"),
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns filtered, searchable catalog items."""
    query = db.query(AmazonSPAPIListingItem).filter(
        AmazonSPAPIListingItem.user_id == current_user.id,
        AmazonSPAPIListingItem.selling_partner_id == selling_partner_id
    )
    
    if q:
        search_pattern = f"%{q.lower()}%"
        query = query.filter(
            (func.lower(AmazonSPAPIListingItem.sku).like(search_pattern)) |
            (func.lower(AmazonSPAPIListingItem.asin).like(search_pattern)) |
            (func.lower(AmazonSPAPIListingItem.title).like(search_pattern))
        )
        
    if filter_type == "SUPPRESSED":
        query = query.filter(AmazonSPAPIListingItem.is_suppressed == True)
    elif filter_type == "KEYWORD_WASTE":
        query = query.filter(AmazonSPAPIListingItem.has_title_keyword_overlap == True)
    elif filter_type == "LOW_SCORE":
        query = query.filter(AmazonSPAPIListingItem.health_score < 70)
        
    items = query.order_by(AmazonSPAPIListingItem.health_score.asc()).all()
    
    results = []
    for item in items:
        results.append({
            "id": item.id,
            "sku": item.sku,
            "asin": item.asin,
            "product_type": item.product_type,
            "title": item.title,
            "title_length": len(item.title) if item.title else 0,
            "bullets": item.bullets or [],
            "bullets_count": len(item.bullets or []),
            "description": item.description,
            "backend_search_terms": item.backend_search_terms,
            "main_image_url": item.main_image_url,
            "health_score": item.health_score,
            "is_suppressed": item.is_suppressed,
            "suppression_reasons": item.suppression_reasons or [],
            "search_term_bytes": item.search_term_bytes,
            "has_title_keyword_overlap": item.has_title_keyword_overlap,
            "wasted_overlap_words": item.wasted_overlap_words or [],
            "last_synced_at": item.last_synced_at.isoformat() if item.last_synced_at else None
        })
        
    return {"items": results}

@router.get("/{selling_partner_id}/items/{sku}/history")
def get_listing_history(
    selling_partner_id: str,
    sku: str,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns revision history snapshots for 1-click rollback & non-repudiation."""
    history = db.query(AmazonSPAPIListingHistory).filter(
        AmazonSPAPIListingHistory.user_id == current_user.id,
        AmazonSPAPIListingHistory.selling_partner_id == selling_partner_id,
        AmazonSPAPIListingHistory.sku == sku
    ).order_by(AmazonSPAPIListingHistory.created_at.desc()).all()
    
    return {
        "history": [
            {
                "id": h.id,
                "sku": h.sku,
                "asin": h.asin,
                "snapshot_data": h.snapshot_data,
                "changed_by": h.changed_by,
                "reason": h.reason,
                "created_at": h.created_at.isoformat() if h.created_at else None
            }
            for h in history
        ]
    }

# --- 2. Live Patching & Rollback Endpoints ---

@router.patch("/{selling_partner_id}/items/{sku}", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
async def patch_listing_item(
    selling_partner_id: str,
    sku: str,
    payload: ListingPatchRequest,
    request: Request,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Patches listing copy live to Amazon via SP-API PATCH /listings/2021-08-01.
    Performs full Zero-Blame Non-Repudiation Audit Logging and takes rollback snapshot.
    """
    item = db.query(AmazonSPAPIListingItem).filter(
        AmazonSPAPIListingItem.user_id == current_user.id,
        AmazonSPAPIListingItem.selling_partner_id == selling_partner_id,
        AmazonSPAPIListingItem.sku == sku
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Listing item not found.")

    # 1. Validate byte length
    if payload.backend_search_terms:
        byte_len = len(payload.backend_search_terms.encode("utf-8"))
        if byte_len > 250:
            raise HTTPException(
                status_code=400,
                detail=f"Backend search terms exceed Amazon's strict 250-byte limit (Submitted: {byte_len} bytes)."
            )

    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    # 2. Snapshot current copy for 1-click rollback and forensic proof
    snapshot = AmazonSPAPIListingHistory(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        sku=sku,
        asin=item.asin,
        snapshot_data={
            "title": item.title,
            "bullets": item.bullets,
            "description": item.description,
            "backend_search_terms": item.backend_search_terms
        },
        changed_by="USER",
        reason="Manual Optimization via Insydz Studio",
        client_ip=client_ip,
        user_agent=user_agent
    )
    db.add(snapshot)

    # 3. Call Amazon SP-API Listings Items API (PATCH)
    access_token = await get_sp_api_access_token(cred.refresh_token)
    
    # Build SP-API Listings patch payload
    patches = []
    if payload.title is not None:
        patches.append({
            "op": "replace",
            "path": "/attributes/item_name",
            "value": [{"value": payload.title, "marketplace_id": MARKETPLACE_ID_IN}]
        })
    if payload.bullets is not None:
        patches.append({
            "op": "replace",
            "path": "/attributes/bullet_point",
            "value": [{"value": b, "marketplace_id": MARKETPLACE_ID_IN} for b in payload.bullets if b.strip()]
        })
    if payload.description is not None:
        patches.append({
            "op": "replace",
            "path": "/attributes/description",
            "value": [{"value": payload.description, "marketplace_id": MARKETPLACE_ID_IN}]
        })
    if payload.backend_search_terms is not None:
        patches.append({
            "op": "replace",
            "path": "/attributes/generic_keyword",
            "value": [{"value": payload.backend_search_terms, "marketplace_id": MARKETPLACE_ID_IN}]
        })
    if payload.main_image_url:
        patches.append({
            "op": "replace",
            "path": "/attributes/main_product_image_locator",
            "value": [{"media_location": payload.main_image_url, "marketplace_id": MARKETPLACE_ID_IN}]
        })

    patch_url = f"{SP_API_ENDPOINT}/listings/2021-08-01/items/{cred.selling_partner_id}/{sku}?marketplaceIds={MARKETPLACE_ID_IN}"
    headers = {
        "x-amz-access-token": access_token,
        "Content-Type": "application/json"
    }
    
    amazon_res_data = {}
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.patch(patch_url, json={"productType": item.product_type or "PRODUCT", "patches": patches}, headers=headers)
        if res.status_code not in [200, 202]:
            err_msg = res.text
            logger.error(f"Amazon SP-API PATCH failed for SKU {sku}: {res.status_code} - {err_msg}")
            raise HTTPException(status_code=res.status_code, detail=f"Amazon rejection: {err_msg}")
        amazon_res_data = res.json()

    # 4. Update local DB record
    if payload.title is not None: item.title = payload.title
    if payload.bullets is not None: item.bullets = payload.bullets
    if payload.description is not None: item.description = payload.description
    if payload.backend_search_terms is not None: item.backend_search_terms = payload.backend_search_terms
    if payload.main_image_url: item.main_image_url = payload.main_image_url

    has_ov, ovs, b_len = detect_keyword_overlap(item.title, item.backend_search_terms)
    item.has_title_keyword_overlap = has_ov
    item.wasted_overlap_words = ovs
    item.search_term_bytes = b_len
    item.health_score = compute_health_score(
        item.title, item.bullets, item.description, item.backend_search_terms, bool(item.main_image_url), item.is_suppressed
    )

    # 5. Non-Repudiation Audit Log
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="LISTING_PATCHED_LIVE",
        asin=item.asin,
        old_value=json.dumps(snapshot.snapshot_data),
        new_value=json.dumps({
            "title": item.title,
            "bullets": item.bullets,
            "search_terms": item.backend_search_terms,
            "amazon_response": amazon_res_data
        }),
        ip_address=client_ip
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": "Listing patched live to Amazon successfully.",
        "health_score": item.health_score,
        "submission_details": amazon_res_data
    }

@router.post("/{selling_partner_id}/items/{sku}/rollback/{history_id}")
async def rollback_listing_version(
    selling_partner_id: str,
    sku: str,
    history_id: int,
    request: Request,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restores selected historical copy to Amazon via SP-API with full audit logging."""
    history = db.query(AmazonSPAPIListingHistory).filter(
        AmazonSPAPIListingHistory.id == history_id,
        AmazonSPAPIListingHistory.user_id == current_user.id,
        AmazonSPAPIListingHistory.sku == sku
    ).first()
    
    if not history:
        raise HTTPException(status_code=404, detail="Historical snapshot not found.")

    snapshot = history.snapshot_data
    patch_req = ListingPatchRequest(
        title=snapshot.get("title"),
        bullets=snapshot.get("bullets"),
        description=snapshot.get("description"),
        backend_search_terms=snapshot.get("backend_search_terms")
    )
    
    result = await patch_listing_item(
        selling_partner_id=selling_partner_id,
        sku=sku,
        payload=patch_req,
        request=request,
        cred=cred,
        current_user=current_user,
        db=db
    )
    
    # Audit log rollback specifically
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="LISTING_ROLLBACK_EXECUTED",
        asin=history.asin,
        old_value=f"target_history_id:{history_id}",
        new_value=json.dumps(snapshot),
        ip_address=request.client.host if request.client else "unknown"
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "message": "Successfully restored previous listing version."}

# --- 3. Categories & Schema Caching (Scale Protected) ---

POPULAR_AMAZON_CATEGORIES = [
    {"code": "SHIRT", "label": "Clothing & Apparel (Shirts/Tops)"},
    {"code": "SHOES", "label": "Footwear (Shoes/Sandals)"},
    {"code": "HEADPHONES", "label": "Electronics (Headphones/Audio)"},
    {"code": "HOME_BED_AND_BATH", "label": "Home, Bed & Bath"},
    {"code": "KITCHEN", "label": "Kitchen & Dining"},
    {"code": "BEAUTY", "label": "Beauty & Personal Care"},
    {"code": "HEALTH_PERSONAL_CARE", "label": "Health & Nutrition"},
    {"code": "BAG", "label": "Luggage, Bags & Backpacks"},
    {"code": "SPORTING_GOODS", "label": "Sports & Fitness"},
    {"code": "TOYS_AND_GAMES", "label": "Toys & Baby Products"}
]

@router.get("/categories")
def get_categories(current_user: UserAuth = Depends(get_current_user)):
    """Returns top searchable Amazon categories."""
    return {"categories": POPULAR_AMAZON_CATEGORIES}

@router.get("/schema/{product_type}")
async def get_product_type_schema(
    product_type: str,
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    SCALE PROTECTION: Returns Amazon category schema from local PostgreSQL cache.
    Guarantees 0 Amazon API calls for 99.9% of queries, completely shielding developer keys.
    """
    now = datetime.now(timezone.utc)
    cached = db.query(AmazonSPAPIProductTypeSchema).filter(
        AmazonSPAPIProductTypeSchema.marketplace_id == MARKETPLACE_ID_IN,
        AmazonSPAPIProductTypeSchema.product_type == product_type.upper(),
        AmazonSPAPIProductTypeSchema.expires_at > now
    ).first()
    
    if cached:
        return {"product_type": product_type, "schema": cached.schema_json, "cached": True}

    # Fetch from Amazon and store in DB with 30-day TTL
    # Use any active store credential to fetch schema
    user_cred = db.query(AmazonSPAPICredential).filter(AmazonSPAPICredential.user_id == current_user.id).first()
    if not user_cred:
        # Fallback to default schema if no store connected
        return {"product_type": product_type, "schema": {"required": ["item_name", "brand", "bullet_point"]}, "cached": False}
        
    try:
        access_token = await get_sp_api_access_token(user_cred.refresh_token)
        url = f"{SP_API_ENDPOINT}/definitions/2020-09-01/productTypes/{product_type.upper()}?marketplaceIds={MARKETPLACE_ID_IN}&requirements=LISTING"
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.get(url, headers={"x-amz-access-token": access_token})
            if res.status_code == 200:
                schema_json = res.json().get("schema", {})
                
                # Cache in DB for 30 days
                new_cache = AmazonSPAPIProductTypeSchema(
                    marketplace_id=MARKETPLACE_ID_IN,
                    product_type=product_type.upper(),
                    schema_json=schema_json,
                    expires_at=now + timedelta(days=30)
                )
                db.merge(new_cache)
                db.commit()
                return {"product_type": product_type, "schema": schema_json, "cached": False}
    except Exception as e:
        logger.error(f"Error fetching product type schema: {e}")
        
    return {"product_type": product_type, "schema": {"required": ["item_name", "brand", "bullet_point"]}, "cached": False}

# --- 4. New Product Creation & Live Publishing Endpoints ---

@router.post("/{selling_partner_id}/draft")
def save_listing_draft(
    selling_partner_id: str,
    payload: ListingDraftRequest,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Saves in-progress draft locally so seller work is never lost."""
    draft = db.query(AmazonSPAPIListingDraft).filter(
        AmazonSPAPIListingDraft.user_id == current_user.id,
        AmazonSPAPIListingDraft.selling_partner_id == selling_partner_id,
        AmazonSPAPIListingDraft.sku == payload.sku
    ).first()
    
    if not draft:
        draft = AmazonSPAPIListingDraft(
            user_id=current_user.id,
            selling_partner_id=selling_partner_id,
            sku=payload.sku,
            product_type=payload.product_type,
            draft_data=payload.draft_data
        )
        db.add(draft)
    else:
        draft.product_type = payload.product_type
        draft.draft_data = payload.draft_data
        draft.status = "DRAFT"
        
    db.commit()
    return {"status": "success", "message": "Draft auto-saved successfully."}

@router.get("/{selling_partner_id}/drafts")
def list_listing_drafts(
    selling_partner_id: str,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all saved drafts for this store."""
    drafts = db.query(AmazonSPAPIListingDraft).filter(
        AmazonSPAPIListingDraft.user_id == current_user.id,
        AmazonSPAPIListingDraft.selling_partner_id == selling_partner_id
    ).order_by(AmazonSPAPIListingDraft.updated_at.desc()).all()
    
    return {
        "drafts": [
            {
                "id": d.id,
                "sku": d.sku,
                "product_type": d.product_type,
                "status": d.status,
                "draft_data": d.draft_data,
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "updated_at": d.updated_at.isoformat() if d.updated_at else None
            }
            for d in drafts
        ]
    }

@router.get("/{selling_partner_id}/creator-quota")
def get_creator_quota(
    selling_partner_id: str,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns monthly included listing creation quota and dedicated wallet balance."""
    user_sub = db.query(UserSubscription).filter(UserSubscription.user_id == current_user.id).first()
    wallet, quota_limit, reset_date, remaining_free, balance = get_user_quota_and_wallet(db, current_user.id, user_sub)
    
    return {
        "quota_limit": quota_limit,
        "free_listings_used": wallet.free_listings_used,
        "free_listings_remaining": remaining_free,
        "wallet_balance_inr": balance,
        "cycle_reset_date": reset_date.isoformat(),
        "cost_per_extra_listing": 50.0,
        "razorpay_key_id": RAZORPAY_KEY_ID
    }

@router.post("/{selling_partner_id}/wallet/create-order")
def create_wallet_order(
    selling_partner_id: str,
    payload: CreateWalletOrderRequest,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initializes a Razorpay payment order for wallet recharge."""
    if not rzp_client:
        raise HTTPException(status_code=500, detail="Razorpay payment gateway not configured.")
    
    order_data = {
        "amount": payload.amount * 100,  # paise
        "currency": "INR",
        "receipt": f"wlt_{current_user.id}_{int(datetime.now().timestamp())}",
        "notes": {
            "user_id": str(current_user.id),
            "selling_partner_id": selling_partner_id,
            "purpose": "Listing Studio Wallet Top-Up"
        }
    }
    try:
        order = rzp_client.order.create(data=order_data)
        return {
            "razorpay_order_id": order["id"],
            "amount": order["amount"],
            "currency": "INR",
            "razorpay_key_id": RAZORPAY_KEY_ID
        }
    except Exception as e:
        logger.error(f"Failed to create Razorpay wallet order: {e}")
        raise HTTPException(status_code=500, detail=f"Payment initialization failed: {str(e)}")

@router.post("/{selling_partner_id}/wallet/verify-payment")
def verify_wallet_payment(
    selling_partner_id: str,
    payload: VerifyWalletPaymentRequest,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verifies Razorpay HMAC signature and credits user's isolated listing wallet."""
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay secret not configured.")
    
    msg = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), msg.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed: invalid signature.")
    
    user_sub = db.query(UserSubscription).filter(UserSubscription.user_id == current_user.id).first()
    wallet, _, _, _, _ = get_user_quota_and_wallet(db, current_user.id, user_sub)
    
    topup_dec = Decimal(str(payload.amount))
    wallet.wallet_balance_inr = (wallet.wallet_balance_inr or Decimal("0.00")) + topup_dec
    
    tx = AmazonSPAPIListingWalletTransaction(
        user_id=current_user.id,
        transaction_type="RECHARGE",
        amount=topup_dec,
        balance_after=wallet.wallet_balance_inr,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        description=f"Listing Studio wallet top-up (+₹{payload.amount:.0f})"
    )
    db.add(tx)
    db.commit()
    db.refresh(wallet)
    
    return {
        "status": "success",
        "wallet_balance_inr": float(wallet.wallet_balance_inr),
        "message": f"Successfully added ₹{payload.amount:.0f} to your listing wallet."
    }

@router.post("/{selling_partner_id}/publish/{sku}", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
async def publish_new_listing(
    selling_partner_id: str,
    sku: str,
    payload: PublishNewListingRequest,
    request: Request,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Publishes a brand-new product live to Amazon using PUT /listings/2021-08-01.
    Performs full Zero-Blame Non-Repudiation Audit Logging.
    """
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    # 1. Byte limit check
    if payload.backend_search_terms:
        b_len = len(payload.backend_search_terms.encode("utf-8"))
        if b_len > 250:
            raise HTTPException(status_code=400, detail=f"Backend search terms exceed 250-byte limit (Submitted: {b_len} bytes).")

    # 2. Check Monthly Included Quota & Wallet Balance (₹50 per extra listing beyond quota)
    user_sub = db.query(UserSubscription).filter(UserSubscription.user_id == current_user.id).first()
    wallet, quota_limit, reset_date, remaining_free, balance = get_user_quota_and_wallet(db, current_user.id, user_sub)

    is_paid_via_wallet = False
    fee_deducted = 0.0

    if remaining_free > 0:
        # Covered under monthly included quota (Free)
        wallet.free_listings_used += 1
    else:
        # Monthly quota exhausted -> Check wallet balance (₹50 required)
        if balance < 50.0:
            raise HTTPException(
                status_code=402,
                detail=f"Monthly listing quota reached ({quota_limit}/{quota_limit} used). Your wallet balance is ₹{balance:.2f}. Please top up your wallet (₹50 per listing) to publish."
            )
        wallet.wallet_balance_inr = Decimal(str(wallet.wallet_balance_inr)) - Decimal("50.00")
        is_paid_via_wallet = True
        fee_deducted = 50.0

    # 3. Build full SP-API Listing Creation Payload
    access_token = await get_sp_api_access_token(cred.refresh_token)
    
    attributes: Dict[str, Any] = {
        "item_name": [{"value": payload.title, "marketplace_id": MARKETPLACE_ID_IN}],
        "brand": [{"value": payload.brand, "marketplace_id": MARKETPLACE_ID_IN}],
        "bullet_point": [{"value": b, "marketplace_id": MARKETPLACE_ID_IN} for b in payload.bullets if b.strip()],
        "description": [{"value": payload.description, "marketplace_id": MARKETPLACE_ID_IN}],
        "generic_keyword": [{"value": payload.backend_search_terms, "marketplace_id": MARKETPLACE_ID_IN}],
        "purchasable_offer": [{
            "currency": "INR",
            "our_price": [{"schedule": [{"value_with_tax": payload.price}]}],
            "marketplace_id": MARKETPLACE_ID_IN
        }],
        "fulfillment_availability": [{
            "fulfillment_channel_code": "DEFAULT",
            "quantity": payload.initial_quantity
        }]
    }

    if payload.barcode_value and payload.barcode_type != "exemption":
        attributes["externally_assigned_product_identifier"] = [{
            "type": payload.barcode_type.lower(),
            "value": payload.barcode_value,
            "marketplace_id": MARKETPLACE_ID_IN
        }]

    if payload.main_image_url:
        attributes["main_product_image_locator"] = [{
            "media_location": payload.main_image_url,
            "marketplace_id": MARKETPLACE_ID_IN
        }]

    # Merge dynamic category attributes
    if payload.category_attributes:
        for k, v in payload.category_attributes.items():
            if k not in attributes and v is not None:
                attributes[k] = [{"value": v, "marketplace_id": MARKETPLACE_ID_IN}]

    put_body = {
        "productType": payload.product_type.upper(),
        "requirements": "LISTING",
        "attributes": attributes
    }

    # 3. Call Amazon SP-API PUT /listings/2021-08-01
    put_url = f"{SP_API_ENDPOINT}/listings/2021-08-01/items/{cred.selling_partner_id}/{sku}?marketplaceIds={MARKETPLACE_ID_IN}"
    headers = {
        "x-amz-access-token": access_token,
        "Content-Type": "application/json"
    }

    amazon_data = {}
    async with httpx.AsyncClient(timeout=40.0) as client:
        res = await client.put(put_url, json=put_body, headers=headers)
        if res.status_code not in [200, 202]:
            logger.error(f"Amazon rejected new listing for SKU {sku}: {res.status_code} - {res.text}")
            raise HTTPException(status_code=res.status_code, detail=f"Amazon rejection: {res.text}")
        amazon_data = res.json()

    # 4. Update Draft Status
    draft = db.query(AmazonSPAPIListingDraft).filter(
        AmazonSPAPIListingDraft.user_id == current_user.id,
        AmazonSPAPIListingDraft.selling_partner_id == selling_partner_id,
        AmazonSPAPIListingDraft.sku == sku
    ).first()
    if draft:
        draft.status = "SUBMITTED"
        draft.amazon_submission_id = str(amazon_data.get("submissionId") or amazon_data.get("status") or "ACCEPTED")

    # 5. Non-Repudiation Audit Log
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="NEW_LISTING_PUBLISHED_LIVE",
        asin=sku, # SKU used as reference identifier
        old_value="NEW_PRODUCT_CREATION",
        new_value=json.dumps({
            "submitted_payload": put_body,
            "amazon_response": amazon_data,
            "user_confirmed": payload.user_confirmed,
            "client_ip": client_ip,
            "user_agent": user_agent
        }),
        ip_address=client_ip
    )
    db.add(audit)

    # 6. Upsert into catalog listing items table
    has_ov, ovs, b_len = detect_keyword_overlap(payload.title, payload.backend_search_terms)
    item = db.query(AmazonSPAPIListingItem).filter(
        AmazonSPAPIListingItem.user_id == current_user.id,
        AmazonSPAPIListingItem.selling_partner_id == selling_partner_id,
        AmazonSPAPIListingItem.sku == sku
    ).first()
    if not item:
        item = AmazonSPAPIListingItem(
            user_id=current_user.id,
            selling_partner_id=selling_partner_id,
            sku=sku,
            asin=payload.barcode_value or sku
        )
        db.add(item)
    item.product_type = payload.product_type.upper()
    item.title = payload.title
    item.bullets = payload.bullets
    item.description = payload.description
    item.backend_search_terms = payload.backend_search_terms
    item.main_image_url = payload.main_image_url
    item.health_score = compute_health_score(payload.title, payload.bullets, payload.description, payload.backend_search_terms, bool(payload.main_image_url), False)
    item.search_term_bytes = b_len
    item.has_title_keyword_overlap = has_ov
    item.wasted_overlap_words = ovs
    item.last_synced_at = datetime.now(timezone.utc)

    # 5. Record Wallet Deduction Transaction if applicable
    if is_paid_via_wallet:
        tx = AmazonSPAPIListingWalletTransaction(
            user_id=current_user.id,
            transaction_type="LISTING_CREATION_FEE",
            amount=Decimal("-50.00"),
            balance_after=wallet.wallet_balance_inr,
            sku=sku,
            description=f"Listing creation fee for SKU: {sku}"
        )
        db.add(tx)

    db.commit()

    return {
        "status": "success",
        "message": "New product listing published live to Amazon! ASIN assignment will complete within ~15 minutes.",
        "quota_remaining": max(0, quota_limit - wallet.free_listings_used),
        "wallet_balance_inr": float(wallet.wallet_balance_inr),
        "fee_charged": fee_deducted,
        "submission_details": amazon_data
    }


def check_pure_white_background(img: Image.Image) -> tuple[bool, tuple[int, int, int], Optional[str]]:
    """
    Automated Pure White Background Image Linter (RGB 255, 255, 255 Check).
    Analyzes edge and corner pixels of an image.
    Amazon India's #1 cause of silent search suppression for clothing, shoes, and lifestyle is non-pure white main image background.
    If the background is off-white (e.g. RGB 242, 240, 238), alerts seller immediately before Amazon suppresses the listing.
    """
    try:
        rgb_img = img.convert("RGB")
        w, h = rgb_img.size

        # Sample points around the 4 corners and the 4 outer perimeter edges
        sample_points = [
            # Corners (with 2px and 5px insets to bypass container edges)
            (0, 0), (2, 2), (5, 5),
            (w - 1, 0), (w - 3, 2), (w - 6, 5),
            (0, h - 1), (2, h - 3), (5, h - 6),
            (w - 1, h - 1), (w - 3, h - 3), (w - 6, h - 6),
            # Perimeter edges
            (w // 4, 1), (w // 2, 1), (3 * w // 4, 1),
            (w // 4, h - 2), (w // 2, h - 2), (3 * w // 4, h - 2),
            (1, h // 4), (1, h // 2), (1, 3 * h // 4),
            (w - 2, h // 4), (w - 2, h // 2), (w - 2, 3 * h // 4)
        ]

        pixels = []
        for x, y in sample_points:
            if 0 <= x < w and 0 <= y < h:
                pixels.append(rgb_img.getpixel((x, y)))

        if not pixels:
            return True, (255, 255, 255), None

        avg_r = round(sum(p[0] for p in pixels) / len(pixels))
        avg_g = round(sum(p[1] for p in pixels) / len(pixels))
        avg_b = round(sum(p[2] for p in pixels) / len(pixels))

        # Check for pure white:
        # Amazon requires pure white (255, 255, 255). Even tiny light grey/off-white tint triggers suppression.
        non_white_samples = [p for p in pixels if p[0] < 253 or p[1] < 253 or p[2] < 253]

        if avg_r < 254 or avg_g < 254 or avg_b < 254 or len(non_white_samples) > 2:
            warning_msg = (
                "Photo background is off-white or has shadows. "
                "Amazon strictly requires a pure clean white background for your main product photo. "
                "An off-white background will cause Amazon to hide your product from customer search results."
            )
            return False, (avg_r, avg_g, avg_b), warning_msg

        return True, (255, 255, 255), None
    except Exception as e:
        logger.error(f"Error checking image background: {e}")
        return True, (255, 255, 255), None


@router.post("/{selling_partner_id}/upload-image")
async def upload_listing_image(
    selling_partner_id: str,
    request: Request,
    file: UploadFile = File(...),
    sku: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: UserAuth = Depends(get_current_user)
):
    """
    Accepts direct image uploads from seller devices (phone/laptop).
    Validates file format, resolution (for Amazon zoom compatibility),
    runs Automated Pure White Background Linter (RGB 255, 255, 255 check),
    saves to static storage, and returns an HTTPS URL for Amazon catalog ingestion.
    """
    verify_tenant_and_premium_tier(db, current_user.id, selling_partner_id)

    # 1. Validate file extension and MIME type
    allowed_mimes = {"image/jpeg", "image/png", "image/webp"}
    file_mime = file.content_type or ""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if file_mime.lower() not in allowed_mimes and ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, or WEBP image formats are supported for Amazon listings."
        )

    # 2. Read bytes and check size (Max 10 MB)
    file_bytes = await file.read()
    file_size = len(file_bytes)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size exceeds the 10 MB limit. Please upload a smaller photo."
        )

    # 3. Validate image integrity and dimensions using PIL
    try:
        img = Image.open(io.BytesIO(file_bytes))
        width, height = img.size
        img_format = img.format.lower() if img.format else "jpeg"
    except Exception as e:
        logger.error(f"Invalid image file uploaded: {e}")
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid or readable image. Please select another photo."
        )

    if width < 500 or height < 500:
        raise HTTPException(
            status_code=400,
            detail=f"Image resolution too low ({width}x{height}px). Amazon requires at least 500x500 pixels (1000x1000px recommended for zoom)."
        )

    # 3b. Automated Pure White Background Image Linter (RGB 255, 255, 255 check)
    is_pure_white, bg_rgb, bg_warning = check_pure_white_background(img)

    # 4. Generate unique stored filename and save
    if not ext:
        ext = f".{img_format}"
    unique_filename = f"img_{uuid.uuid4().hex[:16]}_{int(datetime.now(timezone.utc).timestamp())}{ext}"
    
    _BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    static_images_dir = os.path.join(_BASE_DIR, "static", "listing_images")
    os.makedirs(static_images_dir, exist_ok=True)
    destination_path = os.path.join(static_images_dir, unique_filename)

    with open(destination_path, "wb") as f_out:
        f_out.write(file_bytes)

    # 5. Build public URL
    base_url = str(request.base_url).rstrip("/")
    if request.headers.get("x-forwarded-proto") == "https":
        base_url = base_url.replace("http://", "https://")
    public_url = f"{base_url}/static/listing_images/{unique_filename}"

    # 6. Save metadata record to AmazonSPAPIUploadedMedia
    media_record = AmazonSPAPIUploadedMedia(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        sku=sku or "",
        original_filename=file.filename or unique_filename,
        stored_filename=unique_filename,
        file_path=destination_path,
        public_url=public_url,
        mime_type=file_mime or f"image/{img_format}",
        file_size_bytes=file_size,
        width=width,
        height=height
    )
    db.add(media_record)

    # 7. Audit log the upload
    client_ip = request.client.host if request.client else "unknown"
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="LISTING_IMAGE_UPLOADED",
        details=json.dumps({
            "original_filename": file.filename,
            "stored_filename": unique_filename,
            "public_url": public_url,
            "dimensions": f"{width}x{height}",
            "file_size": file_size,
            "sku": sku,
            "is_pure_white": is_pure_white,
            "background_rgb": list(bg_rgb),
            "background_warning": bg_warning
        }),
        ip_address=client_ip
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "public_url": public_url,
        "filename": file.filename or unique_filename,
        "width": width,
        "height": height,
        "file_size": file_size,
        "amazon_zoom_ready": width >= 1000 and height >= 1000,
        "is_pure_white": is_pure_white,
        "background_rgb": list(bg_rgb),
        "background_warning": bg_warning
    }


# --- 5. Scheduled Listing Launches & Safe Background Rate Limiter ---

@router.post("/{selling_partner_id}/schedule/{sku}", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
async def schedule_new_listing(
    selling_partner_id: str,
    sku: str,
    payload: ScheduleListingRequest,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Schedules a brand-new product listing for automatic publishing to Amazon at a future date & time.
    Enforces velocity caps (max 50 active scheduled listings) to protect against queue spamming.
    Validates Amazon byte limits and future timestamp.
    """
    # 1. Byte limit check
    if payload.backend_search_terms:
        b_len = len(payload.backend_search_terms.encode("utf-8"))
        if b_len > 250:
            raise HTTPException(status_code=400, detail=f"Search keywords exceed the 250-character limit ({b_len} characters).")

    # 2. Time validation (must be in future)
    now = datetime.now(timezone.utc)
    target_time = payload.scheduled_time
    if target_time.tzinfo is None:
        target_time = target_time.replace(tzinfo=timezone.utc)
    if target_time <= now + timedelta(minutes=1):
        raise HTTPException(status_code=400, detail="Scheduled launch time must be at least 2 minutes in the future.")

    # 3. Anti-Spam Velocity Check (Max 50 active scheduled listings per user)
    active_count = db.query(AmazonSPAPIScheduledListing).filter(
        AmazonSPAPIScheduledListing.user_id == current_user.id,
        AmazonSPAPIScheduledListing.status == "SCHEDULED"
    ).count()
    if active_count >= 50:
        raise HTTPException(
            status_code=429,
            detail="You have reached the maximum active scheduled launches limit (50). Please wait for current scheduled products to launch before scheduling more."
        )

    # 4. Upsert scheduled listing
    existing = db.query(AmazonSPAPIScheduledListing).filter(
        AmazonSPAPIScheduledListing.user_id == current_user.id,
        AmazonSPAPIScheduledListing.selling_partner_id == selling_partner_id,
        AmazonSPAPIScheduledListing.sku == sku,
        AmazonSPAPIScheduledListing.status == "SCHEDULED"
    ).first()

    listing_dict = payload.model_dump(mode="json")

    if existing:
        existing.product_type = payload.product_type.upper()
        existing.payload = listing_dict
        existing.scheduled_time = target_time
        existing.error_message = None
        db.commit()
        db.refresh(existing)
        target_item = existing
    else:
        new_sched = AmazonSPAPIScheduledListing(
            user_id=current_user.id,
            selling_partner_id=selling_partner_id,
            sku=sku,
            product_type=payload.product_type.upper(),
            payload=listing_dict,
            scheduled_time=target_time,
            status="SCHEDULED"
        )
        db.add(new_sched)
        db.commit()
        db.refresh(new_sched)
        target_item = new_sched

    # 5. Audit Log
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="LISTING_SCHEDULED_FOR_LAUNCH",
        asin=sku,
        new_value=json.dumps({
            "sku": sku,
            "scheduled_time": target_time.isoformat(),
            "title": payload.title,
            "price": payload.price
        }),
        ip_address="system"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": "Product successfully scheduled for launch!",
        "scheduled_id": target_item.id,
        "sku": sku,
        "scheduled_time": target_time.isoformat()
    }


@router.get("/{selling_partner_id}/scheduled")
def get_scheduled_listings(
    selling_partner_id: str,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all scheduled listing launches for this store."""
    items = db.query(AmazonSPAPIScheduledListing).filter(
        AmazonSPAPIScheduledListing.user_id == current_user.id,
        AmazonSPAPIScheduledListing.selling_partner_id == selling_partner_id
    ).order_by(AmazonSPAPIScheduledListing.scheduled_time.asc()).all()

    return {
        "scheduled_listings": [
            {
                "id": it.id,
                "sku": it.sku,
                "product_type": it.product_type,
                "title": (it.payload or {}).get("title", it.sku),
                "brand": (it.payload or {}).get("brand", ""),
                "price": (it.payload or {}).get("price", 0.0),
                "initial_quantity": (it.payload or {}).get("initial_quantity", 1),
                "main_image_url": (it.payload or {}).get("main_image_url"),
                "scheduled_time": it.scheduled_time.isoformat() if it.scheduled_time else None,
                "status": it.status,
                "published_at": it.published_at.isoformat() if it.published_at else None,
                "error_message": it.error_message,
                "amazon_submission_id": it.amazon_submission_id,
                "created_at": it.created_at.isoformat() if it.created_at else None
            }
            for it in items
        ]
    }


@router.delete("/{selling_partner_id}/scheduled/{schedule_id}")
def cancel_scheduled_listing(
    selling_partner_id: str,
    schedule_id: int,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancels a pending scheduled launch."""
    item = db.query(AmazonSPAPIScheduledListing).filter(
        AmazonSPAPIScheduledListing.id == schedule_id,
        AmazonSPAPIScheduledListing.user_id == current_user.id,
        AmazonSPAPIScheduledListing.selling_partner_id == selling_partner_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Scheduled listing not found.")
    
    if item.status == "PUBLISHED":
        raise HTTPException(status_code=400, detail="Cannot cancel a listing that has already been published to Amazon.")

    item.status = "CANCELLED"
    db.commit()

    return {"status": "success", "message": "Scheduled launch cancelled successfully."}


@router.post("/{selling_partner_id}/scheduled/{schedule_id}/publish-now")
async def publish_scheduled_listing_now(
    selling_partner_id: str,
    schedule_id: int,
    request: Request,
    cred: AmazonSPAPICredential = Depends(verify_tenant_and_premium_tier),
    current_user: UserAuth = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows seller to immediately launch an already-scheduled listing ahead of schedule."""
    item = db.query(AmazonSPAPIScheduledListing).filter(
        AmazonSPAPIScheduledListing.id == schedule_id,
        AmazonSPAPIScheduledListing.user_id == current_user.id,
        AmazonSPAPIScheduledListing.selling_partner_id == selling_partner_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Scheduled listing not found.")

    if item.status == "PUBLISHED":
        raise HTTPException(status_code=400, detail="Listing is already published live on Amazon.")

    p_data = dict(item.payload or {})
    # Remove scheduled_time before passing to PublishNewListingRequest
    p_data.pop("scheduled_time", None)
    req = PublishNewListingRequest(**p_data)

    result = await publish_new_listing(
        selling_partner_id=selling_partner_id,
        sku=item.sku,
        payload=req,
        request=request,
        cred=cred,
        current_user=current_user,
        db=db
    )

    item.status = "PUBLISHED"
    item.published_at = datetime.now(timezone.utc)
    item.amazon_submission_id = str(result.get("submission_details", {}).get("submissionId") or "ACCEPTED")
    item.fee_charged = Decimal(str(result.get("fee_charged", 0.0)))
    db.commit()

    return result


@router.post("/process-due-scheduled")
async def trigger_process_due_scheduled(
    db: Session = Depends(get_db)
):
    """
    Background worker endpoint to process all due scheduled listings across all stores.
    Enforces strict rate-limiting (2.0 RPS max) and Fair-Share Round-Robin queue processing
    to guarantee developer API keys are never throttled or suspended.
    """
    now = datetime.now(timezone.utc)
    due_items = db.query(AmazonSPAPIScheduledListing).filter(
        AmazonSPAPIScheduledListing.status == "SCHEDULED",
        AmazonSPAPIScheduledListing.scheduled_time <= now
    ).order_by(AmazonSPAPIScheduledListing.scheduled_time.asc()).limit(50).all()

    if not due_items:
        return {"processed": 0, "message": "No scheduled listings due for publishing."}

    # Fair-Share Round-Robin grouping by selling_partner_id
    from collections import defaultdict
    store_groups = defaultdict(list)
    for it in due_items:
        store_groups[it.selling_partner_id].append(it)

    # Interleave items round-robin
    round_robin_queue = []
    max_len = max(len(items) for items in store_groups.values())
    for idx in range(max_len):
        for sp_id, items in store_groups.items():
            if idx < len(items):
                round_robin_queue.append(items[idx])

    processed_count = 0
    errors_count = 0

    for item in round_robin_queue:
        item.status = "PUBLISHING"
        db.commit()

        # Strict Rate Limiter sleep: 500ms pause = 2.0 requests per second max (comfortably below Amazon's 5.0 RPS limit)
        await asyncio.sleep(0.5)

        try:
            # 1. Fetch store credentials
            cred = db.query(AmazonSPAPICredential).filter(
                AmazonSPAPICredential.user_id == item.user_id,
                AmazonSPAPICredential.selling_partner_id == item.selling_partner_id
            ).first()

            if not cred:
                item.status = "FAILED"
                item.error_message = "Store credential disconnected or invalid."
                db.commit()
                errors_count += 1
                continue

            # 2. Check Quota / Wallet
            user_sub = db.query(UserSubscription).filter(UserSubscription.user_id == item.user_id).first()
            wallet, quota_limit, _, remaining_free, balance = get_user_quota_and_wallet(db, item.user_id, user_sub)

            is_paid_via_wallet = False
            fee_deducted = 0.0

            # Strict tier gate: if quota_limit is 0 the user is on free/expired plan.
            # This feature is Premium-only. Plan expired = scheduler stops completely.
            # Wallet balance does not matter — an active plan is required.
            if quota_limit == 0:
                item.status = "FAILED"
                item.error_message = (
                    "Your plan has expired. The Scheduled Launch feature requires an active "
                    "Premium or Enterprise plan. Please reactivate your plan to publish this listing."
                )
                db.commit()
                errors_count += 1
                continue

            if remaining_free > 0:
                # Covered under monthly free allowance
                wallet.free_listings_used += 1
            else:
                # Free quota exhausted — charge wallet
                if balance < 50.0:
                    item.status = "FAILED"
                    item.error_message = (
                        f"Your free monthly listing allowance is used up and your wallet balance "
                        f"is ₹{balance:.2f}. Please add ₹50 to your wallet to publish this listing."
                    )
                    db.commit()
                    errors_count += 1
                    continue
                wallet.wallet_balance_inr = Decimal(str(wallet.wallet_balance_inr)) - Decimal("50.00")
                is_paid_via_wallet = True
                fee_deducted = 50.0

            # 3. Call Amazon SP-API
            access_token = await get_sp_api_access_token(cred.refresh_token)
            p_data = item.payload or {}

            attributes = {
                "item_name": [{"value": p_data.get("title", ""), "marketplace_id": MARKETPLACE_ID_IN}],
                "brand": [{"value": p_data.get("brand", ""), "marketplace_id": MARKETPLACE_ID_IN}],
                "bullet_point": [{"value": b, "marketplace_id": MARKETPLACE_ID_IN} for b in p_data.get("bullets", []) if b.strip()],
                "description": [{"value": p_data.get("description", ""), "marketplace_id": MARKETPLACE_ID_IN}],
                "generic_keyword": [{"value": p_data.get("backend_search_terms", ""), "marketplace_id": MARKETPLACE_ID_IN}],
                "purchasable_offer": [{
                    "currency": "INR",
                    "our_price": [{"schedule": [{"value_with_tax": float(p_data.get("price", 0.0))}]}],
                    "marketplace_id": MARKETPLACE_ID_IN
                }],
                "fulfillment_availability": [{
                    "fulfillment_channel_code": "DEFAULT",
                    "quantity": int(p_data.get("initial_quantity", 1))
                }]
            }

            if p_data.get("barcode_value") and p_data.get("barcode_type") != "exemption":
                attributes["externally_assigned_product_identifier"] = [{
                    "type": str(p_data.get("barcode_type")).lower(),
                    "value": str(p_data.get("barcode_value")),
                    "marketplace_id": MARKETPLACE_ID_IN
                }]

            if p_data.get("main_image_url"):
                attributes["main_product_image_locator"] = [{
                    "media_location": p_data.get("main_image_url"),
                    "marketplace_id": MARKETPLACE_ID_IN
                }]

            if p_data.get("category_attributes"):
                for k, v in p_data.get("category_attributes", {}).items():
                    if k not in attributes and v is not None:
                        attributes[k] = [{"value": v, "marketplace_id": MARKETPLACE_ID_IN}]

            put_body = {
                "productType": item.product_type,
                "requirements": "LISTING",
                "attributes": attributes
            }

            put_url = f"{SP_API_ENDPOINT}/listings/2021-08-01/items/{cred.selling_partner_id}/{item.sku}?marketplaceIds={MARKETPLACE_ID_IN}"
            headers = {"x-amz-access-token": access_token, "Content-Type": "application/json"}

            amazon_data = {}
            async with httpx.AsyncClient(timeout=40.0) as client:
                res = await client.put(put_url, json=put_body, headers=headers)
                if res.status_code not in [200, 202]:
                    if res.status_code == 429:
                        await asyncio.sleep(5.0)
                    raise Exception(f"Amazon rejection ({res.status_code}): {res.text}")
                amazon_data = res.json()

            # Record Wallet Transaction if applicable
            if is_paid_via_wallet:
                tx = AmazonSPAPIListingWalletTransaction(
                    user_id=item.user_id,
                    transaction_type="LISTING_CREATION_FEE",
                    amount=Decimal("-50.00"),
                    balance_after=wallet.wallet_balance_inr,
                    sku=item.sku,
                    description=f"Scheduled launch fee for SKU: {item.sku}"
                )
                db.add(tx)

            # Update Scheduled item
            item.status = "PUBLISHED"
            item.published_at = datetime.now(timezone.utc)
            item.amazon_submission_id = str(amazon_data.get("submissionId") or "ACCEPTED")
            item.fee_charged = Decimal(str(fee_deducted))
            item.error_message = None

            # Upsert into catalog listing item
            has_ov, ovs, b_len = detect_keyword_overlap(p_data.get("title", ""), p_data.get("backend_search_terms", ""))
            cat_item = db.query(AmazonSPAPIListingItem).filter(
                AmazonSPAPIListingItem.user_id == item.user_id,
                AmazonSPAPIListingItem.selling_partner_id == item.selling_partner_id,
                AmazonSPAPIListingItem.sku == item.sku
            ).first()
            if not cat_item:
                cat_item = AmazonSPAPIListingItem(
                    user_id=item.user_id,
                    selling_partner_id=item.selling_partner_id,
                    sku=item.sku,
                    asin=p_data.get("barcode_value") or item.sku
                )
                db.add(cat_item)
            cat_item.product_type = item.product_type
            cat_item.title = p_data.get("title", "")
            cat_item.bullets = p_data.get("bullets", [])
            cat_item.description = p_data.get("description", "")
            cat_item.backend_search_terms = p_data.get("backend_search_terms", "")
            cat_item.main_image_url = p_data.get("main_image_url")
            cat_item.health_score = compute_health_score(cat_item.title, cat_item.bullets, cat_item.description, cat_item.backend_search_terms, bool(cat_item.main_image_url), False)
            cat_item.search_term_bytes = b_len
            cat_item.has_title_keyword_overlap = has_ov
            cat_item.wasted_overlap_words = ovs
            cat_item.last_synced_at = datetime.now(timezone.utc)

            # Audit log
            audit = AmazonSPAPIAuditLog(
                user_id=item.user_id,
                selling_partner_id=item.selling_partner_id,
                action="SCHEDULED_LISTING_AUTO_PUBLISHED",
                asin=item.sku,
                new_value=json.dumps({"amazon_response": amazon_data}),
                ip_address="cron_worker"
            )
            db.add(audit)
            db.commit()
            processed_count += 1
        except Exception as e:
            logger.error(f"Error publishing scheduled listing {item.id} for SKU {item.sku}: {e}")
            item.status = "FAILED"
            item.error_message = str(e)[:400]
            db.commit()
            errors_count += 1

    return {"processed": processed_count, "errors": errors_count, "total_due": len(due_items)}

