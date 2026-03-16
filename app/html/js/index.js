document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    localStorage.setItem("login_email", email);
    const password = document.getElementById("password").value;

    const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
    const text = await res.text();
    alert(`Login failed`);
    localStorage.removeItem("login_email");
    return;
    }

    const data = await res.json();
    const token = data.access_token || data.token;
    localStorage.setItem("token", token);

    window.location.href = "/tasks.html";
});


const registerBtn = document.getElementById("register");

registerBtn.addEventListener("click", () => {

    window.location.href = "/register.html";
});
});