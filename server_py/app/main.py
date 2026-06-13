from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

from app.api.v1.api import api_router
from app.api.v1.routes.legacy_router import router as legacy_router
from app.db.session import engine
from app.models import legacy_models as models

# Initialize Database (Legacy approach preserved)
models.Base.metadata.create_all(bind=engine)

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
