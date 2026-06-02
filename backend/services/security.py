"""
Security services
"""
import hashlib
import hmac
import os
import binascii


def hash_password(password: str) -> str:
    """Hash a plaintext password using PBKDF2-HMAC-SHA256."""
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100_000,
    )
    return f"{binascii.hexlify(salt).decode('utf-8')}:{binascii.hexlify(pwd_hash).decode('utf-8')}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a plaintext password against a stored salt:hash."""
    salt_hex, hash_hex = stored_hash.split(":")
    salt = binascii.unhexlify(salt_hex)
    expected_hash = binascii.unhexlify(hash_hex)
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100_000,
    )
    return hmac.compare_digest(pwd_hash, expected_hash)
