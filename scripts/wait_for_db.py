import time
import sys
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import os

DATABASE_URL = os.getenv("DATABASE_URL")

MAX_RETRIES = 20
DELAY = 2  # seconds

print("Waiting for database...")

for i in range(MAX_RETRIES):
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect():
            print("Database is ready.")
            sys.exit(0)
    except OperationalError as e:
        print(f"Database not ready yet... retry {i+1}/{MAX_RETRIES}: {e}")
        time.sleep(DELAY)

print("Database never became ready. Exiting.")
sys.exit(1)