import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { TitleContext, UserContext } from "../../context";
import { fetchTaskById, updateTask } from "../../lib/api/tasks";
import { validateTaskTitle } from "../../lib/utils/validate";
import { showError } from "../../lib/utils/errors";
import type { TaskStatus } from "../../lib/types";
import "./UpdateTask.css";

function UpdateTask() {
    const navigate = useNavigate();
    const { task_id } = useParams();
    const userContext = useContext(UserContext);
    const titleContext = useContext(TitleContext);

    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [status, setStatus] = useState<TaskStatus>("pending");
    const [dueDate, setDueDate] = useState<string>("");
    const [errorText, setErrorText] = useState<string>("");
    const [showErrorText, setShowErrorText] = useState<boolean>(false);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);

    useEffect(() => {
        titleContext.setTitle("Task Beacon - Update Task");

        if (!userContext.user) {
            navigate("/");
            return;
        }

        async function loadTask() {
            const task = await fetchTaskById(userContext.user!.token, task_id!);
            if (!task) {
                setNotFound(true);
                setLoading(false);
                return;
            }
            setTitle(task.title);
            setDescription(task.description ?? "");
            setStatus(task.status);
            setDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
            setLoading(false);
        }
        loadTask();
    }, [userContext.user, titleContext, navigate, task_id]);

    if (!userContext.user) return null;

    const errorContext = { errorText, setErrorText, showErrorText, setShowErrorText };

    async function handleSubmit() {
        const invalid = validateTaskTitle(title);
        if (invalid) {
            showError(invalid, errorContext);
            return;
        }
        setSubmitDisabled(true);
        const updated = await updateTask(userContext.user!.token, task_id!, {
            title,
            description: description || null,
            status,
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
        });
        if (updated) {
            navigate("/dashboard");
        } else {
            showError("Could not save changes", errorContext);
            setSubmitDisabled(false);
        }
    }

    return (
        <div className="content-container">
            <div className="back-btn-box">
                <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
            </div>

            <div className="task-form-container">
                {loading ? (
                    <p>Loading...</p>
                ) : notFound ? (
                    <p>Task not found.</p>
                ) : (
                    <>
                        <h1>Update task</h1>
                        {showErrorText ? <h2>{errorText}</h2> : null}
                        <form onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}>
                            <div className="task-form-field">
                                <label>Title:</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="task-form-field">
                                <label>Description:</label>
                                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="task-form-field">
                                <label>Status:</label>
                                <div className="task-form-radio-group">
                                    <label>
                                        <input type="radio" name="status" checked={status === "pending"} onChange={() => setStatus("pending")} />
                                        Pending
                                    </label>
                                    <label>
                                        <input type="radio" name="status" checked={status === "completed"} onChange={() => setStatus("completed")} />
                                        Completed
                                    </label>
                                </div>
                            </div>
                            <div className="task-form-field">
                                <label>Due date:</label>
                                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                            </div>
                            <div className="task-form-submit">
                                <button type="button" disabled={submitDisabled} onClick={handleSubmit}>
                                    {submitDisabled ? "Saving..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default UpdateTask;
