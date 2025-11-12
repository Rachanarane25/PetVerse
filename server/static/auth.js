// --------------------------------------------
// ✅ PetVerse Authentication Manager (Final)
// --------------------------------------------
function isLoggedIn() {
  return localStorage.getItem("petpal_user") !== null;
}

function getCurrentUser() {
  return localStorage.getItem("petpal_user");
}

function updateAuthLinks() {
  const user = getCurrentUser();
  const loginLink = document.getElementById("loginLink");
  const logoutItem = document.getElementById("logoutItem");
  const logoutLink = document.getElementById("logoutLink");

  if (user && loginLink) {
    loginLink.innerHTML = `Welcome, ${user} 👋`;
    loginLink.style.color = "var(--accent)";
    loginLink.href = "javascript:void(0)";
    loginLink.onclick = () => showToast(`Already logged in as ${user}`);
    
    if (logoutItem) logoutItem.style.display = "block";
    if (logoutLink) logoutLink.onclick = logout;
  } else if (loginLink) {
    loginLink.innerHTML = "Login / Signup";
    loginLink.href = "login.html";
    loginLink.onclick = null;
    if (logoutItem) logoutItem.style.display = "none";
  }

  // ✅ Always show chatbot icon
  const chatIcon = document.getElementById("chatbotFloatingIcon");
  if (chatIcon) chatIcon.style.display = "flex";
}

function logout() {
  const user = getCurrentUser();
  localStorage.removeItem("petpal_user");
  showToast(`Goodbye, ${user}! You have been logged out.`, "success");

  updateAuthLinks();
  setTimeout(() => (window.location.href = "index.html"), 1500);
}

function showToast(message, type = "info") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.style.background =
    type === "error" ? "#ff6b6b"
    : type === "success" ? "var(--accent)"
    : "var(--primary)";

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function requireLogin(actionName = "perform this action") {
  if (!isLoggedIn()) {
    showToast(`Please login to ${actionName}`, "error");
    return false;
  }
  return true;
}

// ✅ Auto-update links on page load
document.addEventListener("DOMContentLoaded", updateAuthLinks);
