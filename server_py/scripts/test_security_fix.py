import hashlib
from passlib.context import CryptContext
import bcrypt
import sys
import os

# Add the project root to sys.path to import app.core.security
sys.path.append(os.getcwd())

from app.core.security import get_password_hash, verify_password

def test_robust_hashing():
    print("--- Testing Robust Hashing (SHA-256 + Bcrypt) ---")
    long_password = "a" * 100 + "🚀 emoji"
    print(f"Password length: {len(long_password)} chars")
    
    # 1. Test hashing
    hashed = get_password_hash(long_password)
    print(f"Hashed password: {hashed}")
    
    # 2. Test verification (New Strategy)
    assert verify_password(long_password, hashed) == True
    print("✅ New strategy verification successful!")
    
    # 3. Test verification failure
    assert verify_password(long_password + "wrong", hashed) == False
    print("✅ New strategy failure detection successful!")

def test_legacy_fallback():
    print("\n--- Testing Legacy Fallback (72-byte Truncation) ---")
    # This simulates a hash created with the old truncation strategy
    # Using direct bcrypt to avoid Passlib's version detection issues in the test
    password = "b" * 100
    truncated_legacy = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    legacy_hash = bcrypt.hashpw(truncated_legacy, salt).decode('utf-8')
    print(f"Legacy hash (truncated): {legacy_hash}")
    
    # Test verification via our robust function
    assert verify_password(password, legacy_hash) == True
    print("✅ Legacy fallback verification successful!")

if __name__ == "__main__":
    try:
        test_robust_hashing()
        test_legacy_fallback()
        print("\n✨ ALL TESTS PASSED! ✨")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
