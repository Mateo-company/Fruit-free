let gameCanvas, gameCtx;

const VIRTUAL_WIDTH = 320;
const VIRTUAL_HEIGHT = 240;
const COLUMNS = 8;
const COLUMN_WIDTH = VIRTUAL_WIDTH / COLUMNS;

let lastTimestamp = 0;
let elapsedTime = 0;

const COLOR_PLAYER = "#b1540d";
const COLOR_GOOD = "#088408";
const COLOR_BAD = "#af0d0d";
const COLOR_BG = "#005ec8";

const player = { width:40, height:12, x:VIRTUAL_WIDTH/2-20, y:VIRTUAL_HEIGHT-20, speed:200, vx:0 };
const keys = { left:false, right:false };
let fruits = [];
let spawnTimer = 0;
const INITIAL_SPAWN_INTERVAL = 1.2;

let score = 0, lives = 3;
let gamePaused = false;

// ====== ELEMENTOS DE PAUSA ======
const pauseBtn = document.getElementById("pauseBtn");
const pauseOverlay = document.getElementById("pauseOverlay");
const resumeBtn = document.getElementById("resumeBtn");
const menuBtn = document.getElementById("menuBtn");

// ====== LIMITES DE VELOCIDAD ======
const MAX_SPEED_NORMAL = 300;    
const MAX_SPEED_DIFICIL = 450;


// ====== SPAWN DE FRUTAS ======
function spawnFruit() {
    const goodChance = 0.35; // más frutas buenas
    const isGood = Math.random() < goodChance;

    // Velocidad base inicial más alta + escalado con tiempo
    let speed = (isGood ? 150 : 170) + Math.floor(elapsedTime / 10) * 25;

    // Incremento progresivo para modo Infinito
    if(currentMode === "Dificil") {
    speed += Math.floor(elapsedTime / 30) * 15;
     }
 

    // Aplicar límites según modo
    if(currentMode === "Normal") speed = Math.min(speed, MAX_SPEED_NORMAL);
    if(currentMode === "Dificil") speed = Math.min(speed, MAX_SPEED_DIFICIL);


    // Columnas disponibles
    let availableColumns;
    if(isGood){
        const playerCol = Math.floor(player.x / COLUMN_WIDTH);
        availableColumns = [playerCol];
        if(playerCol > 0 && Math.random() < 0.6) availableColumns.push(playerCol-1); // más probabilidad adyacente
        if(playerCol < COLUMNS-1 && Math.random() < 0.6) availableColumns.push(playerCol+1);
    } else {
        const occupiedCols = fruits.map(f => f.column);
        availableColumns = [...Array(COLUMNS).keys()].filter(c => !occupiedCols.includes(c) || Math.random() < 0.5); // más spawn
    }

    // Elegir columna evitando repeticiones cercanas
    let col, tries = 0;
    do {
        col = availableColumns[Math.floor(Math.random()*availableColumns.length)];
        tries++;
    } while(fruits.some(f => f.column === col && f.y < 50) && tries < 10);

    fruits.push({ column: col, x: col*COLUMN_WIDTH+COLUMN_WIDTH/2, y: -8, r: 6, speed: speed, good: isGood });
}

// ====== RESET ======
function resetGame() {
    score = 0;
    lives = 3;
    fruits = [];
    elapsedTime = 0;
    spawnTimer = 0;
    player.x = VIRTUAL_WIDTH / 2 - player.width / 2;
}

// ====== INIT ======
function initGame() {
    gameCanvas = document.getElementById("gameCanvas");
    gameCtx = gameCanvas.getContext("2d");
    resizeCanvas();
    resetGame();
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const scene = document.getElementById("gameScene");
    gameCanvas.width = scene.clientWidth;
    gameCanvas.height = scene.clientHeight;
}

// ====== UPDATE ======
function update(dt){
    elapsedTime += dt;

    player.vx = 0;
    let speedBoost = Math.min(Math.floor(elapsedTime/10)*10,120);
    const currentSpeed = player.speed + speedBoost;
    if(keys.left) player.vx=-currentSpeed;
    if(keys.right) player.vx=currentSpeed;
    player.x+=player.vx*dt;

    if(player.x<0) player.x=0;
    if(player.x+player.width>VIRTUAL_WIDTH) player.x=VIRTUAL_WIDTH-player.width;

    spawnTimer += dt;
    let spawnInterval = Math.max(INITIAL_SPAWN_INTERVAL - elapsedTime/40, 0.25); // más spawn al inicio
    if(currentMode === "Dificil") spawnInterval *= 0.6; // aún más rápido en Dificil// el modo esta en menu
    if(spawnTimer >= spawnInterval){ spawnFruit(); spawnTimer=0; }

    for(let i=fruits.length-1;i>=0;i--){
        const f = fruits[i];
        f.y += f.speed*dt;

        if(f.x>player.x && f.x<player.x+player.width &&
           f.y+f.r>player.y && f.y-f.r<player.y+player.height){
            if(f.good) score++; else lives--;
            fruits.splice(i,1);
            continue;
        }
        if(f.y > VIRTUAL_HEIGHT+10) fruits.splice(i,1);
    }

    document.getElementById("score").textContent=score;
    document.getElementById("lives").textContent=lives;
}

// ====== DRAW ======
function draw(){
    gameCtx.setTransform(1,0,0,1,0,0);
    gameCtx.clearRect(0,0,gameCanvas.width,gameCanvas.height);

    const scale = Math.min(gameCanvas.width/VIRTUAL_WIDTH, gameCanvas.height/VIRTUAL_HEIGHT);
    const offsetX = (gameCanvas.width - VIRTUAL_WIDTH*scale)/2;
    const offsetY = (gameCanvas.height - VIRTUAL_HEIGHT*scale)/2;

    gameCtx.translate(offsetX,offsetY);
    gameCtx.scale(scale,scale);

    gameCtx.fillStyle=COLOR_BG;
    gameCtx.fillRect(0,0,VIRTUAL_WIDTH,VIRTUAL_HEIGHT);

    gameCtx.fillStyle=COLOR_PLAYER;
    gameCtx.fillRect(player.x,player.y,player.width,player.height);

    for(const f of fruits){
        gameCtx.beginPath();
        gameCtx.arc(f.x,f.y,f.r,0,Math.PI*2);
        gameCtx.fillStyle=f.good?COLOR_GOOD:COLOR_BAD;
        gameCtx.fill();
    }
}

// ====== LOOP ======
function gameLoop(ts){
    if(!gamePaused){
        requestAnimationFrame(gameLoop);
        const dt = (ts - lastTimestamp)/1000;
        lastTimestamp = ts;
        update(dt);
        draw();
    }
}

// ====== PAUSA ======
pauseBtn.addEventListener("click", () => {
    gamePaused = true;
    pauseOverlay.classList.remove("hidden");
});

resumeBtn.addEventListener("click", () => {
    gamePaused = false;
    pauseOverlay.classList.add("hidden");
    const gameScene = document.getElementById("gameScene");
    gameScene.classList.remove("hidden");
    resizeCanvas();
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
});

menuBtn.addEventListener("click", () => {
    gamePaused = true;
    pauseOverlay.classList.add("hidden");
    document.getElementById("gameScene").classList.add("hidden");
    document.getElementById("ui").classList.remove("hidden");
    resetGame();
});

// ====== TECLADO ======
window.addEventListener("keydown", e=>{
    if(e.key==="ArrowLeft"||e.key==="a") keys.left=true;
    if(e.key==="ArrowRight"||e.key==="d") keys.right=true;
});

window.addEventListener("keyup", e=>{
    if(e.key==="ArrowLeft"||e.key==="a") keys.left=false;
    if(e.key==="ArrowRight"||e.key==="d") keys.right=false;
});

// ====== AJUSTE DE VENTANA ======
window.addEventListener("resize", resizeCanvas);
