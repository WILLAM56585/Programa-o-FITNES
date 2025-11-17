const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error("Canvas não encontrado no DOM!");
    throw new Error("Canvas não inicializado.");
}
window.canvas = canvas;
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function ajustarCanvas() {
    // Define a largura e altura do canvas para as dimensões visuais da janela
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Reseta qualquer transformação de contexto para evitar dupla escala
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}
ajustarCanvas(); // Chamada inicial
window.addEventListener("resize", ajustarCanvas); // Ajuste ao redimensionar

function preloadSounds() {
    // COMENTADO: Não carrega áudios para velocidade
    return Promise.resolve([]);  // <- Resolve imediatamente (0s)
}

const MENU_MUSIC_PATHS = [
    './assets/audio/musica-menu.ogg',
    './assets/audio/musica-menu-2.ogg',
    './assets/audio/musica-menu-3.ogg',
];
window.MENU_MUSIC_PATHS = MENU_MUSIC_PATHS;

const SCREENS = {
    LOADING: 'loading',
    MENU: 'menu',
    COUNTRY_SELECT: 'countrySelect',
    DIFFICULTY_SELECT: 'difficultySelect',
    GAME: 'game',
    GAME_OVER: 'gameOver',
    PAUSE: 'pause',
    ABILITIES: 'abilities',
    SETTINGS: 'settings',
    CREDITS: 'credits', // <- A VÍRGULA ESTAVA A FALTAR AQUI
    ABILITIES_TUTORIAL: 'abilitiesTutorial'
};

const SOUND_EFFECTS = {
    CLICK: 'butao-1',
    FLIP: 'clique-na-carta',
    MATCH: 'button-27',
    MISMATCH: 'button-10',
    WIN: 'concluido',
    LOSE: 'derrota',
    COIN_SPEND: 'som-comprar',
    UPGRADE_SUCCESS: 'evoluir',
    UPGRADE_FAIL: 'erro-evolu',
    COIN_GAIN: 'dinheiro',
};

const soundFiles = {
    [SOUND_EFFECTS.CLICK]: './assets/audio/butao-1.ogg',
    [SOUND_EFFECTS.MATCH]: './assets/audio/button-27.ogg',
    [SOUND_EFFECTS.MISMATCH]: './assets/audio/button-10.ogg',
    [SOUND_EFFECTS.FLIP]: './assets/audio/clique-na-carta.ogg',
    [SOUND_EFFECTS.WIN]: './assets/audio/concluido.ogg',
    [SOUND_EFFECTS.LOSE]: './assets/audio/derrota.ogg',
    [SOUND_EFFECTS.COIN_SPEND]: './assets/audio/som-comprar.ogg',
    [SOUND_EFFECTS.UPGRADE_SUCCESS]: './assets/audio/evoluir.ogg',
    [SOUND_EFFECTS.UPGRADE_FAIL]: './assets/audio/erro-evolu.ogg',
    [SOUND_EFFECTS.COIN_GAIN]: './assets/audio/dinheiro.ogg',
};


const CARD_ASPECT_RATIO = 0.7;
const CANVAS_MARGIN_X_PERCENT = 0.04;
const CANVAS_MARGIN_Y_PERCENT = 0.1;
const FALLBACK_IMAGE_PATH = './assets/img/fallback-image.jpg';

window.SCREENS = SCREENS;
window.SOUND_EFFECTS = SOUND_EFFECTS;
window.CARD_ASPECT_RATIO = CARD_ASPECT_RATIO;
window.CANVAS_MARGIN_X_PERCENT = CANVAS_MARGIN_X_PERCENT;
window.CANVAS_MARGIN_Y_PERCENT = CANVAS_MARGIN_Y_PERCENT;
window.FALLBACK_IMAGE_PATH = FALLBACK_IMAGE_PATH;

window.loadedImages = {};
window.loadedSounds = {};
let lastFrameTime = 0;
let assetsLoaded = 0;
let assetsToLoad = [];

// ESTADO INICIAL ÚNICO E CORRETO DO JOGO
const initialGameState = {
    screen: SCREENS.LOADING,
    cards: [],
    flippedCards: [],
    matchedCards: [],
    moves: 0,
    time: 0,
    timer: null,
    isClickLocked: false,
    currentCountry: null,
    currentDifficulty: null,
    unlockedCountries: ['england'],
    unlockedDifficulties: { england: ['easy'] },
    imageUsageCount: {
        england: { easy: {}, medium: {}, hard: {} },
        espanha: { easy: {}, medium: {}, hard: {} },
        brasil: { easy: {}, medium: {}, hard: {} }
    },
    buttonJumpStates: {},
    containerJumpStates: {},
    menuOpen: false,
    hasUserInteracted: false,
    sfxEnabled: false,
    musicEnabled: false,
    abilityLevels: {
        bonusTime: 0,
    },
    playerCoins: 0,
    coins: 0,
    currentSkinIndex: 0,
    hasSeenAbilitiesTutorial: false
};

// Atribuir o estado inicial correto diretamente à variável global
window.gameState = JSON.parse(JSON.stringify(initialGameState));

window.currentlyPlayingSFX = null;
window.playSoundEffect = function(effect) {
    // COMENTADO: Sem som
    return;
};

window.playBackgroundMusic = function(musicPath) {
    // COMENTADO: Sem música
    return;
};

window.stopBackgroundMusic = function() {
    // COMENTADO: Sem música
    return;
};

window.saveUnlockedCountries = function() {
    localStorage.setItem('unlockedCountries', JSON.stringify(gameState.unlockedCountries));
};

window.saveUnlockedDifficulties = function() {
    localStorage.setItem('unlockedDifficulties', JSON.stringify(gameState.unlockedDifficulties));
};

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    // Lógica de atualização de cartas já existente
    gameState.cards.forEach(card => {
        if (card.isFlipping) {
            const flipSpeed = 2.0;
            card.flipProgress += deltaTime * flipSpeed;
            if (card.flipProgress >= 1) {
                card.flipProgress = 1;
                card.isFlipping = false;
                card.isFlipped = card.flipDirection === 1;
                if (card.flipDirection === -1) card.flipProgress = 0;
            }
        }
    });

    // Mova a função updateContainerJump para cá e remova-a de canvasutils.js
    for (const buttonId in gameState.buttonJumpStates) {
        const anim = gameState.buttonJumpStates[buttonId] || { jumpProgress: 0, isJumping: false, jumpDirection: 1 };
        if (anim.isJumping) {
            const jumpSpeed = 6.0;
            anim.jumpProgress += deltaTime * jumpSpeed * anim.jumpDirection;
            if (anim.jumpProgress >= 1 && anim.jumpDirection === 1) {
                anim.jumpProgress = 1;
                anim.jumpDirection = -1;
            } else if (anim.jumpProgress <= 0 && anim.jumpDirection === -1) {
                anim.jumpProgress = 0;
                anim.isJumping = false;
                delete gameState.buttonJumpStates[buttonId];
            }
        }
    }

    for (const containerId in gameState.containerJumpStates) {
        const anim = gameState.containerJumpStates[containerId] = gameState.containerJumpStates[containerId] || { jumpProgress: 0, isJumping: false, jumpDirection: 1, isHovered: false };
        if (anim.isJumping) {
            const jumpSpeed = 6.0;
            anim.jumpProgress += deltaTime * jumpSpeed * anim.jumpDirection;
            if (anim.jumpProgress >= 1 && anim.jumpDirection === 1) {
                anim.jumpProgress = 1;
                anim.jumpDirection = -1;
            } else if (anim.jumpProgress <= 0 && anim.jumpDirection === -1) {
                anim.jumpProgress = 0;
                anim.isJumping = false;
            }
        }
    }

    // A linha que você já tem no canvasutils.js:
    // Mova-a também para o gameLoop
    gameState.iconRotation = (gameState.iconRotation || 0) + deltaTime * 30;
    // Remova a condição "isEnabled" se ela não estiver definida aqui
    gameState.pulseScale = Math.sin(Date.now() / 500) * 0.05 + 1;

    render();
    requestAnimationFrame(gameLoop);
}


window.render = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState.screen === SCREENS.LOADING) {
        drawLoadingScreen(assetsLoaded / assetsToLoad.length);
    } else if (gameState.screen === SCREENS.MENU) {
        drawMenuScreen();
    } else if (gameState.screen === SCREENS.COUNTRY_SELECT) {
        drawCountrySelectScreen();
    } else if (gameState.screen === SCREENS.DIFFICULTY_SELECT) {
        drawDifficultySelectScreen();
    } else if (gameState.screen === SCREENS.GAME) {
        drawGameScreen();
    } else if (gameState.screen === SCREENS.GAME_OVER) {
        drawGameOverScreen();
    } else if (gameState.screen === SCREENS.PAUSE) {
        drawPauseScreen();
    } else if (gameState.screen === SCREENS.ABILITIES) {
        drawAbilitiesScreen();
    } else if (gameState.screen === SCREENS.SETTINGS) {
        drawSettingsScreen();
    } else if (gameState.screen === SCREENS.CREDITS) {
        drawCreditsScreen();
    }
};

async function init() {
    canvas.style.display = 'none';

    // Preenche as listas de recursos
    const imagesToLoad = [];
    const soundsToLoad = []; // Esta lista não está sendo usada de forma eficaz no seu código atual

    console.log('Iniciando carregamento de recursos...')
    if (typeof window.playersData !== 'object' || window.playersData === null) {
        console.error('playersData não está definido ou é inválido.');
    } else {
        for (const countryKey in window.playersData) {
            imagesToLoad.push(window.playersData[countryKey].flag || FALLBACK_IMAGE_PATH);
            imagesToLoad.push(window.playersData[countryKey].backImage || FALLBACK_IMAGE_PATH);
            imagesToLoad.push(window.playersData[countryKey].gameBackground || FALLBACK_IMAGE_PATH);
        }

        for (const countryKey in window.playersData) {
            for (const difficulty in window.playersData[countryKey]) {
                if (Array.isArray(window.playersData[countryKey][difficulty])) {
                    imagesToLoad.push(...window.playersData[countryKey][difficulty].map(img => img || FALLBACK_IMAGE_PATH));
                }
            }
        }
    }

    let loadedCount = 0;
    const totalResources = imagesToLoad.length + soundsToLoad.length;

    const loadPromises = [];

// Carregar imagens
for (const path of imagesToLoad) {
    loadedImages[path] = new Image();
    loadedImages[path].src = path;
    loadPromises.push(new Promise((resolve) => {
        loadedImages[path].onload = resolve;
        loadedImages[path].onerror = resolve;
    }));
}

// Carregar sons
loadPromises.push(preloadSounds()); // <--- preloadSounds só carrega soundFiles (SFX)
const resourcesPromise = Promise.all(loadPromises).then(() => {
    loadedCount = imagesToLoad.length + Object.keys(soundFiles).length;
    updateLoadingProgress(true);
});

// NOVA: SEM CARDS/DOM/ANIMAÇÃO – direto ao ponto
await resourcesPromise;

// Remove CSS/elemento de loading (rápido)
const style = document.querySelector('style');  // Remove o CSS injetado se existir
if (style) style.remove();
canvas.style.display = 'block';
document.body.style.background = '';  // Reset

// Áudio desabilitado: sem setupAudioUnlock
gameState.screen = SCREENS.MENU;
requestAnimationFrame(gameLoop);

console.log('Loading ultra-rápido ativado!');
}

async function simpleHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function saveGameState() {
    const dataToSave = {
        unlockedCountries: gameState.unlockedCountries,
        unlockedDifficulties: gameState.unlockedDifficulties,
        imageUsageCount: gameState.imageUsageCount,
        abilityLevels: gameState.abilityLevels, // Salvar as habilidades
        playerCoins: gameState.playerCoins,
        hasSeenAbilitiesTutorial: gameState.hasSeenAbilitiesTutorial // Salvar as moedas
    };
    const dataString = JSON.stringify(dataToSave);
    const dataHash = await simpleHash(dataString);
    localStorage.setItem('gameState', dataString);
    localStorage.setItem('gameStateHash', dataHash);
    console.log('Jogo salvo com segurança.');
}

async function loadGameState() {
    const savedDataString = localStorage.getItem('gameState');
    const savedHash = localStorage.getItem('gameStateHash');

    if (!savedDataString || !savedHash) {
        console.warn('Nenhum dado salvo ou hash encontrado. Iniciando novo jogo.');
        return;
    }

    const calculatedHash = await simpleHash(savedDataString);
    if (calculatedHash !== savedHash) {
        console.error('Alerta de Segurança: Os dados salvos foram adulterados!');
        localStorage.removeItem('gameState');
        localStorage.removeItem('gameStateHash');
        return;
    }

    try {
        const loadedState = JSON.parse(savedDataString);
        gameState.unlockedCountries = loadedState.unlockedCountries;
        gameState.unlockedDifficulties = loadedState.unlockedDifficulties;
        gameState.imageUsageCount = loadedState.imageUsageCount;
        // Carregar as novas variáveis, com um fallback caso não existam
        gameState.abilityLevels = loadedState.abilityLevels || initialGameState.abilityLevels;
        gameState.playerCoins = loadedState.playerCoins || initialGameState.playerCoins;
        gameState.hasSeenAbilitiesTutorial = loadedState.hasSeenAbilitiesTutorial || initialGameState.hasSeenAbilitiesTutorial;
        console.log('Jogo carregado com sucesso.');
    } catch (e) {
        console.error('Erro ao carregar os dados salvos:', e);
    }
}
// Chame as funções na ordem correta
loadGameState();
init();
