from datetime import datetime, timezone, timedelta
import uuid

import pytest
from pydantic import ValidationError

from app.models.task import TaskCreate, TaskPublic, TaskUpdate, TaskStatus


class TestTaskCreate:
    @pytest.mark.parametrize("length", [1, 120])
    def test_title_length_within_limits_is_accepted(self, length):
        valid_title = "e" * length
        task = TaskCreate(title=valid_title)
        
        assert task.title == valid_title
    
    def test_title_exceeding_length_limits_is_rejected(self):
        invalid_title = "e" * 121
        
        with pytest.raises(ValidationError):
            TaskCreate(title=invalid_title)
    
    def test_no_title_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskCreate()
    
    def test_empty_title_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="")
    
    def test_empty_title_after_whitespace_gets_stripped_is_rejected(self):
        with pytest.raises(ValidationError) as excinfo:
            TaskCreate(title="        ")
        
        errors = excinfo.value.errors()
        error = errors[0]
        assert len(errors) == 1
        assert error["loc"] == ("title",)
        assert str(error["ctx"]["error"]) == "title cannot be empty"
    
    def test_title_whitespace_gets_stripped(self):
        title = "          Task Title          "
        task_create = TaskCreate(title=title)
        
        assert task_create.title == "Task Title"
    
    def test_description_within_length_limits_is_accepted(self):
        description_max_length = "e" * 400
        task_create = TaskCreate(title="task title", description=description_max_length)
        
        assert task_create.description == description_max_length
    
    def test_default_description_is_none(self):
        task_create = TaskCreate(title="Task Title")
        
        assert task_create.description is None
    
    @pytest.mark.parametrize("description", ["", "        "])
    def test_empty_description_becomes_none(self, description):
        task_create = TaskCreate(title="task title", description=description)
        
        assert task_create.description is None
    
    def test_description_outside_of_length_limits_is_rejected(self):
        invalid_description = "e" * 401
        with pytest.raises(ValidationError):
            TaskCreate(title="task title", description=invalid_description)
    
    def test_description_whitespace_gets_stripped(self):
        description = "   This is a task description.         "
        task_create = TaskCreate(title="Task Title", description=description)
        
        assert task_create.description == "This is a task description."
    
    def test_future_due_date_is_accepted(self):
        due_date = datetime.now(timezone.utc) + timedelta(days=1)
        task_create = TaskCreate(title="Task Title", due_date=due_date)
        
        assert task_create.due_date == due_date

    def test_past_due_date_is_rejected(self):
        due_date = datetime.now(timezone.utc) - timedelta(days=5)
        
        with pytest.raises(ValidationError):
            TaskCreate(title="Task Title", due_date=due_date)
    
    def test_default_due_date_is_none(self):
        task_create = TaskCreate(title="Task Title")
        
        assert task_create.due_date is None
    
    def test_due_date_with_no_timezone_gets_utc(self):
        due_date = datetime.now() + timedelta(days=3)
        task_create = TaskCreate(title="Task Title", due_date=due_date)
        
        assert task_create.due_date.tzinfo == timezone.utc
    
    def test_default_status_is_pending(self):
        task_create = TaskCreate(title="Task Title")
        
        assert task_create.status == TaskStatus.pending
    
    def test_valid_status_is_accepted(self):
        task_create = TaskCreate(title="Task Title", status=TaskStatus.completed)

        assert task_create.status == TaskStatus.completed
    
    def test_invalid_status_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="Task Title", status="not completed")


class TestTaskUpdate:
    @pytest.mark.parametrize("length", [1, 120])
    def test_title_within_length_limits_is_accepted(self, length):
        title = "e" * length
        task_update = TaskUpdate(title=title)

        assert task_update.title == title
    
    def test_title_exceeding_length_limit_is_rejected(self):
        title = "e" * 121
        
        with pytest.raises(ValidationError):
            TaskUpdate(title=title)
    
    def test_default_title_is_none(self):
        task_update = TaskUpdate()
        
        assert task_update.title is None
    
    def test_explicit_none_title_is_rejected(self):
        with pytest.raises(ValidationError, match="title cannot be null"):
            TaskUpdate(title=None)
    
    def test_empty_title_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskUpdate(title="")
    
    def test_empty_title_after_whitespace_gets_stripped_is_rejected(self):
        with pytest.raises(ValidationError) as excinfo:
            TaskUpdate(title="      ")

        errors = excinfo.value.errors()
        error = errors[0]
        assert len(errors) == 1
        assert error["loc"] == ("title",)
        assert str(error["ctx"]["error"]) == "title cannot be empty"
    
    def test_title_whitespace_gets_stripped(self):
        task_update = TaskUpdate(title="       Task Title         ")
        
        assert task_update.title == "Task Title"
    
    def test_description_within_length_limit_is_accepted(self):
        description = "e" * 400
        task_update = TaskUpdate(description=description)
        
        assert task_update.description == description
    
    def test_description_exceeding_length_limit_is_rejected(self):
        description = "e" * 401
        
        with pytest.raises(ValidationError):
            TaskUpdate(description=description)
    
    @pytest.mark.parametrize("description", ["", "        "])
    def test_empty_description_becomes_none(self, description):
        task_update = TaskUpdate(description=description)
        
        assert task_update.description is None
    
    def test_default_description_is_none(self):
        task_update = TaskUpdate()
        
        assert task_update.description is None
    
    def test_description_whitespace_gets_stripped(self):
        task_update = TaskUpdate(description="        This is a task description.           ")
        
        assert task_update.description == "This is a task description."

    def test_future_due_date_is_accepted(self):
        due_date = datetime.now(timezone.utc) + timedelta(days=1)
        task_update = TaskUpdate(due_date=due_date)
        
        assert task_update.due_date == due_date
    
    def test_default_due_date_is_none(self):
        task_update = TaskUpdate()
        
        assert task_update.due_date is None
    
    def test_past_due_date_is_rejected(self):
        due_date = datetime.now(timezone.utc) - timedelta(days=2)
        
        with pytest.raises(ValidationError) as excinfo:
            TaskUpdate(due_date=due_date)
        
        errors = excinfo.value.errors()
        error = errors[0]
        assert len(errors) == 1
        assert error["loc"] == ("due_date",)
        assert str(error["ctx"]["error"]) == "due_date must be a current or future date"
    
    def test_due_date_with_no_timezone_gets_utc(self):
        due_date = datetime.now() + timedelta(days=3)
        task_update = TaskUpdate(due_date=due_date)
        
        assert task_update.due_date.tzinfo == timezone.utc
    
    def test_default_status_is_none(self):
        task_update = TaskUpdate()
        
        assert task_update.status is None
    
    def test_explicit_none_status_is_rejected(self):
        with pytest.raises(ValidationError, match="status cannot be null"):
            TaskUpdate(status=None)
    
    def test_valid_status_is_accepted(self):
        task_update = TaskUpdate(status=TaskStatus.completed)

        assert task_update.status == TaskStatus.completed
    
    def test_invalid_status_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskUpdate(status="not completed")


class TestTaskPublic:
    def test_valid_uuid_id_is_accepted(self):
        task_id = uuid.uuid4()
        task_public = TaskPublic(id=task_id, title="Task Title")

        assert task_public.id == task_id
    
    def test_no_id_value_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskPublic(title="Task Title")
    
    def test_non_uuid_id_is_rejected(self):
        task_id = "not a uuid"
        
        with pytest.raises(ValidationError):
            TaskPublic(id=task_id, title="Task Title")
    
    @pytest.mark.parametrize("length", [1, 120])
    def test_title_within_length_limits_is_accepted(self, length):
        title = "e" * length
        task_public = TaskPublic(id=uuid.uuid4(), title=title)
        
        assert task_public.title == title
    
    def test_title_exceeding_length_limit_is_rejected(self):
        title = "e" * 121
        
        with pytest.raises(ValidationError):
            TaskPublic(id=uuid.uuid4(), title=title)
    
    def test_no_title_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskPublic(id=uuid.uuid4())
    
    def test_empty_title_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskPublic(id=uuid.uuid4(), title="")
    
    def test_empty_title_after_whitespace_stripped_is_rejected(self):
        with pytest.raises(ValidationError) as excinfo:
            TaskPublic(id=uuid.uuid4(), title="      ")
        
        errors = excinfo.value.errors()
        error = errors[0]
        assert len(errors) == 1
        assert error["loc"] == ("title",)
        assert str(error["ctx"]["error"]) == "title cannot be empty"
    
    def test_title_whitespace_gets_stripped(self):
        task_public = TaskPublic(id=uuid.uuid4(), title="       Task Title         ")
        
        assert task_public.title == "Task Title"
    
    def test_description_within_length_limit_is_accepted(self):
        description = "e" * 400
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", description=description)

        assert task_public.description == description
    
    def test_description_exceeding_length_limit_is_rejected(self):
        description = "e" * 401
        
        with pytest.raises(ValidationError):
            TaskPublic(id=uuid.uuid4(), title="Task Title", description=description)
    
    def test_default_description_is_none(self):
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title")
        
        assert task_public.description is None
    
    def test_description_whitespace_gets_stripped(self):
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", description="      This is a task description.        ")
        
        assert task_public.description == "This is a task description."
    
    @pytest.mark.parametrize("description", ["", "        "])
    def test_empty_description_becomes_none(self, description):
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", description=description)
        
        assert task_public.description is None
    
    def test_default_status_is_pending(self):
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title")
        
        assert task_public.status == TaskStatus.pending
    
    def test_valid_status_is_accepted(self):
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", status=TaskStatus.completed)
        
        assert task_public.status == TaskStatus.completed
    
    def test_invalid_status_is_rejected(self):
        with pytest.raises(ValidationError):
            TaskPublic(id=uuid.uuid4(), title="Task Title", status="not completed")
    
    def test_default_due_date_is_none(self):
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title")
                
        assert task_public.due_date is None
    
    def test_past_due_date_is_accepted(self):
        due_date = datetime.now(timezone.utc) - timedelta(days=3)
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", due_date=due_date)
        
        assert task_public.due_date == due_date
    
    def test_future_due_date_is_accepted(self):
        due_date = datetime.now(timezone.utc) + timedelta(days=1)
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", due_date=due_date)
        
        assert task_public.due_date == due_date
    
    def test_default_created_at_is_none(self):
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title")
                        
        assert task_public.created_at is None
    
    def test_past_created_at_is_accepted(self):
        created_at = datetime.now(timezone.utc) - timedelta(days=3)
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", created_at=created_at)
        
        assert task_public.created_at == created_at
    
    def test_future_created_at_is_accepted(self):
        created_at = datetime.now(timezone.utc) + timedelta(days=1)
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", created_at=created_at)
        
        assert task_public.created_at == created_at
    
    def test_default_updated_at_is_none(self):
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title")
                        
        assert task_public.updated_at is None
    
    def test_past_updated_at_is_accepted(self):
        updated_at = datetime.now(timezone.utc) - timedelta(days=3)
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", updated_at=updated_at)
        
        assert task_public.updated_at == updated_at
    
    def test_future_updated_at_is_accepted(self):
        updated_at = datetime.now(timezone.utc) + timedelta(days=1)
        task_public = TaskPublic(id=uuid.uuid4(), title="Task Title", updated_at=updated_at)
        
        assert task_public.updated_at == updated_at
