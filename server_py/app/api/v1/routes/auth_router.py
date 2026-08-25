from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, Request, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserOut, OnboardingUpdate, UserProfileUpdate
from app.services.user_service import UserService
from app.core.security import create_access_token
from app.api.deps import get_current_user, get_admin_user, log_admin_action
from app.db.models.user_model import User
import pyotp
import bcrypt
from pydantic import BaseModel
from jose import jwt, JWTError
from app.core.config import settings
from app.core.cryptography import EncryptedString

class MFASetupResponse(BaseModel):
    provisioning_uri: str
    secret: str

class MFAVerifyRequest(BaseModel):
    code: str

class MFALoginRequest(BaseModel):
    temp_token: str
    code: str
    remember_me: bool = False

class MFADisableRequest(BaseModel):
    password: str
    code: str

class GoogleLoginRequest(BaseModel):
    id_token: str
    remember_me: bool = False

class SendMobileOTPRequest(BaseModel):
    mobile_number: str

class VerifyMobileOTPRequest(BaseModel):
    mobile_number: str
    otp: str

# In-memory OTP cache for mobile verification (user_id/mobile -> {otp, expires_at})
MOBILE_OTP_CACHE: dict = {}

router = APIRouter(tags=["Auth"])
user_service = UserService()

@router.post("/mobile/send-otp")
def send_mobile_otp(
    req: SendMobileOTPRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import random, re
    from datetime import datetime, timedelta

    mobile = req.mobile_number.strip().replace(" ", "").replace("-", "")
    if mobile.startswith("+91"):
        mobile = mobile[3:]
    elif mobile.startswith("91") and len(mobile) == 12:
        mobile = mobile[2:]
        
    if not re.match(r"^[6-9]\d{9}$", mobile):
        raise HTTPException(
            status_code=400,
            detail="Invalid Indian mobile number. Please enter a valid 10-digit number starting with 6-9."
        )

    # Check if mobile number is already in use by another account
    from app.models.schema_v2 import UserProfile
    from app.core.cryptography import HashedString
    
    mobile_hash = HashedString().process_bind_param(mobile, None)
    existing_mobile = db.query(UserProfile).filter(UserProfile.mobile_number_hash == mobile_hash).first()
    if existing_mobile:
        raise HTTPException(
            status_code=400,
            detail="This phone number is already registered to another account."
        )

    # Rate Limiting & Cooldown Protection
    cache_key = f"user_{current_user.id}"
    existing_entry = MOBILE_OTP_CACHE.get(cache_key)
    
    attempts = 0
    if existing_entry:
        time_since_last = (datetime.utcnow() - existing_entry.get("last_sent_at", datetime.utcnow())).total_seconds()
        
        # Enforce 60-second cooldown between requests
        if time_since_last < 60:
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {int(60 - time_since_last)} seconds before requesting a new code."
            )
            
        attempts = existing_entry.get("attempts", 0)
        # Enforce max 5 attempts per session
        if attempts >= 5:
            raise HTTPException(
                status_code=429,
                detail="Maximum OTP requests reached. Please try again later."
            )

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    MOBILE_OTP_CACHE[cache_key] = {
        "mobile": mobile,
        "otp": otp_code,
        "expires_at": expires_at,
        "last_sent_at": datetime.utcnow(),
        "attempts": attempts + 1
    }
    MOBILE_OTP_CACHE[mobile] = MOBILE_OTP_CACHE[cache_key]

    print(f"\n==================================================")
    print(f"📲 MOBILE OTP FOR USER {current_user.email} ({mobile}): {otp_code}")
    print(f"==================================================\n")

    # Send SMS via Authkey.io
    from app.services.sms_service import send_sms_otp
    send_sms_otp(mobile, otp_code, template_type="signup")

    return {
        "success": True,
        "message": f"OTP sent to +91 {mobile}",
        "mobile_number": mobile
    }

@router.post("/mobile/verify-otp")
def verify_mobile_otp(
    req: VerifyMobileOTPRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import re
    from datetime import datetime

    mobile = req.mobile_number.strip().replace(" ", "").replace("-", "")
    if mobile.startswith("+91"):
        mobile = mobile[3:]
    elif mobile.startswith("91") and len(mobile) == 12:
        mobile = mobile[2:]
        
    cache_entry = MOBILE_OTP_CACHE.get(f"user_{current_user.id}") or MOBILE_OTP_CACHE.get(mobile)
    
    if not cache_entry:
        raise HTTPException(status_code=400, detail="OTP expired or not requested. Please request a new OTP.")
        
    if datetime.utcnow() > cache_entry["expires_at"]:
        MOBILE_OTP_CACHE.pop(f"user_{current_user.id}", None)
        MOBILE_OTP_CACHE.pop(mobile, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")
        
    if cache_entry["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP code. Please try again.")

    # OTP verified! Save mobile number to database
    current_user.mobile_number = mobile
    db.commit()
    db.refresh(current_user)

    # Enforce uniqueness by saving hash to V2 Profile schema
    from app.models.schema_v2 import UserProfile
    from app.core.cryptography import HashedString
    mobile_hash = HashedString().process_bind_param(mobile, None)
    db.query(UserProfile).filter(UserProfile.user_id == current_user.id).update(
        {"mobile_number_hash": mobile_hash}, synchronize_session=False
    )
    db.commit()

    # Clean up cache
    MOBILE_OTP_CACHE.pop(f"user_{current_user.id}", None)
    MOBILE_OTP_CACHE.pop(mobile, None)

    return {
        "success": True,
        "message": "Mobile number verified successfully!",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "mobile_number": current_user.mobile_number,
            "onboarding_completed": getattr(current_user, "onboarding_completed", False),
        }
    }


@router.post("/google")
@router.post("/users/google-login")
def google_login(
    req: GoogleLoginRequest,
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Authenticate or Register user using Google OAuth ID Token.
    Returns session cookie and identical user JSON schema as standard login/signup.
    """
    from app.services.google_auth_service import verify_google_id_token
    from app.repositories.user_repository import UserRepository
    from app.api.v1.routes.legacy_router import (
        create_session, delete_all_user_sessions,
        SESSION_EXPIRE_DAYS_NO_REMEMBER, SESSION_EXPIRE_DAYS_REMEMBER, SESSION_COOKIE_SECURE
    )
    from app.models.schema_v2 import AuditLog
    import hashlib

    # 1. Verify Google ID token
    google_data = verify_google_id_token(req.id_token)
    google_id = google_data["google_id"]
    email = google_data["email"]

    user_repo = UserRepository()
    
    # 2. Check if user exists by google_id or email
    user = user_repo.get_by_google_id(db, google_id=google_id)
    if not user:
        user = user_repo.get_by_email(db, email=email)
        if user:
            # Existing email user: link google_id
            user.google_id = google_id
            if not getattr(user, "auth_provider", None):
                user.auth_provider = "google"
            db.commit()
            db.refresh(user)

    # 3. If user still does not exist, do NOT create DB account yet. Cache in Redis.
    if not user:
        from app.api.v1.routes.legacy_router import store_abandoned_signup
        from datetime import datetime, timezone
        
        # Cache their Google data securely
        temp_google_data = {
            "email": email,
            "google_id": google_id,
            "first_name": google_data.get("first_name", ""),
            "last_name": google_data.get("last_name", ""),
            "picture": google_data.get("picture", "")
        }
        
        # We use MOBILE_OTP_CACHE (or a dedicated Google cache) to hold their data
        MOBILE_OTP_CACHE[f"pending_google_{email}"] = temp_google_data
        
        # Trigger the abandoned signup email tracker exactly like manual signup
        store_abandoned_signup(email, {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "user_data": {**temp_google_data, "source": "google_sso"},
            "reminders_sent": []
        })
        
        return {
            "status": "requires_mobile_verification",
            "email": email,
            "message": "Please verify your mobile number to complete registration."
        }

    # 4. Check active status
    if getattr(user, "is_active", True) is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deleted. Please contact support."
        )

    # 5. Create session
    ip_address = request.headers.get("x-forwarded-for") or request.headers.get("x-real-ip")
    if ip_address:
        ip_address = ip_address.split(",")[0].strip()
    else:
        ip_address = request.client.host if request.client else "Unknown IP"
        
    user_agent = request.headers.get("user-agent")

    delete_all_user_sessions(user.id)

    session_token = create_session(
        user_id=user.id,
        remember_me=req.remember_me,
        ip_address=ip_address,
        user_agent=user_agent
    )

    # 6. Audit log
    audit_log = AuditLog(
        actor_user_id=user.id,
        action="user_logged_in_google",
        resource_type="User",
        resource_id=str(user.id),
        ip_hash=ip_address
    )
    db.add(audit_log)
    db.commit()

    max_age = SESSION_EXPIRE_DAYS_REMEMBER * 24 * 60 * 60 if req.remember_me else SESSION_EXPIRE_DAYS_NO_REMEMBER * 24 * 60 * 60

    # 7. Construct identical user response JSON as regular login/signup
    content = {
        "success": True,
        "message": "Google authentication successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "business_name": getattr(user, "business_name", ""),
            "location": getattr(user, "location", ""),
            "mobile_number": getattr(user, "mobile_number", ""),
            "subscription_tier": getattr(user, "subscription_tier", "free"),
            "ai_chat_used": getattr(user, "ai_chat_used", 0),
            "ai_chat_month": getattr(user, "ai_chat_month", ""),
            "onboarding_completed": getattr(user, "onboarding_completed", False),
            "onboarding_marketplace": getattr(user, "onboarding_marketplace", None),
            "onboarding_details": getattr(user, "onboarding_details", None),
            "onboarding_goal": getattr(user, "onboarding_goal", None),
            "seller_id": getattr(user, "seller_id", None),
            "created_at": str(user.created_at) if getattr(user, "created_at", None) else None
        }
    }

    # Set cookie on the injected response exactly like legacy_router.py does
    response.set_cookie(
        key="session_id",
        value=session_token,
        httponly=True,
        secure=SESSION_COOKIE_SECURE,
        samesite="lax",
        max_age=max_age,
        path="/",
        # domain=".insydz.com"
    )
    
    return content



class GoogleSendOTPRequest(BaseModel):
    email: str
    mobile_number: str

@router.post("/google/send-otp")
def google_send_otp(req: GoogleSendOTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    import random, re
    from datetime import datetime, timedelta
    from app.api.v1.routes.legacy_router import send_signup_otp_sms
    
    # Verify they are in the pending cache
    cache_key = f"pending_google_{req.email}"
    pending_data = MOBILE_OTP_CACHE.get(cache_key)
    if not pending_data:
        raise HTTPException(status_code=400, detail="Google session expired. Please sign in with Google again.")

    mobile = req.mobile_number.strip().replace(" ", "").replace("-", "")
    if mobile.startswith("+91"): mobile = mobile[3:]
    elif mobile.startswith("91") and len(mobile) == 12: mobile = mobile[2:]
        
    if not re.match(r"^[6-9]\d{9}$", mobile):
        raise HTTPException(status_code=400, detail="Invalid Indian mobile number.")

    # Check uniqueness
    from app.models.schema_v2 import UserProfile
    from app.core.cryptography import HashedString
    mobile_hash = HashedString().process_bind_param(mobile, None)
    if db.query(UserProfile).filter(UserProfile.mobile_number_hash == mobile_hash).first():
        raise HTTPException(status_code=400, detail="Phone number already registered. Please login manually.")

    # Rate Limiting
    otp_cache_key = f"google_otp_{req.email}"
    existing_entry = MOBILE_OTP_CACHE.get(otp_cache_key)
    attempts = 0
    if existing_entry:
        time_since = (datetime.utcnow() - existing_entry.get("last_sent_at", datetime.utcnow())).total_seconds()
        if time_since < 60:
            raise HTTPException(status_code=429, detail=f"Wait {int(60 - time_since)}s before resending.")
        attempts = existing_entry.get("attempts", 0)
        if attempts >= 5:
            raise HTTPException(status_code=429, detail="Max attempts reached.")

    # Generate and send
    otp_code = str(random.randint(100000, 999999))
    MOBILE_OTP_CACHE[otp_cache_key] = {
        "mobile": mobile,
        "otp": otp_code,
        "expires_at": datetime.utcnow() + timedelta(minutes=10),
        "last_sent_at": datetime.utcnow(),
        "attempts": attempts + 1
    }
    
    print(f"📲 GOOGLE SSO OTP FOR {req.email} ({mobile}): {otp_code}")
    background_tasks.add_task(send_signup_otp_sms, mobile, otp_code)
    
    return {"success": True, "message": "OTP sent successfully"}


class GoogleVerifyOTPRequest(BaseModel):
    email: str
    otp: str

@router.post("/google/verify-otp")
def google_verify_otp(
    req: GoogleVerifyOTPRequest, 
    request: Request,
    response: Response, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    from datetime import datetime
    from app.api.v1.routes.legacy_router import delete_abandoned_signup, create_session, SESSION_EXPIRE_DAYS_REMEMBER, SESSION_COOKIE_SECURE
    from app.repositories.user_repository import UserRepository
    from app.core.security import create_access_token
    from app.models.schema_v2 import UserConsent, AuditLog
    from sqlalchemy import null
    import hashlib

    # Verify pending state and OTP
    pending_data = MOBILE_OTP_CACHE.get(f"pending_google_{req.email}")
    otp_data = MOBILE_OTP_CACHE.get(f"google_otp_{req.email}")
    
    if not pending_data or not otp_data:
        raise HTTPException(status_code=400, detail="Session expired. Please start over.")
        
    if datetime.utcnow() > otp_data["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
        
    if otp_data["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP.")

    # All good! Create the account
    user_repo = UserRepository()
    ip_hash = "unknown"
    client_ip = "unknown"
    if request and request.client and request.client.host:
        client_ip = request.client.host
        ip_hash = hashlib.sha256(client_ip.encode("utf-8")).hexdigest()
        
    google_profile = {
        "email": pending_data["email"],
        "google_id": pending_data["google_id"],
        "first_name": pending_data["first_name"],
        "last_name": pending_data["last_name"]
    }
    
    user = user_repo.create_google_user(db, google_profile, ip_hash=ip_hash)
    
    # Save the verified mobile number
    user.mobile_number = otp_data["mobile"]
    db.commit()
    db.refresh(user)
    
    # Save mobile hash
    from app.models.schema_v2 import UserProfile
    from app.core.cryptography import HashedString
    mobile_hash = HashedString().process_bind_param(otp_data["mobile"], None)
    db.query(UserProfile).filter(UserProfile.user_id == user.id).update(
        {"mobile_number_hash": mobile_hash}, synchronize_session=False
    )
    db.commit()
    
    # Clear abandoned signup and cache
    delete_abandoned_signup(req.email)
    MOBILE_OTP_CACHE.pop(f"pending_google_{req.email}", None)
    MOBILE_OTP_CACHE.pop(f"google_otp_{req.email}", None)
    
    # Login & return token
    access_token = create_access_token(data={"sub": user.email, "scope": "full_access"}, expires_delta=timedelta(days=SESSION_EXPIRE_DAYS_REMEMBER))
    session_id = create_session(user.id)
    response.set_cookie(key="session_id", value=session_id, httponly=True, secure=SESSION_COOKIE_SECURE, samesite="lax", max_age=SESSION_EXPIRE_DAYS_REMEMBER * 86400)
    
    if background_tasks:
        try:
            from app.services.brevo_service import BrevoService
            background_tasks.add_task(BrevoService.add_contact_to_brevo, user.email, user.mobile_number, user.first_name, user.last_name)
        except Exception:
            pass

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "mobile_number": user.mobile_number,
            "onboarding_completed": getattr(user, "onboarding_completed", False)
        }
    }


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Create a new user with hashed password and formatted business interests.
    """
    return user_service.register_user(db, user, request=request, background_tasks=background_tasks)

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    from app.repositories.user_repository import UserRepository
    from app.core.security import verify_password
    
    user_repo = UserRepository()
    user = user_repo.get_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Block soft-deleted accounts from logging in
    if getattr(user, "is_active", True) is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deleted. Please contact support."
        )
        
        
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == user.id).first()

    if user_auth and getattr(user_auth, "mfa_enabled", False):
        # Create a temporary token for MFA verification
        temp_expires = timedelta(minutes=10)
        temp_token = create_access_token(
            data={"sub": user.email, "scope": "mfa_pending"}, expires_delta=temp_expires
        )
        return {"status": "mfa_required", "temp_token": temp_token}
    
    # Create standard token
    access_token_expires = timedelta(days=settings.SESSION_EXPIRE_DAYS_NO_REMEMBER)
    access_token = create_access_token(
        data={"sub": user.email, "scope": "full_access"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/mfa/setup", response_model=MFASetupResponse)
def mfa_setup(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=current_user.email, issuer_name="Insydz")
    return {"provisioning_uri": provisioning_uri, "secret": secret}

class MFAVerifySetupRequest(BaseModel):
    secret: str
    code: str

@router.post("/mfa/verify-setup")
def mfa_verify_setup(req: MFAVerifySetupRequest, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    totp = pyotp.TOTP(req.secret)
    if not totp.verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == current_user.id).first()
    if not user_auth:
        raise HTTPException(status_code=500, detail="UserAuth record not found")
        
    user_auth.mfa_secret = req.secret
    user_auth.mfa_enabled = True
    
    # Generate 8 backup codes
    import secrets
    import string
    backup_codes_plain = []
    backup_codes_hashed = []
    
    for _ in range(8):
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(10))
        backup_codes_plain.append(code)
        # Hash code
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(code.encode('utf-8'), salt).decode('utf-8')
        backup_codes_hashed.append(hashed)
        
    user_auth.mfa_backup_codes = backup_codes_hashed
    
    from app.models.schema_v2 import AuditLog
    from app.core.cryptography import HashedString
    
    ip_hash = None
    if request.client and request.client.host:
        hasher = HashedString()
        ip_hash = hasher.process_bind_param(request.client.host, None)
        
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="MFA_ENABLED",
        resource_type="USER_AUTH",
        resource_id=str(current_user.id),
        ip_hash=ip_hash
    )
    db.add(audit)
    db.commit()
    
    return {"message": "MFA enabled successfully", "backup_codes": backup_codes_plain}

@router.post("/mfa/disable")
def mfa_disable(req: MFADisableRequest, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.core.security import verify_password
    if not verify_password(req.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == current_user.id).first()
    if not user_auth:
        raise HTTPException(status_code=500, detail="UserAuth record not found")
        
    if not user_auth.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is not enabled")
        
    totp = pyotp.TOTP(user_auth.mfa_secret)
    if not totp.verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid MFA code")
        
    user_auth.mfa_enabled = False
    user_auth.mfa_secret = None
    user_auth.mfa_backup_codes = None
    
    from app.models.schema_v2 import AuditLog
    from app.core.cryptography import HashedString
    
    ip_hash = None
    if request.client and request.client.host:
        hasher = HashedString()
        ip_hash = hasher.process_bind_param(request.client.host, None)
        
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="MFA_DISABLED",
        resource_type="USER_AUTH",
        resource_id=str(current_user.id),
        ip_hash=ip_hash
    )
    db.add(audit)
    db.commit()
    return {"message": "MFA disabled successfully"}

@router.get("/mfa/status")
def mfa_status(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == current_user.id).first()
    return {"mfa_enabled": getattr(user_auth, "mfa_enabled", False)}

@router.post("/mfa/verify-login")
def mfa_verify_login(req: MFALoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    from app.core.security import verify_password
    try:
        payload = jwt.decode(req.temp_token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("scope") != "mfa_pending":
            raise HTTPException(status_code=401, detail="Invalid token scope")
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    from app.repositories.user_repository import UserRepository
    user_repo = UserRepository()
    user = user_repo.get_by_email(db, email=email)
    
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == user.id).first()
    
    if not user_auth or not user_auth.mfa_enabled:
        raise HTTPException(status_code=401, detail="User not found or MFA not enabled")
    
    # Helper to finish login
    def finish_login(user_obj):
        from app.api.v1.routes.legacy_router import (
            create_session, delete_all_user_sessions, 
            SESSION_EXPIRE_DAYS_NO_REMEMBER, SESSION_COOKIE_SECURE
        )
        from datetime import datetime
        
        ip_address = request.headers.get("x-forwarded-for") or request.headers.get("x-real-ip")
        if ip_address:
            ip_address = ip_address.split(",")[0].strip()
        else:
            ip_address = request.client.host if request.client else "Unknown IP"
            
        user_agent = request.headers.get("user-agent")

        delete_all_user_sessions(user_obj.id)

        session_token = create_session(
            user_id=user_obj.id,
            remember_me=req.remember_me,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        from app.models.schema_v2 import AuditLog
        audit_log = AuditLog(
            actor_user_id=user_obj.id,
            action="user_logged_in_mfa",
            resource_type="User",
            resource_id=str(user_obj.id),
            ip_hash=ip_address
        )
        db.add(audit_log)
        db.commit()
        
        max_age = SESSION_EXPIRE_DAYS_REMEMBER * 24 * 60 * 60 if req.remember_me else SESSION_EXPIRE_DAYS_NO_REMEMBER * 24 * 60 * 60
        
        content = {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user_obj.id,
                "email": user_obj.email,
                "first_name": user_obj.first_name,
                "last_name": user_obj.last_name,
                "business_name": getattr(user_obj, "business_name", ""),
                "location": getattr(user_obj, "location", ""),
                "subscription_tier": getattr(user_obj, "subscription_tier", "free"),
                "ai_chat_used": getattr(user_obj, "ai_chat_used", 0),
                "ai_chat_month": getattr(user_obj, "ai_chat_month", ""),
                "created_at": str(user_obj.created_at)
            }
        }
        
        json_resp = JSONResponse(content=content)
        json_resp.set_cookie(
            key="session_id",
            value=session_token,
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="lax",
            max_age=max_age,
            # domain=".insydz.com"
        )
        return json_resp

    # Check TOTP
    secret = user_auth.mfa_secret
    totp = pyotp.TOTP(secret)
    if totp.verify(req.code, valid_window=1):
        return finish_login(user)
    
    # Check backup codes if TOTP fails
    if user_auth.mfa_backup_codes:
        for idx, hashed_code in enumerate(user_auth.mfa_backup_codes):
            if bcrypt.checkpw(req.code.encode('utf-8'), hashed_code.encode('utf-8')):
                codes = list(user_auth.mfa_backup_codes)
                codes.pop(idx)
                user_auth.mfa_backup_codes = codes
                db.commit()
                return finish_login(user)

    raise HTTPException(status_code=401, detail="Invalid code")

@router.post("/onboarding", response_model=UserOut)
def update_onboarding(
    onboarding: OnboardingUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update onboarding information for the current user.
    Triggers product ingestion in the background if seller_id is provided.
    """
    return user_service.update_onboarding(
        db, 
        current_user.id, 
        onboarding.model_dump(),
        background_tasks
    )

@router.put("/users/profile", response_model=UserOut)
@router.put("/api/users/profile", response_model=UserOut)
def update_profile(
    profile: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update profile details (Business Name, Location, Business Interests) for the authenticated user.
    """
    if not profile.location or not profile.location.strip():
        raise HTTPException(status_code=400, detail="Location is required.")
    if not profile.business_interests or len(profile.business_interests) == 0:
        raise HTTPException(status_code=400, detail="Select at least one business interest.")
        
    return user_service.update_profile(db, current_user.id, profile.model_dump())

@router.get('/admin/test-access')
def admin_only_access(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="admin_access_test",
        resource_type="system",
        ip_address=request.client.host if request.client else None,
    )
    return {'message': f'Welcome Admin {current_user.first_name}! Access granted.'}

@router.get('/admin/audit-logs')
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
    limit: int = 50,
):
    """
    Returns the most recent admin audit log entries.
    Only accessible by admins.
    """
    from app.models.schema_v2 import AuditLog
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": log.id,
            "admin_id": log.actor_user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]

