from datetime import datetime, timedelta, timezone

import pytest
from pydantic import ValidationError

from app.models.task import TaskCreate, TaskUpdate

FUTURE = lambda: datetime.now(timezone.utc) + timedelta(days=1)
PAST = lambda: datetime.now(timezone.utc) - timedelta(days=1)


class TestTaskCreate:
    def test_strips_title_whitespace(self):
        task = TaskCreate(title="  My Task  ")
        assert task.title == "My Task"

    def test_blank_title_rejected(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="   ")

    def test_description_stripped(self):
        task = TaskCreate(title="Task", description="  notes  ")
        assert task.description == "notes"

    def test_blank_description_becomes_none(self):
        task = TaskCreate(title="Task", description="   ")
        assert task.description is None

    def test_due_date_in_future_accepted(self):
        due = FUTURE()
        task = TaskCreate(title="Task", due_date=due)
        assert task.due_date == due

    def test_due_date_in_past_rejected(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="Task", due_date=PAST())

    def test_naive_due_date_treated_as_utc(self):
        naive_future = (datetime.now(timezone.utc) + timedelta(days=1)).replace(tzinfo=None)
        task = TaskCreate(title="Task", due_date=naive_future)
        assert task.due_date.tzinfo is not None

    def test_due_date_none_allowed(self):
        task = TaskCreate(title="Task", due_date=None)
        assert task.due_date is None

    def test_defaults_to_pending_status(self):
        task = TaskCreate(title="Task")
        assert task.status.value == "pending"


class TestTaskUpdate:
    def test_all_fields_optional(self):
        update = TaskUpdate()
        assert update.title is None
        assert update.description is None
        assert update.due_date is None

    def test_blank_title_rejected_when_provided(self):
        with pytest.raises(ValidationError):
            TaskUpdate(title="   ")

    def test_title_stripped_when_provided(self):
        update = TaskUpdate(title="  New Title  ")
        assert update.title == "New Title"

    def test_due_date_in_past_rejected(self):
        with pytest.raises(ValidationError):
            TaskUpdate(due_date=PAST())

    def test_due_date_in_future_accepted(self):
        due = FUTURE()
        update = TaskUpdate(due_date=due)
        assert update.due_date == due
