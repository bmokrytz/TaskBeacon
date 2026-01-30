# TaskBeacon — Design Decisions (ADR-Lite)

This document records key architectural and technical decisions made during the development of TaskBeacon. The goal is to capture the reasoning behind choices, not just the choices themselves.

---

## 001 — Use FastAPI for Backend Framework

**Status:** Accepted  
**Date:** 2026-01-28

### Context
The service requires a lightweight, modern backend framework that supports:
- RESTful API design
- Request validation
- Automatic API documentation
- Easy integration with authentication and database layers

### Decision
Use FastAPI as the primary backend framework.

### Rationale
- Native support for OpenAPI and Swagger UI
- Strong request validation using Pydantic
- High performance and async support
- Clean, readable code structure for small services

### Consequences
- Python ecosystem influences future library choices
- Async patterns must be understood and handled carefully

---

## 002 — Use JWT for Authentication

**Status:** Accepted  
**Date:** 2026-01-28

### Context
The service requires stateless authentication suitable for APIs and cloud deployment.

### Decision
Use JSON Web Tokens (JWT) for authentication.

### Rationale
- Stateless and scalable
- Easy to integrate with HTTP headers
- Common industry standard for APIs
- No server-side session storage required

### Consequences
- Token revocation is non-trivial
- Token expiration must be carefully managed

---

## 003 — Use Postgres for Persistent Storage

**Status:** Accepted  
**Date:** 2026-01-28

### Context
The system requires a relational database to store users and tasks with clear relationships and data integrity.

### Decision
Use Postgres as the primary database.

### Rationale
- Strong relational model
- Widely used in production systems
- Good support in cloud platforms
- Familiar SQL-based tooling

### Consequences
- Requires schema management and migrations
- More operational complexity than a file-based database

---

## 004 — Use Docker for Local Development and Deployment

**Status:** Accepted  
**Date:** 2026-01-28

### Context
The service must run consistently across local development and cloud environments.

### Decision
Package the application using Docker and Docker Compose.

### Rationale
- Eliminates "works on my machine" issues
- Simplifies local setup
- Matches cloud deployment workflow
- Makes dependencies explicit

### Consequences
- Adds a learning curve
- Slight overhead in development workflow

---

## 005 — Deploy to Render

**Status:** Accepted  
**Date:** 2026-01-28

### Context
The project requires a simple, low-friction cloud deployment platform suitable for small services.

### Decision
Deploy the service to Render.

### Rationale
- Simple Docker-based deployments
- Free or low-cost tiers available
- Minimal infrastructure setup required
- Good visibility into logs and service health

### Consequences
- Less control than raw cloud providers (e.g., AWS)
- Platform-specific deployment configuration

---

## 006 — No Frontend UI for v0

**Status:** Accepted  
**Date:** 2026-01-28

### Context
Implementing dedicated frontend UI in v0 would introduce additional scope and delay deployment.

### Decision
Use Swagger UI for quick and easy UI that can be used to test API endpoints. Defer dedicated UI development to v1.

### Rationale
- Swagger UI is free and easily available
- No need to develop frontend for v0
- Faster delivery of v0
- Allow more time and effort to be allocated elsewhere

### Consequences
- More work to implement UI in future v1
- Minimal UI with dated look

