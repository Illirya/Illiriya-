let mode = "calm";
let history = [];
let lastInteraction = Date.now();

const input = document.getElementById("input");
const chat = document.getElementById("chat");
const app = document.getElementById("app");
const modeIndicator = document.getElementById("modeIndicator");

/* =========================
   LOAD MEMORY
========================= */
window.onload = () => {
  const saved = localStorage.getItem("history");
  if (saved) {
    history = JSON.parse(saved);
    history.forEach(renderMessage);
  }
};

/* =========================
   EMOTION DETECTION
========================= */
input.addEventListener("input", () => {
  lastInteraction = Date.now();

  const len = input.value.length;
  if (len > 80) setMode("intense");
  else if (len > 30) setMode("focused");
  else setMode("calm");
});

/* =========================
   MODE SYSTEM
========================= */
function setMode(m) {
  mode = m;
  app.className = m;
  modeIndicator.innerText = "Mode: " + m;
}

/* =========================
   SEND MESSAGE
========================= */
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

/* =========================
   ADD MESSAGE
========================= */
function addMessage(msg) {
  history.push(msg);
  renderMessage(msg);
  saveMemory();
}

/* =========================
   RENDER
========================= */
function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.role}`;
  div.innerText = msg.text;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* =========================
   MEMORY
========================= */
function saveMemory() {
  localStorage.setItem("history", JSON.stringify(history));
}

/* =========================
   AI SYSTEM
========================= */
async function generateAIResponse(input) {

  // OPTIONAL REAL AI (insert key if you want)
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

  // FALLBACK AI (SMARTER)
  if (mode === "intense") return "You're pushing hard. Focus your energy.";
  if (mode === "focused") return "You're getting sharper. Continue.";
  return "I'm here with you.";
}

/* =========================
   VOICE INPUT
========================= */
function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    sendMessage();
  };

  recognition.start();
}

/* =========================
   VOICE OUTPUT
========================= */
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 0.8;
  speechSynthesis.speak(utter);
}

/* =========================
   PRESENCE ENGINE (AUTO)
========================= */
setInterval(() => {
  const idleTime = Date.now() - lastInteraction;

  if (idleTime > 15000) {
    const msg = {
      role: "ai",
      text: getPresenceMessage()
    };

    addMessage(msg);
    speak(msg.text);

    lastInteraction = Date.now();
  }
}, 5000);

function getPresenceMessage() {
  const messages = [
    "You paused. I'm still here.",
    "Thinking?",
    "There's something you're looking for.",
    "Continue when you're ready."
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
