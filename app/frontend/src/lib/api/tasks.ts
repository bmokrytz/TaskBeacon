import type { Task, TaskStatus } from '../types/index';
import { CONFIG } from '../../config';

export async function fetchTasks(token: string): Promise<Array<Task>> {
    try {
        const result = await fetch(`${CONFIG.API_BASE_URL}/tasks`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!result.ok) {
            return [];
        }
        const tasks: Array<Task> = await result.json();
        return tasks;
    } catch {
        return [];
    }
}

export async function fetchTaskById(token: string, task_id: string): Promise<Task | null> {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/tasks/${task_id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) {
            return null;
        }
        const task: Task = await res.json();
        return task;
    } catch {
        return null;
    }
}

export async function createTask(token: string, title: string, description: string | null, due_date: string | null): Promise<Task | null> {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, due_date }),
        });
        if (!res.ok) {
            return null;
        }
        const task: Task = await res.json();
        return task;
    } catch {
        return null;
    }
}

export async function updateTask(
    token: string,
    task_id: string,
    changes: { title?: string; description?: string | null; status?: TaskStatus; due_date?: string | null }
): Promise<Task | null> {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/tasks/${task_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(changes),
        });
        if (!res.ok) {
            return null;
        }
        const task: Task = await res.json();
        return task;
    } catch {
        return null;
    }
}

export async function deleteTask(token: string, task_id: string): Promise<boolean> {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/tasks/${task_id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        });
        return res.ok;
    } catch {
        return false;
    }
}
