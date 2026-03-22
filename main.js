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
let phase = "explore"; // explore → build → collapse → reveal

let destination = "";
let message = "";

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
    destination = "ICELAND";
    message = "You seek stillness";
  } else if (userState.restless > userState.calm) {
    destination = "TOKYO";
    message = "You crave intensity";
  } else {
    destination = "PERU";
    message = "You are searching";
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

  /* Particles */
  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5 / p.depth, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  /* REVEAL */
  if (phase === "reveal") {

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = "white";
    ctx.font = "bold 50px Arial";
    ctx.fillText(destination, canvas.width / 2, canvas.height / 2);

    ctx.font = "18px Arial";
    ctx.fillText("Tap to enter", canvas.width / 2, canvas.height / 2 + 50);
  }
}

/* CLICK TO CONTINUE */
window.addEventListener("click", () => {
  if (phase === "reveal") {
    alert("Now you go to the real journey page (next step)");
  }
});

/* LOOP */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
