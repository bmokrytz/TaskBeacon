from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.models.user import User as UserORM


def create_user_db(db: Session, *, email: str, password_hash: str) -> UserORM:
    user_email = email
    user = UserORM(email=user_email, password_hash=password_hash)

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("email already in use")

    db.refresh(user)
    return user


def get_user_by_id_db(db: Session, user_id: UUID) -> UserORM | None:
    return db.get(UserORM, user_id)


def get_user_by_email_db(db: Session, email: str) -> UserORM | None:
    user_email = email.strip().lower()
    return db.query(UserORM).filter(UserORM.email == user_email).first()
