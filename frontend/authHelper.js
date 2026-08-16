function getLoggedInUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        return null;
    }
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

function checkAuth(requiredRole = null) {
    const user = getLoggedInUser();
    if (!user) {
        alert("Authentication required. Please login.");
        window.location.href = "login.html";
        return null;
    }

    if (requiredRole) {
        const isAdmin = user.role === "Administrator" || user.role === "Admin";
        if (requiredRole === "Administrator" && !isAdmin) {
            alert("Access Denied: Administrators only.");
            window.location.href = "dashboard.html";
            return null;
        }
    }
    return user;
}

function logout() {
    localStorage.removeItem("user");
    alert("Logged out successfully.");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    });
});
