/* =========================
   ELEMENTOS
========================= */
const ui = document.getElementById("ui");
const gameScene = document.getElementById("gameScene");
const versionBox = document.getElementById("versionBox");

// Menús
const menu = document.getElementById("menu");
const optionsMenu = document.getElementById("optionsMenu");
const creditsMenu = document.getElementById("creditsMenu");
const gameModesMenu = document.getElementById("gameModesMenu");
const newsMenu = document.getElementById("newsMenu");
const suggestMenu = document.getElementById("suggestMenu");

const menus = [menu, optionsMenu, creditsMenu, gameModesMenu, newsMenu, suggestMenu];

// Botones principales
const btnPlay = document.getElementById("btnPlay");
const btnOptions = document.getElementById("btnOptions");
const btnCredits = document.getElementById("btnCredits");
const btnNews = document.getElementById("btnmjrs");
const btnSuggest = document.getElementById("btncalific");

// Botones volver
const btnBackOptions = document.getElementById("btnBackOptions");
const btnBackCredits = document.getElementById("btnBackCredits");
const btnBackModes = document.getElementById("btnBackModes");
const btnBackNews = document.getElementById("btnBackNews");
const btnBackSuggest = document.getElementById("btnBackSuggest");

// Opciones
const musicBtn = document.getElementById("btnMusic");
const diffBtn = document.getElementById("btnDiff");

// Modos de juego
const btnModeNormal = document.getElementById("btnModeNormal");
const btnModeDificil = document.getElementById("btnModeDificil");


// Sugerencias
const suggestForm = document.getElementById("suggestForm");
const thanksOverlay = document.getElementById("thanksOverlay");
const btnThanksBack = document.getElementById("btnThanksBack");

/* =========================
   ESTADO
========================= */
let musicOn = true;
let diffModes = ["Normal", "Difícil", "Caótico"];
let diffIndex = 0;
let currentMode = "Normal";

/* =========================
   FUNCIONES
========================= */
function hideAllMenus() {
    menus.forEach(m => m.classList.add("hidden"));
}

function showMenu(target) {
    hideAllMenus();
    target.classList.remove("hidden");
}

function showMainMenu() {
    showMenu(menu);
    versionBox.style.display = "block";
    ui.classList.remove("hidden");
    gameScene.classList.add("hidden"); // asegurarse de ocultar el juego
}

function startGame(mode) {
    versionBox.style.display = "none";
    ui.classList.add("hidden");
    gameScene.classList.remove("hidden"); // mostrar canvas
    currentMode = mode;
    gamePaused = false;
    initGame(); // llamar al juego
}

/* =========================
   EVENTOS
========================= */
// Menú principal
btnPlay.onclick = () => showMenu(gameModesMenu);
btnOptions.onclick = () => showMenu(optionsMenu);
btnCredits.onclick = () => showMenu(creditsMenu);
btnNews.onclick = () => showMenu(newsMenu);
btnSuggest.onclick = () => {
    thanksOverlay.classList.add("hidden");
    suggestForm.reset();
    showMenu(suggestMenu);
};

// Volver
btnBackOptions.onclick = showMainMenu;
btnBackCredits.onclick = showMainMenu;
btnBackModes.onclick = showMainMenu;
btnBackNews.onclick = showMainMenu;
btnBackSuggest.onclick = () => { suggestForm.reset(); showMainMenu(); };

// Opciones
musicBtn.onclick = () => { musicOn = !musicOn; musicBtn.textContent = musicOn ? "ON" : "OFF"; };
diffBtn.onclick = () => { diffIndex = (diffIndex + 1) % diffModes.length; diffBtn.textContent = diffModes[diffIndex]; };

// Modos de juego
btnModeNormal.onclick = () => startGame("Normal");
btnModeDificil.onclick = () => startGame("Dificil");

// Sugerencias
suggestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userInput = suggestForm.querySelector('input[name="usuario"]');
    if (!userInput.value.trim()) userInput.value = "Usuario";

    try {
        await fetch(suggestForm.action, {
            method: "POST",
            body: new FormData(suggestForm),
            headers: { "Accept": "application/json" }
        });
        thanksOverlay.classList.remove("hidden");
    } catch {
        alert("Error al enviar 😭");
    }
});

btnThanksBack.onclick = () => {
    thanksOverlay.classList.add("hidden");
    suggestForm.reset();
    showMainMenu();
};

// Mostrar versión al inicio
showMainMenu();
