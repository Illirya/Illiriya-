/* =========================
   CANVAS & UI
========================= */
const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const introText = document.getElementById("introText");
const destinationEl = document.getElementById("destination");
const messageEl = document.getElementById("message");
const enterHint = document.getElementById("enterHint");
const privateContent = document.getElementById("privateContent");
const luxuryMessage = document.getElementById("luxuryMessage");
const requestEntry = document.getElementById("requestEntry");
const avatar = document.getElementById("avatar");

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
let center = { x: canvas.width/2, y: canvas.height/2 };
let cursor = { x:center.x, y:center.y };
let lastCursor = { x:center.x, y:center.y };
let userState = { calm:0, restless:0, curious:0 };
let startTime = Date.now();
let phase = "explore";
let message = "";
let destination = "NICARAGUA";

/* =========================
   PARTICLES
========================= */
const zones = [
  { name:"Volcano", x:canvas.width*0.3, y:canvas.height*0.4, radius:150 },
  { name:"Coast", x:canvas.width*0.7, y:canvas.height*0.6, radius:150 },
  { name:"Hacienda", x:canvas.width*0.5, y:canvas.height*0.8, radius:150 }
];

for(let i=0;i<300;i++){
  particles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    vx:0,
    vy:0,
    depth:Math.random()*3+1,
    color:"white"
  });
}

/* =========================
   CURSOR
========================= */
window.addEventListener("mousemove",(e)=>{
  cursor.x=e.clientX;
  cursor.y=e.clientY;
});

/* =========================
   USER INTENT
========================= */
function detectIntent(){
  let dx = cursor.x - lastCursor.x;
  let dy = cursor.y - lastCursor.y;
  let speed = Math.sqrt(dx*dx + dy*dy);

  if(speed<1) userState.calm+=0.01;
  if(speed>6) userState.restless+=0.02;
  if(Math.abs(dx)+Math.abs(dy)>10) userState.curious+=0.015;

  userState.calm*=0.995;
  userState.restless*=0.995;
  userState.curious*=0.995;

  lastCursor.x=cursor.x;
  lastCursor.y=cursor.y;
}

/* =========================
   DECIDE MESSAGE
========================= */
function decide(){
  if(userState.calm>userState.restless) message="You move differently.";
  else if(userState.restless>userState.calm) message="You are not here for the ordinary.";
  else message="You noticed.";
  messageEl.innerText=message;
}

/* =========================
   UPDATE
========================= */
function update(){
  detectIntent();
  let elapsed=(Date.now()-startTime)/1000;

  if(elapsed>5 && phase==="explore") phase="build";
  if(elapsed>9 && phase==="build") phase="collapse";
  if(elapsed>11 && phase==="collapse"){ phase="reveal"; decide(); showAvatar(); }

  center.x += (cursor.x-center.x)*0.05;
  center.y += (cursor.y-center.y)*0.05;

  for(let p of particles){
    let dx=center.x-p.x;
    let dy=center.y-p.y;
    let factor=0.0004;
    if(phase==="build") factor=0.001;
    if(phase==="collapse") factor=0.02;

    p.vx+=dx*factor;
    p.vy+=dy*factor;
    p.vx*=0.95;
    p.vy*=0.95;

    /* Zone-based particle color reaction */
    for(const zone of zones){
      let dist=Math.hypot(p.x-zone.x,p.y-zone.y);
      if(dist<zone.radius){
        if(userState.calm>userState.restless) p.color="gold";
        else if(userState.restless>userState.calm) p.color="violet";
        else p.color="cyan";
      }
    }

    p.x+=p.vx/p.depth;
    p.y+=p.vy/p.depth;
  }
}

/* =========================
   DRAW
========================= */
function draw(){
  ctx.fillStyle="black";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for(let p of particles){
    ctx.beginPath();
    ctx.arc(p.x,p.y,2/p.depth,0,Math.PI*2);
    ctx.fillStyle=p.color;
    ctx.fill();
  }
}

/* =========================
   AVATAR
========================= */
function showAvatar(){
  avatar.classList.remove("hidden");
  avatar.style.left = (cursor.x + 20) + "px";
  avatar.style.top = (cursor.y + 20) + "px";
}

/* =========================
   CLICK TO ENTER PRIVATE WORLD
========================= */
window.addEventListener("click",()=>{
  if(phase==="reveal"){
    introText.style.display="none";
    privateContent.classList.remove("hidden");
    luxuryMessage.innerText="Residences. Volcano views. Isolated coastlines. Hidden experiences await.";
  }
});

/* =========================
   LOOP
========================= */
function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
