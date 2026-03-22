import time
import sys
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import os
import traceback

DATABASE_URL = os.getenv("DATABASE_URL")

MAX_RETRIES = 20
DELAY = 2  # seconds

print("Using DATABASE_URL:", DATABASE_URL.replace(os.getenv("DB_PASSWORD", ""), "****"))
print("Waiting for database...")

for i in range(MAX_RETRIES):
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect():
            print("Database is ready.")
            sys.exit(0)
    except Exception as e:
        print(f"Database not ready yet... retry {i+1}/{MAX_RETRIES}: {repr(e)}")
        traceback.print_exc()
        time.sleep(DELAY)

print("Database never became ready. Exiting.")
sys.exit(1)