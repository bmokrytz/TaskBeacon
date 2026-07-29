import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserContext, TitleContext } from '../../context';
import { fetchTasks } from '../../lib/api/tasks';
import { TaskRow } from './TaskRow';
import type { Task } from '../../lib/types';
import './Dashboard.css'

function Dashboard() {
    const navigate = useNavigate();
    const userContext = useContext(UserContext);
    const titleContext = useContext(TitleContext);
    const [tasks, setTasks] = useState<Array<Task>>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        titleContext.setTitle("Task Beacon - Dashboard");

        if (!userContext.user) {
            navigate("/");
            return;
        }

        async function loadTasks() {
            const fetched = await fetchTasks(userContext.user!.token);
            setTasks(fetched);
            setLoading(false);
        }
        loadTasks();
    }, [userContext.user, titleContext, navigate]);

    if (!userContext.user) return null;

    function handleChange(updated: Task) {
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    }

    function handleDelete(task_id: string) {
        setTasks(prev => prev.filter(t => t.id !== task_id));
    }

    const sorted = tasks.slice().sort((a, b) => (a.status === b.status ? 0 : a.status === "pending" ? -1 : 1));

    return (
        <>
            <HeaderBar/>
            <div className="dashboard-page">
                <div className="dashboard-toolbar">
                    <h1 className="dashboard-heading">Your tasks</h1>
                    <button className="add-task-btn" onClick={() => navigate("/tasks/new")}>+ Add task</button>
                </div>

                {loading ? (
                    <p className="empty-state">Loading...</p>
                ) : tasks.length === 0 ? (
                    <p className="empty-state">No tasks yet. Add one to get started.</p>
                ) : (
                    <div className="task-table-container">
                        <table className="task-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Due date</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map(task => (
                                    <TaskRow key={task.id} task={task} onChange={handleChange} onDelete={handleDelete} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}

export default Dashboard;

function HeaderBar() {
    const userContext = useContext(UserContext);

    return (
        <div className="header-bar">
            <span className="title">Task Beacon</span>
            <div className="sign-out-btn-container">
                <p className="signed-in-user-label">Signed in as: </p>
                <p className="signed-in-user">{userContext.user?.email}</p>
                <SignOutButton/>
            </div>
        </div>
    );
}

function SignOutButton() {
    const userContext = useContext(UserContext);
    const [state, setState] = useState<"enabled" | "disabled">("enabled");
    const [label, setLabel] = useState<string>("Sign out");

    function clickHandler() {
        setState("disabled");
        setLabel("Signing out...");
        localStorage.removeItem("id");
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        userContext.setUser(null);
        setLabel("Sign out");
        setState("enabled");
    }

    return (
        <button className="sign-out-btn" disabled={state === "disabled"} onClick={clickHandler}>{label}</button>
    );
}
