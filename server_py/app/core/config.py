import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

# Resolve absolute path to .env (works from any working directory)
_cur_dir = os.path.dirname(os.path.abspath(__file__))
_possible_env_paths = [
    os.path.abspath(os.path.join(_cur_dir, "..", "..", "..", ".env")), # ai_dashboard/.env
    os.path.abspath(os.path.join(_cur_dir, "..", "..", ".env")),       # server_py/.env fallback
    os.path.abspath(os.path.join(os.getcwd(), ".env")),                # CWD/.env
]
for _env_p in _possible_env_paths:
    if os.path.exists(_env_p):
        load_dotenv(dotenv_path=_env_p, override=False)
        break

class Settings(BaseSettings):
    # Core Settings
    SECRET_KEY: str = "secret"
    Gemini_API_KEY: str = ""
    VITE_API_URL: str = ""
    FRONTEND_URL: str = ""
    DATABASE_URL: str = ""
    AUTHKEY_API_KEY: str = ""
    AUTHKEY_ENTITY_ID: str = ""
    AUTHKEY_SIGNUP_TEMPLATE_ID: str = ""
    AUTHKEY_RESET_TEMPLATE_ID: str = ""
    
    # DataForSEO API
    DATAFORSEO_LOGIN: str = ""
    DATAFORSEO_PASSWORD: str = ""
    
    # Amazon Ads (LWA)
    AMAZON_LWA_CLIENT_ID: str = ""
    AMAZON_LWA_CLIENT_SECRET: str = ""
    AMAZON_LWA_REDIRECT_URI: str = ""

    # Amazon SP-API (Production)
    AMAZON_SP_API_APP_ID: str = ""
    AMAZON_SP_API_LWA_CLIENT_ID: str = ""
    AMAZON_SP_API_LWA_CLIENT_SECRET: str = ""
    AMAZON_SP_API_LWA_REDIRECT_URI: str = ""
    AMAZON_SP_API_ROLE_ARN: str = ""
    AMAZON_SP_API_AWS_ACCESS_KEY: str = ""
    AMAZON_SP_API_AWS_SECRET_KEY: str = ""

    # Amazon SQS (Hijacker & Buy Box Alerts)
    # AMAZON_SQS_QUEUE_URL: The full URL of your AWS SQS queue
    AMAZON_SQS_QUEUE_URL: str = ""
    # AMAZON_SQS_DESTINATION_ID: The destinationId returned by SP-API CreateDestination
    #   This links the SP-API subscription to your SQS queue ARN
    AMAZON_SQS_DESTINATION_ID: str = ""
    # Region for SQS (India = ap-south-1). Uses AMAZON_SP_API_AWS_ACCESS_KEY/SECRET above.
    AWS_REGION: str = "ap-south-1"

    # Ollama Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Optional Settings
    DEFAULT_LOCATION_CODE: int = 2840
    DEFAULT_LANGUAGE_CODE: str = "en_US"
    TASK_WAIT_TIME: int = 90

    class Config:
        case_sensitive = False
        extra = "ignore"


settings = Settings()
