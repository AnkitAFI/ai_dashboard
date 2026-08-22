from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, require_premium_tier
from app.services.amazon_ads_service import AmazonAdsService
from app.services.rate_limiter import RateLimit, redis_client
from pydantic import BaseModel
from typing import Dict, Any
from app.models.schema_v2 import AmazonAdsProfile, AmazonAdsCampaignPerformance, AmazonAdsKeywordPerformance, AmazonAdsSearchTermPerformance, AmazonAdsAutomationRules, AmazonAdsAuditLog, UserSavedFilters
from sqlalchemy import func
from datetime import datetime, timedelta
import logging
import json

router = APIRouter(prefix="/amazon-ads/analytics", tags=["Amazon Ads Analytics"])
logger = logging.getLogger(__name__)

def parse_date_range(date_range: str):
    """Parses date_range string into (start_date, end_date) datetimes."""
    today = datetime.utcnow().date()
    if "|" in date_range:
        parts = date_range.split("|")
        if len(parts) == 2:
            try:
                start_date = datetime.strptime(parts[0], "%Y-%m-%d").date()
                end_date = datetime.strptime(parts[1], "%Y-%m-%d").date()
                return start_date, end_date
            except ValueError:
                pass
    # Fallback to defaults
    if date_range == "7d":
        return today - timedelta(days=7), today
    elif date_range == "yesterday":
        return today - timedelta(days=1), today - timedelta(days=1)
    # Default to 30d
    return today - timedelta(days=30), today

@router.get("/profiles", dependencies=[Depends(RateLimit("default"))])
async def get_profiles(
    sync: bool = False,
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get connected Amazon Ads profiles."""
    service = AmazonAdsService(db, current_user.id)
    
    if sync:
        try:
            await service.sync_profiles()
        except Exception as e:
            logger.error(f"Error syncing profiles: {e}")
            # Non-blocking, fall back to DB
            
    profiles = db.query(AmazonAdsProfile).filter(AmazonAdsProfile.user_id == current_user.id).all()
    return {
        "profiles": [
            {
                "profile_id": p.profile_id,
                "country_code": p.country_code,
                "account_info": p.account_info,
                "currency_code": p.currency_code
            } for p in profiles
        ]
    }

@router.get("/summary", dependencies=[Depends(RateLimit("default"))])
async def get_summary(
    profile_id: str,
    date_range: str = Query("30d"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get high-level aggregated metrics for a profile."""
    # REDIS CACHE: Check if we have cached this exact request
    cache_key = f"amazon_ads_summary:{current_user.id}:{profile_id}:{date_range}"
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        logger.warning(f"Redis cache error on get_summary: {e}")

    start_date, end_date = parse_date_range(date_range)

    metrics = db.query(
        func.sum(AmazonAdsCampaignPerformance.spend).label("total_spend"),
        func.sum(AmazonAdsCampaignPerformance.sales).label("total_sales"),
        func.sum(AmazonAdsCampaignPerformance.impressions).label("total_impressions"),
        func.sum(AmazonAdsCampaignPerformance.clicks).label("total_clicks"),
    ).filter(
        AmazonAdsCampaignPerformance.user_id == current_user.id,
        AmazonAdsCampaignPerformance.profile_id == profile_id,
        AmazonAdsCampaignPerformance.date >= start_date,
        AmazonAdsCampaignPerformance.date <= end_date
    ).first()
    
    spend = float(metrics.total_spend or 0)
    sales = float(metrics.total_sales or 0)
    
    acos = (spend / sales * 100) if sales > 0 else 0
    roas = (sales / spend) if spend > 0 else 0
    
    result = {
        "summary": {
            "spend": spend,
            "sales": sales,
            "impressions": int(metrics.total_impressions or 0),
            "clicks": int(metrics.total_clicks or 0),
            "acos": round(acos, 2),
            "roas": round(roas, 2)
        }
    }

    # Set cache for 5 minutes (300 seconds) to protect DB
    try:
        await redis_client.setex(cache_key, 300, json.dumps(result))
    except Exception:
        pass

    return result

@router.get("/campaigns", dependencies=[Depends(RateLimit("default"))])
async def get_campaigns(
    profile_id: str,
    date_range: str = Query("30d"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get performance by campaign."""
    # Audit Log: Record that the user explicitly applied this filter/viewed this data
    try:
        start_date, end_date = parse_date_range(date_range)
        audit_log = AmazonAdsAuditLog(
            user_id=current_user.id,
            profile_id=profile_id,
            action="APPLY_FILTER",
            details={
                "filter_type": "date_range", 
                "value": date_range, 
                "start_date": start_date.strftime("%Y-%m-%d"), 
                "end_date": end_date.strftime("%Y-%m-%d")
            }
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record audit log for filter application: {e}")

    cache_key = f"amazon_ads_campaigns:{current_user.id}:{profile_id}:{date_range}"
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        logger.warning(f"Redis cache error on get_campaigns: {e}")

    # We want aggregated stats per campaign over the date range
    campaigns = db.query(
        AmazonAdsCampaignPerformance.campaign_id,
        AmazonAdsCampaignPerformance.campaign_name,
        AmazonAdsCampaignPerformance.campaign_status,
        func.sum(AmazonAdsCampaignPerformance.spend).label("spend"),
        func.sum(AmazonAdsCampaignPerformance.sales).label("sales"),
        func.sum(AmazonAdsCampaignPerformance.impressions).label("impressions"),
        func.sum(AmazonAdsCampaignPerformance.clicks).label("clicks")
    ).filter(
        AmazonAdsCampaignPerformance.user_id == current_user.id,
        AmazonAdsCampaignPerformance.profile_id == profile_id,
        AmazonAdsCampaignPerformance.date >= start_date,
        AmazonAdsCampaignPerformance.date <= end_date
    ).group_by(
        AmazonAdsCampaignPerformance.campaign_id,
        AmazonAdsCampaignPerformance.campaign_name,
        AmazonAdsCampaignPerformance.campaign_status
    ).all()
    
    result_list = []
    for c in campaigns:
        spend = float(c.spend or 0)
        sales = float(c.sales or 0)
        result_list.append({
            "campaign_id": c.campaign_id,
            "campaign_name": c.campaign_name,
            "status": c.campaign_status,
            "spend": spend,
            "sales": sales,
            "impressions": int(c.impressions or 0),
            "clicks": int(c.clicks or 0),
            "acos": round((spend / sales * 100) if sales > 0 else 0, 2)
        })
        
    result = {"campaigns": result_list}

    try:
        await redis_client.setex(cache_key, 300, json.dumps(result))
    except Exception:
        pass
        
    return result


class CampaignStatusUpdate(BaseModel):
    profile_id: str
    status: str

@router.put("/campaigns/{campaign_id}/status", dependencies=[Depends(RateLimit("default"))])
async def update_campaign_status(
    campaign_id: str,
    data: CampaignStatusUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually update a campaign's status and sync it to Amazon."""
    # Verify profile belongs to user
    profile = db.query(AmazonAdsProfile).filter(
        AmazonAdsProfile.profile_id == data.profile_id,
        AmazonAdsProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found or access denied")

    service = AmazonAdsService(db, current_user.id)
    success = await service.update_campaign_status(data.profile_id, campaign_id, data.status)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update campaign on Amazon")
        
    # Update local DB so UI reflects immediately without waiting for next sync
    records = db.query(AmazonAdsCampaignPerformance).filter(
        AmazonAdsCampaignPerformance.profile_id == data.profile_id,
        AmazonAdsCampaignPerformance.campaign_id == campaign_id
    ).all()
    for record in records:
        record.campaign_status = data.status.upper()
        
    # Create audit log
    audit_log = AmazonAdsAuditLog(
        user_id=current_user.id,
        profile_id=data.profile_id,
        action="MANUAL_STATUS_UPDATE",
        details={"campaign_id": campaign_id, "new_status": data.status.upper()}
    )
    db.add(audit_log)
    db.commit()
    
    # Invalidate cache
    cache_key_pattern = f"amazon_ads_campaigns:{current_user.id}:{data.profile_id}:*"
    try:
        keys = await redis_client.keys(cache_key_pattern)
        if keys:
            await redis_client.delete(*keys)
    except Exception:
        pass
        
    return {"message": "Status updated successfully", "status": data.status.upper()}


class KeywordStatusUpdate(BaseModel):
    profile_id: str
    status: str

@router.put("/keywords/{keyword_id}/status", dependencies=[Depends(RateLimit("default")), Depends(require_premium_tier)])
async def update_keyword_status(
    keyword_id: str,
    data: KeywordStatusUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually update a keyword's status and sync it to Amazon."""
    profile = db.query(AmazonAdsProfile).filter(
        AmazonAdsProfile.profile_id == data.profile_id,
        AmazonAdsProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found or access denied")

    service = AmazonAdsService(db, current_user.id)
    success = await service.update_keyword_status(data.profile_id, keyword_id, data.status)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update keyword on Amazon")
        
    # Update local DB so UI reflects immediately
    records = db.query(AmazonAdsKeywordPerformance).filter(
        AmazonAdsKeywordPerformance.profile_id == data.profile_id,
        AmazonAdsKeywordPerformance.keyword_id == keyword_id
    ).all()
    for record in records:
        record.state = data.status.upper()
        
    # Create audit log
    audit_log = AmazonAdsAuditLog(
        user_id=current_user.id,
        profile_id=data.profile_id,
        action="MANUAL_KEYWORD_UPDATE",
        details={"keyword_id": keyword_id, "new_status": data.status.upper()}
    )
    db.add(audit_log)
    db.commit()
    
    # Invalidate cache
    cache_key_pattern = f"amazon_ads_keywords:{current_user.id}:{data.profile_id}:*"
    try:
        keys = await redis_client.keys(cache_key_pattern)
        if keys:
            await redis_client.delete(*keys)
    except Exception:
        pass
        
    return {"message": "Keyword status updated successfully", "status": data.status.upper()}


@router.get("/campaigns/{campaign_id}/keywords", dependencies=[Depends(RateLimit("default")), Depends(require_premium_tier)])
async def get_campaign_keywords(
    campaign_id: str,
    profile_id: str,
    date_range: str = Query("30d"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get keyword performance for a specific campaign."""
    start_date, end_date = parse_date_range(date_range)
    
    # Audit Log
    try:
        audit_log = AmazonAdsAuditLog(
            user_id=current_user.id,
            profile_id=profile_id,
            action="VIEW_KEYWORD_DATA",
            details={
                "campaign_id": campaign_id,
                "date_range": date_range,
                "start_date": start_date.strftime("%Y-%m-%d"), 
                "end_date": end_date.strftime("%Y-%m-%d")
            }
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record audit log for keyword view: {e}")

    cache_key = f"amazon_ads_keywords:{current_user.id}:{profile_id}:{campaign_id}:{date_range}"
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        pass

    keywords = db.query(
        AmazonAdsKeywordPerformance.keyword_id,
        func.max(AmazonAdsKeywordPerformance.keyword_text).label("keyword_text"),
        func.max(AmazonAdsKeywordPerformance.match_type).label("match_type"),
        func.max(AmazonAdsKeywordPerformance.state).label("state"),
        func.sum(AmazonAdsKeywordPerformance.spend).label("spend"),
        func.sum(AmazonAdsKeywordPerformance.sales).label("sales"),
        func.sum(AmazonAdsKeywordPerformance.impressions).label("impressions"),
        func.sum(AmazonAdsKeywordPerformance.clicks).label("clicks"),
    ).filter(
        AmazonAdsKeywordPerformance.user_id == current_user.id,
        AmazonAdsKeywordPerformance.profile_id == profile_id,
        AmazonAdsKeywordPerformance.campaign_id == campaign_id,
        AmazonAdsKeywordPerformance.date >= start_date,
        AmazonAdsKeywordPerformance.date <= end_date
    ).group_by(AmazonAdsKeywordPerformance.keyword_id).all()

    result = []
    for k in keywords:
        spend = float(k.spend or 0)
        sales = float(k.sales or 0)
        acos = (spend / sales * 100) if sales > 0 else 0
        
        result.append({
            "keyword_id": k.keyword_id,
            "keyword_text": k.keyword_text,
            "match_type": k.match_type,
            "state": k.state,
            "spend": spend,
            "sales": sales,
            "impressions": int(k.impressions or 0),
            "clicks": int(k.clicks or 0),
            "acos": round(acos, 2)
        })

    try:
        await redis_client.setex(cache_key, 300, json.dumps(result))
    except Exception:
        pass

    return result

@router.get("/search-terms", dependencies=[Depends(RateLimit("default")), Depends(require_premium_tier)])
async def get_search_terms(
    profile_id: str,
    date_range: str = Query("30d"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get performance by search term (Premium Only)."""
    start_date, end_date = parse_date_range(date_range)

    # 1. First, get aggregated search terms
    search_terms = db.query(
        AmazonAdsSearchTermPerformance.search_term,
        func.max(AmazonAdsSearchTermPerformance.campaign_id).label("campaign_id"),
        func.max(AmazonAdsSearchTermPerformance.ad_group_id).label("ad_group_id"),
        func.max(AmazonAdsSearchTermPerformance.keyword_text).label("keyword_text"),
        func.max(AmazonAdsSearchTermPerformance.match_type).label("match_type"),
        func.sum(AmazonAdsSearchTermPerformance.spend).label("spend"),
        func.sum(AmazonAdsSearchTermPerformance.sales).label("sales"),
        func.sum(AmazonAdsSearchTermPerformance.impressions).label("impressions"),
        func.sum(AmazonAdsSearchTermPerformance.clicks).label("clicks"),
    ).filter(
        AmazonAdsSearchTermPerformance.user_id == current_user.id,
        AmazonAdsSearchTermPerformance.profile_id == profile_id,
        AmazonAdsSearchTermPerformance.date >= start_date,
        AmazonAdsSearchTermPerformance.date <= end_date
    ).group_by(AmazonAdsSearchTermPerformance.search_term).all()

    result_list = []
    for st in search_terms:
        spend = float(st.spend or 0)
        sales = float(st.sales or 0)
        acos = (spend / sales * 100) if sales > 0 else 0
        
        result_list.append({
            "search_term": st.search_term,
            "campaign_id": st.campaign_id,
            "ad_group_id": st.ad_group_id,
            "keyword_text": st.keyword_text,
            "match_type": st.match_type,
            "spend": spend,
            "sales": sales,
            "impressions": int(st.impressions or 0),
            "clicks": int(st.clicks or 0),
            "acos": round(acos, 2)
        })

    # Sort by spend descending
    result_list.sort(key=lambda x: x["spend"], reverse=True)
    return {"search_terms": result_list}


class NegateSearchTermRequest(BaseModel):
    profile_id: str
    campaign_id: str
    ad_group_id: str
    search_term: str

@router.post("/search-terms/negate", dependencies=[Depends(RateLimit("default")), Depends(require_premium_tier)])
async def negate_search_term(
    request: NegateSearchTermRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a search term as a negative exact keyword."""
    profile = db.query(AmazonAdsProfile).filter(
        AmazonAdsProfile.profile_id == request.profile_id,
        AmazonAdsProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found or access denied")

    service = AmazonAdsService(db, current_user.id)
    success = await service.add_negative_keyword(
        request.profile_id, 
        request.campaign_id, 
        request.ad_group_id, 
        request.search_term
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add negative keyword to Amazon")
        
    # Log the action (DPDP compliant)
    audit_log = AmazonAdsAuditLog(
        user_id=current_user.id,
        profile_id=request.profile_id,
        action="MANUAL_SEARCH_TERM_NEGATED",
        details={
            "campaign_id": request.campaign_id, 
            "search_term": request.search_term
        }
    )
    db.add(audit_log)
    db.commit()

    return {"message": "Successfully added negative keyword"}

class SavedFilterRequest(BaseModel):
    profile_id: str
    module: str
    filter_name: str
    filter_config: dict

@router.post("/filters", dependencies=[Depends(RateLimit("default")), Depends(require_premium_tier)])
async def save_filter(
    request: SavedFilterRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save an advanced filter for a profile."""
    # Check if a filter with this name already exists for this profile and module
    existing = db.query(UserSavedFilters).filter(
        UserSavedFilters.user_id == current_user.id,
        UserSavedFilters.profile_id == request.profile_id,
        UserSavedFilters.module == request.module,
        UserSavedFilters.filter_name == request.filter_name
    ).first()
    
    if existing:
        existing.filter_config = request.filter_config
    else:
        new_filter = UserSavedFilters(
            user_id=current_user.id,
            profile_id=request.profile_id,
            module=request.module,
            filter_name=request.filter_name,
            filter_config=request.filter_config
        )
        db.add(new_filter)
        
    db.commit()
    return {"message": "Filter saved successfully"}
    
@router.get("/filters", dependencies=[Depends(RateLimit("default")), Depends(require_premium_tier)])
async def get_saved_filters(
    profile_id: str,
    module: str = Query("amazon_ads_keywords"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all saved filters for a specific profile and module."""
    filters = db.query(UserSavedFilters).filter(
        UserSavedFilters.user_id == current_user.id,
        UserSavedFilters.profile_id == profile_id,
        UserSavedFilters.module == module
    ).all()
    
    return [
        {
            "id": f.id,
            "name": f.filter_name,
            "config": f.filter_config
        } for f in filters
    ]


class AutomationRuleRequest(BaseModel):
    profile_id: str
    rule_type: str
    rule_config: Dict[str, Any]

@router.post("/automations", dependencies=[Depends(RateLimit("default")), Depends(require_premium_tier)])
async def save_automation_rule(
    request: AutomationRuleRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or update an automation rule for a profile."""
    # Verify profile belongs to user
    profile = db.query(AmazonAdsProfile).filter(
        AmazonAdsProfile.profile_id == request.profile_id,
        AmazonAdsProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found or access denied")

    # Check if rule exists
    existing_rule = db.query(AmazonAdsAutomationRules).filter(
        AmazonAdsAutomationRules.user_id == current_user.id,
        AmazonAdsAutomationRules.profile_id == request.profile_id,
        AmazonAdsAutomationRules.rule_type == request.rule_type
    ).first()

    if existing_rule:
        existing_rule.rule_config = request.rule_config
        existing_rule.is_active = True
    else:
        new_rule = AmazonAdsAutomationRules(
            user_id=current_user.id,
            profile_id=request.profile_id,
            rule_type=request.rule_type,
            rule_config=request.rule_config,
            is_active=True
        )
        db.add(new_rule)
    
    # Create audit log
    audit_log = AmazonAdsAuditLog(
        user_id=current_user.id,
        profile_id=request.profile_id,
        action="AUTOMATION_RULE_UPDATED",
        details={"rule_type": request.rule_type, "rule_config": request.rule_config}
    )
    db.add(audit_log)
    db.commit()

    return {"status": "success", "message": f"{request.rule_type} automation saved successfully"}
