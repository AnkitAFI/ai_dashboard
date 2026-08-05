# server_py/config.py - FIXED
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Core Settings
    SECRET_KEY: str = "secret"
    Gemini_API_KEY: str = ""
    VITE_API_URL: str = ""
    DATABASE_URL: str = ""
    
    # DataForSEO API
    DATAFORSEO_LOGIN: str = ""
    DATAFORSEO_PASSWORD: str = ""
    
    # Amazon SP-API (Sandbox & Production)
    AMAZON_LWA_CLIENT_ID: str = ""
    AMAZON_LWA_CLIENT_SECRET: str = ""
    AMAZON_SP_API_ROLE_ARN: str = ""
    
    # Amazon Advertising API & LWA Configuration (Production by default)
    AMAZON_ADS_ENV: str = "production"
    AMAZON_ADS_API_BASE_URL: str = "https://advertising-api.amazon.com"
    AMAZON_LWA_TOKEN_URL: str = "https://api.amazon.com/auth/o2/token"
    AMAZON_ADS_OAUTH_AUTHORIZE_URL: str = "https://apac.account.amazon.com/ap/oa"
    AMAZON_ADS_OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/v1/amazon/callback"
    AMAZON_ADS_OAUTH_SCOPE: str = "advertising::campaign_management"
    AMAZON_ADS_CLIENT_ID: str = ""
    AMAZON_ADS_CLIENT_SECRET: str = ""
    FRONTEND_APP_URL: str = "http://localhost:3000"
    BACKEND_API_BASE_URL: str = "http://localhost:8000"
    
    # Ollama Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Optional Settings
    DEFAULT_LOCATION_CODE: int = 2840
    DEFAULT_LANGUAGE_CODE: str = "en_US"
    TASK_WAIT_TIME: int = 90

    class Config:
        env_file = "../../.env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()