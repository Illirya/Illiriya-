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

/* Resize canvas */
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =========================
   AI FACE STATE
========================= */
let eyeX = 0;
let eyeY = 0;

/* TRACK MOUSE / TOUCH */
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

  /* Glow */
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120);
  glow.addColorStop(0, "rgba(255,255,255,0.2)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Head */
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.stroke();

  /* Eyes */
  drawEye(cx - 15, cy - 5);
  drawEye(cx + 15, cy - 5);

  /* Mouth based on mode */
  ctx.beginPath();
  if (mode === "intense") {
    ctx.moveTo(cx - 10, cy + 15);
    ctx.lineTo(cx + 10, cy + 15);
  } else {
    ctx.arc(cx, cy + 10, 10, 0, Math.PI);
  }
  ctx.stroke();
}

function drawEye(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + eyeX * 0.1, y + eyeY * 0.1, 2, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
}

/* LOOP */
function animate() {
  drawAvatar();
  requestAnimationFrame(animate);
}
animate();

/* =========================
   ORIGINAL SYSTEM (same as before)
========================= */

window.onload = () => {
  const saved = localStorage.getItem("history");
  if (saved) {
    history = JSON.parse(saved);
    history.forEach(renderMessage);
  }
};

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

input.addEventListener("input", () => {
  lastInteraction = Date.now();

  const len = input.value.length;
  if (len > 80) setMode("intense");
  else if (len > 30) setMode("focused");
  else setMode("calm");
});

function setMode(m) {
  mode = m;
  app.className = m;
  modeIndicator.innerText = "Mode: " + m;
}

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

function addMessage(msg) {
  history.push(msg);
  renderMessage(msg);
  localStorage.setItem("history", JSON.stringify(history));
}

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

async function generateAIResponse(input) {
  if (mode === "intense") return "I feel your intensity.";
  if (mode === "focused") return "You're getting closer.";
  return "I'm here with you.";
}

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(u);
}

/* Presence */
setInterval(() => {
  const idle = Date.now() - lastInteraction;

  if (idle > 20000) {
    const msg = "I'm still here.";
    if (msg === lastPresenceMessage) return;

    addMessage({ role: "ai", text: msg });
    speak(msg);

    lastPresenceMessage = msg;
    lastInteraction = Date.now();
  }
}, 5000);
