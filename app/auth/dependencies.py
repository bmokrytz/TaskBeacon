from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose.exceptions import JWTError
from uuid import UUID

from app.models.user import User
from app.auth.jwt import get_token_subject
from app.storage.in_memory import get_user_by_id

bearer_scheme = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> User:
    """
    Get the current user.
    
    - Verify JWT access token and retrieve subject (User ID)
    - Fetch User by User ID
    - Return User
    """
    # 1) Missing header (no user is logged in)
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = creds.credentials

    # 2) Bad token
    try:
        user_id_str = get_token_subject(token)
        user_id = UUID(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    # 3) Unknown user
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    return user
