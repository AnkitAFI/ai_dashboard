
# """
# keyword_gap_router.py  –  Production-grade Keyword Gap Analysis API
# --------------------------------------------------------------------
# Tier matrix
#   free    : your title keywords + gap count teaser
#   basic   : + full gap/shared/unique sets, coverage score, heatmap,
#               competitor title list, price-range context
#   premium : + review keyword mining, AI opportunity scores (Ollama),
#               AI listing rewrite, prioritised action plan

# Architecture — 100 % derived from existing DB + Ollama, no external API
#   Sources used:
#     1. tracked_products.product_title        → your listing keywords
#     2. tracked_products.review_comments      → voice-of-customer signals
#     3. ALL tracked_products (same currency)  → best competitors for USD sellers
#     4. rapidapi_amazon_products              → additional competitors (INR sellers)

# Key accuracy fixes vs v1:
#   • Spec tokens like "V30", "U3", "4K", "UHS" preserved (min_len lowered to 2,
#     with an allowlist for known short but important terms)
#   • HTML entity decoding before extraction (&amp; → &, etc.)
#   • Uppercase spec preservation: "64GB" kept as "64gb" not dropped
#   • 3-gram support: catches "extreme pro sdxc", "uhs i memory"
#   • Competitor pool = ALL same-currency tracked_products across all sellers
#     (not just same-seller siblings) — much larger, more accurate pool
#   • Similarity threshold raised to 0.08 to avoid irrelevant product noise
#   • _MIN_COMP_FREQ = 2 for basic, = 1 for premium review keywords (less noise)
#   • Spec-aware priority: spec terms (digits+letters like "64gb") auto-elevated
#   • Deduplication: sub-phrases of higher-ranked n-grams are suppressed
# """

# from __future__ import annotations

# import html
# import json
# import logging
# import re
# from collections import Counter
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

# router = APIRouter(prefix="/keyword-gap", tags=["Keyword Gap"])

# # ── Ollama ─────────────────────────────────────────────────────────────────────
# OLLAMA_URL     = "http://localhost:11434/api/generate"
# OLLAMA_MODEL   = "llama3.2:3b"
# OLLAMA_TIMEOUT = 30.0

# # ── Extraction config ──────────────────────────────────────────────────────────
# # Tokens shorter than this are dropped UNLESS they are in _SPEC_ALLOWLIST
# _MIN_KW_LEN = 3

# # Short tokens that are important Amazon spec/search terms and must be kept
# _SPEC_ALLOWLIST: set[str] = {
#     # Storage / speed classes
#     "4k", "u1", "u3", "v10", "v30", "v60", "v90", "c10",
#     "uhs", "uhsi", "uhsii", "a1", "a2",
#     # Common short but meaningful tokens
#     "hd", "sd", "gb", "tb", "mb", "hz",
#     "ip", "usb", "5g",
# }

# # Pure noise — zero keyword value for gap analysis
# _STOP_WORDS: set[str] = {
#     "the", "a", "an", "and", "or", "for", "with", "in", "of", "to", "by",
#     "from", "on", "at", "is", "are", "was", "were", "be", "been", "being",
#     "have", "has", "had", "do", "does", "did", "will", "would", "could",
#     "should", "may", "might", "shall", "can", "not", "no", "nor", "so",
#     "yet", "both", "either", "neither", "whether", "this", "that", "these",
#     "those", "its", "it", "our", "your", "their", "my", "his", "her",
#     "buy", "get", "use", "used", "using",
#     "great", "good", "best", "nice", "perfect",
#     "works", "product", "item", "amazon",
#     "shipping", "fast", "delivery", "price", "value", "quality",
#     "highly", "recommend", "love", "like", "really", "very",
#     "also", "just", "only", "one", "two", "three", "four", "five",
#     "six", "seven", "eight", "nine", "ten",
#     "1st", "2nd", "3rd", "vs", "per", "each", "all", "any",
#     # Review-specific noise
#     "bought", "received", "arrived", "came", "came", "looked", "looked",
#     "seemed", "seemed", "ordered", "delivered", "packaging", "packaged",
#     "would", "could", "didn", "doesn", "wasn", "aren",
# }

# # Maximum n-gram size (3 catches "extreme pro sdxc", "uhs i memory card" etc.)
# _MAX_NGRAM = 3

# # Min number of competitor titles a keyword must appear in to be in the gap
# # (filters noise; lowered to 1 for premium review signals)
# _MIN_COMP_FREQ_BASIC   = 2
# _MIN_COMP_FREQ_PREMIUM = 1

# # Minimum title similarity to qualify as a competitor
# _MIN_SIMILARITY = 0.08

# # Currency thresholds
# _USD_PRICE_CEILING = 500.0
# _INR_PRICE_FLOOR   = 10.0


# # ─────────────────────────────────────────────────────────────────────────────
# # MODULE-LEVEL PROXY
# # ─────────────────────────────────────────────────────────────────────────────

# class _TrackedProxy:
#     """Duck-type wrapper so TrackedProduct rows work as competitor rows."""
#     __slots__ = (
#         "asin", "product_title", "product_photo",
#         "product_price", "product_price_numeric",
#         "product_original_price", "product_original_price_numeric",
#         "product_star_rating", "product_star_rating_numeric",
#         "product_num_ratings", "is_best_seller", "is_amazon_choice",
#         "is_prime", "sales_volume", "country", "category_name",
#     )

#     def __init__(self, t: TrackedProduct) -> None:
#         self.asin                           = t.asin
#         self.product_title                  = t.product_title
#         self.product_photo                  = t.product_photo
#         self.product_price                  = t.product_price
#         self.product_price_numeric          = _clean_price(t.product_price)
#         self.product_original_price         = t.product_original_price
#         self.product_original_price_numeric = _clean_price(t.product_original_price)
#         self.product_star_rating            = t.product_star_rating
#         self.product_star_rating_numeric    = t.product_star_rating_numeric
#         self.product_num_ratings            = t.product_num_ratings
#         self.is_best_seller                 = t.is_best_seller
#         self.is_amazon_choice               = getattr(t, "is_amazon_choice", None)
#         self.is_prime                       = t.is_prime
#         self.sales_volume                   = t.sales_volume
#         self.country                        = t.country
#         self.category_name                  = None


# # ─────────────────────────────────────────────────────────────────────────────
# # PURE HELPERS
# # ─────────────────────────────────────────────────────────────────────────────

# def _decode_html(text: str) -> str:
#     """Decode HTML entities: &amp; → &, &#x27; → ', &gt; → >, etc."""
#     if not text:
#         return ""
#     return html.unescape(text)


# def _parse_json_field(field: Any) -> list:
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
#     if p is None or str(p).strip() == "":
#         return None
#     try:
#         cleaned = (
#             str(p)
#             .replace("$", "").replace("₹", "").replace("£", "")
#             .replace("€", "").replace(",", "").strip()
#         )
#         v = float(cleaned)
#         return v if v > 0 else None
#     except (ValueError, TypeError):
#         return None


# def _truncate(s: Optional[str], n: int) -> str:
#     if not s:
#         return ""
#     return s[:n] + ("…" if len(s) > n else "")


# def _is_spec_token(token: str) -> bool:
#     """
#     Returns True if a token looks like a product specification.
#     Examples: "64gb", "140mbs", "v30", "uhsi", "c10", "4k"
#     Pattern: starts or ends with digits, or is in the spec allowlist.
#     """
#     if token in _SPEC_ALLOWLIST:
#         return True
#     # Mixed alphanumeric like "64gb", "140mbs", "uhs-i" → "uhsi"
#     has_digit  = any(c.isdigit() for c in token)
#     has_alpha  = any(c.isalpha() for c in token)
#     return has_digit and has_alpha


# def _get_user_tier(db: Session, user_email: str) -> str:
#     try:
#         user = db.query(User).filter(User.email == user_email).first()
#         if user and user.subscription_tier:
#             return user.subscription_tier.lower().strip()
#     except Exception as exc:
#         logger.warning("_get_user_tier failed for %s: %s", user_email, exc)
#     return "free"


# # ─────────────────────────────────────────────────────────────────────────────
# # KEYWORD EXTRACTION PIPELINE
# # ─────────────────────────────────────────────────────────────────────────────

# def _tokenise(text: str) -> list[str]:
#     """
#     Tokenise a product title for keyword extraction.

#     Rules:
#     - Decode HTML entities first
#     - Lowercase
#     - Split on non-alphanumeric (hyphens in "UHS-I" become "uhs" + "i")
#     - Drop pure stop-words
#     - Drop tokens shorter than _MIN_KW_LEN UNLESS they are spec tokens
#       or in _SPEC_ALLOWLIST
#     """
#     if not text:
#         return []
#     clean = _decode_html(text).lower()
#     # Replace separators with space (handles "UHS-I", "C10/U3/V30" etc.)
#     clean = re.sub(r"[^a-z0-9]+", " ", clean)
#     tokens = clean.split()
#     result: list[str] = []
#     for t in tokens:
#         if t in _STOP_WORDS:
#             continue
#         if len(t) < _MIN_KW_LEN and t not in _SPEC_ALLOWLIST and not _is_spec_token(t):
#             continue
#         result.append(t)
#     return result


# def _ngrams_from_tokens(tokens: list[str], n: int) -> list[str]:
#     return [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]


# def _extract_all_ngrams(text: str) -> list[str]:
#     """
#     Extract 1, 2, and 3-grams from text.
#     Larger n-grams come first (more specific → higher signal).
#     Returns a deduplicated list.
#     """
#     tokens = _tokenise(text)
#     grams: list[str] = []
#     for n in range(_MAX_NGRAM, 0, -1):
#         grams.extend(_ngrams_from_tokens(tokens, n))
#     seen:   set[str]  = set()
#     result: list[str] = []
#     for g in grams:
#         if g not in seen:
#             seen.add(g)
#             result.append(g)
#     return result


# def _keyword_set(text: str) -> set[str]:
#     return set(_extract_all_ngrams(text))


# def _suppress_subphrases(keywords: list[str]) -> list[str]:
#     """
#     Remove 1-grams and 2-grams that are fully contained within a higher-ranked
#     n-gram already in the list.  Keeps the list clean and non-redundant.

#     Example: if "extreme pro sdxc" is present, suppress "extreme pro",
#              "pro sdxc", "extreme", "pro", "sdxc" individually.
#     """
#     result: list[str] = []
#     kw_set = set(keywords)
#     for kw in keywords:
#         # Check if any higher-gram in the set contains this kw as a sub-phrase
#         dominated = any(
#             other != kw and kw in other and " " in other
#             for other in kw_set
#         )
#         if not dominated:
#             result.append(kw)
#     return result


# def _title_similarity(t1: str, t2: str) -> float:
#     """Jaccard + SequenceMatcher composite similarity [0, 1]."""
#     if not t1 or not t2:
#         return 0.0
#     k1 = set(_tokenise(t1))
#     k2 = set(_tokenise(t2))
#     if not k1 or not k2:
#         return 0.0
#     union   = k1 | k2
#     jaccard = len(k1 & k2) / len(union) if union else 0.0
#     seq     = SequenceMatcher(None, t1.lower()[:100], t2.lower()[:100]).ratio()
#     return round(jaccard * 0.6 + seq * 0.4, 4)


# def _ollama(prompt: str, max_tokens: int = 300) -> str:
#     """Call Ollama; return "" on any failure. Never raises."""
#     try:
#         with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
#             resp = client.post(
#                 OLLAMA_URL,
#                 json={
#                     "model":   OLLAMA_MODEL,
#                     "prompt":  prompt,
#                     "stream":  False,
#                     "options": {"num_predict": max_tokens, "temperature": 0.35},
#                 },
#             )
#             resp.raise_for_status()
#             return resp.json().get("response", "").strip()
#     except Exception as exc:
#         logger.debug("Ollama call failed: %s", exc)
#         return ""


# # ─────────────────────────────────────────────────────────────────────────────
# # COMPETITOR DISCOVERY
# # ─────────────────────────────────────────────────────────────────────────────

# def _get_competitor_titles(
#     db:       Session,
#     tracked:  TrackedProduct,
#     currency: str,
#     limit:    int = 40,
# ) -> list[dict[str, Any]]:
#     """
#     Discover the most relevant competitor products ranked by title similarity.

#     Strategy (in order of priority):
#     1. ALL tracked_products with same currency (best pool for USD sellers whose
#        rapidapi table contains only INR products)
#     2. rapidapi_amazon_products with same currency prefix + price range
#     3. rapidapi_amazon_products with same currency prefix (no price filter)
#     4. All rapidapi_amazon_products as absolute last resort

#     The function ALWAYS merges candidates from (1) and (2) before scoring,
#     so you get the richest possible competitor pool.
#     """
#     current_price = _clean_price(tracked.product_price) or 0.0
#     price_lo      = current_price * 0.30 if current_price else 0.0
#     price_hi      = current_price * 1.70 if current_price else 999_999.0
#     cur_prefix    = "₹" if currency == "INR" else "$"

#     all_candidates: list[Any] = []
#     seen_asins: set[str]      = set()

#     # ── Source A: ALL tracked_products (same currency) ────────────────────
#     # This is the primary source for USD sellers — it gives us all
#     # SanDisk/competitor memory card products tracked across the whole system.
#     tracked_siblings = (
#         db.query(TrackedProduct)
#         .filter(
#             TrackedProduct.asin     != tracked.asin,
#             TrackedProduct.currency == currency,
#             TrackedProduct.product_title.isnot(None),
#         )
#         .limit(500)
#         .all()
#     )
#     for t in tracked_siblings:
#         if t.asin not in seen_asins:
#             seen_asins.add(t.asin)
#             all_candidates.append(_TrackedProxy(t))

#     # ── Source B: rapidapi same currency + price range ────────────────────
#     base_q = db.query(RapidapiAmazonProducts).filter(
#         RapidapiAmazonProducts.product_title.isnot(None),
#         RapidapiAmazonProducts.asin.notin_(seen_asins),
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
#         )

#     rapidapi_rows = base_q.limit(200).all()
#     for row in rapidapi_rows:
#         if row.asin not in seen_asins:
#             seen_asins.add(row.asin)
#             all_candidates.append(row)

#     # ── Source C: rapidapi same currency, relax price range ───────────────
#     if len(all_candidates) < 10:
#         extra = (
#             db.query(RapidapiAmazonProducts)
#             .filter(
#                 RapidapiAmazonProducts.product_title.isnot(None),
#                 RapidapiAmazonProducts.product_price.like(f"{cur_prefix}%"),
#                 RapidapiAmazonProducts.asin.notin_(seen_asins),
#             )
#             .limit(200)
#             .all()
#         )
#         for row in extra:
#             if row.asin not in seen_asins:
#                 seen_asins.add(row.asin)
#                 all_candidates.append(row)

#     # ── Source D: absolute fallback (any rapidapi rows) ───────────────────
#     if len(all_candidates) < 5:
#         fallback = (
#             db.query(RapidapiAmazonProducts)
#             .filter(
#                 RapidapiAmazonProducts.product_title.isnot(None),
#                 RapidapiAmazonProducts.asin.notin_(seen_asins),
#             )
#             .limit(100)
#             .all()
#         )
#         all_candidates.extend(fallback)

#     # ── Score every candidate by title similarity ─────────────────────────
#     your_title = tracked.product_title or ""
#     scored: list[tuple[Any, float]] = []
#     for row in all_candidates:
#         if not row.product_title:
#             continue
#         sim = _title_similarity(your_title, row.product_title)
#         if sim >= _MIN_SIMILARITY:
#             scored.append((row, sim))

#     scored.sort(key=lambda x: x[1], reverse=True)

#     return [
#         {
#             "asin":        row.asin,
#             "title":       _decode_html(row.product_title or ""),
#             "similarity":  sim,
#             "source":      "tracked" if isinstance(row, _TrackedProxy) else "rapidapi",
#             "is_prime":    bool(row.is_prime),
#             "star_rating": row.product_star_rating_numeric,
#             "num_ratings": row.product_num_ratings,
#             "sales_volume":row.sales_volume,
#             "photo":       row.product_photo,
#             "price":       row.product_price_numeric,
#         }
#         for row, sim in scored[:limit]
#     ]


# # ─────────────────────────────────────────────────────────────────────────────
# # CORE KEYWORD GAP ENGINE
# # ─────────────────────────────────────────────────────────────────────────────

# def _is_spec_keyword(kw: str) -> bool:
#     """
#     Return True if this keyword looks like a product specification.
#     Spec keywords get a priority boost in gap analysis.
#     Examples: "64gb", "140mbs", "v30", "uhsi", "c10", "sdxc", "uhs i"
#     """
#     tokens = kw.split()
#     # Single spec token
#     if len(tokens) == 1:
#         return _is_spec_token(tokens[0])
#     # Multi-token phrase where at least one is a spec
#     return any(_is_spec_token(t) for t in tokens)


# def _priority_label(
#     freq: int,
#     total_comps: int,
#     kw: str,
# ) -> str:
#     """
#     Priority based on competitor coverage + spec bonus.
#     Spec terms (like "64gb", "v30") are auto-elevated one tier.
#     """
#     if total_comps == 0:
#         return "Low"
#     ratio = freq / total_comps
#     if ratio >= 0.50:
#         base = "High"
#     elif ratio >= 0.20:
#         base = "Medium"
#     else:
#         base = "Low"

#     # Spec bonus: elevate by one tier
#     if _is_spec_keyword(kw):
#         if base == "Low":
#             base = "Medium"
#         elif base == "Medium":
#             base = "High"

#     return base


# def _build_keyword_gap(
#     your_title:        str,
#     competitor_titles: list[str],
#     review_texts:      Optional[list[str]] = None,
#     min_comp_freq:     int = _MIN_COMP_FREQ_BASIC,
# ) -> dict[str, Any]:
#     """
#     Core gap computation engine.

#     Returns a rich dict covering:
#       your_keywords       : all n-grams from your title
#       gap_keywords        : in competitors, NOT in your title, sorted by freq
#       shared_keywords     : in both your title and competitors
#       unique_keywords     : ONLY in your title (differentiators)
#       review_keywords     : high-signal terms from customer review text
#       coverage_score      : % of top-40 competitor kws you already cover
#       heatmap             : top-50 competitor kws with your coverage flag
#     """
#     # Decode HTML entities before any processing
#     your_title_clean = _decode_html(your_title)
#     comp_titles_clean = [_decode_html(t) for t in competitor_titles]

#     your_kw_set  = _keyword_set(your_title_clean)
#     your_tokens  = set(_tokenise(your_title_clean))
#     n_comps      = len(comp_titles_clean)

#     # Count how many competitor titles each keyword appears in
#     comp_kw_freq: Counter = Counter()
#     for title in comp_titles_clean:
#         for kw in _keyword_set(title):
#             comp_kw_freq[kw] += 1

#     # ── Gap keywords ──────────────────────────────────────────────────────
#     raw_gap: list[dict] = []
#     for kw, freq in comp_kw_freq.items():
#         if freq < min_comp_freq:
#             continue
#         if kw in your_kw_set:
#             continue
#         # Partial match: all constituent words exist in your title but in
#         # a different arrangement or split across n-gram boundaries
#         kw_tokens = set(kw.split())
#         is_partial = kw_tokens <= your_tokens

#         raw_gap.append({
#             "keyword":    kw,
#             "comp_freq":  freq,
#             "is_partial": is_partial,
#             "is_bigram":  " " in kw,
#             "is_spec":    _is_spec_keyword(kw),
#             "priority":   _priority_label(freq, n_comps, kw),
#         })

#     # Sort: High priority first, then by freq, then alphabetical
#     priority_order = {"High": 0, "Medium": 1, "Low": 2}
#     raw_gap.sort(key=lambda x: (priority_order[x["priority"]], -x["comp_freq"], x["keyword"]))

#     # Suppress sub-phrases of higher-ranked n-grams to reduce noise
#     gap_kw_strings = [g["keyword"] for g in raw_gap]
#     non_redundant  = set(_suppress_subphrases(gap_kw_strings))
#     gap_keywords   = [g for g in raw_gap if g["keyword"] in non_redundant]

#     # ── Shared keywords ───────────────────────────────────────────────────
#     shared_raw = [
#         {"keyword": kw, "comp_freq": comp_kw_freq.get(kw, 0), "is_spec": _is_spec_keyword(kw)}
#         for kw in your_kw_set
#         if comp_kw_freq.get(kw, 0) >= min_comp_freq
#     ]
#     shared_raw.sort(key=lambda x: -x["comp_freq"])
#     shared_strings  = [s["keyword"] for s in shared_raw]
#     non_red_shared  = set(_suppress_subphrases(shared_strings))
#     shared_keywords = [s for s in shared_raw if s["keyword"] in non_red_shared]

#     # ── Unique keywords (only in your title) ──────────────────────────────
#     unique_all = [kw for kw in your_kw_set if comp_kw_freq.get(kw, 0) == 0]
#     unique_keywords = _suppress_subphrases(sorted(unique_all))

#     # ── Coverage score ────────────────────────────────────────────────────
#     # % of the top-40 competitor keywords that are in your title
#     top40 = [kw for kw, _ in comp_kw_freq.most_common(40)]
#     covered     = sum(1 for kw in top40 if kw in your_kw_set)
#     coverage    = round(covered / max(len(top40), 1) * 100, 1)

#     # ── Heatmap (top-50 by competitor frequency) ──────────────────────────
#     heatmap: list[dict] = []
#     for kw, freq in comp_kw_freq.most_common(50):
#         if freq < 1:
#             continue
#         heatmap.append({
#             "keyword":   kw,
#             "freq":      freq,
#             "in_yours":  kw in your_kw_set,
#             "is_bigram": " " in kw,
#             "is_spec":   _is_spec_keyword(kw),
#         })

#     # ── Review keyword mining ─────────────────────────────────────────────
#     review_keywords: list[dict] = []
#     if review_texts:
#         review_freq: Counter = Counter()
#         for text in review_texts:
#             clean = _decode_html(text)
#             for kw in _extract_all_ngrams(clean):
#                 review_freq[kw] += 1

#         for kw, freq in review_freq.most_common(80):
#             if freq < 2:
#                 continue
#             if kw in your_kw_set:
#                 continue
#             comp_count = comp_kw_freq.get(kw, 0)
#             review_keywords.append({
#                 "keyword":        kw,
#                 "review_freq":    freq,
#                 "in_competitors": comp_count,
#                 "is_spec":        _is_spec_keyword(kw),
#                 "priority":       (
#                     "High"   if comp_count >= 3 else
#                     "Medium" if comp_count >= 1 or _is_spec_keyword(kw) else
#                     "Low"
#                 ),
#             })
#         review_keywords = review_keywords[:25]

#     return {
#         "your_keywords":       sorted(your_kw_set),
#         "your_keyword_count":  len(your_kw_set),
#         "competitor_kw_count": len(comp_kw_freq),
#         "gap_keywords":        gap_keywords[:60],
#         "shared_keywords":     shared_keywords[:35],
#         "unique_keywords":     unique_keywords[:25],
#         "review_keywords":     review_keywords,
#         "coverage_score":      coverage,
#         "heatmap":             heatmap,
#         "gap_count":           len(gap_keywords),
#     }


# # ─────────────────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT  –  /keyword-gap/analyse
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/analyse")
# def keyword_gap_analyse(
#     asin:       str           = Query(...,  description="Amazon ASIN"),
#     seller_id:  str           = Query(...,  description="Seller ID"),
#     user_email: Optional[str] = Query(None, description="User email for tier lookup"),
#     db:         Session       = Depends(get_db),
# ) -> dict:
#     """
#     Full keyword gap analysis, tiered by subscription.

#     free    → title keywords, total gap count teaser
#     basic   → + full gap/shared/unique sets, heatmap, coverage score,
#                 competitor breakdown, data quality indicator
#     premium → + review keyword mining, AI opportunity scores,
#                 AI listing rewrite, prioritised action plan
#     """
#     tier       = _get_user_tier(db, user_email) if user_email else "free"
#     is_basic   = tier in ("basic", "premium")
#     is_premium = tier == "premium"

#     # ── Load tracked product ──────────────────────────────────────────────
#     tracked = (
#         db.query(TrackedProduct)
#         .filter(
#             TrackedProduct.asin      == asin,
#             TrackedProduct.seller_id == seller_id,
#             TrackedProduct.user_email == current_user.email,
#         )
#         .first()
#     )
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     your_title = _decode_html(tracked.product_title or "")
#     currency   = (tracked.currency or "USD").upper().strip()
#     your_kws   = sorted(_keyword_set(your_title))

#     result: dict[str, Any] = {
#         "tier":             tier,
#         "asin":             asin,
#         "currency":         currency,
#         "data_quality":     "live",
#         "product_title":    your_title,
#         "product_photo":    tracked.product_photo,
#         "is_prime":         bool(tracked.is_prime),
#         "is_best_seller":   bool(tracked.is_best_seller),
#         # Free
#         "your_keywords":      your_kws,
#         "your_keyword_count": len(your_kws),
#         "gap_count_teaser":   None,
#         # Basic+
#         "coverage_score":       None,
#         "gap_keywords":         None,
#         "shared_keywords":      None,
#         "unique_keywords":      None,
#         "heatmap":              None,
#         "competitor_count":     None,
#         "competitors_analysed": None,
#         # Premium
#         "review_keywords":       None,
#         "ai_opportunity_scores": None,
#         "ai_listing_rewrite":    None,
#         "ai_action_plan":        None,
#     }

#     # ── Competitor discovery (used by all tiers for teaser) ───────────────
#     competitors  = _get_competitor_titles(db, tracked, currency, limit=40)
#     comp_titles  = [c["title"] for c in competitors if c.get("title")]

#     # Cheap teaser gap count (free tier)
#     if comp_titles:
#         your_kw_set = _keyword_set(your_title)
#         all_comp_kw: set[str] = set()
#         for t in comp_titles:
#             for kw in _keyword_set(t):
#                 all_comp_kw.add(kw)
#         result["gap_count_teaser"] = len(all_comp_kw - your_kw_set)
#     else:
#         result["gap_count_teaser"] = 0
#         result["data_quality"]     = "insufficient"

#     # ── Basic enrichment ──────────────────────────────────────────────────
#     if is_basic and comp_titles:
#         gap_data = _build_keyword_gap(
#             your_title,
#             comp_titles,
#             min_comp_freq=_MIN_COMP_FREQ_BASIC,
#         )
#         result["coverage_score"]   = gap_data["coverage_score"]
#         result["gap_keywords"]     = gap_data["gap_keywords"]
#         result["shared_keywords"]  = gap_data["shared_keywords"]
#         result["unique_keywords"]  = gap_data["unique_keywords"]
#         result["heatmap"]          = gap_data["heatmap"]
#         result["gap_count_teaser"] = gap_data["gap_count"]
#         result["competitor_count"] = len(comp_titles)
#         result["data_quality"]     = "live" if len(comp_titles) >= 5 else "limited"
#         result["competitors_analysed"] = [
#             {
#                 "asin":        c["asin"],
#                 "title":       _truncate(c["title"], 75),
#                 "similarity":  c["similarity"],
#                 "star_rating": c["star_rating"],
#                 "num_ratings": c["num_ratings"],
#                 "is_prime":    c["is_prime"],
#                 "photo":       c["photo"],
#                 "source":      c["source"],
#                 "price":       c["price"],
#             }
#             for c in competitors[:12]
#         ]

#     elif is_basic and not comp_titles:
#         result["data_quality"] = "insufficient"

#     # ── Premium enrichment ────────────────────────────────────────────────
#     if is_premium:
#         # Review keyword mining
#         comments    = _parse_json_field(tracked.review_comments)
#         clean_comms = [
#             _decode_html(c) for c in comments
#             if isinstance(c, str) and len(c.strip()) > 15
#         ]

#         if clean_comms and comp_titles:
#             full_gap_data = _build_keyword_gap(
#                 your_title,
#                 comp_titles,
#                 review_texts=clean_comms,
#                 min_comp_freq=_MIN_COMP_FREQ_PREMIUM,
#             )
#             result["review_keywords"] = full_gap_data["review_keywords"]
#         else:
#             result["review_keywords"] = []

#         gap_kws   = result.get("gap_keywords") or []
#         high_gaps = [g for g in gap_kws if g["priority"] == "High"][:12]
#         med_gaps  = [g for g in gap_kws if g["priority"] == "Medium"][:8]
#         top_gaps  = (high_gaps + med_gaps)[:14]
#         rev_kws   = result.get("review_keywords") or []
#         top_rev   = [r for r in rev_kws if r["priority"] == "High"][:5]

#         # ── AI Opportunity Scores ─────────────────────────────────────────
#         if top_gaps:
#             gap_list = ", ".join(
#                 f'"{g["keyword"]}" (in {g["comp_freq"]} of {len(comp_titles)} competitors'
#                 + (" — spec term" if g.get("is_spec") else "") + ")"
#                 for g in top_gaps
#             )
#             opp_prompt = (
#                 f"You are an Amazon listing SEO expert. "
#                 f"Product: \"{_truncate(your_title, 100)}\". "
#                 f"These keywords are used by competitors but missing from this listing: {gap_list}. "
#                 f"For each keyword score its opportunity 1-10 where 10 = critical to add. "
#                 f"Consider: how many competitors use it, whether it's a spec/feature term, "
#                 f"relevance to this exact product. "
#                 f"Return ONLY a JSON array, no preamble, no markdown fences: "
#                 f'[{{"keyword":"...","score":8,"reason":"..."}}]'
#             )
#             opp_text = _ollama(opp_prompt, max_tokens=500)

#             opp_scores: list[dict] = []
#             if opp_text:
#                 clean_json = re.sub(r"```[a-z]*\n?", "", opp_text).replace("```", "").strip()
#                 # Extract JSON array even if model adds preamble text
#                 match = re.search(r"\[.*\]", clean_json, re.DOTALL)
#                 if match:
#                     clean_json = match.group(0)
#                 try:
#                     parsed = json.loads(clean_json)
#                     if isinstance(parsed, list):
#                         opp_scores = [
#                             {
#                                 "keyword": str(item.get("keyword", "")),
#                                 "score":   min(max(int(float(item.get("score", 5))), 1), 10),
#                                 "reason":  str(item.get("reason", "")),
#                                 "is_spec": _is_spec_keyword(str(item.get("keyword", ""))),
#                             }
#                             for item in parsed
#                             if isinstance(item, dict) and item.get("keyword")
#                         ]
#                 except (json.JSONDecodeError, ValueError, TypeError) as exc:
#                     logger.debug("Opportunity score parse failed: %s", exc)

#             # Deterministic fallback: score by frequency + spec status
#             if not opp_scores:
#                 opp_scores = [
#                     {
#                         "keyword": g["keyword"],
#                         "score":   min(
#                             int(g["comp_freq"] / max(len(comp_titles), 1) * 10)
#                             + (2 if g.get("is_spec") else 0),
#                             10,
#                         ),
#                         "reason":  (
#                             f"Used by {g['comp_freq']}/{len(comp_titles)} competitors"
#                             + (" — specification term" if g.get("is_spec") else "")
#                         ),
#                         "is_spec": g.get("is_spec", False),
#                     }
#                     for g in top_gaps
#                 ]

#             result["ai_opportunity_scores"] = sorted(opp_scores, key=lambda x: -x["score"])

#         # ── AI Listing Rewrite ────────────────────────────────────────────
#         if top_gaps:
#             insert_kws  = ", ".join(f'"{g["keyword"]}"' for g in top_gaps[:10])
#             rev_signal  = (
#                 ". Customer voice keywords: " + ", ".join(f'"{r["keyword"]}"' for r in top_rev)
#                 if top_rev else ""
#             )
#             rewrite_prompt = (
#                 f"You are an expert Amazon listing copywriter. "
#                 f"Current title: \"{your_title}\". "
#                 f"Keywords to incorporate (competitors use these, you don't): {insert_kws}{rev_signal}. "
#                 f"Rewrite the product title to naturally include as many of these keywords as possible. "
#                 f"Requirements: under 200 characters, readable to humans, no keyword stuffing, "
#                 f"keep the brand name and core product identity. "
#                 f"Return ONLY the rewritten title. No explanation."
#             )
#             rewrite_text = _ollama(rewrite_prompt, max_tokens=150)
#             if rewrite_text and len(rewrite_text.strip()) > 20:
#                 # Strip quotes the model sometimes wraps around the output
#                 cleaned = rewrite_text.strip().strip('"').strip("'").strip()
#                 if cleaned and cleaned.lower() != your_title.lower():
#                     result["ai_listing_rewrite"] = cleaned[:250]

#         # ── AI Action Plan ────────────────────────────────────────────────
#         shared_kws  = result.get("shared_keywords") or []
#         unique_kws  = result.get("unique_keywords") or []
#         cov_score   = result.get("coverage_score") or 0.0

#         plan_prompt = (
#             f"You are an Amazon listing optimisation consultant. "
#             f"Product: \"{_truncate(your_title, 100)}\". "
#             f"Keyword coverage score: {cov_score}/100. "
#             f"High-priority missing keywords: {', '.join(g['keyword'] for g in high_gaps[:6])}. "
#             f"Shared with competitors: {', '.join(s['keyword'] for s in shared_kws[:5])}. "
#             f"Your unique differentiators: {', '.join(unique_kws[:4])}. "
#             + (f"Customer review signals: {', '.join(r['keyword'] for r in top_rev[:4])}. " if top_rev else "")
#             + "Write exactly 3 numbered, specific, actionable steps to improve keyword coverage. "
#             "Each step must mention actual keywords from the data. Be direct. No fluff."
#         )
#         plan_text = _ollama(plan_prompt, max_tokens=300)

#         if plan_text:
#             # Parse "1. ...\n2. ...\n3. ..." into list
#             steps = re.split(r"\n?\s*\d+[\.\)]\s+", plan_text.strip())
#             steps = [s.strip() for s in steps if len(s.strip()) > 15]
#             result["ai_action_plan"] = steps[:4] if steps else [plan_text.strip()]
#         else:
#             # Deterministic fallback
#             fallback: list[str] = []
#             if high_gaps:
#                 top_h = [g["keyword"] for g in high_gaps[:5]]
#                 fallback.append(
#                     f"Add these high-priority keywords to your title or bullet points: "
#                     + ", ".join(f'"{k}"' for k in top_h)
#                     + f". Each appears in {high_gaps[0]['comp_freq']}+ competitor titles."
#                 )
#             if cov_score < 55:
#                 fallback.append(
#                     f"Your coverage score is {cov_score}/100. Use Amazon Seller Central's "
#                     "'Search Terms' backend field (250 chars) to capture all gap keywords "
#                     "that don't fit the title."
#                 )
#             if unique_kws:
#                 fallback.append(
#                     f"Protect your differentiators: "
#                     + ", ".join(f'"{k}"' for k in unique_kws[:4])
#                     + ". These are unique to your listing — keep them prominent."
#                 )
#             if not fallback:
#                 fallback.append(
#                     "Your keyword coverage is excellent. Monitor competitor titles weekly "
#                     "and refresh backend search terms with any newly emerging terms."
#                 )
#             result["ai_action_plan"] = fallback

#     return result


# # ─────────────────────────────────────────────────────────────────────────────
# # SECONDARY ENDPOINT  –  /keyword-gap/competitors
# # ─────────────────────────────────────────────────────────────────────────────

# @router.get("/competitors")
# def get_keyword_competitors(
#     asin:       str           = Query(...),
#     seller_id:  str           = Query(...),
#     user_email: Optional[str] = Query(None),
#     db:         Session       = Depends(get_db),
# ) -> dict:
#     """
#     Returns the top similar competitor products for the frontend competitor picker.
#     """
#     tier = _get_user_tier(db, user_email) if user_email else "free"

#     tracked = (
#         db.query(TrackedProduct)
#         .filter(
#             TrackedProduct.asin      == asin,
#             TrackedProduct.seller_id == seller_id,
#             TrackedProduct.user_email == current_user.email,
#         )
#         .first()
#     )
#     if not tracked:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     currency    = (tracked.currency or "USD").upper().strip()
#     competitors = _get_competitor_titles(db, tracked, currency, limit=20)

#     return {"asin": asin, "tier": tier, "competitors": competitors}


"""
keyword_gap_router.py  –  Production-grade Keyword Gap Analysis API  v2
------------------------------------------------------------------------
Major upgrades vs v1:
  • Sentence Transformer embeddings (all-MiniLM-L6-v2) replace
    Jaccard + SequenceMatcher for competitor similarity — catches
    semantic equivalents like "memory card" ≈ "storage card"
  • Vector-based keyword gap scoring: each gap keyword is scored by its
    embedding similarity to YOUR title (finds semantically close misses)
  • Semantic keyword clustering: gap keywords are grouped into topic
    clusters (e.g. "Speed & Performance", "Capacity", "Compatibility")
    so the AI action plan is cluster-aware, not just frequency-ranked
  • Smarter Ollama prompting:
    – Chain-of-thought reasoning step before scoring
    – Structured JSON schema enforced in system prompt
    – Richer context: competitor count, coverage score, spec detection
    – Fallback chain: JSON → regex extraction → deterministic
  • Embedding cache: title vectors are memoised per-request to avoid
    redundant encode() calls on the same string
  • _SentenceEmbedder singleton: model loaded once, reused across requests
    (lazy-loaded on first call so app startup stays fast)

Tier matrix (unchanged):
  free    : your title keywords + gap count teaser
  basic   : + full gap/shared/unique sets, coverage score, heatmap,
              competitor title list, price-range context, semantic similarity
  premium : + review keyword mining, AI opportunity scores (Ollama),
              AI listing rewrite, prioritised cluster-aware action plan,
              semantic gap clusters
"""

from __future__ import annotations

import html
import json
import logging
import re
import threading
from collections import Counter, defaultdict
from typing import Any, Optional

import httpx
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.legacy_models import (
    RapidapiAmazonProducts,
    TrackedProduct,
    User,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/keyword-gap", tags=["Keyword Gap"])

# ── Ollama ─────────────────────────────────────────────────────────────────────
OLLAMA_URL     = "http://localhost:11434/api/generate"
OLLAMA_MODEL   = "llama3.2:3b"
OLLAMA_TIMEOUT = 45.0   # slightly higher — we now use chain-of-thought

# ── Sentence Transformer ───────────────────────────────────────────────────────
_ST_MODEL_NAME = "all-MiniLM-L6-v2"   # 22 MB, fast, good semantic quality

# Similarity thresholds
_MIN_SIMILARITY_SEMANTIC = 0.30   # cosine similarity for competitor matching
_CLUSTER_MERGE_THRESHOLD = 0.55   # gap keywords with this cosine sim → same cluster

# ── Extraction config ──────────────────────────────────────────────────────────
_MIN_KW_LEN = 3

_SPEC_ALLOWLIST: set[str] = {
    "4k", "u1", "u3", "v10", "v30", "v60", "v90", "c10",
    "uhs", "uhsi", "uhsii", "a1", "a2",
    "hd", "sd", "gb", "tb", "mb", "hz",
    "ip", "usb", "5g",
}

_STOP_WORDS: set[str] = {
    "the", "a", "an", "and", "or", "for", "with", "in", "of", "to", "by",
    "from", "on", "at", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "not", "no", "nor", "so",
    "yet", "both", "either", "neither", "whether", "this", "that", "these",
    "those", "its", "it", "our", "your", "their", "my", "his", "her",
    "buy", "get", "use", "used", "using",
    "great", "good", "best", "nice", "perfect",
    "works", "product", "item", "amazon",
    "shipping", "fast", "delivery", "price", "value", "quality",
    "highly", "recommend", "love", "like", "really", "very",
    "also", "just", "only", "one", "two", "three", "four", "five",
    "six", "seven", "eight", "nine", "ten",
    "1st", "2nd", "3rd", "vs", "per", "each", "all", "any",
    "bought", "received", "arrived", "came", "looked", "seemed",
    "ordered", "delivered", "packaging", "packaged",
    "would", "could", "didn", "doesn", "wasn", "aren",
}

_MAX_NGRAM             = 3
_MIN_COMP_FREQ_BASIC   = 2
_MIN_COMP_FREQ_PREMIUM = 1
_USD_PRICE_CEILING     = 500.0
_INR_PRICE_FLOOR       = 10.0


# ─────────────────────────────────────────────────────────────────────────────
# SENTENCE TRANSFORMER SINGLETON  (thread-safe lazy load)
# ─────────────────────────────────────────────────────────────────────────────

class _SentenceEmbedder:
    """
    Lazy singleton wrapper around sentence_transformers.SentenceTransformer.
    Model is loaded once on first use; subsequent calls reuse the same instance.
    Thread-safe via a lock.
    """
    _instance: Optional["_SentenceEmbedder"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        try:
            from sentence_transformers import SentenceTransformer  # type: ignore
            self._model = SentenceTransformer(_ST_MODEL_NAME)
            self._available = True
            logger.info("SentenceTransformer '%s' loaded.", _ST_MODEL_NAME)
        except Exception as exc:
            self._model    = None
            self._available = False
            logger.warning(
                "sentence_transformers not available — falling back to Jaccard. "
                "Install with: pip install sentence-transformers  (%s)", exc
            )

    @classmethod
    def get(cls) -> "_SentenceEmbedder":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @property
    def available(self) -> bool:
        return self._available

    def encode(self, texts: list[str]) -> np.ndarray:
        """
        Encode a batch of texts → float32 array [N, D], L2-normalised.
        Falls back to zero vectors if model unavailable.
        """
        if not self._available or not texts:
            return np.zeros((len(texts), 384), dtype=np.float32)
        # Convert titles to short representation for speed (first 128 chars)
        trimmed = [t[:128] for t in texts]
        vecs = self._model.encode(
            trimmed,
            convert_to_numpy=True,
            normalize_embeddings=True,   # L2 norm → cosine = dot product
            show_progress_bar=False,
            batch_size=64,
        )
        return vecs.astype(np.float32)

    def similarity(self, a: str, b: str) -> float:
        """Cosine similarity between two strings, [0, 1]."""
        if not self._available:
            return _jaccard_similarity(a, b)
        vecs = self.encode([a, b])
        # Already L2-normalised, so cosine = dot
        score = float(np.dot(vecs[0], vecs[1]))
        return max(0.0, min(1.0, score))   # clamp to [0,1]


def _cosine_matrix(a_vecs: np.ndarray, b_vecs: np.ndarray) -> np.ndarray:
    """Batched cosine similarity. Both must be L2-normalised. Returns [N, M]."""
    return np.dot(a_vecs, b_vecs.T)


# ─────────────────────────────────────────────────────────────────────────────
# MODULE-LEVEL PROXY
# ─────────────────────────────────────────────────────────────────────────────

class _TrackedProxy:
    __slots__ = (
        "asin", "product_title", "product_photo",
        "product_price", "product_price_numeric",
        "product_original_price", "product_original_price_numeric",
        "product_star_rating", "product_star_rating_numeric",
        "product_num_ratings", "is_best_seller", "is_amazon_choice",
        "is_prime", "sales_volume", "country", "category_name",
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
        self.category_name                  = None


# ─────────────────────────────────────────────────────────────────────────────
# PURE HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _decode_html(text: str) -> str:
    if not text:
        return ""
    return html.unescape(text)


def _parse_json_field(field: Any) -> list:
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
    if p is None or str(p).strip() == "":
        return None
    try:
        cleaned = (
            str(p)
            .replace("$", "").replace("₹", "").replace("£", "")
            .replace("€", "").replace(",", "").strip()
        )
        v = float(cleaned)
        return v if v > 0 else None
    except (ValueError, TypeError):
        return None


def _truncate(s: Optional[str], n: int) -> str:
    if not s:
        return ""
    return s[:n] + ("…" if len(s) > n else "")


def _is_spec_token(token: str) -> bool:
    if token in _SPEC_ALLOWLIST:
        return True
    has_digit = any(c.isdigit() for c in token)
    has_alpha  = any(c.isalpha() for c in token)
    return has_digit and has_alpha


def _get_user_tier(db: Session, user_email: str) -> str:
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if user and user.subscription_tier:
            return user.subscription_tier.lower().strip()
    except Exception as exc:
        logger.warning("_get_user_tier failed for %s: %s", user_email, exc)
    return "free"


# ─────────────────────────────────────────────────────────────────────────────
# KEYWORD EXTRACTION PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def _tokenise(text: str) -> list[str]:
    if not text:
        return []
    clean = _decode_html(text).lower()
    clean = re.sub(r"[^a-z0-9]+", " ", clean)
    tokens = clean.split()
    result: list[str] = []
    for t in tokens:
        if t in _STOP_WORDS:
            continue
        if len(t) < _MIN_KW_LEN and t not in _SPEC_ALLOWLIST and not _is_spec_token(t):
            continue
        result.append(t)
    return result


def _ngrams_from_tokens(tokens: list[str], n: int) -> list[str]:
    return [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]


def _extract_all_ngrams(text: str) -> list[str]:
    tokens = _tokenise(text)
    grams: list[str] = []
    for n in range(_MAX_NGRAM, 0, -1):
        grams.extend(_ngrams_from_tokens(tokens, n))
    seen:   set[str]  = set()
    result: list[str] = []
    for g in grams:
        if g not in seen:
            seen.add(g)
            result.append(g)
    return result


def _keyword_set(text: str) -> set[str]:
    return set(_extract_all_ngrams(text))


def _suppress_subphrases(keywords: list[str]) -> list[str]:
    result: list[str] = []
    kw_set = set(keywords)
    for kw in keywords:
        dominated = any(
            other != kw and kw in other and " " in other
            for other in kw_set
        )
        if not dominated:
            result.append(kw)
    return result


def _jaccard_similarity(t1: str, t2: str) -> float:
    """Fallback when sentence_transformers is unavailable."""
    k1 = set(_tokenise(t1))
    k2 = set(_tokenise(t2))
    if not k1 or not k2:
        return 0.0
    union = k1 | k2
    return round(len(k1 & k2) / len(union), 4) if union else 0.0


# ─────────────────────────────────────────────────────────────────────────────
# SEMANTIC SIMILARITY  (replaces the old Jaccard+SequenceMatcher blend)
# ─────────────────────────────────────────────────────────────────────────────

def _semantic_similarity(t1: str, t2: str) -> float:
    """
    Primary similarity function.
    Uses sentence-transformer cosine similarity when available,
    falls back to Jaccard automatically.
    """
    embedder = _SentenceEmbedder.get()
    return embedder.similarity(t1, t2)


def _batch_semantic_similarity(
    query: str,
    candidates: list[str],
) -> list[float]:
    """
    Compute cosine similarity between one query and many candidates in one shot.
    Much faster than N individual encode() calls.
    """
    if not candidates:
        return []
    embedder = _SentenceEmbedder.get()
    if not embedder.available:
        return [_jaccard_similarity(query, c) for c in candidates]

    all_texts = [query] + candidates
    vecs      = embedder.encode(all_texts)
    q_vec     = vecs[0:1]           # [1, D]
    c_vecs    = vecs[1:]            # [N, D]
    sims      = _cosine_matrix(q_vec, c_vecs)[0]   # [N]
    return [max(0.0, float(s)) for s in sims]


def _ollama(
    prompt:     str,
    max_tokens: int  = 400,
    system:     str  = "",
) -> str:
    """
    Call Ollama with an optional system prompt.
    Returns "" on any failure — never raises.
    """
    body: dict[str, Any] = {
        "model":   OLLAMA_MODEL,
        "prompt":  prompt,
        "stream":  False,
        "options": {"num_predict": max_tokens, "temperature": 0.25},
    }
    if system:
        body["system"] = system
    try:
        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            resp = client.post(OLLAMA_URL, json=body)
            resp.raise_for_status()
            return resp.json().get("response", "").strip()
    except Exception as exc:
        logger.debug("Ollama call failed: %s", exc)
        return ""


def _extract_json_array(text: str) -> list:
    """
    Robustly extract a JSON array from model output that may contain
    markdown fences, preamble text, or partial JSON.
    """
    if not text:
        return []
    # Strip markdown code fences
    clean = re.sub(r"```[a-z]*\n?", "", text).replace("```", "").strip()
    # Try direct parse first
    try:
        parsed = json.loads(clean)
        if isinstance(parsed, list):
            return parsed
    except (json.JSONDecodeError, ValueError):
        pass
    # Find the outermost [...] block
    match = re.search(r"\[.*?\]", clean, re.DOTALL)
    if match:
        try:
            parsed = json.loads(match.group(0))
            if isinstance(parsed, list):
                return parsed
        except (json.JSONDecodeError, ValueError):
            pass
    return []


# ─────────────────────────────────────────────────────────────────────────────
# SEMANTIC KEYWORD CLUSTERING
# ─────────────────────────────────────────────────────────────────────────────

_CLUSTER_LABELS = {
    # Seed phrases that define each cluster's semantic centre
    "Speed & Performance":   "read write speed transfer rate performance fast",
    "Storage Capacity":      "storage capacity gigabyte terabyte memory size",
    "Compatibility":         "compatible works device camera drone phone laptop",
    "Durability & Build":    "waterproof shockproof temperature proof rugged durable",
    "Format & Standard":     "format sdxc sdhc microsd class standard card type",
    "Brand & Certification": "brand certified genuine official warranty original",
    "Use Case":              "photography video recording gaming surveillance action",
}


def _build_cluster_centres() -> Optional[np.ndarray]:
    """
    Pre-encode cluster seed phrases once per process.
    Returns [C, D] matrix of cluster centre vectors, or None if unavailable.
    """
    embedder = _SentenceEmbedder.get()
    if not embedder.available:
        return None
    seeds = list(_CLUSTER_LABELS.values())
    return embedder.encode(seeds)           # [C, D]


# Lazily computed once
_CLUSTER_CENTRES: Optional[np.ndarray] = None
_CLUSTER_NAMES   = list(_CLUSTER_LABELS.keys())
_CLUSTER_LOCK    = threading.Lock()


def _get_cluster_centres() -> Optional[np.ndarray]:
    global _CLUSTER_CENTRES
    if _CLUSTER_CENTRES is None:
        with _CLUSTER_LOCK:
            if _CLUSTER_CENTRES is None:
                _CLUSTER_CENTRES = _build_cluster_centres()
    return _CLUSTER_CENTRES


def _cluster_keywords(keywords: list[str]) -> dict[str, list[str]]:
    """
    Assign each keyword to the nearest cluster using cosine similarity.
    Returns dict: cluster_name → [keyword, ...].
    Falls back to a single "Gap Keywords" bucket if embeddings unavailable.
    """
    centres = _get_cluster_centres()
    if centres is None or not keywords:
        return {"Gap Keywords": keywords}

    embedder = _SentenceEmbedder.get()
    kw_vecs  = embedder.encode(keywords)            # [K, D]
    sims     = _cosine_matrix(kw_vecs, centres)     # [K, C]
    assignments = np.argmax(sims, axis=1)           # [K]
    max_sims    = np.max(sims, axis=1)              # [K]

    clusters: dict[str, list[str]] = defaultdict(list)
    for kw, cluster_idx, best_sim in zip(keywords, assignments, max_sims):
        if best_sim < 0.10:
            clusters["Other"].append(kw)
        else:
            clusters[_CLUSTER_NAMES[int(cluster_idx)]].append(kw)
    return dict(clusters)


# ─────────────────────────────────────────────────────────────────────────────
# COMPETITOR DISCOVERY  (now uses batch semantic similarity)
# ─────────────────────────────────────────────────────────────────────────────

def _get_competitor_titles(
    db:       Session,
    tracked:  TrackedProduct,
    currency: str,
    limit:    int = 40,
) -> list[dict[str, Any]]:
    """
    Discover the most semantically relevant competitor products.

    Semantic upgrade:
    - All candidate titles are encoded in one batch → single model forward pass
    - Cosine similarity replaces Jaccard+SequenceMatcher
    - Minimum threshold raised (semantic is more precise than Jaccard)
    """
    current_price = _clean_price(tracked.product_price) or 0.0
    price_lo      = current_price * 0.30 if current_price else 0.0
    price_hi      = current_price * 1.70 if current_price else 999_999.0
    cur_prefix    = "₹" if currency == "INR" else "$"

    all_candidates: list[Any] = []
    seen_asins: set[str]      = set()

    # Source A: tracked_products (same currency)
    tracked_siblings = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.asin       != tracked.asin,
            TrackedProduct.currency   == currency,
            TrackedProduct.user_email == tracked.user_email,
            TrackedProduct.product_title.isnot(None),
        )
        .limit(500)
        .all()
    )
    for t in tracked_siblings:
        if t.asin not in seen_asins:
            seen_asins.add(t.asin)
            all_candidates.append(_TrackedProxy(t))

    # Source B: rapidapi same currency + price range
    base_q = db.query(RapidapiAmazonProducts).filter(
        RapidapiAmazonProducts.product_title.isnot(None),
        RapidapiAmazonProducts.asin.notin_(seen_asins),
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
        )
    for row in base_q.limit(200).all():
        if row.asin not in seen_asins:
            seen_asins.add(row.asin)
            all_candidates.append(row)

    # Source C: relax price filter
    if len(all_candidates) < 10:
        for row in (
            db.query(RapidapiAmazonProducts)
            .filter(
                RapidapiAmazonProducts.product_title.isnot(None),
                RapidapiAmazonProducts.product_price.like(f"{cur_prefix}%"),
                RapidapiAmazonProducts.asin.notin_(seen_asins),
            )
            .limit(200)
            .all()
        ):
            if row.asin not in seen_asins:
                seen_asins.add(row.asin)
                all_candidates.append(row)

    # Source D: absolute fallback
    if len(all_candidates) < 5:
        for row in (
            db.query(RapidapiAmazonProducts)
            .filter(
                RapidapiAmazonProducts.product_title.isnot(None),
                RapidapiAmazonProducts.asin.notin_(seen_asins),
            )
            .limit(100)
            .all()
        ):
            all_candidates.append(row)

    # ── Batch semantic similarity ─────────────────────────────────────────
    your_title     = _decode_html(tracked.product_title or "")
    cand_titles    = [_decode_html(r.product_title or "") for r in all_candidates]
    similarities   = _batch_semantic_similarity(your_title, cand_titles)

    scored: list[tuple[Any, float]] = [
        (row, sim)
        for row, sim in zip(all_candidates, similarities)
        if sim >= _MIN_SIMILARITY_SEMANTIC
    ]
    scored.sort(key=lambda x: x[1], reverse=True)

    return [
        {
            "asin":        row.asin,
            "title":       _decode_html(row.product_title or ""),
            "similarity":  round(sim, 4),
            "source":      "tracked" if isinstance(row, _TrackedProxy) else "rapidapi",
            "is_prime":    bool(row.is_prime),
            "star_rating": row.product_star_rating_numeric,
            "num_ratings": row.product_num_ratings,
            "sales_volume":row.sales_volume,
            "photo":       row.product_photo,
            "price":       row.product_price_numeric,
        }
        for row, sim in scored[:limit]
    ]


# ─────────────────────────────────────────────────────────────────────────────
# SEMANTIC GAP SCORING
# ─────────────────────────────────────────────────────────────────────────────

def _semantic_gap_scores(
    your_title: str,
    gap_keywords: list[str],
) -> dict[str, float]:
    """
    For each gap keyword, compute semantic similarity to YOUR title.
    A high score means "this keyword is semantically close to what you already
    describe — probably just phrased differently by competitors."
    A low score means "genuinely missing concept."
    Both signals are useful: high → easy to add, low → bigger content gap.

    Returns: {keyword: semantic_sim_to_your_title}
    """
    if not gap_keywords:
        return {}
    sims = _batch_semantic_similarity(your_title, gap_keywords)
    return {kw: round(s, 4) for kw, s in zip(gap_keywords, sims)}


# ─────────────────────────────────────────────────────────────────────────────
# PRIORITY SCORING
# ─────────────────────────────────────────────────────────────────────────────

def _is_spec_keyword(kw: str) -> bool:
    tokens = kw.split()
    if len(tokens) == 1:
        return _is_spec_token(tokens[0])
    return any(_is_spec_token(t) for t in tokens)


def _priority_label(
    freq:        int,
    total_comps: int,
    kw:          str,
    semantic_sim_to_your_title: float = 0.0,
) -> str:
    """
    Priority now incorporates:
    1. Competitor coverage ratio  (primary signal)
    2. Spec token bonus           (same as v1)
    3. Semantic distance bonus:   keywords SEMANTICALLY FAR from your title
       are more important to add (they represent a genuinely missing concept)
    """
    if total_comps == 0:
        return "Low"
    ratio = freq / total_comps
    if ratio >= 0.50:
        base = "High"
    elif ratio >= 0.20:
        base = "Medium"
    else:
        base = "Low"

    # Spec bonus
    if _is_spec_keyword(kw):
        base = "High" if base in ("Low", "Medium") else base

    # Semantic distance bonus: very low similarity = genuinely new concept
    if semantic_sim_to_your_title < 0.25 and base == "Low":
        base = "Medium"

    return base


# ─────────────────────────────────────────────────────────────────────────────
# CORE KEYWORD GAP ENGINE
# ─────────────────────────────────────────────────────────────────────────────

def _build_keyword_gap(
    your_title:        str,
    competitor_titles: list[str],
    review_texts:      Optional[list[str]] = None,
    min_comp_freq:     int = _MIN_COMP_FREQ_BASIC,
) -> dict[str, Any]:
    your_title_clean  = _decode_html(your_title)
    comp_titles_clean = [_decode_html(t) for t in competitor_titles]

    your_kw_set = _keyword_set(your_title_clean)
    your_tokens = set(_tokenise(your_title_clean))
    n_comps     = len(comp_titles_clean)

    comp_kw_freq: Counter = Counter()
    for title in comp_titles_clean:
        for kw in _keyword_set(title):
            comp_kw_freq[kw] += 1

    # ── Gap keywords ──────────────────────────────────────────────────────
    candidate_gaps = [
        kw for kw, freq in comp_kw_freq.items()
        if freq >= min_comp_freq and kw not in your_kw_set
    ]

    # Semantic gap scores (one batch call)
    sem_scores = _semantic_gap_scores(your_title_clean, candidate_gaps)

    raw_gap: list[dict] = []
    for kw in candidate_gaps:
        freq     = comp_kw_freq[kw]
        sem_sim  = sem_scores.get(kw, 0.0)
        kw_tokens = set(kw.split())
        raw_gap.append({
            "keyword":              kw,
            "comp_freq":            freq,
            "is_partial":           kw_tokens <= your_tokens,
            "is_bigram":            " " in kw,
            "is_spec":              _is_spec_keyword(kw),
            "semantic_sim_to_yours": sem_sim,
            "priority":             _priority_label(freq, n_comps, kw, sem_sim),
        })

    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    raw_gap.sort(key=lambda x: (
        priority_order[x["priority"]],
        -x["comp_freq"],
        x["semantic_sim_to_yours"],   # tie-break: lower sim = bigger gap
        x["keyword"],
    ))

    gap_kw_strings = [g["keyword"] for g in raw_gap]
    non_redundant  = set(_suppress_subphrases(gap_kw_strings))
    gap_keywords   = [g for g in raw_gap if g["keyword"] in non_redundant]

    # ── Shared keywords ───────────────────────────────────────────────────
    shared_raw = [
        {"keyword": kw, "comp_freq": comp_kw_freq.get(kw, 0), "is_spec": _is_spec_keyword(kw)}
        for kw in your_kw_set
        if comp_kw_freq.get(kw, 0) >= min_comp_freq
    ]
    shared_raw.sort(key=lambda x: -x["comp_freq"])
    non_red_shared  = set(_suppress_subphrases([s["keyword"] for s in shared_raw]))
    shared_keywords = [s for s in shared_raw if s["keyword"] in non_red_shared]

    # ── Unique keywords ───────────────────────────────────────────────────
    unique_all      = [kw for kw in your_kw_set if comp_kw_freq.get(kw, 0) == 0]
    unique_keywords = _suppress_subphrases(sorted(unique_all))

    # ── Coverage score ────────────────────────────────────────────────────
    top40   = [kw for kw, _ in comp_kw_freq.most_common(40)]
    covered  = sum(1 for kw in top40 if kw in your_kw_set)
    coverage = round(covered / max(len(top40), 1) * 100, 1)

    # ── Heatmap ───────────────────────────────────────────────────────────
    heatmap: list[dict] = []
    for kw, freq in comp_kw_freq.most_common(50):
        if freq < 1:
            continue
        heatmap.append({
            "keyword":   kw,
            "freq":      freq,
            "in_yours":  kw in your_kw_set,
            "is_bigram": " " in kw,
            "is_spec":   _is_spec_keyword(kw),
        })

    # ── Review keyword mining ─────────────────────────────────────────────
    review_keywords: list[dict] = []
    if review_texts:
        review_freq: Counter = Counter()
        for text in review_texts:
            clean = _decode_html(text)
            for kw in _extract_all_ngrams(clean):
                review_freq[kw] += 1
        for kw, freq in review_freq.most_common(80):
            if freq < 2:
                continue
            if kw in your_kw_set:
                continue
            comp_count = comp_kw_freq.get(kw, 0)
            review_keywords.append({
                "keyword":        kw,
                "review_freq":    freq,
                "in_competitors": comp_count,
                "is_spec":        _is_spec_keyword(kw),
                "priority": (
                    "High"   if comp_count >= 3 else
                    "Medium" if comp_count >= 1 or _is_spec_keyword(kw) else
                    "Low"
                ),
            })
        review_keywords = review_keywords[:25]

    # ── Semantic clusters (gap keywords only) ─────────────────────────────
    gap_kw_list  = [g["keyword"] for g in gap_keywords[:40]]
    gap_clusters = _cluster_keywords(gap_kw_list)

    return {
        "your_keywords":       sorted(your_kw_set),
        "your_keyword_count":  len(your_kw_set),
        "competitor_kw_count": len(comp_kw_freq),
        "gap_keywords":        gap_keywords[:60],
        "shared_keywords":     shared_keywords[:35],
        "unique_keywords":     unique_keywords[:25],
        "review_keywords":     review_keywords,
        "coverage_score":      coverage,
        "heatmap":             heatmap,
        "gap_count":           len(gap_keywords),
        "gap_clusters":        gap_clusters,          # NEW
    }


# ─────────────────────────────────────────────────────────────────────────────
# SMARTER AI PROMPTS
# ─────────────────────────────────────────────────────────────────────────────

_OPP_SYSTEM = """\
You are a senior Amazon SEO strategist with 10+ years of experience optimising
product listings. You specialise in keyword gap analysis — identifying which
competitor keywords will have the highest return on investment when added to a
listing. You are precise, data-driven, and concise. You ALWAYS respond ONLY
with valid JSON arrays and nothing else — no preamble, no markdown fences,
no explanation outside the JSON."""

_REWRITE_SYSTEM = """\
You are an expert Amazon listing copywriter. Your rewrites are always:
- Under 200 characters
- Human-readable and natural (no keyword stuffing)
- Front-loaded with the brand name and primary product type
- Rich with the most important missing keywords, integrated naturally
- Persuasive and benefit-oriented
You ONLY output the rewritten title — nothing else. No quotes, no explanation."""

_PLAN_SYSTEM = """\
You are an Amazon listing optimisation consultant. Your action plans are:
- Numbered 1, 2, 3 — exactly three steps
- Each step references ACTUAL keywords from the data provided
- Specific and immediately actionable (what to do, where, why)
- Prioritised by expected impact
You output ONLY the three numbered steps. No intro, no outro, no markdown."""


def _build_opportunity_prompt(
    your_title:  str,
    top_gaps:    list[dict],
    comp_count:  int,
    cov_score:   float,
    clusters:    dict[str, list[str]],
) -> str:
    """
    Chain-of-thought style prompt: ask the model to reason about each keyword
    BEFORE scoring, leading to more accurate scores.
    """
    gap_lines = "\n".join(
        f'  - "{g["keyword"]}" | competitors: {g["comp_freq"]}/{comp_count}'
        f' | spec_term: {g.get("is_spec", False)}'
        f' | semantic_sim_to_current_title: {g.get("semantic_sim_to_yours", 0):.2f}'
        for g in top_gaps
    )
    cluster_summary = "; ".join(
        f'{k}: {", ".join(v[:3])}{"…" if len(v) > 3 else ""}'
        for k, v in clusters.items()
        if v
    )
    return (
        f"PRODUCT TITLE: \"{_truncate(your_title, 120)}\"\n"
        f"CURRENT COVERAGE SCORE: {cov_score}/100\n"
        f"KEYWORD CLUSTERS MISSING: {cluster_summary}\n\n"
        f"MISSING KEYWORDS (not in current title but used by competitors):\n"
        f"{gap_lines}\n\n"
        f"TASK: For each keyword above, score its opportunity to add to this listing "
        f"on a scale of 1-10. Consider:\n"
        f"  • Competitor frequency ratio (higher = more important)\n"
        f"  • Whether it is a product specification/feature term (spec terms are critical)\n"
        f"  • Semantic similarity to current title: LOW similarity = NEW concept = higher value\n"
        f"  • Whether it fits naturally into an Amazon title or backend fields\n\n"
        f"Return ONLY a JSON array:\n"
        f'[{{"keyword":"...","score":8,"reason":"concise 1-sentence rationale","add_to":"title|backend|bullets"}}]'
    )


def _build_rewrite_prompt(
    your_title:  str,
    top_gaps:    list[dict],
    top_rev:     list[dict],
    clusters:    dict[str, list[str]],
) -> str:
    insert_kws   = ", ".join(f'"{g["keyword"]}"' for g in top_gaps[:10])
    rev_signal   = (
        "\nVOICE-OF-CUSTOMER KEYWORDS TO ALSO INCORPORATE: "
        + ", ".join(f'"{r["keyword"]}"' for r in top_rev)
        if top_rev else ""
    )
    cluster_hint = (
        "\nKEYWORD CLUSTERS TO COVER: " + "; ".join(
            f'{k} (e.g. {v[0]})' for k, v in clusters.items() if v
        )
    )
    return (
        f"CURRENT TITLE: \"{your_title}\"\n"
        f"HIGH-PRIORITY MISSING KEYWORDS: {insert_kws}"
        f"{rev_signal}"
        f"{cluster_hint}\n\n"
        f"Rewrite the title to naturally include as many missing keywords as possible. "
        f"Keep the brand name and core product type. Stay under 200 characters."
    )


def _build_plan_prompt(
    your_title:  str,
    high_gaps:   list[dict],
    shared_kws:  list[dict],
    unique_kws:  list[str],
    cov_score:   float,
    top_rev:     list[dict],
    clusters:    dict[str, list[str]],
    comp_count:  int,
) -> str:
    missing_clusters = [k for k, v in clusters.items() if v]
    return (
        f"PRODUCT: \"{_truncate(your_title, 100)}\"\n"
        f"COVERAGE SCORE: {cov_score}/100 (out of {comp_count} competitors)\n"
        f"HIGH-PRIORITY MISSING KEYWORDS: {', '.join(g['keyword'] for g in high_gaps[:6])}\n"
        f"MISSING KEYWORD CLUSTERS: {', '.join(missing_clusters)}\n"
        f"ALREADY SHARED WITH COMPETITORS: {', '.join(s['keyword'] for s in shared_kws[:5])}\n"
        f"YOUR UNIQUE DIFFERENTIATORS: {', '.join(unique_kws[:4])}\n"
        + (f"CUSTOMER REVIEW SIGNALS: {', '.join(r['keyword'] for r in top_rev[:4])}\n" if top_rev else "")
        + "\nWrite exactly 3 numbered actionable steps to improve this listing's keyword coverage. "
        "Each step must name specific keywords from the data above and say WHERE to place them "
        "(title / bullet points / backend search terms). Prioritise by impact."
    )


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ENDPOINT  –  /keyword-gap/analyse
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/analyse")
def keyword_gap_analyse(
    asin:       str           = Query(...,  description="Amazon ASIN"),
    seller_id:  str           = Query(...,  description="Seller ID"),
    db:         Session       = Depends(get_db),
    current_user: User        = Depends(get_current_user),
) -> dict:
    """
    Full keyword gap analysis, tiered by subscription.
    """
    tier       = current_user.subscription_tier.lower().strip() if current_user.subscription_tier else "free"
    is_basic   = tier in ("basic", "premium")
    is_premium = tier == "premium"

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

    your_title = _decode_html(tracked.product_title or "")
    currency   = (tracked.currency or "USD").upper().strip()
    your_kws   = sorted(_keyword_set(your_title))

    result: dict[str, Any] = {
        "tier":             tier,
        "asin":             asin,
        "currency":         currency,
        "data_quality":     "live",
        "embedding_model":  _ST_MODEL_NAME if _SentenceEmbedder.get().available else "jaccard_fallback",
        "product_title":    your_title,
        "product_photo":    tracked.product_photo,
        "is_prime":         bool(tracked.is_prime),
        "is_best_seller":   bool(tracked.is_best_seller),
        # Free
        "your_keywords":      your_kws,
        "your_keyword_count": len(your_kws),
        "gap_count_teaser":   None,
        # Basic+
        "coverage_score":       None,
        "gap_keywords":         None,
        "shared_keywords":      None,
        "unique_keywords":      None,
        "heatmap":              None,
        "gap_clusters":         None,
        "competitor_count":     None,
        "competitors_analysed": None,
        # Premium
        "review_keywords":       None,
        "ai_opportunity_scores": None,
        "ai_listing_rewrite":    None,
        "ai_action_plan":        None,
    }

    # ── Competitor discovery ──────────────────────────────────────────────
    competitors  = _get_competitor_titles(db, tracked, currency, limit=40)
    comp_titles  = [c["title"] for c in competitors if c.get("title")]

    # Cheap teaser gap count (free tier)
    if comp_titles:
        your_kw_set  = _keyword_set(your_title)
        all_comp_kw: set[str] = set()
        for t in comp_titles:
            for kw in _keyword_set(t):
                all_comp_kw.add(kw)
        result["gap_count_teaser"] = len(all_comp_kw - your_kw_set)
    else:
        result["gap_count_teaser"] = 0
        result["data_quality"]     = "insufficient"

    # ── Basic enrichment ──────────────────────────────────────────────────
    if is_basic and comp_titles:
        gap_data = _build_keyword_gap(
            your_title,
            comp_titles,
            min_comp_freq=_MIN_COMP_FREQ_BASIC,
        )
        result["coverage_score"]   = gap_data["coverage_score"]
        result["gap_keywords"]     = gap_data["gap_keywords"]
        result["shared_keywords"]  = gap_data["shared_keywords"]
        result["unique_keywords"]  = gap_data["unique_keywords"]
        result["heatmap"]          = gap_data["heatmap"]
        result["gap_clusters"]     = gap_data["gap_clusters"]        # NEW
        result["gap_count_teaser"] = gap_data["gap_count"]
        result["competitor_count"] = len(comp_titles)
        result["data_quality"]     = "live" if len(comp_titles) >= 5 else "limited"
        result["competitors_analysed"] = [
            {
                "asin":        c["asin"],
                "title":       _truncate(c["title"], 75),
                "similarity":  c["similarity"],
                "star_rating": c["star_rating"],
                "num_ratings": c["num_ratings"],
                "is_prime":    c["is_prime"],
                "photo":       c["photo"],
                "source":      c["source"],
                "price":       c["price"],
            }
            for c in competitors[:12]
        ]
    elif is_basic and not comp_titles:
        result["data_quality"] = "insufficient"

    # ── Premium enrichment ────────────────────────────────────────────────
    if is_premium:
        comments    = _parse_json_field(tracked.review_comments)
        clean_comms = [
            _decode_html(c) for c in comments
            if isinstance(c, str) and len(c.strip()) > 15
        ]

        if clean_comms and comp_titles:
            full_gap_data = _build_keyword_gap(
                your_title,
                comp_titles,
                review_texts=clean_comms,
                min_comp_freq=_MIN_COMP_FREQ_PREMIUM,
            )
            result["review_keywords"] = full_gap_data["review_keywords"]
        else:
            result["review_keywords"] = []

        gap_kws    = result.get("gap_keywords") or []
        gap_clust  = result.get("gap_clusters") or {}
        high_gaps  = [g for g in gap_kws if g["priority"] == "High"][:12]
        med_gaps   = [g for g in gap_kws if g["priority"] == "Medium"][:8]
        top_gaps   = (high_gaps + med_gaps)[:14]
        rev_kws    = result.get("review_keywords") or []
        top_rev    = [r for r in rev_kws if r["priority"] == "High"][:5]

        # ── AI Opportunity Scores  (chain-of-thought prompt) ──────────────
        if top_gaps:
            opp_prompt = _build_opportunity_prompt(
                your_title    = your_title,
                top_gaps      = top_gaps,
                comp_count    = len(comp_titles),
                cov_score     = result.get("coverage_score") or 0.0,
                clusters      = gap_clust,
            )
            opp_text = _ollama(opp_prompt, max_tokens=600, system=_OPP_SYSTEM)

            opp_scores: list[dict] = []
            parsed_list = _extract_json_array(opp_text)
            for item in parsed_list:
                if not isinstance(item, dict) or not item.get("keyword"):
                    continue
                opp_scores.append({
                    "keyword":  str(item.get("keyword", "")),
                    "score":    min(max(int(float(item.get("score", 5))), 1), 10),
                    "reason":   str(item.get("reason", "")),
                    "add_to":   str(item.get("add_to", "backend")),
                    "is_spec":  _is_spec_keyword(str(item.get("keyword", ""))),
                })

            # Deterministic fallback if AI failed
            if not opp_scores:
                for g in top_gaps:
                    sem_sim  = g.get("semantic_sim_to_yours", 0.5)
                    freq_sc  = int(g["comp_freq"] / max(len(comp_titles), 1) * 7)
                    spec_sc  = 2 if g.get("is_spec") else 0
                    dist_sc  = 1 if sem_sim < 0.25 else 0
                    score    = min(freq_sc + spec_sc + dist_sc, 10)
                    opp_scores.append({
                        "keyword": g["keyword"],
                        "score":   score,
                        "reason":  (
                            f"Used by {g['comp_freq']}/{len(comp_titles)} competitors"
                            + (" — spec term" if g.get("is_spec") else "")
                            + (f" — new concept (sim={sem_sim:.2f})" if sem_sim < 0.25 else "")
                        ),
                        "add_to":  "title" if score >= 7 else "bullets" if score >= 4 else "backend",
                        "is_spec": g.get("is_spec", False),
                    })

            result["ai_opportunity_scores"] = sorted(opp_scores, key=lambda x: -x["score"])

        # ── AI Listing Rewrite ────────────────────────────────────────────
        if top_gaps:
            rewrite_prompt = _build_rewrite_prompt(your_title, top_gaps, top_rev, gap_clust)
            rewrite_text   = _ollama(rewrite_prompt, max_tokens=160, system=_REWRITE_SYSTEM)
            if rewrite_text and len(rewrite_text.strip()) > 20:
                cleaned = rewrite_text.strip().strip('"').strip("'").strip()
                if cleaned and cleaned.lower() != your_title.lower():
                    result["ai_listing_rewrite"] = cleaned[:250]

        # ── AI Action Plan  (cluster-aware) ──────────────────────────────
        shared_kws = result.get("shared_keywords") or []
        unique_kws = result.get("unique_keywords") or []
        cov_score  = result.get("coverage_score") or 0.0

        plan_prompt = _build_plan_prompt(
            your_title  = your_title,
            high_gaps   = high_gaps,
            shared_kws  = shared_kws,
            unique_kws  = unique_kws,
            cov_score   = cov_score,
            top_rev     = top_rev,
            clusters    = gap_clust,
            comp_count  = len(comp_titles),
        )
        plan_text = _ollama(plan_prompt, max_tokens=350, system=_PLAN_SYSTEM)

        if plan_text:
            steps = re.split(r"\n?\s*\d+[\.\)]\s+", plan_text.strip())
            steps = [s.strip() for s in steps if len(s.strip()) > 15]
            result["ai_action_plan"] = steps[:4] if steps else [plan_text.strip()]
        else:
            # Deterministic fallback — cluster-aware
            fallback: list[str] = []
            if high_gaps:
                title_kws   = [g["keyword"] for g in high_gaps if g.get("semantic_sim_to_yours", 1) > 0.3][:3]
                backend_kws = [g["keyword"] for g in high_gaps if g.get("semantic_sim_to_yours", 1) <= 0.3][:3]
                if title_kws:
                    fallback.append(
                        f"Add to your TITLE (semantically close, easy wins): "
                        + ", ".join(f'"{k}"' for k in title_kws)
                        + f". These appear in {high_gaps[0]['comp_freq']}+ competitor titles."
                    )
                if backend_kws:
                    fallback.append(
                        f"Add to BACKEND SEARCH TERMS (new concepts competitors use): "
                        + ", ".join(f'"{k}"' for k in backend_kws)
                        + ". These represent entirely different search angles."
                    )
            if cov_score < 55:
                fallback.append(
                    f"Your coverage score is {cov_score}/100. Prioritise the "
                    f"'{next(iter(gap_clust), 'Speed & Performance')}' cluster — "
                    "it has the most untapped competitor keywords."
                )
            if unique_kws:
                fallback.append(
                    "Protect your differentiators: "
                    + ", ".join(f'"{k}"' for k in unique_kws[:4])
                    + ". Keep these prominent in your title and bullets."
                )
            if not fallback:
                fallback.append(
                    "Keyword coverage is strong. Monitor competitor titles weekly "
                    "and refresh backend search terms with newly trending terms."
                )
            result["ai_action_plan"] = fallback[:3]

    return result


# ─────────────────────────────────────────────────────────────────────────────
# SECONDARY ENDPOINT  –  /keyword-gap/competitors
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/competitors")
def get_keyword_competitors(
    asin:       str           = Query(...),
    seller_id:  str           = Query(...),
    db:         Session       = Depends(get_db),
    current_user: User        = Depends(get_current_user),
) -> dict:
    """
    Returns the top semantically similar competitor products for the frontend.
    """
    tier = current_user.subscription_tier.lower().strip() if current_user.subscription_tier else "free"

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

    currency    = (tracked.currency or "USD").upper().strip()
    competitors = _get_competitor_titles(db, tracked, currency, limit=20)

    return {
        "asin":            asin,
        "tier":            tier,
        "embedding_model": _ST_MODEL_NAME if _SentenceEmbedder.get().available else "jaccard_fallback",
        "competitors":     competitors,
    }



