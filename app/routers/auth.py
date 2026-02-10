from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate, UserPublic
from app.auth.security import hash_password
from app.storage.in_memory import create_user
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
