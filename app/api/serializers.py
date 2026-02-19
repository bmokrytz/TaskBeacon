from app.models.task import TaskPublic, TaskStatus
from app.db.models.task_orm import TaskORM
from app.models.user import UserPublic
from app.db.models.user_orm import UserORM

def task_orm_to_public(task: TaskORM) -> TaskPublic:
    public = TaskPublic(
        id=task.id,
        title=task.title,
        description=task.description,
        status=TaskStatus(task.status),
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at
    )
    return public

def user_orm_to_public(user: UserORM) -> UserPublic:
    public = UserPublic(
        id=user.id,
        email=user.email,
        created_at=user.created_at
    )
    return public