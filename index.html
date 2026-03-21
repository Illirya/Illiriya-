let mode = "calm";
let history = [];
let lastInteraction = Date.now();
let lastPresenceMessage = "";

const input = document.getElementById("input");
const chat = document.getElementById("chat");
const app = document.getElementById("app");
const modeIndicator = document.getElementById("modeIndicator");

/* LOAD MEMORY */
window.onload = () => {
  const saved = localStorage.getItem("history");
  if (saved) {
    history = JSON.parse(saved);
    history.forEach(renderMessage);
  }
};

/* ENTER TO SEND */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

/* EMOTION DETECTION */
input.addEventListener("input", () => {
  lastInteraction = Date.now();

  const len = input.value.length;
  if (len > 80) setMode("intense");
  else if (len > 30) setMode("focused");
  else setMode("calm");
});

/* MODE */
function setMode(m) {
  mode = m;
  app.className = m;
  modeIndicator.innerText = "Mode: " + m;
}

/* SEND */
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  lastInteraction = Date.now();

  const userMsg = { role: "user", text };
  addMessage(userMsg);

  input.value = "";

  const aiText = await generateAIResponse(text);
  const aiMsg = { role: "ai", text: aiText };

  addMessage(aiMsg);
  speak(aiText);
}

/* ADD MESSAGE */
function addMessage(msg) {
  history.push(msg);
  renderMessage(msg);
  saveMemory();
}

/* RENDER WITH TYPING */
function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.role}`;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  typeText(div, msg.text);
}

function typeText(el, text) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      el.innerText += text[i];
      i++;
      setTimeout(typing, 12);
    }
  }
  typing();
}

/* MEMORY */
function saveMemory() {
  localStorage.setItem("history", JSON.stringify(history));
}

/* AI */
async function generateAIResponse(input) {

  const API_KEY = "";

  if (API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: history.slice(-10)
      })
    });

    const data = await res.json();
    return data.choices[0].message.content;
  }

  // Smart fallback
  if (mode === "intense") return "You're pushing hard. Focus it.";
  if (mode === "focused") return "You're getting closer.";
  return "I'm here with you.";
}

/* VOICE INPUT */
function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onresult = (e) => {
    input.value = e.results[0][0].transcript;
    sendMessage();
  };

  recognition.start();
}

/* VOICE OUTPUT */
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 0.8;
  speechSynthesis.speak(utter);
}

/* PRESENCE ENGINE (FIXED + SMART) */
setInterval(() => {
  const idle = Date.now() - lastInteraction;

  if (idle > 20000) {
    const msgText = getPresenceMessage();

    if (msgText === lastPresenceMessage) return;

    const msg = { role: "ai", text: msgText };

    addMessage(msg);
    speak(msg.text);

    lastPresenceMessage = msgText;
    lastInteraction = Date.now();
  }
}, 5000);

/* SMART PRESENCE */
function getPresenceMessage() {

  if (history.length === 0) return "You're here for a reason.";

  const lastUser = [...history].reverse().find(m => m.role === "user");

  if (!lastUser) return "I'm listening.";

  if (lastUser.text.length < 10) return "Go deeper.";

  if (lastUser.text.includes("?")) return "You already sense the answer.";

  return "Stay with that thought.";
}
