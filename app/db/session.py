from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import get_database_url

DATABASE_URL = get_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # helps avoid stale connections
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

def get_db():
    """
    FastAPI dependency.
    Creates a DB session per request and always closes it.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
