# # app/api/v1/routes/profitability_ai_router.py

# from fastapi import APIRouter, HTTPException, Depends
# from fastapi.responses import StreamingResponse
# from sqlalchemy.orm import Session

# from app.db.session import get_db
# from app.schemas.profitability import (
#     AnalyzeRequest, ChatRequest,
#     ScenarioAIRequest, HealthAIRequest,
# )
# from app.services.profitability_service import require_tier
# from app.services.ollama_service import (
#     ollama_is_running, model_is_available,
#     stream_ollama, complete_ollama,
#     SYSTEM_PROMPT, OLLAMA_MODEL,
#     build_analysis_prompt, build_chat_prompt,
#     build_scenario_prompt, build_health_prompt,
#     build_market_prompt,
# )

# router = APIRouter(prefix="/profitability/ai", tags=["Profitability AI"])


# # ── SSE helpers ────────────────────────────────────────────────────────────────

# async def _sse_gen(prompt: str, system: str = SYSTEM_PROMPT):
#     async for token in stream_ollama(prompt, system):
#         safe = token.replace("\n", "\\n")
#         yield f"data: {safe}\n\n"
#     yield "data: [DONE]\n\n"


# def _sse(prompt: str, system: str = SYSTEM_PROMPT) -> StreamingResponse:
#     return StreamingResponse(
#         _sse_gen(prompt, system),
#         media_type="text/event-stream",
#         headers={
#             "Cache-Control":               "no-cache",
#             "X-Accel-Buffering":           "no",
#             "Access-Control-Allow-Origin": "*",
#         },
#     )


# async def _check_ollama():
#     if not await ollama_is_running():
#         raise HTTPException(
#             status_code=503,
#             detail={"error": "ollama_offline", "message": "Run: ollama serve"},
#         )


# def _check_tier(user_id, required, db):
#     try:
#         require_tier(user_id, required, db)
#     except PermissionError:
#         raise HTTPException(
#             status_code=403,
#             detail={"error": "upgrade_required", "required_tier": required},
#         )


# # ── Endpoints ──────────────────────────────────────────────────────────────────

# @router.get("/status")
# async def ai_status():
#     """Frontend polls this to know if Ollama + model are ready."""
#     running   = await ollama_is_running()
#     has_model = await model_is_available() if running else False
#     status    = "ready" if (running and has_model) else ("no_model" if running else "offline")
#     return {
#         "ollama_running":  running,
#         "model_available": has_model,
#         "model":           OLLAMA_MODEL,
#         "status":          status,
#         "setup_hint": (
#             f"Run: ollama pull {OLLAMA_MODEL}" if running and not has_model else
#             "Run: ollama serve" if not running else None
#         ),
#     }


# @router.post("/analyze")
# async def analyze_stream(req: AnalyzeRequest, db: Session = Depends(get_db)):
#     """
#     Full profitability analysis — streamed SSE.
#     Premium only.
#     """
#     _check_tier(req.user_id, "premium", db)
#     await _check_ollama()
#     prompt = build_analysis_prompt(req.calc_result, req.inputs)
#     return _sse(prompt)


# @router.post("/analyze-sync")
# async def analyze_sync(req: AnalyzeRequest, db: Session = Depends(get_db)):
#     """Non-streaming analysis for simpler clients. Premium only."""
#     _check_tier(req.user_id, "premium", db)
#     await _check_ollama()
#     prompt = build_analysis_prompt(req.calc_result, req.inputs)
#     text   = await complete_ollama(prompt)
#     return {"analysis": text, "model": OLLAMA_MODEL}


# @router.post("/chat")
# async def chat_stream(req: ChatRequest, db: Session = Depends(get_db)):
#     """
#     Conversational Q&A — streamed SSE. Basic+ only.
#     Seller asks questions, gets answers in context of their numbers.
#     """
#     _check_tier(req.user_id, "basic", db)
#     await _check_ollama()
#     prompt = build_chat_prompt(req.question, req.calc_context, req.history)
#     return _sse(prompt)


# @router.post("/scenario-advice")
# async def scenario_advice_stream(req: ScenarioAIRequest, db: Session = Depends(get_db)):
#     """
#     AI picks the best of the 4 scenarios and explains why.
#     Streamed SSE. Premium only.
#     """
#     _check_tier(req.user_id, "premium", db)
#     await _check_ollama()
#     prompt = build_scenario_prompt(req.scenarios, req.base_inputs)
#     return _sse(prompt)


# @router.post("/health-advice")
# async def health_advice_stream(req: HealthAIRequest, db: Session = Depends(get_db)):
#     """
#     Turns health score data into a prioritized action plan.
#     Streamed SSE. Premium only.
#     """
#     _check_tier(req.user_id, "premium", db)
#     await _check_ollama()
#     prompt = build_health_prompt(req.health_data, req.inputs)
#     return _sse(prompt)


# @router.post("/market-advice")
# async def market_advice_stream(
#     market_intel: dict,
#     selling_price: float,
#     category: str,
#     user_id: str = None,
#     db: Session = Depends(get_db),
# ):
#     """
#     AI reads the real market intel data and gives positioning advice.
#     Streamed SSE. Premium only.
#     """
#     _check_tier(user_id, "premium", db)
#     await _check_ollama()
#     prompt = build_market_prompt(market_intel, selling_price, category)
#     return _sse(prompt)


# @router.post("/quick-tip")
# async def quick_tip(req: AnalyzeRequest, db: Session = Depends(get_db)):
#     """
#     One-liner tip — non-streaming, fast. Basic+ only.
#     Used for inline nudges in the calculator view.
#     """
#     _check_tier(req.user_id, "basic", db)
#     if not await ollama_is_running():
#         return {"tip": None, "offline": True}

#     margin = req.calc_result.get("net_margin_pct", 0)
#     acos   = req.calc_result.get("acos_pct", 0)
#     ret    = req.inputs.get("return_rate_pct", 0)
#     price  = req.calc_result.get("selling_price", 0)
#     cat    = req.inputs.get("category", "product")

#     prompt = (
#         f"Amazon FBA {cat}: {margin:.1f}% margin, {acos:.1f}% ACOS, "
#         f"{ret:.0f}% returns, ₹{price:,.0f} price. "
#         f"One specific tip in under 15 words."
#     )
#     tip = await complete_ollama(
#         prompt,
#         "Terse Amazon advisor. One tip only. No preamble. Start with the action verb."
#     )
#     return {"tip": tip.strip(), "model": OLLAMA_MODEL}


# app/api/v1/routes/profitability_ai_router.py

import json
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.profitability import (
    AnalyzeRequest, ChatRequest,
    ScenarioAIRequest, HealthAIRequest,
)
from app.services.profitability_service import require_tier
from app.services.ollama_service import (
    ollama_is_running, model_is_available,
    stream_ollama, complete_ollama,
    SYSTEM_PROMPT, OLLAMA_MODEL,
    build_analysis_prompt, build_chat_prompt,
    build_scenario_prompt, build_health_prompt,
    build_market_prompt,
)

router = APIRouter(prefix="/profitability/ai", tags=["Profitability AI"])


# ── SSE helpers ────────────────────────────────────────────────────────────────

async def _sse_gen(prompt: str, system: str = SYSTEM_PROMPT):
    async for token in stream_ollama(prompt, system):
        yield f"data: {json.dumps(token)}\n\n"
    yield "data: [DONE]\n\n"


def _sse(prompt: str, system: str = SYSTEM_PROMPT) -> StreamingResponse:
    return StreamingResponse(
        _sse_gen(prompt, system),
        media_type="text/event-stream",
        headers={
            "Cache-Control":               "no-cache",
            "X-Accel-Buffering":           "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


async def _check_ollama():
    if not await ollama_is_running():
        raise HTTPException(
            status_code=503,
            detail={"error": "ollama_offline", "message": "Run: ollama serve"},
        )


def _check_tier(user_id, required, db):
    try:
        require_tier(user_id, required, db)
    except PermissionError:
        raise HTTPException(
            status_code=403,
            detail={"error": "upgrade_required", "required_tier": required},
        )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/status")
async def ai_status():
    """Frontend polls this to know if Ollama + model are ready."""
    running   = await ollama_is_running()
    has_model = await model_is_available() if running else False
    status    = "ready" if (running and has_model) else ("no_model" if running else "offline")
    return {
        "ollama_running":  running,
        "model_available": has_model,
        "model":           OLLAMA_MODEL,
        "status":          status,
        "setup_hint": (
            f"Run: ollama pull {OLLAMA_MODEL}" if running and not has_model else
            "Run: ollama serve" if not running else None
        ),
    }


@router.post("/analyze")
async def analyze_stream(req: AnalyzeRequest, db: Session = Depends(get_db)):
    """Full profitability analysis — streamed SSE. Premium only."""
    _check_tier(req.user_id, "premium", db)
    await _check_ollama()
    prompt = build_analysis_prompt(req.calc_result, req.inputs)
    return _sse(prompt)


@router.post("/analyze-sync")
async def analyze_sync(req: AnalyzeRequest, db: Session = Depends(get_db)):
    """Non-streaming analysis for simpler clients. Premium only."""
    _check_tier(req.user_id, "premium", db)
    await _check_ollama()
    prompt = build_analysis_prompt(req.calc_result, req.inputs)
    text   = await complete_ollama(prompt)
    return {"analysis": text, "model": OLLAMA_MODEL}


@router.post("/chat")
async def chat_stream(req: ChatRequest, db: Session = Depends(get_db)):
    """Conversational Q&A — streamed SSE. Basic+ only."""
    _check_tier(req.user_id, "basic", db)
    await _check_ollama()
    prompt = build_chat_prompt(req.question, req.calc_context, req.history)
    return _sse(prompt)


@router.post("/scenario-advice")
async def scenario_advice_stream(req: ScenarioAIRequest, db: Session = Depends(get_db)):
    """AI picks the best of the 4 scenarios and explains why. Streamed SSE. Premium only."""
    _check_tier(req.user_id, "premium", db)
    await _check_ollama()
    prompt = build_scenario_prompt(req.scenarios, req.base_inputs)
    return _sse(prompt)


@router.post("/health-advice")
async def health_advice_stream(req: HealthAIRequest, db: Session = Depends(get_db)):
    """Turns health score data into a prioritized action plan. Streamed SSE. Premium only."""
    _check_tier(req.user_id, "premium", db)
    await _check_ollama()
    prompt = build_health_prompt(req.health_data, req.inputs)
    return _sse(prompt)


@router.post("/market-advice")
async def market_advice_stream(
    market_intel: dict,
    selling_price: float,
    category: str,
    user_id: str = None,
    db: Session = Depends(get_db),
):
    """AI reads the real market intel data and gives positioning advice. Streamed SSE. Premium only."""
    _check_tier(user_id, "premium", db)
    await _check_ollama()
    prompt = build_market_prompt(market_intel, selling_price, category)
    return _sse(prompt)


@router.post("/quick-tip")
async def quick_tip(req: AnalyzeRequest, db: Session = Depends(get_db)):
    """One-liner tip — non-streaming, fast. Basic+ only."""
    _check_tier(req.user_id, "basic", db)
    if not await ollama_is_running():
        return {"tip": None, "offline": True}

    margin = req.calc_result.get("net_margin_pct", 0)
    acos   = req.calc_result.get("acos_pct", 0)
    ret    = req.inputs.get("return_rate_pct", 0)
    price  = req.calc_result.get("selling_price", 0)
    cat    = req.inputs.get("category", "product")

    prompt = (
        f"Amazon FBA {cat}: {margin:.1f}% margin, {acos:.1f}% ACOS, "
        f"{ret:.0f}% returns, ₹{price:,.0f} price. "
        f"One specific tip in under 15 words."
    )
    tip = await complete_ollama(
        prompt,
        "Terse Amazon advisor. One tip only. No preamble. Start with the action verb."
    )
    return {"tip": tip.strip(), "model": OLLAMA_MODEL}