document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("update-task-form");
const token = localStorage.getItem("token");

if (!token) {
alert("Not logged in");
window.location.href = "/";
return;
}

const back_btn = document.getElementById("back_btn");

back_btn.addEventListener("click", () => {
    window.location.href = "/tasks.html";
});

const task_title = localStorage.getItem("task_title");
document.getElementById("title").value = task_title;

const task_due_date = localStorage.getItem("task_due_date");
if (task_due_date) {
    document.getElementById("due_date").value = utcISOStringToDatetimeLocal(task_due_date);
}

const task_description = localStorage.getItem("task_description");
if (task_description === "null") {
    document.getElementById("description").value = "";
}
else {
    document.getElementById("description").value = task_description;
}
const task_status = localStorage.getItem("task_status");

if (!task_status) {
alert("Task status not found.");
window.location.href = "/tasks.html";
return;
}

if (task_status === "pending") {
    document.getElementById("pending").checked = true;
}
else {
    document.getElementById("completed").checked = true;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const raw = document.getElementById("due_date").value;

    let due_date = null;
    if (raw !== "") {
        due_date = datetimeLocalToUTCISOString(raw);
    }

    const status = document.querySelector('input[name="status"]:checked').value;
    const payload = {};
    payload.title = title;
    payload.description = description;
    payload.status = status;
    payload.due_date = due_date;
    if (due_date !== null) {
    payload.due_date = due_date;
    }

    const task_id = localStorage.getItem("task_id");
    const res = await fetch(`/api/tasks/${task_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
    const text = await res.text();
    alert(`Task update failed`);
    return;
    }
    localStorage.removeItem("task_id");
    localStorage.removeItem("task_title");
    localStorage.removeItem("task_description");
    localStorage.removeItem("task_status");
    localStorage.removeItem("task_due_date");
    window.location.href = "/tasks.html";
});
});

function datetimeLocalToUTCISOString(raw) {
    const [datePart, timePart] = raw.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss = "0"] = timePart.split(":");
    const dt = new Date(y, m - 1, d, Number(hh), Number(mm), Number(ss)); // local time
    return dt.toISOString(); // UTC with Z
}

function utcISOStringToDatetimeLocal(utcString) {
    const date = new Date(utcString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`; // datetime-local
}