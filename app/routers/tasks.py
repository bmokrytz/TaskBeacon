from fastapi import APIRouter, HTTPException, status, Response
from app.models.task import Task, TaskCreate, TaskUpdate
from app.storage.in_memory import list_tasks, create_task, get_task, update_task, delete_task
from uuid import UUID

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=list[Task])
def list_tasks_endpoint():
    return list_tasks()

@router.post("", status_code=status.HTTP_201_CREATED, response_model=Task)
def create_task_endpoint(data: TaskCreate):
    task = create_task(data)
    return task
        
    return create_task(data)

@router.get("/{task_id}", response_model=Task)
def get_task_endpoint(task_id: UUID):
    task = get_task(task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=Task)
def update_task_endpoint(task_id: UUID, data: TaskUpdate):
    task = update_task(task_id, data)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(task_id: UUID):
    deleted = delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

