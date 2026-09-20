#!/usr/bin/env sh
set -eu

echo "Waiting for DB..."
python scripts/wait_for_db.py

echo "Running migrations..."
alembic upgrade head

echo "Starting API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"