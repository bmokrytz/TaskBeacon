# Development Workflow

The TaskBeacon project follows a simple, professional Git workflow designed to keep `main` clean and production-ready.

## Branching Strategy

All feature work is done on branches and merged into `main` via Pull Requests using **squash merge**.

## Branch & Commit Naming Convention

### Format:

- Branch format: `type`/`short-description`
- Commit format: `type`: `short-description`

Types
- **init:** initial project setup and repository scaffolding
- **feat:** new feature
- **fix:** bug fix
- **docs:** documentation-only
- **chore:** tooling/config/cleanup
- **refactor:** code restructure without behavior change
- **test:** adding/improving tests

### Examples

Branch:
- `feat/task-crud`
- `chore/docker-setup`

Commit:
- `feat: add task CRUD endpoints`
- `docs: update README setup instructions`
