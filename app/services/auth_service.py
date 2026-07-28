from jose.exceptions import JWTError
from uuid import UUID

from app.core.errors import InvalidCredentialsError, EmailAlreadyInUseError
from app.auth.security import hash_password, verify_password
from app.db.models.user_orm import UserORM
from app.storage.db_users import create_user, get_user_by_email, get_user_by_id
from app.auth.jwt import get_token_subject

def authenticate_user(db, email: str, password: str) -> UserORM:
    """
    Authenticate user by email and password.
    - Return UserORM if successful, raise HTTPException if not.
    """
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise InvalidCredentialsError()
    return user

def register_user(db, email: str, password: str) -> UserORM:
    """
    Register a new user with email and password.
    - Hash password and store user in database.
    - Raise EmailAlreadyInUseError if email is already registered.
    """
    password_hash = hash_password(password)
    try:
        user = create_user(db, email=email, password_hash=password_hash)
    except ValueError as e:
        if "email already in use" in str(e).lower():
            raise EmailAlreadyInUseError()
        raise
    return user

def resolve_current_user(db, token: str) -> UserORM:
    """
    Resolve the current user from a JWT token.
    - Decode token to get user ID and fetch user from database.
    - Raise InvalidCredentialsError if token is invalid or user not found.
    """
    try:
        user_id = UUID(get_token_subject(token))
    except (JWTError, ValueError):
        raise InvalidCredentialsError()
    user = get_user_by_id(db, user_id)
    if user is None:
        raise InvalidCredentialsError()
    return user