from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import User
from app.auth.jwt import get_token_subject
from app.storage.in_memory import get_user_by_id
from uuid import UUID

bearer_scheme = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> User:
    """
    Get the current user.
    
    - Verify JWT access token and retrieve subject (User ID)
    - Fetch User by User ID
    - Return User
    """
    token = creds.credentials
    user_id_str = get_token_subject(token)
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(401, "Invalid token")
    
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(401, "Invalid token")
    
    return user