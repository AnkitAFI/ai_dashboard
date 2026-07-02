import os
import logging
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

logger = logging.getLogger(__name__)

class BrevoService:
    @staticmethod
    def get_configuration():
        """
        Initializes and returns the Brevo API configuration.
        """
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = os.environ.get("BREVO_API_KEY", "")
        return configuration

    @staticmethod
    def add_contact_to_brevo(email: str, phone_number: str = None, first_name: str = None, last_name: str = None):
        """
        Adds a new contact to Brevo.
        Uses BREVO_SYNC_LIST_ID from environment variables if set.
        Designed to be run as a background task.
        """
        configuration = BrevoService.get_configuration()
        
        if not configuration.api_key['api-key']:
            logger.warning("[Brevo] BREVO_API_KEY not found in environment, skipping contact creation.")
            return False
            
        list_id_str = os.environ.get("BREVO_SYNC_LIST_ID", "")
        
        try:
            api_instance = sib_api_v3_sdk.ContactsApi(sib_api_v3_sdk.ApiClient(configuration))
            
            # create_contact payload
            # update_enabled=True ensures we don't throw an error if they are already in Brevo
            contact_payload = {
                "email": email,
                "update_enabled": True
            }
            
            attributes = {}
            if first_name:
                attributes["FIRSTNAME"] = first_name
            if last_name:
                attributes["LASTNAME"] = last_name
            
            if phone_number:
                # Format to E.164 standard if missing the + sign
                phone_number = phone_number.strip()
                if not phone_number.startswith('+'):
                    if len(phone_number) == 10 and phone_number.isdigit():
                        phone_number = f"+91{phone_number}"
                    elif phone_number.startswith("91") and len(phone_number) == 12:
                        phone_number = f"+{phone_number}"
                    else:
                        phone_number = f"+{phone_number}"
                        
                attributes["SMS"] = phone_number
                
            if attributes:
                contact_payload["attributes"] = attributes
            # If the user has provided a List ID, assign the contact to it
            if list_id_str.isdigit():
                contact_payload["list_ids"] = [int(list_id_str)]
                
            create_contact = sib_api_v3_sdk.CreateContact(**contact_payload)
            
            api_response = api_instance.create_contact(create_contact)
            logger.info(f"[Brevo] Contact {email} successfully synced to Brevo.")
            return True
            
        except ApiException as e:
            # If Brevo rejects the phone number format or it's a duplicate, retry without the phone number
            # so that the email sync doesn't fail completely.
            error_str = str(e)
            if "Invalid phone number" in error_str or "duplicate_parameter" in error_str:
                logger.warning(f"[Brevo] Phone number rejected for {email} (invalid or duplicate). Retrying without SMS...")
                return BrevoService.add_contact_to_brevo(email, phone_number=None, first_name=first_name, last_name=last_name)
                
            logger.error(f"[Brevo] Exception when calling ContactsApi->create_contact for {email}: {e}")
            return False
        except Exception as e:
            logger.error(f"[Brevo] Unexpected error during contact sync for {email}: {e}")
            return False
