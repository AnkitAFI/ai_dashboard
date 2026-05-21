from __future__ import annotations
 
import json
import logging
import math
import os
import re
import threading
from datetime import datetime, timedelta, timezone
from typing import AsyncGenerator, Optional
 
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
 
from app.db.session import get_db, SessionLocal
from app.api.deps import get_current_user
from app.models.legacy_models import (
    TrackedProduct,
    User,
    RankTrackedKeyword,
    RankSnapshot,
    RankCompetitorPosition,
    RankAlertLog,
)
 
from app.core.config import settings
 
logger = logging.getLogger(__name__)
 
router = APIRouter(prefix="/rank-tracker", tags=["Rank Tracker"])
 
# ── Ollama ────────────────────────────────────────────────────────────────────
OLLAMA_URL     = f"{settings.OLLAMA_BASE_URL}/api/generate"
OLLAMA_MODEL   = "llama3.2:3b"
OLLAMA_TIMEOUT = 45.0
 
# ── RapidAPI ──────────────────────────────────────────────────────────────────
RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com"
 
# ── Tier limits ───────────────────────────────────────────────────────────────
KEYWORD_LIMITS = {"free": 1, "basic": 10, "premium": 50}
HISTORY_DAYS   = {"free": 0, "basic": 7,  "premium": 30}
 
# ── Rate limit ────────────────────────────────────────────────────────────────
REFRESH_COOLDOWN_MINUTES = 30
 
 
# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC REQUEST SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────
 
class AddKeywordRequest(BaseModel):
    asin:       str
    seller_id:  str
    user_email: Optional[str] = None
    keyword:    str
 
 
class RemoveKeywordRequest(BaseModel):
    asin:       str
    seller_id:  str
    user_email: Optional[str] = None
    keyword:    str
 
 
class RefreshRequest(BaseModel):
    asin:       str
    seller_id:  str
    user_email: Optional[str] = None
 
 
class AIInsightRequest(BaseModel):
    asin:       str
    seller_id:  str
    user_id:    Optional[str] = None
    user_email: Optional[str] = None
 
 
# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────
 
def _get_user_tier(db: Session, user_email: Optional[str]) -> str:
    if not user_email:
        return "free"
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if user and user.subscription_tier:
            return user.subscription_tier.lower().strip()
    except Exception as exc:
        logger.warning("_get_user_tier: %s", exc)
    return "free"
 
 
def _keyword_limit(tier: str) -> int:
    return KEYWORD_LIMITS.get(tier, 1)
 
 
def _history_days(tier: str) -> int:
    return HISTORY_DAYS.get(tier, 0)
 
 
def _clean_keyword(kw: str) -> str:
    return kw.strip().lower()[:200]
 
 
def _rank_status(current: Optional[int], previous: Optional[int]) -> str:
    if current is None:
        return "lost"
    if previous is None:
        return "new"
    if current < previous:
        return "up"
    if current > previous:
        return "down"
    return "stable"
 
 
def _rank_change(current: Optional[int], previous: Optional[int]) -> Optional[int]:
    """Negative = improved (moved up), positive = dropped."""
    if current is None or previous is None:
        return None
    return current - previous
 
 
def _page_number(rank: Optional[int]) -> Optional[int]:
    if rank is None:
        return None
    return math.ceil(rank / 10)
 
 
def _volatility_score(history: list) -> int:
    """0–10 score based on std deviation of rank positions."""
    valid = [r for r in history if r is not None]
    if len(valid) < 2:
        return 0
    mean = sum(valid) / len(valid)
    std  = math.sqrt(sum((r - mean) ** 2 for r in valid) / len(valid))
    return min(10, round(std / 5))
 
 
def _keyword_rank_score(keywords: list) -> int:
    """Weighted 0–100 score across all tracked keywords."""
    if not keywords:
        return 0
    scores = []
    for kw in keywords:
        rank = kw.get("current_rank")
        if rank is None:
            scores.append(0)
        elif rank <= 3:
            scores.append(100)
        elif rank <= 10:
            scores.append(85)
        elif rank <= 20:
            scores.append(65)
        elif rank <= 50:
            scores.append(40)
        else:
            scores.append(15)
    return round(sum(scores) / len(scores))
 
 
def _extract_suggestions_from_title(product_title: str) -> list:
    """Generate keyword suggestions from the product title."""
    if not product_title:
        return []
 
    import html as html_lib
    title  = html_lib.unescape(product_title).lower()
    title  = re.sub(r"[^a-z0-9\s\-]", " ", title)
    tokens = [t.strip("-") for t in title.split() if len(t.strip("-")) >= 3]
 
    stop = {
        "the", "and", "for", "with", "this", "that", "from", "are",
        "not", "but", "all", "can", "has", "have", "been", "will",
        "your", "our", "its", "was", "www", "com", "label", "may",
        "change", "pack",
    }
    tokens = [t for t in tokens if t not in stop]
 
    suggestions: list = []
    seen: set          = set()
 
    spec_re = re.compile(
        r"^\d+\s*(gb|tb|mb|mhz|ghz|mp|mm|inch|in|cm|ml|kg|g|oz|lb|mb/s|gb/s)$"
    )
 
    for t in tokens:
        if (spec_re.match(t) or len(t) >= 5) and t not in seen:
            seen.add(t)
            suggestions.append(t)
 
    for i in range(len(tokens) - 1):
        bg = f"{tokens[i]} {tokens[i + 1]}"
        if bg not in seen:
            seen.add(bg)
            suggestions.append(bg)
 
    for i in range(len(tokens) - 2):
        tg = f"{tokens[i]} {tokens[i + 1]} {tokens[i + 2]}"
        if tg not in seen:
            seen.add(tg)
            suggestions.append(tg)
 
    return suggestions[:20]
 
 
# ─────────────────────────────────────────────────────────────────────────────
# LIVE RANK CHECK  (RapidAPI)
# ─────────────────────────────────────────────────────────────────────────────
 
def _get_rapidapi_key() -> str:
    return os.getenv("RAPIDAPI_KEY", "")
 
 
def _check_rank_via_rapidapi(
    keyword:   str,
    asin:      str,
    country:   str = "US",
    max_pages: int = 3,
) -> dict:
    """
    Search Amazon for the keyword and find where `asin` appears.
    Returns dict: {rank_position, page_number, is_sponsored}
    """
    key = _get_rapidapi_key()
    if not key:
        logger.warning("RAPIDAPI_KEY not set — rank check skipped for '%s'", keyword)
        return {"rank_position": None, "page_number": None, "is_sponsored": False}
 
    headers = {
        "x-rapidapi-key":  key,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }
 
    overall_position = 0
 
    try:
        with httpx.Client(timeout=15.0) as client:
            for page in range(1, max_pages + 1):
                resp = client.get(
                    f"https://{RAPIDAPI_HOST}/search",
                    params={
                        "query":   keyword,
                        "page":    str(page),
                        "country": country.upper(),
                        "sort_by": "RELEVANCE",
                    },
                    headers=headers,
                )
                if resp.status_code != 200:
                    logger.warning(
                        "RapidAPI search returned %s for '%s'",
                        resp.status_code, keyword,
                    )
                    break
 
                data    = resp.json()
                results = data.get("data", {}).get("products", [])
                if not results:
                    break
 
                for item in results:
                    overall_position += 1
                    if (item.get("asin") or "").upper() == asin.upper():
                        return {
                            "rank_position": overall_position,
                            "page_number":   page,
                            "is_sponsored":  bool(item.get("is_sponsored", False)),
                        }
 
    except Exception as exc:
        logger.warning("RapidAPI rank check failed for '%s': %s", keyword, exc)
 
    return {"rank_position": None, "page_number": None, "is_sponsored": False}
 
 
def _check_and_fire_alerts(
    db:         Session,
    seller_id:  str,
    asin:       str,
    user_email: Optional[str],
    keyword:    str,
    new_rank:   Optional[int],
) -> None:
    """Compare new rank to previous snapshot and write alert rows."""
    prev_row = (
        db.query(RankSnapshot)
        .filter(
            RankSnapshot.seller_id  == seller_id,
            RankSnapshot.asin       == asin,
            RankSnapshot.keyword    == keyword,
            RankSnapshot.checked_at < datetime.utcnow() - timedelta(minutes=5),
            RankSnapshot.checked_at >= datetime.utcnow() - timedelta(days=2),
        )
        .order_by(RankSnapshot.checked_at.desc())
        .first()
    )
    if not prev_row:
        return
 
    prev_rank = prev_row.rank_position
    alerts    = []
 
    if new_rank and prev_rank and (new_rank - prev_rank) >= 5:
        alerts.append({
            "type": "drop",
            "msg":  f'"{keyword}" dropped from #{prev_rank} → #{new_rank}',
            "old":  prev_rank, "new": new_rank,
        })
 
    if new_rank and new_rank <= 10 and (prev_rank is None or prev_rank > 10):
        alerts.append({
            "type": "enter_top10",
            "msg":  f'"{keyword}" entered Top 10 — now ranking #{new_rank}',
            "old":  prev_rank, "new": new_rank,
        })
 
    if new_rank is None and prev_rank is not None:
        alerts.append({
            "type": "lost",
            "msg":  f'"{keyword}" dropped out of top 100 results (was #{prev_rank})',
            "old":  prev_rank, "new": None,
        })
 
    for a in alerts:
        try:
            db.add(RankAlertLog(
                seller_id  = seller_id,
                asin       = asin,
                user_email = user_email,
                keyword    = keyword,
                alert_type = a["type"],
                alert_msg  = a["msg"],
                old_rank   = a["old"],
                new_rank   = a["new"],
            ))
            db.commit()
        except Exception as exc:
            logger.warning("Alert log write failed: %s", exc)
            db.rollback()
 
 
def _run_rank_checks_in_thread(
    seller_id:  str,
    asin:       str,
    user_email: Optional[str],
    keywords:   list,
    country:    str,
) -> None:
    """
    Background thread worker.
    Creates its OWN database session — never shares the request session.
    This is the fix for sqlalchemy.exc.InvalidRequestError: concurrent operations.
    """
    # ── Each thread gets its own isolated session ──────────────────────────
    db: Session = SessionLocal()
    try:
        tier       = _get_user_tier(db, user_email)
        is_premium = tier == "premium"
 
        for keyword in keywords:
            try:
                result = _check_rank_via_rapidapi(keyword, asin, country)
 
                db.add(RankSnapshot(
                    seller_id     = seller_id,
                    asin          = asin,
                    user_email    = user_email,
                    keyword       = keyword,
                    rank_position = result["rank_position"],
                    page_number   = result["page_number"],
                    is_sponsored  = result["is_sponsored"],
                    country       = country,
                ))
                db.commit()
 
                if is_premium:
                    _check_and_fire_alerts(
                        db, seller_id, asin, user_email,
                        keyword, new_rank=result["rank_position"],
                    )
 
            except Exception as exc:
                logger.error("Rank check error for %s / %s: %s", asin, keyword, exc)
                db.rollback()
 
    finally:
        # Always close the thread-local session
        db.close()
 
 
# ─────────────────────────────────────────────────────────────────────────────
# PROFILE BUILDER
# ─────────────────────────────────────────────────────────────────────────────
 
def _build_tracked_keyword(
    keyword:    str,
    seller_id:  str,
    asin:       str,
    db:         Session,
    tier:       str,
    is_premium: bool,
) -> dict:
    """Build the full TrackedKeyword dict for one keyword."""
    days   = _history_days(tier)
    cutoff = datetime.utcnow() - timedelta(days=max(days, 2))
 
    snapshots = (
        db.query(RankSnapshot)
        .filter(
            RankSnapshot.seller_id  == seller_id,
            RankSnapshot.asin       == asin,
            RankSnapshot.keyword    == keyword,
            RankSnapshot.checked_at >= cutoff,
        )
        .order_by(RankSnapshot.checked_at.asc())
        .all()
    )
 
    if not snapshots:
        return {
            "keyword":          keyword,
            "current_rank":     None,
            "previous_rank":    None,
            "rank_change":      None,
            "page_number":      None,
            "is_sponsored":     False,
            "best_rank":        None,
            "worst_rank":       None,
            "status":           "new",
            "history":          [],
            "last_checked":     None,
            "volatility_score": 0,
            "competitor_ranks": [],
        }
 
    latest   = snapshots[-1]
    previous = snapshots[-2] if len(snapshots) >= 2 else None
 
    curr_rank = latest.rank_position
    prev_rank = previous.rank_position if previous else None
 
    ranks_valid = [s.rank_position for s in snapshots if s.rank_position is not None]
    best_rank   = min(ranks_valid) if ranks_valid else None
    worst_rank  = max(ranks_valid) if ranks_valid else None
 
    # Daily-deduplicated history for sparkline / chart
    history_map: dict = {}
    for snap in snapshots:
        day_key = snap.checked_at.strftime("%m/%d")
        history_map[day_key] = snap.rank_position
 
    history = [{"date": d, "rank": r} for d, r in sorted(history_map.items())]
 
    # Competitor ranks — premium only
    comp_ranks: list = []
    if is_premium:
        comp_rows = (
            db.query(RankCompetitorPosition)
            .filter(
                RankCompetitorPosition.seller_id  == seller_id,
                RankCompetitorPosition.asin       == asin,
                RankCompetitorPosition.keyword    == keyword,
                RankCompetitorPosition.checked_at >= datetime.utcnow() - timedelta(hours=48),
            )
            .order_by(RankCompetitorPosition.checked_at.desc())
            .limit(5)
            .all()
        )
        seen_comp: set = set()
        for row in comp_rows:
            if row.competitor_asin not in seen_comp:
                seen_comp.add(row.competitor_asin)
                comp_ranks.append({
                    "asin":  row.competitor_asin,
                    "title": row.competitor_title or row.competitor_asin,
                    "rank":  row.rank_position,
                })
 
    return {
        "keyword":          keyword,
        "current_rank":     curr_rank,
        "previous_rank":    prev_rank,
        "rank_change":      _rank_change(curr_rank, prev_rank),
        "page_number":      latest.page_number or _page_number(curr_rank),
        "is_sponsored":     bool(latest.is_sponsored),
        "best_rank":        best_rank,
        "worst_rank":       worst_rank,
        "status":           _rank_status(curr_rank, prev_rank),
        "history":          history,
        "last_checked":     latest.checked_at.isoformat() if latest.checked_at else None,
        "volatility_score": _volatility_score([s.rank_position for s in snapshots]),
        "competitor_ranks": comp_ranks,
    }
 
 
def _build_profile_response(
    tracked:    TrackedProduct,
    db:         Session,
    seller_id:  str,
    user_email: Optional[str],
    tier:       str,
) -> dict:
    """Assemble the full RankProfile response dict."""
    is_basic   = tier in ("basic", "premium")
    is_premium = tier == "premium"
 
    rows = (
        db.query(RankTrackedKeyword)
        .filter(
            RankTrackedKeyword.seller_id == seller_id,
            RankTrackedKeyword.asin      == tracked.asin,
        )
        .order_by(RankTrackedKeyword.added_at.asc())
        .all()
    )
 
    keywords_data: list = [
        _build_tracked_keyword(
            keyword    = row.keyword,
            seller_id  = seller_id,
            asin       = tracked.asin,
            db         = db,
            tier       = tier,
            is_premium = is_premium,
        )
        for row in rows
    ]
 
    in_top10 = sum(1 for k in keywords_data if k["current_rank"] and k["current_rank"] <= 10)
    in_top50 = sum(1 for k in keywords_data if k["current_rank"] and k["current_rank"] <= 50)
    lost     = sum(1 for k in keywords_data if k["status"] == "lost")
 
    rank_score = _keyword_rank_score(keywords_data) if is_basic and keywords_data else None
 
    already_tracked = {row.keyword for row in rows}
    suggestions     = [
        s for s in _extract_suggestions_from_title(tracked.product_title or "")
        if s not in already_tracked
    ]
 
    country = (getattr(tracked, "country", None) or "US").upper()
 
    return {
        "asin":               tracked.asin,
        "product_title":      tracked.product_title or "",
        "product_photo":      tracked.product_photo,
        "is_prime":           bool(tracked.is_prime),
        "is_best_seller":     bool(tracked.is_best_seller),
        "currency":           (tracked.currency or "USD").upper(),
        "country":            country,
        "tier":               tier,
        "keyword_limit":      _keyword_limit(tier),
        "keyword_rank_score": rank_score,
        "tracked_keywords":   keywords_data,
        "total_tracked":      len(keywords_data),
        "keywords_in_top10":  in_top10,
        "keywords_in_top50":  in_top50,
        "keywords_lost":      lost,
        "suggestions":        suggestions[:15],
    }
 
 
def _get_recent_alerts(
    db:        Session,
    seller_id: str,
    asin:      str,
    limit:     int = 10,
) -> list:
    cutoff = datetime.utcnow() - timedelta(days=7)
    
    # Query ONLY the RankSnapshot table
    snapshots = (
        db.query(RankSnapshot)
        .filter(
            RankSnapshot.seller_id  == seller_id,
            RankSnapshot.asin       == asin,
            RankSnapshot.checked_at >= cutoff,
        )
        .order_by(RankSnapshot.keyword, RankSnapshot.checked_at.asc())
        .all()
    )

    from collections import defaultdict
    kw_snapshots = defaultdict(list)
    for s in snapshots:
        kw_snapshots[s.keyword].append(s)

    alerts = []

    for keyword, snaps in kw_snapshots.items():
        for i in range(1, len(snaps)):
            prev_snap = snaps[i-1]
            curr_snap = snaps[i]
            prev_rank = prev_snap.rank_position
            curr_rank = curr_snap.rank_position

            # 1. Enter Top 10
            if curr_rank and curr_rank <= 10 and (prev_rank is None or prev_rank > 10):
                alerts.append({
                    "type": "success",
                    "msg": f'"{keyword}" entered Top 10 — now ranking #{curr_rank}',
                    "keyword": keyword,
                    "fired_at": curr_snap.checked_at.isoformat()
                })
            # 2. Rank Drop
            elif curr_rank and prev_rank and curr_rank > prev_rank:
                alert_type = "danger" if (curr_rank - prev_rank) >= 5 else "warn"
                msg = f'A competitor overtook you for "{keyword}" — they moved from #{prev_rank} to #{curr_rank}' if alert_type == "danger" else f'"{keyword}" dropped from #{prev_rank} → #{curr_rank} in the last 24 hours'
                alerts.append({
                    "type": alert_type,
                    "msg": msg,
                    "keyword": keyword,
                    "fired_at": curr_snap.checked_at.isoformat()
                })
            # 3. Lost ranking
            elif curr_rank is None and prev_rank is not None:
                alerts.append({
                    "type": "danger",
                    "msg": f'"{keyword}" dropped out of top 100 results (was #{prev_rank})',
                    "keyword": keyword,
                    "fired_at": curr_snap.checked_at.isoformat()
                })

    alerts.sort(key=lambda a: a["fired_at"], reverse=True)
    return alerts[:limit]
 
 
# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/profile")
def get_rank_profile(
    asin:       str           = Query(...),
    seller_id:  str           = Query(...),
    db:         Session       = Depends(get_db),
    current_user: User        = Depends(get_current_user),
) -> dict:
    """Load rank tracker profile for a given ASIN + seller."""
    tier = _get_user_tier(db, current_user.email)
 
    tracked = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.asin      == asin,
            TrackedProduct.seller_id == seller_id,
            TrackedProduct.user_email == current_user.email,
        )
        .first()
    )
    if not tracked:
        raise HTTPException(status_code=404, detail="Tracked product not found")
 
    profile = _build_profile_response(tracked, db, seller_id, current_user.email, tier)
 
    profile["recent_alerts"] = (
        _get_recent_alerts(db, seller_id, asin)
        if tier == "premium"
        else []
    )
 
    return profile
 
 
@router.post("/keywords/add")
def add_keyword(
    body: AddKeywordRequest,
    db:   Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Add a keyword to track for an ASIN.
    Enforces per-tier keyword limit.
    Triggers an immediate background rank check via RapidAPI.
    Returns updated profile.
    """
    tier    = _get_user_tier(db, current_user.email)
    limit   = _keyword_limit(tier)
    keyword = _clean_keyword(body.keyword)
 
    if not keyword:
        raise HTTPException(status_code=400, detail="Keyword cannot be empty")
 
    tracked = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.asin      == body.asin,
            TrackedProduct.seller_id == body.seller_id,
            TrackedProduct.user_email == current_user.email,
        )
        .first()
    )
    if not tracked:
        raise HTTPException(status_code=404, detail="Tracked product not found")
 
    current_count = (
        db.query(func.count(RankTrackedKeyword.id))
        .filter(
            RankTrackedKeyword.seller_id == body.seller_id,
            RankTrackedKeyword.asin      == body.asin,
        )
        .scalar()
    ) or 0
 
    if current_count >= limit:
        raise HTTPException(
            status_code=403,
            detail={
                "error":   "upgrade_required",
                "message": f"Keyword limit reached ({limit}). Upgrade to track more.",
                "tier":    tier,
                "limit":   limit,
            },
        )
 
    # Skip silently if already tracked
    existing = (
        db.query(RankTrackedKeyword)
        .filter(
            RankTrackedKeyword.seller_id == body.seller_id,
            RankTrackedKeyword.asin      == body.asin,
            RankTrackedKeyword.keyword   == keyword,
        )
        .first()
    )
 
    country = (getattr(tracked, "country", None) or "US").upper()
 
    if not existing:
        db.add(RankTrackedKeyword(
            seller_id  = body.seller_id,
            asin       = body.asin,
            user_email = current_user.email,
            keyword    = keyword,
            country    = country,
        ))
        db.commit()
 
        # ── Fire-and-forget background rank check ─────────────────────────
        # IMPORTANT: passes NO db session — thread creates its own SessionLocal()
        threading.Thread(
            target  = _run_rank_checks_in_thread,
            args    = (body.seller_id, body.asin, current_user.email, [keyword], country),
            daemon  = True,
        ).start()
 
    return _build_profile_response(tracked, db, body.seller_id, current_user.email, tier)
 
 
@router.post("/keywords/remove")
def remove_keyword(
    body: RemoveKeywordRequest,
    db:   Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Remove a tracked keyword and all its snapshot history."""
    keyword = _clean_keyword(body.keyword)
    tier    = _get_user_tier(db, current_user.email)
 
    tracked = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.asin      == body.asin,
            TrackedProduct.seller_id == body.seller_id,
            TrackedProduct.user_email == current_user.email,
        )
        .first()
    )
    if not tracked:
        raise HTTPException(status_code=404, detail="Tracked product not found")
 
    db.query(RankTrackedKeyword).filter(
        RankTrackedKeyword.seller_id == body.seller_id,
        RankTrackedKeyword.asin      == body.asin,
        RankTrackedKeyword.keyword   == keyword,
    ).delete()
 
    db.query(RankSnapshot).filter(
        RankSnapshot.seller_id == body.seller_id,
        RankSnapshot.asin      == body.asin,
        RankSnapshot.keyword   == keyword,
    ).delete()
 
    db.query(RankCompetitorPosition).filter(
        RankCompetitorPosition.seller_id == body.seller_id,
        RankCompetitorPosition.asin      == body.asin,
        RankCompetitorPosition.keyword   == keyword,
    ).delete()
 
    db.commit()
 
    return _build_profile_response(tracked, db, body.seller_id, current_user.email, tier)
 
 
@router.post("/refresh")
def refresh_ranks(
    body: RefreshRequest,
    db:   Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Trigger a fresh rank check for all tracked keywords of an ASIN.
    Rate-limited to once per REFRESH_COOLDOWN_MINUTES.
    Background thread does the actual checking — returns profile immediately.
    """
    tier = _get_user_tier(db, current_user.email)
 
    tracked = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.asin      == body.asin,
            TrackedProduct.seller_id == body.seller_id,
            TrackedProduct.user_email == current_user.email,
        )
        .first()
    )
    if not tracked:
        raise HTTPException(status_code=404, detail="Tracked product not found")
 
    # Rate limit check
    cooldown_cutoff = datetime.utcnow() - timedelta(minutes=REFRESH_COOLDOWN_MINUTES)
    recent_check    = (
        db.query(RankSnapshot)
        .filter(
            RankSnapshot.seller_id  == body.seller_id,
            RankSnapshot.asin       == body.asin,
            RankSnapshot.checked_at >= cooldown_cutoff,
        )
        .first()
    )
    if recent_check:
        raise HTTPException(
            status_code=429,
            detail={
                "error":   "rate_limited",
                "message": f"Please wait {REFRESH_COOLDOWN_MINUTES} minutes between refreshes.",
            },
        )
 
    kw_rows  = (
        db.query(RankTrackedKeyword)
        .filter(
            RankTrackedKeyword.seller_id == body.seller_id,
            RankTrackedKeyword.asin      == body.asin,
        )
        .all()
    )
    keywords = [row.keyword for row in kw_rows]
    country  = (getattr(tracked, "country", None) or "US").upper()
 
    if keywords:
        # ── Same fix: no db session passed to thread ───────────────────────
        threading.Thread(
            target  = _run_rank_checks_in_thread,
            args    = (body.seller_id, body.asin, current_user.email, keywords, country),
            daemon  = True,
        ).start()
 
    return _build_profile_response(tracked, db, body.seller_id, current_user.email, tier)
 
 
# ─────────────────────────────────────────────────────────────────────────────
# AI RANK INSIGHT  — SSE streaming, premium only
# ─────────────────────────────────────────────────────────────────────────────
 
def _build_rank_insight_prompt(profile: dict) -> str:
    keywords = profile.get("tracked_keywords", [])
    if not keywords:
        return ""
 
    kw_lines = []
    for kw in keywords[:15]:
        curr  = kw.get("current_rank")
        chg   = kw.get("rank_change")
        chg_s = (
            f"({'+' if chg and chg > 0 else ''}{chg})"
            if chg is not None else "(no change)"
        )
        hist  = kw.get("history", [])
        last3 = [str(h["rank"]) if h["rank"] else "—" for h in hist[-3:]]
        vol   = kw.get("volatility_score", 0)
        kw_lines.append(
            f'  • "{kw["keyword"]}": rank #{curr or "not found"} {chg_s}'
            + (f' | last 3: {", ".join(last3)}' if last3 else "")
            + (f' | volatility {vol}/10' if vol else "")
        )
 
    return (
        f"PRODUCT: \"{(profile.get('product_title') or '')[:80]}\"\n"
        f"OVERALL RANK SCORE: {profile.get('keyword_rank_score', '—')}/100\n"
        f"TOP 10: {profile.get('keywords_in_top10', 0)} | "
        f"TOP 50: {profile.get('keywords_in_top50', 0)} | "
        f"NOT FOUND: {profile.get('keywords_lost', 0)}\n\n"
        f"KEYWORD RANK DATA:\n" + "\n".join(kw_lines) + "\n\n"
        "You are an Amazon SEO specialist. Analyse the rank data above and provide:\n"
        "1. A 1-sentence overall health summary\n"
        "2. The 2 most important keywords to act on right now "
        "(specific keyword names + what to do)\n"
        "3. One observation about rank trends or volatility patterns\n"
        "Be direct and specific. Use **bold** for keyword names."
    )
 
 
async def _stream_ollama(prompt: str) -> AsyncGenerator[str, None]:
    """Stream Ollama response token by token as SSE events."""
    body = {
        "model":   OLLAMA_MODEL,
        "prompt":  prompt,
        "stream":  True,
        "options": {"num_predict": 350, "temperature": 0.3},
    }
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            async with client.stream("POST", OLLAMA_URL, json=body) as resp:
                if resp.status_code != 200:
                    yield f"data: {json.dumps('AI service unavailable.')}\n\n"
                    yield "data: [DONE]\n\n"
                    return
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                        token = chunk.get("response", "")
                        if token:
                            yield f"data: {json.dumps(token)}\n\n"
                        if chunk.get("done"):
                            yield "data: [DONE]\n\n"
                            return
                    except json.JSONDecodeError:
                        continue
    except Exception as exc:
        logger.warning("Ollama stream error: %s", exc)
        yield f"data: {json.dumps('Analysis unavailable — Ollama offline.')}\n\n"
        yield "data: [DONE]\n\n"
 
 
@router.post("/ai/rank-insight")
async def ai_rank_insight(
    body: AIInsightRequest,
    db:   Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    """Premium-only SSE endpoint. Streams AI analysis of rank trends."""
    tier = _get_user_tier(db, current_user.email)
 
    if tier != "premium":
        async def _gate() -> AsyncGenerator[str, None]:
            yield f"data: {json.dumps('upgrade_required')}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(_gate(), media_type="text/event-stream")
 
    tracked = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.asin      == body.asin,
            TrackedProduct.seller_id == body.seller_id,
            TrackedProduct.user_email == current_user.email,
        )
        .first()
    )
    if not tracked:
        async def _not_found() -> AsyncGenerator[str, None]:
            yield f"data: {json.dumps('Product not found.')}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(_not_found(), media_type="text/event-stream")
 
    profile = _build_profile_response(tracked, db, body.seller_id, current_user.email, tier)
    prompt  = _build_rank_insight_prompt(profile)
 
    if not prompt:
        async def _no_data() -> AsyncGenerator[str, None]:
            yield f"data: {json.dumps('No keyword data yet. Add keywords first.')}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(_no_data(), media_type="text/event-stream")
 
    return StreamingResponse(
        _stream_ollama(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control":     "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


