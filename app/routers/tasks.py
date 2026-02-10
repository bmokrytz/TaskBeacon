from fastapi import APIRouter, HTTPException, status, Response
from app.models.task import Task, TaskCreate, TaskUpdate
from app.storage.in_memory import list_tasks, create_task, get_task_by_id, update_task, delete_task
from uuid import UUID
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=list[Task])
def list_tasks_endpoint():
    """
    Task listing endpoint.
    - Call task listing method
    - Return task list
    """
    logger.info("Fetching all tasks")
    return list_tasks()

@router.post("", status_code=status.HTTP_201_CREATED, response_model=Task)
def create_task_endpoint(data: TaskCreate):
    """
    Create new task endpoint.
    - Call task creation method
    - Return task
    """
    logger.info("Creating task with title='%s'", data.title)
    task = create_task(data)
    logger.info("Task created. id=%s", str(task.id))
    return task

@router.get("/{task_id}", response_model=Task)
def get_task_by_id_endpoint(task_id: UUID):
    """
    Fetch a task by id endpoint.
    - Call task getter method
    - Return task
    """
    logger.info("Fetching task id=%s", str(task_id))
    task = get_task_by_id(task_id)
    if not task:
        logger.warning("Task not found id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=Task)
def update_task_endpoint(task_id: UUID, data: TaskUpdate):
    """
    Update an existing task endpoint.
    - Call task update endpoint
    - Return task
    - If no task matching id exists, raise HTTPException
    """
    logger.info("Updating task id=%s", str(task_id))
    task = update_task(task_id, data)
    if not task:
        logger.warning("Task not found for update id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    logger.info("Task updated id=%s", str(task_id))
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(task_id: UUID):
    """
    Delete a task endpoint.
    - Call task deletion method
    - If no task matching id exists, raise HTTPException
    """
    logger.info("Deleting task id=%s", str(task_id))
    deleted = delete_task(task_id)
    if not deleted:
        logger.warning("Task not found for delete id=%s", str(task_id))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    logger.info("Task deleted id=%s", str(task_id))

