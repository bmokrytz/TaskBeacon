from typing import Dict, List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone

from app.models.task import Task, TaskCreate, TaskUpdate

# In-memory store
tasks: Dict[str, Task] = {}


def create_task(data: TaskCreate) -> Task:
    task_id = uuid4()
    now = datetime.now(timezone.utc)

    task = Task(
        id=task_id,
        title=data.title,
        description=data.description,
        status=data.status,
        due_date=data.due_date,
        created_at=now,
        updated_at=now,
    )

    tasks[str(task_id)] = task
    return task


def get_task(task_id: UUID) -> Optional[Task]:
    return tasks.get(str(task_id))


def list_tasks() -> List[Task]:
    return list(tasks.values())


def update_task(task_id: UUID, data: TaskUpdate) -> Optional[Task]:
    task = tasks.get(str(task_id))
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

    if changed:
        task.updated_at = datetime.now(timezone.utc)
    return task


def delete_task(task_id: UUID) -> bool:
    task_id_str = str(task_id)
    if task_id_str in tasks:
        del tasks[task_id_str]
        return True
    return False
