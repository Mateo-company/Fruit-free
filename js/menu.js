// ====== ELEMENTOS ======
const menu = document.getElementById("menu");
const optionsMenu = document.getElementById("optionsMenu");
const creditsMenu = document.getElementById("creditsMenu");
const gameModes   = document.getElementById("gameModesMenu");
const gameScene   = document.getElementById("gameScene");
const ui = document.getElementById("ui");
const btnNews = document.getElementById("btnmjrs"); // botón del menú principal
const newsMenu = document.getElementById("newsMenu");
const btnBackNews = document.getElementById("btnBackNews");
const btnSuggest = document.getElementById("btncalific");
const suggestMenu = document.getElementById("suggestMenu");
const btnBackSuggest = document.getElementById("btnBackSuggest");
const suggestForm = document.getElementById("suggestForm");
const thanksOverlay = document.getElementById("thanksOverlay");
const btnThanksBack = document.getElementById("btnThanksBack");





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

const menus = [menu, optionsMenu, creditsMenu, gameModes, newsMenu, suggestMenu];



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

btnNews.addEventListener("click", () => {
    showMenu(newsMenu);
});

btnBackNews.addEventListener("click", () => {
    showMenu(menu);
    showVersion();
});

btnSuggest.addEventListener("click", () => {
    showMenu(suggestMenu);
});
btnBackSuggest.addEventListener("click", () => {
    resetSuggestForm();
    showMenu(menu);
    showVersion();
});

suggestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userInput = suggestForm.querySelector('input[name="usuario"]');
    if (!userInput.value.trim()) {
        userInput.value = "Usuario";
    }

    const formData = new FormData(suggestForm);

    try {
        await fetch(suggestForm.action, {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        });

        // MOSTRAR OVERLAY
        thanksOverlay.classList.remove("hidden");

    } catch (err) {
        alert("Error al enviar 😭");
    }
});
btnThanksBack.addEventListener("click", () => {
    thanksOverlay.classList.add("hidden");
    suggestForm.reset();

    showMenu(menu);
    showVersion();
});
btnBackSuggest.addEventListener("click", () => {
    thanksOverlay.classList.add("hidden");
    suggestForm.reset();

    showMenu(menu);
    showVersion();
});
btnSuggest.addEventListener("click", () => {
    thanksOverlay.classList.add("hidden");
    suggestForm.reset();
    showMenu(suggestMenu);
});
