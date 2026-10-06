from uuid import UUID
from datetime import datetime, timezone, timedelta
import os

# Build cached Settings() singleton on first import
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET", "test-secret-key-not-for-production")
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.models.user_orm import UserORM
from app.db.models.task_orm import TaskORM
from app.models.task import TaskStatus
from app.auth.security import hash_password


@pytest.fixture()
def db_session():
    """In-memory SQLite DB, fresh schema per test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    """FastAPI TestClient wired to the in-memory db_session."""
    from fastapi.testclient import TestClient
    from app.main import app
    from app.db.session import get_db

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def make_user(db_session):
    """Factory: create a persisted UserORM with a known plaintext password."""

    def _make_user(email: str = "user@example.com", password: str = "correct-password") -> UserORM:
        user = UserORM(email=email, password_hash=hash_password(password))
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _make_user


@pytest.fixture()
def user(make_user):
    return make_user(email="user@example.com", password="Password123@")


@pytest.fixture()
def make_task(db_session):
    """Factory: create a task for a test user."""
    
    def _make_task(owner_id: UUID,
        title: str) -> TaskORM:
        description = "Test description."
        due_date = datetime.now(timezone.utc) + timedelta(days=3)
        task = TaskORM(
            owner_id=owner_id, 
            title=title,
            description=description,
            status=TaskStatus.pending,
            due_date=due_date
            )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)
        return task
    
    return _make_task
        


@pytest.fixture()
def auth_headers():
    """Factory: bearer auth header for a given user id."""
    from app.auth.jwt import create_access_token

    def _auth_headers(user_id) -> dict:
        token = create_access_token(user_id=str(user_id))
        return {"Authorization": f"Bearer {token}"}

    return _auth_headers
