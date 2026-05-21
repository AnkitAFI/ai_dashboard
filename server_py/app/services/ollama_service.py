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
OLLAMA_TIMEOUT  = 120

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


async def stream_ollama(prompt: str, system: str = SYSTEM_PROMPT) -> AsyncGenerator[str, None]:
    payload = {
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,
        "system": system,
        "options": {
            "temperature": 0.3,
            "top_p": 0.9,
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


async def complete_ollama(prompt: str, system: str = SYSTEM_PROMPT) -> str:
    chunks = []

    async for token in stream_ollama(prompt, system):
        chunks.append(token)

    text = "".join(chunks)

    # 🔧 Fix broken spacing from LLM
    text = text.replace("\n", "\n\n")
    text = text.replace("  ", " ")
    text = text.strip()

    return text


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