# # app/services/ollama_service.py

# import httpx
# import json
# import logging
# from typing import AsyncGenerator

# logger = logging.getLogger(__name__)

# OLLAMA_BASE_URL = "http://localhost:11434"
# OLLAMA_MODEL    = "llama3.2:3b"
# OLLAMA_TIMEOUT  = 120

# SYSTEM_PROMPT = """You are an expert Amazon and Flipkart FBA profitability analyst for Indian sellers.
# You give sharp, specific, actionable advice based on the exact numbers provided.
# Always respond in clear numbered points. Use ₹ for rupees. Be direct, no filler words.
# Never repeat the question. Jump straight to the insight."""


# async def ollama_is_running() -> bool:
#     try:
#         async with httpx.AsyncClient(timeout=3) as client:
#             r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
#             return r.status_code == 200
#     except Exception:
#         return False


# async def model_is_available() -> bool:
#     try:
#         async with httpx.AsyncClient(timeout=5) as client:
#             r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
#             tags = r.json().get("models", [])
#             return any(OLLAMA_MODEL in m.get("name", "") for m in tags)
#     except Exception:
#         return False


# async def stream_ollama(prompt: str, system: str = SYSTEM_PROMPT) -> AsyncGenerator[str, None]:
#     payload = {
#         "model":  OLLAMA_MODEL,
#         "prompt": prompt,
#         "stream": True,
#         "system": system,
#         "options": {
#             "temperature": 0.3,
#             "top_p": 0.9,
#             "num_predict": 600,
#         },
#     }
#     try:
#         async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
#             async with client.stream(
#                 "POST", f"{OLLAMA_BASE_URL}/api/generate", json=payload
#             ) as resp:
#                 if resp.status_code != 200:
#                     yield f"[Ollama error {resp.status_code}]"
#                     return
#                 async for raw_line in resp.aiter_lines():
#                     if not raw_line.strip():
#                         continue
#                     try:
#                         chunk = json.loads(raw_line)
#                         token = chunk.get("response", "")
#                         if token:
#                             yield token
#                         if chunk.get("done"):
#                             break
#                     except json.JSONDecodeError:
#                         continue
#     except httpx.ConnectError:
#         yield "\n\n[Ollama is not running. Start it with: ollama serve]"
#     except Exception as e:
#         logger.error(f"Ollama stream error: {e}")
#         yield f"\n\n[AI error: {e}]"


# async def complete_ollama(prompt: str, system: str = SYSTEM_PROMPT) -> str:
#     chunks = []
#     async for token in stream_ollama(prompt, system):
#         chunks.append(token)
#     return "".join(chunks)


# # ── Prompt builders ────────────────────────────────────────────────────────────

# def build_analysis_prompt(calc: dict, inp: dict) -> str:
#     bd     = calc.get("cost_breakdown", {})
#     alerts = [a["message"] for a in calc.get("alerts", [])]
#     return f"""Analyze this Amazon/Flipkart FBA product and give me 4 specific recommendations:

# NUMBERS:
# - Selling price:  ₹{calc.get('selling_price', '?'):,}
# - Product cost:   ₹{inp.get('product_cost', '?')}
# - Total cost:     ₹{calc.get('total_cost', '?'):,}
# - Profit/unit:    ₹{calc.get('profit_per_unit', '?')}
# - Net margin:     {calc.get('net_margin_pct', '?')}%
# - Monthly units:  {inp.get('monthly_units', '?')}
# - Monthly profit: ₹{calc.get('monthly_profit', '?'):,}
# - ROI:            {calc.get('roi_pct', 'N/A')}%
# - ACOS:           {calc.get('acos_pct', 'N/A')}%
# - Return rate:    {inp.get('return_rate_pct', 0)}%
# - Category:       {inp.get('category', '?')}
# - Marketplace:    {inp.get('marketplace', 'Amazon')}

# COST BREAKDOWN:
# - FBA fee:       ₹{bd.get('fba_fee', '?')}
# - Referral fee:  ₹{bd.get('referral_fee', '?')}
# - Ad spend:      ₹{bd.get('ad_spend', '?')}
# - Storage fee:   ₹{bd.get('storage_fee', '?')}
# - Returns cost:  ₹{bd.get('return_cost', '?')}

# EXISTING ALERTS: {'; '.join(alerts) if alerts else 'None'}

# Give 4 numbered recommendations with exact rupee amounts."""


# def build_chat_prompt(question: str, context: dict, history: list) -> str:
#     history_text = ""
#     for msg in history[-6:]:
#         role = "Seller" if msg["role"] == "user" else "Advisor"
#         history_text += f"{role}: {msg['content']}\n"

#     return f"""{history_text}
# Product context:
# - Selling price:  ₹{context.get('selling_price', '?'):,}
# - Profit/unit:    ₹{context.get('profit_per_unit', '?')}
# - Net margin:     {context.get('net_margin_pct', '?')}%
# - Monthly profit: ₹{context.get('monthly_profit', '?'):,}
# - ACOS:           {context.get('acos_pct', 'N/A')}%
# - Return rate:    {context.get('return_rate_pct', 0)}%
# - Category:       {context.get('category', '?')}
# - Marketplace:    {context.get('marketplace', 'Amazon')}

# Seller question: {question}

# Answer specifically using the numbers above."""


# def build_scenario_prompt(scenarios: list, base: dict) -> str:
#     rows = "\n".join([
#         f"- {s['label']}: ₹{s['profit_per_unit']}/unit, "
#         f"{s['net_margin_pct']:.1f}% margin, "
#         f"₹{s['monthly_profit']:,.0f}/month, "
#         f"ROI {s['roi_pct']:.1f}%, ACOS {s['acos_pct']:.1f}%"
#         for s in scenarios
#     ])
#     return f"""I have 4 pricing strategies for my {base.get('marketplace','Amazon')} product 
# (base price ₹{base.get('selling_price','?'):,}, category: {base.get('category','?')}):

# {rows}

# Which strategy should I choose? Give a 3-point recommendation with specific reasoning 
# based on these exact numbers. Consider margin sustainability, growth potential, and cash flow."""


# def build_health_prompt(health: dict, inputs: dict) -> str:
#     metrics = "\n".join([
#         f"- {m['label']}: {m['score']:.0f}/100 ({m['status']}) — {m['detail']}"
#         for m in health.get("metrics", [])
#     ])
#     return f"""My Amazon/Flipkart business health score is {health.get('overall_score','?')}/100 
# ({health.get('overall_label','?')}).

# Metrics:
# {metrics}

# Product: ₹{inputs.get('selling_price','?'):,} selling price, 
# {inputs.get('monthly_units','?')} units/month,
# Category: {inputs.get('category','?')}

# Give a prioritized 5-step action plan to improve this score. Include specific rupee targets."""


# def build_market_prompt(intel: dict, selling_price: float, category: str) -> str:
#     b = intel.get("benchmarks", {})
#     bands = intel.get("price_bands", [])
#     high_opp = [p["band"] for p in bands if p.get("opportunity") == "High"]
#     return f"""Market analysis for {category} on {intel.get('marketplace','Amazon').capitalize()}:

# MARKET DATA (real database):
# - Products in category: {b.get('num_products', '?')}
# - Average price:        ₹{b.get('avg_price', '?'):,}
# - Price range:          ₹{b.get('min_price', '?'):,} – ₹{b.get('max_price', '?'):,}
# - Average rating:       {b.get('avg_rating', 'N/A')}★
# - MRP discount depth:   {b.get('mrp_discount_depth_pct', 'N/A')}%
# - Top brands:           {', '.join(b.get('top_brands', [])[:5])}
# - High opportunity price bands: {', '.join(high_opp) if high_opp else 'None identified'}

# MY SELLING PRICE: ₹{selling_price:,}
# MY PRICE POSITION: {intel.get('your_price_position', 'Unknown')}

# Give me 3 specific pricing and positioning recommendations based on this real market data."""



# app/services/ollama_service.py

import httpx
import json
import logging
from typing import AsyncGenerator
from app.core.config import settings

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = settings.OLLAMA_BASE_URL
OLLAMA_MODEL    = "llama3.2:3b"
OLLAMA_TIMEOUT  = 300

SYSTEM_PROMPT = """You are an expert Amazon and Flipkart FBA profitability analyst for Indian sellers.

CRITICAL FORMATTING RULES (STRICT):
- Always use proper spacing between ALL words
- Never merge words together
- Always write in clean, human-readable English
- Use clear line breaks between paragraphs
- Use numbered points (1., 2., 3., etc.)
- Add a blank line between each point
- Use simple markdown formatting
- Keep sentences short and readable

STYLE:
- Be sharp, specific, and actionable
- Use ₹ for rupees
- No filler words
- No repetition of the question
- Jump straight to insights

OUTPUT FORMAT EXAMPLE:

1. First recommendation  
Explanation...

2. Second recommendation  
Explanation...

3. Third recommendation  
Explanation...
"""


async def ollama_is_running() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


async def model_is_available() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            tags = r.json().get("models", [])
            return any(OLLAMA_MODEL in m.get("name", "") for m in tags)
    except Exception:
        return False


async def stream_ollama(prompt: str, system: str = SYSTEM_PROMPT, temperature: float = 0.3, top_p: float = 0.9) -> AsyncGenerator[str, None]:
    payload = {
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
        "system": system,
        "options": {
            "temperature": temperature,
            "top_p": top_p,
            "num_predict": 600,
        },
    }
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            async with client.stream(
                "POST", f"{OLLAMA_BASE_URL}/api/generate", json=payload
            ) as resp:
                if resp.status_code != 200:
                    yield f"[Ollama error {resp.status_code}]"
                    return
                async for raw_line in resp.aiter_lines():
                    if not raw_line.strip():
                        continue
                    try:
                        chunk = json.loads(raw_line)
                        token = chunk.get("response", "")
                        if token:
                            yield token
                        if chunk.get("done"):
                            break
                    except json.JSONDecodeError:
                        continue
    except httpx.ConnectError:
        yield "\n\n[Ollama is not running. Start it with: ollama serve]"
    except Exception as e:
        logger.error(f"Ollama stream error: {e}")
        yield f"\n\n[AI error: {e}]"


async def complete_ollama(prompt: str, system: str = SYSTEM_PROMPT, temperature: float = 0.3, top_p: float = 0.9) -> str:
    chunks = []

    async for token in stream_ollama(prompt, system, temperature, top_p):
        chunks.append(token)

    text = "".join(chunks)

    text = text.strip()

    return text

async def analyze_product_image_with_minicpm(image_base64_list: list[str]) -> str:
    """
    Sends a list of base64 images to the local Ollama 'minicpm-v' model to extract product details across all angles.
    """
    cleaned_images = []
    for img in image_base64_list:
        if "base64," in img:
            cleaned_images.append(img.split("base64,")[1])
        else:
            cleaned_images.append(img)
        
    prompt = """You are an expert ecommerce product analyst. I am providing you with multiple images of the exact same product.

CRITICAL INSTRUCTIONS:
1. EXHAUSTIVE EXTRACTION: You MUST read and extract EVERY single word of text, feature icon, specification, and dimension visible across ALL images. Leave nothing out.
2. FEATURE GRIDS: If you see a grid of features (e.g., PurColor, Q-Symphony, Adaptive Sound, Wi-Fi, Bluetooth), you MUST list every single one.
3. DIMENSIONS & SPECS: If you see dimensions (e.g., Width, Height, Depth, Weight), you MUST extract the exact numbers and units. Be careful with numbers.
4. APPS & LOGOS: If you see app logos (e.g., Netflix, YouTube, Prime Video, Sony LIV, ZEE5), list exactly the ones you recognize.
5. NO HALLUCINATION: You must ONLY list things that are physically visible in the images. If you do not see text mentioning HDMI ports, USB ports, or specific resolutions, DO NOT invent them. 

You must return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "visual_description": "A massive, exhaustive paragraph detailing every single feature, dimension, app, and spec found in the images.",
  "detected_attributes": {
    "brand": "Brand Name (if found)",
    "...": "Extract ALL specific features actually printed in text or explicitly visible."
  },
  "missing_critical_attributes": [
    "Leave this array EMPTY [] in 99% of cases. Only list a missing attribute if it is IMPOSSIBLE to know what the product even is without it."
  ]
}"""
    
    payload = {
        "model": "minicpm-v",
        "prompt": prompt,
        "images": cleaned_images,
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.0,
            "top_p": 0.1
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            if response.status_code != 200:
                logger.error(f"Vision model error: {response.text}")
                return ""
                
            data = response.json()
            return data.get("response", "").strip()
    except Exception as e:
        import traceback
        logger.error(f"Failed to analyze image with minicpm-v: {e}\n{traceback.format_exc()}")
        return ""

# ── Prompt builders ────────────────────────────────────────────────────────────

def build_analysis_prompt(calc: dict, inp: dict) -> str:
    bd     = calc.get("cost_breakdown", {})
    alerts = [a["message"] for a in calc.get("alerts", [])]
    return f"""Analyze this Amazon/Flipkart FBA product and give me 4 specific recommendations:

NUMBERS:
- Selling price:  ₹{calc.get('selling_price', '?'):,}
- Product cost:   ₹{inp.get('product_cost', '?')}
- Total cost:     ₹{calc.get('total_cost', '?'):,}
- Profit/unit:    ₹{calc.get('profit_per_unit', '?')}
- Net margin:     {calc.get('net_margin_pct', '?')}%
- Monthly units:  {inp.get('monthly_units', '?')}
- Monthly profit: ₹{calc.get('monthly_profit', '?'):,}
- ROI:            {calc.get('roi_pct', 'N/A')}%
- ACOS:           {calc.get('acos_pct', 'N/A')}%
- Return rate:    {inp.get('return_rate_pct', 0)}%
- Category:       {inp.get('category', '?')}
- Marketplace:    {inp.get('marketplace', 'Amazon')}

COST BREAKDOWN:
- FBA fee:       ₹{bd.get('fba_fee', '?')}
- Referral fee:  ₹{bd.get('referral_fee', '?')}
- Ad spend:      ₹{bd.get('ad_spend', '?')}
- Storage fee:   ₹{bd.get('storage_fee', '?')}
- Returns cost:  ₹{bd.get('return_cost', '?')}

EXISTING ALERTS: {'; '.join(alerts) if alerts else 'None'}

Give 4 numbered recommendations with exact rupee amounts."""


def build_chat_prompt(question: str, context: dict, history: list) -> str:
    history_text = ""
    for msg in history[-6:]:
        role = "Seller" if msg["role"] == "user" else "Advisor"
        history_text += f"{role}: {msg['content']}\n"

    return f"""{history_text}
Product context:
- Selling price:  ₹{context.get('selling_price', '?'):,}
- Profit/unit:    ₹{context.get('profit_per_unit', '?')}
- Net margin:     {context.get('net_margin_pct', '?')}%
- Monthly profit: ₹{context.get('monthly_profit', '?'):,}
- ACOS:           {context.get('acos_pct', 'N/A')}%
- Return rate:    {context.get('return_rate_pct', 0)}%
- Category:       {context.get('category', '?')}
- Marketplace:    {context.get('marketplace', 'Amazon')}

Seller question: {question}

Answer specifically using the numbers above."""


def build_scenario_prompt(scenarios: list, base: dict) -> str:
    rows = "\n".join([
        f"- {s['label']}: ₹{s['profit_per_unit']}/unit, "
        f"{s['net_margin_pct']:.1f}% margin, "
        f"₹{s['monthly_profit']:,.0f}/month, "
        f"ROI {s['roi_pct']:.1f}%, ACOS {s['acos_pct']:.1f}%"
        for s in scenarios
    ])
    return f"""I have 4 pricing strategies for my {base.get('marketplace','Amazon')} product 
(base price ₹{base.get('selling_price','?'):,}, category: {base.get('category','?')}):

{rows}

Which strategy should I choose? Give a 3-point recommendation with specific reasoning 
based on these exact numbers. Consider margin sustainability, growth potential, and cash flow."""


def build_health_prompt(health: dict, inputs: dict) -> str:
    metrics = "\n".join([
        f"- {m['label']}: {m['score']:.0f}/100 ({m['status']}) — {m['detail']}"
        for m in health.get("metrics", [])
    ])
    return f"""My Amazon/Flipkart business health score is {health.get('overall_score','?')}/100 
({health.get('overall_label','?')}).

Metrics:
{metrics}

Product: ₹{inputs.get('selling_price','?'):,} selling price, 
{inputs.get('monthly_units','?')} units/month,
Category: {inputs.get('category','?')}

Give a prioritized 5-step action plan to improve this score. Include specific rupee targets."""


def build_market_prompt(intel: dict, selling_price: float, category: str) -> str:
    b = intel.get("benchmarks", {})
    bands = intel.get("price_bands", [])
    high_opp = [p["band"] for p in bands if p.get("opportunity") == "High"]
    return f"""Market analysis for {category} on {intel.get('marketplace','Amazon').capitalize()}:

MARKET DATA (real database):
- Products in category: {b.get('num_products', '?')}
- Average price:        ₹{b.get('avg_price', '?'):,}
- Price range:          ₹{b.get('min_price', '?'):,} – ₹{b.get('max_price', '?'):,}
- Average rating:       {b.get('avg_rating', 'N/A')}★
- MRP discount depth:   {b.get('mrp_discount_depth_pct', 'N/A')}%
- Top brands:           {', '.join(b.get('top_brands', [])[:5])}
- High opportunity price bands: {', '.join(high_opp) if high_opp else 'None identified'}

MY SELLING PRICE: ₹{selling_price:,}
MY PRICE POSITION: {intel.get('your_price_position', 'Unknown')}

Give me 3 specific pricing and positioning recommendations based on this real market data."""

# ── Listing Agent Prompts ──────────────────────────────────────────────────────

def build_amazon_listing_prompt(raw_description: str, category: str = "General", use_hinglish: bool = False) -> str:
    hinglish_instruction = ""
    if use_hinglish:
        hinglish_instruction = "CRITICAL INSTRUCTION: Include highly searched colloquial 'Hinglish' variations of this product in the backend search terms (e.g., if it's a water bottle, include 'pani ki bottle'). This is targeting Tier 2/3 Indian cities.\n"

    return f"""You are an elite Amazon FBA Compliance Officer and SEO copywriter.
Take the following raw product details and generate an optimized Amazon listing that STRICTLY adheres to Amazon's publishing policies.

CONFLICT RESOLUTION RULE: The provided data has an "ABSOLUTE SOURCE OF TRUTH (Visual AI Analysis)" and "UNVERIFIED USER INPUT". If the user input contradicts the visual analysis (e.g., wrong brand, wrong product, wrong color), you MUST completely discard the contradicting user input and use ONLY the visual analysis. Do not try to merge contradictory items. The image facts are final.

STRICT LEGAL, POLICY & ANTI-HALLUCINATION RULE: 
1. NEVER invent, assume, infer, or guess ANY product details, specifications (like voltage, dimensions, resolution), ports, applications, or features. 
2. You must ONLY use the exact facts provided in the RAW PRODUCT DETAILS. If a detail (like HDMI ports or app names) is not explicitly listed, DO NOT write it.
3. Hallucinating unverified capabilities is illegal and will result in seller account suspension. 
4. DO NOT use promotional phrases like "best", "cheapest", "number 1", or "free shipping" anywhere.
5. Keep descriptions strictly factual and professional.

RAW PRODUCT DETAILS:
{raw_description}
CATEGORY: {category}
{hinglish_instruction}
You must strictly return a JSON object with the following keys exactly:
- "amazon_title": Brand + Core Product + Key Feature + Size/Color (Max 200 chars). NO promotional words.
- "amazon_bullets": A valid JSON array containing exactly 5 strings (e.g., ["bullet 1", "bullet 2", ...]). DO NOT use markdown lists like `- "bullet"`. Detail exact specs, dimensions, and materials found in the RAW DETAILS ONLY. Do not invent marketing fluff.
- "amazon_description": Exhaustive, professional HTML formatted description (use <p>, <b>, <ul>, <li>). List EVERY single detail from the raw data. Output as a SINGLE string on ONE line with NO actual newline characters. Do not output raw unquoted HTML.
- "amazon_search_terms": A single string of backend search terms (max 249 bytes), space-separated, no commas, no duplicate words.

Respond ONLY with the raw, valid JSON object. Do not include ANY markdown formatting like ```json. Do not include ANY conversational text, explanations, or notes before or after the JSON. Ensure all string values are properly escaped and enclosed in double quotes."""

def build_flipkart_listing_prompt(raw_description: str, category: str = "General", use_hinglish: bool = False) -> str:
    hinglish_instruction = ""
    if use_hinglish:
        hinglish_instruction = "CRITICAL INSTRUCTION: Include highly searched colloquial 'Hinglish' variations of this product in the flipkart description text seamlessly (e.g., if it's a water bottle, include 'pani ki bottle'). This is targeting Tier 2/3 Indian cities.\n"

    return f"""You are an elite Flipkart Compliance Officer and SEO copywriter.
Take the following raw product details and generate an optimized Flipkart listing that STRICTLY adheres to Flipkart's publishing policies.

CONFLICT RESOLUTION RULE: Visual Analysis overrides Unverified User Input completely.

STRICT LEGAL, POLICY & ANTI-HALLUCINATION RULE: 
1. NEVER invent, assume, infer, or guess ANY product details, specifications, ports, applications, or features. 
2. ONLY use the exact facts provided in the RAW PRODUCT DETAILS. If a detail is not explicitly listed, DO NOT write it.
3. Hallucinating unverified capabilities will result in immediate account ban. 
4. DO NOT use promotional phrases like "best" or "cheapest".

RAW PRODUCT DETAILS:
{raw_description}
CATEGORY: {category}
{hinglish_instruction}
You must strictly return a JSON object with the following keys exactly:
- "flipkart_title": A concise, Brand-first title (Max 100 chars). Format: [Brand] [Core Product] [Key Feature].
- "flipkart_description": An exhaustive plain text description. STRICTLY NO HTML ALLOWED. Output as a SINGLE string on ONE line with NO actual newline characters (use spaces or dashes to separate points). List ONLY verified specs.

Respond ONLY with the raw, valid JSON object. Do not include ANY markdown formatting like ```json. Do not include ANY conversational text, explanations, or notes before or after the JSON. Ensure all string values are properly escaped and enclosed in double quotes."""

def build_attribute_extraction_prompt(raw_description: str) -> str:
    return f"""You are an expert Ecommerce Catalog Specialist.
Analyze the following product details and extract the core physical attributes required by Amazon and Flipkart APIs.

PRODUCT DETAILS:
{raw_description}

Extract the attributes and return them STRICTLY as a valid JSON object. 
If an attribute is unknown or not mentioned, omit it or use an empty string. 
Keys must be lowercase (e.g. brand, color, size, material, style).

Respond ONLY with valid JSON. Do not include any markdown formatting like ```json."""

def build_aplus_content_prompt(raw_description: str, category: str = "General") -> str:
    return f"""You are an Elite E-commerce Brand Copywriter for Premium A+ Content.
Generate visually engaging Premium A+ Content using ONLY verified facts.

STRICT LEGAL & ANTI-HALLUCINATION RULE: 
You are a premium copywriter, but you MUST remain factual. NEVER invent, assume, or guess ANY product specs, features, apps, or ports. Elevate the tone and make it sound premium without inventing new capabilities. If the raw details say '32 inch TV', make it sound immersive, but do NOT hallucinate that it has '4K resolution' or '3 HDMI ports'. Hallucinating data is strictly prohibited.

CONFLICT RESOLUTION RULE: Visual Analysis overrides Unverified User Input completely.

RAW PRODUCT DETAILS:
{raw_description}
CATEGORY: {category}

You must strictly return a SINGLE JSON object containing all the keys below. Do NOT output multiple JSON objects.
Use the following keys exactly:
- "brand_story_hook": A short, catchy 1-2 sentence premium hook based on verified value (max 150 chars).
- "feature_1_headline": A short, punchy 3-5 word headline for the first major verified feature.
- "feature_1_body": A short paragraph (30-50 words) elaborating on feature 1 using ONLY verified facts.
- "feature_2_headline": A short, punchy 3-5 word headline for the second major verified feature.
- "feature_2_body": A short paragraph (30-50 words) elaborating on feature 2.
- "feature_3_headline": A short, punchy 3-5 word headline for the third major verified feature.
- "feature_3_body": A short paragraph (30-50 words) elaborating on feature 3.

Respond ONLY with valid JSON. Do not include any markdown formatting like ```json. Ensure all string values are properly escaped and enclosed in double quotes."""