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
    const promises = [];
     Object.values(window.playersData).forEach(countryData => {
        if (countryData.gameMusic) {
            soundFiles[countryData.gameMusic] = countryData.gameMusic;
        }
    });

    // Adicione as músicas do menu
    MENU_MUSIC_PATHS.forEach(path => {
        soundFiles[path] = path;
    });
    Object.values(soundFiles).forEach(path => {
        const audio = new Audio(path);
        window.loadedSounds[path] = audio;
        promises.push(new Promise((resolve) => {
            audio.oncanplaythrough = () => resolve();
            audio.onerror = () => resolve(); // não trava se der erro
            audio.load();
        }));
    });
    return Promise.all(promises);
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
    sfxEnabled: true,
    musicEnabled: true,
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
    if (!window.gameState.sfxEnabled) {
        return;
    }

    // Pausa e reseta QUALQUER som que esteja tocando (logica existente)
    if (window.currentlyPlayingSFX) {
        window.currentlyPlayingSFX.pause();
        window.currentlyPlayingSFX.currentTime = 0;
        // Não é necessário anular o 'onended' aqui
    }
    // NOTA: window.currentlyPlayingSFX SERÁ REESCRITO no bloco IF abaixo

    const soundPath = soundFiles[effect]; 

    if (soundPath && window.loadedSounds[soundPath]) {
        const audio = window.loadedSounds[soundPath].cloneNode();
        audio.volume = 0.5;
        window.currentlyPlayingSFX = audio;
        
        // NOVO AJUSTE: Limpa o currentlyPlayingSFX se o play() for interrompido
        audio.play().catch(e => {
            if (e.name === "AbortError" && window.currentlyPlayingSFX === audio) {
                // Se o próprio som foi abortado, limpa a referência para não pausar o próximo
                window.currentlyPlayingSFX = null;
            }
            // Deixa o log original como fallback:
            console.warn("Erro ao reproduzir som:", e);
        });

        // Limpa a referência quando o som termina
        audio.onended = () => {
            if (window.currentlyPlayingSFX === audio) {
                window.currentlyPlayingSFX = null;
            }
        };
    }
};

window.playBackgroundMusic = function(musicPath) {
    if (!gameState.hasUserInteracted) return;
    if (gameState.backgroundMusic) {
        if (gameState.backgroundMusic.src.includes(musicPath.split('/').pop()) && !gameState.backgroundMusic.paused) return;
        gameState.backgroundMusic.pause();
        gameState.backgroundMusic.currentTime = 0;
    }
    if (gameState.musicEnabled && window.loadedSounds[musicPath]) {
        gameState.backgroundMusic = window.loadedSounds[musicPath];
        gameState.backgroundMusic.loop = true;
        
        // NOVO: Define o volume da música para um valor fixo.
        // Você pode ajustar o valor (0.0 a 1.0) conforme desejar.
        gameState.backgroundMusic.volume = 0.1;
        
        gameState.backgroundMusic.play().catch(e => console.warn("Erro ao reproduzir música:", e));
    }
};

window.stopBackgroundMusic = function() {
    if (gameState.backgroundMusic) gameState.backgroundMusic.pause();
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

    // CSS da tela de carregamento
    const css = `
        body {
            background: #f4f0e6;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .box {
            width: 260px;
            height: 360px;
            border: 5px solid #8b5e3c;
            border-radius: 10px;
            background: #fff;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            perspective: 800px;
        }
        .card {
            width: 40px;
            height: 60px;
            position: absolute;
            animation: drop 0.6s ease forwards;
            transform-style: preserve-3d;
        }
        .card-inner {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.6s ease;
        }
        .card-front, .card-back {
            width: 100%;
            height: 100%;
            position: absolute;
            border: 2px solid #333;
            border-radius: 5px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .card-front {
            background: #ffeeba;
            transform: rotateY(180deg);
        }
        .card-back {
            background: white;
        }
        .card.flipped .card-inner {
            transform: rotateY(180deg);
        }
        @keyframes drop {
            0% { top: -70px; opacity: 0; }
            50% { opacity: 1; }
            100% { top: var(--top); opacity: 1; }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        .pulse {
            animation: pulse 0.6s infinite;
        }
        .progress {
            margin-top: 20px;
            font-size: 24px;
            font-weight: bold;
        }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    const box = document.createElement('div');
    box.classList.add('box');
    box.id = 'box';
    document.body.appendChild(box);

    const progressDiv = document.createElement('div');
    progressDiv.classList.add('progress');
    progressDiv.id = 'progress';
    progressDiv.textContent = '0%';
    document.body.appendChild(progressDiv);

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

    let count = 0;
    const totalCards = 25;
    const columns = 5;
    const rows = 5;
    const cardWidth = 40;
    const cardHeight = 60;
    const spacingX = 10;
    const spacingY = 10;
    const cards = [];

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


    function updateLoadingProgress(force = false) {
        const percent = Math.floor((loadedCount / totalResources) * 100);
        progressDiv.textContent = `${percent}%`;
        let targetCount = Math.floor((loadedCount / totalResources) * totalCards);
        if (force) targetCount = totalCards;
        targetCount = Math.min(targetCount, totalCards);
        while (count < targetCount) {
            createAndAddCard();
            count++;
        }
        if (count >= totalCards) {
            setTimeout(showMessage, 800);
        }
    }

    
    function createAndAddCard() {
        const card = document.createElement('div');
        card.classList.add('card');
        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        const col = Math.floor(count / rows);
        const row = count % rows;
        const left = row * (cardWidth + spacingX) + 10;
        const top = col * (cardHeight + spacingY) + 10;
        card.style.setProperty('--top', `${top}px`);
        card.style.top = `${top}px`;
        card.style.left = `${left}px`;
        box.appendChild(card);
        cards.push({ element: card, front: cardFront, col, row });
    }

    // Promise para a animação
    const animationPromise = new Promise((resolve) => {

        function showMessage() {
            const messageMap = {
                '0-0': 'V',
                '1-1': 'A',
                '2-2': 'M',
                '3-3': 'O',
                '4-4': 'S'
            };
            cards.forEach(({ element, front, col, row }) => {
                const key = `${col}-${row}`;
                if (messageMap[key]) {
                    front.textContent = messageMap[key];
                    setTimeout(() => {
                        element.classList.add('flipped');
                    }, 100 * (col + row));
                }
            });
            setTimeout(showOnlyExclamation, 2500);
        }

        function showOnlyExclamation() {
            cards.forEach(({ element, front, col, row }) => {
                if (col === 2 && row === 2) {
                    front.textContent = '!';
                    front.style.background = '#c3f0ca';
                    element.classList.add('pulse');
                } else {
                    element.classList.remove('flipped');
                    front.textContent = '';
                    front.style.background = '#ffeeba';
                    element.classList.remove('pulse');
                }
            });
            // Delay final para o pulso antes de resolver
            setTimeout(() => {
                resolve();
            }, 2000);
        }

        window.showMessage = showMessage; // Expose for force call if needed
    });

    updateLoadingProgress(); // Initial 0%

    // Carregamento de recursos
    for (const path of imagesToLoad) {
        loadedImages[path] = new Image();
        loadedImages[path].src = path;
        const p = new Promise((res) => {
            loadedImages[path].onload = () => {
                console.log(`Imagem carregada: ${path}`);
                loadedCount++;
                updateLoadingProgress();
                res();
            };
            loadedImages[path].onerror = () => {
                console.warn(`Erro ao carregar imagem: ${path}, usando fallback.`);
                loadedImages[path].src = FALLBACK_IMAGE_PATH;
                loadedCount++;
                updateLoadingProgress();
                res();
            };
        });
        loadPromises.push(p);
    }

    // Aguarda tanto o carregamento de recursos quanto a animação
    await Promise.all([resourcesPromise, animationPromise]);

    // Remove elementos da tela de carregamento e restaura
    box.remove();
    progressDiv.remove();
    style.remove();
    document.body.style.display = ''; // Reset para evitar conflitos
    document.body.style.background = ''; // Reset background
    canvas.style.display = 'block';

    // Adiciona a lógica para iniciar a música aqui após a tela de carregamento
    // com um listener para a primeira interação do utilizador.
    const setupAudioUnlock = () => {
    if (!gameState.hasUserInteracted) {
        gameState.hasUserInteracted = true;

        // NOVO: Escolhe aleatoriamente uma das músicas do menu
        const randomIndex = Math.floor(Math.random() * MENU_MUSIC_PATHS.length);
        const randomMenuMusic = MENU_MUSIC_PATHS[randomIndex];

        window.playBackgroundMusic(randomMenuMusic); // Toca a música aleatória
        
        canvas.removeEventListener('click', setupAudioUnlock);
        canvas.removeEventListener('touchend', setupAudioUnlock);
        console.log("Áudio desbloqueado com a primeira interação do utilizador.");
    }
};
    canvas.addEventListener('click', setupAudioUnlock);
    canvas.addEventListener('touchend', setupAudioUnlock);

    gameState.screen = SCREENS.MENU;
    requestAnimationFrame(gameLoop);
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
