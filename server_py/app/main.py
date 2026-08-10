import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

# ── Logging setup ──────────────────────────────────────────────────────────────
# Ensures logger.error() calls are always visible in the terminal / server logs.
# Change level to logging.DEBUG for more verbose output during development.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Load environment variables from .env
# Load environment variables from .env
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
print(f"Loading .env from: {env_path}")
load_dotenv(dotenv_path=env_path)
print(f"HMAC loaded in main.py: {os.environ.get('HMAC_SECRET_KEY', 'NOT_FOUND')[:5]}...")

from app.api.v1.api import api_router
from app.api.v1.routes.legacy_router import router as legacy_router
from app.db.session import engine
from app.models import legacy_models as models
from app.db_setup import run_startup_setup

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Database startup: creates all tables, the `users` VIEW, and both
    # ── INSTEAD OF triggers. Safe to run on every restart (idempotent).
    run_startup_setup()
    
    # ── Start Background Workers
    worker_tasks = []
    try:
        from app.services.amazon_ads.dayparting_scheduler import start_dayparting_engine, stop_dayparting_engine
        start_dayparting_engine()
        
        from app.services.amazon_ads.ingestion_scheduler import start_ingestion_scheduler, stop_ingestion_scheduler
        start_ingestion_scheduler()
        
        # Start Campaign Builder Worker
        from app.services.amazon_ads.campaign_builder_worker import campaign_builder_worker_loop
        import asyncio
        builder_task = asyncio.create_task(campaign_builder_worker_loop())
        worker_tasks.append(builder_task)
    except Exception as e:
        logger.error(f"Failed to start Background Workers: {e}")
        
    yield
    
    # ── Stop Background Workers
    try:
        stop_dayparting_engine()
        stop_ingestion_scheduler()
        for task in worker_tasks:
            task.cancel()
    except Exception as e:
        pass

# Initialize FastAPI App
app = FastAPI(title="AI Dashboard API", version="1.0.0", lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://*.razorpay.com",
        "http://localhost:3000",
        "https://insydz.com",
        "https://www.insydz.com",
        "http://localhost:8000",
        "https://api.insydz.com",    
    ],
    # allow_origins_regex="https://.\*.razorpay.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register central API router under /api
app.include_router(api_router, prefix="/api")

# Register legacy router at the ROOT for 100% functional parity (e.g. /users/login)
app.include_router(legacy_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}


# ── Patterns that indicate a raw internal error leaked into detail ─────────────
# Mirrors the pattern list in lib/sanitize-error.ts on the frontend.
# Both layers protect independently so neither is a single point of failure.
_INTERNAL_ERROR_PATTERNS = (
    "psycopg2",
    "DB error",
    "Database error",
    "ForeignKeyViolation",
    "ForeignKey",
    "violates foreign key",
    "violates not-null",
    "UniqueViolation",
    "IntegrityError",
    "INSERT INTO",
    "UPDATE ",
    "DELETE FROM",
    "SELECT ",
    "users_legacy",
    "payment_orders",
    "sqlalchemy",
    "asyncpg",
    "DETAIL: Key",
    "SQLSTATE",
    'relation "',
    'column "',
    "syntax error at",
    "Traceback",
    "Exception:",
)


def _detail_contains_internal_error(detail: object) -> bool:
    """Return True if *detail* looks like a raw internal/DB error string."""
    if not isinstance(detail, str):
        return False
    return any(pattern in detail for pattern in _INTERNAL_ERROR_PATTERNS)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Intercepts every HTTPException before FastAPI serialises it.

    • 4xx responses  → passed through untouched.
      These contain intentional, user-facing messages such as
      "Incorrect password", "Email already registered", "Invalid OTP" etc.

    • 5xx responses  → detail is inspected.
      If it contains known internal-error patterns (psycopg2, SQL fragments,
      table names, stack traces …) the detail is replaced with a safe generic
      message and the real error is logged server-side only.
      If the detail is already a safe custom message it is kept as-is.
    """
    detail = exc.detail

    if exc.status_code >= 500 and _detail_contains_internal_error(detail):
        logger.error(
            "Sanitised raw 5xx detail on %s %s: %s",
            request.method,
            request.url.path,
            detail,
        )
        detail = "An internal server error occurred. Please try again or contact support."

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail},
        headers=getattr(exc, "headers", None) or {},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # ── 1. psycopg2 database errors ──────────────────────────────────────────
    try:
        import psycopg2
        if isinstance(exc, psycopg2.Error):
            logger.error(
                "psycopg2 DB error on %s %s: %s",
                request.method,
                request.url.path,
                exc,
                exc_info=True,
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "A database error occurred. Please try again or contact support."},
            )
    except ImportError:
        pass  # psycopg2 not installed in this environment — skip check

    # ── 2. Intentional HTTP errors (401, 403, 404, 422, etc.) ────────────────
    # Re-raise so FastAPI's built-in HTTPException handler runs normally.
    if isinstance(exc, HTTPException):
        raise exc

    # ── 3. Any other unhandled exception ─────────────────────────────────────
    logger.error(
        "Unhandled exception on %s %s: %s",
        request.method,
        request.url.path,
        exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again or contact support."},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
