let gameCanvas, gameCtx;
let bgImageData = null;
const VIRTUAL_WIDTH = 320;
const VIRTUAL_HEIGHT = 240;
let lastTimestamp = 0;
let currentMode = "Normal";

function initGame() {
    gameCanvas = document.getElementById("gameCanvas");
    gameCtx = gameCanvas.getContext("2d");
    resizeCanvas();
    createPersistentBackground();
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    gameCanvas.width = VIRTUAL_WIDTH;
    gameCanvas.height = VIRTUAL_HEIGHT;
}

function createPersistentBackground() {
    gameCtx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    for (let i = 0; i < 150; i++) {
        gameCtx.fillStyle = i % 2 === 0 ? "#ff0077" : "#00eaff";
        gameCtx.fillRect(
            Math.floor(Math.random() * VIRTUAL_WIDTH),
            Math.floor(Math.random() * VIRTUAL_HEIGHT),
            3, 3
        );
    }
    bgImageData = gameCtx.getImageData(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
}

function update(dt) {
    // Aquí puedes usar currentMode para ajustar dificultad
}

function draw() {
    if (bgImageData) gameCtx.putImageData(bgImageData, 0, 0);
    else gameCtx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
}

function gameLoop(ts) {
    requestAnimationFrame(gameLoop);
    const now = ts || performance.now();
    const dt = (now - lastTimestamp) / 1000;
    lastTimestamp = now;
    update(dt);
    draw();
}
