
# """
# comparison_router.py  –  Production-grade Price & Review Comparison API
# ------------------------------------------------------------------------
# Tier matrix
#   free    : basic product stats (price, rating, distribution)
#   basic   : + market benchmarks, price bands, recent reviews, response rate
#   premium : + AI tips (Ollama), velocity insights, sentiment, smart competitor table

# Key design decisions
#   • Competitor discovery uses TrackedProduct siblings first (same seller/currency)
#     then RapidapiAmazonProducts, with currency-aware filtering at every layer.
#   • All Ollama calls are fire-and-forget with a hardcoded fallback string so a
#     slow/offline model never breaks the endpoint.
#   • Every numeric operation is guarded; no endpoint can 500 on bad DB data.
#   • _TrackedProxy is defined at module level (not inside a function) to avoid
#     pickling issues if the router is ever used with multiprocessing workers.
#   • math is imported at the top, not inside a conditional block.
# """

# from __future__ import annotations

# import json
# import logging
# import math
# import re
# from difflib import SequenceMatcher
# from typing import Any, Optional

# import httpx
# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# from sqlalchemy import or_

# from app.db.session import get_db
# from app.models.legacy_models import (
#     RapidapiAmazonProducts,
#     TrackedProduct,
#     User,
# )

# logger = logging.getLogger(__name__)

# router = APIRouter(prefix="/comparison", tags=["Comparison"])

# # ── Ollama config ─────────────────────────────────────────────────────────────
# OLLAMA_URL   = "http://localhost:11434/api/generate"
# OLLAMA_MODEL = "llama3.2:3b"
# OLLAMA_TIMEOUT = 30.0  # seconds – avoids blocking the request indefinitely

# # ── Currency thresholds for cross-currency sanity checks ─────────────────────
# # If a USD product has a numeric price above this it is almost certainly INR.
# _USD_PRICE_CEILING = 500.0
# # If an INR product has a numeric price below this it is almost certainly USD.
# _INR_PRICE_FLOOR   = 10.0


# # ─────────────────────────────────────────────────────────────────────────────
# # MODULE-LEVEL PROXY  (must NOT be defined inside a function)
# # ─────────────────────────────────────────────────────────────────────────────

# class _TrackedProxy:
#     """
#     Wraps a TrackedProduct row so it can be used wherever a
#     RapidapiAmazonProducts row is expected (duck-typing).
#     Defined at module level to avoid closure/pickling issues.
#     """
#     __slots__ = (
#         "asin", "product_title", "product_photo",
#         "product_price", "product_price_numeric",
#         "product_original_price", "product_original_price_numeric",
#         "product_star_rating", "product_star_rating_numeric",
#         "product_num_ratings", "is_best_seller", "is_amazon_choice",
#         "is_prime", "sales_volume", "country", "category_name",
#     )

#     def __init__(self, t: TrackedProduct) -> None:
#         self.asin                          = t.asin
#         self.product_title                 = t.product_title
#         self.product_photo                 = t.product_photo
#         self.product_price                 = t.product_price
#         self.product_price_numeric         = _clean_price(t.product_price)
#         self.product_original_price        = t.product_original_price
#         self.product_original_price_numeric = _clean_price(t.product_original_price)
#         self.product_star_rating           = t.product_star_rating
#         self.product_star_rating_numeric   = t.product_star_rating_numeric
#         self.product_num_ratings           = t.product_num_ratings
#         self.is_best_seller                = t.is_best_seller
#         self.is_amazon_choice              = getattr(t, "is_amazon_choice", None)
#         self.is_prime                      = t.is_prime
#         self.sales_volume                  = t.sales_volume
#         self.country                       = t.country
#         self.category_name                 = None  # TrackedProduct has no category


# # ─────────────────────────────────────────────────────────────────────────────
# # PURE HELPERS  (no DB access, no side effects)
# # ─────────────────────────────────────────────────────────────────────────────

# def _parse_json_field(field: Any) -> list:
#     """Safely deserialise a JSON-encoded list field from the DB."""
#     if field is None:
#         return []
#     if isinstance(field, list):
#         return field
#     try:
#         result = json.loads(field)
#         return result if isinstance(result, list) else []
#     except Exception:
#         return []


# def _clean_price(p: Any) -> Optional[float]:
#     """Strip currency symbols / commas and return a float, or None on failure."""
#     if p is None or str(p).strip() == "":
#         return None
#     try:
#         cleaned = (
#             str(p)
#             .replace("$", "").replace("₹", "").replace("£", "")
#             .replace("€", "").replace(",", "").strip()
#         )
#         value = float(cleaned)
#         return value if value > 0 else None
#     except (ValueError, TypeError):
#         return None


# def _safe_int(val: Any, default: Any = 0) -> Any:
#     """Convert val to int, returning default on any failure."""
#     try:
#         return int(val)
#     except (ValueError, TypeError):
#         return default


# def _currency_sym(currency: str) -> str:
#     """Return the display symbol for a currency code."""
#     return {"INR": "₹", "GBP": "£", "EUR": "€"}.get(currency, "$")


# def _extract_keywords(title: str) -> list[str]:
#     """
#     Tokenise a product title into meaningful keywords for fuzzy matching.
#     Keeps alphanumeric tokens ≥ 3 chars, removes English stop-words.
#     """
#     if not title:
#         return []
#     _STOP = {
#         "the", "a", "an", "and", "or", "for", "with", "in", "of",
#         "to", "by", "from", "on", "at", "is", "are", "pack", "set",
#         "new", "buy", "get", "use", "this",
#     }
#     tokens = re.findall(r"[a-zA-Z0-9]+", title.lower())
#     return [t for t in tokens if len(t) >= 3 and t not in _STOP]


# def _title_similarity(t1: str, t2: str) -> float:
#     """
#     Composite similarity score [0, 1] combining Jaccard keyword overlap (60 %)
#     and SequenceMatcher on the first 80 chars (40 %).
#     """
#     if not t1 or not t2:
#         return 0.0
#     k1 = set(_extract_keywords(t1))
#     k2 = set(_extract_keywords(t2))
#     if not k1 or not k2:
#         return 0.0
#     union = k1 | k2
#     jaccard = len(k1 & k2) / len(union) if union else 0.0
#     seq     = SequenceMatcher(None, t1.lower()[:80], t2.lower()[:80]).ratio()
#     return round(jaccard * 0.6 + seq * 0.4, 4)


# def _parse_sales_volume(s: Optional[str]) -> Optional[int]:
#     """
#     Convert human-readable sales strings to approximate integers.
#     '9K+ bought in past month' → 9000
#     '1K+'                      → 1000
#     '100+'                     → 100
#     """
#     if not s:
#         return None
#     lower = s.lower()
#     m = re.search(r"([\d.]+)\s*k", lower)
#     if m:
#         return int(float(m.group(1)) * 1_000)
#     m = re.search(r"([\d,]+)", lower)
#     if m:
#         try:
#             return int(m.group(1).replace(",", ""))
#         except ValueError:
#             return None
#     return None


# def _is_price_currency_sane(price: float, currency: str) -> bool:
#     """
#     Heuristic guard: return False if the numeric price looks like it belongs
#     to a different currency (e.g. ₹1,629 stored as 1629 appearing in a USD feed).
#     """
#     if currency == "USD" and price > _USD_PRICE_CEILING:
#         return False
#     if currency == "INR" and price < _INR_PRICE_FLOOR:
#         return False
#     return True


# def _truncate(s: Optional[str], n: int) -> str:
#     """Return s truncated to n chars with an ellipsis if needed."""
#     if not s:
#         return ""
#     return s[:n] + ("…" if len(s) > n else "")


# # ─────────────────────────────────────────────────────────────────────────────
# # DB HELPERS
# # ─────────────────────────────────────────────────────────────────────────────

# def _get_user_tier(db: Session, user_email: str) -> str:
#     """Look up subscription tier; default to 'free' on any failure."""
#     try:
#         user = db.query(User).filter(User.email == user_email).first()
#         if user and user.subscription_tier:
#             return user.subscription_tier.lower().strip()
#     except Exception as exc:
#         logger.warning("_get_user_tier failed for %s: %s", user_email, exc)
#     return "free"


# def _find_best_competitors(
#     db: Session,
#     tracked: TrackedProduct,
#     current_price: float,
#     currency: str,
#     limit: int = 50,
# ) -> list[tuple[Any, float]]:
#     """
#     Multi-strategy competitor discovery, ordered from most to least accurate:

#     1. RapidapiAmazonProducts rows in the same currency + ±60 % price window
#     2. RapidapiAmazonProducts rows in the same currency (no price filter)
#     3. Other TrackedProduct rows with the same currency (proxy competitors –
#        most useful when rapidapi table has no matching-currency data)
#     4. All RapidapiAmazonProducts rows (last resort, currency-filtered later)

#     Every candidate is scored with _title_similarity + category bonus – price
#     penalty.  Only rows with score > 0.05 are returned, sorted descending.
#     """
#     if not current_price or current_price <= 0:
#         return []

#     price_lo = current_price * 0.40
#     price_hi = current_price * 1.60
#     currency_prefix = "₹" if currency == "INR" else "$"

#     # ── Strategy 1: same currency + price range ───────────────────────────
#     base_q = (
#         db.query(RapidapiAmazonProducts)
#         .filter(RapidapiAmazonProducts.product_price_numeric.isnot(None))
#     )
#     if currency == "INR":
#         base_q = base_q.filter(
#             RapidapiAmazonProducts.product_price.like("₹%"),
#             RapidapiAmazonProducts.product_price_numeric >= price_lo,
#             RapidapiAmazonProducts.product_price_numeric <= price_hi,
#         )
#     elif currency == "USD":
#         base_q = base_q.filter(
#             or_(
#                 RapidapiAmazonProducts.product_price.like("$%"),
#                 RapidapiAmazonProducts.country == "US",
#             ),
#             RapidapiAmazonProducts.product_price_numeric >= price_lo,
#             RapidapiAmazonProducts.product_price_numeric <= price_hi,
#         )
#     else:
#         base_q = base_q.filter(
#             RapidapiAmazonProducts.country == (tracked.country or "US"),
#             RapidapiAmazonProducts.product_price_numeric >= price_lo,
#             RapidapiAmazonProducts.product_price_numeric <= price_hi,
#         )

#     candidates: list[Any] = base_q.limit(300).all()

#     # ── Strategy 2: same currency prefix, relax price range ──────────────
#     if len(candidates) < 5:
#         candidates = (
#             db.query(RapidapiAmazonProducts)
#             .filter(
#                 RapidapiAmazonProducts.product_price_numeric.isnot(None),
#                 RapidapiAmazonProducts.product_price.like(f"{currency_prefix}%"),
#             )
#             .limit(300)
#             .all()
#         )

#     # ── Strategy 3: sibling TrackedProduct rows (same currency) ──────────
#     if len(candidates) < 5:
#         siblings = (
#             db.query(TrackedProduct)
#             .filter(
#                 TrackedProduct.asin != tracked.asin,
#                 TrackedProduct.currency == currency,
#                 TrackedProduct.product_price.isnot(None),
#             )
#             .limit(300)
#             .all()
#         )
#         proxies = [
#             _TrackedProxy(t)
#             for t in siblings
#             if _clean_price(t.product_price) is not None
#         ]
#         if proxies:
#             candidates = proxies  # type: ignore[assignment]

#     # ── Strategy 4: all rapidapi rows (last resort) ───────────────────────
#     if len(candidates) < 5:
#         candidates = (
#             db.query(RapidapiAmazonProducts)
#             .filter(RapidapiAmazonProducts.product_price_numeric.isnot(None))
#             .limit(200)
#             .all()
#         )

#     # ── Score every candidate ─────────────────────────────────────────────
#     scored: list[tuple[Any, float]] = []
#     for row in candidates:
#         if row.asin == tracked.asin:
#             continue
#         if row.product_price_numeric is None:
#             continue

#         sim = _title_similarity(tracked.product_title or "", row.product_title or "")

#         # Category keyword bonus
#         cat_bonus = 0.0
#         if row.category_name:
#             cat_kw   = set(_extract_keywords(row.category_name))
#             prod_kw  = set(_extract_keywords(tracked.product_title or ""))
#             cat_bonus = min(len(prod_kw & cat_kw) * 0.03, 0.15)

#         # Relative price penalty (softer: max −0.10)
#         price_penalty = 0.0
#         if current_price and row.product_price_numeric:
#             ratio         = abs(row.product_price_numeric - current_price) / current_price
#             price_penalty = min(ratio * 0.10, 0.10)

#         score = sim + cat_bonus - price_penalty
#         if score > 0.05:
#             scored.append((row, round(score, 4)))

#     scored.sort(key=lambda x: x[1], reverse=True)
#     return scored[:limit]


# def _normalize_prices(
#     competitors: list[tuple[Any, float]],
#     currency: str,
# ) -> list[float]:
#     """
#     Return clean numeric prices from competitor rows, dropping any row whose
#     price looks like it belongs to a different currency.
#     """
#     prices: list[float] = []
#     for row, _ in competitors:
#         p = row.product_price_numeric
#         if p is None or p <= 0:
#             continue
#         if not _is_price_currency_sane(p, currency):
#             continue
#         prices.append(float(p))
#     return prices


# # ─────────────────────────────────────────────────────────────────────────────
# # OLLAMA WRAPPER
# # ─────────────────────────────────────────────────────────────────────────────

# def _ollama(prompt: str, max_tokens: int = 200) -> str:
#     """
#     Call Ollama and return the response string.
#     Returns "" on any error so callers can fall back gracefully.
#     Never raises.
#     """
#     try:
#         with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
#             resp = client.post(
#                 OLLAMA_URL,
#                 json={
#                     "model":   OLLAMA_MODEL,
#                     "prompt":  prompt,
#                     "stream":  False,
#                     "options": {"num_predict": max_tokens, "temperature": 0.4},
#                 },
#             )
#             resp.raise_for_status()
#             text = resp.json().get("response", "").strip()
#             return text
#     except Exception as exc:
#         logger.debug("Ollama call failed: %s", exc)
#         return ""


# # ─────────────────────────────────────────────────────────────────────────────
# # PRICE COMPARISON  (/comparison/price)
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/price")
# def get_price_comparison(
#     asin:       str           = Query(..., description="Amazon ASIN"),
#     seller_id:  str           = Query(..., description="Seller ID"),
#     user_email: Optional[str] = Query(None, description="User email for tier lookup"),
#     db:         Session       = Depends(get_db),
# ) -> dict:
#     """
#     Returns tiered price comparison data for a tracked product.

#     free    → current_price, original_price, discount_pct, basic product flags
#     basic   → + min_offer_price, market_avg/min/max, price_bands,
#                 price_position, competitor_count, top_competitors
#     premium → + ai_pricing_tip, ai_velocity_insight, seller_other_products
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     # ── Fetch tracked product ─────────────────────────────────────────────
#     tracked = (
#         db.query(TrackedProduct)
#         .filter(
#             TrackedProduct.asin      == asin,
#             TrackedProduct.seller_id == seller_id,
#         )
#         .first()
#     )
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     current_price  = _clean_price(tracked.product_price)
#     original_price = _clean_price(tracked.product_original_price)
#     currency       = (tracked.currency or "USD").upper().strip()
#     sym            = _currency_sym(currency)

#     # Discount % — only meaningful when both prices present and original > current
#     discount_pct: Optional[float] = None
#     if (
#         current_price is not None
#         and original_price is not None
#         and original_price > current_price > 0
#     ):
#         discount_pct = round(
#             (original_price - current_price) / original_price * 100, 1
#         )

#     result: dict[str, Any] = {
#         # Meta
#         "tier":          tier,
#         "asin":          asin,
#         "currency":      currency,
#         "data_quality":  "live",
#         # Product info
#         "product_title": tracked.product_title,
#         "product_photo": tracked.product_photo,
#         "is_prime":      bool(tracked.is_prime),
#         "is_best_seller":bool(tracked.is_best_seller),
#         "sales_volume":  tracked.sales_volume,
#         "num_offers":    tracked.product_num_offers,
#         "delivery":      tracked.delivery,
#         # Free tier prices
#         "current_price":  current_price,
#         "original_price": original_price,
#         "discount_pct":   discount_pct,
#         # Basic+ (pre-filled None so the schema is always consistent)
#         "min_offer_price":  None,
#         "market_avg":       None,
#         "market_min":       None,
#         "market_max":       None,
#         "price_percentile": None,
#         "price_position":   None,
#         "competitor_count": None,
#         "price_bands":      None,
#         "top_competitors":  None,
#         # Premium
#         "ai_pricing_tip":       None,
#         "ai_velocity_insight":  None,
#         "seller_other_products": None,
#     }

#     # ── Basic tier enrichment ─────────────────────────────────────────────
#     if is_basic:
#         result["min_offer_price"] = _clean_price(tracked.product_minimum_offer_price)

#         scored_competitors = _find_best_competitors(
#             db, tracked, current_price or 0.0, currency
#         )
#         prices = _normalize_prices(scored_competitors, currency)

#         if prices:
#             avg_p = round(sum(prices) / len(prices), 2)
#             p_min = round(min(prices), 2)
#             p_max = round(max(prices), 2)

#             result["market_avg"]       = avg_p
#             result["market_min"]       = p_min
#             result["market_max"]       = p_max
#             result["competitor_count"] = len(prices)
#             result["data_quality"]     = "live" if len(prices) >= 10 else "limited"

#             if current_price:
#                 below = sum(1 for p in prices if p < current_price)
#                 result["price_percentile"] = round(below / len(prices) * 100, 1)

#                 diff_ratio = (current_price - avg_p) / avg_p if avg_p else 0.0
#                 if diff_ratio > 0.10:
#                     result["price_position"] = "Above Market"
#                 elif diff_ratio < -0.10:
#                     result["price_position"] = "Below Market"
#                 else:
#                     result["price_position"] = "Competitive"

#             # Price bands (5 equal-width buckets)
#             span      = p_max - p_min
#             band_size = (span / 5) if span > 0 else max(p_min * 0.10, 1.0)
#             bands     = []
#             for i in range(5):
#                 b_lo = p_min + i * band_size
#                 b_hi = b_lo + band_size
#                 cnt  = sum(1 for p in prices if b_lo <= p < b_hi)
#                 # Make sure the highest price falls into the last band
#                 if i == 4:
#                     cnt = sum(1 for p in prices if b_lo <= p <= b_hi)
#                 bands.append({
#                     "label":             f"{sym}{b_lo:.0f}–{sym}{b_hi:.0f}",
#                     "count":             cnt,
#                     "your_price_in_band": bool(
#                         current_price is not None and b_lo <= current_price <= b_hi
#                     ),
#                     "density": (
#                         "High"   if cnt > len(prices) * 0.30 else
#                         "Medium" if cnt > len(prices) * 0.12 else
#                         "Low"
#                     ),
#                 })
#             result["price_bands"] = bands

#             # Top 5 competitors for display
#             result["top_competitors"] = [
#                 {
#                     "asin":             row.asin,
#                     "title":            _truncate(row.product_title, 60),
#                     "price":            row.product_price_numeric,
#                     "rating":           row.product_star_rating_numeric,
#                     "photo":            row.product_photo,
#                     "sales_volume":     row.sales_volume,
#                     "is_prime":         bool(row.is_prime),
#                     "similarity_score": score,
#                     "price_diff_pct": (
#                         round(
#                             (row.product_price_numeric - current_price)
#                             / current_price * 100,
#                             1,
#                         )
#                         if current_price and row.product_price_numeric
#                         else None
#                     ),
#                 }
#                 for row, score in scored_competitors[:5]
#             ]
#         else:
#             result["data_quality"] = "insufficient"

#     # ── Premium tier enrichment ───────────────────────────────────────────
#     if is_premium:
#         market_avg = result.get("market_avg")

#         # AI Pricing Tip
#         if current_price and market_avg:
#             diff_pct       = (current_price - market_avg) / market_avg * 100
#             comp_summary   = ""
#             top_comps      = result.get("top_competitors") or []
#             if top_comps:
#                 parts = [
#                     f"{sym}{c['price']:.2f} ({_truncate(c['title'], 25)})"
#                     for c in top_comps[:3]
#                     if c.get("price")
#                 ]
#                 if parts:
#                     comp_summary = ". Top competitors: " + ", ".join(parts)

#             ai_prompt = (
#                 f"You are a concise Amazon seller pricing advisor. "
#                 f"Product: \"{_truncate(tracked.product_title, 80)}\". "
#                 f"Current price: {sym}{current_price:.2f}. "
#                 f"Market average ({result.get('competitor_count', 0)} products): {sym}{market_avg:.2f}. "
#                 f"Market min: {sym}{result.get('market_min', 0):.2f}, "
#                 f"max: {sym}{result.get('market_max', 0):.2f}. "
#                 f"Position: {result.get('price_position', 'unknown')} "
#                 f"({diff_pct:+.1f}% vs avg){comp_summary}. "
#                 f"Prime: {tracked.is_prime}. Best Seller: {tracked.is_best_seller}. "
#                 f"Sales: {tracked.sales_volume or 'unknown'}. "
#                 f"In 2-3 sentences, give a specific actionable pricing recommendation. "
#                 f"Use exact numbers with {sym} symbol. Be direct."
#             )
#             ai_text = _ollama(ai_prompt, max_tokens=160)
#             result["ai_pricing_tip"] = ai_text or (
#                 f"Your price is {diff_pct:+.1f}% vs the market average of "
#                 f"{sym}{market_avg:.2f}. Review the top competitor listings "
#                 "and adjust based on your conversion rate."
#             )
#         else:
#             result["ai_pricing_tip"] = (
#                 "Insufficient comparable product data for a pricing recommendation. "
#                 "This may be a niche product with few tracked competitors."
#             )

#         # AI Velocity Insight
#         if current_price and result.get("price_percentile") is not None:
#             sales_num  = _parse_sales_volume(tracked.sales_volume)
#             v_prompt   = (
#                 f"Amazon product \"{_truncate(tracked.product_title, 60)}\". "
#                 f"Price: {sym}{current_price:.2f}. "
#                 f"Percentile: {result['price_percentile']}% (lower = cheaper). "
#                 f"Offers: {tracked.product_num_offers or 'unknown'}. "
#                 f"Sales: {tracked.sales_volume or 'unknown'}"
#                 + (f" (~{sales_num:,}/month)" if sales_num else "")
#                 + f". Position: {result.get('price_position', 'unknown')}. "
#                 f"In 1 sentence give a smart insight about competitive positioning."
#             )
#             v_text = _ollama(v_prompt, max_tokens=80)
#             if v_text:
#                 result["ai_velocity_insight"] = v_text

#         # Seller's other products
#         other_products = (
#             db.query(TrackedProduct)
#             .filter(
#                 TrackedProduct.seller_id == seller_id,
#                 TrackedProduct.asin      != asin,
#             )
#             .limit(5)
#             .all()
#         )
#         result["seller_other_products"] = [
#             {
#                 "asin":         p.asin,
#                 "title":        _truncate(p.product_title, 55),
#                 "price":        _clean_price(p.product_price),
#                 "rating":       p.product_star_rating_numeric,
#                 "photo":        p.product_photo,
#                 "sales_volume": p.sales_volume,
#             }
#             for p in other_products
#         ]

#     return result


# # ─────────────────────────────────────────────────────────────────────────────
# # REVIEW COMPARISON  (/comparison/reviews)
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/reviews")
# def get_review_comparison(
#     asin:       str           = Query(..., description="Amazon ASIN"),
#     seller_id:  str           = Query(..., description="Seller ID"),
#     user_email: Optional[str] = Query(None, description="User email for tier lookup"),
#     db:         Session       = Depends(get_db),
# ) -> dict:
#     """
#     Returns tiered review / sentiment comparison data for a tracked product.

#     free    → star_rating, total_ratings, rating_distribution
#     basic   → + recent_reviews (5), response_rate
#     premium → + sentiment_breakdown, review_health_score, competitor_reviews,
#                 ai_response_suggestion, review_velocity_insight,
#                 avg_seller_portfolio_rating
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     # ── Fetch tracked product ─────────────────────────────────────────────
#     tracked = (
#         db.query(TrackedProduct)
#         .filter(
#             TrackedProduct.asin      == asin,
#             TrackedProduct.seller_id == seller_id,
#         )
#         .first()
#     )
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     # Parse JSON review arrays safely
#     comments     = _parse_json_field(tracked.review_comments)
#     ratings_raw  = _parse_json_field(tracked.review_ratings)
#     authors      = _parse_json_field(tracked.review_authors)
#     dates        = _parse_json_field(tracked.review_dates)
#     has_response = _parse_json_field(tracked.review_has_response)
#     currency     = (tracked.currency or "USD").upper().strip()

#     # Rating distribution (always computed for free tier)
#     rating_dist: dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
#     for r in ratings_raw:
#         k = _safe_int(r, 0)
#         if 1 <= k <= 5:
#             rating_dist[k] += 1

#     result: dict[str, Any] = {
#         # Meta
#         "tier": tier,
#         "asin": asin,
#         # Product
#         "product_title":       tracked.product_title,
#         "product_photo":       tracked.product_photo,
#         "is_prime":            bool(tracked.is_prime),
#         "is_best_seller":      bool(tracked.is_best_seller),
#         # Free tier review data
#         "star_rating":         tracked.product_star_rating_numeric,
#         "total_ratings":       tracked.product_num_ratings or 0,
#         "rating_distribution": rating_dist,
#         "seller_rating":       tracked.seller_rating,
#         "seller_ratings_total":tracked.seller_ratings_total,
#         # Basic+
#         "recent_reviews":       None,
#         "response_rate_pct":    None,
#         "response_rate_label":  None,
#         # Premium
#         "sentiment_breakdown":          None,
#         "review_health_score":          None,
#         "competitor_reviews":           None,
#         "ai_response_suggestion":       None,
#         "review_velocity_insight":      None,
#         "avg_seller_portfolio_rating":  None,
#         "seller_product_count":         None,
#     }

#     # ── Basic tier enrichment ─────────────────────────────────────────────
#     if is_basic:
#         recent: list[dict] = []
#         for i in range(min(len(comments), 5)):
#             recent.append({
#                 "comment":      comments[i] if i < len(comments) else "",
#                 "rating":       _safe_int(ratings_raw[i], None) if i < len(ratings_raw) else None,
#                 "author":       authors[i] if i < len(authors) else "Anonymous",
#                 "date":         dates[i]   if i < len(dates)   else "",
#                 "has_response": bool(has_response[i]) if i < len(has_response) else False,
#             })
#         result["recent_reviews"] = recent

#         if has_response:
#             responded = sum(
#                 1 for r in has_response
#                 if r is True or (isinstance(r, str) and r.lower() == "true")
#             )
#             total_hr = len(has_response)
#             result["response_rate_pct"]   = round(responded / total_hr * 100, 1)
#             result["response_rate_label"] = f"{responded}/{total_hr}"

#     # ── Premium tier enrichment ───────────────────────────────────────────
#     if is_premium:
#         # Sentiment breakdown
#         ratings_int = [_safe_int(r, 0) for r in ratings_raw]
#         valid_ratings = [r for r in ratings_int if 1 <= r <= 5]
#         tot = max(len(valid_ratings), 1)

#         pos = sum(1 for r in valid_ratings if r >= 4)
#         neu = sum(1 for r in valid_ratings if r == 3)
#         neg = sum(1 for r in valid_ratings if r <= 2)

#         pos_pct = round(pos / tot * 100)
#         neu_pct = round(neu / tot * 100)
#         neg_pct = round(neg / tot * 100)

#         result["sentiment_breakdown"] = {
#             "positive": pos_pct,
#             "neutral":  neu_pct,
#             "negative": neg_pct,
#         }

#         # Review Health Score [0–100]
#         # Weights: star_rating 40 %, response_rate 20 %, % positive 30 %, log10(ratings) 10 %
#         star_val    = tracked.product_star_rating_numeric or 0.0
#         rr_pct      = result.get("response_rate_pct") or 0.0
#         total_r     = tracked.product_num_ratings or 0
#         log_score   = min(math.log10(total_r + 1) / 6.0 * 100.0, 100.0) if total_r > 0 else 0.0

#         health = (
#             (star_val / 5.0 * 100.0) * 0.40
#             + rr_pct                 * 0.20
#             + pos_pct                * 0.30
#             + log_score              * 0.10
#         )
#         result["review_health_score"] = round(min(health, 100.0), 1)

#         # Smart competitor discovery (same logic as price comparison)
#         current_price     = _clean_price(tracked.product_price)
#         scored_comps      = _find_best_competitors(
#             db, tracked, current_price or 0.0, currency, limit=10
#         )
#         # Keep only competitors that have a star rating
#         rated_comps = [
#             (row, score)
#             for row, score in scored_comps
#             if row.product_star_rating_numeric is not None
#         ]

#         # Hard fallback: grab top-rated rapidapi rows (any category)
#         if not rated_comps:
#             fallback_rows = (
#                 db.query(RapidapiAmazonProducts)
#                 .filter(RapidapiAmazonProducts.product_star_rating_numeric.isnot(None))
#                 .order_by(RapidapiAmazonProducts.product_num_ratings.desc())
#                 .limit(5)
#                 .all()
#             )
#             rated_comps = [(row, 0.0) for row in fallback_rows]

#         result["competitor_reviews"] = [
#             {
#                 "title":            _truncate(row.product_title, 55),
#                 "asin":             row.asin,
#                 "rating":           row.product_star_rating_numeric,
#                 "num_ratings":      row.product_num_ratings,
#                 "is_prime":         bool(row.is_prime),
#                 "photo":            row.product_photo,
#                 "sales_volume":     row.sales_volume,
#                 "similarity_score": sim,
#                 "rating_delta": (
#                     round(
#                         row.product_star_rating_numeric
#                         - (tracked.product_star_rating_numeric or 0.0),
#                         2,
#                     )
#                     if row.product_star_rating_numeric and tracked.product_star_rating_numeric
#                     else None
#                 ),
#             }
#             for row, sim in rated_comps[:5]
#         ]

#         # AI Response Suggestion
#         # Prefer a negative review; fall back to most recent positive
#         neg_review: Optional[str] = None
#         for i, r in enumerate(ratings_raw):
#             if _safe_int(r, 5) <= 2 and i < len(comments):
#                 neg_review = comments[i]
#                 break

#         if neg_review:
#             r_prompt = (
#                 f"You are an Amazon seller support specialist. "
#                 f"Product: \"{_truncate(tracked.product_title, 80)}\". "
#                 f"Negative review: \"{neg_review[:300]}\". "
#                 f"Write a professional, empathetic 3-4 sentence seller response. "
#                 f"Acknowledge the specific issue, apologize sincerely, offer a concrete resolution, "
#                 f"and invite them to contact you. Do NOT use 'we value your feedback'. "
#                 f"Reference details from the review."
#             )
#             ai_resp = _ollama(r_prompt, max_tokens=180)
#             result["ai_response_suggestion"] = ai_resp or (
#                 "Thank you for your feedback — we sincerely apologize for your experience. "
#                 "Our team is investigating this immediately. "
#                 "Please contact us directly so we can make this right for you."
#             )
#         else:
#             # No negative reviews — draft a thank-you for the best positive one
#             best_review: Optional[str] = None
#             for i, r in enumerate(ratings_raw):
#                 if _safe_int(r, 0) >= 4 and i < len(comments):
#                     best_review = comments[i]
#                     break
#             if best_review:
#                 t_prompt = (
#                     f"Amazon product \"{_truncate(tracked.product_title, 80)}\". "
#                     f"Positive review: \"{best_review[:200]}\". "
#                     f"Write a brief genuine 2-sentence thank-you seller response "
#                     f"that encourages the buyer to return. Do not be sycophantic."
#                 )
#                 ai_resp = _ollama(t_prompt, max_tokens=100)
#                 result["ai_response_suggestion"] = ai_resp or None

#         # Review Velocity Insight
#         comp_ratings_list = [
#             c["rating"] for c in (result["competitor_reviews"] or [])
#             if c.get("rating") is not None
#         ]
#         comp_avg_rating = (
#             round(sum(comp_ratings_list) / len(comp_ratings_list), 2)
#             if comp_ratings_list else None
#         )

#         health_score = result.get("review_health_score") or 0.0
#         vi_prompt = (
#             f"Amazon product \"{_truncate(tracked.product_title, 60)}\". "
#             f"Star rating: {star_val}/5. Total ratings: {total_r:,}. "
#             f"Seller response rate: {rr_pct:.0f}%. "
#             f"Sentiment: {pos_pct}% positive, {neg_pct}% negative. "
#             + (f"Competitor avg rating: {comp_avg_rating}/5. " if comp_avg_rating else "")
#             + f"Review health score: {health_score}/100. "
#             f"In 2 sentences give a specific review health insight and one concrete improvement action."
#         )
#         vi_text = _ollama(vi_prompt, max_tokens=120)

#         qual_word = "strong" if star_val >= 4.2 else "moderate"
#         rr_advice = (
#             "Your response rate is strong — keep engaging with buyers!"
#             if rr_pct > 50
#             else "Responding to more reviews can significantly boost your seller trust score."
#         )
#         result["review_velocity_insight"] = vi_text or (
#             f"Your {star_val}/5 rating across {total_r:,} reviews reflects "
#             f"{qual_word} buyer satisfaction. {rr_advice}"
#         )

#         # Seller portfolio stats
#         all_seller_products = (
#             db.query(TrackedProduct)
#             .filter(TrackedProduct.seller_id == seller_id)
#             .all()
#         )
#         valid_portfolio_ratings = [
#             p.product_star_rating_numeric
#             for p in all_seller_products
#             if p.product_star_rating_numeric is not None
#         ]
#         if valid_portfolio_ratings:
#             result["avg_seller_portfolio_rating"] = round(
#                 sum(valid_portfolio_ratings) / len(valid_portfolio_ratings), 2
#             )
#         result["seller_product_count"] = len(all_seller_products)

#     return result




"""
comparison_router.py  –  Production-grade Price, Review & Competitor Analysis API
----------------------------------------------------------------------------------
Tier matrix
  free    : basic product stats (price, rating, distribution)
             + competitor identity teaser + Buy Box risk badge
  basic   : + market benchmarks, price bands, recent reviews, response rate
             + threat score per competitor, #1 threat card, Buy Box detail
  premium : + AI tips (Ollama), velocity insights, sentiment, smart competitor table
             + change feed, seller health card, market gap finder,
               AI weekly summary, portfolio threat rank

Key design decisions
  • Competitor discovery uses TrackedProduct siblings first (same seller/currency)
    then RapidapiAmazonProducts, with currency-aware filtering at every layer.
  • All Ollama calls are fire-and-forget with a hardcoded fallback string so a
    slow/offline model never breaks the endpoint.
  • Every numeric operation is guarded; no endpoint can 500 on bad DB data.
  • _TrackedProxy is defined at module level (not inside a function) to avoid
    pickling issues if the router is ever used with multiprocessing workers.
  • math is imported at the top, not inside a conditional block.
  • Threat score formula (Basic+):
      price_delta 30% + rating_delta 25% + rating_count_ratio 25% + platform_flags 20%
  • Buy Box intelligence uses product_minimum_offer_price vs product_price —
    the highest-anxiety signal for Amazon sellers, currently unused in other endpoints.
  • Market gap finder: price bands with high avg_sales_volume but low competitor density.
  • Change feed: compares avg_price vs product_price_numeric to surface price movement.
"""

from __future__ import annotations

import json
import logging
import math
import re
from difflib import SequenceMatcher
from typing import Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.legacy_models import (
    RapidapiAmazonProducts,
    TrackedProduct,
    User,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/comparison", tags=["Comparison"])

# ── Ollama config ─────────────────────────────────────────────────────────────
OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:3b"
OLLAMA_TIMEOUT = 30.0  # seconds – avoids blocking the request indefinitely

# ── Currency thresholds for cross-currency sanity checks ─────────────────────
# If a USD product has a numeric price above this it is almost certainly INR.
_USD_PRICE_CEILING = 500.0
# If an INR product has a numeric price below this it is almost certainly USD.
_INR_PRICE_FLOOR   = 10.0


# ─────────────────────────────────────────────────────────────────────────────
# MODULE-LEVEL PROXY  (must NOT be defined inside a function)
# ─────────────────────────────────────────────────────────────────────────────

class _TrackedProxy:
    """
    Wraps a TrackedProduct row so it can be used wherever a
    RapidapiAmazonProducts row is expected (duck-typing).
    Defined at module level to avoid closure/pickling issues.
    """
    __slots__ = (
        "asin", "product_title", "product_photo",
        "product_price", "product_price_numeric",
        "product_original_price", "product_original_price_numeric",
        "product_star_rating", "product_star_rating_numeric",
        "product_num_ratings", "is_best_seller", "is_amazon_choice",
        "is_prime", "sales_volume", "country", "category_name",
        "created_at", "updated_at", "avg_price",
    )

    def __init__(self, t: TrackedProduct) -> None:
        self.asin                           = t.asin
        self.product_title                  = t.product_title
        self.product_photo                  = t.product_photo
        self.product_price                  = t.product_price
        self.product_price_numeric          = _clean_price(t.product_price)
        self.product_original_price         = t.product_original_price
        self.product_original_price_numeric = _clean_price(t.product_original_price)
        self.product_star_rating            = t.product_star_rating
        self.product_star_rating_numeric    = t.product_star_rating_numeric
        self.product_num_ratings            = t.product_num_ratings
        self.is_best_seller                 = t.is_best_seller
        self.is_amazon_choice               = getattr(t, "is_amazon_choice", None)
        self.is_prime                       = t.is_prime
        self.sales_volume                   = t.sales_volume
        self.country                        = t.country
        self.category_name                  = None  # TrackedProduct has no category
        self.created_at                     = getattr(t, "created_at", None)
        self.updated_at                     = getattr(t, "updated_at", None)
        self.avg_price                      = None  # not available on TrackedProduct


# ─────────────────────────────────────────────────────────────────────────────
# PURE HELPERS  (no DB access, no side effects)
# ─────────────────────────────────────────────────────────────────────────────

def _parse_json_field(field: Any) -> list:
    """Safely deserialise a JSON-encoded list field from the DB."""
    if field is None:
        return []
    if isinstance(field, list):
        return field
    try:
        result = json.loads(field)
        return result if isinstance(result, list) else []
    except Exception:
        return []


def _clean_price(p: Any) -> Optional[float]:
    """Strip currency symbols / commas and return a float, or None on failure."""
    if p is None or str(p).strip() == "":
        return None
    try:
        cleaned = (
            str(p)
            .replace("$", "").replace("₹", "").replace("£", "")
            .replace("€", "").replace(",", "").strip()
        )
        value = float(cleaned)
        return value if value > 0 else None
    except (ValueError, TypeError):
        return None


def _safe_int(val: Any, default: Any = 0) -> Any:
    """Convert val to int, returning default on any failure."""
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def _currency_sym(currency: str) -> str:
    """Return the display symbol for a currency code."""
    return {"INR": "₹", "GBP": "£", "EUR": "€"}.get(currency, "$")


def _extract_keywords(title: str) -> list[str]:
    """
    Tokenise a product title into meaningful keywords for fuzzy matching.
    Keeps alphanumeric tokens ≥ 3 chars, removes English stop-words.
    """
    if not title:
        return []
    _STOP = {
        "the", "a", "an", "and", "or", "for", "with", "in", "of",
        "to", "by", "from", "on", "at", "is", "are", "pack", "set",
        "new", "buy", "get", "use", "this",
    }
    tokens = re.findall(r"[a-zA-Z0-9]+", title.lower())
    return [t for t in tokens if len(t) >= 3 and t not in _STOP]


def _title_similarity(t1: str, t2: str) -> float:
    """
    Composite similarity score [0, 1] combining Jaccard keyword overlap (60 %)
    and SequenceMatcher on the first 80 chars (40 %).
    """
    if not t1 or not t2:
        return 0.0
    k1 = set(_extract_keywords(t1))
    k2 = set(_extract_keywords(t2))
    if not k1 or not k2:
        return 0.0
    union = k1 | k2
    jaccard = len(k1 & k2) / len(union) if union else 0.0
    seq     = SequenceMatcher(None, t1.lower()[:80], t2.lower()[:80]).ratio()
    return round(jaccard * 0.6 + seq * 0.4, 4)


def _parse_sales_volume(s: Optional[str]) -> Optional[int]:
    """
    Convert human-readable sales strings to approximate integers.
    '9K+ bought in past month' → 9000
    '1K+'                      → 1000
    '100+'                     → 100
    """
    if not s:
        return None
    lower = s.lower()
    m = re.search(r"([\d.]+)\s*k", lower)
    if m:
        return int(float(m.group(1)) * 1_000)
    m = re.search(r"([\d,]+)", lower)
    if m:
        try:
            return int(m.group(1).replace(",", ""))
        except ValueError:
            return None
    return None


def _is_price_currency_sane(price: float, currency: str) -> bool:
    """
    Heuristic guard: return False if the numeric price looks like it belongs
    to a different currency (e.g. ₹1,629 stored as 1629 appearing in a USD feed).
    """
    if currency == "USD" and price > _USD_PRICE_CEILING:
        return False
    if currency == "INR" and price < _INR_PRICE_FLOOR:
        return False
    return True


def _truncate(s: Optional[str], n: int) -> str:
    """Return s truncated to n chars with an ellipsis if needed."""
    if not s:
        return ""
    return s[:n] + ("…" if len(s) > n else "")


# ─────────────────────────────────────────────────────────────────────────────
# DB HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _get_user_tier(db: Session, user_email: str) -> str:
    """Look up subscription tier; default to 'free' on any failure."""
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if user and user.subscription_tier:
            return user.subscription_tier.lower().strip()
    except Exception as exc:
        logger.warning("_get_user_tier failed for %s: %s", user_email, exc)
    return "free"


def _find_best_competitors(
    db: Session,
    tracked: TrackedProduct,
    current_price: float,
    currency: str,
    limit: int = 50,
) -> list[tuple[Any, float]]:
    """
    Multi-strategy competitor discovery, ordered from most to least accurate:

    1. RapidapiAmazonProducts rows in the same currency + ±60 % price window
    2. RapidapiAmazonProducts rows in the same currency (no price filter)
    3. Other TrackedProduct rows with the same currency (proxy competitors –
       most useful when rapidapi table has no matching-currency data)
    4. All RapidapiAmazonProducts rows (last resort, currency-filtered later)

    Every candidate is scored with _title_similarity + category bonus – price
    penalty.  Only rows with score > 0.05 are returned, sorted descending.
    """
    if not current_price or current_price <= 0:
        return []

    price_lo = current_price * 0.40
    price_hi = current_price * 1.60
    currency_prefix = "₹" if currency == "INR" else "$"

    # ── Strategy 1: same currency + price range ───────────────────────────
    base_q = (
        db.query(RapidapiAmazonProducts)
        .filter(RapidapiAmazonProducts.product_price_numeric.isnot(None))
    )
    if currency == "INR":
        base_q = base_q.filter(
            RapidapiAmazonProducts.product_price.like("₹%"),
            RapidapiAmazonProducts.product_price_numeric >= price_lo,
            RapidapiAmazonProducts.product_price_numeric <= price_hi,
        )
    elif currency == "USD":
        base_q = base_q.filter(
            or_(
                RapidapiAmazonProducts.product_price.like("$%"),
                RapidapiAmazonProducts.country == "US",
            ),
            RapidapiAmazonProducts.product_price_numeric >= price_lo,
            RapidapiAmazonProducts.product_price_numeric <= price_hi,
        )
    else:
        base_q = base_q.filter(
            RapidapiAmazonProducts.country == (tracked.country or "US"),
            RapidapiAmazonProducts.product_price_numeric >= price_lo,
            RapidapiAmazonProducts.product_price_numeric <= price_hi,
        )

    candidates: list[Any] = base_q.limit(300).all()

    # ── Strategy 2: same currency prefix, relax price range ──────────────
    if len(candidates) < 5:
        candidates = (
            db.query(RapidapiAmazonProducts)
            .filter(
                RapidapiAmazonProducts.product_price_numeric.isnot(None),
                RapidapiAmazonProducts.product_price.like(f"{currency_prefix}%"),
            )
            .limit(300)
            .all()
        )

    # ── Strategy 3: sibling TrackedProduct rows (same currency) ──────────
    if len(candidates) < 5:
        siblings = (
            db.query(TrackedProduct)
            .filter(
                TrackedProduct.asin != tracked.asin,
                TrackedProduct.currency == currency,
                TrackedProduct.product_price.isnot(None),
            )
            .limit(300)
            .all()
        )
        proxies = [
            _TrackedProxy(t)
            for t in siblings
            if _clean_price(t.product_price) is not None
        ]
        if proxies:
            candidates = proxies  # type: ignore[assignment]

    # ── Strategy 4: all rapidapi rows (last resort) ───────────────────────
    if len(candidates) < 5:
        candidates = (
            db.query(RapidapiAmazonProducts)
            .filter(RapidapiAmazonProducts.product_price_numeric.isnot(None))
            .limit(200)
            .all()
        )

    # ── Score every candidate ─────────────────────────────────────────────
    scored: list[tuple[Any, float]] = []
    for row in candidates:
        if row.asin == tracked.asin:
            continue
        if row.product_price_numeric is None:
            continue

        sim = _title_similarity(tracked.product_title or "", row.product_title or "")

        # Category keyword bonus
        cat_bonus = 0.0
        if row.category_name:
            cat_kw   = set(_extract_keywords(row.category_name))
            prod_kw  = set(_extract_keywords(tracked.product_title or ""))
            cat_bonus = min(len(prod_kw & cat_kw) * 0.03, 0.15)

        # Relative price penalty (softer: max −0.10)
        price_penalty = 0.0
        if current_price and row.product_price_numeric:
            ratio         = abs(row.product_price_numeric - current_price) / current_price
            price_penalty = min(ratio * 0.10, 0.10)

        score = sim + cat_bonus - price_penalty
        if score > 0.05:
            scored.append((row, round(score, 4)))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:limit]


def _normalize_prices(
    competitors: list[tuple[Any, float]],
    currency: str,
) -> list[float]:
    """
    Return clean numeric prices from competitor rows, dropping any row whose
    price looks like it belongs to a different currency.
    """
    prices: list[float] = []
    for row, _ in competitors:
        p = row.product_price_numeric
        if p is None or p <= 0:
            continue
        if not _is_price_currency_sane(p, currency):
            continue
        prices.append(float(p))
    return prices


# ─────────────────────────────────────────────────────────────────────────────
# OLLAMA WRAPPER
# ─────────────────────────────────────────────────────────────────────────────

def _ollama(prompt: str, max_tokens: int = 200) -> str:
    """
    Call Ollama and return the response string.
    Returns "" on any error so callers can fall back gracefully.
    Never raises.
    """
    try:
        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            resp = client.post(
                OLLAMA_URL,
                json={
                    "model":   OLLAMA_MODEL,
                    "prompt":  prompt,
                    "stream":  False,
                    "options": {"num_predict": max_tokens, "temperature": 0.4},
                },
            )
            resp.raise_for_status()
            text = resp.json().get("response", "").strip()
            return text
    except Exception as exc:
        logger.debug("Ollama call failed: %s", exc)
        return ""


# ─────────────────────────────────────────────────────────────────────────────
# COMPETITOR ANALYSIS HELPERS  (used only by /comparison/competitors)
# ─────────────────────────────────────────────────────────────────────────────

def _compute_threat_score(
    comp_price:         Optional[float],
    comp_rating:        Optional[float],
    comp_num_ratings:   Optional[int],
    comp_is_prime:      bool,
    comp_is_best_seller: bool,
    my_price:           Optional[float],
    my_rating:          Optional[float],
    my_num_ratings:     Optional[int],
) -> tuple[float, str]:
    """
    Weighted threat score [0–10] with a human-readable reason string.

    Weights
    -------
    price delta vs yours        30 %  → max 3 pts
    rating score                25 %  → max 2.5 pts
    rating count ratio          25 %  → max 2.5 pts
    platform flags (Prime/BS)   20 %  → max 2 pts
    """
    reasons: list[str] = []
    score = 0.0

    # ── Price component (30 %) ────────────────────────────────────────────
    if comp_price is not None and my_price is not None and my_price > 0:
        price_diff_pct = (my_price - comp_price) / my_price   # +ve = they are cheaper
        price_score    = min(max(price_diff_pct * 2, 0.0), 1.0)
        score += price_score * 3.0
        if price_diff_pct > 0.05:
            reasons.append(f"priced {price_diff_pct * 100:.0f}% lower than you")
        elif price_diff_pct < -0.05:
            reasons.append(f"priced {abs(price_diff_pct) * 100:.0f}% higher than you")

    # ── Rating score component (25 %) ─────────────────────────────────────
    cmp_r = comp_rating or 0.0
    my_r  = my_rating   or 0.0
    if cmp_r > 0:
        rating_score = min((cmp_r - 3.0) / 2.0, 1.0)   # 3★→0, 5★→1
        score += rating_score * 2.5
        if cmp_r > my_r + 0.2:
            reasons.append(f"higher rated ({cmp_r}★ vs your {my_r}★)")
        elif cmp_r >= 4.5:
            reasons.append(f"strong {cmp_r}★ rating")

    # ── Rating count ratio (25 %) ─────────────────────────────────────────
    my_cnt  = max(my_num_ratings  or 1, 1)
    cmp_cnt = comp_num_ratings    or 0
    if cmp_cnt > 0:
        ratio       = cmp_cnt / my_cnt
        count_score = min(math.log10(ratio + 1) / math.log10(11), 1.0)   # 10× → 1.0
        score += count_score * 2.5
        if ratio > 2:
            reasons.append(f"{ratio:.0f}× your review count")
        elif ratio > 1:
            reasons.append(f"more reviews ({cmp_cnt:,} vs your {my_cnt:,})")

    # ── Platform flags (20 %) ─────────────────────────────────────────────
    flag_score = 0.0
    flag_parts: list[str] = []
    if comp_is_prime:
        flag_score += 0.5
        flag_parts.append("Prime badge")
    if comp_is_best_seller:
        flag_score += 0.5
        flag_parts.append("Best Seller")
    score += flag_score * 2.0
    if flag_parts:
        reasons.append(", ".join(flag_parts))

    final   = round(min(max(score, 0.0), 10.0), 1)
    reason  = " · ".join(reasons[:3]) if reasons else "Similar positioning to you"
    return final, reason


def _compute_buy_box(tracked: TrackedProduct) -> dict:
    """
    Derive Buy Box risk from product_minimum_offer_price vs product_price
    and product_num_offers.  No external calls; pure DB columns.
    """
    current_price   = _clean_price(tracked.product_price)
    min_offer_price = _clean_price(tracked.product_minimum_offer_price)
    num_offers      = tracked.product_num_offers or 1

    undercut_amount:     Optional[float] = None
    sellers_undercutting: int            = 0

    if current_price and min_offer_price and min_offer_price < current_price:
        undercut_amount      = round(current_price - min_offer_price, 2)
        sellers_undercutting = max(num_offers - 1, 1)

    if undercut_amount and undercut_amount > 0:
        risk_level = "At Risk"
    elif num_offers > 1:
        risk_level = "Watch"
    else:
        risk_level = "Safe"

    return {
        "buy_box_risk_level":   risk_level,
        "num_offers":           num_offers,
        "current_price":        current_price,
        "min_offer_price":      min_offer_price,
        "undercut_amount":      undercut_amount,
        "sellers_undercutting": sellers_undercutting,
    }


def _build_change_feed(
    competitors: list[tuple[Any, float]],
    currency: str,
) -> list[dict]:
    """
    Detect price movement and badge changes by comparing avg_price vs
    product_price_numeric (available in rapidapi_amazon_products).
    Returns a de-duplicated, newest-first timeline of up to 10 events.
    """
    sym  = _currency_sym(currency)
    feed: list[dict] = []

    for row, _ in competitors:
        created = getattr(row, "created_at", None)
        updated = getattr(row, "updated_at", None)
        if not created or not updated or created == updated:
            continue

        # Price movement via avg_price snapshot
        avg_price  = getattr(row, "avg_price", None)
        curr_price = row.product_price_numeric
        if avg_price and curr_price and abs(avg_price - curr_price) > 0.5:
            delta = curr_price - avg_price
            feed.append({
                "type":        "price_drop" if delta < 0 else "price_increase",
                "asin":        row.asin,
                "description": (
                    f"{'▼' if delta < 0 else '▲'} {_truncate(row.product_title, 35)}"
                    f" changed price by {sym}{abs(delta):.2f}"
                ),
                "date": (
                    updated.strftime("%b %d")
                    if hasattr(updated, "strftime") else str(updated)[:10]
                ),
            })

        # Best Seller badge currently held (no historical diff table yet)
        if row.is_best_seller:
            feed.append({
                "type":        "badge_gained",
                "asin":        row.asin,
                "description": f"🏆 {_truncate(row.product_title, 40)} holds Best Seller badge",
                "date": (
                    updated.strftime("%b %d")
                    if hasattr(updated, "strftime") else str(updated)[:10]
                ),
            })

    # De-duplicate by asin+type and cap at 10
    seen: set[str] = set()
    deduped: list[dict] = []
    for item in feed:
        key = f"{item['asin']}-{item['type']}"
        if key not in seen:
            seen.add(key)
            deduped.append(item)

    return deduped[:10]


def _find_market_gaps(
    competitors: list[tuple[Any, float]],
    current_price: float,
    currency: str,
    num_bands: int = 5,
) -> list[dict]:
    """
    Identify price bands with relatively high demand (avg_sales_volume) but
    thin competition (≤2 rivals).  Returns up to 3 gaps sorted by opportunity.
    """
    prices = [
        r.product_price_numeric
        for r, _ in competitors
        if r.product_price_numeric
        and _is_price_currency_sane(r.product_price_numeric, currency)
    ]
    if len(prices) < 3:
        return []

    p_min = min(prices)
    p_max = max(prices)
    if p_max <= p_min:
        return []

    band_size = (p_max - p_min) / num_bands
    gaps: list[dict] = []

    for i in range(num_bands):
        b_lo    = p_min + i * band_size
        b_hi    = b_lo + band_size
        in_band = [
            (r, s) for r, s in competitors
            if r.product_price_numeric and b_lo <= r.product_price_numeric <= b_hi
        ]

        # Gather avg volume from ALL competitors as demand proxy
        all_vols = [
            _parse_sales_volume(r.sales_volume)
            for r, _ in competitors
            if r.sales_volume
        ]
        all_vols_clean = [v for v in all_vols if v]
        avg_vol = int(sum(all_vols_clean) / len(all_vols_clean)) if all_vols_clean else 0

        if len(in_band) == 0 and avg_vol > 500:
            gaps.append({
                "price_lo":        round(b_lo),
                "price_hi":        round(b_hi),
                "competitor_count": 0,
                "demand_label":    "High" if avg_vol > 5_000 else "Medium",
                "opportunity_score": avg_vol / 1_000,
            })
        elif len(in_band) <= 2 and avg_vol > 200:
            gaps.append({
                "price_lo":        round(b_lo),
                "price_hi":        round(b_hi),
                "competitor_count": len(in_band),
                "demand_label":    "High" if avg_vol > 5_000 else "Medium",
                "opportunity_score": avg_vol / max(len(in_band), 1),
            })

    gaps.sort(key=lambda x: x["opportunity_score"], reverse=True)
    return gaps[:3]


# ─────────────────────────────────────────────────────────────────────────────
# PRICE COMPARISON  (/comparison/price)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/price")
def get_price_comparison(
    asin:       str           = Query(..., description="Amazon ASIN"),
    seller_id:  str           = Query(..., description="Seller ID"),
    db:         Session       = Depends(get_db),
    current_user: User        = Depends(get_current_user),
) -> dict:
    """
    Returns tiered price comparison data for a tracked product.
    """
    tier       = current_user.subscription_tier.lower().strip() if current_user.subscription_tier else "free"
    is_basic   = tier in ("basic", "premium")
    is_premium = tier == "premium"

    # ── Fetch tracked product ─────────────────────────────────────────────
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

    current_price  = _clean_price(tracked.product_price)
    original_price = _clean_price(tracked.product_original_price)
    currency       = (tracked.currency or "USD").upper().strip()
    sym            = _currency_sym(currency)

    # Discount % — only meaningful when both prices present and original > current
    discount_pct: Optional[float] = None
    if (
        current_price is not None
        and original_price is not None
        and original_price > current_price > 0
    ):
        discount_pct = round(
            (original_price - current_price) / original_price * 100, 1
        )

    result: dict[str, Any] = {
        # Meta
        "tier":          tier,
        "asin":          asin,
        "currency":      currency,
        "data_quality":  "live",
        # Product info
        "product_title": tracked.product_title,
        "product_photo": tracked.product_photo,
        "is_prime":      bool(tracked.is_prime),
        "is_best_seller":bool(tracked.is_best_seller),
        "sales_volume":  tracked.sales_volume,
        "num_offers":    tracked.product_num_offers,
        "delivery":      tracked.delivery,
        # Free tier prices
        "current_price":  current_price,
        "original_price": original_price,
        "discount_pct":   discount_pct,
        # Basic+ (pre-filled None so the schema is always consistent)
        "min_offer_price":  None,
        "market_avg":       None,
        "market_min":       None,
        "market_max":       None,
        "price_percentile": None,
        "price_position":   None,
        "competitor_count": None,
        "price_bands":      None,
        "top_competitors":  None,
        # Premium
        "ai_pricing_tip":       None,
        "ai_velocity_insight":  None,
        "seller_other_products": None,
    }

    # ── Basic tier enrichment ─────────────────────────────────────────────
    if is_basic:
        result["min_offer_price"] = _clean_price(tracked.product_minimum_offer_price)

        scored_competitors = _find_best_competitors(
            db, tracked, current_price or 0.0, currency
        )
        prices = _normalize_prices(scored_competitors, currency)

        if prices:
            avg_p = round(sum(prices) / len(prices), 2)
            p_min = round(min(prices), 2)
            p_max = round(max(prices), 2)

            result["market_avg"]       = avg_p
            result["market_min"]       = p_min
            result["market_max"]       = p_max
            result["competitor_count"] = len(prices)
            result["data_quality"]     = "live" if len(prices) >= 10 else "limited"

            if current_price:
                below = sum(1 for p in prices if p < current_price)
                result["price_percentile"] = round(below / len(prices) * 100, 1)

                diff_ratio = (current_price - avg_p) / avg_p if avg_p else 0.0
                if diff_ratio > 0.10:
                    result["price_position"] = "Above Market"
                elif diff_ratio < -0.10:
                    result["price_position"] = "Below Market"
                else:
                    result["price_position"] = "Competitive"

            # Price bands (5 equal-width buckets)
            span      = p_max - p_min
            band_size = (span / 5) if span > 0 else max(p_min * 0.10, 1.0)
            bands     = []
            for i in range(5):
                b_lo = p_min + i * band_size
                b_hi = b_lo + band_size
                cnt  = sum(1 for p in prices if b_lo <= p < b_hi)
                # Make sure the highest price falls into the last band
                if i == 4:
                    cnt = sum(1 for p in prices if b_lo <= p <= b_hi)
                bands.append({
                    "label":             f"{sym}{b_lo:.0f}–{sym}{b_hi:.0f}",
                    "count":             cnt,
                    "your_price_in_band": bool(
                        current_price is not None and b_lo <= current_price <= b_hi
                    ),
                    "density": (
                        "High"   if cnt > len(prices) * 0.30 else
                        "Medium" if cnt > len(prices) * 0.12 else
                        "Low"
                    ),
                })
            result["price_bands"] = bands

            # Top 5 competitors for display
            result["top_competitors"] = [
                {
                    "asin":             row.asin,
                    "title":            _truncate(row.product_title, 60),
                    "price":            row.product_price_numeric,
                    "rating":           row.product_star_rating_numeric,
                    "photo":            row.product_photo,
                    "sales_volume":     row.sales_volume,
                    "is_prime":         bool(row.is_prime),
                    "similarity_score": score,
                    "price_diff_pct": (
                        round(
                            (row.product_price_numeric - current_price)
                            / current_price * 100,
                            1,
                        )
                        if current_price and row.product_price_numeric
                        else None
                    ),
                }
                for row, score in scored_competitors[:5]
            ]
        else:
            result["data_quality"] = "insufficient"

    # ── Premium tier enrichment ───────────────────────────────────────────
    if is_premium:
        market_avg = result.get("market_avg")

        # AI Pricing Tip
        if current_price and market_avg:
            diff_pct       = (current_price - market_avg) / market_avg * 100
            comp_summary   = ""
            top_comps      = result.get("top_competitors") or []
            if top_comps:
                parts = [
                    f"{sym}{c['price']:.2f} ({_truncate(c['title'], 25)})"
                    for c in top_comps[:3]
                    if c.get("price")
                ]
                if parts:
                    comp_summary = ". Top competitors: " + ", ".join(parts)

            ai_prompt = (
                f"You are a concise Amazon seller pricing advisor. "
                f"Product: \"{_truncate(tracked.product_title, 80)}\". "
                f"Current price: {sym}{current_price:.2f}. "
                f"Market average ({result.get('competitor_count', 0)} products): {sym}{market_avg:.2f}. "
                f"Market min: {sym}{result.get('market_min', 0):.2f}, "
                f"max: {sym}{result.get('market_max', 0):.2f}. "
                f"Position: {result.get('price_position', 'unknown')} "
                f"({diff_pct:+.1f}% vs avg){comp_summary}. "
                f"Prime: {tracked.is_prime}. Best Seller: {tracked.is_best_seller}. "
                f"Sales: {tracked.sales_volume or 'unknown'}. "
                f"In 2-3 sentences, give a specific actionable pricing recommendation. "
                f"Use exact numbers with {sym} symbol. Be direct."
            )
            ai_text = _ollama(ai_prompt, max_tokens=160)
            result["ai_pricing_tip"] = ai_text or (
                f"Your price is {diff_pct:+.1f}% vs the market average of "
                f"{sym}{market_avg:.2f}. Review the top competitor listings "
                "and adjust based on your conversion rate."
            )
        else:
            result["ai_pricing_tip"] = (
                "Insufficient comparable product data for a pricing recommendation. "
                "This may be a niche product with few tracked competitors."
            )

        # AI Velocity Insight
        if current_price and result.get("price_percentile") is not None:
            sales_num  = _parse_sales_volume(tracked.sales_volume)
            v_prompt   = (
                f"Amazon product \"{_truncate(tracked.product_title, 60)}\". "
                f"Price: {sym}{current_price:.2f}. "
                f"Percentile: {result['price_percentile']}% (lower = cheaper). "
                f"Offers: {tracked.product_num_offers or 'unknown'}. "
                f"Sales: {tracked.sales_volume or 'unknown'}"
                + (f" (~{sales_num:,}/month)" if sales_num else "")
                + f". Position: {result.get('price_position', 'unknown')}. "
                f"In 1 sentence give a smart insight about competitive positioning."
            )
            v_text = _ollama(v_prompt, max_tokens=80)
            if v_text:
                result["ai_velocity_insight"] = v_text

        # Seller's other products
        other_products = (
            db.query(TrackedProduct)
            .filter(
                TrackedProduct.seller_id == seller_id,
                TrackedProduct.asin      != asin,
                TrackedProduct.user_email == current_user.email,
            )
            .limit(5)
            .all()
        )
        result["seller_other_products"] = [
            {
                "asin":         p.asin,
                "title":        _truncate(p.product_title, 55),
                "price":        _clean_price(p.product_price),
                "rating":       p.product_star_rating_numeric,
                "photo":        p.product_photo,
                "sales_volume": p.sales_volume,
            }
            for p in other_products
        ]

    return result


# ─────────────────────────────────────────────────────────────────────────────
# REVIEW COMPARISON  (/comparison/reviews)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/reviews")
def get_review_comparison(
    asin:       str           = Query(..., description="Amazon ASIN"),
    seller_id:  str           = Query(..., description="Seller ID"),
    db:         Session       = Depends(get_db),
    current_user: User        = Depends(get_current_user),
) -> dict:
    """
    Returns tiered review / sentiment comparison data for a tracked product.
    """
    tier       = current_user.subscription_tier.lower().strip() if current_user.subscription_tier else "free"
    is_basic   = tier in ("basic", "premium")
    is_premium = tier == "premium"

    # ── Fetch tracked product ─────────────────────────────────────────────
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

    # Parse JSON review arrays safely
    comments     = _parse_json_field(tracked.review_comments)
    ratings_raw  = _parse_json_field(tracked.review_ratings)
    authors      = _parse_json_field(tracked.review_authors)
    dates        = _parse_json_field(tracked.review_dates)
    has_response = _parse_json_field(tracked.review_has_response)
    currency     = (tracked.currency or "USD").upper().strip()

    # Rating distribution (always computed for free tier)
    rating_dist: dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in ratings_raw:
        k = _safe_int(r, 0)
        if 1 <= k <= 5:
            rating_dist[k] += 1

    result: dict[str, Any] = {
        # Meta
        "tier": tier,
        "asin": asin,
        # Product
        "product_title":       tracked.product_title,
        "product_photo":       tracked.product_photo,
        "is_prime":            bool(tracked.is_prime),
        "is_best_seller":      bool(tracked.is_best_seller),
        # Free tier review data
        "star_rating":         tracked.product_star_rating_numeric,
        "total_ratings":       tracked.product_num_ratings or 0,
        "rating_distribution": rating_dist,
        "seller_rating":       tracked.seller_rating,
        "seller_ratings_total":tracked.seller_ratings_total,
        # Basic+
        "recent_reviews":       None,
        "response_rate_pct":    None,
        "response_rate_label":  None,
        # Premium
        "sentiment_breakdown":          None,
        "review_health_score":          None,
        "competitor_reviews":           None,
        "ai_response_suggestion":       None,
        "review_velocity_insight":      None,
        "avg_seller_portfolio_rating":  None,
        "seller_product_count":         None,
    }

    # ── Basic tier enrichment ─────────────────────────────────────────────
    if is_basic:
        recent: list[dict] = []
        for i in range(min(len(comments), 5)):
            recent.append({
                "comment":      comments[i] if i < len(comments) else "",
                "rating":       _safe_int(ratings_raw[i], None) if i < len(ratings_raw) else None,
                "author":       authors[i] if i < len(authors) else "Anonymous",
                "date":         dates[i]   if i < len(dates)   else "",
                "has_response": bool(has_response[i]) if i < len(has_response) else False,
            })
        result["recent_reviews"] = recent

        if has_response:
            responded = sum(
                1 for r in has_response
                if r is True or (isinstance(r, str) and r.lower() == "true")
            )
            total_hr = len(has_response)
            result["response_rate_pct"]   = round(responded / total_hr * 100, 1)
            result["response_rate_label"] = f"{responded}/{total_hr}"

    # ── Premium tier enrichment ───────────────────────────────────────────
    if is_premium:
        # Sentiment breakdown
        ratings_int   = [_safe_int(r, 0) for r in ratings_raw]
        valid_ratings = [r for r in ratings_int if 1 <= r <= 5]
        tot = max(len(valid_ratings), 1)

        pos = sum(1 for r in valid_ratings if r >= 4)
        neu = sum(1 for r in valid_ratings if r == 3)
        neg = sum(1 for r in valid_ratings if r <= 2)

        pos_pct = round(pos / tot * 100)
        neu_pct = round(neu / tot * 100)
        neg_pct = round(neg / tot * 100)

        result["sentiment_breakdown"] = {
            "positive": pos_pct,
            "neutral":  neu_pct,
            "negative": neg_pct,
        }

        # Review Health Score [0–100]
        # Weights: star_rating 40 %, response_rate 20 %, % positive 30 %, log10(ratings) 10 %
        star_val  = tracked.product_star_rating_numeric or 0.0
        rr_pct    = result.get("response_rate_pct") or 0.0
        total_r   = tracked.product_num_ratings or 0
        log_score = min(math.log10(total_r + 1) / 6.0 * 100.0, 100.0) if total_r > 0 else 0.0

        health = (
            (star_val / 5.0 * 100.0) * 0.40
            + rr_pct                 * 0.20
            + pos_pct                * 0.30
            + log_score              * 0.10
        )
        result["review_health_score"] = round(min(health, 100.0), 1)

        # Smart competitor discovery (same logic as price comparison)
        current_price = _clean_price(tracked.product_price)
        scored_comps  = _find_best_competitors(
            db, tracked, current_price or 0.0, currency, limit=10
        )
        # Keep only competitors that have a star rating
        rated_comps = [
            (row, score)
            for row, score in scored_comps
            if row.product_star_rating_numeric is not None
        ]

        # Hard fallback: grab top-rated rapidapi rows (any category)
        if not rated_comps:
            fallback_rows = (
                db.query(RapidapiAmazonProducts)
                .filter(RapidapiAmazonProducts.product_star_rating_numeric.isnot(None))
                .order_by(RapidapiAmazonProducts.product_num_ratings.desc())
                .limit(5)
                .all()
            )
            rated_comps = [(row, 0.0) for row in fallback_rows]

        result["competitor_reviews"] = [
            {
                "title":            _truncate(row.product_title, 55),
                "asin":             row.asin,
                "rating":           row.product_star_rating_numeric,
                "num_ratings":      row.product_num_ratings,
                "is_prime":         bool(row.is_prime),
                "photo":            row.product_photo,
                "sales_volume":     row.sales_volume,
                "similarity_score": sim,
                "rating_delta": (
                    round(
                        row.product_star_rating_numeric
                        - (tracked.product_star_rating_numeric or 0.0),
                        2,
                    )
                    if row.product_star_rating_numeric and tracked.product_star_rating_numeric
                    else None
                ),
            }
            for row, sim in rated_comps[:5]
        ]

        # AI Response Suggestion
        # Prefer a negative review; fall back to most recent positive
        neg_review: Optional[str] = None
        for i, r in enumerate(ratings_raw):
            if _safe_int(r, 5) <= 2 and i < len(comments):
                neg_review = comments[i]
                break

        if neg_review:
            r_prompt = (
                f"You are an Amazon seller support specialist. "
                f"Product: \"{_truncate(tracked.product_title, 80)}\". "
                f"Negative review: \"{neg_review[:300]}\". "
                f"Write a professional, empathetic 3-4 sentence seller response. "
                f"Acknowledge the specific issue, apologize sincerely, offer a concrete resolution, "
                f"and invite them to contact you. Do NOT use 'we value your feedback'. "
                f"Reference details from the review."
            )
            ai_resp = _ollama(r_prompt, max_tokens=180)
            result["ai_response_suggestion"] = ai_resp or (
                "Thank you for your feedback — we sincerely apologize for your experience. "
                "Our team is investigating this immediately. "
                "Please contact us directly so we can make this right for you."
            )
        else:
            best_review: Optional[str] = None
            for i, r in enumerate(ratings_raw):
                if _safe_int(r, 0) >= 4 and i < len(comments):
                    best_review = comments[i]
                    break
            if best_review:
                t_prompt = (
                    f"Amazon product \"{_truncate(tracked.product_title, 80)}\". "
                    f"Positive review: \"{best_review[:200]}\". "
                    f"Write a brief genuine 2-sentence thank-you seller response "
                    f"that encourages the buyer to return. Do not be sycophantic."
                )
                ai_resp = _ollama(t_prompt, max_tokens=100)
                result["ai_response_suggestion"] = ai_resp or None

        # Review Velocity Insight
        comp_ratings_list = [
            c["rating"] for c in (result["competitor_reviews"] or [])
            if c.get("rating") is not None
        ]
        comp_avg_rating = (
            round(sum(comp_ratings_list) / len(comp_ratings_list), 2)
            if comp_ratings_list else None
        )

        health_score = result.get("review_health_score") or 0.0
        vi_prompt = (
            f"Amazon product \"{_truncate(tracked.product_title, 60)}\". "
            f"Star rating: {star_val}/5. Total ratings: {total_r:,}. "
            f"Seller response rate: {rr_pct:.0f}%. "
            f"Sentiment: {pos_pct}% positive, {neg_pct}% negative. "
            + (f"Competitor avg rating: {comp_avg_rating}/5. " if comp_avg_rating else "")
            + f"Review health score: {health_score}/100. "
            f"In 2 sentences give a specific review health insight and one concrete improvement action."
        )
        vi_text = _ollama(vi_prompt, max_tokens=120)

        qual_word = "strong" if star_val >= 4.2 else "moderate"
        rr_advice = (
            "Your response rate is strong — keep engaging with buyers!"
            if rr_pct > 50
            else "Responding to more reviews can significantly boost your seller trust score."
        )
        result["review_velocity_insight"] = vi_text or (
            f"Your {star_val}/5 rating across {total_r:,} reviews reflects "
            f"{qual_word} buyer satisfaction. {rr_advice}"
        )

        # Seller portfolio stats
        all_seller_products = (
            db.query(TrackedProduct)
            .filter(TrackedProduct.seller_id == seller_id)
            .all()
        )
        valid_portfolio_ratings = [
            p.product_star_rating_numeric
            for p in all_seller_products
            if p.product_star_rating_numeric is not None
        ]
        if valid_portfolio_ratings:
            result["avg_seller_portfolio_rating"] = round(
                sum(valid_portfolio_ratings) / len(valid_portfolio_ratings), 2
            )
        result["seller_product_count"] = len(all_seller_products)

    return result


# ─────────────────────────────────────────────────────────────────────────────
# COMPETITOR ANALYSIS  (/comparison/competitors)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/competitors")
def get_competitor_analysis(
    asin:       str           = Query(..., description="Amazon ASIN"),
    seller_id:  str           = Query(..., description="Seller ID"),
    db:         Session       = Depends(get_db),
    current_user: User        = Depends(get_current_user),
) -> dict:
    """
    Tiered competitor analysis — identity, threat score, and Buy Box intelligence.
    """
    tier       = current_user.subscription_tier.lower().strip() if current_user.subscription_tier else "free"
    is_basic   = tier in ("basic", "premium")
    is_premium = tier == "premium"

    # ── Fetch tracked product ─────────────────────────────────────────────
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

    current_price = _clean_price(tracked.product_price)
    currency      = (tracked.currency or "USD").upper().strip()
    sym           = _currency_sym(currency)

    # ── Competitor discovery ──────────────────────────────────────────────
    # Free tier gets a count teaser; Basic+ gets the full scored list.
    scored_comps = _find_best_competitors(
        db, tracked, current_price or 0.0, currency,
        limit=20 if is_basic else 5,
    )

    # ── Buy Box intelligence (free: risk badge only) ──────────────────────
    buy_box = _compute_buy_box(tracked)

    # ── Base result ───────────────────────────────────────────────────────
    result: dict[str, Any] = {
        # Meta
        "tier":     tier,
        "asin":     asin,
        "currency": currency,
        # Product identity
        "product_title":    tracked.product_title,
        "product_photo":    tracked.product_photo,
        "is_prime":         bool(tracked.is_prime),
        "is_best_seller":   bool(tracked.is_best_seller),
        "is_amazon_choice": bool(getattr(tracked, "is_amazon_choice", False)),
        "sales_volume":     tracked.sales_volume,
        "current_price":    current_price,
        "product_star_rating": tracked.product_star_rating_numeric,
        "seller_rating":    tracked.seller_rating,
        # Buy Box — always returned; free tier exposes risk badge only,
        # Basic unlocks undercut_amount / sellers_undercutting
        "buy_box": {
            "buy_box_risk_level": buy_box["buy_box_risk_level"],
            "num_offers":         buy_box["num_offers"],
            # Basic+ fields (None for free tier)
            "min_offer_price":      buy_box["min_offer_price"]      if is_basic else None,
            "undercut_amount":      buy_box["undercut_amount"]      if is_basic else None,
            "sellers_undercutting": buy_box["sellers_undercutting"] if is_basic else None,
        },
        # Free: teaser count only
        "competitor_count": len(scored_comps),
        # Basic+
        "competitors":  None,
        "top_threat":   None,
        "price_position": None,
        # Premium
        "change_feed":       None,
        "seller_health":     None,
        "market_gaps":       None,
        "ai_weekly_summary": None,
        "portfolio_threat":  None,
    }

    # ── Basic tier ────────────────────────────────────────────────────────
    if is_basic:
        my_rating      = tracked.product_star_rating_numeric or 0.0
        my_num_ratings = tracked.product_num_ratings or 0

        comp_list: list[dict] = []
        for row, sim_score in scored_comps:
            comp_price    = row.product_price_numeric
            comp_original = getattr(row, "product_original_price_numeric", None) or comp_price

            threat_score, threat_reason = _compute_threat_score(
                comp_price          = comp_price,
                comp_rating         = row.product_star_rating_numeric,
                comp_num_ratings    = row.product_num_ratings,
                comp_is_prime       = bool(row.is_prime),
                comp_is_best_seller = bool(row.is_best_seller),
                my_price            = current_price,
                my_rating           = my_rating,
                my_num_ratings      = my_num_ratings,
            )

            # Discount aggression: how hard are they cutting from original?
            discount_aggression: Optional[float] = None
            if comp_original and comp_price and comp_original > comp_price:
                discount_aggression = round(
                    (comp_original - comp_price) / comp_original * 100, 1
                )

            # Price delta vs my price
            price_diff_pct: Optional[float] = None
            if current_price and comp_price:
                price_diff_pct = round(
                    (comp_price - current_price) / current_price * 100, 1
                )

            comp_list.append({
                "asin":               row.asin,
                "title":              _truncate(row.product_title, 80),
                "photo":              row.product_photo,
                "price":              comp_price,
                "rating":             row.product_star_rating_numeric,
                "num_ratings":        row.product_num_ratings,
                "is_prime":           bool(row.is_prime),
                "is_best_seller":     bool(row.is_best_seller),
                "is_amazon_choice":   bool(getattr(row, "is_amazon_choice", False)),
                "sales_volume":       row.sales_volume,
                "similarity_score":   sim_score,
                "threat_score":       threat_score,
                "threat_reason":      threat_reason,
                "discount_aggression": discount_aggression,
                "price_diff_pct":     price_diff_pct,
            })

        # Sort by threat score descending so the most dangerous rival is first
        comp_list.sort(key=lambda x: x["threat_score"], reverse=True)

        result["competitors"] = comp_list
        result["top_threat"]  = comp_list[0] if comp_list else None

        # Price position vs competitor average
        comp_prices = [c["price"] for c in comp_list if c["price"] is not None]
        if comp_prices and current_price:
            avg_p      = sum(comp_prices) / len(comp_prices)
            diff_ratio = (current_price - avg_p) / avg_p if avg_p else 0.0
            result["price_position"] = (
                "Above Market" if diff_ratio >  0.10 else
                "Below Market" if diff_ratio < -0.10 else
                "Competitive"
            )

    # ── Premium tier ──────────────────────────────────────────────────────
    if is_premium:
        # Change feed — price movement + badge flags from snapshot columns
        result["change_feed"] = _build_change_feed(scored_comps, currency)

        # Market gap finder
        result["market_gaps"] = _find_market_gaps(
            scored_comps, current_price or 0.0, currency
        )

        # Seller health card
        result["seller_health"] = {
            "seller_rating":        tracked.seller_rating,
            "seller_ratings_total": tracked.seller_ratings_total,
            "business_name":        tracked.business_name,
            "product_count":        db.query(TrackedProduct)
                                      .filter(
                                          TrackedProduct.seller_id == seller_id,
                                          TrackedProduct.user_email == current_user.email
                                      )
                                      .count(),
        }

        # Portfolio threat rank — compute max threat score across all seller ASINs
        all_seller_products = (
            db.query(TrackedProduct)
            .filter(TrackedProduct.seller_id == seller_id)
            .all()
        )
        portfolio: list[dict] = []
        for p in all_seller_products:
            if not p.asin:
                continue
            p_price = _clean_price(p.product_price)
            p_comps = _find_best_competitors(
                db, p, p_price or 0.0, currency, limit=5
            )
            max_threat = 0.0
            for row, _ in p_comps:
                ts, _ = _compute_threat_score(
                    comp_price          = row.product_price_numeric,
                    comp_rating         = row.product_star_rating_numeric,
                    comp_num_ratings    = row.product_num_ratings,
                    comp_is_prime       = bool(row.is_prime),
                    comp_is_best_seller = bool(row.is_best_seller),
                    my_price            = p_price,
                    my_rating           = p.product_star_rating_numeric or 0.0,
                    my_num_ratings      = p.product_num_ratings or 0,
                )
                max_threat = max(max_threat, ts)
            portfolio.append({
                "asin":             p.asin,
                "title":            _truncate(p.product_title, 55),
                "max_threat_score": round(max_threat, 1),
            })

        portfolio.sort(key=lambda x: x["max_threat_score"], reverse=True)
        result["portfolio_threat"] = portfolio[:10]

        # AI weekly summary
        comp_list_for_ai: list[dict] = result.get("competitors") or []
        top3 = comp_list_for_ai[:3]
        if top3:
            top3_desc = "; ".join([
                f"{c['title'][:40]} (threat {c['threat_score']}/10, {c['threat_reason']})"
                for c in top3
            ])
            ai_prompt = (
                f"You are an Amazon competitive intelligence analyst. "
                f"Seller product: \"{_truncate(tracked.product_title, 80)}\". "
                f"Current price: {sym}{current_price:.2f}. "
                f"Top 3 threats: {top3_desc}. "
                f"Buy Box status: {buy_box['buy_box_risk_level']}. "
                f"In 2-3 sentences: which competitor is most dangerous, what changed, "
                f"and one specific action the seller should take. Use exact numbers."
            )
            ai_text = _ollama(ai_prompt, max_tokens=180)
            result["ai_weekly_summary"] = ai_text or (
                f"Your top threat scores {top3[0]['threat_score']}/10 - "
                f"{top3[0]['threat_reason']}. "
                f"Buy Box is {buy_box['buy_box_risk_level']}. "
                f"Address the pricing gap before the next repricing cycle."
            )

    return result

@router.get("/analysis")
def get_comparative_analysis(
    asin:       str           = Query(..., description="Amazon ASIN"),
    seller_id:  str           = Query(..., description="Seller ID"),
    db:         Session       = Depends(get_db),
    current_user: User        = Depends(get_current_user),
) -> dict:
    tier       = current_user.subscription_tier.lower().strip() if current_user.subscription_tier else "free"
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
    return {"tier": tier, "asin": asin, "buy_box_status": "Safe"}

@router.get("/snapshot")
def get_comparison_snapshot(
    asin:       str           = Query(..., description="Amazon ASIN"),
    seller_id:  str           = Query(..., description="Seller ID"),
    db:         Session       = Depends(get_db),
    current_user: User        = Depends(get_current_user),
) -> dict:
    return {
        "price":    get_price_comparison(asin, seller_id, db, current_user),
        "reviews":  get_review_comparison(asin, seller_id, db, current_user),
        "analysis": get_comparative_analysis(asin, seller_id, db, current_user),
    }