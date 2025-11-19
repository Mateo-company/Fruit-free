// ====== ELEMENTOS ======
const menu = document.getElementById("menu");
const optionsMenu = document.getElementById("optionsMenu");
const creditsMenu = document.getElementById("creditsMenu");
const gameModes   = document.getElementById("gameModesMenu");
const gameScene   = document.getElementById("gameScene");
const ui = document.getElementById("ui");

// Botones principales
const btnPlay = document.getElementById("btnPlay");
const btnOptions = document.getElementById("btnOptions");
const btnCredits = document.getElementById("btnCredits");

// Botones volver
const btnBackOptions = document.getElementById("btnBackOptions");
const btnBackCredits = document.getElementById("btnBackCredits");
const btnBackModes   = document.getElementById("btnBackModes");

// Opciones: música y dificultad
const musicBtn = document.getElementById("btnMusic");
let musicOn = true;
const diffBtn = document.getElementById("btnDiff");
let diffModes = ["Normal", "Difícil", "Caótico"];
let diffIndex = 0;

// Version
const versionBox = document.getElementById("versionBox");

// Modos de juego
const btnModeNormal = document.getElementById("btnModeNormal");
const btnModeInfinite = document.getElementById("btnModeInfinite");

const menus = [menu, optionsMenu, creditsMenu, gameModes];

// ====== FUNCIONES ======
function hideAllMenus() {
    menus.forEach(m => m.classList.add("hidden"));
}

function showMenu(target) {
    hideAllMenus();
    let el = (typeof target === "string") ? document.getElementById(target) : target;
    if (el) el.classList.remove("hidden");
}

function showVersion() { versionBox.style.display = "block"; }
function hideVersion() { versionBox.style.display = "none"; }

// Mostrar versión al inicio
showVersion();

// ====== LISTENERS ======

// Abrir menú de modos al dar "Jugar"
btnPlay.addEventListener("click", () => {
    showMenu(gameModes);
});

// Opciones
btnOptions.addEventListener("click", () => showMenu(optionsMenu));
btnBackOptions.addEventListener("click", () => { showMenu(menu); showVersion(); });

// Créditos
btnCredits.addEventListener("click", () => showMenu(creditsMenu));
btnBackCredits.addEventListener("click", () => { showMenu(menu); showVersion(); });

// Música ON/OFF
musicBtn.addEventListener("click", () => {
    musicOn = !musicOn;
    musicBtn.textContent = musicOn ? "ON" : "OFF";
});

// Cambiar dificultad
diffBtn.addEventListener("click", () => {
    diffIndex = (diffIndex + 1) % diffModes.length;
    diffBtn.textContent = diffModes[diffIndex];
});

// Modos de juego
function startGame(mode) {
    hideVersion();
    ui.classList.add("hidden");
    gameScene.classList.remove("hidden");
    currentMode = mode;
    initGame();
    console.log("Modo de juego:", mode);
}

btnModeNormal.addEventListener("click", () => startGame("Normal"));
btnModeInfinite.addEventListener("click", () => startGame("Infinito"));

btnBackModes.addEventListener("click", () => { showMenu(menu); showVersion(); });
