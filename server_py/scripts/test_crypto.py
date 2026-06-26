import os
import sys

# Set up environment variables for testing
os.environ["AES_ENCRYPTION_KEY_V1"] = "test_encryption_key_32_bytes_long!"
os.environ["HMAC_SECRET_KEY"] = "test_hmac_secret"

# Add app to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.cryptography import EncryptedString, HashedString

def test_encryption():
    print("Testing Encryption...")
    enc_type = EncryptedString()
    
    plaintext = "super_secret_pii@example.com"
    print(f"Plaintext: {plaintext}")
    
    # Simulate DB bind param
    ciphertext = enc_type.process_bind_param(plaintext, None)
    print(f"Ciphertext: {ciphertext}")
    
    # Simulate DB result value
    decrypted = enc_type.process_result_value(ciphertext, None)
    print(f"Decrypted: {decrypted}")
    
    assert plaintext == decrypted, "Decryption failed to match plaintext!"
    assert ciphertext.startswith("v1:"), "Missing key version prefix!"
    print("Encryption test passed.\n")

def test_hashing():
    print("Testing Hashing...")
    hash_type = HashedString()
    
    plaintext = "searchable@example.com"
    print(f"Plaintext: {plaintext}")
    
    hash1 = hash_type.process_bind_param(plaintext, None)
    hash2 = hash_type.process_bind_param(plaintext, None)
    
    print(f"Hash 1: {hash1}")
    print(f"Hash 2: {hash2}")
    
    assert hash1 == hash2, "Hashes are not deterministic!"
    assert plaintext not in hash1, "Plaintext found in hash!"
    print("Hashing test passed.\n")

if __name__ == "__main__":
    test_encryption()
    test_hashing()
    print("All cryptography tests passed successfully!")
