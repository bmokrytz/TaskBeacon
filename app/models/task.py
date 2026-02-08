from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TaskStatus(str, Enum):
    pending = "pending"
    completed = "completed"


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.pending
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None


class Task(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.pending
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
