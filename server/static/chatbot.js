// ------------------------------------------------------
// ✅ PetVerse Floating Chatbot (multilingual + emojis)
// ------------------------------------------------------
let selectedLang = null;

const chatIcon = document.getElementById("chatbotFloatingIcon");
const panel = document.getElementById("chatbotPanel");
const chatMessages = document.getElementById("chatMessagesAI");
const chatInput = document.getElementById("chatInputAI");
const sendBtn = document.getElementById("sendChatBtnAI");

const API_URL = "http://127.0.0.1:5000/api/chat";

// ✅ Only show icon if logged in
document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("petpal_user");
    if (user) chatIcon.style.display = "flex";
});

// ✅ Open chatbot
chatIcon.onclick = () => {
    const user = localStorage.getItem("petpal_user");

    if (!user) {
        alert("Please login to chat with PetVerse AI 😊");
        window.location.href = "login.html";
        return;
    }

    panel.style.display = "flex";
    chatMessages.innerHTML = "";

    selectedLang = null; // reset language every time

    appendBot(
        "🐾 **PetVerse AI Assistant** 🐾\n\n" +
        "Choose your language to start:\n\n" +
        "🇬🇧 **EN** – English\n" +
        "🇮🇳 **HI** – हिन्दी\n" +
        "🇮🇳 **MR** – मराठी\n" +
        "🇮🇳 **KN** – ಕನ್ನಡ\n\n" +
        "👉 *Type your choice.*"
    );
};

// ✅ Send on click or enter
sendBtn.onclick = () => sendMessage();
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

// ✅ Add message bubbles
function appendUser(text) {
    let div = document.createElement("div");
    div.className = "chatBubble userBubble";
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendBot(text) {
    let div = document.createElement("div");
    div.className = "chatBubble botBubble";
    div.innerText = text + randomEmoji();
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ✅ Cute emojis added between answers
function randomEmoji() {
    const emojis = [" 🐶", " 🐾", " 😺", " 💜", " ✨", " 🐰", " 🐦"];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// ✅ Chat logic
function sendMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    appendUser(msg);
    chatInput.value = "";

    // ✅ Step 1 — Select Language
    if (!selectedLang) {
        const choice = msg.toLowerCase();

        if (["en", "hi", "mr", "kn"].includes(choice)) {
            selectedLang = choice;
            appendBot("✅ Language selected! Ask anything about pets 🐶💬");
            return;
        }

        appendBot("❗Please choose a valid language: EN / HI / MR / KN");
        return;
    }

    // ✅ Step 2 — Normal chat
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, lang: selectedLang })
    })
        .then(res => res.json())
        .then(data => appendBot(data.reply))
        .catch(() => appendBot("❌ Server error"));
}
