import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock

import pytest
from jose import jwt
from sqlalchemy.exc import OperationalError

from app.services.auth_service import authenticate_user, register_user, resolve_current_user
from app.core.errors import InvalidCredentialsError, EmailAlreadyInUseError
from app.auth.security import verify_password
from app.auth.jwt import create_access_token, SECRET_KEY, ALGORITHM


class TestAuthenticateUser:
    def test_correct_credentials_returns_user(self, db_session, make_user):
        email, password = "user@example.com", "Password123@"
        user = make_user(email, password)
        
        result = authenticate_user(db_session, email=email, password=password)
        
        assert result.id == user.id
    
    def test_incorrect_email_reports_invalid_credentials(self, db_session, make_user):
        password = "Password123@"
        make_user(email="user1@example.com", password=password)
        
        with pytest.raises(InvalidCredentialsError):
            authenticate_user(db_session, email="user2@example.com", password=password)
    
    def test_incorrect_password_reports_invalid_credentials(self, db_session, make_user):
        email = "user@example.com"
        make_user(email, "password1")
        
        with pytest.raises(InvalidCredentialsError):
            authenticate_user(db_session, email=email, password="password2")
        
    def test_db_failure_is_not_reported_as_invalid_credentials(self):
        nonfunctional_db = Mock()
        nonfunctional_db.query.side_effect = OperationalError("Select ...", {}, Exception("connection refused"))
        
        with pytest.raises(OperationalError):
            authenticate_user(nonfunctional_db, email="user@example.com", password="Password123@")


class TestRegisterUser:
    def test_valid_email_and_password_returns_user(self, db_session):
        email, password = "user@example.com", "Password123@"
        
        user = register_user(db_session, email=email, password=password)
        
        assert user.email == email
        assert user.password_hash != password
        assert verify_password(password, user.password_hash)
        
    def test_email_conflict_reports_email_in_use(self, db_session, make_user):
        make_user(email="user@example.com", password="Password123@")
        
        with pytest.raises(EmailAlreadyInUseError):
            register_user(db_session, email="user@example.com", password="password")
            
    def test_db_failure_is_not_reported_as_email_in_use(self):
        nonfunctional_db = Mock()
        nonfunctional_db.commit.side_effect = OperationalError("INSERT ...", {}, Exception("connection refused"))
        
        with pytest.raises(OperationalError):
            register_user(nonfunctional_db, email="user@example.com", password="Password123@")


class TestResolveCurrentUser:
    def make_token(self, user_id: str | None = None, issued_timedelta_days: int = 0, secret_key: str = SECRET_KEY) -> str:
        now = datetime.now(timezone.utc)
        issued = now + timedelta(days=issued_timedelta_days)
        expire = issued + timedelta(minutes=15)
        payload = {
            "iat": int(issued.timestamp()),
            "exp": int(expire.timestamp()),
        }
        if user_id is not None:
            payload["sub"] = user_id

        return jwt.encode(payload, secret_key, algorithm=ALGORITHM)

    def test_valid_token_returns_user(self, db_session, make_user):
        user = make_user(email="user@example.com", password="Password123@")
        token = create_access_token(user_id=str(user.id))
        
        result = resolve_current_user(db_session, token)
        
        assert user.id == result.id
        
    def test_invalid_token_reports_invalid_credentials(self, db_session):
        invalid_token = "not_a_jwt_token"
        
        with pytest.raises(InvalidCredentialsError):
            resolve_current_user(db_session, invalid_token)
    
    def test_valid_token_with_no_matching_user_reports_invalid_credentials(self, db_session):
        token = create_access_token(user_id=str(uuid.uuid4()))
        
        with pytest.raises(InvalidCredentialsError):
            resolve_current_user(db_session, token)
    
    def test_db_failure_does_not_report_as_invalid_credentials(self):
        nonfunctional_db = Mock()
        nonfunctional_db.get.side_effect = OperationalError("SELECT ...", {}, Exception("connection refused"))
        token = create_access_token(user_id=str(uuid.uuid4()))
        
        with pytest.raises(OperationalError):
            resolve_current_user(nonfunctional_db, token)
        
    def test_jwt_signed_with_wrong_secret_reports_invalid_credentials(self, db_session, make_user):
        user = make_user(email="user@example.com", password="Password123@")
        token = self.make_token(user_id=str(user.id), secret_key="WRONG_JWT_SECRET")
        
        with pytest.raises(InvalidCredentialsError):
            resolve_current_user(db_session, token)
    
    def test_expired_jwt_reports_invalid_credentials(self, db_session, make_user):
        user = make_user(email="user@example.com", password="Password123@")
        token = self.make_token(user_id=str(user.id), issued_timedelta_days=-3)
        
        with pytest.raises(InvalidCredentialsError):
            resolve_current_user(db_session, token)
        
    def test_jwt_sub_is_not_a_uuid_reports_invalid_credentials(self, db_session):
        token = self.make_token(user_id="not_a_uuid")
        
        with pytest.raises(InvalidCredentialsError):
            resolve_current_user(db_session, token)
    
    def test_jwt_with_no_sub_field_reports_invalid_credentials(self, db_session):
        token = self.make_token()
        
        with pytest.raises(InvalidCredentialsError):
            resolve_current_user(db_session, token)
