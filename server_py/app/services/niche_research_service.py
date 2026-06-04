# # app/services/niche_research_service.py

# import re
# import math
# import logging
# import numpy as np
# from typing import List, Dict, Tuple, Optional, Any
# from sqlalchemy.orm import Session

# # Import original core functions, classes, and constants from legacy_router
# from app.api.v1.routes.legacy_router import (
#     _db_fetch,
#     _db_fetch_category_only,
#     _remove_price_outliers,
#     _multi_factor_score,
#     _cosine,
#     _TFIDFEmbedder,
#     _validate_source,
#     extract_keywords,
#     FallbackTier,
#     FallbackPolicy,
#     DEFAULT_FALLBACK_POLICY,
#     analyze_pricing,
#     analyze_sales_potential,
#     analyze_competition,
#     detect_market_gaps,
#     MIN_MATCHED
# )

# from app.models.legacy_models import NicheResearchRule
# import structlog
# log = structlog.get_logger()

# # Complete list of accessory words to filter out cheap secondary products (cables, covers, cooling fans)
# ACCESSORY_WORDS = [
#     # Laptop, PC, Tech Hardware accessories
#     "sticker", "stickers", "skin", "skins", "decal", "decals", "bag", "bags",
#     "backpack", "backpacks",
#     "sleeve", "sleeves", "stand", "stands", "holder", "holders", "mount", "mounts",
#     "cable", "cables", "charger", "chargers", "adapter", "adapters", "case", "cases",
#     "toy", "toys", "learning", "pad", "pads", "mouse", "mice", "cleaning", "keyboard",
#     "keyboards", "shifter", "shifters", "glass", "glasses", "protector", "protectors",
#     "strap", "straps", "band", "bands", "pouch", "pouches", "keychain", "keychains",
#     "screenguard", "screenguards", "screen-guard", "screen-guards", "screen guard",
#     "screen guards", "tempered", "hub", "hubs", "dock", "docks", "station", "stations",
#     "rack", "racks", "hook", "hooks", "screw", "screws", "battery", "batteries",
#     "pen", "pens", "stylus", "styli", "eartip", "eartips", "ear-tip", "ear-tips",
#     "cushion", "cushions", "shell", "shells", "bumper", "bumpers", "frame", "frames",
#     "film", "films", "card-reader", "card-readers", "card reader", "card readers",
#     "filter", "filters", "tripod", "tripods", "monopod", "monopods", "lens", "lenses",
#     "bulb", "bulbs", "switch", "switches", "plug", "plugs", "keycap", "keycaps",
#     "wristrest", "wristrests", "wrist-rest", "wrist-rests", "wrist rest", "wrist rests",
#     "organizer", "organizers", "cover", "covers", "earphone-case", "earphone-cases",
#     "earphone case", "earphone cases", "headphone-case", "headphone-cases",
#     "headphone case", "headphone cases", "stylus-pen", "stylus-pens", "stylus pen",
#     "stylus pens", "charging-dock", "charging-docks", "charging dock", "charging docks",
#     "cable-protector", "cable-protectors", "cable protector", "cable protectors",
#     "protector-glass", "protector-glasses", "protector glass", "protector glasses",
#     "webcam", "webcams", "microphone", "microphones", "speaker", "speakers",
#     "earphone", "earphones", "headphone", "headphones", "headset", "headsets",
#     "earbud", "earbuds",
#     "table", "tables", "drive", "drives", "paste", "pastes", "compound", "compounds",
#     "disk", "disks", "hard-disk", "hard-disks", "hard-drive", "hard-drives",
#     "presenter", "presenters", "pointer", "pointers", "cleaner", "cleaners",
#     "duster", "dusters", "ssd", "ssds", "hdd", "hdds", "dongle", "dongles",
#     "subscription", "subscriptions", "light", "lights", "pack", "packs",
#     "antivirus", "antiviruses", "software", "softwares",
#     "adaptor", "adaptors", "connector", "connectors",
#     "gamepad", "gamepads", "controller", "controllers",
#     "screwdriver", "screwdrivers", "tool", "tools",
#     "converter", "converters", "otg",
 
#     # Phone / Tablet accessories
#     "ring-holder", "ring holder", "pop-socket", "popsocket", "popsockets",
#     "selfie-stick", "selfie stick", "selfie sticks", "powerbank", "powerbanks",
#     "power-bank", "power-banks", "power bank", "power banks", "car-mount", "car mount",
#     "car-charger", "car charger", "armband", "armbands", "dust-plug", "dust plug",
#     "cooler", "coolers", "cooling", "teleprompter", "teleprompters",
#     "mixer", "mixers", "receiver", "receivers", "transmitter", "transmitters",
#     "amplifier", "amplifiers", "extender", "extenders", "repeater", "repeaters",
#     "reader", "readers", "memory card", "memory cards", "sd card", "sd cards",
#     "microsd", "microsdhc", "microsdxc", "sim card", "sim tray",
 
#     # Camera Accessories
#     "lens-cap", "lens cap", "lens-hood", "lens hood", "camera-strap", "camera strap",
#     "flash-diffuser", "flash diffuser", "gimbal", "gimbals", "rig", "rigs",
 
#     # Audio / Smart Watch Accessories
#     "watchband", "watchbands", "watchstrap", "watchstraps", "case-cover", "case cover",
 
#     # Home & Kitchen accessories / parts
#     "filter-replacement", "filter replacement", "hepa-filter", "hepa filter",
#     "attachment", "attachments", "nozzle", "nozzles", "hose", "hoses",
#     "dustbag", "dust bag", "dustbags", "dust bags", "vacuum-bag", "vacuum bag",
#     "pod", "pods", "capsule", "capsules", "descaling", "descaler", "carafe", "carafes",
#     "trivet", "trivets", "gasket", "gaskets", "lid", "lids", "knob", "knobs",
#     "spatula", "spatulas", "peeler", "peelers", "grater", "graters", "funnel", "funnels",
 
#     # Gaming console accessories
#     "controller-skin", "controller skin", "thumb-grip", "thumb grip", "thumb-grips",
#     "charging-stand", "charging stand", "console-stand", "console stand",
 
#     # Fashion accessories
#     "shoelace", "shoelaces", "shoe-lace", "shoe-laces", "insoles", "insole",
#     "belt-buckle", "belt buckle", "collar-stay", "collar stay", "cufflink", "cufflinks",
#     "tie-clip", "tie clip", "pocket-square", "pocket square", "hanger", "hangers",
 
#     # Compound multi-word phrases that hijack device searches
#     "door phone", "door phones", "video door", "door bell", "doorbells",
#     "phone cooler", "mobile cooler", "gaming cooler",
#     "selfie monitor", "vlog monitor", "portable monitor",
#     "phone grip", "mobile grip",
# ]

# def _get_device_price_floor(db: Session, product_name: str) -> float:
#     """Return the minimum price floor (INR) for the queried device dynamically from PostgreSQL. 0 = no floor."""
#     q_lower = product_name.lower()
#     try:
#         rules = db.query(NicheResearchRule.query_keyword, NicheResearchRule.price_floor).filter(
#             NicheResearchRule.price_floor > 0
#         ).all()
#         best_floor = 0.0
#         for keyword, floor in rules:
#             pattern = r"\b" + re.escape(keyword.lower()) + r"\b"
#             if re.search(pattern, q_lower):
#                 best_floor = max(best_floor, float(floor or 0))
#         return best_floor
#     except Exception:
#         log.exception("error_fetching_db_price_floors")
#         return 0.0


# def _expand_keywords(db: Session, keywords: List[str]) -> List[str]:
#     """Return keywords expanded with device synonyms fetched dynamically from the database."""
#     seen: set = set(keywords)
#     expanded = list(keywords)
#     try:
#         rules = db.query(NicheResearchRule.query_keyword, NicheResearchRule.synonyms).filter(
#             NicheResearchRule.query_keyword.in_([kw.lower() for kw in keywords])
#         ).all()
        
#         synonym_map = {r[0].lower(): [s.lower() for s in (r[1] or [])] for r in rules}
        
#         for kw in keywords:
#             for syn in synonym_map.get(kw.lower(), []):
#                 if syn not in seen:
#                     seen.add(syn)
#                     expanded.append(syn)
#     except Exception:
#         log.exception("error_expanding_db_keywords")
        
#     return expanded


# def _filter_accessory_hijacks(db: Session, candidates: List[Dict], product_name: str) -> List[Dict]:
#     if not candidates:
#         return []
#     q_lower = product_name.lower()

#     # 1. Check if the query matches any registered keyword rule in the DB
#     rule_matched = False
#     price_floor = 0.0
#     exempt_words: set = set()
#     try:
#         rules = db.query(NicheResearchRule).all()
#         for r in rules:
#             keyword_lower = r.query_keyword.lower()
#             pattern = r"\b" + re.escape(keyword_lower) + r"\b"
#             if re.search(pattern, q_lower):
#                 rule_matched = True
#                 price_floor = max(price_floor, float(r.price_floor or 0))
#                 exempt_words.update([w.lower() for w in (r.accessory_exclusions or [])])
#     except Exception:
#         log.exception("error_fetching_db_accessory_rules")

#     # 2. If no rule matched, bypass the accessory filter and price floors entirely
#     if not rule_matched:
#         return candidates

#     # 3. If query explicitly contains an accessory word, disable the device price floor
#     is_explicit_accessory_search = False
#     for word in ACCESSORY_WORDS:
#         pattern = r"\b" + re.escape(word) + r"\b"
#         if re.search(pattern, q_lower):
#             is_explicit_accessory_search = True
#             break
#     if is_explicit_accessory_search:
#         price_floor = 0.0

#     result = []
#     for p in candidates:
#         title_lower = str(p.get("product_title", "")).lower()

#         # ── Price floor guard ──
#         if price_floor > 0:
#             price_val = float(p.get("price", 0) or 0)
#             if price_val > 0 and price_val < price_floor:
#                 continue

#         # Pre-process common phrases
#         title_clean = title_lower
#         for phrase in [
#             "backlit keyboard", "backlit-keyboard", "gaming keyboard",
#             "chiclet keyboard", "rgb keyboard", "mechanical keyboard",
#             "built-in keyboard", "built-in backlit", "thin & light",
#             "thin and light", "lightweight"
#         ]:
#             title_clean = title_clean.replace(phrase, "feature_spec")

#         is_hijack = False
#         for word in ACCESSORY_WORDS:
#             if word in exempt_words:
#                 continue
#             pattern = r"\b" + re.escape(word) + r"\b"
#             if re.search(pattern, title_clean):
#                 if not re.search(pattern, q_lower):
#                     is_hijack = True
#                     break
#         if not is_hijack:
#             result.append(p)
#     return result


# def _niche_core_segment(product_name: str) -> str:
#     core = product_name.split(",")[0].strip()
#     core = re.sub(
#         r'\b\d[\d\-]*\s*(kg|g|gm|gms|ml|l|ltr|litre|liter|'
#         r'count|pack|pcs|pieces|units|inch|cm|mm|w|v|mah|gb|tb|mb)\b',
#         '', core, flags=re.IGNORECASE,
#     )
#     core = re.sub(r'\([^)]{0,40}\)', '', core)
#     return re.sub(r'\s+', ' ', core).strip()


# def _niche_adaptive_threshold(product_name: str, tier: str) -> float:
#     words = len(_niche_core_segment(product_name).split())
#     if tier == "strict":
#         return 0.50 if words > 6 else (0.42 if words > 3 else 0.32)
#     elif tier == "moderate":
#         return 0.35 if words > 6 else (0.26 if words > 3 else 0.18)
#     return 0.18 if words > 6 else 0.10


# def _price_band(base_cost: float, candidates: Optional[List[Dict]] = None) -> Tuple[float, float]:
#     if candidates:
#         db_avg = float(candidates[0].get("avg_price") or 0)
#         if db_avg > 0 and len(candidates) >= MIN_MATCHED:
#             return db_avg * 0.25, db_avg * 4.0
#         prices = [float(p.get("price", 0) or 0) for p in candidates if p.get("price", 0) > 0]
#         if prices:
#             med = float(np.median(prices))
#             if len(candidates) >= MIN_MATCHED:
#                 return med * 0.20, med * 5.0
#             else:
#                 return med * 0.10, med * 8.0
#     if base_cost > 0:
#         return base_cost * 0.20, base_cost * 5.0
#     return 1.0, 999_999.0


# def _semantic_rerank(
#     db: Session,
#     candidates: List[Dict],
#     product_name: str,
#     core_kws: List[str],
#     threshold: float,
#     label: str = "",
#     query_override: Optional[str] = None,
# ) -> List[Dict]:
#     if not candidates:
#         return []

#     candidates = _filter_accessory_hijacks(db, candidates, product_name)
#     if not candidates:
#         return []

#     effective_query = query_override if query_override else product_name
#     titles = [str(p.get("product_title", "")) for p in candidates]
#     corpus = [effective_query] + titles
#     embedder = _TFIDFEmbedder(corpus)
#     q_vec = embedder.transform(effective_query)
#     scored: List[Tuple[Dict, float]] = []
#     for p, title in zip(candidates, titles):
#         sim = _cosine(q_vec, embedder.transform(title))
#         if sim >= threshold:
#             scored.append((p, _multi_factor_score(p, sim, core_kws)))
#     scored.sort(key=lambda x: x[1], reverse=True)
#     result = [p for p, _ in scored]
#     log.debug("rerank", label=label, threshold=threshold, before=len(candidates), after=len(result))
#     return result


# def _finalize(products: List[Dict], max_results: int) -> List[Dict]:
#     cleaned = _remove_price_outliers(products)
#     if len(cleaned) < MIN_MATCHED:
#         return products[:max_results]
#     return cleaned[:max_results]


# def get_niche_similar_products(
#     db: Session,
#     product_name: str,
#     category: str,
#     source: str,
#     base_cost: float,
#     max_results: int = 200,
#     policy: FallbackPolicy = DEFAULT_FALLBACK_POLICY,
# ) -> Tuple[List[Dict], FallbackTier]:
#     """
#     Refined similar products pipeline dedicated to niche competitor research.
#     """
#     log.info("niche_pipeline_start", product=product_name, category=category, source=source)

#     # Normalize category: treat "all" or empty category as global search (None)
#     category_clean = category.strip() if category else ""
#     if category_clean.lower() in ["all", "", "none"]:
#         category_clean = None

#     core_kws = extract_keywords(product_name)
#     expanded_kws = _expand_keywords(db, core_kws)
    
#     synonym_extras = [kw for kw in expanded_kws[len(core_kws):]
#                       if kw.lower() not in product_name.lower()]
#     expanded_query = (
#         product_name + " " + " ".join(synonym_extras)
#         if synonym_extras else product_name
#     )

#     if not core_kws:
#         log.info("niche_pipeline_no_keywords")
#         raw = _db_fetch_category_only(db, category_clean or "All", source, limit=300)
#         allow, reason = policy.should_allow_tier4(len(raw))
#         if not allow:
#             log.warning("niche_tier4_blocked", reason=reason)
#             return [], FallbackTier.NO_DATA
#         result = _semantic_rerank(db, raw, product_name, [], 0.0, "T4-no-kw")
#         if len(result) >= MIN_MATCHED:
#             return _finalize(result, max_results), FallbackTier.TIER_4
#         return [], FallbackTier.NO_DATA

#     # Tier 1: category-scoped, strict
#     raw_t1 = []
#     if category_clean:
#         raw_t1 = _db_fetch(db, expanded_kws, source, limit=500, category=category_clean)
        
#     # Self-healing fallback: if category filter results in 0 items, run global search
#     if not raw_t1:
#         log.info("niche_category_fallback_global", category=category)
#         raw_t1 = _db_fetch(db, expanded_kws, source, limit=500, category=None)

#     raw_t1_clean = _filter_accessory_hijacks(db, raw_t1, product_name)
#     lo, hi = _price_band(base_cost, raw_t1_clean)
#     raw_t1_banded = [p for p in raw_t1_clean if lo <= float(p.get("price", 0) or 0) <= hi]
#     result = _semantic_rerank(db, raw_t1_banded, product_name, core_kws,
#                               _niche_adaptive_threshold(product_name, "strict"), "T1",
#                               query_override=expanded_query)
#     if len(result) >= MIN_MATCHED:
#         return _finalize(result, max_results), FallbackTier.TIER_1

#     # Tier 2: all-categories, accessory-filtered, moderate
#     raw_t2 = _db_fetch(db, expanded_kws, source, limit=600, price_lo=lo, price_hi=hi)
#     raw_t2_clean = _filter_accessory_hijacks(db, raw_t2, product_name)
#     result = _semantic_rerank(db, raw_t2_clean, product_name, core_kws,
#                               _niche_adaptive_threshold(product_name, "moderate"), "T2",
#                               query_override=expanded_query)
#     if len(result) >= MIN_MATCHED:
#         return _finalize(result, max_results), FallbackTier.TIER_2

#     # Sparse-pool fallback: merge genuine T1 + T2 results
#     t1_ids = {id(p) for p in raw_t1_banded}
#     pooled = raw_t1_banded + [p for p in raw_t2_clean if id(p) not in t1_ids]
#     seen_titles: set = set()
#     pooled_deduped = []
#     for p in pooled:
#         t = str(p.get("product_title", "")).lower().strip()
#         if t not in seen_titles:
#             seen_titles.add(t)
#             pooled_deduped.append(p)
#     if len(pooled_deduped) >= MIN_MATCHED:
#         result = _semantic_rerank(db, pooled_deduped, product_name, core_kws,
#                                   _niche_adaptive_threshold(product_name, "loose"), "T-pool",
#                                   query_override=expanded_query)
#         if len(result) >= MIN_MATCHED:
#             return _finalize(result, max_results), FallbackTier.TIER_2

#     # Sparse device accept
#     price_floor = _get_device_price_floor(db, product_name)
#     if price_floor > 0 and len(pooled_deduped) >= 2:
#         log.info("niche_sparse_device_accept", count=len(pooled_deduped), floor=price_floor)
#         return _finalize(pooled_deduped, max_results), FallbackTier.TIER_2

#     # Tier 3: single-keyword, wide price, loose
#     best_kw = [core_kws[0]]
#     lo3, hi3 = (base_cost * 0.10, base_cost * 10.0) if base_cost > 0 else (1.0, 1_000_000.0)
#     raw_t3 = _db_fetch(db, best_kw, source, limit=400, price_lo=lo3, price_hi=hi3)
#     raw_t3_clean = _filter_accessory_hijacks(db, raw_t3, product_name)
#     result = _semantic_rerank(db, raw_t3_clean, product_name, core_kws,
#                               _niche_adaptive_threshold(product_name, "loose"), "T3",
#                               query_override=expanded_query)
#     if len(result) >= MIN_MATCHED:
#         return _finalize(result, max_results), FallbackTier.TIER_3

#     # Tier 4: category-only fallback
#     raw_t4 = _db_fetch_category_only(db, category_clean or "All", source, limit=300)
#     allow, reason = policy.should_allow_tier4(len(raw_t4))
#     if not allow:
#         log.warning("niche_tier4_blocked", reason=reason)
#         return [], FallbackTier.NO_DATA
#     result = _semantic_rerank(db, raw_t4, product_name, core_kws, 0.0, "T4-cat",
#                               query_override=expanded_query)
#     if len(result) >= MIN_MATCHED:
#         return _finalize(result, max_results), FallbackTier.TIER_4

#     return [], FallbackTier.NO_DATA


# async def run_niche_research(
#     db: Session,
#     product_name: str,
#     category: str,
#     source: str,
#     base_cost: float = 0,
# ) -> dict:
#     """Runs high-performance competitor analysis specifically for the Profitability autofill."""
#     from app.services.ollama_service import complete_ollama, ollama_is_running
#     import json

#     source_key = _validate_source(source)

#     similar_products, tier_used = get_niche_similar_products(
#         db, product_name, category, source_key, base_cost
#     )

#     ollama_success = False
#     ollama_data = {}
#     try:
#         if await ollama_is_running():
#             prompt = f"""
#             You are an expert e-commerce market research analyst for {source_key} in India.
#             Given the product query '{product_name}', use your common sense and market knowledge to estimate the following details in JSON format:
#             - recommended_price: A realistic average e-commerce selling price (INR) for this product in India.
#             - min_price: A realistic minimum e-commerce selling price (INR).
#             - max_price: A realistic maximum e-commerce selling price (INR).
#             - monthly_units: A realistic estimated monthly sales volume (units/month) for a typical competitor (integer, e.g. 100 to 5000).
#             - category: A standard e-commerce category name that this product belongs to.
#             - mock_competitors: A list of 3 realistic competitor products for this search. Each competitor must have:
#               - title: A realistic, descriptive product title.
#               - price: A realistic price (INR).
#               - rating: A realistic star rating (e.g. 3.5 to 4.8).
#               - reviews: A realistic number of reviews (e.g. 10 to 2000).
            
#             Return ONLY a valid JSON object matching the schema below. Do not include markdown code block fences (like ```json), other text, or explanation.
            
#             Schema:
#             {{
#                 "recommended_price": int,
#                 "min_price": int,
#                 "max_price": int,
#                 "monthly_units": int,
#                 "category": str,
#                 "mock_competitors": [
#                     {{
#                         "title": str,
#                         "price": int,
#                         "rating": float,
#                         "reviews": int
#                     }}
#                 ]
#             }}
#             """
#             response_text = await complete_ollama(prompt, system="You are a precise JSON generator. Output ONLY raw JSON. No markdown code blocks, no headers.")
#             cleaned = response_text.strip()
#             if cleaned.startswith("```"):
#                 lines = cleaned.split("\n")
#                 if lines[0].startswith("```"):
#                     lines = lines[1:]
#                 if lines and lines[-1].strip() == "```":
#                     lines = lines[:-1]
#                 cleaned = "\n".join(lines).strip()
#             if cleaned.startswith("json"):
#                 cleaned = cleaned[4:].strip()
#             cleaned = cleaned.strip("` \n\r\t")
#             ollama_data = json.loads(cleaned)
#             if "recommended_price" in ollama_data and "monthly_units" in ollama_data:
#                 ollama_success = True
#     except Exception as e:
#         log.exception("ollama_niche_research_error", error=str(e))

#     if not similar_products:
#         if ollama_success:
#             category = ollama_data.get("category", category)
#             for mock in ollama_data.get("mock_competitors", []):
#                 similar_products.append({
#                     "product_title": mock.get("title", f"Competitor {product_name}"),
#                     "price": float(mock.get("price", ollama_data.get("recommended_price", 1000))),
#                     "rating": float(mock.get("rating", 4.2)),
#                     "reviews": int(mock.get("reviews", 100)),
#                     "category_name": category,
#                     "sales_volume": f"{ollama_data.get('monthly_units', 300)}+",
#                     "country": "IN",
#                     "is_best_seller": False,
#                     "is_amazon_choice": False,
#                     "is_prime": True,
#                     "avg_price": float(ollama_data.get("recommended_price", 1000)),
#                     "min_price": float(ollama_data.get("min_price", 800)),
#                     "max_price": float(ollama_data.get("max_price", 1200))
#                 })
#         else:
#             return {
#                 "success": False,
#                 "message": f"No competitor products found for '{product_name}' in category '{category}'."
#             }

#     keywords = extract_keywords(product_name)
#     pricing_insights = analyze_pricing(similar_products, base_cost)
    
#     sales_insights = analyze_sales_potential(
#         products=similar_products, source=source_key,
#         base_cost=base_cost,
#         recommended_price=pricing_insights["recommended_price"],
#         category=category, db=db,
#     )

#     competition_insights = analyze_competition(similar_products, category, keywords)
#     market_gaps = detect_market_gaps(
#         similar_products, pricing_insights, base_cost, keywords, source=source_key
#     )

#     if ollama_success:
#         rec_p = int(ollama_data.get("recommended_price", pricing_insights["recommended_price"]))
#         min_p = int(ollama_data.get("min_price", pricing_insights["min_price"]))
#         max_p = int(ollama_data.get("max_price", pricing_insights["max_price"]))
        
#         pricing_insights["recommended_price"] = rec_p
#         pricing_insights["min_price"] = min_p
#         pricing_insights["max_price"] = max_p
#         pricing_insights["market_avg_price"] = rec_p
#         pricing_insights["market_min_price"] = min_p
#         pricing_insights["market_max_price"] = max_p
#         pricing_insights["confidence"] = "High"
        
#         if rec_p > 0 and base_cost > 0:
#             profit = rec_p - base_cost
#             pricing_insights["profit_margin"] = round((profit / rec_p) * 100, 1)
        
#         monthly_units = int(ollama_data.get("monthly_units", 300))
#         low = max(1, int(monthly_units * 0.8))
#         high = max(low + 1, int(monthly_units * 1.2))
#         daily = round(monthly_units / 30.0, 1)
#         demand = "High" if monthly_units > 1000 else ("Medium" if monthly_units > 300 else "Low")
        
#         sales_insights["estimated_monthly_sales"] = f"{low:,} - {high:,}"
#         sales_insights["estimated_daily_sales"] = daily
#         sales_insights["market_demand"] = demand
        
#         category = ollama_data.get("category", category)

#     return {
#         "success": True,
#         "data": {
#             "query":             product_name,
#             "category":          category,
#             "source":            source,
#             "base_cost":         base_cost,
#             "pricing":           pricing_insights,
#             "sales":             sales_insights,
#             "competition":       competition_insights,
#             "gaps":              market_gaps,
#             "similar_products":  similar_products,
#         }
#     }



# app/services/niche_research_service.py

import re
import math
import hashlib
import logging
import numpy as np
from typing import List, Dict, Tuple, Optional, Any
from sqlalchemy.orm import Session

from app.api.v1.routes.legacy_router import (
    _db_fetch,
    _db_fetch_category_only,
    _remove_price_outliers,
    _multi_factor_score,
    _cosine,
    _TFIDFEmbedder,
    _validate_source,
    extract_keywords,
    FallbackTier,
    FallbackPolicy,
    DEFAULT_FALLBACK_POLICY,
    analyze_pricing,
    analyze_sales_potential,
    analyze_competition,
    detect_market_gaps,
    MIN_MATCHED
)

from app.models.legacy_models import NicheResearchRule
import structlog
log = structlog.get_logger()

# ── In-memory result cache ────────────────────────────────────────────────────
_NICHE_CACHE: Dict[str, dict] = {}

def _cache_key(product_name: str, source: str, category: str) -> str:
    raw = f"{product_name.lower().strip()}|{source}|{category.lower().strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


# ── Built-in price floor map ──────────────────────────────────────────────────
# Fallback when niche_research_rules DB table has no entry for the query.
# Format: (list_of_trigger_keywords, floor_inr)
# Checked via substring/word-boundary match on lowercased product name.
_BUILTIN_PRICE_FLOORS: List[Tuple[List[str], float]] = [
    # Phones
    (["iphone", "apple phone"],                                        15000),
    (["samsung galaxy", "oneplus", "pixel phone"],                      8000),
    (["smartphone", "mobile phone", "android phone"],                   5000),
    (["phone"],                                                          5000),

    # Laptops / Computers
    (["gaming laptop", "gaming notebook"],                             40000),
    (["laptop", "notebook", "ultrabook", "chromebook"],               20000),
    (["desktop computer", "all in one", "all-in-one", "imac"],        20000),
    (["computer", "pc build"],                                         15000),

    # Tablets
    (["ipad"],                                                         30000),
    (["tablet", "android tablet", "drawing tablet"],                    8000),

    # Smartwatches / Wearables
    (["apple watch"],                                                  25000),
    (["smartwatch", "smart watch"],                                     3000),
    (["fitness watch", "sports watch"],                                 2000),
    (["fitness band", "smart band", "activity tracker"],                1500),

    # Cameras
    (["dslr", "mirrorless", "slr camera"],                            30000),
    (["action camera", "gopro", "sports camera"],                      5000),
    (["digital camera", "point and shoot"],                             5000),
    (["camera"],                                                         5000),

    # Audio
    (["soundbar", "sound bar"],                                         5000),
    (["wireless earbuds", "tws earbuds", "true wireless", "airpods"],  1500),
    (["bluetooth speaker", "portable speaker"],                         1000),
    (["over ear headphones", "on ear headphones", "headphones"],        1000),
    (["neckband", "wired earphones", "earphones"],                       500),

    # TV / Monitors
    (["smart tv", "led tv", "4k tv", "oled tv", "qled", "television"], 10000),
    (["gaming monitor", "curved monitor", "ultrawide monitor"],         8000),
    (["monitor", "computer monitor"],                                    5000),

    # Home Appliances
    (["split ac", "window ac", "inverter ac", "air conditioner"],      20000),
    (["double door fridge", "side by side refrigerator"],              15000),
    (["single door fridge", "refrigerator", "fridge"],                  8000),
    (["front load washing machine", "top load washing machine"],        8000),
    (["washing machine"],                                                8000),
    (["dishwasher"],                                                     8000),
    (["air purifier", "hepa purifier"],                                 5000),
    (["water purifier", "ro purifier", "ro system"],                    5000),
    (["microwave oven", "convection oven", "microwave"],                3000),
    (["robot vacuum", "robot mop"],                                      5000),
    (["vacuum cleaner", "wet dry vacuum"],                              2000),
    (["geyser", "water heater", "instant water heater"],                2000),
    (["ceiling fan"],                                                    1500),
    (["room heater", "oil heater", "fan heater"],                       1500),
    (["cooler", "air cooler", "desert cooler"],                         3000),

    # Kitchen Appliances
    (["espresso machine", "coffee machine", "coffee maker"],            2000),
    (["mixer grinder", "food processor", "juicer mixer"],               1500),
    (["induction cooktop", "induction stove"],                          1500),
    (["hand blender", "immersion blender", "blender"],                  1000),
    (["electric kettle", "kettle"],                                       500),
    (["toaster", "pop up toaster", "sandwich toaster"],                   500),
    (["rice cooker", "electric cooker"],                                  800),
    (["pressure cooker"],                                                  500),

    # Gaming
    (["playstation 5", "ps5"],                                         50000),
    (["playstation 4", "ps4"],                                         25000),
    (["xbox series x", "xbox series s"],                               40000),
    (["xbox one"],                                                      20000),
    (["nintendo switch oled"],                                          30000),
    (["nintendo switch"],                                               25000),
    (["gaming console"],                                                25000),

    # Networking
    (["mesh wifi", "wifi mesh"],                                         5000),
    (["wifi router", "wireless router", "router"],                      1500),

    # Printers
    (["laser printer", "laser jet"],                                     8000),
    (["inkjet printer", "all in one printer", "printer"],               3000),

    # Personal Care
    (["electric shaver", "foil shaver", "rotary shaver"],                800),
    (["hair dryer", "blow dryer", "hair blower"],                        800),
    (["beard trimmer", "body trimmer", "hair trimmer", "trimmer"],        500),
    (["electric toothbrush", "sonic toothbrush"],                         500),
    (["hair straightener", "flat iron", "straightening iron"],             500),

    # Furniture / Large items
    (["gaming chair"],                                                    5000),
    (["ergonomic chair", "office chair", "desk chair"],                  3000),
    (["sofa set", "sectional sofa", "sofa", "couch"],                    8000),
    (["memory foam mattress", "spring mattress", "mattress"],            5000),
    (["treadmill", "running machine"],                                   15000),
    (["stationary cycle", "exercise bike", "spin bike"],                 5000),
    (["study table", "computer table", "office desk", "work desk"],      3000),
    (["wardrobe", "almirah", "cupboard"],                                5000),
    (["dining table"],                                                    5000),
    (["bed frame", "double bed", "king size bed", "queen bed"],          8000),

    # Bags / Luggage
    (["hard shell luggage", "trolley bag", "suitcase"],                  2000),
    (["travel bag", "duffel bag"],                                        800),

    # Footwear
    (["running shoes", "sports shoes", "training shoes"],                 800),
    (["formal shoes", "leather shoes", "oxford shoes"],                   800),
    (["sneakers", "casual shoes"],                                        800),
]


def _get_builtin_price_floor(product_name: str) -> float:
    """
    Returns a built-in price floor for the product name.
    Uses the _BUILTIN_PRICE_FLOORS list — no DB required.
    Short keywords (<=3 chars) use word-boundary regex to avoid false matches.
    """
    q = product_name.lower()
    for keywords, floor in _BUILTIN_PRICE_FLOORS:
        for kw in keywords:
            if len(kw) <= 3:
                if re.search(r'(?<![a-z])' + re.escape(kw) + r'(?![a-z])', q):
                    return floor
            else:
                if kw in q:
                    return floor
    return 0.0


def _get_device_price_floor(db: Session, product_name: str) -> float:
    """
    Return the minimum price floor (INR) for the queried device.
    Priority:
      1. niche_research_rules DB table  (operator-configured, highest priority)
      2. Built-in keyword map           (always works, covers common products)
    """
    q_lower = product_name.lower()

    # 1. Try DB rules first
    try:
        rules = db.query(NicheResearchRule.query_keyword, NicheResearchRule.price_floor).filter(
            NicheResearchRule.price_floor > 0
        ).all()
        best_floor = 0.0
        for keyword, floor in rules:
            pattern = r"\b" + re.escape(keyword.lower()) + r"\b"
            if re.search(pattern, q_lower):
                best_floor = max(best_floor, float(floor or 0))
        if best_floor > 0:
            return best_floor
    except Exception:
        log.exception("error_fetching_db_price_floors")

    # 2. Fallback to built-in map
    builtin = _get_builtin_price_floor(product_name)
    if builtin > 0:
        log.info("builtin_price_floor_used", product=product_name, floor=builtin)
    return builtin


# ── ACCESSORY_WORDS ───────────────────────────────────────────────────────────

ACCESSORY_WORDS = [
    "sticker", "stickers", "skin", "skins", "decal", "decals", "bag", "bags",
    "backpack", "backpacks",
    "sleeve", "sleeves", "stand", "stands", "holder", "holders", "mount", "mounts",
    "cable", "cables", "charger", "chargers", "adapter", "adapters", "case", "cases",
    "toy", "toys", "learning", "pad", "pads", "mouse", "mice", "cleaning", "keyboard",
    "keyboards", "shifter", "shifters", "glass", "glasses", "protector", "protectors",
    "strap", "straps", "band", "bands", "pouch", "pouches", "keychain", "keychains",
    "screenguard", "screenguards", "screen-guard", "screen-guards", "screen guard",
    "screen guards", "tempered", "hub", "hubs", "dock", "docks", "station", "stations",
    "rack", "racks", "hook", "hooks", "screw", "screws", "battery", "batteries",
    "pen", "pens", "stylus", "styli", "eartip", "eartips", "ear-tip", "ear-tips",
    "cushion", "cushions", "shell", "shells", "bumper", "bumpers", "frame", "frames",
    "film", "films", "card-reader", "card-readers", "card reader", "card readers",
    "filter", "filters", "tripod", "tripods", "monopod", "monopods", "lens", "lenses",
    "bulb", "bulbs", "switch", "switches", "plug", "plugs", "keycap", "keycaps",
    "wristrest", "wristrests", "wrist-rest", "wrist-rests", "wrist rest", "wrist rests",
    "organizer", "organizers", "cover", "covers", "earphone-case", "earphone-cases",
    "earphone case", "earphone cases", "headphone-case", "headphone-cases",
    "headphone case", "headphone cases", "stylus-pen", "stylus-pens", "stylus pen",
    "stylus pens", "charging-dock", "charging-docks", "charging dock", "charging docks",
    "cable-protector", "cable-protectors", "cable protector", "cable protectors",
    "protector-glass", "protector-glasses", "protector glass", "protector glasses",
    "webcam", "webcams", "microphone", "microphones", "speaker", "speakers",
    "earphone", "earphones", "headphone", "headphones", "headset", "headsets",
    "earbud", "earbuds",
    "table", "tables", "drive", "drives", "paste", "pastes", "compound", "compounds",
    "disk", "disks", "hard-disk", "hard-disks", "hard-drive", "hard-drives",
    "presenter", "presenters", "pointer", "pointers", "cleaner", "cleaners",
    "duster", "dusters", "ssd", "ssds", "hdd", "hdds", "dongle", "dongles",
    "subscription", "subscriptions", "light", "lights", "pack", "packs",
    "antivirus", "antiviruses", "software", "softwares",
    "adaptor", "adaptors", "connector", "connectors",
    "gamepad", "gamepads", "controller", "controllers",
    "screwdriver", "screwdrivers", "tool", "tools",
    "converter", "converters", "otg",
    "ring-holder", "ring holder", "pop-socket", "popsocket", "popsockets",
    "selfie-stick", "selfie stick", "selfie sticks", "powerbank", "powerbanks",
    "power-bank", "power-banks", "power bank", "power banks", "car-mount", "car mount",
    "car-charger", "car charger", "armband", "armbands", "dust-plug", "dust plug",
    "cooler", "coolers", "cooling", "teleprompter", "teleprompters",
    "mixer", "mixers", "receiver", "receivers", "transmitter", "transmitters",
    "amplifier", "amplifiers", "extender", "extenders", "repeater", "repeaters",
    "reader", "readers", "memory card", "memory cards", "sd card", "sd cards",
    "microsd", "microsdhc", "microsdxc", "sim card", "sim tray",
    "lens-cap", "lens cap", "lens-hood", "lens hood", "camera-strap", "camera strap",
    "flash-diffuser", "flash diffuser", "gimbal", "gimbals", "rig", "rigs",
    "watchband", "watchbands", "watchstrap", "watchstraps", "case-cover", "case cover",
    "filter-replacement", "filter replacement", "hepa-filter", "hepa filter",
    "attachment", "attachments", "nozzle", "nozzles", "hose", "hoses",
    "dustbag", "dust bag", "dustbags", "dust bags", "vacuum-bag", "vacuum bag",
    "pod", "pods", "capsule", "capsules", "descaling", "descaler", "carafe", "carafes",
    "trivet", "trivets", "gasket", "gaskets", "lid", "lids", "knob", "knobs",
    "spatula", "spatulas", "peeler", "peelers", "grater", "graters", "funnel", "funnels",
    "controller-skin", "controller skin", "thumb-grip", "thumb grip", "thumb-grips",
    "charging-stand", "charging stand", "console-stand", "console stand",
    "shoelace", "shoelaces", "shoe-lace", "shoe-laces", "insoles", "insole",
    "belt-buckle", "belt buckle", "collar-stay", "collar stay", "cufflink", "cufflinks",
    "tie-clip", "tie clip", "pocket-square", "pocket square", "hanger", "hangers",
    "door phone", "door phones", "video door", "door bell", "doorbells",
    "phone cooler", "mobile cooler", "gaming cooler",
    "selfie monitor", "vlog monitor", "portable monitor",
    "phone grip", "mobile grip",
]


# ── Deterministic price engine ────────────────────────────────────────────────

def _compute_deterministic_price(products: List[Dict], price_floor: float = 0.0) -> Dict:
    """
    Compute a stable, repeatable recommended price from real DB products.
    Applies price_floor BEFORE computing statistics — so accessories are
    excluded from the average even if they slipped through earlier filters.

    Algorithm:
      1. Filter out products below price_floor
      2. Score each: quality = rating * log1p(reviews + 1)
      3. Keep top 60% by quality (floor: MIN_MATCHED)
      4. Weighted trimmed mean — drop bottom 10% and top 10% by price
      5. Round to nearest realistic Indian e-commerce price boundary
    """
    if not products:
        return {}

    priced = []
    for p in products:
        price   = float(p.get("price") or p.get("product_price_numeric") or 0)
        rating  = float(p.get("rating") or p.get("product_star_rating_numeric") or 3.5)
        reviews = float(p.get("reviews") or p.get("product_num_ratings") or 0)
        # Apply price floor here as final safety net
        if price > 0 and (price_floor == 0 or price >= price_floor):
            quality = rating * math.log1p(reviews + 1)
            priced.append({"price": price, "quality": quality})

    if not priced:
        return {}

    priced.sort(key=lambda x: x["quality"], reverse=True)
    keep = max(MIN_MATCHED, int(len(priced) * 0.60))
    top  = priced[:keep]

    prices = sorted([p["price"] for p in top])
    n      = len(prices)

    lo_idx  = max(0, int(n * 0.10))
    hi_idx  = min(n, int(n * 0.90))
    trimmed = prices[lo_idx:hi_idx] if hi_idx > lo_idx else prices

    total_w = sum(p["quality"] for p in top)
    if total_w > 0:
        raw_rec = sum(p["price"] * p["quality"] for p in top) / total_w
    else:
        raw_rec = float(np.mean(trimmed))

    trim_min = float(np.percentile(prices, 10))
    trim_max = float(np.percentile(prices, 90))
    raw_rec  = max(trim_min, min(raw_rec, trim_max))

    # If result is still below floor (shouldn't happen, but safety net)
    if price_floor > 0 and raw_rec < price_floor:
        raw_rec = price_floor

    rec = _round_to_market_price(raw_rec)
    confidence = "High" if n >= 20 else ("Medium" if n >= 8 else "Low")

    return {
        "recommended_price": rec,
        "min_price":         int(round(float(np.percentile(prices, 15)))),
        "max_price":         int(round(float(np.percentile(prices, 85)))),
        "median_price":      int(round(float(np.median(prices)))),
        "confidence":        confidence,
        "product_count":     len(products),
    }


def _round_to_market_price(price: float) -> int:
    """Round raw price to nearest realistic Indian e-commerce price point."""
    if price <= 999:
        boundaries = [49, 99, 149, 199, 249, 299, 349, 399, 449, 499,
                      549, 599, 649, 699, 749, 799, 849, 899, 949, 999]
        return min(boundaries, key=lambda x: abs(x - price))

    magnitude  = 10 ** (len(str(int(price))) - 1)
    candidates = []
    for mult in range(1, 25):
        base = mult * magnitude
        candidates.extend([
            base - 1,    # 999, 1999, 2999 ...
            base - 51,   # 949, 1949 ...
            base + 99,   # 1099, 2099 ...
            base + 199,  # 1199, 2199 ...
            base + 299,  # 1299, 2299 ...
            base + 499,  # 1499, 2499 ...
            base + 699,  # 1699, 2699 ...
            base + 799,  # 1799, 2799 ...
        ])
    candidates = [c for c in candidates if c > 0]
    return min(candidates, key=lambda x: abs(x - price))


# ── DB helpers ────────────────────────────────────────────────────────────────

def _expand_keywords(db: Session, keywords: List[str]) -> List[str]:
    seen: set = set(keywords)
    expanded  = list(keywords)
    try:
        rules = db.query(NicheResearchRule.query_keyword, NicheResearchRule.synonyms).filter(
            NicheResearchRule.query_keyword.in_([kw.lower() for kw in keywords])
        ).all()
        synonym_map = {r[0].lower(): [s.lower() for s in (r[1] or [])] for r in rules}
        for kw in keywords:
            for syn in synonym_map.get(kw.lower(), []):
                if syn not in seen:
                    seen.add(syn)
                    expanded.append(syn)
    except Exception:
        log.exception("error_expanding_db_keywords")
    return expanded


def _filter_accessory_hijacks(db: Session, candidates: List[Dict], product_name: str) -> List[Dict]:
    """
    Filter out accessory products that hijack device searches.
    Now uses both DB rules AND the built-in price floor map to decide
    whether to apply the filter — so it works even with empty DB rules.
    """
    if not candidates:
        return []
    q_lower = product_name.lower()

    rule_matched = False
    price_floor  = 0.0
    exempt_words: set = set()

    # Check DB rules
    try:
        rules = db.query(NicheResearchRule).all()
        for r in rules:
            keyword_lower = r.query_keyword.lower()
            pattern = r"\b" + re.escape(keyword_lower) + r"\b"
            if re.search(pattern, q_lower):
                rule_matched = True
                price_floor  = max(price_floor, float(r.price_floor or 0))
                exempt_words.update([w.lower() for w in (r.accessory_exclusions or [])])
    except Exception:
        log.exception("error_fetching_db_accessory_rules")

    # If no DB rule matched, try the built-in floor map
    if not rule_matched:
        builtin_floor = _get_builtin_price_floor(product_name)
        if builtin_floor > 0:
            rule_matched = True
            price_floor  = builtin_floor

    # Still no match — this is a truly generic/unknown product, bypass filter
    if not rule_matched:
        return candidates

    # If user is explicitly searching FOR an accessory, disable the floor
    is_explicit_accessory_search = any(
        re.search(r"\b" + re.escape(word) + r"\b", q_lower)
        for word in ACCESSORY_WORDS
    )
    if is_explicit_accessory_search:
        price_floor = 0.0

    result = []
    for p in candidates:
        title_lower = str(p.get("product_title", "")).lower()

        if price_floor > 0:
            price_val = float(p.get("price", 0) or 0)
            if price_val > 0 and price_val < price_floor:
                continue

        title_clean = title_lower
        for phrase in [
            "backlit keyboard", "backlit-keyboard", "gaming keyboard",
            "chiclet keyboard", "rgb keyboard", "mechanical keyboard",
            "built-in keyboard", "built-in backlit", "thin & light",
            "thin and light", "lightweight"
        ]:
            title_clean = title_clean.replace(phrase, "feature_spec")

        is_hijack = False
        for word in ACCESSORY_WORDS:
            if word in exempt_words:
                continue
            pattern = r"\b" + re.escape(word) + r"\b"
            if re.search(pattern, title_clean):
                if not re.search(pattern, q_lower):
                    is_hijack = True
                    break
        if not is_hijack:
            result.append(p)
    return result


def _niche_core_segment(product_name: str) -> str:
    core = product_name.split(",")[0].strip()
    core = re.sub(
        r'\b\d[\d\-]*\s*(kg|g|gm|gms|ml|l|ltr|litre|liter|'
        r'count|pack|pcs|pieces|units|inch|cm|mm|w|v|mah|gb|tb|mb)\b',
        '', core, flags=re.IGNORECASE,
    )
    core = re.sub(r'\([^)]{0,40}\)', '', core)
    return re.sub(r'\s+', ' ', core).strip()


def _niche_adaptive_threshold(product_name: str, tier: str) -> float:
    words = len(_niche_core_segment(product_name).split())
    if tier == "strict":
        return 0.50 if words > 6 else (0.42 if words > 3 else 0.32)
    elif tier == "moderate":
        return 0.35 if words > 6 else (0.26 if words > 3 else 0.18)
    return 0.18 if words > 6 else 0.10


def _price_band(base_cost: float, candidates: Optional[List[Dict]] = None,
                price_floor: float = 0.0) -> Tuple[float, float]:
    """Price band with floor enforcement."""
    if candidates:
        prices = [float(p.get("price", 0) or 0) for p in candidates if p.get("price", 0) > 0]
        # Apply floor before computing band
        if price_floor > 0:
            prices = [p for p in prices if p >= price_floor]
        if prices:
            db_avg = float(candidates[0].get("avg_price") or 0)
            if db_avg > 0 and len(candidates) >= MIN_MATCHED:
                lo = max(price_floor, db_avg * 0.25)
                return lo, db_avg * 4.0
            med = float(np.median(prices))
            lo  = max(price_floor, med * 0.20)
            hi  = med * 5.0
            return lo, hi
    if base_cost > 0:
        return max(price_floor, base_cost * 0.20), base_cost * 5.0
    return max(price_floor, 1.0), 999_999.0


def _semantic_rerank(
    db: Session,
    candidates: List[Dict],
    product_name: str,
    core_kws: List[str],
    threshold: float,
    label: str = "",
    query_override: Optional[str] = None,
) -> List[Dict]:
    if not candidates:
        return []

    candidates = _filter_accessory_hijacks(db, candidates, product_name)
    if not candidates:
        return []

    effective_query = query_override if query_override else product_name
    titles   = [str(p.get("product_title", "")) for p in candidates]
    corpus   = [effective_query] + titles
    embedder = _TFIDFEmbedder(corpus)
    q_vec    = embedder.transform(effective_query)
    scored: List[Tuple[Dict, float]] = []
    for p, title in zip(candidates, titles):
        sim = _cosine(q_vec, embedder.transform(title))
        if sim >= threshold:
            scored.append((p, _multi_factor_score(p, sim, core_kws)))
    scored.sort(key=lambda x: x[1], reverse=True)
    result = [p for p, _ in scored]
    log.debug("rerank", label=label, threshold=threshold, before=len(candidates), after=len(result))
    return result


def _finalize(products: List[Dict], max_results: int) -> List[Dict]:
    cleaned = _remove_price_outliers(products)
    if len(cleaned) < MIN_MATCHED:
        return products[:max_results]
    return cleaned[:max_results]


# ── Main product pipeline ─────────────────────────────────────────────────────

def get_niche_similar_products(
    db: Session,
    product_name: str,
    category: str,
    source: str,
    base_cost: float,
    max_results: int = 200,
    policy: FallbackPolicy = DEFAULT_FALLBACK_POLICY,
) -> Tuple[List[Dict], FallbackTier]:
    log.info("niche_pipeline_start", product=product_name, category=category, source=source)

    category_clean = category.strip() if category else ""
    if category_clean.lower() in ["all", "", "none"]:
        category_clean = None

    core_kws     = extract_keywords(product_name)
    expanded_kws = _expand_keywords(db, core_kws)

    synonym_extras = [kw for kw in expanded_kws[len(core_kws):]
                      if kw.lower() not in product_name.lower()]
    expanded_query = (
        product_name + " " + " ".join(synonym_extras)
        if synonym_extras else product_name
    )

    # Get price floor early — used throughout the pipeline
    price_floor = _get_device_price_floor(db, product_name)
    log.info("price_floor_resolved", product=product_name, floor=price_floor)

    if not core_kws:
        log.info("niche_pipeline_no_keywords")
        raw = _db_fetch_category_only(db, category_clean or "All", source, limit=300)
        allow, reason = policy.should_allow_tier4(len(raw))
        if not allow:
            log.warning("niche_tier4_blocked", reason=reason)
            return [], FallbackTier.NO_DATA
        result = _semantic_rerank(db, raw, product_name, [], 0.0, "T4-no-kw")
        if len(result) >= MIN_MATCHED:
            return _finalize(result, max_results), FallbackTier.TIER_4
        return [], FallbackTier.NO_DATA

    # Tier 1: category-scoped, strict
    raw_t1 = []
    if category_clean:
        raw_t1 = _db_fetch(db, expanded_kws, source, limit=500, category=category_clean)

    if not raw_t1:
        log.info("niche_category_fallback_global", category=category)
        raw_t1 = _db_fetch(db, expanded_kws, source, limit=500, category=None)

    raw_t1_clean  = _filter_accessory_hijacks(db, raw_t1, product_name)
    lo, hi        = _price_band(base_cost, raw_t1_clean, price_floor)
    raw_t1_banded = [p for p in raw_t1_clean if lo <= float(p.get("price", 0) or 0) <= hi]
    result = _semantic_rerank(db, raw_t1_banded, product_name, core_kws,
                              _niche_adaptive_threshold(product_name, "strict"), "T1",
                              query_override=expanded_query)
    if len(result) >= MIN_MATCHED:
        return _finalize(result, max_results), FallbackTier.TIER_1

    # Tier 2: all-categories, moderate
    raw_t2       = _db_fetch(db, expanded_kws, source, limit=600, price_lo=lo, price_hi=hi)
    raw_t2_clean = _filter_accessory_hijacks(db, raw_t2, product_name)
    result = _semantic_rerank(db, raw_t2_clean, product_name, core_kws,
                              _niche_adaptive_threshold(product_name, "moderate"), "T2",
                              query_override=expanded_query)
    if len(result) >= MIN_MATCHED:
        return _finalize(result, max_results), FallbackTier.TIER_2

    # Sparse-pool fallback: merge T1 + T2
    t1_ids = {id(p) for p in raw_t1_banded}
    pooled = raw_t1_banded + [p for p in raw_t2_clean if id(p) not in t1_ids]
    seen_titles: set = set()
    pooled_deduped = []
    for p in pooled:
        t = str(p.get("product_title", "")).lower().strip()
        if t not in seen_titles:
            seen_titles.add(t)
            pooled_deduped.append(p)
    if len(pooled_deduped) >= MIN_MATCHED:
        result = _semantic_rerank(db, pooled_deduped, product_name, core_kws,
                                  _niche_adaptive_threshold(product_name, "loose"), "T-pool",
                                  query_override=expanded_query)
        if len(result) >= MIN_MATCHED:
            return _finalize(result, max_results), FallbackTier.TIER_2

    # Sparse device accept
    if price_floor > 0 and len(pooled_deduped) >= 2:
        log.info("niche_sparse_device_accept", count=len(pooled_deduped), floor=price_floor)
        return _finalize(pooled_deduped, max_results), FallbackTier.TIER_2

    # Tier 3: single-keyword, wide price, loose
    best_kw  = [core_kws[0]]
    lo3      = max(price_floor, base_cost * 0.10) if base_cost > 0 else max(price_floor, 1.0)
    hi3      = base_cost * 10.0 if base_cost > 0 else 1_000_000.0
    raw_t3       = _db_fetch(db, best_kw, source, limit=400, price_lo=lo3, price_hi=hi3)
    raw_t3_clean = _filter_accessory_hijacks(db, raw_t3, product_name)
    result = _semantic_rerank(db, raw_t3_clean, product_name, core_kws,
                              _niche_adaptive_threshold(product_name, "loose"), "T3",
                              query_override=expanded_query)
    if len(result) >= MIN_MATCHED:
        return _finalize(result, max_results), FallbackTier.TIER_3

    # Tier 4: category-only fallback
    raw_t4 = _db_fetch_category_only(db, category_clean or "All", source, limit=300)
    allow, reason = policy.should_allow_tier4(len(raw_t4))
    if not allow:
        log.warning("niche_tier4_blocked", reason=reason)
        return [], FallbackTier.NO_DATA
    result = _semantic_rerank(db, raw_t4, product_name, core_kws, 0.0, "T4-cat",
                              query_override=expanded_query)
    if len(result) >= MIN_MATCHED:
        return _finalize(result, max_results), FallbackTier.TIER_4

    return [], FallbackTier.NO_DATA


# ── Main entry point ──────────────────────────────────────────────────────────

async def run_niche_research(
    db: Session,
    product_name: str,
    category: str,
    source: str,
    base_cost: float = 0,
) -> dict:
    """
    Deterministic competitor analysis for the Profitability Optimizer autofill.

    Pricing rules:
      - Prices ALWAYS from real DB products via _compute_deterministic_price()
      - Price floor applied at every stage (DB rules + built-in map)
      - Ollama ONLY used to infer category name when DB returned zero results
      - Ollama NEVER sets any price
      - Identical searches return identical prices (in-memory cache)
    """
    import json
    from app.services.ollama_service import complete_ollama, ollama_is_running

    ck = _cache_key(product_name, source, category)
    if ck in _NICHE_CACHE:
        log.info("niche_cache_hit", key=ck)
        return _NICHE_CACHE[ck]

    source_key = _validate_source(source)

    similar_products, tier_used = get_niche_similar_products(
        db, product_name, category, source_key, base_cost
    )

    has_real_data     = len(similar_products) >= MIN_MATCHED
    data_source       = "db" if has_real_data else "ai_estimate"
    resolved_category = category

    if not has_real_data:
        try:
            if await ollama_is_running():
                cat_prompt = (
                    f"What is the single standard e-commerce category name for "
                    f"'{product_name}' sold in India? Reply with ONLY the category "
                    f"name, nothing else. Example: 'Home & Kitchen' or 'Electronics'."
                )
                cat_resp = await complete_ollama(
                    cat_prompt,
                    system="Reply with only a short category name. No JSON, no explanation."
                )
                resolved_category = cat_resp.strip().strip('"').strip("'")[:60]
        except Exception as e:
            log.warning("ollama_category_fallback_error", error=str(e))

        if not similar_products:
            return {
                "success": False,
                "message": (
                    f"No competitor products found for '{product_name}' "
                    f"in category '{category}'."
                )
            }

    # Get price floor for use in deterministic pricing
    price_floor      = _get_device_price_floor(db, product_name)
    det              = _compute_deterministic_price(similar_products, price_floor)
    keywords         = extract_keywords(product_name)
    pricing_insights = analyze_pricing(similar_products, base_cost)

    if det:
        pricing_insights["recommended_price"] = det["recommended_price"]
        pricing_insights["min_price"]          = det["min_price"]
        pricing_insights["max_price"]          = det["max_price"]
        pricing_insights["market_avg_price"]   = det["recommended_price"]
        pricing_insights["market_min_price"]   = det["min_price"]
        pricing_insights["market_max_price"]   = det["max_price"]
        pricing_insights["confidence"]         = det["confidence"]
        pricing_insights["product_count"]      = det["product_count"]

        rec_p = det["recommended_price"]
        if rec_p > 0 and base_cost > 0:
            pricing_insights["profit_margin"] = round(((rec_p - base_cost) / rec_p) * 100, 1)

    sales_insights = analyze_sales_potential(
        products=similar_products,
        source=source_key,
        base_cost=base_cost,
        recommended_price=pricing_insights["recommended_price"],
        category=resolved_category,
        db=db,
    )

    competition_insights = analyze_competition(similar_products, resolved_category, keywords)
    market_gaps = detect_market_gaps(
        similar_products, pricing_insights, base_cost, keywords, source=source_key
    )

    result = {
        "success": True,
        "data": {
            "query":            product_name,
            "category":         resolved_category,
            "source":           source,
            "base_cost":        base_cost,
            "data_source":      data_source,
            "tier_used":        tier_used.value if hasattr(tier_used, "value") else str(tier_used),
            "price_floor_used": price_floor,
            "pricing":          pricing_insights,
            "sales":            sales_insights,
            "competition":      competition_insights,
            "gaps":             market_gaps,
            "similar_products": similar_products,
        }
    }

    _NICHE_CACHE[ck] = result
    return result