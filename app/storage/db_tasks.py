from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import datetime
import logging

from app.models.task import TaskUpdate, TaskStatus
from app.db.models.task_orm import TaskORM

logger = logging.getLogger(__name__)

def list_tasks(db: Session, user_id: UUID) -> List[TaskORM]:
    query = select(TaskORM).where(TaskORM.owner_id == user_id)
    result = db.execute(query)
    return result.scalars().all()

def create_task(
    db: Session, 
    *, 
    owner_id: UUID,
    title: str, 
    description: Optional[str], 
    status: str, 
    due_date: Optional[datetime]
    ) -> TaskORM:
    """
    Create a new task.
    - Create new task instance
    - Store task in database
    - Return task
    """
    
    task = TaskORM(
        owner_id=owner_id, 
        title=title,
        description=description,
        status=TaskStatus(status),
        due_date=due_date
        )
    
    db.add(task)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Integrity error")
    
    db.refresh(task)
    return task


def get_task_by_id(db: Session, task_id: UUID, user_id: UUID) -> Optional[TaskORM]:
    query = select(TaskORM).where(TaskORM.id == task_id, TaskORM.owner_id == user_id)
    task = db.execute(query).scalar_one_or_none()
    if not task:
        return None
    return task


def update_task(db: Session, task_id: UUID, data: TaskUpdate, owner_id: UUID) -> Optional[TaskORM]:
    task = get_task_by_id(db, task_id=task_id, user_id=owner_id)
    if not task:
        return None

    updates = data.model_dump(exclude_unset=True)

    if "status" in updates and updates["status"] is not None:
        updates["status"] = updates["status"].value

    for field, value in updates.items():
        setattr(task, field, value) # if value is None, column is cleared

    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: UUID, user_id: UUID) -> bool:
    task = get_task_by_id(db, task_id=task_id, user_id=user_id)
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
