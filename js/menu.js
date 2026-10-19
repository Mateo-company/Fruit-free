/* =========================
   ELEMENTOS
========================= */
const ui = document.getElementById("ui");
const gameScene = document.getElementById("gameScene");
const versionBox = document.getElementById("versionBox");

/* ===== MENÚS ===== */
const menu = document.getElementById("menu");
const modesMenu = document.getElementById("modesMenu");
const skinsMenu = document.getElementById("skinsMenu");
const guideMenu = document.getElementById("guideMenu");
const optionsMenu = document.getElementById("optionsMenu");
const creditsMenu = document.getElementById("creditsMenu");
const newsMenu = document.getElementById("newsMenu");
const suggestMenu = document.getElementById("suggestMenu");

const menus = [
    menu,
    modesMenu,
    skinsMenu,
    guideMenu,
    optionsMenu,
    creditsMenu,
    newsMenu,
    suggestMenu
];

/* ===== BOTONES PRINCIPALES ===== */
const btnModes = document.getElementById("btnModes");
const btnSkins = document.getElementById("btnSkins");
const btnGuide = document.getElementById("btnGuide");
const btnOptions = document.getElementById("btnOptions");
const btnCredits = document.getElementById("btnCredits");
const btnNews = document.getElementById("btnmjrs");
const btnSuggest = document.getElementById("btncalific");

/* ===== BOTONES VOLVER ===== */
const btnMainMenuOptions = document.getElementById("btnMainMenuOptions");
const btnBackModes = document.getElementById("btnBackModes");
const btnBackSkins = document.getElementById("btnBackSkins");
const btnBackGuide = document.getElementById("btnBackGuide");
const btnBackCredits = document.getElementById("btnBackCredits");
const btnBackNews = document.getElementById("btnBackNews");
const btnBackSuggest = document.getElementById("btnBackSuggest");

/* ===== OPCIONES ===== */
const musicBtn = document.getElementById("btnMusic");
const btnModeClassic = document.getElementById("btnModeClassic");
const btnModeHard = document.getElementById("btnModeHard");

/* ===== SUGERENCIAS ===== */
const suggestForm = document.getElementById("suggestForm");
const thanksOverlay = document.getElementById("thanksOverlay");
const btnThanksBack = document.getElementById("btnThanksBack");

/* =========================
   ESTADO
========================= */
let musicOn = true;
let lastModeTap = { button: null, time: 0 };
let modeTextTimeout = 0;
const modeDetails = {
    Clasico: { button: btnModeClassic, text: "Modo Clásico", description: "Atrapa buenas, evita malas" },
    Dificil: { button: btnModeHard, text: "Difícil", description: "Un verdadero reto" }
};
let currentMode = "Clasico";
let selectedSkin = localStorage.getItem("fruitFree_skin") || "original";
let skinCoins = Number(localStorage.getItem("fruitFree_coins")) || 0;
const skins = { original: { name: "Canasta original", cost: 0 }, gold: { name: "Canasta dorada", cost: 30 }, neon: { name: "Canasta neón", cost: 60 } };
const ownedSkins = new Set(JSON.parse(localStorage.getItem("fruitFree_skins") || '["original"]'));
const skinCoinsText = document.getElementById("skinCoins");

function saveSkins() {
    localStorage.setItem("fruitFree_skin", selectedSkin);
    localStorage.setItem("fruitFree_coins", skinCoins);
    localStorage.setItem("fruitFree_skins", JSON.stringify([...ownedSkins]));
}
function renderSkinShop() {
    skinCoinsText.textContent = skinCoins;
    document.querySelectorAll(".skinBtn").forEach(button => {
        const skin = skins[button.dataset.skin];
        button.textContent = button.dataset.skin === selectedSkin ? `${skin.name} — Equipada` : ownedSkins.has(button.dataset.skin) ? `${skin.name} — Elegir` : `${skin.name} — ${skin.cost} 🪙`;
    });
}
function awardCoins(amount) { if (amount) { skinCoins += amount; saveSkins(); } }

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
function startGame(mode = currentMode) {
    currentMode = mode;
    versionBox.style.display = "none";
    ui.classList.add("hidden");
    gameScene.classList.remove("hidden");

    initGame(); // viene de game.js
}

/* =========================
   EVENTOS - MENÚ
========================= */
btnModes.onclick = () => {
    Object.values(modeDetails).forEach(mode => { mode.button.textContent = mode.text; });
    lastModeTap = { button: null, time: 0 };
    showMenu(modesMenu);
};
btnSkins.onclick = () => { renderSkinShop(); showMenu(skinsMenu); };
btnGuide.onclick = () => showMenu(guideMenu);
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
btnMainMenuOptions.onclick = showMainMenu;
btnBackModes.onclick = showMainMenu;
btnBackSkins.onclick = showMainMenu;
btnBackGuide.onclick = () => showMenu(optionsMenu);
btnBackCredits.onclick = () => showMenu(optionsMenu);
btnBackNews.onclick = () => showMenu(optionsMenu);

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

function isTouchDevice() {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

function showModeDescription(mode, temporary = false) {
    clearTimeout(modeTextTimeout);
    mode.button.textContent = mode.description;
    if (temporary) {
        modeTextTimeout = window.setTimeout(() => {
            mode.button.textContent = mode.text;
        }, 1600);
    }
}

function configureMode(modeName) {
    const mode = modeDetails[modeName];
    mode.button.onmouseenter = () => { if (!isTouchDevice()) showModeDescription(mode); };
    mode.button.onmouseleave = () => { if (!isTouchDevice()) mode.button.textContent = mode.text; };
    mode.button.onclick = () => {
        if (!isTouchDevice()) { startGame(modeName); return; }
        const now = Date.now();
        if (lastModeTap.button === mode.button && now - lastModeTap.time < 400) {
            lastModeTap = { button: null, time: 0 };
            clearTimeout(modeTextTimeout);
            startGame(modeName);
        } else {
            lastModeTap = { button: mode.button, time: now };
            showModeDescription(mode, true);
        }
    };
}

configureMode("Clasico");
configureMode("Dificil");

document.querySelectorAll(".skinBtn").forEach(button => {
    button.onclick = () => {
        const skinId = button.dataset.skin;
        if (!ownedSkins.has(skinId)) {
            if (skinCoins < skins[skinId].cost) return;
            skinCoins -= skins[skinId].cost;
            ownedSkins.add(skinId);
        }
        selectedSkin = skinId;
        saveSkins();
        renderSkinShop();
    };
});

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
