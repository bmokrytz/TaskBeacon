document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
    alert("Not logged in");
    window.location.href = "/";
    return;
    }

    const email = localStorage.getItem("login_email");
    const logged_in_as = document.getElementById("logged_in_as")
    logged_in_as.textContent = email;
    logged_in_as.style.paddingRight = "10px";

    const res = await fetch("/api/tasks", {
    headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
    alert("Failed to fetch tasks");
    return;
    }

    const tasks = await res.json();
    await buildTaskTable(tasks);
});

async function buildTaskTable(data) {
    const root = document.getElementById("tasks-root");

    if (!Array.isArray(data) || data.length === 0) {
    const table = document.createElement("table");
    const table_head = document.createElement("thead");
    const row = document.createElement("tr");
    const header = document.createElement("th");
    header.textContent = "No tasks";
    header.style.fontSize = "2rem";
    row.appendChild(header);
    table_head.appendChild(row);
    table.appendChild(table_head);
    root.appendChild(table);
    return;
    }

    const table = buildTaskTableHeader();
    const tbody = document.createElement("tbody");

    data.forEach(async (task) => {
        const taskRow = await buildTaskElement(task);
        tbody.appendChild(taskRow);
    });
    table.appendChild(tbody);
    root.appendChild(table);
}

function buildTaskTableHeader() {
    const table = document.createElement("table");

    const thead = document.createElement("thead");

    const header_row = document.createElement("tr");

    const title_header = document.createElement("th");
    title_header.textContent = "Task";
    header_row.appendChild(title_header);

    const desc_header = document.createElement("th");
    desc_header.textContent = "Description";
    header_row.appendChild(desc_header);

    const status_header = document.createElement("th");
    status_header.textContent = "Status";
    header_row.appendChild(status_header);

    const due_date_header = document.createElement("th");
    due_date_header.textContent = "Due date";
    header_row.appendChild(due_date_header);

    const created_at_header = document.createElement("th");
    created_at_header.textContent = "Creation date/time";
    header_row.appendChild(created_at_header);

    const updated_at_header = document.createElement("th");
    updated_at_header.textContent = "Last update date/time";
    header_row.appendChild(updated_at_header);

    const actions_header = document.createElement("th");
    actions_header.textContent = "Actions";
    header_row.appendChild(actions_header);

    thead.appendChild(header_row);
    table.appendChild(thead);
    return table;
}

async function buildActionButtions(row, task) {
    const token = localStorage.getItem("token");

    const data = document.createElement("td");
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";

    const complete_task_btn = document.createElement("button");
    complete_task_btn.textContent = "Mark completed";
    complete_task_btn.className = "action_btn";
    complete_task_btn.addEventListener("click", async () => {
        const status = "completed";

        const res = await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (!res.ok) {
            alert("Task update failed");
            return;
        }

        window.location.href = "/tasks.html";
    });
    container.appendChild(complete_task_btn);

    const update_task_btn = document.createElement("button");
    update_task_btn.textContent = "Update";
    update_task_btn.className = "action_btn";
    update_task_btn.addEventListener("click", () => {
        localStorage.setItem("task_id", task.id);
        localStorage.setItem("task_title", task.title);
        localStorage.setItem("task_description", task.description);
        localStorage.setItem("task_status", task.status);
        localStorage.setItem("task_due_date", task.due_date);
        window.location.href = "/updateTask.html";
    });
    container.appendChild(update_task_btn);

    const delete_task_btn = document.createElement("button");
    delete_task_btn.textContent = "Delete";
    delete_task_btn.className = "action_btn";
    delete_task_btn.addEventListener("click", async () => {
        const res = await fetch(`/api/tasks/${task.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        if (!res.ok) {
            alert("Task delete failed");
            return;
        }

        window.location.href = "/tasks.html";
    });
    container.appendChild(delete_task_btn);

    data.appendChild(container);
    row.appendChild(data);
}

async function buildTaskElement(task) {
    const row = document.createElement("tr");


    const title = document.createElement("td");
    title.textContent = task.title ?? "";
    title.style.width = "3cm";
    row.appendChild(title);

    const description = document.createElement("td");
    description.textContent = task.description ?? "";
    row.appendChild(description);

    const status = document.createElement("td");
    status.textContent = task.status ?? "";
    row.appendChild(status);

    const due_date = document.createElement("td");
    if (task.due_date) {
    const date = new Date(task.due_date);
    due_date.textContent = date.toLocaleDateString();
    } else {
    due_date.textContent = "None";
    }
    due_date.style.width = "1.5cm";
    row.appendChild(due_date);

    const created_at = document.createElement("td");
    created_at.textContent = task.created_at ? new Date(task.created_at).toLocaleString() : "null";
    row.appendChild(created_at);

    const updated_at = document.createElement("td");
    updated_at.textContent = task.updated_at ? new Date(task.updated_at).toLocaleString() : "No updates made";
    row.appendChild(updated_at);

    await buildActionButtions(row, task);

    return row;
}

const logoutBtn = document.getElementById("logout_btn");

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("login_email");
    window.location.href = "/index.html";
});

const add_task_btn = document.getElementById("add_task_btn");

add_task_btn.addEventListener("click", () => {
    window.location.href = "/addTask.html";
});