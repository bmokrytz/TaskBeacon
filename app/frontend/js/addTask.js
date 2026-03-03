document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("add-task-form");
const token = localStorage.getItem("token");

if (!token) {
alert("Not logged in");
window.location.href = "/";
return;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value;
    const raw = document.getElementById("due_date").value;

    let due_date = null;
    if (raw !== "") {
        due_date = datetimeLocalToUTCISOString(raw);
    }


    const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
        },
    body: JSON.stringify({ title, description, due_date }),
    });


    if (!res.ok) {
    const text = await res.text();
    alert(`Task creation failed`);
    return;
    }

    window.location.href = "/tasks.html";
});

const back_btn = document.getElementById("back_btn");

back_btn.addEventListener("click", () => {

    window.location.href = "/tasks.html";
});
});

function datetimeLocalToUTCISOString(raw) {
    // raw: "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
    const [datePart, timePart] = raw.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss = "0"] = timePart.split(":");
    const dt = new Date(y, m - 1, d, Number(hh), Number(mm), Number(ss)); // local time
    return dt.toISOString(); // UTC with Z
}