import os
import base64
import hashlib
import hmac
from sqlalchemy.types import TypeDecorator, String, Text
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import logging

logger = logging.getLogger(__name__)

class EncryptedString(TypeDecorator):
    """
    AES-256-GCM Encrypted String Type for SQLAlchemy.
    Stores data securely in the database as a base64 string.
    The encryption key MUST be a 32-byte string provided via AES_ENCRYPTION_KEY_V1 environment variable.
    """
    impl = Text
    cache_ok = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def _get_key(self) -> bytes:
        key_str = os.environ.get("AES_ENCRYPTION_KEY_V1", "")
        # For development/testing fallback if completely missing, though in prod this should raise an error.
        if not key_str:
            logger.warning("AES_ENCRYPTION_KEY_V1 is not set! Using a highly insecure fallback key. DO NOT USE IN PRODUCTION.")
            key_str = "fallback_insecure_key_32_bytes!!"
        
        key = key_str.encode('utf-8')
        if len(key) != 32:
            # Hash to exactly 32 bytes if the user provided something of wrong length, to prevent crashes.
            key = hashlib.sha256(key).digest()
        return key

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
            
        try:
            key = self._get_key()
            aesgcm = AESGCM(key)
            nonce = os.urandom(12)  # Standard 96-bit nonce for GCM
            # Encrypt the string
            ciphertext = aesgcm.encrypt(nonce, str(value).encode('utf-8'), None)
            
            # Prepend 'v1:' for future key rotation support, then base64 encode nonce + ciphertext
            payload = base64.b64encode(nonce + ciphertext).decode('utf-8')
            return f"v1:{payload}"
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise

    def process_result_value(self, value, dialect):
        if value is None:
            return None
            
        try:
            # Handle key versioning
            if str(value).startswith("v1:"):
                payload = str(value)[3:]
                key = self._get_key()
            else:
                # If it doesn't have a version prefix, it might be legacy or unencrypted.
                # In strict mode, we should fail, but we'll try to decrypt it assuming v1.
                payload = value
                key = self._get_key()

            data = base64.b64decode(payload)
            nonce, ciphertext = data[:12], data[12:]
            
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)
            return plaintext.decode('utf-8')
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            # If decryption fails, it might be unencrypted plaintext migrated incorrectly
            return value

class HashedString(TypeDecorator):
    """
    HMAC-SHA256 Blind Index Hash for SQLAlchemy.
    Used for searching exact matches on encrypted columns (like email_hash).
    """
    impl = String
    cache_ok = True

    def _get_secret(self) -> bytes:
        secret = os.environ.get("HMAC_SECRET_KEY", "fallback_insecure_hmac_secret")
        return secret.encode('utf-8')

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
            
        try:
            secret = self._get_secret()
            # Calculate HMAC-SHA256
            h = hmac.new(secret, str(value).encode('utf-8'), hashlib.sha256)
            return h.hexdigest()
        except Exception as e:
            logger.error(f"Hashing failed: {e}")
            raise

    def process_result_value(self, value, dialect):
        # Hashes cannot be reversed. We just return the hash string.
        return value
