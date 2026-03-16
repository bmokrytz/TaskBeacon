document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("register-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    localStorage.setItem("login_email", email);
    const password = document.getElementById("password").value;

    const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
    const text = await res.text();
    alert(`Register failed`);
    return;
    }

    const login_res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    });

    const data = await login_res.json();
    const token = data.access_token || data.token;
    localStorage.setItem("token", token);

    window.location.href = "/tasks.html";
});

const loginBtn = document.getElementById("login_btn");

loginBtn.addEventListener("click", () => {

    window.location.href = "/index.html";
});
});