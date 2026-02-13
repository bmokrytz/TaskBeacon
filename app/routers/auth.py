from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user import User, UserCreate, UserPublic
from app.auth.security import hash_password
from app.storage.in_memory import create_user
from app.models.auth import LoginRequest, TokenResponse
from app.auth.security import verify_password
from app.auth.jwt import create_access_token
from app.storage.in_memory import get_user_by_email
from app.auth.dependencies import get_current_user

import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
def register_endpoint(data: UserCreate):
    """
    Register a new user.
    - Hash password
    - Store user (unique email enforced)
    - Return public user info (no password hash)
    """
    email = data.email  # already normalized by validator
    logger.info("Register attempt email=%s", email)

    password_hash = hash_password(data.password)

    try:
        user = create_user(email=email, password_hash=password_hash)
    except ValueError as e:
        # Storage raises ValueError("email already in use")
        if "email already in use" in str(e).lower():
            logger.warning("Register failed (email in use) email=%s", email)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use",
            )
        logger.exception("Register failed (unexpected) email=%s", email)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info("User registered id=%s email=%s created at: %s", user.id, user.email, user.created_at.__str__())
    return UserPublic(id=user.id, email=user.email, created_at=user.created_at)



@router.post("/login", response_model=TokenResponse)
def login_endpoint(data: LoginRequest):
    """
    Login.
    - Verify email + password
    - Return JWT access token
    """
    logger.info("Login attempt email=%s", data.email)
    user = get_user_by_email(data.email)
    if not user:
        logger.warning("Login failed (Invalid credentials)")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(data.password, user.password_hash):
        logger.warning("Login failed (Invalid credentials)")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    logger.info("Login successful.")
    token = create_access_token(user_id=str(user.id))
    return TokenResponse(access_token=token)


@router.get("/auth/me", response_model=UserPublic)
def me_endpoint(current_user: User = Depends(get_current_user)) -> UserPublic:
    """
    Get user info for logged in user.
    - Verify user exists
    - Return UserPublic
    """
    return UserPublic(id=current_user.id, email=current_user.email, created_at=current_user.created_at)