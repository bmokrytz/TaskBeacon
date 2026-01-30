# TaskBeacon — MVP Specification (v0)

## Goal
Provide a small, production-minded backend service that allows authenticated users to manage personal tasks via a REST API. The project is designed to demonstrate API design, authentication, persistence, and basic service reliability patterns in a cloud-deployable system.

## Non-Goals (for MVP)
- No frontend UI
- No real-time features (e.g., WebSockets, push notifications)
- No role-based access control (single user role only)
- No advanced search, analytics, or reporting
- No multi-tenant or organization-level features

## Core Features
- User registration and login
- JWT-based authentication for protected endpoints
- Create, list, update, and delete tasks
- Tasks are private to the authenticated user
- Input validation and consistent error responses

## Interfaces

### HTTP API
TaskBeacon exposes a RESTful HTTP API that accepts and returns JSON.

- Base URL (local): `http://localhost:8000`
- Base URL (production): TBD (Render deployment)
- Content-Type: `application/json`

### Authentication Interface
Protected endpoints require a JWT access token provided via the `Authorization` header: `Authorization: Bearer <token>`

Tokens are issued by the `/auth/login` endpoint after successful authentication.

### Request / Response Format
- All request bodies are JSON
- All responses are JSON
- Errors follow a consistent structure:
    ```json
    {
    "error": "short_error_code",
    "message": "human-readable description"
    }

## Entities
### User
- id (UUID)
- email
- password_hash
- created_at

### Task
- id (UUID)
- user_id (FK → User.id)
- title
- description (optional)
- status (pending | completed)
- due_date (optional)
- created_at
- updated_at

## API Endpoints (Planned)
- POST `/auth/register`
- POST `/auth/login`
- GET `/tasks`
- POST `/tasks`
- GET `/tasks/{id}`
- PATCH `/tasks/{id}`
- DELETE `/tasks/{id}`
- GET `/health`

## Success Criteria
- Service runs locally via Docker Compose
- Authenticated users can securely manage tasks via the API
- API returns appropriate HTTP status codes and structured JSON errors
- Service can be deployed to Render and accessed over the public internet
- Architecture and setup are documented in the README and `/docs`
