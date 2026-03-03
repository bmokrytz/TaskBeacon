# TaskBeacon — API Overview (v1)

This document provides a high-level overview of the TaskBeacon API.  
Detailed, interactive API documentation is available via Swagger UI when the service is running.

- Local: `http://localhost:8000/docs`
- Production: TBD (AWS deployment)

---

## Base URL
- Local: `http://localhost:8000`
- Production: [AWS deployment](https://83k3zsw5gc.us-east-1.awsapprunner.com)

---

## Authentication
Protected endpoints require a JWT access token provided via the `Authorization` header: `Authorization: Bearer <token>`

Tokens are issued by the `/auth/login` endpoint after successful authentication.

---

## Endpoints

### Health
- `GET /api/health/live` — API process health check
- `GET /api/health/ready` — Dependency health check (database)

### Auth
- `POST /api/auth/register` — Create a new user account
- `POST /api/auth/login` — Authenticate and receive a JWT
- `GET /api/auth/me` — Return logged in user's info (email, userID)

### Tasks
- `GET /api/tasks` — List tasks for the authenticated user
- `POST /api/tasks` — Create a new task
- `GET /api/tasks/{id}` — Retrieve a specific task
- `PATCH /api/tasks/{id}` — Update a task
- `DELETE /api/tasks/{id}` — Delete a task

---

## Response Format
- All responses are JSON
- Errors return a consistent structure. Example:
  ```json
  {
    "error": "validation_error",
    "message": "Invalid input",
    "details": "Email must be valid",
    "request_id": "abc123"
  }
  ```



