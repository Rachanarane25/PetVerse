// ✅ header.js — Fixed Version for Working Login Navigation

function updateAuthLinks() {
    const user = localStorage.getItem("petpal_user");
    const loginLink = document.getElementById("loginLink");
    const logoutItem = document.getElementById("logoutItem");
    const logoutLink = document.getElementById("logoutLink");

    if (user && loginLink) {
        // ✅ Show welcome but keep link working
        loginLink.innerHTML = `Welcome, ${user} 👋`;
        loginLink.style.color = "var(--accent)";
        loginLink.href = "/login"; // allow visiting login page if needed
        loginLink.onclick = null;

        if (logoutItem && logoutLink) {
            logoutItem.style.display = "block";
            logoutLink.onclick = logout;
        }
    } else if (loginLink) {
        // ✅ Not logged in → go to login normally
        loginLink.innerHTML = "Login / Signup";
        loginLink.style.color = "";
        loginLink.href = "/login";
        loginLink.onclick = null;

        if (logoutItem) logoutItem.style.display = "none";
    }

    // ✅ Always show chatbot icon
    const chatIcon = document.getElementById("chatbotFloatingIcon");
    if (chatIcon) chatIcon.style.display = "flex";
}

function logout() {
    const user = localStorage.getItem("petpal_user");
    localStorage.removeItem("petpal_user");
    showToast(`Goodbye, ${user}! You have been logged out.`);
    updateAuthLinks();
    setTimeout(() => {
        window.location.href = "/";
    }, 1000);
}

function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

// ✅ Run automatically on page load
document.addEventListener("DOMContentLoaded", updateAuthLinks);
