let bg, gameCanvas;
let bgCtx, gameCtx;

function initGame() {
    bg = document.getElementById("background");
    gameCanvas = document.getElementById("game");

    bgCtx = bg.getContext("2d");
    gameCtx = gameCanvas.getContext("2d");

    resize();

    drawBackground();
    gameLoop();
}

function resize() {
    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
}

function drawBackground() {
    bgCtx.fillStyle = "black";
    bgCtx.fillRect(0, 0, bg.width, bg.height);

    // Pixel decor random
    for (let i = 0; i < 150; i++) {
        bgCtx.fillStyle = i % 2 === 0 ? "#ff0077" : "#00eaff";
        bgCtx.fillRect(
            Math.random() * bg.width, 
            Math.random() * bg.height, 
            3, 
            3
        );
    }
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // aquí después dibujamos frutas, canasta, bombas etc.
}
