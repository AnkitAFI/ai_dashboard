from datetime import datetime, timedelta
import hashlib
import bcrypt
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Initialize CryptContext for bcrypt
# Note: Passlib 1.7.4 + bcrypt 5.0.0 on Windows can have version detection issues.
# We'll use a robust approach that handles the 72-byte limit manually.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """
    Robust password hashing strategy:
    1. Pre-hash with SHA-256 to handle passwords > 72 bytes.
    2. Bcrypt the resulting hex digest.
    """
    # 1. Normalize password to SHA-256 hex digest (always 64 bytes).
    # This solves the 72-byte limit of bcrypt.
    sha256_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    # 2. Hash using bcrypt directly to avoid Passlib version detection traps
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(sha256_hash.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Robust password verification with backward compatibility:
    1. Try matching with the NEW SHA-256 pre-hash strategy.
    2. Fallback to matching with the OLD 72-byte truncation strategy.
    """
    if not hashed_password:
        return False

    try:
        # Strategy 1: NEW SHA-256 Pre-hashing
        sha256_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
        # Use bcrypt.checkpw directly for reliability
        if bcrypt.checkpw(sha256_hash.encode('utf-8'), hashed_password.encode('utf-8')):
            return True
            
        # Strategy 2: OLD Legacy Truncation Fallback (Backward Compatibility)
        # We truncate to 72 bytes (not chars) to be absolutely sure.
        truncated_legacy = plain_password.encode('utf-8')[:72]
        if bcrypt.checkpw(truncated_legacy, hashed_password.encode('utf-8')):
            return True
            
    except Exception as e:
        # Log error if needed, but return False for safety
        print(f"DEBUG: Password verification error: {str(e)}")
        return False
        
    return False

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
