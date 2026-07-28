from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.errors import InvalidCredentialsError
from app.services.auth_service import resolve_current_user

bearer_scheme = HTTPBearer()

def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """
    Get the current user.
    
    - Verify JWT access token and retrieve subject (User ID)
    - Fetch User from db by User ID
    - Return User
    """
    if creds is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = creds.credentials

    try:
        user = resolve_current_user(db, token)
    except InvalidCredentialsError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    return user

