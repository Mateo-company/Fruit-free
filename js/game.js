/* Fruit Free — motor de juego */
const spriteGood = new Image();
spriteGood.src = "assets/sprites/Manzana.png";
const spriteBad = new Image();
spriteBad.src = "assets/sprites/ManzanaMala.png";
const spriteFreshApple = new Image();
spriteFreshApple.src = "assets/sprites/Manzana_nueva.png";
const spriteAppleChangeOne = new Image();
spriteAppleChangeOne.src = "assets/sprites/ManzanaCambioUno.png";
const spriteAppleChangeTwo = new Image();
spriteAppleChangeTwo.src = "assets/sprites/ManzanaCambioDos.png";
const HARD_APPLE_SCALE = 3.6;
const goodSprites = [{ image: spriteGood, scale: 1 }];
const hardGoodSprites = [];
for (const [name, scale] of [["Naranja.png", .82], ["Kiwi.png", 1], ["cherry.png", .82]]) {
  const image = new Image();
  image.src = `assets/sprites/${name}`;
  const fruit = { image, scale };
  goodSprites.push(fruit);
  hardGoodSprites.push(fruit);
}
const spriteBasket = new Image();
spriteBasket.src = "assets/sprites/Canasta.png";

const VIRTUAL_WIDTH = 320, COLUMNS = 8;
let virtualHeight = 240;
const player = {
  width: 64, height: 54, x: 128, y: 172, speed: 420, vx: 0,
  // La imagen es grande; esta es la zona real que atrapa fruta.
  hitOffsetX: 13, hitOffsetY: 24, hitWidth: 38, hitHeight: 17
};
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

function recordKey() { return `fruitFree_record_${currentMode}`; }
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
  const portraitMobile = window.matchMedia("(max-width: 699px) and (orientation: portrait)").matches;
  gameCanvas.width = scene.clientWidth * ratio; gameCanvas.height = scene.clientHeight * ratio;
  // El mundo de móvil también es más alto, no solo el rectángulo que lo contiene.
  virtualHeight = portraitMobile ? 426 : 240;
  player.y = portraitMobile ? 300 : 172;
}
function spawnFruit() {
  const hardMode = currentMode === "Dificil";
  const goodChance = .46;
  const speed = Math.min(95 + Math.floor(elapsedTime / 15) * 14 + Math.random() * 35, 310);
  let good = Math.random() < goodChance;
  // El dibujo es grande, pero el radio de colisión se mantiene pequeño y justo.
  const size = 34 + Math.random() * 5;
  let fruitSprite;
  if (hardMode && Math.random() < .05) {
    // Aparición fija del 5%; no cambia durante la partida.
    good = false;
    fruitSprite = { image: spriteAppleChangeOne, scale: HARD_APPLE_SCALE };
  } else if (good) {
    fruitSprite = hardMode
      ? [...hardGoodSprites, { image: spriteFreshApple, scale: HARD_APPLE_SCALE }][Math.floor(Math.random() * 4)]
      : goodSprites[Math.floor(Math.random() * goodSprites.length)];
  } else {
    // En difícil, CambioDos reemplaza por completo a ManzanaMala.
    fruitSprite = hardMode
      ? { image: spriteAppleChangeTwo, scale: HARD_APPLE_SCALE }
      : { image: spriteBad, scale: 1 };
  }
  const spoilChance = .20;
  const isFreshApple = hardMode && fruitSprite.image === spriteFreshApple;
  const isChangeOne = hardMode && fruitSprite.image === spriteAppleChangeOne;
  const transition = isFreshApple && Math.random() < spoilChance ? "newToOne" : isChangeOne && Math.random() < spoilChance ? "oneToTwo" : "none";
  fruits.push({
    x: (Math.floor(Math.random() * COLUMNS) + .5) * (VIRTUAL_WIDTH / COLUMNS),
    y: -size, r: 9, size, speed, good,
    sprite: fruitSprite.image, drawSize: size * fruitSprite.scale,
    // Ruta decidida al nacer: CambioDos nunca puede regresar a CambioUno.
    transition, spoilStage: isChangeOne ? "changeOne" : isFreshApple ? "fresh" : "final"
  });
}
function burst(x, y, color) { for (let i = 0; i < 8; i++) particles.push({ x, y, vx: (Math.random() - .5) * 75, vy: (Math.random() - .5) * 75, life: .45, color }); }
function loseLife() { lives--; combo = 0; if (lives <= 0) triggerGameOver(); }
function triggerGameOver() {
  gameOver = true; gamePaused = true; saveRecord(); awardCoins(Math.floor(score / 5)); finalScoreText.textContent = score; finalRecordText.textContent = getRecord();
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
    if (f.transition === "newToOne") {
      const journey = Math.min(1, Math.max(0, f.y / player.y));
      // Solo dos fases: nueva y CambioUno. El cambio sucede con anticipación.
      if (journey >= .48 && f.spoilStage === "fresh") {
        f.sprite = spriteAppleChangeOne;
        f.drawSize = f.size * HARD_APPLE_SCALE;
        f.good = false;
        f.spoilStage = "changeOne";
      }
    }
    if (f.transition === "oneToTwo" && f.spoilStage === "changeOne") {
      const journey = Math.min(1, Math.max(0, f.y / player.y));
      if (journey >= .48) {
        f.sprite = spriteAppleChangeTwo;
        f.drawSize = f.size * HARD_APPLE_SCALE;
        f.good = false;
        f.spoilStage = "final";
      }
    }
    const caught =
      f.x + f.r > player.x + player.hitOffsetX &&
      f.x - f.r < player.x + player.hitOffsetX + player.hitWidth &&
      f.y + f.r > player.y + player.hitOffsetY &&
      f.y - f.r < player.y + player.hitOffsetY + player.hitHeight;
    if (caught) { if (f.good) { combo++; score += combo >= 5 ? 2 : 1; burst(f.x, f.y, "#9dff3e"); } else { loseLife(); burst(f.x, f.y, "#ff4b5c"); } fruits.splice(i, 1); continue; }
    if (f.y - f.r > virtualHeight) { if (f.good) { combo = 0; score = Math.max(0, score - 1); } fruits.splice(i, 1); }
  }
  particles = particles.filter(p => (p.life -= dt) > 0); for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; }
  scoreText.textContent = score; livesText.textContent = "❤".repeat(Math.max(0, lives));
}
function draw() {
  const width = gameCanvas.width, height = gameCanvas.height, scale = Math.min(width / VIRTUAL_WIDTH, height / virtualHeight);
  const ox = (width - VIRTUAL_WIDTH * scale) / 2, oy = (height - virtualHeight * scale) / 2;
  gameCtx.setTransform(1, 0, 0, 1, 0, 0); gameCtx.clearRect(0, 0, width, height); gameCtx.setTransform(scale, 0, 0, scale, ox, oy);
  const sky = gameCtx.createLinearGradient(0, 0, 0, virtualHeight); sky.addColorStop(0, "#59c8ff"); sky.addColorStop(1, "#0876c9"); gameCtx.fillStyle = sky; gameCtx.fillRect(0, 0, VIRTUAL_WIDTH, virtualHeight);
  gameCtx.fillStyle = "rgba(255,255,255,.2)"; for (let x = 20; x < VIRTUAL_WIDTH; x += 75) { gameCtx.beginPath(); gameCtx.arc(x, 35 + x % 50, 13, 0, Math.PI * 2); gameCtx.fill(); }
  for (const f of fruits) {
    const image = f.sprite;
    if (image.complete && image.naturalWidth) gameCtx.drawImage(image, f.x - f.drawSize / 2, f.y - f.drawSize / 2, f.drawSize, f.drawSize);
    else { gameCtx.fillStyle = f.good ? "#e83f49" : "#4b354b"; gameCtx.beginPath(); gameCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2); gameCtx.fill(); }
  }
  if (spriteBasket.complete && spriteBasket.naturalWidth) {
    gameCtx.save();
    if (selectedSkin === "gold") gameCtx.filter = "sepia(1) saturate(4) hue-rotate(350deg) brightness(1.2)";
    if (selectedSkin === "neon") { gameCtx.filter = "hue-rotate(160deg) saturate(2.8)"; gameCtx.shadowColor = "#38f7ff"; gameCtx.shadowBlur = 12; }
    gameCtx.drawImage(spriteBasket, player.x, player.y, player.width, player.height);
    gameCtx.restore();
  } else { gameCtx.fillStyle = "#b96a24"; gameCtx.fillRect(player.x, player.y, player.width, player.height); }
  for (const p of particles) { gameCtx.globalAlpha = p.life * 2; gameCtx.fillStyle = p.color; gameCtx.fillRect(p.x - 2, p.y - 2, 4, 4); } gameCtx.globalAlpha = 1;
  if (combo >= 2) {
    const bannerWidth = 126, bannerHeight = 28, bannerX = (VIRTUAL_WIDTH - bannerWidth) / 2, bannerY = 45;
    gameCtx.fillStyle = "rgba(11, 20, 53, .85)";
    gameCtx.strokeStyle = "#55f5ff";
    gameCtx.lineWidth = 2;
    gameCtx.beginPath();
    if (gameCtx.roundRect) gameCtx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 8);
    else gameCtx.rect(bannerX, bannerY, bannerWidth, bannerHeight);
    gameCtx.fill(); gameCtx.stroke();
    gameCtx.fillStyle = "#ffeb3b";
    gameCtx.font = "bold 16px monospace";
    gameCtx.textAlign = "center";
    gameCtx.shadowColor = "#ff8a00";
    gameCtx.shadowBlur = 8;
    gameCtx.fillText(`¡RACHA x${combo}!`, VIRTUAL_WIDTH / 2, bannerY + 19);
    gameCtx.shadowBlur = 0;
  }
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
document.getElementById("gameScene").addEventListener("contextmenu", event => event.preventDefault());
document.getElementById("gameScene").addEventListener("selectstart", event => event.preventDefault());
window.addEventListener("blur", () => { if (!gameOver && !document.getElementById("gameScene").classList.contains("hidden")) pauseBtn.click(); });
window.addEventListener("resize", resizeCanvas);
