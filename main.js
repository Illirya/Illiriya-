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
   CORE SYSTEM STATE
========================= */
let particles = [];
let center = { x: canvas.width / 2, y: canvas.height / 2 };
let cursor = { x: center.x, y: center.y };
let lastCursor = { x: center.x, y: center.y };
let speed = 0;

/* Create particles */
for (let i = 0; i < 150; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: 0,
    vy: 0
  });
}

/* =========================
   INPUT TRACKING
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
   UPDATE SYSTEM
========================= */
function update() {

  /* Calculate speed */
  let dx = cursor.x - lastCursor.x;
  let dy = cursor.y - lastCursor.y;
  speed = Math.sqrt(dx * dx + dy * dy);

  lastCursor.x = cursor.x;
  lastCursor.y = cursor.y;

  /* Center follows slowly */
  center.x += (cursor.x - center.x) * 0.02;
  center.y += (cursor.y - center.y) * 0.02;

  for (let p of particles) {

    let dx = center.x - p.x;
    let dy = center.y - p.y;
    let dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

    /* Behavior based on speed */
    if (speed < 2) {
      /* Attraction (calm) */
      p.vx += dx * 0.0005;
      p.vy += dy * 0.0005;
    } else {
      /* Repulsion (fast movement) */
      p.vx -= dx * 0.0008;
      p.vy -= dy * 0.0008;
    }

    /* Friction */
    p.vx *= 0.96;
    p.vy *= 0.96;

    p.x += p.vx;
    p.y += p.vy;

    /* Wrap */
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
  }
}

/* =========================
   DRAW SYSTEM
========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Glow center */
  const glow = ctx.createRadialGradient(
    center.x, center.y, 0,
    center.x, center.y, 200
  );

  glow.addColorStop(0, "rgba(255,255,255,0.15)");
  glow.addColorStop(1, "transparent");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Draw particles */
  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  /* Core entity */
  ctx.beginPath();
  ctx.arc(center.x, center.y, 6 + speed * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
}

/* =========================
   LOOP
========================= */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
