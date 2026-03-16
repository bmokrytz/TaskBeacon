document.addEventListener("DOMContentLoaded", () => {

    // Register button
    const register_btn = document.querySelector(".register_btn");
    register_btn.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    // Error box. Hidden by default and shown on login failure
    const error_box = document.querySelector(".error_box");
    error_box.style.display = "none";

    function showError(message) {
        error_box.textContent = message;
        error_box.style.display = "block";
    }

    function hideError() {
        error_box.style.display = "none";
    }

    // Login form submission
    const form = document.querySelector(".form");
    const submit_btn = document.querySelector(".submit_btn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        // Disable button while processing request
        submit_btn.disabled = true;
        submit_btn.textContent = "Signing in...";
        submit_btn.style.opacity = "0.7";

        try {
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                showError("Login failed. Please check your email and password.");
                localStorage.removeItem("login_email");
                return;
            }

            const data = await res.json();
            const token = data.access_token;

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