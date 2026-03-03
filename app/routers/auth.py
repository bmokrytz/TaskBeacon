from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
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
from app.storage.db_users import create_user, get_user_by_email
from app.auth.dependencies import get_current_user
from app.api.serializers import user_orm_to_public
from app.core.rate_limit import limiter
from app.core.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])



@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
@limiter.limit(settings.RATE_LIMIT_AUTH_REGISTER)
def register_endpoint(
        request: Request,
        response: Response, # Need to include Response param for limiter override
        data: UserCreate, 
        db: Session = Depends(get_db)
    ) -> UserPublic:
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
@limiter.limit(settings.RATE_LIMIT_AUTH_LOGIN)
def login_endpoint(
        request: Request,
        response: Response, # Need to include Response param for limiter override
        data: LoginRequest, 
        db: Session = Depends(get_db)
    ) -> TokenResponse:
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
@limiter.limit(settings.RATE_LIMIT_AUTH_ME)
def me_endpoint(
        request: Request,
        response: Response, # Need to include Response param for limiter override
        current_user = Depends(get_current_user)
    ) -> UserPublic:
    """
    Get user info for logged in user.
    - Verify user exists
    - Return UserPublic
    """
    public = user_orm_to_public(current_user)
    return public

