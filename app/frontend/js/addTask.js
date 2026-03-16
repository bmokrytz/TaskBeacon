document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("add-task-form");
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/";
        return;
    }

    // --------------------------------------------------------
    // Error box
    // --------------------------------------------------------
    const error_box = document.querySelector(".error_box");

    function showError(message) {
        error_box.textContent = message;
        error_box.style.display = "block";
    }

    function hideError() {
        error_box.style.display = "none";
    }

    // --------------------------------------------------------
    // Back button
    // --------------------------------------------------------
    const back_btn = document.getElementById("back_btn");

    back_btn.addEventListener("click", () => {
        window.location.href = "/tasks.html";
    });

    // --------------------------------------------------------
    // Form submission
    // --------------------------------------------------------
    const submit_btn = document.querySelector(".submit_btn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const raw = document.getElementById("due_date").value;

        let due_date = null;
        if (raw !== "") {
            due_date = datetimeLocalToUTCISOString(raw);
        }

        submit_btn.disabled = true;
        submit_btn.textContent = "Adding...";
        submit_btn.style.opacity = "0.7";

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, due_date }),
            });

            if (!res.ok) {
                showError("Failed to create task. Please try again.");
                return;
            }

            window.location.href = "/tasks.html";

        } catch (err) {
            showError("Could not reach the server.");

        } finally {
            submit_btn.disabled = false;
            submit_btn.textContent = "Add Task";
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
