# server_py/config.py - FIXED
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Core Settings
    SECRET_KEY: str = "secret"
    Gemini_API_KEY: str = ""
    VITE_API_URL: str = ""
    DATABASE_URL: str = ""
    AUTHKEY_API_KEY: str = ""
    
    # DataForSEO API
    DATAFORSEO_LOGIN: str = ""
    DATAFORSEO_PASSWORD: str = ""
    
    # Amazon SP-API (Sandbox & Production)
    AMAZON_LWA_CLIENT_ID: str = ""
    AMAZON_LWA_CLIENT_SECRET: str = ""
    AMAZON_SP_API_ROLE_ARN: str = ""
    
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