from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import logging

from app.db.models.user_orm import UserORM


logger = logging.getLogger(__name__)


def list_users(db: Session) -> List[UserORM]:
    query = select(UserORM)
    result = db.execute(query)
    return result.scalars().all()


def create_user(db: Session, *, email: str, password_hash: str) -> UserORM:
    user = UserORM(
        email=email,
        password_hash=password_hash
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("email already in use")

    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: UUID) -> UserORM | None:
    return db.get(UserORM, user_id)


def get_user_by_email(db: Session, email: str) -> UserORM | None:
    user_email = email.strip().lower()
    return db.query(UserORM).filter(UserORM.email == user_email).first()
