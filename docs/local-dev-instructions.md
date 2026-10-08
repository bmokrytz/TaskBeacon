## Local Development
### Local run instructions for TaskBeacon:
#### Prerequisites
The following must be installed before running TaskBeacon locally:

- Node version 22+
- Python 3.11+
- Docker Desktop (with Docker Compose enabled)

Verify Docker is installed:

```bash
docker --version
    Docker version 29.6.2, build dfc4efb
docker compose version
    Docker Compose version v5.3.1
```

---

#### Create a Python virtual environment and install dependencies
1. Open a terminal in the project root directory
2. In your terminal, enter `python -m venv .venv`. This will create the python virtual environment in folder `.venv/`
3. Activate the virtual environment with:

**Powershell**
```powershell
backend/.venv/Scripts/Activate.ps1
```
**Command Prompt**
```cmd
cd backend/.venv/scripts
activate
```
**Linux / Mac**
```bash
source backend/.venv/bin/activate
```
Your terminal should now look something like this:
```terminal
(.venv) PS C:\PathToTaskBeacon\TaskBeacon>
```
4. With the python virtual environment activated, switch to the backend directory install the project dependencies outlined in requirements.txt and requirements-dev.txt with `pip install -r requirements.txt -r requirements-dev.txt`

---

#### Database Setup (PostgreSQL + Alembic)
TaskBeacon uses PostgreSQL for persistent storage and Alembic for schema migrations. The database runs locally via Docker.

**1. Start the database (PostgreSQL) container**

From project backend directory:
```bash
docker compose up db -d
```
  This starts the database using the configuration in docker-compose.yml.

**2. Configure environment variables (optional)**

Environment variables are located in the .env file. Make sure that the configuration in docker-compose.yml matches environment variables.

**3. Apply database migrations**

After starting the database, from the backend directory run:
```bash
alembic upgrade head
```
This will automatically create and setup the full TaskBeacon database schema. If successful, you should see:

```bash
Running upgrade -> <revision>, create users and tasks
```

**4. Verify database is working**

Start the API by following the "Running TaskBeacon" instructions below. Then use the `/api/health/ready` endpoint to verify the database is working. If successful, you should see:
```json
{"status": "ok"}
```

**5. Resetting the databse**

Resetting the database will delete all saved data. To do so, from project backend directory:
```bash
docker compose down -v
docker compose up -d
alembic upgrade head
```

---

### Running TaskBeacon Locally
Before attempting to run TaskBeacon locally, make sure your configurations are set up properly. See the *Configuration* section further down.
#### Start the backend dev server
1. Ensure that the virtual environment is activated
2. From the backend directory, enter `uvicorn app.main:app --reload`. You should see something like this:
```terminal
(.venv) PS C:\PathToTaskBeacon\TaskBeacon> uvicorn app.main:app --reload
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```
#### Start the frontend dev server
1. From the frontend directory, install frontend dependencies with `npm install`
2. Start the frontend dev server with `npm run dev`
3. Open a web browser and navigate to `http://localhost:5173/`

---

**Configuration**

TaskBeacon is configured via environment variables loaded from `.env` in development.

| Variable | Example | Meaning |
| -------- | -------- | -------- |
| `ENV` (Required) | `DEV`/`PROD` | Controls dev vs prod behavior (docs, TrustedHost enforcement, etc.) |
| `DATABASE_URL` (Required) | `postgresql+psycopg://...` | Postgres connection string |
| `JWT_SECRET` (Required) | `REPLACE_WITH_RANDOM_SECRET` | Secret used to sign JWTs |
| `CORS_ORIGINS` (Required) | `["http://localhost:3000"]` | Allowed browser origins that may read API responses |
| `ALLOWED_HOSTS` (Required) | `["localhost","127.0.0.1"]` | Allowed Host headers (TrustedHost). In prod, set to your real domain(s) |
| `LOG_LEVEL` (Optional) | `INFO` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `DB_STATEMENT_TIMEOUT_MS` (Optional) | `5000` | Max time a SQL statement may run before Postgres cancels it |
| `DB_CONNECT_TIMEOUT_S` (Optional) | `2` | Max time allowed to establish a DB connection when DB is down/unreachable |
| `DB_POOL_TIMEOUT_S` (Optional) | `2` | Max time to wait for a pooled DB connection checkout |
| `JWT_ALGORITHM` (Optional) | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` (Optional) | `60` | JWT access token expiration |


**Generating a strong JWT secret**

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

Then copy the output into .env as `JWT_SECRET=key output`

**JWT secret rotation**

Safe rotation procedure:

1. Generate a new secret
2. Deploy the new secret by updating `JWT_SECRET` environment variable
3. Restart TaskBeacon (follow steps in the *Running TaskBeacon* section
4. Expect that all clients must log in again as previously administered tokens will fail with 401