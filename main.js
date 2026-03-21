let mode = "calm";
let history = [];
let lastInteraction = Date.now();
let lastPresenceMessage = "";

/* DOM */
const input = document.getElementById("input");
const chat = document.getElementById("chat");
const app = document.getElementById("app");
const modeIndicator = document.getElementById("modeIndicator");

/* CANVAS */
const canvas = document.getElementById("avatarCanvas");
const ctx = canvas.getContext("2d");

/* Resize */
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =========================
   AVATAR STATE
========================= */
let eyeX = 0;
let eyeY = 0;
let blink = 0;

/* Track movement */
window.addEventListener("mousemove", (e) => {
  eyeX = (e.clientX / window.innerWidth - 0.5) * 20;
  eyeY = (e.clientY / window.innerHeight - 0.5) * 20;
});

window.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  eyeX = (t.clientX / window.innerWidth - 0.5) * 20;
  eyeY = (t.clientY / window.innerHeight - 0.5) * 20;
});

/* =========================
   DRAW AVATAR
========================= */
function drawAvatar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  /* Glow reacts to mode */
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 140);
  if (mode === "intense") {
    glow.addColorStop(0, "rgba(255,50,50,0.3)");
  } else if (mode === "focused") {
    glow.addColorStop(0, "rgba(50,150,255,0.3)");
  } else {
    glow.addColorStop(0, "rgba(255,255,255,0.2)");
  }
  glow.addColorStop(1, "transparent");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Head */
  ctx.beginPath();
  ctx.arc(cx, cy, 45, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* Eyes */
  drawEye(cx - 18, cy - 8);
  drawEye(cx + 18, cy - 8);

  /* Mouth */
  ctx.beginPath();

  if (mode === "intense") {
    ctx.moveTo(cx - 12, cy + 18);
    ctx.lineTo(cx + 12, cy + 18);
  } else if (mode === "focused") {
    ctx.arc(cx, cy + 14, 10, 0, Math.PI * 0.8);
  } else {
    ctx.arc(cx, cy + 12, 12, 0, Math.PI);
  }

  ctx.stroke();
}

function drawEye(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + eyeX * 0.1, y + eyeY * 0.1, 3, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
}

/* Animate */
function animate() {
  drawAvatar();
  requestAnimationFrame(animate);
}
animate();

/* =========================
   MEMORY LOAD
========================= */
window.onload = () => {
  const saved = localStorage.getItem("history");
  if (saved) {
    history = JSON.parse(saved);
    history.forEach(renderMessage);
  }
};

/* ENTER SEND */
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

  const aiText = await generateAIResponse(text);
  addMessage({ role: "ai", text: aiText });

  speak(aiText);
}

/* ADD MESSAGE */
function addMessage(msg) {
  history.push(msg);
  renderMessage(msg);
  localStorage.setItem("history", JSON.stringify(history));
}

/* RENDER */
function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.role}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  let i = 0;
  function type() {
    if (i < msg.text.length) {
      div.innerText += msg.text[i++];
      setTimeout(type, 10);
    }
  }
  type();
}

/* =========================
   PERSONALITY AI
========================= */
async function generateAIResponse(userInput) {

  const lastUser = [...history].reverse().find(m => m.role === "user");

  if (mode === "intense") {
    return "Stop overthinking. You already know what matters.";
  }

  if (mode === "focused") {
    return "You're close. Stay precise.";
  }

  if (userInput.includes("?")) {
    return "You feel the answer already, don't you?";
  }

  if (lastUser && lastUser.text.length < 10) {
    return "Say more. I want to understand.";
  }

  return "I'm here with you. Keep going.";
}

/* =========================
   VOICE (PERSONALITY)
========================= */
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);

  if (mode === "intense") {
    utter.rate = 0.95;
    utter.pitch = 0.7;
  } else if (mode === "focused") {
    utter.rate = 0.9;
    utter.pitch = 0.85;
  } else {
    utter.rate = 0.85;
    utter.pitch = 1;
  }

  speechSynthesis.speak(utter);
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

/* =========================
   PRESENCE (SMART)
========================= */
setInterval(() => {
  const idle = Date.now() - lastInteraction;

  if (idle > 25000) {
    const msg = getPresenceMessage();
    if (msg === lastPresenceMessage) return;

    addMessage({ role: "ai", text: msg });
    speak(msg);

    lastPresenceMessage = msg;
    lastInteraction = Date.now();
  }
}, 6000);

function getPresenceMessage() {

  if (history.length === 0) return "You came here for something.";

  const lastUser = [...history].reverse().find(m => m.role === "user");

  if (!lastUser) return "I'm still here with you.";

  if (lastUser.text.length < 10) return "Don't hold back.";

  if (lastUser.text.includes("?")) return "You already feel it.";

  return "Stay in that thought.";
}
