// ====== ELEMENTOS ======
const menu = document.getElementById("menu");
const optionsMenu = document.getElementById("optionsMenu");
const creditsMenu = document.getElementById("creditsMenu");
const gameModes   = document.getElementById("gameModesMenu");

const bg = document.getElementById("background");
const game = document.getElementById("game");
const hud = document.getElementById("hud");

// ====== BOTONES ======
const btnPlay = document.getElementById("btnPlay");
const btnOptions = document.getElementById("btnOptions");
const btnCredits = document.getElementById("btnCredits");
const btnBackOptions = document.getElementById("btnBackOptions");
const btnBackCredits = document.getElementById("btnBackCredits");
const btnBackModes = document.getElementById("btnBackModes");


// ====== MENU PRINCIPAL → SUBMENÚ OPCIONES ======
btnOptions.addEventListener("click", () => {
    menu.classList.add("hidden");
    optionsMenu.classList.remove("hidden");
});

// ====== SUBMENÚ OPCIONES → MENU ======
btnBackOptions.addEventListener("click", () => {
    optionsMenu.classList.add("hidden");
    menu.classList.remove("hidden");
});

// ====== MENU PRINCIPAL → SUBMENÚ CRÉDITOS ======
btnCredits.addEventListener("click", () => {
    menu.classList.add("hidden");
    creditsMenu.classList.remove("hidden");
});

// ====== SUBMENÚ CRÉDITOS → MENU ======
btnBackCredits.addEventListener("click", () => {
    creditsMenu.classList.add("hidden");
    menu.classList.remove("hidden");
});


// ====== OPCIONES: MÚSICA ======
const musicBtn = document.getElementById("btnMusic");
let musicOn = true;

musicBtn.addEventListener("click", () => {
    musicOn = !musicOn;
    musicBtn.textContent = musicOn ? "ON" : "OFF";
});

// ====== OPCIONES: DIFICULTAD ======
const diffBtn = document.getElementById("btnDiff");
let diffModes = ["Normal", "Difícil", "Caótico"];
let diffIndex = 0;

diffBtn.addEventListener("click", () => {
    diffIndex = (diffIndex + 1) % diffModes.length;
    diffBtn.textContent = diffModes[diffIndex];
});


// ====== TRANSICIÓN MENU → MODOS DE JUEGO ======
btnPlay.addEventListener("click", () => {
    menu.classList.add("hidden");
            gameModes.classList.remove("hidden"); 
});

// ====== MODOS DE JUEGO → MENU ======
btnBackModes.addEventListener("click", () => {
    gameModes.classList.add("hidden");
            menu.classList.remove("hidden");
});
