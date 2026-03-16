document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "http://localhost:8000"; // <-- change this

    const home_btn = document.querySelector(".home_btn");
    home_btn.addEventListener("click", () => {
        window.location.href = "/index.html";
    });

    const error_box = document.querySelector(".error_box");
    error_box.style.display = "none";

    function showError(message) {
        error_box.textContent = message;
        error_box.style.display = "block";
    }

    function hideError() {
        error_box.style.display = "none";
    }

    // Registration form submission
    const form = document.querySelector(".form");
    const submit_btn = document.querySelector(".submit_btn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirm_password = document.getElementById("confirm_password").value;

        if (password !== confirm_password) {
            showError("Passwords do not match. Try again...");
            return;
        }

        // Disable button while processing request
        submit_btn.disabled = true;
        submit_btn.textContent = "Creating account...";
        submit_btn.style.opacity = "0.7";

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                showError("Something went wrong. Please try again later...");
                localStorage.removeItem("login_email");
                return;
            }

            const data = await res.json();
            const token = data.access_token || data.token;

            localStorage.setItem("token", token);
            localStorage.setItem("login_email", email);

            window.location.href = "/tasks.html";

        } catch (err) {
            showError("Could not reach the server.");

        } finally {
            // Re-enable the button whether it succeeded or failed
            submit_btn.disabled = false;
            submit_btn.textContent = "Login";
            submit_btn.style.opacity = "1";
        }
    });

});