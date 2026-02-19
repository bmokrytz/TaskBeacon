from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.settings import get_settings

settings = get_settings()
DATABASE_URL = settings.DATABASE_URL
DB_SESSION_TIMEOUT_MS = settings.DB_SESSION_TIMEOUT_MS
args_string = "-c statement_timeout=" + str(DB_SESSION_TIMEOUT_MS)

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "options": args_string
    },
    pool_pre_ping=True,  # helps avoid stale connections
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency.
    Creates a DB session per request and always closes it.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
