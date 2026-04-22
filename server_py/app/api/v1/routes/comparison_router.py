# from fastapi import APIRouter, Depends, Query, HTTPException
# from sqlalchemy.orm import Session
# from app.db.session import get_db
# from app.models.legacy_models import TrackedProduct, RapidapiAmazonProducts, User
# import json

# router = APIRouter(prefix="/comparison", tags=["Comparison"])


# def _parse_json_field(field):
#     if not field:
#         return []
#     if isinstance(field, list):
#         return field
#     try:
#         return json.loads(field)
#     except Exception:
#         return []


# def _clean_price(p) -> float | None:
#     if not p:
#         return None
#     try:
#         return float(str(p).replace("$", "").replace("₹", "").replace(",", "").strip())
#     except Exception:
#         return None


# def _safe_int(val, default=0) -> int:
#     try:
#         return int(val)
#     except Exception:
#         return default


# def _get_user_tier(db: Session, user_email: str) -> str:
#     user = db.query(User).filter(User.email == user_email).first()
#     return (user.subscription_tier or "free") if user else "free"


# # ─────────────────────────────────────────────────────────────────────────────
# # PRICE COMPARISON
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/price")
# def get_price_comparison(
#     asin: str = Query(...),
#     seller_id: str = Query(...),
#     user_email: str = Query(None),
#     db: Session = Depends(get_db),
# ):
#     """
#     Free   : current price, original price, discount %
#     Basic  : + min offer price, market avg/min/max, price bands, percentile position
#     Premium: + AI pricing tip, seller portfolio cross-comparison
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     tracked = db.query(TrackedProduct).filter(
#         TrackedProduct.asin == asin,
#         TrackedProduct.seller_id == seller_id,
#     ).first()
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     current_price  = _clean_price(tracked.product_price)
#     original_price = _clean_price(tracked.product_original_price)
#     discount_pct   = None
#     if current_price and original_price and original_price > 0:
#         discount_pct = round(((original_price - current_price) / original_price) * 100, 1)

#     result = {
#         "tier": tier,
#         "asin": asin,
#         "product_title": tracked.product_title,
#         "product_photo": tracked.product_photo,
#         "currency": tracked.currency or "USD",
#         "current_price": current_price,
#         "original_price": original_price,
#         "discount_pct": discount_pct,
#         "is_prime": tracked.is_prime,
#         "is_best_seller": tracked.is_best_seller,
#         "sales_volume": tracked.sales_volume,
#         "num_offers": tracked.product_num_offers,
#         "delivery": tracked.delivery,
#         # Basic+
#         "min_offer_price": None,
#         "market_avg": None,
#         "market_min": None,
#         "market_max": None,
#         "price_percentile": None,
#         "price_position": None,
#         "competitor_count": None,
#         "price_bands": None,
#         # Premium
#         "ai_pricing_tip": None,
#         "seller_other_products": None,
#     }

#     if is_basic:
#         result["min_offer_price"] = _clean_price(tracked.product_minimum_offer_price)

#         market_rows = (
#             db.query(RapidapiAmazonProducts)
#             .filter(
#                 RapidapiAmazonProducts.country == (tracked.country or "US"),
#                 RapidapiAmazonProducts.product_price_numeric.isnot(None),
#             )
#             .limit(300)
#             .all()
#         )
#         prices = [r.product_price_numeric for r in market_rows if r.product_price_numeric]

#         if prices:
#             avg_p = round(sum(prices) / len(prices), 2)
#             result["market_avg"]       = avg_p
#             result["market_min"]       = round(min(prices), 2)
#             result["market_max"]       = round(max(prices), 2)
#             result["competitor_count"] = len(prices)

#             if current_price:
#                 below = sum(1 for p in prices if p < current_price)
#                 result["price_percentile"] = round((below / len(prices)) * 100, 1)
#                 diff_ratio = (current_price - avg_p) / avg_p if avg_p else 0
#                 if diff_ratio > 0.10:
#                     result["price_position"] = "Above Market"
#                 elif diff_ratio < -0.10:
#                     result["price_position"] = "Below Market"
#                 else:
#                     result["price_position"] = "Competitive"

#             sym = "₹" if (tracked.currency or "USD") == "INR" else "$"
#             lo, hi = result["market_min"], result["market_max"]
#             band_size = (hi - lo) / 5 if hi != lo else 10
#             bands = []
#             for i in range(5):
#                 b_lo = lo + i * band_size
#                 b_hi = b_lo + band_size
#                 count = sum(1 for p in prices if b_lo <= p < b_hi)
#                 bands.append({
#                     "label": f"{sym}{b_lo:.0f}–{sym}{b_hi:.0f}",
#                     "count": count,
#                     "your_price_in_band": bool(current_price and b_lo <= current_price < b_hi),
#                     "density": "High" if count > len(prices) * 0.3 else ("Medium" if count > len(prices) * 0.12 else "Low"),
#                 })
#             result["price_bands"] = bands

#     if is_premium:
#         if current_price and result.get("market_avg"):
#             diff_pct = ((current_price - result["market_avg"]) / result["market_avg"]) * 100
#             if diff_pct > 15:
#                 result["ai_pricing_tip"] = (
#                     f"Your price is {abs(diff_pct):.1f}% above market average. "
#                     "Consider a 5–10% reduction to improve conversion, "
#                     "especially if your review count is lower than top competitors."
#                 )
#             elif diff_pct < -15:
#                 result["ai_pricing_tip"] = (
#                     f"Your price is {abs(diff_pct):.1f}% below market average — "
#                     "you may be leaving revenue on the table. "
#                     "Test a 5–8% price increase and monitor conversion for 2 weeks."
#                 )
#             else:
#                 result["ai_pricing_tip"] = (
#                     "Your price is well-positioned within the competitive range. "
#                     "Focus on improving review velocity and Prime eligibility "
#                     "to defend and grow your market share."
#                 )

#         others = (
#             db.query(TrackedProduct)
#             .filter(TrackedProduct.seller_id == seller_id, TrackedProduct.asin != asin)
#             .limit(5)
#             .all()
#         )
#         result["seller_other_products"] = [
#             {
#                 "asin": p.asin,
#                 "title": (p.product_title or "")[:55] + ("…" if len(p.product_title or "") > 55 else ""),
#                 "price": _clean_price(p.product_price),
#                 "rating": p.product_star_rating_numeric,
#                 "photo": p.product_photo,
#                 "sales_volume": p.sales_volume,
#             }
#             for p in others
#         ]

#     return result


# # ─────────────────────────────────────────────────────────────────────────────
# # REVIEW COMPARISON
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/reviews")
# def get_review_comparison(
#     asin: str = Query(...),
#     seller_id: str = Query(...),
#     user_email: str = Query(None),
#     db: Session = Depends(get_db),
# ):
#     """
#     Free   : star rating, total ratings, rating distribution
#     Basic  : + recent 5 reviews, seller response rate
#     Premium: + sentiment breakdown, competitor comparison, AI response suggestion
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     tracked = db.query(TrackedProduct).filter(
#         TrackedProduct.asin == asin,
#         TrackedProduct.seller_id == seller_id,
#     ).first()
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     comments     = _parse_json_field(tracked.review_comments)
#     ratings      = _parse_json_field(tracked.review_ratings)
#     authors      = _parse_json_field(tracked.review_authors)
#     dates        = _parse_json_field(tracked.review_dates)
#     has_response = _parse_json_field(tracked.review_has_response)

#     rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
#     for r in ratings:
#         k = _safe_int(r, 0)
#         if 1 <= k <= 5:
#             rating_dist[k] += 1

#     result = {
#         "tier": tier,
#         "asin": asin,
#         "product_title": tracked.product_title,
#         "product_photo": tracked.product_photo,
#         "star_rating": tracked.product_star_rating_numeric,
#         "total_ratings": tracked.product_num_ratings or 0,
#         "rating_distribution": rating_dist,
#         "seller_rating": tracked.seller_rating,
#         "seller_ratings_total": tracked.seller_ratings_total,
#         "is_prime": tracked.is_prime,
#         "is_best_seller": tracked.is_best_seller,
#         # Basic+
#         "recent_reviews": None,
#         "response_rate_pct": None,
#         "response_rate_label": None,
#         # Premium
#         "sentiment_breakdown": None,
#         "competitor_reviews": None,
#         "ai_response_suggestion": None,
#         "review_velocity_insight": None,
#         "avg_seller_portfolio_rating": None,
#         "seller_product_count": None,
#     }

#     if is_basic:
#         recent = []
#         for i in range(min(len(comments), 5)):
#             recent.append({
#                 "comment": comments[i] if i < len(comments) else "",
#                 "rating": _safe_int(ratings[i], None) if i < len(ratings) else None,
#                 "author": authors[i] if i < len(authors) else "Anonymous",
#                 "date": dates[i] if i < len(dates) else "",
#                 "has_response": bool(has_response[i]) if i < len(has_response) else False,
#             })
#         result["recent_reviews"] = recent

#         if has_response:
#             responded = sum(1 for r in has_response if r is True or str(r).lower() == "true")
#             result["response_rate_pct"]   = round((responded / len(has_response)) * 100, 1)
#             result["response_rate_label"] = f"{responded}/{len(has_response)}"

#     if is_premium:
#         pos = sum(1 for r in ratings if _safe_int(r, 0) >= 4)
#         neu = sum(1 for r in ratings if _safe_int(r, 0) == 3)
#         neg = sum(1 for r in ratings if 0 < _safe_int(r, 0) <= 2)
#         tot = max(len(ratings), 1)
#         result["sentiment_breakdown"] = {
#             "positive": round((pos / tot) * 100),
#             "neutral":  round((neu / tot) * 100),
#             "negative": round((neg / tot) * 100),
#         }

#         competitors = (
#             db.query(RapidapiAmazonProducts)
#             .filter(
#                 RapidapiAmazonProducts.country == (tracked.country or "US"),
#                 RapidapiAmazonProducts.product_star_rating_numeric.isnot(None),
#                 RapidapiAmazonProducts.product_num_ratings.isnot(None),
#             )
#             .order_by(RapidapiAmazonProducts.product_num_ratings.desc())
#             .limit(5)
#             .all()
#         )
#         result["competitor_reviews"] = [
#             {
#                 "title": (c.product_title or "")[:52] + ("…" if len(c.product_title or "") > 52 else ""),
#                 "asin": c.asin,
#                 "rating": c.product_star_rating_numeric,
#                 "num_ratings": c.product_num_ratings,
#                 "is_prime": c.is_prime,
#                 "photo": c.product_photo,
#                 "sales_volume": c.sales_volume,
#             }
#             for c in competitors
#         ]

#         neg_review = next(
#             (comments[i] for i, r in enumerate(ratings)
#              if _safe_int(r, 5) <= 2 and i < len(comments)),
#             None,
#         )
#         if neg_review:
#             result["ai_response_suggestion"] = (
#                 "Thank you for your honest feedback — we sincerely apologize for your experience. "
#                 "Our quality team has been notified and we are actively investigating. "
#                 "Please contact us directly so we can make this right. "
#                 "We stand behind every product we sell, 100%."
#             )

#         if dates:
#             rr = result.get("response_rate_pct") or 0
#             result["review_velocity_insight"] = (
#                 f"You have {len(dates)} recent reviews tracked. "
#                 + ("Your response rate is strong — keep engaging with buyers!" if rr > 50
#                    else "Responding to more reviews can boost your seller trust score significantly.")
#             )

#         all_seller = db.query(TrackedProduct).filter(TrackedProduct.seller_id == seller_id).all()
#         valid_r    = [p.product_star_rating_numeric for p in all_seller if p.product_star_rating_numeric]
#         if valid_r:
#             result["avg_seller_portfolio_rating"] = round(sum(valid_r) / len(valid_r), 2)
#         result["seller_product_count"] = len(all_seller)

#     return result



# from fastapi import APIRouter, Depends, Query, HTTPException
# from sqlalchemy.orm import Session
# from app.db.session import get_db
# from app.models.legacy_models import TrackedProduct, RapidapiAmazonProducts, User
# import json
# import httpx

# router = APIRouter(prefix="/comparison", tags=["Comparison"])

# OLLAMA_URL = "http://localhost:11434/api/generate"
# OLLAMA_MODEL = "llama3.2:3b"


# def _parse_json_field(field):
#     if not field:
#         return []
#     if isinstance(field, list):
#         return field
#     try:
#         return json.loads(field)
#     except Exception:
#         return []


# def _clean_price(p) -> float | None:
#     if not p:
#         return None
#     try:
#         return float(str(p).replace("$", "").replace("₹", "").replace(",", "").strip())
#     except Exception:
#         return None


# def _safe_int(val, default=0) -> int:
#     try:
#         return int(val)
#     except Exception:
#         return default


# def _get_user_tier(db: Session, user_email: str) -> str:
#     user = db.query(User).filter(User.email == user_email).first()
#     return (user.subscription_tier or "free") if user else "free"


# def _ollama(prompt: str, max_tokens: int = 200) -> str:
#     """Call Ollama llama3.2:3b and return the response text. Falls back to empty string on error."""
#     try:
#         with httpx.Client(timeout=30.0) as client:
#             resp = client.post(
#                 OLLAMA_URL,
#                 json={
#                     "model": OLLAMA_MODEL,
#                     "prompt": prompt,
#                     "stream": False,
#                     "options": {"num_predict": max_tokens, "temperature": 0.4},
#                 },
#             )
#             resp.raise_for_status()
#             return resp.json().get("response", "").strip()
#     except Exception:
#         return ""


# # ─────────────────────────────────────────────────────────────────────────────
# # PRICE COMPARISON
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/price")
# def get_price_comparison(
#     asin: str = Query(...),
#     seller_id: str = Query(...),
#     user_email: str = Query(None),
#     db: Session = Depends(get_db),
# ):
#     """
#     Free   : current price, original price, discount %
#     Basic  : + min offer price, market avg/min/max, price bands, percentile position
#     Premium: + AI pricing tip (Ollama), seller portfolio cross-comparison
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     tracked = db.query(TrackedProduct).filter(
#         TrackedProduct.asin == asin,
#         TrackedProduct.seller_id == seller_id,
#     ).first()
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     current_price  = _clean_price(tracked.product_price)
#     original_price = _clean_price(tracked.product_original_price)
#     discount_pct   = None
#     if current_price and original_price and original_price > 0:
#         discount_pct = round(((original_price - current_price) / original_price) * 100, 1)

#     result = {
#         "tier": tier,
#         "asin": asin,
#         "product_title": tracked.product_title,
#         "product_photo": tracked.product_photo,
#         "currency": tracked.currency or "USD",
#         "current_price": current_price,
#         "original_price": original_price,
#         "discount_pct": discount_pct,
#         "is_prime": tracked.is_prime,
#         "is_best_seller": tracked.is_best_seller,
#         "sales_volume": tracked.sales_volume,
#         "num_offers": tracked.product_num_offers,
#         "delivery": tracked.delivery,
#         # Basic+
#         "min_offer_price": None,
#         "market_avg": None,
#         "market_min": None,
#         "market_max": None,
#         "price_percentile": None,
#         "price_position": None,
#         "competitor_count": None,
#         "price_bands": None,
#         # Premium
#         "ai_pricing_tip": None,
#         "seller_other_products": None,
#     }

#     if is_basic:
#         result["min_offer_price"] = _clean_price(tracked.product_minimum_offer_price)

#         market_rows = (
#             db.query(RapidapiAmazonProducts)
#             .filter(
#                 RapidapiAmazonProducts.country == (tracked.country or "US"),
#                 RapidapiAmazonProducts.product_price_numeric.isnot(None),
#             )
#             .limit(300)
#             .all()
#         )
#         prices = [r.product_price_numeric for r in market_rows if r.product_price_numeric]

#         if prices:
#             avg_p = round(sum(prices) / len(prices), 2)
#             result["market_avg"]       = avg_p
#             result["market_min"]       = round(min(prices), 2)
#             result["market_max"]       = round(max(prices), 2)
#             result["competitor_count"] = len(prices)

#             if current_price:
#                 below = sum(1 for p in prices if p < current_price)
#                 result["price_percentile"] = round((below / len(prices)) * 100, 1)
#                 diff_ratio = (current_price - avg_p) / avg_p if avg_p else 0
#                 if diff_ratio > 0.10:
#                     result["price_position"] = "Above Market"
#                 elif diff_ratio < -0.10:
#                     result["price_position"] = "Below Market"
#                 else:
#                     result["price_position"] = "Competitive"

#             sym = "₹" if (tracked.currency or "USD") == "INR" else "$"
#             lo, hi = result["market_min"], result["market_max"]
#             band_size = (hi - lo) / 5 if hi != lo else 10
#             bands = []
#             for i in range(5):
#                 b_lo = lo + i * band_size
#                 b_hi = b_lo + band_size
#                 count = sum(1 for p in prices if b_lo <= p < b_hi)
#                 bands.append({
#                     "label": f"{sym}{b_lo:.0f}–{sym}{b_hi:.0f}",
#                     "count": count,
#                     "your_price_in_band": bool(current_price and b_lo <= current_price < b_hi),
#                     "density": "High" if count > len(prices) * 0.3 else ("Medium" if count > len(prices) * 0.12 else "Low"),
#                 })
#             result["price_bands"] = bands

#     if is_premium:
#         # ── AI Pricing Tip via Ollama ────────────────────────────────────────
#         market_avg = result.get("market_avg")
#         if current_price and market_avg:
#             diff_pct = ((current_price - market_avg) / market_avg) * 100
#             currency_sym = "₹" if (tracked.currency or "USD") == "INR" else "$"
#             prompt = (
#                 f"You are a concise Amazon seller pricing advisor. "
#                 f"Product: \"{tracked.product_title or 'Unknown'}\". "
#                 f"Current price: {currency_sym}{current_price:.2f}. "
#                 f"Market average: {currency_sym}{market_avg:.2f}. "
#                 f"Market min: {currency_sym}{result.get('market_min', 0):.2f}. "
#                 f"Market max: {currency_sym}{result.get('market_max', 0):.2f}. "
#                 f"Price position: {result.get('price_position', 'unknown')} "
#                 f"({diff_pct:+.1f}% vs market avg). "
#                 f"Competitor count: {result.get('competitor_count', 0)}. "
#                 f"Is Prime: {tracked.is_prime}. Is Best Seller: {tracked.is_best_seller}. "
#                 f"In 2-3 sentences, give a specific, actionable pricing recommendation. "
#                 f"Be direct, use numbers, and mention a concrete next step."
#             )
#             ai_tip = _ollama(prompt, max_tokens=150)
#             result["ai_pricing_tip"] = ai_tip if ai_tip else (
#                 f"Your price is {diff_pct:+.1f}% vs market average. "
#                 "Review competitor listings and adjust pricing based on your conversion rate."
#             )
#         else:
#             result["ai_pricing_tip"] = (
#                 "Insufficient market data to generate a pricing recommendation. "
#                 "Ensure your product category has enough tracked competitors."
#             )

#         # ── AI Pricing Velocity Insight ──────────────────────────────────────
#         if current_price and result.get("price_percentile") is not None:
#             prompt2 = (
#                 f"Amazon product \"{(tracked.product_title or '')[:60]}\". "
#                 f"Price percentile: top {result['price_percentile']}% of market. "
#                 f"Num offers: {tracked.product_num_offers or 'unknown'}. "
#                 f"Sales volume: {tracked.sales_volume or 'unknown'}. "
#                 f"In 1 sentence, give a smart insight about competitive positioning."
#             )
#             velocity = _ollama(prompt2, max_tokens=80)
#             if velocity:
#                 result["ai_velocity_insight"] = velocity

#         # ── Seller other products ────────────────────────────────────────────
#         others = (
#             db.query(TrackedProduct)
#             .filter(TrackedProduct.seller_id == seller_id, TrackedProduct.asin != asin)
#             .limit(5)
#             .all()
#         )
#         result["seller_other_products"] = [
#             {
#                 "asin": p.asin,
#                 "title": (p.product_title or "")[:55] + ("…" if len(p.product_title or "") > 55 else ""),
#                 "price": _clean_price(p.product_price),
#                 "rating": p.product_star_rating_numeric,
#                 "photo": p.product_photo,
#                 "sales_volume": p.sales_volume,
#             }
#             for p in others
#         ]

#     return result


# # ─────────────────────────────────────────────────────────────────────────────
# # REVIEW COMPARISON
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/reviews")
# def get_review_comparison(
#     asin: str = Query(...),
#     seller_id: str = Query(...),
#     user_email: str = Query(None),
#     db: Session = Depends(get_db),
# ):
#     """
#     Free   : star rating, total ratings, rating distribution
#     Basic  : + recent 5 reviews, seller response rate
#     Premium: + sentiment breakdown, competitor comparison,
#                AI response suggestion (Ollama), review velocity insight (Ollama)
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     tracked = db.query(TrackedProduct).filter(
#         TrackedProduct.asin == asin,
#         TrackedProduct.seller_id == seller_id,
#     ).first()
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     comments     = _parse_json_field(tracked.review_comments)
#     ratings      = _parse_json_field(tracked.review_ratings)
#     authors      = _parse_json_field(tracked.review_authors)
#     dates        = _parse_json_field(tracked.review_dates)
#     has_response = _parse_json_field(tracked.review_has_response)

#     rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
#     for r in ratings:
#         k = _safe_int(r, 0)
#         if 1 <= k <= 5:
#             rating_dist[k] += 1

#     result = {
#         "tier": tier,
#         "asin": asin,
#         "product_title": tracked.product_title,
#         "product_photo": tracked.product_photo,
#         "star_rating": tracked.product_star_rating_numeric,
#         "total_ratings": tracked.product_num_ratings or 0,
#         "rating_distribution": rating_dist,
#         "seller_rating": tracked.seller_rating,
#         "seller_ratings_total": tracked.seller_ratings_total,
#         "is_prime": tracked.is_prime,
#         "is_best_seller": tracked.is_best_seller,
#         # Basic+
#         "recent_reviews": None,
#         "response_rate_pct": None,
#         "response_rate_label": None,
#         # Premium
#         "sentiment_breakdown": None,
#         "competitor_reviews": None,
#         "ai_response_suggestion": None,
#         "review_velocity_insight": None,
#         "avg_seller_portfolio_rating": None,
#         "seller_product_count": None,
#     }

#     if is_basic:
#         recent = []
#         for i in range(min(len(comments), 5)):
#             recent.append({
#                 "comment": comments[i] if i < len(comments) else "",
#                 "rating": _safe_int(ratings[i], None) if i < len(ratings) else None,
#                 "author": authors[i] if i < len(authors) else "Anonymous",
#                 "date": dates[i] if i < len(dates) else "",
#                 "has_response": bool(has_response[i]) if i < len(has_response) else False,
#             })
#         result["recent_reviews"] = recent

#         if has_response:
#             responded = sum(1 for r in has_response if r is True or str(r).lower() == "true")
#             result["response_rate_pct"]   = round((responded / len(has_response)) * 100, 1)
#             result["response_rate_label"] = f"{responded}/{len(has_response)}"

#     if is_premium:
#         pos = sum(1 for r in ratings if _safe_int(r, 0) >= 4)
#         neu = sum(1 for r in ratings if _safe_int(r, 0) == 3)
#         neg = sum(1 for r in ratings if 0 < _safe_int(r, 0) <= 2)
#         tot = max(len(ratings), 1)
#         result["sentiment_breakdown"] = {
#             "positive": round((pos / tot) * 100),
#             "neutral":  round((neu / tot) * 100),
#             "negative": round((neg / tot) * 100),
#         }

#         competitors = (
#             db.query(RapidapiAmazonProducts)
#             .filter(
#                 RapidapiAmazonProducts.country == (tracked.country or "US"),
#                 RapidapiAmazonProducts.product_star_rating_numeric.isnot(None),
#                 RapidapiAmazonProducts.product_num_ratings.isnot(None),
#             )
#             .order_by(RapidapiAmazonProducts.product_num_ratings.desc())
#             .limit(5)
#             .all()
#         )
#         result["competitor_reviews"] = [
#             {
#                 "title": (c.product_title or "")[:52] + ("…" if len(c.product_title or "") > 52 else ""),
#                 "asin": c.asin,
#                 "rating": c.product_star_rating_numeric,
#                 "num_ratings": c.product_num_ratings,
#                 "is_prime": c.is_prime,
#                 "photo": c.product_photo,
#                 "sales_volume": c.sales_volume,
#             }
#             for c in competitors
#         ]

#         # ── AI Response Suggestion via Ollama ────────────────────────────────
#         neg_review = next(
#             (comments[i] for i, r in enumerate(ratings)
#              if _safe_int(r, 5) <= 2 and i < len(comments)),
#             None,
#         )
#         if neg_review:
#             prompt = (
#                 f"You are an Amazon seller support specialist. "
#                 f"Product: \"{tracked.product_title or 'our product'}\". "
#                 f"A customer left this negative review: \"{neg_review[:300]}\". "
#                 f"Write a professional, empathetic, and concise seller response (3-4 sentences). "
#                 f"Acknowledge the issue, apologize sincerely, offer a resolution, and invite them to contact you. "
#                 f"Do NOT use generic phrases like 'we value your feedback'. Be specific to the review."
#             )
#             ai_resp = _ollama(prompt, max_tokens=180)
#             result["ai_response_suggestion"] = ai_resp if ai_resp else (
#                 "Thank you for your feedback — we sincerely apologize for your experience. "
#                 "Our quality team is investigating this issue. "
#                 "Please contact us directly so we can resolve this for you immediately."
#             )

#         # ── AI Review Velocity Insight via Ollama ────────────────────────────
#         rr = result.get("response_rate_pct") or 0
#         star = tracked.product_star_rating_numeric or 0
#         total_r = tracked.product_num_ratings or 0

#         prompt2 = (
#             f"Amazon product \"{(tracked.product_title or '')[:60]}\". "
#             f"Star rating: {star}/5. Total ratings: {total_r}. "
#             f"Recent reviews tracked: {len(dates)}. "
#             f"Seller response rate: {rr:.0f}%. "
#             f"Sentiment: {result['sentiment_breakdown']['positive']}% positive, "
#             f"{result['sentiment_breakdown']['negative']}% negative. "
#             f"In 2 sentences, give a specific insight about review health and one concrete action to improve it."
#         )
#         velocity = _ollama(prompt2, max_tokens=120)
#         result["review_velocity_insight"] = velocity if velocity else (
#             f"You have {len(dates)} recent reviews tracked with a {rr:.0f}% response rate. "
#             + ("Your response rate is strong — keep engaging with buyers!" if rr > 50
#                else "Responding to more reviews can significantly boost your seller trust score.")
#         )

#         # ── Portfolio stats ──────────────────────────────────────────────────
#         all_seller = db.query(TrackedProduct).filter(TrackedProduct.seller_id == seller_id).all()
#         valid_r    = [p.product_star_rating_numeric for p in all_seller if p.product_star_rating_numeric]
#         if valid_r:
#             result["avg_seller_portfolio_rating"] = round(sum(valid_r) / len(valid_r), 2)
#         result["seller_product_count"] = len(all_seller)

#     return result


# from fastapi import APIRouter, Depends, Query, HTTPException
# from sqlalchemy.orm import Session
# from sqlalchemy import func, case, or_, and_
# from app.db.session import get_db
# from app.models.legacy_models import TrackedProduct, RapidapiAmazonProducts, User
# import json
# import httpx
# import re
# from difflib import SequenceMatcher
# from typing import Optional

# router = APIRouter(prefix="/comparison", tags=["Comparison"])

# OLLAMA_URL = "http://localhost:11434/api/generate"
# OLLAMA_MODEL = "llama3.2:3b"


# # ─────────────────────────────────────────────────────────────────────────────
# # HELPERS
# # ─────────────────────────────────────────────────────────────────────────────

# def _parse_json_field(field):
#     if not field:
#         return []
#     if isinstance(field, list):
#         return field
#     try:
#         return json.loads(field)
#     except Exception:
#         return []


# def _clean_price(p) -> Optional[float]:
#     if not p:
#         return None
#     try:
#         return float(str(p).replace("$", "").replace("₹", "").replace(",", "").replace("£", "").replace("€", "").strip())
#     except Exception:
#         return None


# def _safe_int(val, default=0) -> int:
#     try:
#         return int(val)
#     except Exception:
#         return default


# def _get_user_tier(db: Session, user_email: str) -> str:
#     user = db.query(User).filter(User.email == user_email).first()
#     return (user.subscription_tier or "free") if user else "free"


# def _ollama(prompt: str, max_tokens: int = 200) -> str:
#     try:
#         with httpx.Client(timeout=30.0) as client:
#             resp = client.post(
#                 OLLAMA_URL,
#                 json={
#                     "model": OLLAMA_MODEL,
#                     "prompt": prompt,
#                     "stream": False,
#                     "options": {"num_predict": max_tokens, "temperature": 0.4},
#                 },
#             )
#             resp.raise_for_status()
#             return resp.json().get("response", "").strip()
#     except Exception:
#         return ""


# def _currency_sym(currency: str) -> str:
#     return "₹" if currency == "INR" else ("£" if currency == "GBP" else ("€" if currency == "EUR" else "$"))


# def _extract_keywords(title: str) -> list[str]:
#     """Extract meaningful keywords from a product title for fuzzy matching."""
#     if not title:
#         return []
#     # Remove common filler words
#     stop = {"the","a","an","and","or","for","with","in","of","to","by","from","on","at","is","are"}
#     # Tokenize: keep alphanumeric tokens of length >= 3
#     tokens = re.findall(r"[a-zA-Z0-9]+", title.lower())
#     return [t for t in tokens if len(t) >= 3 and t not in stop]


# def _title_similarity(t1: str, t2: str) -> float:
#     """Fast title similarity score 0-1 using keyword overlap + SequenceMatcher."""
#     if not t1 or not t2:
#         return 0.0
#     k1 = set(_extract_keywords(t1))
#     k2 = set(_extract_keywords(t2))
#     if not k1 or not k2:
#         return 0.0
#     jaccard = len(k1 & k2) / len(k1 | k2)
#     seq = SequenceMatcher(None, t1.lower()[:80], t2.lower()[:80]).ratio()
#     return round((jaccard * 0.6 + seq * 0.4), 4)


# def _parse_sales_volume(s: Optional[str]) -> Optional[int]:
#     """Parse '9K+ bought in past month' → 9000, '1K+' → 1000, '100+' → 100"""
#     if not s:
#         return None
#     s = s.lower()
#     m = re.search(r"([\d.]+)\s*k\+?", s)
#     if m:
#         return int(float(m.group(1)) * 1000)
#     m = re.search(r"([\d,]+)\+?", s)
#     if m:
#         return int(m.group(1).replace(",", ""))
#     return None


# def _find_best_competitors(
#     db: Session,
#     tracked: TrackedProduct,
#     current_price: float,
#     currency: str,
#     limit: int = 50,
# ) -> list:
#     """
#     Smart competitor discovery:
#     1. Same currency first (most reliable)
#     2. Price range filter: within ±60% of current price
#     3. Title keyword overlap scoring
#     4. Category name overlap
#     5. Fallback: same country, broad price range, best title match
#     Returns list of (row, similarity_score) sorted by score desc.
#     """
#     if not current_price:
#         return []

#     price_lo = current_price * 0.40
#     price_hi = current_price * 1.60

#     # ── Attempt 1: Same currency + price range ────────────────────────────
#     base_q = (
#         db.query(RapidapiAmazonProducts)
#         .filter(
#             RapidapiAmazonProducts.product_price_numeric.isnot(None),
#             RapidapiAmazonProducts.product_price_numeric >= price_lo,
#             RapidapiAmazonProducts.product_price_numeric <= price_hi,
#         )
#     )

#     # Currency sniffing: rapidapi table stores raw price strings like "₹1,629" or "$34.95"
#     # We detect currency from the product_price column prefix
#     if currency == "INR":
#         base_q = base_q.filter(RapidapiAmazonProducts.product_price.like("₹%"))
#     elif currency == "USD":
#         base_q = base_q.filter(
#             or_(
#                 RapidapiAmazonProducts.product_price.like("$%"),
#                 RapidapiAmazonProducts.country == "US",
#             )
#         )
#     else:
#         base_q = base_q.filter(
#             RapidapiAmazonProducts.country == (tracked.country or "US")
#         )

#     candidates = base_q.limit(300).all()

#     # ── Fallback 1: same currency prefix, ignore price range ─────────────
#     if len(candidates) < 5:
#         currency_prefix = "₹" if currency == "INR" else "$"
#         candidates = (
#             db.query(RapidapiAmazonProducts)
#             .filter(
#                 RapidapiAmazonProducts.product_price_numeric.isnot(None),
#                 RapidapiAmazonProducts.product_price.like(f"{currency_prefix}%"),
#             )
#             .limit(300)
#             .all()
#         )

#     # ── Fallback 2: use other TrackedProduct rows as pseudo-competitors ───
#     # Critical when rapidapi_amazon_products has no matching-currency data.
#     if len(candidates) < 5:
#         other_tracked = (
#             db.query(TrackedProduct)
#             .filter(
#                 TrackedProduct.asin != tracked.asin,
#                 TrackedProduct.currency == currency,
#                 TrackedProduct.product_price.isnot(None),
#             )
#             .limit(300)
#             .all()
#         )

#         class _TrackedProxy:
#             __slots__ = ["asin","product_title","product_photo","product_price",
#                          "product_price_numeric","product_original_price",
#                          "product_original_price_numeric","product_star_rating",
#                          "product_star_rating_numeric","product_num_ratings",
#                          "is_best_seller","is_amazon_choice","is_prime",
#                          "sales_volume","country","category_name"]
#             def __init__(self, t):
#                 self.asin = t.asin
#                 self.product_title = t.product_title
#                 self.product_photo = t.product_photo
#                 self.product_price = t.product_price
#                 self.product_price_numeric = _clean_price(t.product_price)
#                 self.product_original_price = t.product_original_price
#                 self.product_original_price_numeric = _clean_price(t.product_original_price)
#                 self.product_star_rating = t.product_star_rating
#                 self.product_star_rating_numeric = t.product_star_rating_numeric
#                 self.product_num_ratings = t.product_num_ratings
#                 self.is_best_seller = t.is_best_seller
#                 self.is_amazon_choice = getattr(t, "is_amazon_choice", None)
#                 self.is_prime = t.is_prime
#                 self.sales_volume = t.sales_volume
#                 self.country = t.country
#                 self.category_name = None

#         proxies = [_TrackedProxy(t) for t in other_tracked if _clean_price(t.product_price)]
#         if proxies:
#             candidates = proxies  # type: ignore

#     # ── Ultra fallback: all rapidapi rows regardless of currency ──────────
#     if len(candidates) < 5:
#         candidates = (
#             db.query(RapidapiAmazonProducts)
#             .filter(RapidapiAmazonProducts.product_price_numeric.isnot(None))
#             .limit(200)
#             .all()
#         )

#     # ── Score every candidate ─────────────────────────────────────────────
#     scored = []
#     for row in candidates:
#         if row.asin == tracked.asin:
#             continue
#         sim = _title_similarity(tracked.product_title or "", row.product_title or "")

#         # Bonus: category overlap
#         cat_bonus = 0.0
#         if tracked.product_title and row.category_name:
#             cat_kw = _extract_keywords(row.category_name or "")
#             prod_kw = set(_extract_keywords(tracked.product_title or ""))
#             overlap = len(prod_kw & set(cat_kw))
#             cat_bonus = min(overlap * 0.03, 0.15)

#         # Penalty: very different price (even within range)
#         price_penalty = 0.0
#         if current_price and row.product_price_numeric:
#             ratio = abs(row.product_price_numeric - current_price) / current_price
#             price_penalty = min(ratio * 0.1, 0.1)

#         score = sim + cat_bonus - price_penalty
#         if score > 0.05:  # minimum relevance threshold
#             scored.append((row, round(score, 4)))

#     # Sort by score desc, return top `limit`
#     scored.sort(key=lambda x: x[1], reverse=True)
#     return scored[:limit]


# def _normalize_prices(
#     competitors: list[tuple],
#     current_price: float,
#     tracked_currency: str,
# ) -> list[float]:
#     """
#     Return a clean list of numeric prices from competitor rows.
#     Handles currency mismatch: if we can detect the competitor price is in a
#     different currency, we skip it to avoid polluting market stats.
#     """
#     prices = []
#     for row, _ in competitors:
#         p = row.product_price_numeric
#         if not p:
#             continue
#         # Currency sanity check: if tracked is USD and price > 500, likely INR
#         if tracked_currency == "USD" and p > 500:
#             continue
#         # If tracked is INR and price < 10, likely USD
#         if tracked_currency == "INR" and p < 10:
#             continue
#         prices.append(p)
#     return prices


# # ─────────────────────────────────────────────────────────────────────────────
# # PRICE COMPARISON
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/price")
# def get_price_comparison(
#     asin: str = Query(...),
#     seller_id: str = Query(...),
#     user_email: str = Query(None),
#     db: Session = Depends(get_db),
# ):
#     """
#     Free   : current price, original price, discount %
#     Basic  : + min offer price, market avg/min/max, price bands, percentile position
#     Premium: + AI pricing tip (Ollama), seller portfolio cross-comparison
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     tracked = db.query(TrackedProduct).filter(
#         TrackedProduct.asin == asin,
#         TrackedProduct.seller_id == seller_id,
#     ).first()
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     current_price  = _clean_price(tracked.product_price)
#     original_price = _clean_price(tracked.product_original_price)
#     currency       = tracked.currency or "USD"
#     sym            = _currency_sym(currency)

#     discount_pct = None
#     if current_price and original_price and original_price > 0:
#         discount_pct = round(((original_price - current_price) / original_price) * 100, 1)

#     result = {
#         "tier": tier,
#         "asin": asin,
#         "product_title": tracked.product_title,
#         "product_photo": tracked.product_photo,
#         "currency": currency,
#         "current_price": current_price,
#         "original_price": original_price,
#         "discount_pct": discount_pct,
#         "is_prime": tracked.is_prime,
#         "is_best_seller": tracked.is_best_seller,
#         "sales_volume": tracked.sales_volume,
#         "num_offers": tracked.product_num_offers,
#         "delivery": tracked.delivery,
#         # Basic+
#         "min_offer_price": None,
#         "market_avg": None,
#         "market_min": None,
#         "market_max": None,
#         "price_percentile": None,
#         "price_position": None,
#         "competitor_count": None,
#         "price_bands": None,
#         "top_competitors": None,
#         # Premium
#         "ai_pricing_tip": None,
#         "ai_velocity_insight": None,
#         "seller_other_products": None,
#         "data_quality": "live",
#     }

#     if is_basic:
#         result["min_offer_price"] = _clean_price(tracked.product_minimum_offer_price)

#         # ── Smart competitor discovery ────────────────────────────────────
#         scored_competitors = _find_best_competitors(db, tracked, current_price or 0, currency)
#         prices = _normalize_prices(scored_competitors, current_price or 0, currency)

#         # ── Market stats from relevant competitors only ───────────────────
#         if prices:
#             avg_p = round(sum(prices) / len(prices), 2)
#             result["market_avg"]       = avg_p
#             result["market_min"]       = round(min(prices), 2)
#             result["market_max"]       = round(max(prices), 2)
#             result["competitor_count"] = len(prices)

#             if current_price:
#                 below = sum(1 for p in prices if p < current_price)
#                 result["price_percentile"] = round((below / len(prices)) * 100, 1)
#                 diff_ratio = (current_price - avg_p) / avg_p if avg_p else 0
#                 if diff_ratio > 0.10:
#                     result["price_position"] = "Above Market"
#                 elif diff_ratio < -0.10:
#                     result["price_position"] = "Below Market"
#                 else:
#                     result["price_position"] = "Competitive"
            
#             result["data_quality"] = "live" if len(prices) >= 10 else "limited"

#             # ── Price bands ───────────────────────────────────────────────
#             lo, hi = result["market_min"], result["market_max"]
#             band_size = (hi - lo) / 5 if hi != lo else max(lo * 0.1, 10)
#             bands = []
#             for i in range(5):
#                 b_lo = lo + i * band_size
#                 b_hi = b_lo + band_size
#                 count = sum(1 for p in prices if b_lo <= p < b_hi)
#                 bands.append({
#                     "label": f"{sym}{b_lo:.0f}–{sym}{b_hi:.0f}",
#                     "count": count,
#                     "your_price_in_band": bool(current_price and b_lo <= current_price < b_hi),
#                     "density": "High" if count > len(prices) * 0.3 else ("Medium" if count > len(prices) * 0.12 else "Low"),
#                 })
#             result["price_bands"] = bands

#             # ── Top 5 most similar competitors for Basic+ display ─────────
#             top5 = scored_competitors[:5]
#             result["top_competitors"] = [
#                 {
#                     "asin": row.asin,
#                     "title": (row.product_title or "")[:60],
#                     "price": row.product_price_numeric,
#                     "rating": row.product_star_rating_numeric,
#                     "photo": row.product_photo,
#                     "sales_volume": row.sales_volume,
#                     "is_prime": row.is_prime,
#                     "similarity_score": score,
#                     "price_diff_pct": (
#                         round(((row.product_price_numeric - current_price) / current_price) * 100, 1)
#                         if current_price and row.product_price_numeric else None
#                     ),
#                 }
#                 for row, score in top5
#             ]
#         else:
#             result["data_quality"] = "insufficient"

#     if is_premium:
#         market_avg = result.get("market_avg")

#         # ── AI Pricing Tip ────────────────────────────────────────────────
#         if current_price and market_avg:
#             diff_pct = ((current_price - market_avg) / market_avg) * 100
#             top_comp_summary = ""
#             if result.get("top_competitors"):
#                 top_comp_summary = ". Top 3 similar competitors: " + ", ".join(
#                     f"{sym}{c['price']:.2f} ({c['title'][:25]})"
#                     for c in result["top_competitors"][:3]
#                     if c.get("price")
#                 )
#             prompt = (
#                 f"You are a concise Amazon seller pricing advisor. "
#                 f"Product: \"{tracked.product_title or 'Unknown'}\". "
#                 f"Current price: {sym}{current_price:.2f}. "
#                 f"Market average (from {result.get('competitor_count', 0)} similar products): {sym}{market_avg:.2f}. "
#                 f"Market min: {sym}{result.get('market_min', 0):.2f}. "
#                 f"Market max: {sym}{result.get('market_max', 0):.2f}. "
#                 f"Price position: {result.get('price_position', 'unknown')} "
#                 f"({diff_pct:+.1f}% vs market avg){top_comp_summary}. "
#                 f"Competitor count: {result.get('competitor_count', 0)}. "
#                 f"Is Prime: {tracked.is_prime}. Is Best Seller: {tracked.is_best_seller}. "
#                 f"Sales volume: {tracked.sales_volume or 'unknown'}. "
#                 f"In 2-3 sentences, give a specific, actionable pricing recommendation. "
#                 f"Be direct, use exact numbers ({sym}), and mention a concrete next step."
#             )
#             ai_tip = _ollama(prompt, max_tokens=160)
#             result["ai_pricing_tip"] = ai_tip if ai_tip else (
#                 f"Your price is {diff_pct:+.1f}% vs market average of {sym}{market_avg:.2f}. "
#                 "Review the top competitor listings and adjust pricing based on your conversion rate."
#             )
#         else:
#             result["ai_pricing_tip"] = (
#                 "Insufficient comparable product data to generate a pricing recommendation. "
#                 "This may be a unique product or a niche category with few tracked competitors."
#             )

#         # ── AI Velocity Insight ───────────────────────────────────────────
#         if current_price and result.get("price_percentile") is not None:
#             sales_vol_num = _parse_sales_volume(tracked.sales_volume)
#             prompt2 = (
#                 f"Amazon product \"{(tracked.product_title or '')[:60]}\". "
#                 f"Price: {sym}{current_price:.2f}. Percentile: {result['price_percentile']}% (lower = cheaper). "
#                 f"Num offers: {tracked.product_num_offers or 'unknown'}. "
#                 f"Sales volume: {tracked.sales_volume or 'unknown'}"
#                 + (f" (~{sales_vol_num:,}/month)" if sales_vol_num else "") + ". "
#                 f"Market position: {result.get('price_position', 'unknown')}. "
#                 f"In 1 sentence, give a smart insight about competitive positioning and velocity."
#             )
#             velocity = _ollama(prompt2, max_tokens=80)
#             if velocity:
#                 result["ai_velocity_insight"] = velocity

#         # ── Seller other products ─────────────────────────────────────────
#         others = (
#             db.query(TrackedProduct)
#             .filter(TrackedProduct.seller_id == seller_id, TrackedProduct.asin != asin)
#             .limit(5)
#             .all()
#         )
#         result["seller_other_products"] = [
#             {
#                 "asin": p.asin,
#                 "title": (p.product_title or "")[:55] + ("…" if len(p.product_title or "") > 55 else ""),
#                 "price": _clean_price(p.product_price),
#                 "rating": p.product_star_rating_numeric,
#                 "photo": p.product_photo,
#                 "sales_volume": p.sales_volume,
#             }
#             for p in others
#         ]

#     return result


# # ─────────────────────────────────────────────────────────────────────────────
# # REVIEW COMPARISON
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/reviews")
# def get_review_comparison(
#     asin: str = Query(...),
#     seller_id: str = Query(...),
#     user_email: str = Query(None),
#     db: Session = Depends(get_db),
# ):
#     """
#     Free   : star rating, total ratings, rating distribution
#     Basic  : + recent 5 reviews, seller response rate
#     Premium: + sentiment breakdown, competitor comparison (smart),
#                AI response suggestion (Ollama), review velocity insight (Ollama)
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     tracked = db.query(TrackedProduct).filter(
#         TrackedProduct.asin == asin,
#         TrackedProduct.seller_id == seller_id,
#     ).first()
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     comments     = _parse_json_field(tracked.review_comments)
#     ratings      = _parse_json_field(tracked.review_ratings)
#     authors      = _parse_json_field(tracked.review_authors)
#     dates        = _parse_json_field(tracked.review_dates)
#     has_response = _parse_json_field(tracked.review_has_response)
#     currency     = tracked.currency or "USD"

#     rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
#     for r in ratings:
#         k = _safe_int(r, 0)
#         if 1 <= k <= 5:
#             rating_dist[k] += 1

#     result = {
#         "tier": tier,
#         "asin": asin,
#         "product_title": tracked.product_title,
#         "product_photo": tracked.product_photo,
#         "star_rating": tracked.product_star_rating_numeric,
#         "total_ratings": tracked.product_num_ratings or 0,
#         "rating_distribution": rating_dist,
#         "seller_rating": tracked.seller_rating,
#         "seller_ratings_total": tracked.seller_ratings_total,
#         "is_prime": tracked.is_prime,
#         "is_best_seller": tracked.is_best_seller,
#         # Basic+
#         "recent_reviews": None,
#         "response_rate_pct": None,
#         "response_rate_label": None,
#         # Premium
#         "sentiment_breakdown": None,
#         "competitor_reviews": None,
#         "ai_response_suggestion": None,
#         "review_velocity_insight": None,
#         "avg_seller_portfolio_rating": None,
#         "seller_product_count": None,
#         "review_health_score": None,
#     }

#     if is_basic:
#         recent = []
#         for i in range(min(len(comments), 5)):
#             recent.append({
#                 "comment": comments[i] if i < len(comments) else "",
#                 "rating": _safe_int(ratings[i], None) if i < len(ratings) else None,
#                 "author": authors[i] if i < len(authors) else "Anonymous",
#                 "date": dates[i] if i < len(dates) else "",
#                 "has_response": bool(has_response[i]) if i < len(has_response) else False,
#             })
#         result["recent_reviews"] = recent

#         if has_response:
#             responded = sum(1 for r in has_response if r is True or str(r).lower() == "true")
#             result["response_rate_pct"]   = round((responded / len(has_response)) * 100, 1)
#             result["response_rate_label"] = f"{responded}/{len(has_response)}"

#     if is_premium:
#         # ── Sentiment breakdown ───────────────────────────────────────────
#         pos = sum(1 for r in ratings if _safe_int(r, 0) >= 4)
#         neu = sum(1 for r in ratings if _safe_int(r, 0) == 3)
#         neg = sum(1 for r in ratings if 0 < _safe_int(r, 0) <= 2)
#         tot = max(len(ratings), 1)
#         result["sentiment_breakdown"] = {
#             "positive": round((pos / tot) * 100),
#             "neutral":  round((neu / tot) * 100),
#             "negative": round((neg / tot) * 100),
#         }

#         # ── Review Health Score (0–100) ───────────────────────────────────
#         # Composite score: star_rating (40%) + response_rate (20%) + % positive (30%) + total_ratings_log (10%)
#         import math
#         star = tracked.product_star_rating_numeric or 0
#         rr   = result.get("response_rate_pct") or 0
#         pos_pct = result["sentiment_breakdown"]["positive"]
#         total_r = tracked.product_num_ratings or 0
#         log_ratings = min(math.log10(total_r + 1) / 6 * 100, 100) if total_r else 0
#         health = (
#             (star / 5 * 100) * 0.40 +
#             rr * 0.20 +
#             pos_pct * 0.30 +
#             log_ratings * 0.10
#         )
#         result["review_health_score"] = round(health, 1)

#         # ── Smart competitor review comparison ────────────────────────────
#         current_price = _clean_price(tracked.product_price)
#         scored_competitors = _find_best_competitors(db, tracked, current_price or 0, currency, limit=10)

#         competitor_rows = []
#         for row, sim_score in scored_competitors:
#             if row.product_star_rating_numeric is not None:
#                 competitor_rows.append((row, sim_score))

#         # If we got nothing from rapidapi, fallback to top-rated in DB
#         if not competitor_rows:
#             fallback = (
#                 db.query(RapidapiAmazonProducts)
#                 .filter(RapidapiAmazonProducts.product_star_rating_numeric.isnot(None))
#                 .order_by(RapidapiAmazonProducts.product_num_ratings.desc())
#                 .limit(5)
#                 .all()
#             )
#             competitor_rows = [(row, 0.0) for row in fallback]

#         result["competitor_reviews"] = [
#             {
#                 "title": (row.product_title or "")[:55] + ("…" if len(row.product_title or "") > 55 else ""),
#                 "asin": row.asin,
#                 "rating": row.product_star_rating_numeric,
#                 "num_ratings": row.product_num_ratings,
#                 "is_prime": row.is_prime,
#                 "photo": row.product_photo,
#                 "sales_volume": row.sales_volume,
#                 "similarity_score": sim_score,
#                 "rating_delta": (
#                     round(row.product_star_rating_numeric - (tracked.product_star_rating_numeric or 0), 2)
#                     if row.product_star_rating_numeric and tracked.product_star_rating_numeric else None
#                 ),
#             }
#             for row, sim_score in competitor_rows[:5]
#         ]

#         # ── AI Response Suggestion for most recent negative review ────────
#         neg_review = next(
#             (comments[i] for i, r in enumerate(ratings)
#              if _safe_int(r, 5) <= 2 and i < len(comments)),
#             None,
#         )
#         if neg_review:
#             prompt = (
#                 f"You are an Amazon seller support specialist. "
#                 f"Product: \"{tracked.product_title or 'our product'}\". "
#                 f"A customer left this negative review: \"{neg_review[:300]}\". "
#                 f"Write a professional, empathetic, and concise seller response (3-4 sentences). "
#                 f"Acknowledge the specific issue mentioned, apologize sincerely, offer a concrete resolution, "
#                 f"and invite them to contact you directly. Do NOT use generic phrases like 'we value your feedback'. "
#                 f"Reference details from the review itself."
#             )
#             ai_resp = _ollama(prompt, max_tokens=180)
#             result["ai_response_suggestion"] = ai_resp if ai_resp else (
#                 "Thank you for sharing your experience — we sincerely apologize. "
#                 "Our quality team is investigating this issue immediately. "
#                 "Please contact us directly so we can resolve this for you."
#             )
#         else:
#             # No negative reviews — generate a proactive suggestion
#             if comments:
#                 best_review = next(
#                     (comments[i] for i, r in enumerate(ratings)
#                      if _safe_int(r, 0) >= 4 and i < len(comments)),
#                     comments[0] if comments else None,
#                 )
#                 if best_review:
#                     prompt = (
#                         f"Amazon product \"{tracked.product_title or 'our product'}\". "
#                         f"A customer left this positive review: \"{best_review[:200]}\". "
#                         f"Write a brief, warm 2-sentence seller thank-you response that feels genuine "
#                         f"and encourages the buyer to return. Don't be sycophantic."
#                     )
#                     ai_resp = _ollama(prompt, max_tokens=100)
#                     result["ai_response_suggestion"] = ai_resp or None

#         # ── Review Velocity Insight ───────────────────────────────────────
#         rr = result.get("response_rate_pct") or 0
#         star = tracked.product_star_rating_numeric or 0
#         total_r = tracked.product_num_ratings or 0
#         pos_pct = result["sentiment_breakdown"]["positive"]
#         neg_pct = result["sentiment_breakdown"]["negative"]

#         # Compute competitor avg rating for context
#         comp_ratings = [c["rating"] for c in (result["competitor_reviews"] or []) if c.get("rating")]
#         comp_avg = round(sum(comp_ratings) / len(comp_ratings), 2) if comp_ratings else None

#         prompt2 = (
#             f"Amazon product \"{(tracked.product_title or '')[:60]}\". "
#             f"Star rating: {star}/5. Total ratings: {total_r}. "
#             f"Recent reviews tracked: {len(dates)}. "
#             f"Seller response rate: {rr:.0f}%. "
#             f"Sentiment: {pos_pct}% positive, {neg_pct}% negative. "
#             + (f"Competitor avg rating: {comp_avg}/5. " if comp_avg else "")
#             + (f"Review health score: {result['review_health_score']}/100. " if result.get('review_health_score') else "")
#             + f"In 2 sentences, give a specific insight about review health and one concrete action to improve it."
#         )
#         velocity = _ollama(prompt2, max_tokens=120)
#         result["review_velocity_insight"] = velocity if velocity else (
#             f"Your {star}/5 rating across {total_r:,} reviews reflects {'strong' if star >= 4.2 else 'moderate'} buyer satisfaction. "
#             + ("Your response rate is strong — keep engaging with buyers!" if rr > 50
#                else "Responding to more reviews can significantly boost your seller trust score.")
#         )

#         # ── Portfolio stats ───────────────────────────────────────────────
#         all_seller = db.query(TrackedProduct).filter(TrackedProduct.seller_id == seller_id).all()
#         valid_r    = [p.product_star_rating_numeric for p in all_seller if p.product_star_rating_numeric]
#         if valid_r:
#             result["avg_seller_portfolio_rating"] = round(sum(valid_r) / len(valid_r), 2)
#         result["seller_product_count"] = len(all_seller)

#     return result



"""
comparison_router.py  –  Production-grade Price & Review Comparison API
------------------------------------------------------------------------
Tier matrix
  free    : basic product stats (price, rating, distribution)
  basic   : + market benchmarks, price bands, recent reviews, response rate
  premium : + AI tips (Ollama), velocity insights, sentiment, smart competitor table

Key design decisions
  • Competitor discovery uses TrackedProduct siblings first (same seller/currency)
    then RapidapiAmazonProducts, with currency-aware filtering at every layer.
  • All Ollama calls are fire-and-forget with a hardcoded fallback string so a
    slow/offline model never breaks the endpoint.
  • Every numeric operation is guarded; no endpoint can 500 on bad DB data.
  • _TrackedProxy is defined at module level (not inside a function) to avoid
    pickling issues if the router is ever used with multiprocessing workers.
  • math is imported at the top, not inside a conditional block.
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
    )

    def __init__(self, t: TrackedProduct) -> None:
        self.asin                          = t.asin
        self.product_title                 = t.product_title
        self.product_photo                 = t.product_photo
        self.product_price                 = t.product_price
        self.product_price_numeric         = _clean_price(t.product_price)
        self.product_original_price        = t.product_original_price
        self.product_original_price_numeric = _clean_price(t.product_original_price)
        self.product_star_rating           = t.product_star_rating
        self.product_star_rating_numeric   = t.product_star_rating_numeric
        self.product_num_ratings           = t.product_num_ratings
        self.is_best_seller                = t.is_best_seller
        self.is_amazon_choice              = getattr(t, "is_amazon_choice", None)
        self.is_prime                      = t.is_prime
        self.sales_volume                  = t.sales_volume
        self.country                       = t.country
        self.category_name                 = None  # TrackedProduct has no category


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
# PRICE COMPARISON  (/comparison/price)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/price")
def get_price_comparison(
    asin:       str           = Query(..., description="Amazon ASIN"),
    seller_id:  str           = Query(..., description="Seller ID"),
    user_email: Optional[str] = Query(None, description="User email for tier lookup"),
    db:         Session       = Depends(get_db),
) -> dict:
    """
    Returns tiered price comparison data for a tracked product.

    free    → current_price, original_price, discount_pct, basic product flags
    basic   → + min_offer_price, market_avg/min/max, price_bands,
                price_position, competitor_count, top_competitors
    premium → + ai_pricing_tip, ai_velocity_insight, seller_other_products
    """
    tier       = _get_user_tier(db, user_email) if user_email else "free"
    is_basic   = tier in ("basic", "premium")
    is_premium = tier == "premium"

    # ── Fetch tracked product ─────────────────────────────────────────────
    tracked = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.asin      == asin,
            TrackedProduct.seller_id == seller_id,
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
    user_email: Optional[str] = Query(None, description="User email for tier lookup"),
    db:         Session       = Depends(get_db),
) -> dict:
    """
    Returns tiered review / sentiment comparison data for a tracked product.

    free    → star_rating, total_ratings, rating_distribution
    basic   → + recent_reviews (5), response_rate
    premium → + sentiment_breakdown, review_health_score, competitor_reviews,
                ai_response_suggestion, review_velocity_insight,
                avg_seller_portfolio_rating
    """
    tier       = _get_user_tier(db, user_email) if user_email else "free"
    is_basic   = tier in ("basic", "premium")
    is_premium = tier == "premium"

    # ── Fetch tracked product ─────────────────────────────────────────────
    tracked = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.asin      == asin,
            TrackedProduct.seller_id == seller_id,
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
        ratings_int = [_safe_int(r, 0) for r in ratings_raw]
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
        star_val    = tracked.product_star_rating_numeric or 0.0
        rr_pct      = result.get("response_rate_pct") or 0.0
        total_r     = tracked.product_num_ratings or 0
        log_score   = min(math.log10(total_r + 1) / 6.0 * 100.0, 100.0) if total_r > 0 else 0.0

        health = (
            (star_val / 5.0 * 100.0) * 0.40
            + rr_pct                 * 0.20
            + pos_pct                * 0.30
            + log_score              * 0.10
        )
        result["review_health_score"] = round(min(health, 100.0), 1)

        # Smart competitor discovery (same logic as price comparison)
        current_price     = _clean_price(tracked.product_price)
        scored_comps      = _find_best_competitors(
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
            # No negative reviews — draft a thank-you for the best positive one
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