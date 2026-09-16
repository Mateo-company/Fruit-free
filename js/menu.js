/* =========================
   ELEMENTOS
========================= */
const ui = document.getElementById("ui");
const gameScene = document.getElementById("gameScene");
const versionBox = document.getElementById("versionBox");

/* ===== MENÚS ===== */
const menu = document.getElementById("menu");
const optionsMenu = document.getElementById("optionsMenu");
const creditsMenu = document.getElementById("creditsMenu");
const newsMenu = document.getElementById("newsMenu");
const suggestMenu = document.getElementById("suggestMenu");

const menus = [
    menu,
    optionsMenu,
    creditsMenu,
    newsMenu,
    suggestMenu
];

/* ===== BOTONES PRINCIPALES ===== */
const btnPlay = document.getElementById("btnPlay");
const btnOptions = document.getElementById("btnOptions");
const btnCredits = document.getElementById("btnCredits");
const btnNews = document.getElementById("btnmjrs");
const btnSuggest = document.getElementById("btncalific");

/* ===== BOTONES VOLVER ===== */
const btnBackOptions = document.getElementById("btnBackOptions");
const btnBackCredits = document.getElementById("btnBackCredits");
const btnBackModes = document.getElementById("btnBackModes");
const btnBackNews = document.getElementById("btnBackNews");
const btnBackSuggest = document.getElementById("btnBackSuggest");

/* ===== OPCIONES ===== */
const musicBtn = document.getElementById("btnMusic");

/* ===== SUGERENCIAS ===== */
const suggestForm = document.getElementById("suggestForm");
const thanksOverlay = document.getElementById("thanksOverlay");
const btnThanksBack = document.getElementById("btnThanksBack");

/* =========================
   ESTADO
========================= */
let musicOn = true;

/* =========================
   FUNCIONES BASE
========================= */
function hideAllMenus() {
    menus.forEach(m => m.classList.add("hidden"));
}

function showMenu(target) {
    hideAllMenus();
    target.classList.remove("hidden");
}

function showMainMenu() {
    hideAllMenus();
    menu.classList.remove("hidden");

    versionBox.style.display = "block";
    ui.classList.remove("hidden");
    gameScene.classList.add("hidden");
}

/* =========================
   INICIAR JUEGO
========================= */
function startGame() {
    versionBox.style.display = "none";
    ui.classList.add("hidden");
    gameScene.classList.remove("hidden");

    initGame(); // viene de game.js
}

/* =========================
   EVENTOS - MENÚ
========================= */
btnPlay.onclick = startGame;
btnOptions.onclick = () => showMenu(optionsMenu);
btnCredits.onclick = () => showMenu(creditsMenu);
btnNews.onclick = () => showMenu(newsMenu);

btnSuggest.onclick = () => {
    thanksOverlay.classList.add("hidden");
    suggestForm.reset();
    showMenu(suggestMenu);
};

/* =========================
   EVENTOS - VOLVER
========================= */
btnBackOptions.onclick = showMainMenu;
btnBackCredits.onclick = showMainMenu;
btnBackNews.onclick = showMainMenu;

btnBackSuggest.onclick = () => {
    suggestForm.reset();
    showMainMenu();
};

/* =========================
   OPCIONES
========================= */
musicBtn.onclick = () => {
    musicOn = !musicOn;
    musicBtn.textContent = musicOn ? "ON" : "OFF";
};

/* =========================
   SUGERENCIAS
========================= */
suggestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userInput = suggestForm.querySelector('input[name="usuario"]');
    if (!userInput.value.trim()) userInput.value = "Usuario";

    try {
        await fetch(suggestForm.action, {
            method: "POST",
            body: new FormData(suggestForm),
            headers: { Accept: "application/json" }
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

/* =========================
   INIT
========================= */
showMainMenu();
