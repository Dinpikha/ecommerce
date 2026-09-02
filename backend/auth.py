"""
Password hashing (bcrypt) and JWT access token creation/verification.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt, JWTError

from config import settings


def hash_password(plain_password: str) -> str:
    """Hashes a plaintext password with bcrypt. Returns a str safe to store in the database."""
    password_bytes = plain_password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))


def create_access_token(data: dict) -> str:
    """Creates a signed JWT. `data` should include at least {'sub': str(user_id)}."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Returns the decoded payload, or None if the token is invalid/expired."""
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
