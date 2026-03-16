document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("update-task-form");
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

    // Back button
    const back_btn = document.getElementById("back_btn");

    back_btn.addEventListener("click", () => {
        window.location.href = "/tasks.html";
    });

    // Populate fields from localStorage
    const task_status = localStorage.getItem("task_status");

    if (!task_status) {
        window.location.href = "/tasks.html";
        return;
    }

    const task_title = localStorage.getItem("task_title");
    document.getElementById("title").value = task_title || "";

    const task_description = localStorage.getItem("task_description");
    document.getElementById("description").value = (task_description && task_description !== "null")
        ? task_description
        : "";

    const task_due_date = localStorage.getItem("task_due_date");
    if (task_due_date && task_due_date !== "null") {
        document.getElementById("due_date").value = utcISOStringToDatetimeLocal(task_due_date);
    }

    if (task_status === "pending") {
        document.getElementById("pending").checked = true;
    } else {
        document.getElementById("completed").checked = true;
    }

    // Form submission
    const submit_btn = document.querySelector(".submit_btn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const raw = document.getElementById("due_date").value;
        const status = document.querySelector('input[name="status"]:checked').value;

        let due_date = null;
        if (raw !== "") {
            due_date = datetimeLocalToUTCISOString(raw);
        }

        const payload = { title, description, status, due_date };

        submit_btn.disabled = true;
        submit_btn.textContent = "Saving...";
        submit_btn.style.opacity = "0.7";

        try {
            const task_id = localStorage.getItem("task_id");
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

            localStorage.removeItem("task_id");
            localStorage.removeItem("task_title");
            localStorage.removeItem("task_description");
            localStorage.removeItem("task_status");
            localStorage.removeItem("task_due_date");

            window.location.href = "/tasks.html";

        } catch (err) {
            showError("Could not reach the server.");

        } finally {
            submit_btn.disabled = false;
            submit_btn.textContent = "Save Changes";
            submit_btn.style.opacity = "1";
        }
    });

});

function datetimeLocalToUTCISOString(raw) {
    const [datePart, timePart] = raw.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss = "0"] = timePart.split(":");
    const dt = new Date(y, m - 1, d, Number(hh), Number(mm), Number(ss));
    return dt.toISOString();
}

function utcISOStringToDatetimeLocal(utcString) {
    const date = new Date(utcString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
