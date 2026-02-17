from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose.exceptions import JWTError
from uuid import UUID

from sqlalchemy.orm import Session

from app.auth.jwt import get_token_subject
from app.db.session import get_db
from app.storage.db_users import get_user_by_id_db

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
        user_id_str = get_token_subject(token)
        user_id = UUID(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    user = get_user_by_id_db(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    return user

