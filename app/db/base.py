from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Ensure models are registered on Base.metadata
from app.db.models import User, Task
