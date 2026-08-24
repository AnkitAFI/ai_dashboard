import logging
import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_sms_otp(mobile_number: str, otp: str, template_type: str = "signup") -> bool:
    """
    Send SMS OTP via Authkey.io.
    template_type: "signup" or "reset"
    """
    try:
        api_key = getattr(settings, "AUTHKEY_API_KEY", "")
        if not api_key:
            logger.warning("[SMS] Authkey API Key not set in environment. Skipping SMS send.")
            print("⚠️ [SMS] Authkey API Key not set in environment. Skipping SMS send.")
            return False
            
        url = "https://api.authkey.io/request"
        clean_mobile = str(mobile_number).replace("+", "").replace(" ", "").replace("-", "")
        
        # Default to India if no country code provided
        country_code = "91"
        if len(clean_mobile) > 10:
            country_code = clean_mobile[:-10]
            clean_mobile = clean_mobile[-10:]
            
        if template_type == "reset":
            template_id = getattr(settings, "AUTHKEY_RESET_TEMPLATE_ID", "")
            sms_text = f"Your Insydz verification code for password reset is {otp}. Please do not share this code with anyone. Insydz is division of AAVAPTI TECHNOLOGIES PRIVATE LIMITED."
        else:
            template_id = getattr(settings, "AUTHKEY_SIGNUP_TEMPLATE_ID", "")
            sms_text = f"Your Insydz verification code for account signup is {otp}. Please do not share this code with anyone. Insydz is division of AAVAPTI TECHNOLOGIES PRIVATE LIMITED."

        params = {
            "authkey": api_key,
            "mobile": clean_mobile,
            "country_code": country_code,
            "sms": sms_text,
            "sender": "AAVPTI",
            "entity_id": getattr(settings, "AUTHKEY_ENTITY_ID", ""),
            "template_id": template_id
        }
        
        response = requests.get(url, params=params, timeout=10)
        logger.info(f"SMS OTP dispatch to {clean_mobile} -> Status: {response.status_code}, Response: {response.text}")
        print(f"📲 [Authkey SMS] Response for {clean_mobile}: {response.text}")
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Error sending SMS OTP to {mobile_number}: {e}")
        print(f"❌ [Authkey SMS] Exception sending SMS OTP: {e}")
        return False
