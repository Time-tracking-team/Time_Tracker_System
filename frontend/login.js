const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch("/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (data.user.role === "Administrator" || data.user.role === "Admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }
        } else {
            alert(data.message || "Invalid credentials.");
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
});
