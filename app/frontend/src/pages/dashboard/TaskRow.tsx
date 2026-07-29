import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "../../context";
import { deleteTask, updateTask } from "../../lib/api/tasks";
import type { Task } from "../../lib/types";

type TaskRowProps = {
    task: Task;
    onChange: (updated: Task) => void;
    onDelete: (task_id: string) => void;
};

export function TaskRow({ task, onChange, onDelete }: TaskRowProps) {
    const navigate = useNavigate();
    const userContext = useContext(UserContext);
    const [toggleDisabled, setToggleDisabled] = useState<boolean>(false);
    const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false);

    async function handleToggle() {
        setToggleDisabled(true);
        const nextStatus = task.status === "completed" ? "pending" : "completed";
        const updated = await updateTask(userContext.user!.token, task.id, { status: nextStatus });
        if (updated) {
            onChange(updated);
        }
        setToggleDisabled(false);
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to permanently delete this task?")) return;
        setDeleteDisabled(true);
        if (await deleteTask(userContext.user!.token, task.id)) {
            onDelete(task.id);
        }
        setDeleteDisabled(false);
    }

    return (
        <tr className={task.status === "completed" ? "task-row completed-row" : "task-row"}>
            <td className="task-title-cell">{task.title}</td>
            <td className="task-description-cell">{task.description ?? ""}</td>
            <td>
                <span className={task.status === "completed" ? "status-pill completed" : "status-pill pending"}>
                    {task.status}
                </span>
            </td>
            <td>{task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { timeZone: "UTC" }) : "—"}</td>
            <td>{new Date(task.created_at).toLocaleDateString()}</td>
            <td className="actions-cell">
                <button className="row-btn toggle-btn" disabled={toggleDisabled} onClick={handleToggle}>
                    {task.status === "completed" ? "Reopen" : "Complete"}
                </button>
                <button className="row-btn edit-btn" onClick={() => navigate(`/tasks/${task.id}/edit`)}>Edit</button>
                <button className="row-btn delete-btn" disabled={deleteDisabled} onClick={handleDelete}>Delete</button>
            </td>
        </tr>
    );
}
