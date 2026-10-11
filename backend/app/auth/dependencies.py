from fastapi import Depends, HTTPException, Cookie, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.errors import InvalidCredentialsError
from app.services.auth_service import resolve_current_user

def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    """
    Get the current user.
    
    - Read the JWT access token from the httpOnly cookie
    - Verify JWT access token and retrieve subject (User ID)
    - Fetch User from db by User ID
    - Return User
    """
    if access_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        user = resolve_current_user(db, access_token)
    except InvalidCredentialsError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    return user