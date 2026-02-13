from datetime import datetime, timedelta, timezone
from jose import jwt
from jose.exceptions import JWTError

# Move to env var later
SECRET_KEY = "change-me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


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
    Returns the JWT payload dict if valid, otherwise raises JWTError.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
