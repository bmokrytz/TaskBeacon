export type Task = {
    id: number;
    title: string;
    description?: string | null;
    status: "pending" | "in_progress" | "completed";
    due_date?: string | null;
    created_at: string;
    updated_at?: string | null;
};

export type TaskUpdate = {
    title?: string;
    description?: string;
    status?: "pending" | "in_progress" | "completed";
    due_date?: string;
}
export type TaskCreate = {
    title: string;
    description?: string;
    status: "pending" | "in_progress";
    due_date?: string;
}

export async function deleteTask(task_id: number): Promise<boolean> {
    const access_token = localStorage.getItem("access_token");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${task_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        })
        if (!response.ok) return false;
        return true;
    } catch(error) {
        console.error("Error when deleting task: ", error);
        return false;
    }
}

export async function createTask(task: TaskCreate): Promise<Task | null> {
    const access_token = localStorage.getItem("access_token");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });
        if (!response.ok) {
            return null;
        }
        const updatedTask = await response.json();
        return updatedTask;
    } catch(error) {
        console.error("Error while creating task: ", error);
        return null;
    }
}

export async function getTasks(): Promise<Task[]> {
    const access_token = localStorage.getItem("access_token");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        const taskList: Task[] = await response.json();
        return taskList;
    } catch (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }
}

export async function updateTask(
    task_id: number,
    changes: TaskUpdate,
): Promise<Task | null> {
    const access_token = localStorage.getItem("access_token");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${task_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changes),
        });
        if (!response.ok) {
            return null;
        }
        const task: Task = await response.json();
        return task;
    } catch(error) {
        console.error("Error updating task: ", error);
        return null;
    }
}

export async function setTaskStatus(
    task_id: number,
    status: "pending" | "in_progress" | "completed",
): Promise<Task | null> {
    const access_token = localStorage.getItem("access_token");
    const update: TaskUpdate = { status: status }
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${task_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(update),
        });
        if (!response.ok) {
            return null;
        }
        const task: Task = await response.json();
        return task;
    } catch(error) {
        console.error("Error updating task: ", error);
        return null;
    }
}