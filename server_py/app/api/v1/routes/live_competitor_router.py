"""
live_competitor_router.py  –  Live Competitor Tracking API
------------------------------------------------------------
Endpoints:
  POST   /live-competitor/fetch-asin  → fetch live data for a single Amazon ASIN
  GET    /live-competitor/lists       → load saved ASIN lists for the authenticated user
  POST   /live-competitor/lists       → save a new ASIN list for the authenticated user

Auth pattern mirrors watchlist_router.py:
  - get_current_user reads session_id cookie (set by credentials: "include" on frontend)
  - require_enterprise_tier enforces tier gate at the API level
  - user_id is always taken from the session, never from the client payload
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import List, Optional

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user, require_enterprise_tier
from app.db.models.user_model import User
from app.db.models.live_competitor_result_model import LiveCompetitorResult
from app.models.schema_v2 import CompetitorTrackingList

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/live-competitor", tags=["Live Competitor Tracking"])

RAINFOREST_API_KEY = os.getenv("RAINFOREST_API_KEY")


# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class FetchAsinRequest(BaseModel):
    asin: str

class CompetitorInputItem(BaseModel):
    ownAsin: str
    competitorAsins: List[str]

class SaveListRequest(BaseModel):
    list_name: Optional[str] = "Default List"
    asin_data: List[CompetitorInputItem]

class FetchResultItem(BaseModel):
    asin: str
    mrp: Optional[float] = None
    price: Optional[float] = None
    buyBoxWinner: Optional[str] = None
    sellerName: Optional[str] = None
    isFba: Optional[bool] = None
    delivery110011: Optional[str] = None
    coupons: Optional[str] = None
    bankOffers: Optional[List[str]] = None
    status: str
    errorMsg: Optional[str] = None
    
    # Extra fields to track origin
    own_asin: str
    asin_role: str  # 'own' or 'competitor'

class SaveRunRequest(BaseModel):
    results: List[FetchResultItem]


# ─────────────────────────────────────────────────────────────────────────────
# POST /live-competitor/fetch-asin
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/fetch-asin")
async def fetch_asin(
    payload: FetchAsinRequest,
    current_user: User = Depends(require_enterprise_tier),
):
    """
    Fetch live marketplace data for a single Amazon ASIN from Rainforest API.
    Fires two parallel requests for pincode 110011 and 500011.
    Scrapes bank offers from the HTML response using BeautifulSoup.
    Enterprise tier only.
    """
    asin = payload.asin.strip()
    if not asin:
        raise HTTPException(status_code=400, detail="ASIN is required")

    if not RAINFOREST_API_KEY:
        logger.error("RAINFOREST_API_KEY is not set in environment variables.")
        raise HTTPException(status_code=500, detail="API configuration error: Missing Rainforest API Key.")

    url1 = (
        f"https://api.rainforestapi.com/request"
        f"?api_key={RAINFOREST_API_KEY}&type=product&amazon_domain=amazon.in"
        f"&asin={asin}&customer_zipcode=110011&include_html=true"
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res1 = await client.get(url1)
        except httpx.RequestError as e:
            logger.error(f"Rainforest request failed for ASIN {asin}: {e}")
            raise HTTPException(status_code=502, detail="Failed to reach Rainforest API")

    # Primary (110011) is mandatory
    if res1.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Rainforest API error for {asin}: {res1.text[:200]}"
        )

    data1 = res1.json()

    product = data1.get("product")
    if not product:
        raise HTTPException(status_code=404, detail=f"No product data found for ASIN: {asin}")

    buybox      = product.get("buybox_winner") or {}
    fulfillment = buybox.get("fulfillment") or {}
    seller      = buybox.get("third_party_seller") or fulfillment.get("third_party_seller") or {}

    mrp          = (buybox.get("rrp") or {}).get("value") or (buybox.get("price") or {}).get("value")
    price        = (buybox.get("price") or {}).get("value")
    coupons      = product.get("coupon_text")
    is_fba       = fulfillment.get("is_fulfilled_by_amazon", False)

    # Buy Box winner logic:
    # is_sold_by_amazon = True  → Amazon sells it directly
    # is_sold_by_amazon = False → 3P seller; use their name
    is_sold_by_amazon = fulfillment.get("is_sold_by_amazon", False)
    seller_name = seller.get("name")  # e.g. "Sheela Foam Limited"
    if is_sold_by_amazon:
        buy_box_winner = "Amazon"
    elif seller_name:
        buy_box_winner = seller_name
    else:
        buy_box_winner = "Unknown"

    delivery_110011 = (fulfillment.get("standard_delivery") or {}).get("date")

    # Parse ALL bank offers from HTML — return as a list so frontend can show each row separately
    bank_offers: list[str] | None = None
    html_content = data1.get("html")
    if html_content:
        try:
            soup = BeautifulSoup(html_content, "html.parser")
            collected: list[str] = []
            for header in soup.find_all("h6", class_="offers-items-title"):
                if header.get_text(strip=True).lower() == "bank offer":
                    parent = header.find_parent(class_="offers-items")
                    if parent:
                        # Grab every individual offer row (.a-truncate-full or .a-truncate-cut fallback)
                        for offer_el in parent.select(".offers-items-content .a-truncate-full"):
                            text = offer_el.get_text(strip=True)
                            if text:
                                collected.append(text)
                        # If truncate-full is empty, try the visible truncate-cut spans
                        if not collected:
                            for offer_el in parent.select(".offers-items-content span.a-truncate-cut"):
                                text = offer_el.get_text(strip=True)
                                if text:
                                    collected.append(text)
                    break
            if collected:
                bank_offers = collected
        except Exception as e:
            logger.warning(f"Bank offer scraping failed for {asin}: {e}")

    return {
        "asin": asin,
        "mrp": mrp,
        "price": price,
        "buyBoxWinner": buy_box_winner,
        "sellerName": seller_name,       # raw seller name (frontend shows for Our ASINs only)
        "isFba": is_fba,
        "delivery110011": delivery_110011,
        "coupons": coupons,
        "bankOffers": bank_offers,       # list[str] | None
        "status": "success",
    }



# ─────────────────────────────────────────────────────────────────────────────
# GET /live-competitor/lists
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/lists")
def get_tracking_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_enterprise_tier),
):
    """Return all saved ASIN lists for the authenticated enterprise user only."""
    try:
        lists = (
            db.query(CompetitorTrackingList)
            .filter(CompetitorTrackingList.user_id == current_user.id)
            .order_by(desc(CompetitorTrackingList.created_at))
            .all()
        )
        return {
            "lists": [
                {
                    "id": l.id,
                    "list_name": l.list_name,
                    "asin_data": l.asin_data,
                    "created_at": l.created_at.isoformat() if l.created_at else None,
                    "updated_at": l.updated_at.isoformat() if l.updated_at else None,
                }
                for l in lists
            ]
        }
    except Exception as e:
        logger.error(f"Failed to fetch lists for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch lists")


# ─────────────────────────────────────────────────────────────────────────────
# POST /live-competitor/lists
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/lists", status_code=201)
def create_tracking_list(
    payload: SaveListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_enterprise_tier),
):
    """Save a new ASIN list tied strictly to the authenticated user's ID from session."""
    try:
        new_list = CompetitorTrackingList(
            user_id=current_user.id,   # Always from session — never trust client-supplied IDs
            list_name=payload.list_name,
            asin_data=[item.dict() for item in payload.asin_data],
        )
        db.add(new_list)
        db.commit()
        db.refresh(new_list)
        return {
            "list": {
                "id": new_list.id,
                "list_name": new_list.list_name,
                "asin_data": new_list.asin_data,
                "created_at": new_list.created_at.isoformat() if new_list.created_at else None,
                "updated_at": new_list.updated_at.isoformat() if new_list.updated_at else None,
            }
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save list for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save list")

# ─────────────────────────────────────────────────────────────────────────────
# POST /live-competitor/save-run
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/save-run")
def save_fetch_run(
    payload: SaveRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_enterprise_tier),
):
    """
    Save or update fetch results for the authenticated user.
    Uses an upsert-like logic to maintain one latest snapshot per user+ASIN.
    """
    try:
        # Extract unique ASINs to check existing records
        asins = [item.asin for item in payload.results]
        
        # Get existing records for this user and these ASINs
        existing_records = db.query(LiveCompetitorResult).filter(
            LiveCompetitorResult.user_id == current_user.id,
            LiveCompetitorResult.asin.in_(asins)
        ).all()
        
        existing_map = {r.asin: r for r in existing_records}
        
        for item in payload.results:
            if item.asin in existing_map:
                # Update existing
                record = existing_map[item.asin]
                record.own_asin = item.own_asin
                record.asin_role = item.asin_role
                record.mrp = item.mrp
                record.price = item.price
                record.buy_box_winner = item.buyBoxWinner
                record.seller_name = item.sellerName
                record.is_fba = item.isFba
                record.delivery_110011 = item.delivery110011
                record.coupons = item.coupons
                record.bank_offers = item.bankOffers
                record.fetch_status = item.status
                record.error_msg = item.errorMsg
            else:
                # Create new
                new_record = LiveCompetitorResult(
                    user_id=current_user.id,
                    own_asin=item.own_asin,
                    asin=item.asin,
                    asin_role=item.asin_role,
                    mrp=item.mrp,
                    price=item.price,
                    buy_box_winner=item.buyBoxWinner,
                    seller_name=item.sellerName,
                    is_fba=item.isFba,
                    delivery_110011=item.delivery110011,
                    coupons=item.coupons,
                    bank_offers=item.bankOffers,
                    fetch_status=item.status,
                    error_msg=item.errorMsg
                )
                db.add(new_record)
                
        db.commit()
        return {"status": "success", "message": "Run saved successfully"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save run for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save fetch results")
