import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TitleContext, UserContext } from "../../context";
import { createTask } from "../../lib/api/tasks";
import { validateTaskTitle } from "../../lib/utils/validate";
import { showError } from "../../lib/utils/errors";
import "./AddTask.css";

function AddTask() {
    const navigate = useNavigate();
    const userContext = useContext(UserContext);
    const titleContext = useContext(TitleContext);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");
    const [errorText, setErrorText] = useState<string>("");
    const [showErrorText, setShowErrorText] = useState<boolean>(false);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);

    useEffect(() => {
        titleContext.setTitle("Task Beacon - Add Task");
        if (!userContext.user) navigate("/");
    }, [userContext.user, titleContext, navigate]);

    if (!userContext.user) return null;

    const errorContext = { errorText, setErrorText, showErrorText, setShowErrorText };

    async function handleSubmit() {
        const invalid = validateTaskTitle(title);
        if (invalid) {
            showError(invalid, errorContext);
            return;
        }
        setSubmitDisabled(true);
        const task = await createTask(
            userContext.user!.token,
            title,
            description || null,
            dueDate ? new Date(dueDate).toISOString() : null,
        );
        if (task) {
            navigate("/dashboard");
        } else {
            showError("Could not create task", errorContext);
            setSubmitDisabled(false);
        }
    }

    return (
        <div className="content-container">
            <div className="back-btn-box">
                <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
            </div>

            <div className="task-form-container">
                <h1>Add task</h1>
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
                        <label>Due date:</label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                    <div className="task-form-submit">
                        <button type="button" disabled={submitDisabled} onClick={handleSubmit}>
                            {submitDisabled ? "Adding..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddTask;
