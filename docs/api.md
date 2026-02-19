# TaskBeacon — API Overview (v0)

This document provides a high-level overview of the TaskBeacon API.  
Detailed, interactive API documentation is available via Swagger UI when the service is running.

- Local: `http://localhost:8000/docs`
- Production: TBD (Render deployment)

---

## Base URL
- Local: `http://localhost:8000`
- Production: TBD

---

## Authentication
Protected endpoints require a JWT access token provided via the `Authorization` header: `Authorization: Bearer <token>`

Tokens are issued by the `/auth/login` endpoint after successful authentication.

---

## Endpoints (Planned)

### Auth
- `POST /auth/register` — Create a new user account
- `POST /auth/login` — Authenticate and receive a JWT

### Tasks
- `GET /tasks` — List tasks for the authenticated user
- `POST /tasks` — Create a new task
- `GET /tasks/{id}` — Retrieve a specific task
- `PATCH /tasks/{id}` — Update a task
- `DELETE /tasks/{id}` — Delete a task

### Health
- `GET /health` — Service health check

---

## Response Format
- All responses are JSON
- Errors return a consistent structure:
  ```json
  {
    "error": "short_error_code",
    "message": "human-readable description",
    "details": null,
    "request_id": null
  }
  ```



