"""
Shared FastAPI dependencies.

get_current_user is used on every protected route:
    def my_route(current_user: User = Depends(get_current_user)): ...
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from auth import decode_access_token
from database import get_db
from models import User

# Our login endpoint takes a JSON body (email/password), not OAuth2 form data,
# so we use a plain "paste your bearer token" scheme. In Swagger UI, click
# Authorize, and paste the access_token returned by POST /auth/login.
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.get(User, int(user_id))
    if user is None:
        raise credentials_exception

    return user
