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
   CORE STATE
========================= */
let particles = [];
let center = { x: canvas.width / 2, y: canvas.height / 2 };

let cursor = { x: center.x, y: center.y };
let lastCursor = { x: center.x, y: center.y };

let velocity = { x: 0, y: 0 };

/* USER STATE */
let userState = {
  calm: 0,
  restless: 0,
  curious: 0
};

/* Create particles */
for (let i = 0; i < 200; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: 0,
    vy: 0,
    depth: Math.random() * 3 + 1
  });
}

/* =========================
   INPUT
========================= */
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

  /* Calm */
  if (speed < 1) userState.calm += 0.01;

  /* Restless */
  if (speed > 6) userState.restless += 0.02;

  /* Curious (direction changes) */
  let change = Math.abs(velocity.x) + Math.abs(velocity.y);
  if (change > 10) userState.curious += 0.015;

  /* Normalize */
  userState.calm *= 0.995;
  userState.restless *= 0.995;
  userState.curious *= 0.995;

  lastCursor.x = cursor.x;
  lastCursor.y = cursor.y;
}

/* =========================
   UPDATE FIELD
========================= */
function update() {

  detectIntent();

  center.x += (cursor.x - center.x) * 0.05;
  center.y += (cursor.y - center.y) * 0.05;

  for (let p of particles) {

    let dx = center.x - p.x;
    let dy = center.y - p.y;

    /* Behavior changes based on user */
    if (userState.calm > userState.restless) {
      p.vx += dx * 0.0004;
      p.vy += dy * 0.0004;
    } else {
      p.vx -= dx * 0.0006;
      p.vy -= dy * 0.0006;
    }

    if (userState.curious > 0.5) {
      p.vx += (Math.random() - 0.5) * 0.3;
      p.vy += (Math.random() - 0.5) * 0.3;
    }

    p.vx *= 0.95;
    p.vy *= 0.95;

    p.x += p.vx / p.depth;
    p.y += p.vy / p.depth;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
  }
}

/* =========================
   DRAW
========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let intensity = userState.calm + userState.restless + userState.curious;

  const glow = ctx.createRadialGradient(
    center.x, center.y, 0,
    center.x, center.y, 250
  );

  glow.addColorStop(0, `rgba(255,255,255,${0.2 + intensity})`);
  glow.addColorStop(1, "transparent");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5 / p.depth, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

/* LOOP */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
