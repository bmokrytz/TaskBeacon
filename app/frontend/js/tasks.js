document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/";
        return;
    }

    // Error box
    const error_box = document.querySelector(".error_box");

    function showError(message) {
        error_box.textContent = message;
        error_box.style.display = "block";
    }

    function hideError() {
        error_box.style.display = "none";
    }

    // Logout button
    const logout_btn = document.querySelector(".logout_btn");

    logout_btn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("login_email");
        window.location.href = "/index.html";
    });

    // Add task button
    const add_btn = document.querySelector(".add_btn");

    add_btn.addEventListener("click", () => {
        window.location.href = "/addTask.html";
    });

    // Fetch and render tasks
    await loadTasks();

    async function loadTasks() {
        hideError();

        try {
            const res = await fetch("/api/tasks", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/";
                return;
            }

            if (!res.ok) {
                showError("Failed to load tasks. Please try again.");
                return;
            }

            const tasks = await res.json();
            renderTasks(tasks);

        } catch (err) {
            showError("Could not reach the server.");
        }
    }

    function renderTasks(tasks) {
        const task_list = document.getElementById("task_list");
        const empty_state = document.getElementById("empty_state");

        task_list.innerHTML = "";

        if (tasks.length === 0) {
            empty_state.style.display = "block";
            return;
        }

        empty_state.style.display = "none";

        for (const task of tasks) {
            const card = buildTaskCard(task);
            task_list.appendChild(card);
        }
    }

    function buildTaskCard(task) {
        const card = document.createElement("div");
        card.className = "task_card";

        // Format due date for display
        let due_date_text = "";
        if (task.due_date) {
            const d = new Date(task.due_date);
            due_date_text = d.toLocaleDateString(undefined, {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit"
            });
        }

        const description_text = task.description
            ? escapeHtml(task.description)
            : "<em>No description.</em>";

        card.innerHTML = `
            <div class="task_card_main">
                <div class="task_card_left">
                    <div class="task_title">${escapeHtml(task.title)}</div>
                    <div class="task_meta">
                        <span class="task_status ${task.status}">${task.status}</span>
                        ${due_date_text ? `<span class="task_due_date">Due ${due_date_text}</span>` : ""}
                    </div>
                </div>
                <div class="task_card_right">
                    <button class="checkmark_btn" data-id="${task.id}">✓</button>
                    <button class="edit_btn" data-id="${task.id}">Edit</button>
                    <button class="delete_btn" data-id="${task.id}">Delete</button>
                </div>
            </div>
            <div class="task_description_drawer">
                <p class="task_description_text">${description_text}</p>
            </div>
            <button class="expand_btn" aria-label="Expand task description">
                <svg class="expand_arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
        `;

        // Mark complete
        card.querySelector(".checkmark_btn").addEventListener("click", async (e) => {
            e.stopPropagation();
            await completeTask(task.id);
        });

        // Edit
        card.querySelector(".edit_btn").addEventListener("click", (e) => {
            e.stopPropagation();
            localStorage.setItem("task_id", task.id);
            localStorage.setItem("task_title", task.title);
            localStorage.setItem("task_description", task.description);
            localStorage.setItem("task_status", task.status);
            localStorage.setItem("task_due_date", task.due_date);
            window.location.href = "/updateTask.html";
        });

        // Delete
        card.querySelector(".delete_btn").addEventListener("click", async (e) => {
            e.stopPropagation();
            await deleteTask(task.id);
        });

        // Expand/collapse description drawer
        card.querySelector(".expand_btn").addEventListener("click", (e) => {
            e.stopPropagation();
            const is_expanded = card.classList.toggle("expanded");
            card.querySelector(".expand_btn").setAttribute("aria-expanded", is_expanded);
        });

        return card;
    }

    async function completeTask(task_id) {
        const status = "completed";
        const payload = { status };

        try {
            const res = await fetch(`/api/tasks/${task_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                showError("Failed to update task. Please try again.");
                return;
            }

            await loadTasks();

        } catch (err) {
            showError("Could not reach the server.");
        }
    }

    async function deleteTask(task_id) {
        try {
            const res = await fetch(`/api/tasks/${task_id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!res.ok && res.status !== 204) {
                showError("Failed to delete task. Please try again.");
                return;
            }

            await loadTasks();

        } catch (err) {
            showError("Could not reach the server.");
        }
    }

    // Prevent XSS when inserting task titles into innerHTML
    function escapeHtml(str) {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

});
