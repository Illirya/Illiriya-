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

/* PARTICLES */
for (let i = 0; i < 200; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: 0,
    vy: 0,
    depth: Math.random() * 3 + 1
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

  center.x += (cursor.x - center.x) * 0.05;
  center.y += (cursor.y - center.y) * 0.05;

  for (let p of particles) {

    let dx = center.x - p.x;
    let dy = center.y - p.y;

    if (phase === "explore") {
      p.vx += dx * 0.0004;
      p.vy += dy * 0.0004;
    }

    if (phase === "build") {
      p.vx += dx * 0.001;
      p.vy += dy * 0.001;
    }

    if (phase === "collapse") {
      p.vx += dx * 0.02;
      p.vy += dy * 0.02;
    }

    p.vx *= 0.95;
    p.vy *= 0.95;

    p.x += p.vx / p.depth;
    p.y += p.vy / p.depth;
  }
}

/* =========================
   DRAW
========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5 / p.depth, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  if (phase === "reveal") {

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = "white";
    ctx.font = "bold 50px Arial";
    ctx.fillText(destination, canvas.width / 2, canvas.height / 2);

    ctx.font = "16px Arial";
    ctx.fillText("Enter", canvas.width / 2, canvas.height / 2 + 50);
  }
}

/* CLICK */
window.addEventListener("click", () => {
  if (phase === "reveal") {
    document.body.innerHTML = `
      <div style="
        color:white;
        background:black;
        height:100vh;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        text-align:center;
        padding:40px;
      ">
        <p>Private locations exist beyond public maps.</p>
        <p>Residences. Volcano views. Isolated coastlines.</p>
        <br/>
        <p>Access is limited.</p>
        <br/>
        <button style="
          padding:15px 30px;
          background:white;
          color:black;
          border:none;
          cursor:pointer;
        ">
          Request Entry
        </button>
      </div>
    `;
  }
});

/* LOOP */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
