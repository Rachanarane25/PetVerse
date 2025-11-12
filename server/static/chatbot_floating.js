// ------------------------------------------------------
// ✅ PetVerse Floating Chatbot (Multilingual + Emojis)
// ------------------------------------------------------
let selectedLang = null;

const chatIcon = document.getElementById("chatbotFloatingIcon");
const panel = document.getElementById("chatbotPanel");
const chatMessages = document.getElementById("chatMessagesAI");
const chatInput = document.getElementById("chatInputAI");
const sendBtn = document.getElementById("sendChatBtnAI");

// ✅ Backend URL
const API_URL = "http://127.0.0.1:5000/api/chat";

// ✅ Toast Function (GLOBAL)
function showToast(message) {
    let t = document.getElementById("toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        t.className = "toast";
        document.body.appendChild(t);
    }

    t.innerText = message;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2500);
}

// ✅ Show chat icon only if logged in
document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("petpal_user");
    if (user) chatIcon.style.display = "flex";
});

// ✅ OPEN CHATBOT
chatIcon.onclick = () => {
    const user = localStorage.getItem("petpal_user");

    if (!user) {
        showToast("Please login to use the AI Chatbot 😊");
        return; // ❌ DO NOT OPEN PANEL
    }

    panel.style.display = "flex";
    chatMessages.innerHTML = "";

    selectedLang = null;

    appendBot(
        "🐾 **PetVerse AI Assistant**\n\n" +
        "Choose your language:\n" +
        "🇬🇧 EN\n🇮🇳 HI\n🇮🇳 MR\n🇮🇳 KN\n\n" +
        "👉 Type one option to continue."
    );
};

// ✅ Append Messages
function appendUser(text) {
    let div = document.createElement("div");
    div.className = "chatBubble userBubble";
    div.innerText = "🙂 " + text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendBot(text) {
    let div = document.createElement("div");
    div.className = "chatBubble botBubble";
    div.innerText = "🤖 " + text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ✅ Detect Enter
sendBtn.onclick = () => sendMessage();
chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

// ✅ Chat Logic
function sendMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    appendUser(msg);
    chatInput.value = "";

    // ✅ Step 1: Language selection
    if (!selectedLang) {
        const choice = msg.toLowerCase();

        if (["en", "hi", "mr", "kn"].includes(choice)) {
            selectedLang = choice;
            appendBot("✅ Language set! Ask me anything 🐶💜");
            return;
        }

        appendBot("❗ Please type EN / HI / MR / KN to select language.");
        return;
    }

    // ✅ Step 2: Send to backend
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: msg,
            lang: selectedLang
        })
    })
        .then(res => res.json())
        .then(data => appendBot(data.reply || "⚠ No reply"))
        .catch(() => appendBot("❌ Server error"));
}
