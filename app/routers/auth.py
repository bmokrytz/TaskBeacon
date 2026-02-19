from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.models.user import UserCreate, UserPublic
from app.db.models.user_orm import UserORM
from app.auth.security import hash_password
from app.models.auth import LoginRequest, TokenResponse
from app.auth.security import verify_password
from app.auth.jwt import create_access_token
from app.db.session import get_db
from app.storage.db_users import create_user, get_user_by_email, list_users
from app.auth.dependencies import get_current_user
from app.api.serializers import user_orm_to_public


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])



# For debugging/dev only. Remove later.
@router.get("/list-all-users", response_model=List[UserPublic])
def list_users_endpoint(db: Session = Depends(get_db), current_user = Depends(get_current_user)) -> List[UserPublic]:
    """
    List all registered users.
    - Retrieve list of all users from database
    - Serialize to UserPublic and return
    """
    user_list_public = list()
    logger.info("Fetching all registered users.")
    user_list = list_users(db)
    for user in user_list:
        public = user_orm_to_public(user)
        user_list_public.append(public)
    return user_list_public



@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
def register_endpoint(data: UserCreate, db: Session = Depends(get_db)) -> UserPublic:
    """
    Register a new user.
    - Hash password
    - Store user (unique email enforced)
    - Return public user info (no password hash)
    """
    email = data.email
    logger.info("Register attempt email=%s", email)

    password_hash = hash_password(data.password)

    try:
        user = create_user(db, email=email, password_hash=password_hash)
    except ValueError as e:
        if "email already in use" in str(e).lower():
            logger.warning("Register failed (email in use) email=%s", email)
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
        logger.exception("Register failed (unexpected) email=%s", email)
        raise HTTPException(status_code=500, detail="Internal server error")

    user_public = user_orm_to_public(user)
    return user_public



@router.post("/login", response_model=TokenResponse)
def login_endpoint(data: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """
    Login.
    - Verify email + password
    - Return JWT access token
    """
    logger.info("Login attempt email=%s", data.email)

    user = get_user_by_email(db, email=data.email)
    if not user:
        logger.warning("Login failed (Invalid credentials)")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(data.password, user.password_hash):
        logger.warning("Login failed (Invalid credentials)")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user_id=str(user.id))
    return TokenResponse(access_token=token)



@router.get("/me", response_model=UserPublic)
def me_endpoint(current_user = Depends(get_current_user)) -> UserPublic:
    """
    Get user info for logged in user.
    - Verify user exists
    - Return UserPublic
    """
    public = user_orm_to_public(current_user)
    return public

