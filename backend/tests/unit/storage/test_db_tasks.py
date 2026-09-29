import uuid
from uuid import UUID
from collections.abc import Callable
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

import pytest

from app.storage.db_tasks import TaskORM, list_tasks, create_task, get_task_by_id, update_task, delete_task
from app.models.task import TaskStatus, TaskUpdate


def make_test_tasks(user_id: UUID, make_task: Callable[[UUID, str, TaskStatus], TaskORM]):
    task_list = []
    task_list.append(make_task(user_id, "Task 1"))
    task_list.append(make_task(user_id, "Task 2"))
    task_list.append(make_task(user_id, "Task 3"))
    return task_list


class TestListTasks:
    def test_returns_all_of_the_users_tasks(self, db_session, user, make_task):
        task_list = make_test_tasks(user_id=user.id, make_task=make_task)
        
        user_tasks = list_tasks(db_session, user.id)
        
        assert len(task_list) == 3
        assert len(task_list) == len(user_tasks)
        assert {task.id for task in task_list} == {task.id for task in user_tasks}

    def test_does_not_return_other_user_tasks(self, db_session, user, make_user, make_task):
        user1 = user
        user2 = make_user(email="user2@example.com", password="Password123@")
        user1_tasks = make_test_tasks(user1.id, make_task)
        make_test_tasks(user2.id, make_task)
        task_list = list_tasks(db_session, user1.id)
        
        assert len(task_list) == 3
        assert len(task_list) == len(user1_tasks)
        assert {task.id for task in task_list} == {task.id for task in user1_tasks}
    
    def test_returns_empty_list_when_user_has_no_tasks(self, db_session, user):
        user_tasks = list_tasks(db_session, user.id)
        
        assert user_tasks == []
    

class TestCreateTask:
    def test_task_is_created_successfully(self, db_session, user):
        task = create_task(db_session,
            owner_id=user.id,
            title="Task title",
            description=None,
            status=TaskStatus.pending,
            due_date=None)
        db_session.expire_all()
        saved_task = db_session.get(TaskORM, task.id)
        
        assert task.created_at is not None
        assert saved_task.id is not None
        assert saved_task.owner_id == user.id
        assert saved_task.title == "Task title"
        assert saved_task.created_at is not None
    
    def test_all_values_are_stored(self, db_session, user):
        due_date = datetime.now(timezone.utc) + timedelta(days=3)
        
        task = create_task(db_session,
            owner_id=user.id,
            title="Task title",
            description="Test description.",
            status=TaskStatus.pending,
            due_date=due_date)
        db_session.expire_all()
        saved_task = db_session.get(TaskORM, task.id)
        
        assert saved_task.title == "Task title"
        assert saved_task.description == "Test description."
        assert saved_task.status == TaskStatus.pending
        # SQLite (used for in-memory test db) drops tzinfo on storage (Postgres, used for prod db, keeps it), so need to omit timezone comparison.
        assert saved_task.due_date.replace(tzinfo=None) == due_date.replace(tzinfo=None)

    def test_invalid_status_reports_value_error(self, db_session, user):
        with pytest.raises(ValueError, match=r".*not a valid TaskStatus.*"):
            create_task(db_session,
                owner_id=user.id,
                title="Task title",
                description=None,
                status="done",
                due_date=None)
    
    def test_none_title_causes_db_integrity_error(self, db_session, user):
        with pytest.raises(ValueError, match="Integrity error"):
            create_task(db_session,
                owner_id=user.id,
                title=None,
                description=None,
                status=TaskStatus.pending,
                due_date=None)

    def test_session_still_usable_after_integrity_error(self, db_session, user):
        with patch.object(db_session, "rollback", wraps=db_session.rollback) as rollback_spy:
            with pytest.raises(ValueError, match="Integrity error"):
                create_task(db_session, owner_id=user.id, title=None, description=None,
                    status=TaskStatus.pending, due_date=None)

            task = create_task(db_session, owner_id=user.id, title="Recovered", description=None,
                    status=TaskStatus.pending, due_date=None)

            assert task.id is not None
        rollback_spy.assert_called_once()       


class TestGetTaskById:
    def test_gets_task_successfully(self, db_session, user, make_task):
        task = make_task(user.id, "Task Title")

        retrieved_task = get_task_by_id(db_session, task.id, user.id)

        assert retrieved_task is not None
        assert retrieved_task.id == task.id
        assert retrieved_task.owner_id == user.id
        assert retrieved_task.title == "Task Title"
    
    def test_does_not_return_tasks_that_belong_to_another_user(self, db_session, user, make_user, make_task):
        user1_task = make_task(user.id, "Task Title")
        user2 = make_user(email="user2@example.com", password="Password123@")

        retrieved_task = get_task_by_id(db_session, user1_task.id, user2.id)
        
        assert retrieved_task is None
    
    def test_does_not_return_real_task_to_non_existent_user_id(self, db_session, user, make_task):
        task = make_task(user.id, "Task Title")
        fake_user_id = uuid.uuid4()
        
        retrieved_task = get_task_by_id(db_session, task.id, fake_user_id)
                
        assert retrieved_task is None
    
    def test_non_existent_task_id_returns_none(self, db_session, user):
        fake_task_id = uuid.uuid4()
        
        retrieved_task = get_task_by_id(db_session, fake_task_id, user.id)
        
        assert retrieved_task is None
    
    def test_returns_requested_task_when_user_has_several_tasks(self, db_session, user, make_task):
        make_test_tasks(user.id, make_task)
        test_task = make_task(user.id, "Want to retrieve this specific task")
        
        retrieved_task = get_task_by_id(db_session, test_task.id, user.id)
        
        assert retrieved_task.id == test_task.id
        assert retrieved_task.title == "Want to retrieve this specific task"


class TestUpdateTask:
    def test_successfully_updates_task(self, db_session, user, make_task):
        original_task = make_task(user.id, "Test Task")
        new_due_date = datetime.now(timezone.utc) + timedelta(days=15)
        update = TaskUpdate(title="New Task Title",
            description="Altered description of task.",
            status=TaskStatus.completed,
            due_date=new_due_date)
        
        update_task(db_session, original_task.id, update, user.id)
        db_session.expire_all()
        updated_task = db_session.get(TaskORM, original_task.id)
        
        assert original_task.id == updated_task.id
        assert updated_task.title == "New Task Title"
        assert updated_task.description == "Altered description of task."
        assert updated_task.status == TaskStatus.completed
        # SQLite (used for in-memory test db) drops tzinfo on storage (Postgres, used for prod db, keeps it), so need to omit timezone comparison.
        assert updated_task.due_date.replace(tzinfo=None) == new_due_date.replace(tzinfo=None)
    
    def test_does_not_update_tasks_belonging_to_a_different_user(self, db_session, user, make_user, make_task):
        user1 = user
        user2 = make_user(email="user2@example.com", password="Password123@")
        user1_task = make_task(user1.id, "Test Task")
        
        update = TaskUpdate(title="New Task Title")
        
        result = update_task(db_session, user1_task.id, update, user2.id)
        db_session.expire_all()
        retrieved_task = db_session.get(TaskORM, user1_task.id)
        
        assert result is None
        assert retrieved_task.title == "Test Task"
        
    def test_returns_none_if_task_does_not_exist(self, db_session, user):
        fake_task_id = uuid.uuid4()
        
        result = update_task(db_session, fake_task_id, TaskUpdate(), user.id)
        
        assert result is None
    
    def test_partial_update_only_affects_altered_fields(self, db_session, user, make_task):
        original_task = make_task(user.id, "Test Task")
        original_due_date = original_task.due_date
        update = TaskUpdate(description="New description for task.")
        
        result = update_task(db_session, original_task.id, update, user.id)
        db_session.expire_all()
        retrieved_task = db_session.get(TaskORM, original_task.id)
        
        assert result is not None
        assert retrieved_task is not None
        assert retrieved_task.description == "New description for task."
        assert retrieved_task.title == "Test Task"
        assert retrieved_task.status == TaskStatus.pending
        assert retrieved_task.due_date.replace(tzinfo=None) == original_due_date.replace(tzinfo=None)
    
    def test_explicit_none_field_clears_specified_field(self, db_session, user, make_task):
        original_task = make_task(user.id, "Test Task")
        assert original_task.description == "Test description."
        update = TaskUpdate(description=None)
        
        result = update_task(db_session, original_task.id, update, user.id)
        db_session.expire_all()
        updated_task = db_session.get(TaskORM, original_task.id)
        
        assert result is not None
        assert updated_task is not None
        assert updated_task.description is None
        

class TestDeleteTask:
    def test_task_deleted_successfully(self, db_session, user, make_task):
        task = make_task(user.id, "Test Task")
        
        result = delete_task(db_session, task.id, user.id)
        db_session.expire_all()
        retrieved_task = db_session.get(TaskORM, task.id)
        
        assert retrieved_task is None
        assert result is True
    
    def test_returns_false_if_task_does_not_exist(self, db_session, user):
        fake_task_id = uuid.uuid4()
        
        result = delete_task(db_session, fake_task_id, user.id)
        
        assert result is False
    
    def test_does_not_delete_task_belonging_to_another_user(self, db_session, user, make_user, make_task):
        user1 = user
        user2 = make_user(email="user2@example.com", password="Password123@")
        user1_task = make_task(user1.id, "Test Task")
        
        result = delete_task(db_session, user1_task.id, user2.id)
        db_session.expire_all()
        retrieved_task = db_session.get(TaskORM, user1_task.id)
        
        assert result is False
        assert retrieved_task is not None
        