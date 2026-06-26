from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

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

# ── Database startup: creates all tables, the `users` VIEW, and both
# ── INSTEAD OF triggers. Safe to run on every restart (idempotent).
run_startup_setup()

# Initialize FastAPI App
app = FastAPI(title="AI Dashboard API", version="1.0.0")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
