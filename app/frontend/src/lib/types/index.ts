export interface User {
    id: string;
    email: string;
    token: string;
}

export type TaskStatus = "pending" | "completed";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    due_date: string | null;
    created_at: string;
    updated_at: string;
}
