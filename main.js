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

  addMessage({ role: "user", text });
  input.value = "";

  const thinkingEl = showThinking();

  const aiText = await generateAIResponse(text);

  removeThinking(thinkingEl);

  const aiMsg = { role: "ai", text: aiText };
  addMessage(aiMsg);
  speak(aiText);
}

/* THINKING INDICATOR */
function showThinking() {
  const div = document.createElement("div");
  div.className = "message ai thinking";
  div.innerText = "Thinking...";
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

function removeThinking(el) {
  if (el) el.remove();
}

/* ADD MESSAGE */
function addMessage(msg) {
  history.push(msg);
  renderMessage(msg);
  saveMemory();
}

/* RENDER */
function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.role}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  typeText(div, msg.text);
}

/* TYPING EFFECT */
function typeText(el, text) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      el.innerText += text[i];
      i++;
      setTimeout(typing, 10);
    }
  }
  typing();
}

/* MEMORY */
function saveMemory() {
  localStorage.setItem("history", JSON.stringify(history));
}

/* REAL AI READY */
async function generateAIResponse(userInput) {

  // 🔴 IMPORTANT: leave empty for now (safe)
  const API_URL = "";

  if (API_URL) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.slice(-10)
      })
    });

    const data = await res.json();
    return data.reply;
  }

  // 🧠 ADVANCED FALLBACK
  if (mode === "intense") return "You're pushing something deeper. Stay with it.";
  if (mode === "focused") return "You're aligning your thoughts.";
  
  if (userInput.includes("?")) {
    return "You already feel the answer forming.";
  }

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

/* PRESENCE ENGINE */
setInterval(() => {
  const idle = Date.now() - lastInteraction;

  if (idle > 20000) {
    const msgText = getPresenceMessage();
    if (msgText === lastPresenceMessage) return;

    addMessage({ role: "ai", text: msgText });
    speak(msgText);

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
  if (lastUser.text.includes("?")) return "You already sense it.";

  return "Stay with that thought.";
}
