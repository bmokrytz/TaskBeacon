from fastapi import APIRouter, HTTPException, Depends, status
from app.models.task import TaskPublic, TaskCreate, TaskUpdate
from app.models.user import User
from app.db.session import Session, get_db
from app.auth.dependencies import get_current_user
from app.storage.db_tasks import create_task, list_tasks, get_task_by_id, update_task, delete_task
from uuid import UUID
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=list[TaskPublic])
def list_tasks_endpoint(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Task listing endpoint.
    - Call task listing method
    - Return task list
    """
    logger.info("Fetching tasks for user_id=%s", str(current_user.id))
    return list_tasks(db, user_id=current_user.id)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=TaskPublic)
def create_task_endpoint(
    data: TaskCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
    ):
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
        status=data.status,
        due_date=data.due_date
        )
    logger.info("Task created. id=%s", str(task.id))
    return task

@router.get("/{task_id}", response_model=TaskPublic)
def get_task_by_id_endpoint(
    task_id: UUID, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
    ):
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
    return task


@router.patch("/{task_id}", response_model=TaskPublic)
def update_task_endpoint(
    task_id: UUID, 
    data: TaskUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
    ):
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
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(task_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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

