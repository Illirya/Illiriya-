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

let velocity = { x: 0, y: 0 };

let userState = { calm: 0, restless: 0, curious: 0 };

let startTime = Date.now();
let revealed = false;
let destination = "";

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

window.addEventListener("touchmove", (e) => {
  cursor.x = e.touches[0].clientX;
  cursor.y = e.touches[0].clientY;
});

/* =========================
   INTENT DETECTION
========================= */
function detectIntent() {

  velocity.x = cursor.x - lastCursor.x;
  velocity.y = cursor.y - lastCursor.y;

  let speed = Math.sqrt(velocity.x**2 + velocity.y**2);

  if (speed < 1) userState.calm += 0.01;
  if (speed > 6) userState.restless += 0.02;

  let change = Math.abs(velocity.x) + Math.abs(velocity.y);
  if (change > 10) userState.curious += 0.015;

  userState.calm *= 0.995;
  userState.restless *= 0.995;
  userState.curious *= 0.995;

  lastCursor.x = cursor.x;
  lastCursor.y = cursor.y;
}

/* =========================
   DESTINATION LOGIC
========================= */
function decideDestination() {

  if (userState.calm > userState.restless && userState.calm > userState.curious) {
    return "ICELAND";
  }

  if (userState.restless > userState.calm && userState.restless > userState.curious) {
    return "TOKYO";
  }

  return "PERU";
}

/* =========================
   UPDATE
========================= */
function update() {

  detectIntent();

  let elapsed = (Date.now() - startTime) / 1000;

  if (!revealed && elapsed > 12) {
    revealed = true;
    destination = decideDestination();
  }

  center.x += (cursor.x - center.x) * 0.05;
  center.y += (cursor.y - center.y) * 0.05;

  for (let p of particles) {

    let dx = center.x - p.x;
    let dy = center.y - p.y;

    if (revealed) {
      /* Collapse effect */
      p.vx += dx * 0.01;
      p.vy += dy * 0.01;
    } else {
      p.vx += dx * 0.0004;
      p.vy += dy * 0.0004;
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

  /* DESTINATION REVEAL */
  if (revealed) {
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText(destination, canvas.width / 2, canvas.height / 2);
  }
}

/* LOOP */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
