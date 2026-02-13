from typing import Dict, List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.models.task import Task, TaskCreate, TaskUpdate
from app.models.user import User, UserPublic


# In-memory store


# Tasks
tasks: Dict[str, Task] = {}


def create_task(data: TaskCreate, user_id: UUID) -> Task:
    """
    Create a new task.
    - Create new task instance
    - Store task
    - Return task
    """
    task_id = uuid4()
    now = datetime.now(timezone.utc)

    task = Task(
        id=task_id,
        owner_id=user_id,
        title=data.title,
        description=data.description,
        status=data.status,
        due_date=data.due_date,
        created_at=now,
        updated_at=now,
    )

    tasks[str(task_id)] = task
    return task


def get_task_by_id(task_id: UUID, user_id: UUID) -> Optional[Task]:
    """
    Fetch a task by id.
    - Return task if it exists
    - Return None otherwise
    """
    task = tasks.get(str(task_id))
    if not task:
        return None
    if task.owner_id != user_id:
        return None
    return task


def list_tasks(user_id: UUID) -> List[Task]:
    """
    List all of the authenticated user's tasks.
    - Specific to user. Lists all tasks created by the authenticated user
    """
    user_tasks = list()
    for task in tasks.values():
        if task.owner_id == user_id:
            user_tasks.append(task)
    return user_tasks


def update_task(task_id: UUID, data: TaskUpdate, user_id: UUID) -> Optional[Task]:
    """
    Update an existing task.
    - Fetch task by id
    - If no task matching id exists, return None
    - Update task
    - Return task
    """
    task = get_task_by_id(task_id, user_id)
    if not task:
        return None
    
    changed = False

    if data.title is not None:
        task.title = data.title
        changed = True

    if data.description is not None:
        task.description = data.description
        changed = True

    if data.status is not None:
        task.status = data.status
        changed = True
    
    if data.due_date is not None:
        task.due_date = data.due_date
        changed = True

    if changed:
        task.updated_at = datetime.now(timezone.utc)
    return task


def delete_task(task_id: UUID, user_id: UUID) -> bool:
    """
    Delete a task.
    - Delete task and return True
    - If no task matching id exists or if task does not belong to user, return False
    """
    task = get_task_by_id(task_id, user_id)
    if not task:
        return False
    del tasks[str(task_id)]
    return True



# Users
users_by_id: Dict[str, User] = {}
users_by_email: Dict[str, User] = {}

def create_user(email: str, password_hash: str) -> User:
    user_id = uuid4()
    user_email = email.strip().lower()
    now = datetime.now(timezone.utc)
    
    # Ensure unique email
    if user_email in users_by_email:
        raise ValueError("email already in use")

    user = User(
        id=user_id,
        email=user_email,
        password_hash=password_hash,
        created_at=now
    )

    users_by_id[str(user_id)] = user
    users_by_email[user_email] = user
    return user

def get_user_by_id(user_id: UUID) -> Optional[User]:
    return users_by_id.get(str(user_id))

def get_user_by_email(user_email: str) -> Optional[User]:
    return users_by_email.get(user_email.strip().lower())

# For debugging, not for production endpoint
def list_users() -> list[UserPublic]:
    user_list = list()
    for user in users_by_id.values():
        user_list.append(UserPublic(id=user.id, email=user.email, created_at=user.created_at))
    return user_list