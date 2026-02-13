from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TaskStatus(str, Enum):
    pending = "pending"
    completed = "completed"


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=400)
    status: TaskStatus = TaskStatus.pending
    due_date: Optional[datetime] = None
    
    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, title_value: str) -> str:
        """
        Verify that title is not blank.
        - Strip whitespace
        - If title is blank/empty raise ValueError
        """
        title_value = title_value.strip()
        if not title_value:
            raise ValueError("title cannot be empty")
        return title_value
    
    @field_validator("description")
    @classmethod
    def description_strip_and_not_empty(cls, description_value: str | None) -> str | None:
        """
        Verify that description is not blank.
        - Strip whitespace
        - If description is blank/empty raise ValueError
        """
        if description_value is None:
            return None
        description_value = description_value.strip()
        return description_value if description_value else None
    
    @field_validator("due_date")
    @classmethod
    def due_date_must_be_future_date_or_none(cls, due_date_value: datetime | None) -> datetime | None:
        """
        Verify that due_date is a future date.
        - If due_date is None, return None
        - If due_date is earlier than current datetime raise ValueError
        """
        if due_date_value is None:
            return None
        if due_date_value.tzinfo is None:
            due_date_value = due_date_value.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if due_date_value < now:
            raise ValueError("due date must be a future date")
        return due_date_value


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=400)
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    
    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, title_value: str | None) -> str | None:
        """
        Verify that title is not blank.
        - Strip whitespace
        - If title is blank/empty raise ValueError
        """
        if title_value is None:
            return None
        title_value = title_value.strip()
        if not title_value:
            raise ValueError("title cannot be empty")
        return title_value
    
    @field_validator("description")
    @classmethod
    def description_strip_and_not_empty(cls, description_value: str | None) -> str | None:
        """
        Verify that description is not blank.
        - Strip whitespace
        - If description is blank/empty raise ValueError
        """
        if description_value is None:
            return None
        description_value = description_value.strip()
        return description_value if description_value else None
    
    @field_validator("due_date")
    @classmethod
    def due_date_must_be_future_date_or_none(cls, due_date_value: datetime | None) -> datetime | None:
        """
        Verify that due_date is a future date.
        - If due_date is None, return None
        - If due_date is earlier than current datetime raise ValueError
        """
        if due_date_value is None:
            return None
        if due_date_value.tzinfo is None:
            due_date_value = due_date_value.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if due_date_value < now:
            raise ValueError("due date must be a future date")
        return due_date_value


class TaskPublic(BaseModel):
    id: UUID
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=400)
    status: TaskStatus = TaskStatus.pending
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, title_value: str) -> str:
        """
        Verify that title is not blank.
        - Strip whitespace
        - If title is blank/empty raise ValueError
        """
        title_value = title_value.strip()
        if not title_value:
            raise ValueError("title cannot be empty")
        return title_value
    
    @field_validator("description")
    @classmethod
    def description_strip_and_not_empty(cls, description_value: str | None) -> str | None:
        """
        Verify that description is not blank.
        - Strip whitespace
        - If description is blank/empty raise ValueError
        """
        if description_value is None:
            return None
        description_value = description_value.strip()
        return description_value if description_value else None
    
    @field_validator("due_date")
    @classmethod
    def due_date_must_be_future_date_or_none(cls, due_date_value: datetime | None) -> datetime | None:
        """
        Verify that due_date is a future date.
        - If due_date is None, return None
        - If due_date is earlier than current datetime raise ValueError
        """
        if due_date_value is None:
            return None
        if due_date_value.tzinfo is None:
            due_date_value = due_date_value.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if due_date_value < now:
            raise ValueError("due date must be a future date")
        return due_date_value


class Task(BaseModel):
    id: UUID
    owner_id: UUID
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=400)
    status: TaskStatus = TaskStatus.pending
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, title_value: str) -> str:
        """
        Verify that title is not blank.
        - Strip whitespace
        - If title is blank/empty raise ValueError
        """
        title_value = title_value.strip()
        if not title_value:
            raise ValueError("title cannot be empty")
        return title_value
    
    @field_validator("description")
    @classmethod
    def description_strip_and_not_empty(cls, description_value: str | None) -> str | None:
        """
        Verify that description is not blank.
        - Strip whitespace
        - If description is blank/empty raise ValueError
        """
        if description_value is None:
            return None
        description_value = description_value.strip()
        return description_value if description_value else None
    
    @field_validator("due_date")
    @classmethod
    def due_date_must_be_future_date_or_none(cls, due_date_value: datetime | None) -> datetime | None:
        """
        Verify that due_date is a future date.
        - If due_date is None, return None
        - If due_date is earlier than current datetime raise ValueError
        """
        if due_date_value is None:
            return None
        if due_date_value.tzinfo is None:
            due_date_value = due_date_value.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if due_date_value < now:
            raise ValueError("due date must be a future date")
        return due_date_value
