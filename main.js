const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

/* Resize */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* =========================
   STATE
========================= */
let particles = [];
let center = { x: canvas.width / 2, y: canvas.height / 2 };

let cursor = { x: center.x, y: center.y };
let lastCursor = { x: center.x, y: center.y };

let userState = { calm: 0, restless: 0, curious: 0 };

let startTime = Date.now();
let phase = "expl
/* PARTICLES */
for (let i = 0; i < 200; i++) {
  particles.push({
    x: Math.random() * canvas.wi
const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

/* Resize */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* =========================
   STATE
========================= */
let particles = [];
let center = { x: canvas.width / 2, y: canvas.height / 2 };

let cursor = { x: center.x, y: center.y };
let lastCursor = { x: center.x, y: center.y };

let userState = { calm: 0, restless: 0, curious: 0 };

let startTime = Date.now();
let phase = "explore";

let message = "";
let destination = "NICARAGUA";

let revealAlpha = 0;

/* PARTICLES */
for (let i = 0; i < 250; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: 0,
    vy: 0,
    depth: Math.random() * 3 + 1,
    size: Math.random() * 2 + 0.5
  });
}

/* INPUT */
window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});

/* =========================
   INTENT
========================= */
function detectIntent() {
  let dx = cursor.x - lastCursor.x;
  let dy = cursor.y - lastCursor.y;

  let speed = Math.sqrt(dx * dx + dy * dy);

  if (speed < 1) userState.calm += 0.01;
  if (speed > 6) userState.restless += 0.02;
  if (Math.abs(dx) + Math.abs(dy) > 10) userState.curious += 0.015;

  userState.calm *= 0.995;
  userState.restless *= 0.995;
  userState.curious *= 0.995;

  lastCursor.x = cursor.x;
  lastCursor.y = cursor.y;
}

/* =========================
   DECISION
========================= */
function decide() {
  if (userState.calm > userState.restless) {
    message = "You move differently.";
  } else if (userState.restless > userState.calm) {
    message = "You are not here for the ordinary.";
  } else {
    message = "You noticed.";
  }
}

/* =========================
   UPDATE
========================= */
function update() {
  detectIntent();

  let elapsed = (Date.now() - startTime) / 1000;

  if (elapsed > 8 && phase === "explore") phase = "build";

  if (elapsed > 11 && phase === "build") {
    phase = "collapse";
    decide();
  }

  if (elapsed > 13 && phase === "collapse") phase = "reveal";

  /* Smooth follow */
  center.x += (cursor.x - center.x) * 0.04;
  center.y += (cursor.y - center.y) * 0.04;

  for (let p of particles) {
    let dx = center.x - p.x;
    let dy = center.y - p.y;

    if (phase === "explore") {
      p.vx += dx * 0.0003;
      p.vy += dy * 0.0003;
    }

    if (phase === "build") {
      p.vx += dx * 0.0008;
      p.vy += dy * 0.0008;
    }

    if (phase === "collapse") {
      p.vx += dx * 0.015;
      p.vy += dy * 0.015;
    }

    p.vx *= 0.96;
    p.vy *= 0.96;

    p.x += p.vx / p.depth;
    p.y += p.vy / p.depth;
  }

  /* Reveal fade */
  if (phase === "reveal") {
    revealAlpha += 0.01;
    if (revealAlpha > 1) revealAlpha = 1;
  }
}

/* =========================
   DRAW
========================= */
function draw() {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Glow */
  const glow = ctx.createRadialGradient(
    center.x, center.y, 0,
    center.x, center.y, 300
  );
  glow.addColorStop(0, "rgba(255,255,255,0.08)");
  glow.addColorStop(1, "transparent");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Particles */
  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size / p.depth, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fill();
  }

  /* Core pulse */
  let pulse = Math.sin(Date.now() * 0.002) * 2 + 6;

  ctx.beginPath();
  ctx.arc(center.x, center.y, pulse, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  /* TEXT REVEAL */
  if (phase === "reveal") {

    ctx.globalAlpha = revealAlpha;

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.fillText(destination, canvas.width / 2, canvas.height / 2);

    ctx.font = "14px Arial";
    ctx.fillText("Enter", canvas.width / 2, canvas.height / 2 + 60);

    ctx.globalAlpha = 1;
  }
}

/* CLICK → LUXURY ACCESS SCREEN */
window.addEventListener("click", () => {
  if (phase === "reveal") {

    document.body.innerHTML = `
    <div style="
      background:black;
      color:white;
      height:100vh;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      text-align:center;
      padding:40px;
      font-family:Arial;
    ">
      <p style="opacity:0.5;">Private access only</p>
      <br/>

      <p>Residences beyond public reach.</p>
      <p>Volcano views. Coastal isolation.</p>

      <br/><br/>

      <p style="opacity:0.6;">Access is limited.</p>

      <br/><br/>

      <button onclick="enterRequest()" style="
        padding:14px 28px;
        background:white;
        color:black;
        border:none;
        font-size:14px;
        cursor:pointer;
      ">
        Request Entry
      </button>
    </div>
    `;
  }
});

/* ENTRY ACTION */
function enterRequest() {
  document.body.innerHTML = `
  <div style="
    background:black;
    color:white;
    height:100vh;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    padding:40px;
    font-family:Arial;
  ">
    <p style="opacity:0.5;">Access is not automatic</p>
    <br/>

    <textarea id="move" placeholder="How do you move?" style="
      width:300px;
      margin-bottom:15px;
      background:black;
      color:white;
      border:1px solid white;
      padding:10px;
    "></textarea>

    <input id="location" placeholder="Where are you based?" style="
      width:300px;
      margin-bottom:15px;
      background:black;
      color:white;
      border:1px solid white;
      padding:10px;
    "/>

    <textarea id="seek" placeholder="What are you seeking?" style="
      width:300px;
      margin-bottom:20px;
      background:black;
      color:white;
      border:1px solid white;
      padding:10px;
    "></textarea>

    <button onclick="sendRequest()" style="
      padding:12px 25px;
      background:white;
      color:black;
      border:none;
      cursor:pointer;
    ">
      Continue
    </button>
  </div>
  `;
}

/* SEND */
function sendRequest() {
  const move = document.getElementById("move").value;
  const location = document.getElementById("location").value;
  const seek = document.getElementById("seek").value;

  const message = `Private Access Request:

How they move:
${move}

Location:
${location}

Seeking:
${seek}`;

  const phone = "505XXXXXXXX";

  window.location.href =
    "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
}

/* LOOP */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
