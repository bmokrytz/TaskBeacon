from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from uuid import UUID
import logging

from app.models.task import TaskPublic, TaskCreate, TaskUpdate, TaskStatus
from app.models.user import User
from app.db.session import get_db
from app.storage.db_tasks import create_task, list_tasks, get_task_by_id, update_task, delete_task
from app.api.serializers import task_orm_to_public

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tasks", tags=["tasks"])



@router.get("", response_model=list[TaskPublic])
def list_tasks_endpoint(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
    ) ->list[TaskPublic]:
    """
    Task listing endpoint.
    - Retrieve list of all tasks from database (specific to authenticated user)
    - Serialize to TaskPublic and return
    """
    task_list_public = list()
    logger.info("Fetching tasks for user_id=%s", str(current_user.id))
    task_list = list_tasks(db, user_id=current_user.id)
    for task in task_list:
        public = task_orm_to_public(task)
        task_list_public.append(public)
    return task_list_public



@router.post("", status_code=status.HTTP_201_CREATED, response_model=TaskPublic)
def create_task_endpoint(
    data: TaskCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
    ) -> TaskPublic:
    """
    Create new task endpoint.
    - Call task creation method
    - Return task
    """
    logger.info("Creating task with title='%s'", data.title)
    task = create_task(
        db,
        owner_id=current_user.id,
        title=data.title, 
        description=data.description,
        status=data.status.value,
        due_date=data.due_date
        )
    logger.info("Task created. id=%s", str(task.id))
    task_public = task_orm_to_public(task)
    return task_public



@router.get("/{task_id}", response_model=TaskPublic)
def get_task_by_id_endpoint(
    task_id: UUID, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
    ) -> TaskPublic:
    """
    Fetch a task by id endpoint.
    - Call task getter method
    - Return task
    """
    logger.info("Fetching task id=%s", str(task_id))
    task = get_task_by_id(
        db, 
        task_id=task_id, 
        user_id=current_user.id
        )
    if not task:
        logger.warning("Task not found id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    task_public = task_orm_to_public(task)
    return task_public



@router.patch("/{task_id}", response_model=TaskPublic)
def update_task_endpoint(
    task_id: UUID, 
    data: TaskUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
    ) -> TaskPublic:
    """
    Update an existing task endpoint.
    - Call task update endpoint
    - Return task
    - If no task matching id exists, raise HTTPException
    """
    logger.info("Updating task id=%s", str(task_id))
    task = update_task(
        db, 
        task_id=task_id, 
        data=data,
        owner_id=current_user.id
        )
    if not task:
        logger.warning("Task not found for update id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    logger.info("Task updated id=%s", str(task_id))
    task_public = task_orm_to_public(task)
    return task_public



@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(
    task_id: UUID, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
    ):
    """
    Delete a task endpoint.
    - Call task deletion method
    - If no task matching id exists, raise HTTPException
    """
    logger.info("Deleting task id=%s", str(task_id))
    deleted = delete_task(db, task_id=task_id, user_id=current_user.id)
    if not deleted:
        logger.warning("Task not found for delete id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    logger.info("Task deleted id=%s", str(task_id))

