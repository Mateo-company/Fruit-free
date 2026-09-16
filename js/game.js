/* Fruit Free — motor de juego */
const spriteGood = new Image();
spriteGood.src = "assets/sprites/Manzana.png";
const spriteBad = new Image();
spriteBad.src = "assets/sprites/ManzanaMala.png";
const goodSprites = [spriteGood];
for (const name of ["Naranja.png", "Kiwi.png", "cherry.png"]) {
  const sprite = new Image();
  sprite.src = `assets/sprites/${name}`;
  goodSprites.push(sprite);
}
const spriteBasket = new Image();
spriteBasket.src = "assets/sprites/Canasta.png";

const VIRTUAL_WIDTH = 320, VIRTUAL_HEIGHT = 240, COLUMNS = 8;
const player = { width: 56, height: 28, x: 132, y: 198, speed: 420, vx: 0 };
const keys = { left: false, right: false };
let gameCanvas, gameCtx, lastTimestamp = 0, animationId = 0;
let fruits = [], particles = [], spawnTimer = 0, elapsedTime = 0;
let score = 0, lives = 3, gamePaused = false, gameOver = false, combo = 0;

const pauseBtn = document.getElementById("pauseBtn"), pauseOverlay = document.getElementById("pauseOverlay");
const resumeBtn = document.getElementById("resumeBtn"), menuBtn = document.getElementById("menuBtn");
const gameOverOverlay = document.getElementById("gameOverOverlay"), finalScoreText = document.getElementById("finalScore");
const finalRecordText = document.getElementById("finalRecord");
const retryBtn = document.getElementById("retryBtn"), backMenuBtn = document.getElementById("backMenuBtn");
const scoreText = document.getElementById("score"), livesText = document.getElementById("lives");

function recordKey() { return "fruitFree_record"; }
function getRecord() { return Number(localStorage.getItem(recordKey())) || 0; }
function saveRecord() { if (score > getRecord()) localStorage.setItem(recordKey(), score); }
function resetGame() {
  score = 0; lives = 3; combo = 0; fruits = []; particles = []; spawnTimer = 0; elapsedTime = 0;
  gameOver = false; gamePaused = false; keys.left = false; keys.right = false; player.x = (VIRTUAL_WIDTH - player.width) / 2;
  scoreText.textContent = score; livesText.textContent = "❤❤❤";
}
function initGame() {
  cancelAnimationFrame(animationId); gameCanvas = document.getElementById("gameCanvas"); gameCtx = gameCanvas.getContext("2d");
  resizeCanvas(); resetGame(); lastTimestamp = performance.now(); animationId = requestAnimationFrame(gameLoop);
}
function resizeCanvas() {
  if (!gameCanvas) return;
  const scene = document.getElementById("gameScene"), ratio = window.devicePixelRatio || 1;
  gameCanvas.width = scene.clientWidth * ratio; gameCanvas.height = scene.clientHeight * ratio;
  // En móvil la canasta queda por encima de los controles táctiles.
  player.y = window.matchMedia("(max-width: 699px)").matches ? 166 : 194;
}
function spawnFruit() {
  const goodChance = .46;
  const speed = Math.min(95 + Math.floor(elapsedTime / 15) * 14 + Math.random() * 35, 310);
  const good = Math.random() < goodChance;
  // El dibujo es grande, pero el radio de colisión se mantiene pequeño y justo.
  const size = 48 + Math.random() * 8;
  fruits.push({
    x: (Math.floor(Math.random() * COLUMNS) + .5) * (VIRTUAL_WIDTH / COLUMNS),
    y: -size, r: 9, size, speed, good,
    sprite: good ? goodSprites[Math.floor(Math.random() * goodSprites.length)] : spriteBad
  });
}
function burst(x, y, color) { for (let i = 0; i < 8; i++) particles.push({ x, y, vx: (Math.random() - .5) * 75, vy: (Math.random() - .5) * 75, life: .45, color }); }
function loseLife() { lives--; combo = 0; if (lives <= 0) triggerGameOver(); }
function triggerGameOver() {
  gameOver = true; gamePaused = true; saveRecord(); finalScoreText.textContent = score; finalRecordText.textContent = getRecord();
  gameOverOverlay.classList.remove("hidden");
}
function update(dt) {
  elapsedTime += dt; player.vx = keys.left ? -player.speed : keys.right ? player.speed : 0;
  player.x = Math.max(0, Math.min(VIRTUAL_WIDTH - player.width, player.x + player.vx * dt));
  spawnTimer += dt;
  const interval = Math.max(.3, 1.02 - elapsedTime / 150);
  if (spawnTimer >= interval) { spawnFruit(); spawnTimer = 0; }
  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i]; f.y += f.speed * dt;
    const caught =
      f.x > player.x + 18 &&
      f.x < player.x + player.width - 18 &&
      f.y + f.r > player.y + 8 &&
      f.y - f.r < player.y + player.height - 4;
    if (caught) { if (f.good) { combo++; score += combo >= 5 ? 2 : 1; burst(f.x, f.y, "#9dff3e"); } else { loseLife(); burst(f.x, f.y, "#ff4b5c"); } fruits.splice(i, 1); continue; }
    if (f.y - f.r > VIRTUAL_HEIGHT) { if (f.good) { combo = 0; score = Math.max(0, score - 1); } fruits.splice(i, 1); }
  }
  particles = particles.filter(p => (p.life -= dt) > 0); for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; }
  scoreText.textContent = score; livesText.textContent = "❤".repeat(Math.max(0, lives));
}
function draw() {
  const width = gameCanvas.width, height = gameCanvas.height, scale = Math.min(width / VIRTUAL_WIDTH, height / VIRTUAL_HEIGHT);
  const ox = (width - VIRTUAL_WIDTH * scale) / 2, oy = (height - VIRTUAL_HEIGHT * scale) / 2;
  gameCtx.setTransform(1, 0, 0, 1, 0, 0); gameCtx.clearRect(0, 0, width, height); gameCtx.setTransform(scale, 0, 0, scale, ox, oy);
  const sky = gameCtx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT); sky.addColorStop(0, "#59c8ff"); sky.addColorStop(1, "#0876c9"); gameCtx.fillStyle = sky; gameCtx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  gameCtx.fillStyle = "rgba(255,255,255,.2)"; for (let x = 20; x < VIRTUAL_WIDTH; x += 75) { gameCtx.beginPath(); gameCtx.arc(x, 35 + x % 50, 13, 0, Math.PI * 2); gameCtx.fill(); }
  for (const f of fruits) {
    const image = f.sprite;
    if (image.complete && image.naturalWidth) gameCtx.drawImage(image, f.x - f.size / 2, f.y - f.size / 2, f.size, f.size);
    else { gameCtx.fillStyle = f.good ? "#e83f49" : "#4b354b"; gameCtx.beginPath(); gameCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2); gameCtx.fill(); }
  }
  if (spriteBasket.complete && spriteBasket.naturalWidth) gameCtx.drawImage(spriteBasket, player.x, player.y, player.width, player.height); else { gameCtx.fillStyle = "#b96a24"; gameCtx.fillRect(player.x, player.y, player.width, player.height); }
  for (const p of particles) { gameCtx.globalAlpha = p.life * 2; gameCtx.fillStyle = p.color; gameCtx.fillRect(p.x - 2, p.y - 2, 4, 4); } gameCtx.globalAlpha = 1;
  if (combo >= 5) { gameCtx.fillStyle = "#fff"; gameCtx.font = "bold 12px monospace"; gameCtx.textAlign = "center"; gameCtx.fillText(`¡RACHA x${combo}!`, 160, 28); }
}
function gameLoop(ts) { if (gamePaused) return; const dt = Math.min(.05, (ts - lastTimestamp) / 1000); lastTimestamp = ts; update(dt); draw(); animationId = requestAnimationFrame(gameLoop); }
function resumeGame() { if (gameOver) return; gamePaused = false; pauseOverlay.classList.add("hidden"); lastTimestamp = performance.now(); animationId = requestAnimationFrame(gameLoop); }
pauseBtn.onclick = () => { if (!gameOver) { gamePaused = true; pauseOverlay.classList.remove("hidden"); } };
resumeBtn.onclick = resumeGame;
menuBtn.onclick = () => { pauseOverlay.classList.add("hidden"); cancelAnimationFrame(animationId); showMainMenu(); };
retryBtn.onclick = () => { gameOverOverlay.classList.add("hidden"); initGame(); };
backMenuBtn.onclick = () => { gameOverOverlay.classList.add("hidden"); cancelAnimationFrame(animationId); showMainMenu(); };
window.addEventListener("keydown", e => { if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D", " "].includes(e.key)) e.preventDefault(); if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = true; if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = true; if (e.key === " " && !gameOver) gamePaused ? resumeGame() : pauseBtn.click(); });
window.addEventListener("keyup", e => { if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = false; if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = false; });
window.addEventListener("blur", () => { if (!gameOver && !document.getElementById("gameScene").classList.contains("hidden")) pauseBtn.click(); });
window.addEventListener("resize", resizeCanvas);
