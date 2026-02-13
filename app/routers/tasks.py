from fastapi import APIRouter, HTTPException, Depends, status
from app.models.task import TaskPublic, TaskCreate, TaskUpdate
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.storage.in_memory import list_tasks, create_task, get_task_by_id, update_task, delete_task
from uuid import UUID
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=list[TaskPublic])
def list_tasks_endpoint(current_user: User = Depends(get_current_user)):
    """
    Task listing endpoint.
    - Call task listing method
    - Return task list
    """
    logger.info("Fetching tasks for user_id=%s", str(current_user.id))
    return list_tasks(user_id=current_user.id)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=TaskPublic)
def create_task_endpoint(data: TaskCreate, current_user: User = Depends(get_current_user)):
    """
    Create new task endpoint.
    - Call task creation method
    - Return task
    """
    logger.info("Creating task with title='%s'", data.title)
    task = create_task(data, user_id=current_user.id)
    logger.info("Task created. id=%s", str(task.id))
    return task

@router.get("/{task_id}", response_model=TaskPublic)
def get_task_by_id_endpoint(task_id: UUID, current_user: User = Depends(get_current_user)):
    """
    Fetch a task by id endpoint.
    - Call task getter method
    - Return task
    """
    logger.info("Fetching task id=%s", str(task_id))
    task = get_task_by_id(task_id, user_id=current_user.id)
    if not task:
        logger.warning("Task not found id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskPublic)
def update_task_endpoint(task_id: UUID, data: TaskUpdate, current_user: User = Depends(get_current_user)):
    """
    Update an existing task endpoint.
    - Call task update endpoint
    - Return task
    - If no task matching id exists, raise HTTPException
    """
    logger.info("Updating task id=%s", str(task_id))
    task = update_task(task_id, data, user_id=current_user.id)
    if not task:
        logger.warning("Task not found for update id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    logger.info("Task updated id=%s", str(task_id))
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(task_id: UUID, current_user: User = Depends(get_current_user)):
    """
    Delete a task endpoint.
    - Call task deletion method
    - If no task matching id exists, raise HTTPException
    """
    logger.info("Deleting task id=%s", str(task_id))
    deleted = delete_task(task_id, user_id=current_user.id)
    if not deleted:
        logger.warning("Task not found for delete id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    logger.info("Task deleted id=%s", str(task_id))

