from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
from sqlalchemy.orm import Session
import logging

from app.models.user import UserCreate, UserPublic
from app.models.auth import LoginRequest, TokenResponse
from app.core.errors import InvalidCredentialsError, EmailAlreadyInUseError
from app.core.rate_limit import limiter
from app.core.settings import get_settings
from app.auth.jwt import create_access_token, get_token_expiry_time
from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.services.auth_service import authenticate_user, register_user, set_token_cookie, delete_token_cookie
from app.api.serializers import user_orm_to_public

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

    try:
        user = register_user(db, email=email, password=data.password)
    except EmailAlreadyInUseError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
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
    email, password = data.email, data.password
    logger.info("Login attempt email=%s", email)
    
    try:
        user = authenticate_user(db, email=email, password=password)
    except InvalidCredentialsError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user_id=str(user.id))
    expiry = get_token_expiry_time(token)
    set_token_cookie(response, token)
    return TokenResponse(expiry_time=expiry)



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



@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit(settings.RATE_LIMIT_AUTH_LOGOUT)
def logout_endpoint(request: Request, response: Response) -> None:
    """
    Logout
    - Clear the client's access token cookie.
    """
    delete_token_cookie(response)