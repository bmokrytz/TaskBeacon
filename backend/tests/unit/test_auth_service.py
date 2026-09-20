import pytest

from app.core.errors import EmailAlreadyInUseError, InvalidCredentialsError
from app.services.auth_service import authenticate_user, register_user, resolve_current_user


class TestAuthenticateUser:
    def test_correct_credentials_returns_user(self, db_session, make_user):
        user = make_user(email="user@example.com", password="correct-password")
        result = authenticate_user(db_session, email="user@example.com", password="correct-password")
        assert result.id == user.id

    def test_wrong_password_raises_invalid_credentials(self, db_session, make_user):
        make_user(email="user@example.com", password="correct-password")
        with pytest.raises(InvalidCredentialsError):
            authenticate_user(db_session, email="user@example.com", password="wrong-password")

    def test_unknown_email_raises_invalid_credentials(self, db_session):
        with pytest.raises(InvalidCredentialsError):
            authenticate_user(db_session, email="nobody@example.com", password="whatever")


class TestRegisterUser:
    def test_creates_user_with_hashed_password(self, db_session):
        user = register_user(db_session, email="new@example.com", password="s3cret-pass")
        assert user.email == "new@example.com"
        assert user.password_hash != "s3cret-pass"

    def test_duplicate_email_raises_email_already_in_use(self, db_session, make_user):
        make_user(email="taken@example.com")
        with pytest.raises(EmailAlreadyInUseError):
            register_user(db_session, email="taken@example.com", password="another-pass")


class TestResolveCurrentUser:
    def test_valid_token_resolves_user(self, db_session, make_user, auth_headers):
        user = make_user()
        headers = auth_headers(user.id)
        token = headers["Authorization"].removeprefix("Bearer ")
        resolved = resolve_current_user(db_session, token)
        assert resolved.id == user.id

    def test_garbage_token_raises_invalid_credentials(self, db_session):
        with pytest.raises(InvalidCredentialsError):
            resolve_current_user(db_session, "not-a-real-token")

    def test_token_for_nonexistent_user_raises_invalid_credentials(self, db_session, auth_headers):
        import uuid

        headers = auth_headers(uuid.uuid4())
        token = headers["Authorization"].removeprefix("Bearer ")
        with pytest.raises(InvalidCredentialsError):
            resolve_current_user(db_session, token)
