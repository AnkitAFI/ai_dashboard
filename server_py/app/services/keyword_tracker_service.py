# # app/services/keyword_tracker_service.py

# """
# Keyword Tracker Service
# =======================
# All DB tables use kw_ prefix to avoid conflicts with existing tables.
# user_id is INTEGER (matches users.id in legacy_models.py).

# AI powered by Ollama llama3.2:3b — runs locally, no API key needed.
# AI responses are cached in-memory (TTL: 1 hour) to avoid hammering Ollama.

# Tier limits:
#   Free    : 3 keywords, 1 product, 1 check/day, no history, no competitors
#   Basic   : 25 keywords, 5 products, 2 checks/day, 30-day history, 2 competitors
#   Premium : unlimited, hourly checks, full history, 10 competitors, WhatsApp alerts
# """

# from __future__ import annotations

# import logging
# import time
# import hashlib
# from datetime import datetime, timedelta, timezone
# from typing import List, Optional, Tuple, Dict

# from sqlalchemy import text
# from sqlalchemy.orm import Session

# from app.schemas.keyword_tracker_schema import (
#     AlertSettingsOut,
#     AlertSettingsRequest,
#     CompetitorRankOut,
#     KeywordDashboardOut,
#     KeywordHistoryOut,
#     KeywordOut,
#     KeywordSuggestion,
#     RankHistoryPoint,
#     SuggestionsOut,
#     TierLimits,
# )

# logger = logging.getLogger(__name__)


# # ── AI Setup ──────────────────────────────────────────────────────────────────

# import httpx
# import json

# OLLAMA_BASE_URL = "http://localhost:11434"
# OLLAMA_MODEL = "llama3.2:3b"
# OLLAMA_TIMEOUT = 60

# # Simple in-memory cache: { cache_key: (response_str, timestamp) }
# _ai_cache: Dict[str, Tuple[str, float]] = {}
# AI_CACHE_TTL = 3600  # 1 hour


# def _cache_key(*parts: str) -> str:
#     raw = "|".join(str(p) for p in parts)
#     return hashlib.md5(raw.encode()).hexdigest()


# def _ask_llama(prompt: str, cache_key: str) -> str:
#     """
#     Call Ollama via HTTP (no SDK) with caching.
#     """
#     # Cache check
#     cached = _ai_cache.get(cache_key)
#     if cached:
#         response, ts = cached
#         if time.time() - ts < AI_CACHE_TTL:
#             logger.debug(f"AI cache hit: {cache_key[:8]}…")
#             return response

#     payload = {
#         "model": OLLAMA_MODEL,
#         "prompt": prompt,
#         "stream": False,
#         "system": (
#             "You are an expert e-commerce strategist for Amazon and Flipkart sellers in India. "
#             "You give sharp, actionable, human advice — like a senior consultant who knows the seller's business intimately. "
#             "Be concise (2-4 sentences max unless asked for more). "
#             "No bullet points unless specifically asked. "
#             "Never use filler phrases like 'Great question!' or 'Certainly!' or 'Of course!'. "
#             "Talk directly to the seller as 'you'. Be honest, specific, and a little bold. "
#             "If something is declining, say it plainly and tell them exactly what to fix."
#         ),
#         "options": {
#             "temperature": 0.7,
#             "num_predict": 300,
#         },
#     }

#     try:
#         with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
#             resp = client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)

#         if resp.status_code != 200:
#             logger.error(f"Ollama HTTP error: {resp.status_code}")
#             return ""

#         data = resp.json()
#         response = data.get("response", "").strip()

#         _ai_cache[cache_key] = (response, time.time())
#         return response

#     except Exception as e:
#         logger.error(f"Ollama HTTP call failed: {e}")
#         return ""


# # ── Tier configuration ────────────────────────────────────────────────────────

# TIER_ORDER = {"free": 0, "basic": 1, "premium": 2}

# TIER_LIMITS: dict[str, TierLimits] = {
#     "free": TierLimits(
#         keyword_limit=3,
#         product_limit=1,
#         history_days=0,
#         competitor_limit=0,
#         checks_per_day=1,
#         alerts_email=False,
#         alerts_whatsapp=False,
#         keyword_suggestions=False,
#         opportunity_score=False,
#     ),
#     "basic": TierLimits(
#         keyword_limit=25,
#         product_limit=5,
#         history_days=30,
#         competitor_limit=2,
#         checks_per_day=2,
#         alerts_email=True,
#         alerts_whatsapp=False,
#         keyword_suggestions=True,
#         opportunity_score=False,
#     ),
#     "premium": TierLimits(
#         keyword_limit=-1,
#         product_limit=-1,
#         history_days=9999,
#         competitor_limit=10,
#         checks_per_day=24,
#         alerts_email=True,
#         alerts_whatsapp=True,
#         keyword_suggestions=True,
#         opportunity_score=True,
#     ),
# }


# # ── Internal helpers ──────────────────────────────────────────────────────────

# def _get_user_tier(user_id: int, db: Session) -> str:
#     row = db.execute(
#         text("SELECT subscription_tier FROM users WHERE id = :uid LIMIT 1"),
#         {"uid": user_id},
#     ).fetchone()
#     return str(row[0]).lower() if row and row[0] else "free"


# def _require_tier(user_id: int, required: str, db: Session) -> str:
#     tier = _get_user_tier(user_id, db)
#     if TIER_ORDER.get(tier, 0) < TIER_ORDER.get(required, 0):
#         raise PermissionError(f"upgrade_required:{required}")
#     return tier


# def _limits(tier: str) -> TierLimits:
#     return TIER_LIMITS.get(tier, TIER_LIMITS["free"])


# def _count_active_keywords(user_id: int, db: Session) -> int:
#     row = db.execute(
#         text("SELECT COUNT(*) FROM kw_tracked WHERE user_id = :uid AND is_active = TRUE"),
#         {"uid": user_id},
#     ).fetchone()
#     return int(row[0]) if row else 0


# def _distinct_products(user_id: int, db: Session) -> set:
#     rows = db.execute(
#         text("SELECT DISTINCT asin_or_pid FROM kw_tracked WHERE user_id = :uid AND is_active = TRUE"),
#         {"uid": user_id},
#     ).fetchall()
#     return {r[0] for r in rows}


# # ── Rank stub (swap for real RapidAPI call later) ─────────────────────────────

# def _fetch_rank_from_market(
#     keyword: str,
#     asin_or_pid: str,
#     platform: str,
#     db: Session,
# ) -> Optional[int]:
#     """
#     Queries your existing product tables to approximate rank.
#     Products are ranked by avg_sales_volume DESC — position = rank.
#     Replace with a real search API call when ready.
#     """
#     try:
#         if platform == "amazon":
#             rows = db.execute(text("""
#                 SELECT asin
#                 FROM rapidapi_amazon_products
#                 WHERE LOWER(product_title) LIKE :kw
#                   AND product_price_numeric > 0
#                 ORDER BY avg_sales_volume DESC NULLS LAST
#                 LIMIT 100
#             """), {"kw": f"%{keyword.lower()}%"}).fetchall()
#             for idx, row in enumerate(rows, start=1):
#                 if str(row[0]) == asin_or_pid:
#                     return idx
#         else:
#             rows = db.execute(text("""
#                 SELECT pid
#                 FROM rapidapi_flipkart_products
#                 WHERE LOWER(product_title) LIKE :kw
#                   AND product_price > 0
#                 ORDER BY avg_sales_volume DESC NULLS LAST
#                 LIMIT 100
#             """), {"kw": f"%{keyword.lower()}%"}).fetchall()
#             for idx, row in enumerate(rows, start=1):
#                 if str(row[0]) == asin_or_pid:
#                     return idx
#         return None
#     except Exception as e:
#         logger.error(f"_fetch_rank_from_market error: {e}")
#         return None


# # ── Dashboard ─────────────────────────────────────────────────────────────────

# def get_dashboard(user_id: int, db: Session) -> KeywordDashboardOut:
#     tier   = _get_user_tier(user_id, db)
#     limits = _limits(tier)

#     rows = db.execute(text("""
#         SELECT id, keyword, asin_or_pid, platform, category,
#                current_rank, previous_rank, last_checked_at, created_at, is_active
#         FROM kw_tracked
#         WHERE user_id = :uid AND is_active = TRUE
#         ORDER BY created_at DESC
#     """), {"uid": user_id}).fetchall()

#     keywords: List[KeywordOut] = []
#     improving = declining = stable = not_ranked = 0

#     for r in rows:
#         current_rank  = r[5]
#         previous_rank = r[6]
#         rank_change   = None

#         if current_rank is None:
#             not_ranked += 1
#         elif previous_rank is None:
#             stable += 1
#         else:
#             diff = previous_rank - current_rank  # positive = improved
#             rank_change = diff
#             if diff > 0:   improving += 1
#             elif diff < 0: declining += 1
#             else:          stable    += 1

#         keywords.append(KeywordOut(
#             id=r[0], keyword=r[1], asin_or_pid=r[2], platform=r[3],
#             category=r[4], current_rank=current_rank,
#             previous_rank=previous_rank, rank_change=rank_change,
#             last_checked_at=r[7], created_at=r[8], is_active=r[9],
#         ))

#     total     = len(keywords)
#     kw_limit  = limits.keyword_limit
#     remaining = max(0, kw_limit - total) if kw_limit != -1 else -1

#     # ── AI dashboard insight (Basic+ only) ────────────────────────────────────
#     ai_insight: Optional[str] = None
#     if total > 0 and TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
#         kw_summary = ", ".join(
#             f'"{k.keyword}" '
#             f'(rank #{k.current_rank or "unranked"}, '
#             f'{"up" if (k.rank_change or 0) > 0 else "down" if (k.rank_change or 0) < 0 else "stable"} '
#             f'{abs(k.rank_change or 0)} spots)'
#             for k in keywords[:8]
#         )
#         prompt = (
#             f"I'm an Amazon/Flipkart seller tracking {total} keywords. "
#             f"Here's my current ranking snapshot: {kw_summary}. "
#             f"I have {improving} improving, {declining} declining, {stable} stable, "
#             f"and {not_ranked} unranked keywords. "
#             f"Give me ONE sharp, specific insight about what this pattern means for my business "
#             f"and the single most important thing I should do right now. "
#             f"Be direct — no fluff."
#         )
#         ck = _cache_key("dashboard_insight", str(user_id), str(improving), str(declining), str(not_ranked))
#         ai_insight = _ask_llama(prompt, ck)

#     return KeywordDashboardOut(
#         tier=tier,
#         tier_limits=limits,
#         keywords_used=total,
#         keywords_remaining=remaining,
#         total_keywords=total,
#         improving=improving,
#         declining=declining,
#         stable=stable,
#         not_ranked=not_ranked,
#         keywords=keywords,
#         ai_insight=ai_insight,
#     )


# # ── Add keyword ───────────────────────────────────────────────────────────────

# def add_keyword(user_id: int, req, db: Session) -> KeywordOut:
#     tier   = _get_user_tier(user_id, db)
#     limits = _limits(tier)

#     # Keyword count limit
#     current_count = _count_active_keywords(user_id, db)
#     if limits.keyword_limit != -1 and current_count >= limits.keyword_limit:
#         raise PermissionError(
#             f"upgrade_required:keyword_limit (used {current_count}/{limits.keyword_limit})"
#         )

#     # Product count limit
#     existing_pids  = _distinct_products(user_id, db)
#     is_new_product = req.asin_or_pid not in existing_pids
#     if is_new_product and limits.product_limit != -1:
#         if len(existing_pids) >= limits.product_limit:
#             raise PermissionError(
#                 f"upgrade_required:product_limit (used {len(existing_pids)}/{limits.product_limit})"
#             )

#     # Duplicate check
#     dup = db.execute(text("""
#         SELECT id FROM kw_tracked
#         WHERE user_id = :uid AND LOWER(keyword) = LOWER(:kw)
#           AND asin_or_pid = :pid AND platform = :platform AND is_active = TRUE
#         LIMIT 1
#     """), {"uid": user_id, "kw": req.keyword, "pid": req.asin_or_pid, "platform": req.platform}).fetchone()
#     if dup:
#         raise ValueError("keyword_already_tracked")

#     now = datetime.now(timezone.utc)
#     row = db.execute(text("""
#         INSERT INTO kw_tracked
#             (user_id, keyword, asin_or_pid, platform, category,
#              current_rank, previous_rank, last_checked_at, created_at, is_active)
#         VALUES (:uid, :kw, :pid, :platform, :cat, NULL, NULL, NULL, :now, TRUE)
#         RETURNING id, keyword, asin_or_pid, platform, category,
#                   current_rank, previous_rank, last_checked_at, created_at, is_active
#     """), {
#         "uid": user_id, "kw": req.keyword, "pid": req.asin_or_pid,
#         "platform": req.platform, "cat": req.category, "now": now,
#     }).fetchone()
#     db.commit()

#     return KeywordOut(
#         id=row[0], keyword=row[1], asin_or_pid=row[2], platform=row[3],
#         category=row[4], current_rank=row[5], previous_rank=row[6],
#         rank_change=None, last_checked_at=row[7], created_at=row[8], is_active=row[9],
#     )


# # ── Delete keyword ────────────────────────────────────────────────────────────

# def delete_keyword(user_id: int, keyword_id: int, db: Session) -> None:
#     result = db.execute(text("""
#         UPDATE kw_tracked SET is_active = FALSE
#         WHERE id = :kid AND user_id = :uid
#     """), {"kid": keyword_id, "uid": user_id})
#     db.commit()
#     if result.rowcount == 0:
#         raise LookupError("keyword_not_found")


# # ── Refresh rank ──────────────────────────────────────────────────────────────

# def refresh_rank(user_id: int, keyword_id: int, db: Session) -> KeywordOut:
#     tier   = _get_user_tier(user_id, db)
#     limits = _limits(tier)

#     row = db.execute(text("""
#         SELECT id, keyword, asin_or_pid, platform, category,
#                current_rank, previous_rank, last_checked_at, created_at, is_active
#         FROM kw_tracked
#         WHERE id = :kid AND user_id = :uid AND is_active = TRUE
#         LIMIT 1
#     """), {"kid": keyword_id, "uid": user_id}).fetchone()
#     if not row:
#         raise LookupError("keyword_not_found")

#     # Rate-limit check
#     last_checked = row[7]
#     if last_checked:
#         if last_checked.tzinfo is None:
#             last_checked = last_checked.replace(tzinfo=timezone.utc)
#         hours_per_check = 24 // limits.checks_per_day
#         next_allowed    = last_checked + timedelta(hours=hours_per_check)
#         if datetime.now(timezone.utc) < next_allowed:
#             wait_mins = int((next_allowed - datetime.now(timezone.utc)).total_seconds() / 60)
#             raise PermissionError(f"rate_limited:{wait_mins}_minutes")

#     new_rank = _fetch_rank_from_market(row[1], row[2], row[3], db)
#     old_rank = row[5]
#     now      = datetime.now(timezone.utc)

#     db.execute(text("""
#         UPDATE kw_tracked
#         SET previous_rank = current_rank, current_rank = :new_rank, last_checked_at = :now
#         WHERE id = :kid
#     """), {"new_rank": new_rank, "now": now, "kid": keyword_id})

#     db.execute(text("""
#         INSERT INTO kw_rank_history (kw_id, rank, checked_at)
#         VALUES (:kid, :rank, :now)
#     """), {"kid": keyword_id, "rank": new_rank, "now": now})

#     db.commit()

#     rank_change = (old_rank - new_rank) if (new_rank is not None and old_rank is not None) else None

#     # ── AI rank change explanation (Basic+ only) ──────────────────────────────
#     ai_rank_insight: Optional[str] = None
#     if TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
#         keyword  = row[1]
#         platform = row[3]
#         category = row[4] or "general"

#         if new_rank is None:
#             situation = f'disappeared from top 100 results for "{keyword}" on {platform}'
#         elif old_rank is None:
#             situation = f'appeared at rank #{new_rank} for "{keyword}" on {platform} for the first time'
#         elif rank_change is not None and rank_change > 0:
#             situation = (
#                 f'improved from #{old_rank} to #{new_rank} (+{rank_change} positions) '
#                 f'for "{keyword}" on {platform}'
#             )
#         elif rank_change is not None and rank_change < 0:
#             situation = (
#                 f'dropped from #{old_rank} to #{new_rank} ({rank_change} positions) '
#                 f'for "{keyword}" on {platform}'
#             )
#         else:
#             situation = f'stayed at #{new_rank} for "{keyword}" on {platform}'

#         prompt = (
#             f"My product (category: {category}) just {situation}. "
#             f"In 2-3 sentences: what likely caused this change and what one concrete action "
#             f"can I take in the next 24 hours to either protect or improve this ranking? "
#             f"Be specific — no generic advice."
#         )
#         ck = _cache_key("rank_insight", str(keyword_id), str(new_rank), str(old_rank))
#         ai_rank_insight = _ask_llama(prompt, ck)

#     return KeywordOut(
#         id=row[0], keyword=row[1], asin_or_pid=row[2], platform=row[3],
#         category=row[4], current_rank=new_rank, previous_rank=old_rank,
#         rank_change=rank_change, last_checked_at=now, created_at=row[8], is_active=row[9],
#         ai_rank_insight=ai_rank_insight,
#     )


# # ── Rank history ──────────────────────────────────────────────────────────────

# def get_keyword_history(user_id: int, keyword_id: int, db: Session) -> KeywordHistoryOut:
#     tier   = _get_user_tier(user_id, db)
#     limits = _limits(tier)

#     if limits.history_days == 0:
#         raise PermissionError("upgrade_required:history (free tier has no history)")

#     kw = db.execute(text("""
#         SELECT id, keyword, asin_or_pid, platform FROM kw_tracked
#         WHERE id = :kid AND user_id = :uid AND is_active = TRUE
#         LIMIT 1
#     """), {"kid": keyword_id, "uid": user_id}).fetchone()
#     if not kw:
#         raise LookupError("keyword_not_found")

#     cutoff = datetime.now(timezone.utc) - timedelta(days=limits.history_days)
#     hist   = db.execute(text("""
#         SELECT checked_at, rank FROM kw_rank_history
#         WHERE kw_id = :kid AND checked_at >= :cutoff
#         ORDER BY checked_at ASC
#     """), {"kid": keyword_id, "cutoff": cutoff}).fetchall()

#     history_points = [
#         RankHistoryPoint(
#             checked_at=r[0],
#             rank=r[1],
#             page=(r[1] // 10 + 1) if r[1] else None,
#         )
#         for r in hist
#     ]

#     # ── AI trend analysis (Basic+ only) ───────────────────────────────────────
#     ai_trend: Optional[str] = None
#     if len(history_points) >= 3 and TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
#         ranks = [p.rank for p in history_points if p.rank is not None]
#         if len(ranks) >= 2:
#             first_rank = ranks[0]
#             last_rank  = ranks[-1]
#             best_rank  = min(ranks)
#             worst_rank = max(ranks)

#             # Simple trend direction from recent vs older averages
#             recent_avg = sum(ranks[-3:]) / len(ranks[-3:])
#             older_avg  = sum(ranks[:3])  / len(ranks[:3])
#             if recent_avg < older_avg:
#                 trend_dir = "improving"
#             elif recent_avg > older_avg:
#                 trend_dir = "declining"
#             else:
#                 trend_dir = "stable"

#             prompt = (
#                 f'I\'ve been tracking the keyword "{kw[1]}" on {kw[3]} '
#                 f'for my product ({kw[2]}). '
#                 f"Over {len(ranks)} data points: started at #{first_rank}, "
#                 f"now at #{last_rank}, best was #{best_rank}, worst was #{worst_rank}. "
#                 f"The overall trend is {trend_dir}. "
#                 f"Give me a 3-sentence analysis: what this trend tells me about my competitive position, "
#                 f"what's likely driving it, and one specific thing I should change "
#                 f"in my listing or ad strategy right now."
#             )
#             ck = _cache_key("history_trend", str(keyword_id), str(last_rank), str(len(ranks)), trend_dir)
#             ai_trend = _ask_llama(prompt, ck)

#     return KeywordHistoryOut(
#         keyword_id=kw[0],
#         keyword=kw[1],
#         asin_or_pid=kw[2],
#         platform=kw[3],
#         history=history_points,
#         ai_trend_analysis=ai_trend,
#     )


# # ── Competitors ───────────────────────────────────────────────────────────────

# def add_competitor(
#     user_id: int, keyword_id: int,
#     competitor_pid: str, platform: str, db: Session,
# ) -> CompetitorRankOut:
#     tier   = _require_tier(user_id, "basic", db)
#     limits = _limits(tier)

#     count_row = db.execute(text("""
#         SELECT COUNT(*) FROM kw_competitors WHERE kw_id = :kid AND user_id = :uid
#     """), {"kid": keyword_id, "uid": user_id}).fetchone()
#     if int(count_row[0]) >= limits.competitor_limit:
#         raise PermissionError("upgrade_required:competitor_limit")

#     now = datetime.now(timezone.utc)
#     row = db.execute(text("""
#         INSERT INTO kw_competitors
#             (kw_id, user_id, competitor_asin_or_pid, platform, current_rank, last_checked_at)
#         VALUES (:kid, :uid, :cpid, :platform, NULL, :now)
#         RETURNING id, kw_id, competitor_asin_or_pid, platform, current_rank, last_checked_at
#     """), {
#         "kid": keyword_id, "uid": user_id,
#         "cpid": competitor_pid, "platform": platform, "now": now,
#     }).fetchone()
#     db.commit()

#     return CompetitorRankOut(
#         id=row[0], keyword_id=row[1], competitor_asin_or_pid=row[2],
#         platform=row[3], current_rank=row[4], last_checked_at=row[5],
#     )


# def get_competitors(user_id: int, keyword_id: int, db: Session) -> List[CompetitorRankOut]:
#     _require_tier(user_id, "basic", db)
#     rows = db.execute(text("""
#         SELECT id, kw_id, competitor_asin_or_pid, platform, current_rank, last_checked_at
#         FROM kw_competitors
#         WHERE kw_id = :kid AND user_id = :uid
#         ORDER BY current_rank ASC NULLS LAST
#     """), {"kid": keyword_id, "uid": user_id}).fetchall()

#     return [
#         CompetitorRankOut(
#             id=r[0], keyword_id=r[1], competitor_asin_or_pid=r[2],
#             platform=r[3], current_rank=r[4], last_checked_at=r[5],
#         )
#         for r in rows
#     ]


# # ── Keyword suggestions ───────────────────────────────────────────────────────

# def get_keyword_suggestions(
#     user_id: int,
#     asin_or_pid: str,
#     platform: str,
#     category: Optional[str],
#     db: Session,
# ) -> SuggestionsOut:
#     tier       = _require_tier(user_id, "basic", db)
#     is_premium = (tier == "premium")

#     # ── Step 1: DB-driven base suggestions ────────────────────────────────────
#     try:
#         if platform == "amazon":
#             rows = db.execute(text("""
#                 SELECT product_title, avg_sales_volume FROM rapidapi_amazon_products
#                 WHERE category_name ILIKE :cat AND product_price_numeric > 0
#                 ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
#             """), {"cat": f"%{category or ''}%"}).fetchall()
#         else:
#             rows = db.execute(text("""
#                 SELECT product_title, avg_sales_volume FROM rapidapi_flipkart_products
#                 WHERE category_name ILIKE :cat AND product_price > 0
#                 ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
#             """), {"cat": f"%{category or ''}%"}).fetchall()
#     except Exception as e:
#         logger.error(f"get_keyword_suggestions DB error: {e}")
#         rows = []

#     STOPWORDS = {
#         "and","for","with","the","a","an","in","of","to","is","by","on",
#         "at","or","from","pack","set","piece","pieces","kg","ml","g","l",
#         "cm","mm","inch","inches","buy","get","best","new","free",
#     }

#     scores: dict[str, Tuple[int, int]] = {}
#     for r in rows:
#         title   = str(r[0] or "").lower()
#         words   = [w.strip("(),.-|/") for w in title.split() if len(w) > 2]
#         words   = [w for w in words if w not in STOPWORDS and w.isalpha()]
#         bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]
#         vol     = int(r[1] or 0)
#         for term in words + bigrams:
#             ex = scores.get(term, (0, 0))
#             scores[term] = (ex[0] + vol, ex[1] + 1)

#     sorted_kws = sorted(scores.items(), key=lambda x: x[1][0], reverse=True)[:15]

#     tracked_set = {r[0] for r in db.execute(text("""
#         SELECT LOWER(keyword) FROM kw_tracked
#         WHERE user_id = :uid AND asin_or_pid = :pid AND is_active = TRUE
#     """), {"uid": user_id, "pid": asin_or_pid}).fetchall()}

#     db_suggestions = []
#     for kw, (vol_sum, count) in sorted_kws:
#         if kw in tracked_set:
#             continue
#         avg_vol     = vol_sum / count if count else 0
#         search_vol  = "High" if avg_vol > 500_000 else ("Medium" if avg_vol > 100_000 else "Low")
#         competition = "High" if count > 20 else ("Medium" if count > 8 else "Low")
#         opp_score   = None
#         if is_premium:
#             vol_s     = min(100, int(avg_vol / 10_000))
#             comp_s    = 100 - (count * 4)
#             opp_score = max(0, min(100, (vol_s + comp_s) // 2))
#         db_suggestions.append(KeywordSuggestion(
#             keyword=kw,
#             estimated_search_volume=search_vol,
#             competition_level=competition,
#             opportunity_score=opp_score,
#         ))

#     # ── Step 2: AI-generated keyword ideas (Basic+) ───────────────────────────
#     ai_suggestions: List[KeywordSuggestion] = []
#     existing_str = ", ".join(s.keyword for s in db_suggestions[:10]) or "none yet"

#     prompt = (
#         f"I sell a product on {platform} in the '{category or 'general'}' category "
#         f"(ASIN/PID: {asin_or_pid}). "
#         f"I already track these keywords: {existing_str}. "
#         f"Suggest 6 additional high-potential keywords I'm likely missing. "
#         f"Focus on long-tail buyer-intent phrases that Indian shoppers actually type — "
#         f"include price-range queries, use-case phrases, and problem-solving searches. "
#         f"Return ONLY a comma-separated list of keywords. No numbering, no explanation, nothing else."
#     )
#     ck = _cache_key("ai_suggestions", asin_or_pid, platform, category or "", tier)
#     ai_raw = _ask_llama(prompt, ck)

#     if ai_raw:
#         for ai_kw in [k.strip().lower() for k in ai_raw.split(",") if k.strip()][:6]:
#             if ai_kw and ai_kw not in tracked_set and len(ai_kw) > 2:
#                 ai_suggestions.append(KeywordSuggestion(
#                     keyword=ai_kw,
#                     estimated_search_volume="Medium",
#                     competition_level="Low",
#                     opportunity_score=75 if is_premium else None,
#                 ))

#     return SuggestionsOut(
#         asin_or_pid=asin_or_pid,
#         platform=platform,
#         category=category,
#         suggestions=db_suggestions + ai_suggestions,
#     )


# # ── Alert settings ────────────────────────────────────────────────────────────

# def save_alert_settings(user_id: int, req: AlertSettingsRequest, db: Session) -> AlertSettingsOut:
#     tier   = _require_tier(user_id, "basic", db)
#     limits = _limits(tier)

#     if req.whatsapp_enabled and not limits.alerts_whatsapp:
#         raise PermissionError("upgrade_required:premium (WhatsApp alerts require Premium)")

#     db.execute(text("""
#         INSERT INTO kw_alert_settings
#             (kw_id, user_id, alert_on_drop, drop_threshold,
#              email_enabled, whatsapp_enabled, whatsapp_number)
#         VALUES (:kid, :uid, :drop, :thresh, :email, :wa, :wnum)
#         ON CONFLICT (kw_id) DO UPDATE SET
#             alert_on_drop    = EXCLUDED.alert_on_drop,
#             drop_threshold   = EXCLUDED.drop_threshold,
#             email_enabled    = EXCLUDED.email_enabled,
#             whatsapp_enabled = EXCLUDED.whatsapp_enabled,
#             whatsapp_number  = EXCLUDED.whatsapp_number,
#             updated_at       = NOW()
#     """), {
#         "kid": req.keyword_id, "uid": user_id,
#         "drop": req.alert_on_drop, "thresh": req.drop_threshold,
#         "email": req.email_enabled, "wa": req.whatsapp_enabled, "wnum": req.whatsapp_number,
#     })
#     db.commit()

#     return AlertSettingsOut(
#         keyword_id=req.keyword_id,
#         alert_on_drop=req.alert_on_drop,
#         drop_threshold=req.drop_threshold,
#         email_enabled=req.email_enabled,
#         whatsapp_enabled=req.whatsapp_enabled,
#         whatsapp_number=req.whatsapp_number,
#     )


# def get_alert_settings(user_id: int, keyword_id: int, db: Session) -> Optional[AlertSettingsOut]:
#     _require_tier(user_id, "basic", db)
#     row = db.execute(text("""
#         SELECT alert_on_drop, drop_threshold, email_enabled, whatsapp_enabled, whatsapp_number
#         FROM kw_alert_settings
#         WHERE kw_id = :kid AND user_id = :uid
#         LIMIT 1
#     """), {"kid": keyword_id, "uid": user_id}).fetchone()

#     if not row:
#         return None
#     return AlertSettingsOut(
#         keyword_id=keyword_id,
#         alert_on_drop=row[0],
#         drop_threshold=row[1],
#         email_enabled=row[2],
#         whatsapp_enabled=row[3],
#         whatsapp_number=row[4],
#     )


# # ── Tier info ─────────────────────────────────────────────────────────────────

# def get_tier_limits(tier: str) -> TierLimits:
#     return _limits(tier.lower())




# # app/services/keyword_tracker_service.py

# """
# Keyword Tracker Service
# =======================
# Fixed rank calculation — uses product_title keyword matching + multiple signals
# (avg_sales_volume, product_star_rating_numeric, product_num_ratings) to produce
# realistic, differentiated ranks instead of identical ones.

# AI suggestions are grounded in real category/title data from your DB so they
# are relevant, not random.
# """

# from __future__ import annotations

# import logging
# import time
# import hashlib
# from datetime import datetime, timedelta, timezone
# from typing import List, Optional, Tuple, Dict

# from sqlalchemy import text
# from sqlalchemy.orm import Session

# from app.schemas.keyword_tracker_schema import (
#     AlertSettingsOut,
#     AlertSettingsRequest,
#     CompetitorRankOut,
#     KeywordDashboardOut,
#     KeywordHistoryOut,
#     KeywordOut,
#     KeywordSuggestion,
#     RankHistoryPoint,
#     SuggestionsOut,
#     TierLimits,
# )

# logger = logging.getLogger(__name__)


# # ── AI Setup (HTTP, no SDK needed) ───────────────────────────────────────────

# import httpx

# OLLAMA_BASE_URL = "http://localhost:11434"
# OLLAMA_MODEL    = "llama3.2:3b"
# OLLAMA_TIMEOUT  = 60

# _ai_cache: Dict[str, Tuple[str, float]] = {}
# AI_CACHE_TTL = 3600  # 1 hour


# def _cache_key(*parts: str) -> str:
#     raw = "|".join(str(p) for p in parts)
#     return hashlib.md5(raw.encode()).hexdigest()


# def _ask_llama(prompt: str, ck: str) -> str:
#     cached = _ai_cache.get(ck)
#     if cached:
#         response, ts = cached
#         if time.time() - ts < AI_CACHE_TTL:
#             return response

#     payload = {
#         "model":  OLLAMA_MODEL,
#         "prompt": prompt,
#         "stream": False,
#         "system": (
#             "You are an expert e-commerce strategist for Amazon and Flipkart sellers in India. "
#             "Give sharp, actionable advice like a senior consultant. "
#             "Be concise — 2-4 sentences max. No bullet points unless asked. "
#             "No filler like 'Great question!' or 'Certainly!'. "
#             "Talk directly to the seller as 'you'. Be honest and specific. "
#             "If something is declining, say it plainly and tell them exactly what to fix."
#         ),
#         "options": {"temperature": 0.7, "num_predict": 300},
#     }

#     try:
#         with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
#             resp = client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
#         if resp.status_code != 200:
#             logger.error(f"Ollama HTTP {resp.status_code}")
#             return ""
#         response = resp.json().get("response", "").strip()
#         _ai_cache[ck] = (response, time.time())
#         return response
#     except Exception as e:
#         logger.error(f"Ollama failed: {e}")
#         return ""


# # ── Tier configuration ────────────────────────────────────────────────────────

# TIER_ORDER = {"free": 0, "basic": 1, "premium": 2}

# TIER_LIMITS: dict[str, TierLimits] = {
#     "free": TierLimits(
#         keyword_limit=3, product_limit=1, history_days=0,
#         competitor_limit=0, checks_per_day=1,
#         alerts_email=False, alerts_whatsapp=False,
#         keyword_suggestions=False, opportunity_score=False,
#     ),
#     "basic": TierLimits(
#         keyword_limit=25, product_limit=5, history_days=30,
#         competitor_limit=2, checks_per_day=2,
#         alerts_email=True, alerts_whatsapp=False,
#         keyword_suggestions=True, opportunity_score=False,
#     ),
#     "premium": TierLimits(
#         keyword_limit=-1, product_limit=-1, history_days=9999,
#         competitor_limit=10, checks_per_day=24,
#         alerts_email=True, alerts_whatsapp=True,
#         keyword_suggestions=True, opportunity_score=True,
#     ),
# }


# # ── Internal helpers ──────────────────────────────────────────────────────────

# def _get_user_tier(user_id: int, db: Session) -> str:
#     row = db.execute(
#         text("SELECT subscription_tier FROM users WHERE id = :uid LIMIT 1"),
#         {"uid": user_id},
#     ).fetchone()
#     return str(row[0]).lower() if row and row[0] else "free"


# def _require_tier(user_id: int, required: str, db: Session) -> str:
#     tier = _get_user_tier(user_id, db)
#     if TIER_ORDER.get(tier, 0) < TIER_ORDER.get(required, 0):
#         raise PermissionError(f"upgrade_required:{required}")
#     return tier


# def _limits(tier: str) -> TierLimits:
#     return TIER_LIMITS.get(tier, TIER_LIMITS["free"])


# def _count_active_keywords(user_id: int, db: Session) -> int:
#     row = db.execute(
#         text("SELECT COUNT(*) FROM kw_tracked WHERE user_id = :uid AND is_active = TRUE"),
#         {"uid": user_id},
#     ).fetchone()
#     return int(row[0]) if row else 0


# def _distinct_products(user_id: int, db: Session) -> set:
#     rows = db.execute(
#         text("SELECT DISTINCT asin_or_pid FROM kw_tracked WHERE user_id = :uid AND is_active = TRUE"),
#         {"uid": user_id},
#     ).fetchall()
#     return {r[0] for r in rows}


# # ── FIXED Rank calculation ────────────────────────────────────────────────────
# #
# # Problem with old approach:
# #   avg_sales_volume is stored as huge rounded numbers (600000000, 2000000000)
# #   so all products get nearly the same rank when sorted by it.
# #
# # Fix:
# #   Use a composite score that combines:
# #     - keyword relevance (title match tightness)
# #     - normalised sales volume (LOG scale to compress huge numbers)
# #     - star rating
# #     - number of ratings
# #   This produces realistic, differentiated ranks.
# #
# # The ASIN/PID's position in this ranked list = its rank for that keyword.

# def _fetch_rank_from_market(
#     keyword: str,
#     asin_or_pid: str,
#     platform: str,
#     db: Session,
# ) -> Optional[int]:
#     kw_lower = keyword.lower().strip()
#     kw_words = [w for w in kw_lower.split() if len(w) > 2]

#     try:
#         if platform == "amazon":
#             # Pull candidates — exact phrase match first, then word-level
#             rows = db.execute(text("""
#                 SELECT
#                     asin,
#                     product_title,
#                     COALESCE(avg_sales_volume, 0)            AS sales_vol,
#                     COALESCE(product_star_rating_numeric, 0) AS stars,
#                     COALESCE(product_num_ratings, 0)         AS num_ratings,
#                     CASE
#                         WHEN LOWER(product_title) LIKE :exact THEN 3
#                         WHEN LOWER(product_title) LIKE :kw1   THEN 2
#                         ELSE 1
#                     END AS relevance
#                 FROM rapidapi_amazon_products
#                 WHERE
#                     product_price_numeric > 0
#                     AND (
#                         LOWER(product_title) LIKE :exact
#                         OR LOWER(product_title) LIKE :kw1
#                     )
#                 LIMIT 200
#             """), {
#                 "exact": f"%{kw_lower}%",
#                 "kw1":   f"%{kw_words[0]}%" if kw_words else f"%{kw_lower}%",
#             }).fetchall()

#             if not rows:
#                 return None

#             # Build composite score — LOG compresses the huge volume numbers
#             import math
#             scored = []
#             for r in rows:
#                 log_vol  = math.log1p(float(r[2])) if r[2] > 0 else 0
#                 score    = (r[5] * 10) + (log_vol * 0.5) + (float(r[3]) * 2) + (math.log1p(float(r[4])) * 0.3)
#                 scored.append((r[0], score))

#             # Sort descending — highest score = rank 1
#             scored.sort(key=lambda x: x[1], reverse=True)

#             for idx, (asin, _) in enumerate(scored, start=1):
#                 if str(asin) == asin_or_pid:
#                     return idx

#             return None  # product not in keyword results

#         else:  # flipkart
#             rows = db.execute(text("""
#                 SELECT
#                     pid,
#                     product_title,
#                     COALESCE(avg_sales_volume, 0)   AS sales_vol,
#                     COALESCE(product_star_rating, 0) AS stars,
#                     COALESCE(product_rating_count, 0) AS num_ratings,
#                     CASE
#                         WHEN LOWER(product_title) LIKE :exact THEN 3
#                         WHEN LOWER(product_title) LIKE :kw1   THEN 2
#                         ELSE 1
#                     END AS relevance
#                 FROM rapidapi_flipkart_products
#                 WHERE
#                     product_price > 0
#                     AND (
#                         LOWER(product_title) LIKE :exact
#                         OR LOWER(product_title) LIKE :kw1
#                     )
#                 LIMIT 200
#             """), {
#                 "exact": f"%{kw_lower}%",
#                 "kw1":   f"%{kw_words[0]}%" if kw_words else f"%{kw_lower}%",
#             }).fetchall()

#             if not rows:
#                 return None

#             import math
#             scored = []
#             for r in rows:
#                 log_vol = math.log1p(float(r[2])) if r[2] > 0 else 0
#                 score   = (r[5] * 10) + (log_vol * 0.5) + (float(r[3]) * 2) + (math.log1p(float(r[4])) * 0.3)
#                 scored.append((r[0], score))

#             scored.sort(key=lambda x: x[1], reverse=True)

#             for idx, (pid, _) in enumerate(scored, start=1):
#                 if str(pid) == asin_or_pid:
#                     return idx

#             return None

#     except Exception as e:
#         logger.error(f"_fetch_rank_from_market error: {e}")
#         return None


# # ── Dashboard ─────────────────────────────────────────────────────────────────

# def get_dashboard(user_id: int, db: Session) -> KeywordDashboardOut:
#     tier   = _get_user_tier(user_id, db)
#     limits = _limits(tier)

#     rows = db.execute(text("""
#         SELECT id, keyword, asin_or_pid, platform, category,
#                current_rank, previous_rank, last_checked_at, created_at, is_active
#         FROM kw_tracked
#         WHERE user_id = :uid AND is_active = TRUE
#         ORDER BY created_at DESC
#     """), {"uid": user_id}).fetchall()

#     keywords: List[KeywordOut] = []
#     improving = declining = stable = not_ranked = 0

#     for r in rows:
#         current_rank  = r[5]
#         previous_rank = r[6]
#         rank_change   = None

#         if current_rank is None:
#             not_ranked += 1
#         elif previous_rank is None:
#             stable += 1
#         else:
#             diff = previous_rank - current_rank
#             rank_change = diff
#             if diff > 0:   improving += 1
#             elif diff < 0: declining += 1
#             else:          stable    += 1

#         keywords.append(KeywordOut(
#             id=r[0], keyword=r[1], asin_or_pid=r[2], platform=r[3],
#             category=r[4], current_rank=current_rank,
#             previous_rank=previous_rank, rank_change=rank_change,
#             last_checked_at=r[7], created_at=r[8], is_active=r[9],
#         ))

#     total     = len(keywords)
#     kw_limit  = limits.keyword_limit
#     remaining = max(0, kw_limit - total) if kw_limit != -1 else -1

#     # ── AI dashboard insight (Basic+) ─────────────────────────────────────────
#     ai_insight: Optional[str] = None
#     if total > 0 and TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
#         kw_summary = ", ".join(
#             f'"{k.keyword}" (rank #{k.current_rank or "unranked"}, '
#             f'{"up" if (k.rank_change or 0) > 0 else "down" if (k.rank_change or 0) < 0 else "stable"} '
#             f'{abs(k.rank_change or 0)} spots)'
#             for k in keywords[:8]
#         )
#         prompt = (
#             f"I'm an Amazon/Flipkart seller tracking {total} keywords. "
#             f"Snapshot: {kw_summary}. "
#             f"I have {improving} improving, {declining} declining, {stable} stable, "
#             f"{not_ranked} unranked. "
#             f"Give me ONE sharp insight about this pattern and the single most important "
#             f"action I should take right now. Be direct, no fluff."
#         )
#         ck = _cache_key("dashboard_insight", str(user_id), str(improving), str(declining), str(not_ranked))
#         ai_insight = _ask_llama(prompt, ck)

#     return KeywordDashboardOut(
#         tier=tier, tier_limits=limits,
#         keywords_used=total, keywords_remaining=remaining,
#         total_keywords=total,
#         improving=improving, declining=declining,
#         stable=stable, not_ranked=not_ranked,
#         keywords=keywords, ai_insight=ai_insight,
#     )


# # ── Add keyword ───────────────────────────────────────────────────────────────

# def add_keyword(user_id: int, req, db: Session) -> KeywordOut:
#     tier   = _get_user_tier(user_id, db)
#     limits = _limits(tier)

#     current_count = _count_active_keywords(user_id, db)
#     if limits.keyword_limit != -1 and current_count >= limits.keyword_limit:
#         raise PermissionError(f"upgrade_required:keyword_limit (used {current_count}/{limits.keyword_limit})")

#     existing_pids  = _distinct_products(user_id, db)
#     is_new_product = req.asin_or_pid not in existing_pids
#     if is_new_product and limits.product_limit != -1:
#         if len(existing_pids) >= limits.product_limit:
#             raise PermissionError(f"upgrade_required:product_limit (used {len(existing_pids)}/{limits.product_limit})")

#     dup = db.execute(text("""
#         SELECT id FROM kw_tracked
#         WHERE user_id = :uid AND LOWER(keyword) = LOWER(:kw)
#           AND asin_or_pid = :pid AND platform = :platform AND is_active = TRUE
#         LIMIT 1
#     """), {"uid": user_id, "kw": req.keyword, "pid": req.asin_or_pid, "platform": req.platform}).fetchone()
#     if dup:
#         raise ValueError("keyword_already_tracked")

#     now = datetime.now(timezone.utc)
#     row = db.execute(text("""
#         INSERT INTO kw_tracked
#             (user_id, keyword, asin_or_pid, platform, category,
#              current_rank, previous_rank, last_checked_at, created_at, is_active)
#         VALUES (:uid, :kw, :pid, :platform, :cat, NULL, NULL, NULL, :now, TRUE)
#         RETURNING id, keyword, asin_or_pid, platform, category,
#                   current_rank, previous_rank, last_checked_at, created_at, is_active
#     """), {
#         "uid": user_id, "kw": req.keyword, "pid": req.asin_or_pid,
#         "platform": req.platform, "cat": req.category, "now": now,
#     }).fetchone()
#     db.commit()

#     return KeywordOut(
#         id=row[0], keyword=row[1], asin_or_pid=row[2], platform=row[3],
#         category=row[4], current_rank=row[5], previous_rank=row[6],
#         rank_change=None, last_checked_at=row[7], created_at=row[8], is_active=row[9],
#     )


# # ── Delete keyword ────────────────────────────────────────────────────────────

# def delete_keyword(user_id: int, keyword_id: int, db: Session) -> None:
#     result = db.execute(text("""
#         UPDATE kw_tracked SET is_active = FALSE
#         WHERE id = :kid AND user_id = :uid
#     """), {"kid": keyword_id, "uid": user_id})
#     db.commit()
#     if result.rowcount == 0:
#         raise LookupError("keyword_not_found")


# # ── Refresh rank ──────────────────────────────────────────────────────────────

# def refresh_rank(user_id: int, keyword_id: int, db: Session) -> KeywordOut:
#     tier   = _get_user_tier(user_id, db)
#     limits = _limits(tier)

#     row = db.execute(text("""
#         SELECT id, keyword, asin_or_pid, platform, category,
#                current_rank, previous_rank, last_checked_at, created_at, is_active
#         FROM kw_tracked
#         WHERE id = :kid AND user_id = :uid AND is_active = TRUE LIMIT 1
#     """), {"kid": keyword_id, "uid": user_id}).fetchone()
#     if not row:
#         raise LookupError("keyword_not_found")

#     last_checked = row[7]
#     if last_checked:
#         if last_checked.tzinfo is None:
#             last_checked = last_checked.replace(tzinfo=timezone.utc)
#         hours_per_check = 24 // limits.checks_per_day
#         next_allowed    = last_checked + timedelta(hours=hours_per_check)
#         if datetime.now(timezone.utc) < next_allowed:
#             wait_mins = int((next_allowed - datetime.now(timezone.utc)).total_seconds() / 60)
#             raise PermissionError(f"rate_limited:{wait_mins}_minutes")

#     new_rank    = _fetch_rank_from_market(row[1], row[2], row[3], db)
#     old_rank    = row[5]
#     now         = datetime.now(timezone.utc)
#     rank_change = (old_rank - new_rank) if (new_rank is not None and old_rank is not None) else None

#     db.execute(text("""
#         UPDATE kw_tracked
#         SET previous_rank = current_rank, current_rank = :new_rank, last_checked_at = :now
#         WHERE id = :kid
#     """), {"new_rank": new_rank, "now": now, "kid": keyword_id})

#     db.execute(text("""
#         INSERT INTO kw_rank_history (kw_id, rank, checked_at)
#         VALUES (:kid, :rank, :now)
#     """), {"kid": keyword_id, "rank": new_rank, "now": now})

#     db.commit()

#     # ── AI rank insight (Basic+) ──────────────────────────────────────────────
#     ai_rank_insight: Optional[str] = None
#     if TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
#         keyword  = row[1]
#         platform = row[3]
#         category = row[4] or "general"

#         if new_rank is None:
#             situation = f'disappeared from top results for "{keyword}" on {platform}'
#         elif old_rank is None:
#             situation = f'appeared at rank #{new_rank} for "{keyword}" on {platform} for the first time'
#         elif rank_change is not None and rank_change > 0:
#             situation = f'improved from #{old_rank} to #{new_rank} (+{rank_change} spots) for "{keyword}" on {platform}'
#         elif rank_change is not None and rank_change < 0:
#             situation = f'dropped from #{old_rank} to #{new_rank} ({rank_change} spots) for "{keyword}" on {platform}'
#         else:
#             situation = f'stayed at #{new_rank} for "{keyword}" on {platform}'

#         prompt = (
#             f"My product (category: {category}) just {situation}. "
#             f"In 2-3 sentences: what likely caused this and what one concrete action "
#             f"can I take in the next 24 hours to protect or improve this ranking? "
#             f"Be specific, no generic advice."
#         )
#         ck = _cache_key("rank_insight", str(keyword_id), str(new_rank), str(old_rank))
#         ai_rank_insight = _ask_llama(prompt, ck)

#     return KeywordOut(
#         id=row[0], keyword=row[1], asin_or_pid=row[2], platform=row[3],
#         category=row[4], current_rank=new_rank, previous_rank=old_rank,
#         rank_change=rank_change, last_checked_at=now, created_at=row[8], is_active=row[9],
#         ai_rank_insight=ai_rank_insight,
#     )


# # ── Rank history ──────────────────────────────────────────────────────────────

# def get_keyword_history(user_id: int, keyword_id: int, db: Session) -> KeywordHistoryOut:
#     tier   = _get_user_tier(user_id, db)
#     limits = _limits(tier)

#     if limits.history_days == 0:
#         raise PermissionError("upgrade_required:history (free tier has no history)")

#     kw = db.execute(text("""
#         SELECT id, keyword, asin_or_pid, platform FROM kw_tracked
#         WHERE id = :kid AND user_id = :uid AND is_active = TRUE LIMIT 1
#     """), {"kid": keyword_id, "uid": user_id}).fetchone()
#     if not kw:
#         raise LookupError("keyword_not_found")

#     cutoff = datetime.now(timezone.utc) - timedelta(days=limits.history_days)
#     hist   = db.execute(text("""
#         SELECT checked_at, rank FROM kw_rank_history
#         WHERE kw_id = :kid AND checked_at >= :cutoff
#         ORDER BY checked_at ASC
#     """), {"kid": keyword_id, "cutoff": cutoff}).fetchall()

#     history_points = [
#         RankHistoryPoint(
#             checked_at=r[0], rank=r[1],
#             page=(r[1] // 10 + 1) if r[1] else None,
#         )
#         for r in hist
#     ]

#     # ── AI trend analysis (Basic+) ────────────────────────────────────────────
#     ai_trend: Optional[str] = None
#     if len(history_points) >= 3 and TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
#         ranks = [p.rank for p in history_points if p.rank is not None]
#         if len(ranks) >= 2:
#             recent_avg = sum(ranks[-3:]) / len(ranks[-3:])
#             older_avg  = sum(ranks[:3])  / len(ranks[:3])
#             trend_dir  = "improving" if recent_avg < older_avg else "declining" if recent_avg > older_avg else "stable"

#             prompt = (
#                 f'Tracking keyword "{kw[1]}" on {kw[3]} for product {kw[2]}. '
#                 f"Over {len(ranks)} checks: started #{ranks[0]}, now #{ranks[-1]}, "
#                 f"best #{min(ranks)}, worst #{max(ranks)}. Trend: {trend_dir}. "
#                 f"3-sentence analysis: competitive position, what's driving it, "
#                 f"one specific listing or ad change to make right now."
#             )
#             ck = _cache_key("history_trend", str(keyword_id), str(ranks[-1]), str(len(ranks)), trend_dir)
#             ai_trend = _ask_llama(prompt, ck)

#     return KeywordHistoryOut(
#         keyword_id=kw[0], keyword=kw[1], asin_or_pid=kw[2], platform=kw[3],
#         history=history_points, ai_trend_analysis=ai_trend,
#     )


# # ── Competitors ───────────────────────────────────────────────────────────────

# def add_competitor(user_id: int, keyword_id: int, competitor_pid: str, platform: str, db: Session) -> CompetitorRankOut:
#     tier   = _require_tier(user_id, "basic", db)
#     limits = _limits(tier)

#     count_row = db.execute(text("""
#         SELECT COUNT(*) FROM kw_competitors WHERE kw_id = :kid AND user_id = :uid
#     """), {"kid": keyword_id, "uid": user_id}).fetchone()
#     if int(count_row[0]) >= limits.competitor_limit:
#         raise PermissionError("upgrade_required:competitor_limit")

#     now = datetime.now(timezone.utc)
#     row = db.execute(text("""
#         INSERT INTO kw_competitors
#             (kw_id, user_id, competitor_asin_or_pid, platform, current_rank, last_checked_at)
#         VALUES (:kid, :uid, :cpid, :platform, NULL, :now)
#         RETURNING id, kw_id, competitor_asin_or_pid, platform, current_rank, last_checked_at
#     """), {"kid": keyword_id, "uid": user_id, "cpid": competitor_pid, "platform": platform, "now": now}).fetchone()
#     db.commit()

#     return CompetitorRankOut(
#         id=row[0], keyword_id=row[1], competitor_asin_or_pid=row[2],
#         platform=row[3], current_rank=row[4], last_checked_at=row[5],
#     )


# def get_competitors(user_id: int, keyword_id: int, db: Session) -> List[CompetitorRankOut]:
#     _require_tier(user_id, "basic", db)
#     rows = db.execute(text("""
#         SELECT id, kw_id, competitor_asin_or_pid, platform, current_rank, last_checked_at
#         FROM kw_competitors WHERE kw_id = :kid AND user_id = :uid
#         ORDER BY current_rank ASC NULLS LAST
#     """), {"kid": keyword_id, "uid": user_id}).fetchall()

#     return [
#         CompetitorRankOut(
#             id=r[0], keyword_id=r[1], competitor_asin_or_pid=r[2],
#             platform=r[3], current_rank=r[4], last_checked_at=r[5],
#         )
#         for r in rows
#     ]



# # ── Keyword suggestions ───────────────────────────────────────────────────────
# #
# # Production approach — fully accurate, no noise:
# #   1. Fetch the tracked product's own title from DB by ASIN/PID
# #   2. Extract CORE IDENTITY WORDS (meaningful nouns, no generic adjectives)
# #   3. Find SIMILAR products whose titles contain ALL core words (strict match)
# #   4. Extract bigrams/trigrams only from those strictly similar products
# #   5. AI generates buyer-intent phrases using the real product title
# #
# # "tongue scraper" → only pulls products with "tongue" AND "scraper" in title
# # → zero chance of "plastic", "easy", "handle" leaking through

# def get_keyword_suggestions(
#     user_id: int, asin_or_pid: str, platform: str,
#     category: Optional[str], db: Session,
# ) -> SuggestionsOut:
#     import math

#     tier       = _require_tier(user_id, "basic", db)
#     is_premium = (tier == "premium")

#     STOPWORDS = {
#         "and","for","with","the","a","an","in","of","to","is","by","on",
#         "at","or","from","pack","set","piece","pieces","kg","ml","g","l",
#         "cm","mm","inch","inches","buy","get","best","new","free","india",
#         "online","price","offer","sale","deal","high","low","quality",
#         "product","item","original","genuine","premium","value","colour",
#         "color","size","type","model","brand","made","also","used","use",
#         "easy","fun","may","vary","multicolor","reusable","waterproof",
#         "handle","plastic","metal","steel","wooden","rubber","fabric",
#         "black","white","blue","red","green","yellow","pink","grey",
#         "small","large","medium","mini","extra","super","ultra","pro",
#         "plus","max","lite","slim","compact","portable","heavy","light",
#         "combo","pack","box","bottle","bag","case","cover","holder",
#     }

#     def _meaningful_words(title: str) -> List[str]:
#         words = [w.strip("(),.-|/&%#@![]{}:'\"") for w in title.lower().split()]
#         return [w for w in words if len(w) > 3 and w not in STOPWORDS and w.isalpha()]

#     # ── Step 1: Get this product's own title ─────────────────────────────────
#     try:
#         if platform == "amazon":
#             product_row = db.execute(text("""
#                 SELECT product_title, category_name
#                 FROM rapidapi_amazon_products
#                 WHERE asin = :pid LIMIT 1
#             """), {"pid": asin_or_pid}).fetchone()
#         else:
#             product_row = db.execute(text("""
#                 SELECT product_title, category_name
#                 FROM rapidapi_flipkart_products
#                 WHERE pid = :pid LIMIT 1
#             """), {"pid": asin_or_pid}).fetchone()
#     except Exception as e:
#         logger.error(f"product fetch error: {e}")
#         product_row = None

#     product_title   = product_row[0] if product_row else ""
#     actual_category = product_row[1] if product_row else category or "general"
#     core_words      = _meaningful_words(product_title)

#     # Use top 3 most specific words — skip ALL-CAPS brand names
#     filter_words = [w for w in core_words if not w.isupper()][:3]
#     logger.info(f"Suggestion filter_words for {asin_or_pid}: {filter_words}")

#     # ── Step 2: Find SIMILAR products — title must contain ALL filter words ──
#     similar_rows: list = []
#     try:
#         if filter_words:
#             conditions = " AND ".join([
#                 f"LOWER(product_title) LIKE :w{i}" for i in range(len(filter_words))
#             ])
#             params = {f"w{i}": f"%{w}%" for i, w in enumerate(filter_words)}

#             if platform == "amazon":
#                 similar_rows = db.execute(text(f"""
#                     SELECT product_title, avg_sales_volume
#                     FROM rapidapi_amazon_products
#                     WHERE product_price_numeric > 0 AND ({conditions})
#                     ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
#                 """), params).fetchall()
#             else:
#                 similar_rows = db.execute(text(f"""
#                     SELECT product_title, avg_sales_volume
#                     FROM rapidapi_flipkart_products
#                     WHERE product_price > 0 AND ({conditions})
#                     ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
#                 """), params).fetchall()

#         # Fallback: if < 3 results with all words, try first 2 only
#         if len(similar_rows) < 3 and len(filter_words) >= 2:
#             params2 = {"w0": f"%{filter_words[0]}%", "w1": f"%{filter_words[1]}%"}
#             if platform == "amazon":
#                 similar_rows = db.execute(text("""
#                     SELECT product_title, avg_sales_volume
#                     FROM rapidapi_amazon_products
#                     WHERE product_price_numeric > 0
#                       AND LOWER(product_title) LIKE :w0
#                       AND LOWER(product_title) LIKE :w1
#                     ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
#                 """), params2).fetchall()
#             else:
#                 similar_rows = db.execute(text("""
#                     SELECT product_title, avg_sales_volume
#                     FROM rapidapi_flipkart_products
#                     WHERE product_price > 0
#                       AND LOWER(product_title) LIKE :w0
#                       AND LOWER(product_title) LIKE :w1
#                     ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
#                 """), params2).fetchall()

#     except Exception as e:
#         logger.error(f"similar products fetch error: {e}")
#         similar_rows = []

#     logger.info(f"Found {len(similar_rows)} similar products for {asin_or_pid}")

#     # ── Step 3: Score bigrams/trigrams from similar products only ────────────
#     anchor_set = set(filter_words)
#     scores: dict[str, Tuple[int, int]] = {}

#     for r in similar_rows:
#         title = str(r[0] or "")
#         words = _meaningful_words(title)
#         vol   = int(r[1] or 0)

#         bigrams  = [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]
#         trigrams = [f"{words[i]} {words[i+1]} {words[i+2]}" for i in range(len(words) - 2)]

#         for phrase in bigrams + trigrams:
#             # Only keep phrases that contain at least one filter/anchor word
#             if anchor_set and not (set(phrase.split()) & anchor_set):
#                 continue
#             ex = scores.get(phrase, (0, 0))
#             scores[phrase] = (ex[0] + vol, ex[1] + 1)

#     sorted_phrases = sorted(scores.items(), key=lambda x: x[1][0], reverse=True)[:12]

#     tracked_set = {r[0] for r in db.execute(text("""
#         SELECT LOWER(keyword) FROM kw_tracked
#         WHERE user_id = :uid AND asin_or_pid = :pid AND is_active = TRUE
#     """), {"uid": user_id, "pid": asin_or_pid}).fetchall()}

#     db_suggestions = []
#     for phrase, (vol_sum, count) in sorted_phrases:
#         if phrase in tracked_set:
#             continue
#         avg_vol     = vol_sum / count if count else 0
#         search_vol  = "High" if avg_vol > 500_000 else ("Medium" if avg_vol > 100_000 else "Low")
#         competition = "High" if count > 15 else ("Medium" if count > 5 else "Low")
#         opp_score   = None
#         if is_premium:
#             vol_s     = min(100, int(math.log1p(avg_vol) * 3))
#             comp_s    = max(0, 100 - (count * 4))
#             opp_score = (vol_s + comp_s) // 2
#         db_suggestions.append(KeywordSuggestion(
#             keyword=phrase, estimated_search_volume=search_vol,
#             competition_level=competition, opportunity_score=opp_score,
#         ))

#     # ── Step 4: AI suggestions using real product + competitor context ────────
#     ai_suggestions: List[KeywordSuggestion] = []
#     display_title  = product_title[:120] if product_title else f"ASIN/PID: {asin_or_pid}"
#     similar_titles = [str(r[0])[:80] for r in similar_rows[:6] if r[0]]
#     similar_str    = " | ".join(similar_titles) if similar_titles else "no similar products found"
#     existing_kws   = [s.keyword for s in db_suggestions[:8]]
#     existing_str   = ", ".join(existing_kws) or "none"

#     prompt = (
#         f"I sell this exact product on {platform}: \"{display_title}\". "
#         f"Similar competing products: {similar_str}. "
#         f"Keywords I already track: {existing_str}. "
#         f"Suggest 6 NEW search phrases Indian buyers type for THIS specific product. "
#         f"Every suggestion must be directly about \"{' '.join(filter_words or core_words[:3])}\". "
#         f"Focus on: use-case phrases, problem-solving searches, buyer-intent long-tail queries. "
#         f"No generic words. Each keyword must make sense only for this product type. "
#         f"Return ONLY a comma-separated list. No numbers, no explanation."
#     )
#     ck = _cache_key("ai_sug_v3", asin_or_pid, platform, " ".join(filter_words), tier)
#     ai_raw = _ask_llama(prompt, ck)

#     if ai_raw:
#         cleaned = ai_raw.replace("\n", ",").replace(";", ",")
#         for ai_kw in [k.strip(" .-1234567890)'\"").lower() for k in cleaned.split(",") if k.strip()][:6]:
#             if (ai_kw and len(ai_kw) > 4
#                     and ai_kw not in tracked_set
#                     and ai_kw not in existing_kws):
#                 ai_suggestions.append(KeywordSuggestion(
#                     keyword=ai_kw,
#                     estimated_search_volume="Medium",
#                     competition_level="Low",
#                     opportunity_score=72 if is_premium else None,
#                 ))

#     return SuggestionsOut(
#         asin_or_pid=asin_or_pid, platform=platform, category=category,
#         suggestions=db_suggestions + ai_suggestions,
#     )


# def save_alert_settings(user_id: int, req: AlertSettingsRequest, db: Session) -> AlertSettingsOut:
#     tier   = _require_tier(user_id, "basic", db)
#     limits = _limits(tier)

#     if req.whatsapp_enabled and not limits.alerts_whatsapp:
#         raise PermissionError("upgrade_required:premium (WhatsApp alerts require Premium)")

#     db.execute(text("""
#         INSERT INTO kw_alert_settings
#             (kw_id, user_id, alert_on_drop, drop_threshold,
#              email_enabled, whatsapp_enabled, whatsapp_number)
#         VALUES (:kid, :uid, :drop, :thresh, :email, :wa, :wnum)
#         ON CONFLICT (kw_id) DO UPDATE SET
#             alert_on_drop    = EXCLUDED.alert_on_drop,
#             drop_threshold   = EXCLUDED.drop_threshold,
#             email_enabled    = EXCLUDED.email_enabled,
#             whatsapp_enabled = EXCLUDED.whatsapp_enabled,
#             whatsapp_number  = EXCLUDED.whatsapp_number,
#             updated_at       = NOW()
#     """), {
#         "kid": req.keyword_id, "uid": user_id,
#         "drop": req.alert_on_drop, "thresh": req.drop_threshold,
#         "email": req.email_enabled, "wa": req.whatsapp_enabled, "wnum": req.whatsapp_number,
#     })
#     db.commit()

#     return AlertSettingsOut(
#         keyword_id=req.keyword_id, alert_on_drop=req.alert_on_drop,
#         drop_threshold=req.drop_threshold, email_enabled=req.email_enabled,
#         whatsapp_enabled=req.whatsapp_enabled, whatsapp_number=req.whatsapp_number,
#     )


# def get_alert_settings(user_id: int, keyword_id: int, db: Session) -> Optional[AlertSettingsOut]:
#     _require_tier(user_id, "basic", db)
#     row = db.execute(text("""
#         SELECT alert_on_drop, drop_threshold, email_enabled, whatsapp_enabled, whatsapp_number
#         FROM kw_alert_settings WHERE kw_id = :kid AND user_id = :uid LIMIT 1
#     """), {"kid": keyword_id, "uid": user_id}).fetchone()

#     if not row:
#         return None
#     return AlertSettingsOut(
#         keyword_id=keyword_id, alert_on_drop=row[0], drop_threshold=row[1],
#         email_enabled=row[2], whatsapp_enabled=row[3], whatsapp_number=row[4],
#     )


# # ── Tier info ─────────────────────────────────────────────────────────────────

# def get_tier_limits(tier: str) -> TierLimits:
#     return _limits(tier.lower())








# app/services/keyword_tracker_service.py

"""
Keyword Tracker Service
=======================
Fixed rank calculation — uses product_title keyword matching + multiple signals
(avg_sales_volume, product_star_rating_numeric, product_num_ratings) to produce
realistic, differentiated ranks instead of identical ones.

AI suggestions are grounded in real category/title data from your DB so they
are relevant, not random.
"""

from __future__ import annotations

import logging
import time
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple, Dict

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.keyword_tracker_schema import (
    AlertSettingsOut,
    AlertSettingsRequest,
    CompetitorRankOut,
    KeywordDashboardOut,
    KeywordHistoryOut,
    KeywordOut,
    KeywordSuggestion,
    RankHistoryPoint,
    SuggestionsOut,
    TierLimits,
)

logger = logging.getLogger(__name__)


# ── AI Setup (HTTP, no SDK needed) ───────────────────────────────────────────

import httpx

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL    = "llama3.2:3b"
OLLAMA_TIMEOUT  = 60

_ai_cache: Dict[str, Tuple[str, float]] = {}
AI_CACHE_TTL = 3600  # 1 hour


def _cache_key(*parts: str) -> str:
    raw = "|".join(str(p) for p in parts)
    return hashlib.md5(raw.encode()).hexdigest()


def _ask_llama(prompt: str, ck: str) -> str:
    cached = _ai_cache.get(ck)
    if cached:
        response, ts = cached
        if time.time() - ts < AI_CACHE_TTL:
            return response

    payload = {
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "system": (
            "You are an expert e-commerce strategist for Amazon and Flipkart sellers in India. "
            "Give sharp, actionable advice like a senior consultant. "
            "Be concise — 2-4 sentences max. No bullet points unless asked. "
            "No filler like 'Great question!' or 'Certainly!'. "
            "Talk directly to the seller as 'you'. Be honest and specific. "
            "If something is declining, say it plainly and tell them exactly what to fix."
        ),
        "options": {"temperature": 0.7, "num_predict": 300},
    }

    try:
        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            resp = client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
        if resp.status_code != 200:
            logger.error(f"Ollama HTTP {resp.status_code}")
            return ""
        response = resp.json().get("response", "").strip()
        _ai_cache[ck] = (response, time.time())
        return response
    except Exception as e:
        logger.error(f"Ollama failed: {e}")
        return ""


# ── Tier configuration ────────────────────────────────────────────────────────

TIER_ORDER = {"free": 0, "basic": 1, "premium": 2}

TIER_LIMITS: dict[str, TierLimits] = {
    "free": TierLimits(
        keyword_limit=3, product_limit=1, history_days=0,
        competitor_limit=0, checks_per_day=1,
        alerts_email=False, alerts_whatsapp=False,
        keyword_suggestions=False, opportunity_score=False,
    ),
    "basic": TierLimits(
        keyword_limit=25, product_limit=5, history_days=30,
        competitor_limit=2, checks_per_day=2,
        alerts_email=True, alerts_whatsapp=False,
        keyword_suggestions=True, opportunity_score=False,
    ),
    "premium": TierLimits(
        keyword_limit=-1, product_limit=-1, history_days=9999,
        competitor_limit=10, checks_per_day=24,
        alerts_email=True, alerts_whatsapp=True,
        keyword_suggestions=True, opportunity_score=True,
    ),
}


# ── Internal helpers ──────────────────────────────────────────────────────────

def _get_user_tier(user_id: int, db: Session) -> str:
    row = db.execute(
        text("SELECT subscription_tier FROM users WHERE id = :uid LIMIT 1"),
        {"uid": user_id},
    ).fetchone()
    return str(row[0]).lower() if row and row[0] else "free"


def _require_tier(user_id: int, required: str, db: Session) -> str:
    tier = _get_user_tier(user_id, db)
    if TIER_ORDER.get(tier, 0) < TIER_ORDER.get(required, 0):
        raise PermissionError(f"upgrade_required:{required}")
    return tier


def _limits(tier: str) -> TierLimits:
    return TIER_LIMITS.get(tier, TIER_LIMITS["free"])


def _count_active_keywords(user_id: int, db: Session) -> int:
    row = db.execute(
        text("SELECT COUNT(*) FROM kw_tracked WHERE user_id = :uid AND is_active = TRUE"),
        {"uid": user_id},
    ).fetchone()
    return int(row[0]) if row else 0


def _distinct_products(user_id: int, db: Session) -> set:
    rows = db.execute(
        text("SELECT DISTINCT asin_or_pid FROM kw_tracked WHERE user_id = :uid AND is_active = TRUE"),
        {"uid": user_id},
    ).fetchall()
    return {r[0] for r in rows}


# ── FIXED Rank calculation ────────────────────────────────────────────────────
#
# Problem with old approach:
#   avg_sales_volume is stored as huge rounded numbers (600000000, 2000000000)
#   so all products get nearly the same rank when sorted by it.
#
# Fix:
#   Use a composite score that combines:
#     - keyword relevance (title match tightness)
#     - normalised sales volume (LOG scale to compress huge numbers)
#     - star rating
#     - number of ratings
#   This produces realistic, differentiated ranks.
#
# The ASIN/PID's position in this ranked list = its rank for that keyword.

def _fetch_rank_from_market(
    keyword: str,
    asin_or_pid: str,
    platform: str,
    db: Session,
) -> Optional[int]:
    kw_lower = keyword.lower().strip()
    kw_words = [w for w in kw_lower.split() if len(w) > 2]

    try:
        if platform == "amazon":
            # Pull candidates — exact phrase match first, then word-level
            rows = db.execute(text("""
                SELECT
                    asin,
                    product_title,
                    COALESCE(avg_sales_volume, 0)            AS sales_vol,
                    COALESCE(product_star_rating_numeric, 0) AS stars,
                    COALESCE(product_num_ratings, 0)         AS num_ratings,
                    CASE
                        WHEN LOWER(product_title) LIKE :exact THEN 3
                        WHEN LOWER(product_title) LIKE :kw1   THEN 2
                        ELSE 1
                    END AS relevance
                FROM rapidapi_amazon_products
                WHERE
                    product_price_numeric > 0
                    AND (
                        LOWER(product_title) LIKE :exact
                        OR LOWER(product_title) LIKE :kw1
                    )
                LIMIT 200
            """), {
                "exact": f"%{kw_lower}%",
                "kw1":   f"%{kw_words[0]}%" if kw_words else f"%{kw_lower}%",
            }).fetchall()

            if not rows:
                return None

            # Build composite score — LOG compresses the huge volume numbers
            import math
            scored = []
            for r in rows:
                log_vol  = math.log1p(float(r[2])) if r[2] > 0 else 0
                score    = (r[5] * 10) + (log_vol * 0.5) + (float(r[3]) * 2) + (math.log1p(float(r[4])) * 0.3)
                scored.append((r[0], score))

            # Sort descending — highest score = rank 1
            scored.sort(key=lambda x: x[1], reverse=True)

            for idx, (asin, _) in enumerate(scored, start=1):
                if str(asin) == asin_or_pid:
                    return idx

            return None  # product not in keyword results

        else:  # flipkart
            rows = db.execute(text("""
                SELECT
                    pid,
                    product_title,
                    COALESCE(avg_sales_volume, 0)   AS sales_vol,
                    COALESCE(product_star_rating, 0) AS stars,
                    COALESCE(product_rating_count, 0) AS num_ratings,
                    CASE
                        WHEN LOWER(product_title) LIKE :exact THEN 3
                        WHEN LOWER(product_title) LIKE :kw1   THEN 2
                        ELSE 1
                    END AS relevance
                FROM rapidapi_flipkart_products
                WHERE
                    product_price > 0
                    AND (
                        LOWER(product_title) LIKE :exact
                        OR LOWER(product_title) LIKE :kw1
                    )
                LIMIT 200
            """), {
                "exact": f"%{kw_lower}%",
                "kw1":   f"%{kw_words[0]}%" if kw_words else f"%{kw_lower}%",
            }).fetchall()

            if not rows:
                return None

            import math
            scored = []
            for r in rows:
                log_vol = math.log1p(float(r[2])) if r[2] > 0 else 0
                score   = (r[5] * 10) + (log_vol * 0.5) + (float(r[3]) * 2) + (math.log1p(float(r[4])) * 0.3)
                scored.append((r[0], score))

            scored.sort(key=lambda x: x[1], reverse=True)

            for idx, (pid, _) in enumerate(scored, start=1):
                if str(pid) == asin_or_pid:
                    return idx

            return None

    except Exception as e:
        logger.error(f"_fetch_rank_from_market error: {e}")
        return None


# ── Dashboard ─────────────────────────────────────────────────────────────────

def get_dashboard(user_id: int, db: Session) -> KeywordDashboardOut:
    tier   = _get_user_tier(user_id, db)
    limits = _limits(tier)

    rows = db.execute(text("""
        SELECT id, keyword, asin_or_pid, platform, category,
               current_rank, previous_rank, last_checked_at, created_at, is_active
        FROM kw_tracked
        WHERE user_id = :uid AND is_active = TRUE
        ORDER BY created_at DESC
    """), {"uid": user_id}).fetchall()

    keywords: List[KeywordOut] = []
    improving = declining = stable = not_ranked = 0

    for r in rows:
        current_rank  = r[5]
        previous_rank = r[6]
        rank_change   = None

        if current_rank is None:
            not_ranked += 1
        elif previous_rank is None:
            stable += 1
        else:
            diff = previous_rank - current_rank
            rank_change = diff
            if diff > 0:   improving += 1
            elif diff < 0: declining += 1
            else:          stable    += 1

        keywords.append(KeywordOut(
            id=r[0], keyword=r[1], asin_or_pid=r[2], platform=r[3],
            category=r[4], current_rank=current_rank,
            previous_rank=previous_rank, rank_change=rank_change,
            last_checked_at=r[7], created_at=r[8], is_active=r[9],
        ))

    total     = len(keywords)
    kw_limit  = limits.keyword_limit
    remaining = max(0, kw_limit - total) if kw_limit != -1 else -1

    # ── AI dashboard insight (Basic+) ─────────────────────────────────────────
    ai_insight: Optional[str] = None
    if total > 0 and TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
        kw_summary = ", ".join(
            f'"{k.keyword}" (rank #{k.current_rank or "unranked"}, '
            f'{"up" if (k.rank_change or 0) > 0 else "down" if (k.rank_change or 0) < 0 else "stable"} '
            f'{abs(k.rank_change or 0)} spots)'
            for k in keywords[:8]
        )
        prompt = (
            f"I'm an Amazon/Flipkart seller tracking {total} keywords. "
            f"Snapshot: {kw_summary}. "
            f"I have {improving} improving, {declining} declining, {stable} stable, "
            f"{not_ranked} unranked. "
            f"Give me ONE sharp insight about this pattern and the single most important "
            f"action I should take right now. Be direct, no fluff."
        )
        ck = _cache_key("dashboard_insight", str(user_id), str(improving), str(declining), str(not_ranked))
        ai_insight = _ask_llama(prompt, ck)

    return KeywordDashboardOut(
        tier=tier, tier_limits=limits,
        keywords_used=total, keywords_remaining=remaining,
        total_keywords=total,
        improving=improving, declining=declining,
        stable=stable, not_ranked=not_ranked,
        keywords=keywords, ai_insight=ai_insight,
    )


# ── Add keyword ───────────────────────────────────────────────────────────────

def add_keyword(user_id: int, req, db: Session) -> KeywordOut:
    tier   = _get_user_tier(user_id, db)
    limits = _limits(tier)

    current_count = _count_active_keywords(user_id, db)
    if limits.keyword_limit != -1 and current_count >= limits.keyword_limit:
        raise PermissionError(f"upgrade_required:keyword_limit (used {current_count}/{limits.keyword_limit})")

    existing_pids  = _distinct_products(user_id, db)
    is_new_product = req.asin_or_pid not in existing_pids
    if is_new_product and limits.product_limit != -1:
        if len(existing_pids) >= limits.product_limit:
            raise PermissionError(f"upgrade_required:product_limit (used {len(existing_pids)}/{limits.product_limit})")

    dup = db.execute(text("""
        SELECT id FROM kw_tracked
        WHERE user_id = :uid AND LOWER(keyword) = LOWER(:kw)
          AND asin_or_pid = :pid AND platform = :platform AND is_active = TRUE
        LIMIT 1
    """), {"uid": user_id, "kw": req.keyword, "pid": req.asin_or_pid, "platform": req.platform}).fetchone()
    if dup:
        raise ValueError("keyword_already_tracked")

    now = datetime.now(timezone.utc)
    row = db.execute(text("""
        INSERT INTO kw_tracked
            (user_id, keyword, asin_or_pid, platform, category,
             current_rank, previous_rank, last_checked_at, created_at, is_active)
        VALUES (:uid, :kw, :pid, :platform, :cat, NULL, NULL, NULL, :now, TRUE)
        RETURNING id, keyword, asin_or_pid, platform, category,
                  current_rank, previous_rank, last_checked_at, created_at, is_active
    """), {
        "uid": user_id, "kw": req.keyword, "pid": req.asin_or_pid,
        "platform": req.platform, "cat": req.category, "now": now,
    }).fetchone()
    db.commit()

    return KeywordOut(
        id=row[0], keyword=row[1], asin_or_pid=row[2], platform=row[3],
        category=row[4], current_rank=row[5], previous_rank=row[6],
        rank_change=None, last_checked_at=row[7], created_at=row[8], is_active=row[9],
    )


# ── Delete keyword ────────────────────────────────────────────────────────────

def delete_keyword(user_id: int, keyword_id: int, db: Session) -> None:
    result = db.execute(text("""
        UPDATE kw_tracked SET is_active = FALSE
        WHERE id = :kid AND user_id = :uid
    """), {"kid": keyword_id, "uid": user_id})
    db.commit()
    if result.rowcount == 0:
        raise LookupError("keyword_not_found")


# ── Refresh rank ──────────────────────────────────────────────────────────────

def refresh_rank(user_id: int, keyword_id: int, db: Session) -> KeywordOut:
    tier   = _get_user_tier(user_id, db)
    limits = _limits(tier)

    row = db.execute(text("""
        SELECT id, keyword, asin_or_pid, platform, category,
               current_rank, previous_rank, last_checked_at, created_at, is_active
        FROM kw_tracked
        WHERE id = :kid AND user_id = :uid AND is_active = TRUE LIMIT 1
    """), {"kid": keyword_id, "uid": user_id}).fetchone()
    if not row:
        raise LookupError("keyword_not_found")

    last_checked = row[7]
    if last_checked:
        if last_checked.tzinfo is None:
            last_checked = last_checked.replace(tzinfo=timezone.utc)
        hours_per_check = 24 // limits.checks_per_day
        next_allowed    = last_checked + timedelta(hours=hours_per_check)
        if datetime.now(timezone.utc) < next_allowed:
            wait_mins = int((next_allowed - datetime.now(timezone.utc)).total_seconds() / 60)
            raise PermissionError(f"rate_limited:{wait_mins}_minutes")

    new_rank    = _fetch_rank_from_market(row[1], row[2], row[3], db)
    old_rank    = row[5]
    now         = datetime.now(timezone.utc)
    rank_change = (old_rank - new_rank) if (new_rank is not None and old_rank is not None) else None

    db.execute(text("""
        UPDATE kw_tracked
        SET previous_rank = current_rank, current_rank = :new_rank, last_checked_at = :now
        WHERE id = :kid
    """), {"new_rank": new_rank, "now": now, "kid": keyword_id})

    db.execute(text("""
        INSERT INTO kw_rank_history (kw_id, rank, checked_at)
        VALUES (:kid, :rank, :now)
    """), {"kid": keyword_id, "rank": new_rank, "now": now})

    db.commit()

    # ── AI rank insight (Basic+) ──────────────────────────────────────────────
    ai_rank_insight: Optional[str] = None
    if TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
        keyword  = row[1]
        platform = row[3]
        category = row[4] or "general"

        if new_rank is None:
            situation = f'disappeared from top results for "{keyword}" on {platform}'
        elif old_rank is None:
            situation = f'appeared at rank #{new_rank} for "{keyword}" on {platform} for the first time'
        elif rank_change is not None and rank_change > 0:
            situation = f'improved from #{old_rank} to #{new_rank} (+{rank_change} spots) for "{keyword}" on {platform}'
        elif rank_change is not None and rank_change < 0:
            situation = f'dropped from #{old_rank} to #{new_rank} ({rank_change} spots) for "{keyword}" on {platform}'
        else:
            situation = f'stayed at #{new_rank} for "{keyword}" on {platform}'

        prompt = (
            f"My product (category: {category}) just {situation}. "
            f"In 2-3 sentences: what likely caused this and what one concrete action "
            f"can I take in the next 24 hours to protect or improve this ranking? "
            f"Be specific, no generic advice."
        )
        ck = _cache_key("rank_insight", str(keyword_id), str(new_rank), str(old_rank))
        ai_rank_insight = _ask_llama(prompt, ck)

    return KeywordOut(
        id=row[0], keyword=row[1], asin_or_pid=row[2], platform=row[3],
        category=row[4], current_rank=new_rank, previous_rank=old_rank,
        rank_change=rank_change, last_checked_at=now, created_at=row[8], is_active=row[9],
        ai_rank_insight=ai_rank_insight,
    )


# ── Rank history ──────────────────────────────────────────────────────────────

def get_keyword_history(user_id: int, keyword_id: int, db: Session) -> KeywordHistoryOut:
    tier   = _get_user_tier(user_id, db)
    limits = _limits(tier)

    if limits.history_days == 0:
        raise PermissionError("upgrade_required:history (free tier has no history)")

    kw = db.execute(text("""
        SELECT id, keyword, asin_or_pid, platform FROM kw_tracked
        WHERE id = :kid AND user_id = :uid AND is_active = TRUE LIMIT 1
    """), {"kid": keyword_id, "uid": user_id}).fetchone()
    if not kw:
        raise LookupError("keyword_not_found")

    cutoff = datetime.now(timezone.utc) - timedelta(days=limits.history_days)
    hist   = db.execute(text("""
        SELECT checked_at, rank FROM kw_rank_history
        WHERE kw_id = :kid AND checked_at >= :cutoff
        ORDER BY checked_at ASC
    """), {"kid": keyword_id, "cutoff": cutoff}).fetchall()

    history_points = [
        RankHistoryPoint(
            checked_at=r[0], rank=r[1],
            page=(r[1] // 10 + 1) if r[1] else None,
        )
        for r in hist
    ]

    # ── AI trend analysis (Basic+) ────────────────────────────────────────────
    ai_trend: Optional[str] = None
    if len(history_points) >= 3 and TIER_ORDER.get(tier, 0) >= TIER_ORDER["basic"]:
        ranks = [p.rank for p in history_points if p.rank is not None]
        if len(ranks) >= 2:
            recent_avg = sum(ranks[-3:]) / len(ranks[-3:])
            older_avg  = sum(ranks[:3])  / len(ranks[:3])
            trend_dir  = "improving" if recent_avg < older_avg else "declining" if recent_avg > older_avg else "stable"

            prompt = (
                f'Tracking keyword "{kw[1]}" on {kw[3]} for product {kw[2]}. '
                f"Over {len(ranks)} checks: started #{ranks[0]}, now #{ranks[-1]}, "
                f"best #{min(ranks)}, worst #{max(ranks)}. Trend: {trend_dir}. "
                f"3-sentence analysis: competitive position, what's driving it, "
                f"one specific listing or ad change to make right now."
            )
            ck = _cache_key("history_trend", str(keyword_id), str(ranks[-1]), str(len(ranks)), trend_dir)
            ai_trend = _ask_llama(prompt, ck)

    return KeywordHistoryOut(
        keyword_id=kw[0], keyword=kw[1], asin_or_pid=kw[2], platform=kw[3],
        history=history_points, ai_trend_analysis=ai_trend,
    )


# ── Competitors ───────────────────────────────────────────────────────────────

def add_competitor(user_id: int, keyword_id: int, competitor_pid: str, platform: str, db: Session) -> CompetitorRankOut:
    tier   = _require_tier(user_id, "basic", db)
    limits = _limits(tier)

    count_row = db.execute(text("""
        SELECT COUNT(*) FROM kw_competitors WHERE kw_id = :kid AND user_id = :uid
    """), {"kid": keyword_id, "uid": user_id}).fetchone()
    if int(count_row[0]) >= limits.competitor_limit:
        raise PermissionError("upgrade_required:competitor_limit")

    now = datetime.now(timezone.utc)
    row = db.execute(text("""
        INSERT INTO kw_competitors
            (kw_id, user_id, competitor_asin_or_pid, platform, current_rank, last_checked_at)
        VALUES (:kid, :uid, :cpid, :platform, NULL, :now)
        RETURNING id, kw_id, competitor_asin_or_pid, platform, current_rank, last_checked_at
    """), {"kid": keyword_id, "uid": user_id, "cpid": competitor_pid, "platform": platform, "now": now}).fetchone()
    db.commit()

    return CompetitorRankOut(
        id=row[0], keyword_id=row[1], competitor_asin_or_pid=row[2],
        platform=row[3], current_rank=row[4], last_checked_at=row[5],
    )


def get_competitors(user_id: int, keyword_id: int, db: Session) -> List[CompetitorRankOut]:
    _require_tier(user_id, "basic", db)
    rows = db.execute(text("""
        SELECT id, kw_id, competitor_asin_or_pid, platform, current_rank, last_checked_at
        FROM kw_competitors WHERE kw_id = :kid AND user_id = :uid
        ORDER BY current_rank ASC NULLS LAST
    """), {"kid": keyword_id, "uid": user_id}).fetchall()

    return [
        CompetitorRankOut(
            id=r[0], keyword_id=r[1], competitor_asin_or_pid=r[2],
            platform=r[3], current_rank=r[4], last_checked_at=r[5],
        )
        for r in rows
    ]



# ── Keyword suggestions ───────────────────────────────────────────────────────
#
# Production approach — fully accurate, no noise:
#   1. Fetch the tracked product's own title from DB by ASIN/PID
#   2. Extract CORE IDENTITY WORDS (meaningful nouns, no generic adjectives)
#   3. Find SIMILAR products whose titles contain ALL core words (strict match)
#   4. Extract bigrams/trigrams only from those strictly similar products
#   5. AI generates buyer-intent phrases using the real product title
#
# "tongue scraper" → only pulls products with "tongue" AND "scraper" in title
# → zero chance of "plastic", "easy", "handle" leaking through

def get_keyword_suggestions(
    user_id: int, asin_or_pid: str, platform: str,
    category: Optional[str], db: Session,
) -> SuggestionsOut:
    import math

    tier       = _require_tier(user_id, "basic", db)
    is_premium = (tier == "premium")

    STOPWORDS = {
        "and","for","with","the","a","an","in","of","to","is","by","on",
        "at","or","from","pack","set","piece","pieces","kg","ml","g","l",
        "cm","mm","inch","inches","buy","get","best","new","free","india",
        "online","price","offer","sale","deal","high","low","quality",
        "product","item","original","genuine","premium","value","colour",
        "color","size","type","model","brand","made","also","used","use",
        "easy","fun","may","vary","multicolor","reusable","waterproof",
        "handle","plastic","metal","steel","wooden","rubber","fabric",
        "black","white","blue","red","green","yellow","pink","grey",
        "small","large","medium","mini","extra","super","ultra","pro",
        "plus","max","lite","slim","compact","portable","heavy","light",
        "combo","pack","box","bottle","bag","case","cover","holder",
    }

    def _meaningful_words(title: str) -> List[str]:
        words = [w.strip("(),.-|/&%#@![]{}:'\"") for w in title.lower().split()]
        return [w for w in words if len(w) > 3 and w not in STOPWORDS and w.isalpha()]

    # ── Step 1: Get this product's own title ─────────────────────────────────
    try:
        if platform == "amazon":
            product_row = db.execute(text("""
                SELECT product_title, category_name
                FROM rapidapi_amazon_products
                WHERE asin = :pid LIMIT 1
            """), {"pid": asin_or_pid}).fetchone()
        else:
            product_row = db.execute(text("""
                SELECT product_title, category_name
                FROM rapidapi_flipkart_products
                WHERE pid = :pid LIMIT 1
            """), {"pid": asin_or_pid}).fetchone()
    except Exception as e:
        logger.error(f"product fetch error: {e}")
        product_row = None

    product_title   = product_row[0] if product_row else ""
    actual_category = product_row[1] if product_row else category or "general"
    core_words      = _meaningful_words(product_title)

    # Use top 3 most specific words — skip ALL-CAPS brand names
    filter_words = [w for w in core_words if not w.isupper()][:3]
    logger.info(f"Suggestion filter_words for {asin_or_pid}: {filter_words}")

    # ── Step 2: Find SIMILAR products — title must contain ALL filter words ──
    similar_rows: list = []
    try:
        if filter_words:
            conditions = " AND ".join([
                f"LOWER(product_title) LIKE :w{i}" for i in range(len(filter_words))
            ])
            params = {f"w{i}": f"%{w}%" for i, w in enumerate(filter_words)}

            if platform == "amazon":
                similar_rows = db.execute(text(f"""
                    SELECT product_title, avg_sales_volume
                    FROM rapidapi_amazon_products
                    WHERE product_price_numeric > 0 AND ({conditions})
                    ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
                """), params).fetchall()
            else:
                similar_rows = db.execute(text(f"""
                    SELECT product_title, avg_sales_volume
                    FROM rapidapi_flipkart_products
                    WHERE product_price > 0 AND ({conditions})
                    ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
                """), params).fetchall()

        # Fallback: if < 3 results with all words, try first 2 only
        if len(similar_rows) < 3 and len(filter_words) >= 2:
            params2 = {"w0": f"%{filter_words[0]}%", "w1": f"%{filter_words[1]}%"}
            if platform == "amazon":
                similar_rows = db.execute(text("""
                    SELECT product_title, avg_sales_volume
                    FROM rapidapi_amazon_products
                    WHERE product_price_numeric > 0
                      AND LOWER(product_title) LIKE :w0
                      AND LOWER(product_title) LIKE :w1
                    ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
                """), params2).fetchall()
            else:
                similar_rows = db.execute(text("""
                    SELECT product_title, avg_sales_volume
                    FROM rapidapi_flipkart_products
                    WHERE product_price > 0
                      AND LOWER(product_title) LIKE :w0
                      AND LOWER(product_title) LIKE :w1
                    ORDER BY avg_sales_volume DESC NULLS LAST LIMIT 60
                """), params2).fetchall()

    except Exception as e:
        logger.error(f"similar products fetch error: {e}")
        similar_rows = []

    logger.info(f"Found {len(similar_rows)} similar products for {asin_or_pid}")

    # ── Step 3: Score bigrams/trigrams from similar products only ────────────
    anchor_set = set(filter_words)
    scores: dict[str, Tuple[int, int]] = {}

    for r in similar_rows:
        title = str(r[0] or "")
        words = _meaningful_words(title)
        vol   = int(r[1] or 0)

        bigrams  = [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]
        trigrams = [f"{words[i]} {words[i+1]} {words[i+2]}" for i in range(len(words) - 2)]

        for phrase in bigrams + trigrams:
            # Only keep phrases that contain at least one filter/anchor word
            if anchor_set and not (set(phrase.split()) & anchor_set):
                continue
            ex = scores.get(phrase, (0, 0))
            scores[phrase] = (ex[0] + vol, ex[1] + 1)

    sorted_phrases = sorted(scores.items(), key=lambda x: x[1][0], reverse=True)[:12]

    tracked_set = {r[0] for r in db.execute(text("""
        SELECT LOWER(keyword) FROM kw_tracked
        WHERE user_id = :uid AND asin_or_pid = :pid AND is_active = TRUE
    """), {"uid": user_id, "pid": asin_or_pid}).fetchall()}

    db_suggestions = []
    for phrase, (vol_sum, count) in sorted_phrases:
        if phrase in tracked_set:
            continue
        avg_vol     = vol_sum / count if count else 0
        search_vol  = "High" if avg_vol > 500_000 else ("Medium" if avg_vol > 100_000 else "Low")
        competition = "High" if count > 15 else ("Medium" if count > 5 else "Low")
        opp_score   = None
        if is_premium:
            vol_s     = min(100, int(math.log1p(avg_vol) * 3))
            comp_s    = max(0, 100 - (count * 4))
            opp_score = (vol_s + comp_s) // 2
        db_suggestions.append(KeywordSuggestion(
            keyword=phrase, estimated_search_volume=search_vol,
            competition_level=competition, opportunity_score=opp_score,
        ))

    # ── Step 4: AI suggestions — ONLY when we have real product context ───────
    # If product_title is empty, the PID is not in our DB.
    # In that case we skip AI entirely — better to return nothing than
    # hallucinate irrelevant keywords like "laptop screen replacement".
    ai_suggestions: List[KeywordSuggestion] = []

    if not product_title or not filter_words:
        # PID not found in DB — cannot generate accurate suggestions
        logger.warning(
            f"Skipping AI suggestions for {asin_or_pid} — "
            f"product not found in DB (product_title={repr(product_title)}, "
            f"filter_words={filter_words})"
        )
    elif len(similar_rows) < 2:
        # Found the product but no similar competitors in DB
        # AI still has the product title so can be somewhat grounded
        existing_kws = [s.keyword for s in db_suggestions[:8]]
        prompt = (
            f"I sell this product on {platform}: \"{product_title[:120]}\". "
            f"Suggest 6 search phrases Indian buyers type for this exact product. "
            f"Every phrase must contain at least one of these words: {', '.join(filter_words)}. "
            f"Focus on buyer-intent, use-case, and problem-solving phrases only. "
            f"No generic words unrelated to this product. "
            f"Return ONLY a comma-separated list. No numbers, no explanation."
        )
        ck = _cache_key("ai_sug_v3", asin_or_pid, platform, " ".join(filter_words), tier)
        ai_raw = _ask_llama(prompt, ck)
        if ai_raw:
            cleaned = ai_raw.replace("\n", ",").replace(";", ",")
            for ai_kw in [k.strip(" .-1234567890)'\"").lower() for k in cleaned.split(",") if k.strip()][:6]:
                # Hard validation — must contain at least one filter word
                if (ai_kw and len(ai_kw) > 4
                        and ai_kw not in tracked_set
                        and ai_kw not in existing_kws
                        and any(fw in ai_kw for fw in filter_words)):
                    ai_suggestions.append(KeywordSuggestion(
                        keyword=ai_kw,
                        estimated_search_volume="Medium",
                        competition_level="Low",
                        opportunity_score=72 if is_premium else None,
                    ))
    else:
        # Full context — product found + similar competitors found
        similar_titles = [str(r[0])[:80] for r in similar_rows[:6] if r[0]]
        similar_str    = " | ".join(similar_titles)
        existing_kws   = [s.keyword for s in db_suggestions[:8]]
        existing_str   = ", ".join(existing_kws) or "none"

        prompt = (
            f"I sell this exact product on {platform}: \"{product_title[:120]}\". "
            f"Similar competing products: {similar_str}. "
            f"Keywords I already track: {existing_str}. "
            f"Suggest 6 NEW search phrases Indian buyers type for THIS specific product. "
            f"Every phrase MUST contain at least one of: {', '.join(filter_words)}. "
            f"Focus on: use-case phrases, problem-solving searches, buyer-intent long-tail queries. "
            f"No generic words. Each keyword must make sense only for this product. "
            f"Return ONLY a comma-separated list. No numbers, no explanation."
        )
        ck = _cache_key("ai_sug_v3", asin_or_pid, platform, " ".join(filter_words), tier)
        ai_raw = _ask_llama(prompt, ck)

        if ai_raw:
            cleaned = ai_raw.replace("\n", ",").replace(";", ",")
            for ai_kw in [k.strip(" .-1234567890)'\"").lower() for k in cleaned.split(",") if k.strip()][:6]:
                # Hard validation — AI output must contain a filter word, not be generic
                if (ai_kw and len(ai_kw) > 4
                        and ai_kw not in tracked_set
                        and ai_kw not in existing_kws
                        and any(fw in ai_kw for fw in filter_words)):
                    ai_suggestions.append(KeywordSuggestion(
                        keyword=ai_kw,
                        estimated_search_volume="Medium",
                        competition_level="Low",
                        opportunity_score=72 if is_premium else None,
                    ))

    return SuggestionsOut(
        asin_or_pid=asin_or_pid, platform=platform, category=category,
        suggestions=db_suggestions + ai_suggestions,
    )


def save_alert_settings(user_id: int, req: AlertSettingsRequest, db: Session) -> AlertSettingsOut:
    tier   = _require_tier(user_id, "basic", db)
    limits = _limits(tier)

    if req.whatsapp_enabled and not limits.alerts_whatsapp:
        raise PermissionError("upgrade_required:premium (WhatsApp alerts require Premium)")

    db.execute(text("""
        INSERT INTO kw_alert_settings
            (kw_id, user_id, alert_on_drop, drop_threshold,
             email_enabled, whatsapp_enabled, whatsapp_number)
        VALUES (:kid, :uid, :drop, :thresh, :email, :wa, :wnum)
        ON CONFLICT (kw_id) DO UPDATE SET
            alert_on_drop    = EXCLUDED.alert_on_drop,
            drop_threshold   = EXCLUDED.drop_threshold,
            email_enabled    = EXCLUDED.email_enabled,
            whatsapp_enabled = EXCLUDED.whatsapp_enabled,
            whatsapp_number  = EXCLUDED.whatsapp_number,
            updated_at       = NOW()
    """), {
        "kid": req.keyword_id, "uid": user_id,
        "drop": req.alert_on_drop, "thresh": req.drop_threshold,
        "email": req.email_enabled, "wa": req.whatsapp_enabled, "wnum": req.whatsapp_number,
    })
    db.commit()

    return AlertSettingsOut(
        keyword_id=req.keyword_id, alert_on_drop=req.alert_on_drop,
        drop_threshold=req.drop_threshold, email_enabled=req.email_enabled,
        whatsapp_enabled=req.whatsapp_enabled, whatsapp_number=req.whatsapp_number,
    )


def get_alert_settings(user_id: int, keyword_id: int, db: Session) -> Optional[AlertSettingsOut]:
    _require_tier(user_id, "basic", db)
    row = db.execute(text("""
        SELECT alert_on_drop, drop_threshold, email_enabled, whatsapp_enabled, whatsapp_number
        FROM kw_alert_settings WHERE kw_id = :kid AND user_id = :uid LIMIT 1
    """), {"kid": keyword_id, "uid": user_id}).fetchone()

    if not row:
        return None
    return AlertSettingsOut(
        keyword_id=keyword_id, alert_on_drop=row[0], drop_threshold=row[1],
        email_enabled=row[2], whatsapp_enabled=row[3], whatsapp_number=row[4],
    )


# ── Tier info ─────────────────────────────────────────────────────────────────

def get_tier_limits(tier: str) -> TierLimits:
    return _limits(tier.lower())