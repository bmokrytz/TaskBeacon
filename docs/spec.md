# TaskBeacon — Specification (v1)

## Goal
Provide a small, production-minded backend service that allows authenticated users to manage personal tasks via a REST API. The project is designed to demonstrate API design, authentication, persistence, and basic service reliability patterns in a cloud-deployable system.

## Non-Goals (for v1)
- No real-time features (e.g., WebSockets, push notifications)
- No role-based access control (single user role only)
- No advanced search, analytics, or reporting

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
- Base URL (production): [AWS deployment](https://83k3zsw5gc.us-east-1.awsapprunner.com)
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
    "message": "human-readable description",
    "details": "Detailed error info",
    "request_id": "abc123"
    }

## Entities
### User
- id (UUID)
- email
- password_hash
- created_at

### Task
- id (UUID)
- owner_id (FK → users.id)
- title
- description (optional)
- status (pending | completed)
- due_date (optional)
- created_at
- updated_at

## API Endpoints
- GET `/api/health/live`
- GET `/api/health/ready`
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/tasks`
- POST `/api/tasks`
- GET `/api/tasks/{id}`
- PATCH `/api/tasks/{id}`
- DELETE `/api/tasks/{id}`

## Success Criteria
- Service locally via Docker Compose
- Authenticated users can securely manage tasks via the API
- API returns appropriate HTTP status codes and structured JSON errors
- Service can be deployed to AWS and accessed over the public internet
- Architecture and setup are documented in the README and `/docs`
