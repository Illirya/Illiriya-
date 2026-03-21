let mode = "calm";
let history = [];

const input = document.getElementById("input");
const chat = document.getElementById("chat");
const app = document.getElementById("app");
const modeIndicator = document.getElementById("modeIndicator");

// Load memory
window.onload = () => {
  const saved = localStorage.getItem("history");
  if (saved) {
    history = JSON.parse(saved);
    history.forEach(renderMessage);
  }
};

// Detect "emotion"
input.addEventListener("input", () => {
  const length = input.value.length;

  if (length > 80) setMode("intense");
  else if (length > 30) setMode("focused");
  else setMode("calm");
});

function setMode(newMode) {
  mode = newMode;
  app.className = newMode;
  modeIndicator.innerText = "Mode: " + newMode;
}

// Send message
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const userMsg = { role: "user", text };
  history.push(userMsg);
  renderMessage(userMsg);

  input.value = "";

  const aiText = await generateAIResponse(text);
  const aiMsg = { role: "ai", text: aiText };

  history.push(aiMsg);
  renderMessage(aiMsg);

  saveMemory();
}

// Render messages
function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.role}`;
  div.innerText = msg.text;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Save memory
function saveMemory() {
  localStorage.setItem("history", JSON.stringify(history));
}

// Fake AI (replace later with real API)
async function generateAIResponse(input) {
  await delay(500);

  if (mode === "intense") return "I feel your intensity. Focus.";
  if (mode === "focused") return "You're getting closer.";
  return "I'm here. Speak freely.";
}

// Utility delay
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
