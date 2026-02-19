from datetime import datetime, timedelta, timezone
from jose import jwt

from app.core.settings import get_settings

settings = get_settings()
SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def create_access_token(*, user_id: str) -> str:
    """
    Create an access token.
    - Generate JWT payload
    - Encode JWT access token
    - Return JWT access token (str)
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode an access token.
    - Returns the JWT payload dict if valid, otherwise raises JWTError.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_token_subject(token: str) -> str:
    """
    Get access token subject.
    - Returns the "sub" field from access token payload if token is valid, otherwise raises JWTError.
    """
    return decode_access_token(token).get("sub")