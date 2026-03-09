// public/js/auth.js

const API_BASE = "/api/users"; // Adjust if needed

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       LOGIN FUNCTION
    ======================================== */
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Login failed");
                }

                // Store token + user info
                localStorage.setItem("token", data.token);
                localStorage.setItem("userName", data.name);
                localStorage.setItem("userId", data._id);

                // Redirect to app
                window.location.href = "/app.html";

            } catch (err) {
                alert(err.message);
            }
        });
    }

    /* ========================================
       SIGNUP FUNCTION
    ======================================== */
    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const res = await fetch(`${API_BASE}/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Signup failed");
                }

                alert("Account created successfully! Please login.");
                window.location.href = "/index.html";

            } catch (err) {
                alert(err.message);
            }
        });
    }

    /* ========================================
       PROTECT app.html (Redirect if no token)
    ======================================== */
    const isAppPage = window.location.pathname.includes("app.html");

    if (isAppPage) {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/index.html";
        }
    }

    /* ========================================
       LOGOUT FUNCTION
    ======================================== */
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            localStorage.removeItem("userId");

            window.location.href = "/index.html";
        });
    }

});