console.log('screenrenderers.js carregado');
let particulasClique = [];

const COUNTRY_COLORS = {
  england: { main: "#c80815", secondary: "#003366" }, // Vermelho e Azul
  espanha: { main: "#ffc400", secondary: "#e03a3e" }, // Amarelo e Vermelho
  brasil: { main: "#009c3b", secondary: "#ffdf00" }   // Verde e Amarelo
};

function drawCoinsCounter() {
    const coinEmoji = '💰';
    const coinsText = window.gameState.playerCoins;

    const fontSize = getResponsiveSize(30);
    const padding = getResponsiveSize(10);
    const textX = padding;
    const textY = padding + fontSize;

    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${coinEmoji} ${coinsText}`, textX, textY);
}

let particulas = [];
for (let i = 0; i < 80; i++) {
  particulas.push({
    x: Math.random() * 400, // Coordenadas de referência
    y: Math.random() * 600,
    r: Math.random() * 2 + 1,
    alpha: Math.random(),
    vel: Math.random() * 0.02 + 0.005,
    dir: Math.random() > 0.5 ? 1 : -1
  });
}

function drawGradientBackground() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#141E30");
  grad.addColorStop(1, "#243B55");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateParticulas() {
  const referenceWidth = 400; // Base de cálculo para responsividade
  const referenceHeight = 600;

  particulas.forEach(p => {
    // 1. Atualizar posição horizontal
    p.x += (p.vel * getResponsiveSize(1)); 
    
    // 2. Envolvimento horizontal (wrap)
    const scaledX = p.x * (canvas.width / referenceWidth);
    const scaledR = p.r * (canvas.width / referenceWidth);

    if (scaledX > canvas.width + scaledR) {
        p.x = -scaledR * (referenceWidth / canvas.width);
    } else if (scaledX < -scaledR) {
        p.x = (referenceWidth / canvas.width) + scaledR * (referenceWidth / canvas.width);
    }

    // 3. Oscilação da opacidade para o efeito de "respiração"
    p.alpha = Math.sin(Date.now() * p.vel * 50) * 0.3 + 0.5;
  });
}

function drawParticulas() {
    const referenceWidth = 400;
    const referenceHeight = 600;

    particulas.forEach(p => {
        // Partículas brancas e translúcidas (para não interferir com o texto)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`; 
        
        // Escala a posição e o raio
        const drawX = p.x * (canvas.width / referenceWidth);
        const drawY = p.y * (canvas.height / referenceHeight);
        const drawR = p.r * (canvas.width / referenceWidth);

        ctx.beginPath();
        ctx.arc(drawX, drawY, drawR, 0, Math.PI * 2, false);
        ctx.fill();
    });
}

function drawMenuBackground() {
    const menuBackground = loadedImages[window.playersData?.['england']?.gameBackground] || loadedImages[FALLBACK_IMAGE_PATH];
    
    // Desenha a imagem de fundo
    if (menuBackground && menuBackground.complete) {
        ctx.drawImage(menuBackground, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback caso a imagem ainda não tenha carregado
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawMenuScreen() {
  drawMenuBackground(); 

  // === CHAMADA DAS PARTÍCULAS: DESENHADAS LOGO APÓS O FUNDO ===
  updateParticulas();
  drawParticulas();
  // ==========================================================

  ctx.textAlign = 'center';
  
  // Constantes de Medida
  const buttonWidth = getResponsiveSize(300);
  const buttonHeight = getResponsiveSize(70);
  const buttonSpacing = getResponsiveSize(20);
  const titleHeight = getResponsiveSize(90); 
  const numButtons = 4;
  
  // --- TÍTULO ---
  const titleFont = `${getResponsiveSize(32)}px Bungee`; 
  
  // 1. Cálculos de Centragem Vertical
  const totalButtonsHeight = numButtons * buttonHeight + (numButtons - 1) * buttonSpacing;
  const totalMenuContentHeight = titleHeight + getResponsiveSize(60) + totalButtonsHeight;
  const startY = (canvas.height / 2) - (totalMenuContentHeight / 2); 
  const titleY1 = startY + getResponsiveSize(25); 
  
  // Desenho do Título (Mantido)
  const titulo = "JOGO DE MEMÓRIA";
  const gradTitulo = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradTitulo.addColorStop(0, "#FFD700"); 
  gradTitulo.addColorStop(1, "#FF4500"); 

  ctx.font = titleFont;
  ctx.lineWidth = getResponsiveSize(4);
  ctx.strokeStyle = "black";
  ctx.strokeText(titulo, canvas.width / 2, titleY1);
  ctx.fillStyle = gradTitulo;
  ctx.fillText(titulo, canvas.width / 2, titleY1);

  // 2. BOTÕES
  let currentY = titleY1 + titleHeight + getResponsiveSize(40);
  const buttonX = (canvas.width - buttonWidth) / 2;

  const buttonTexts = {
    'play': '▶ JOGAR',
    'settings': '⚙ CONFIGURAÇÕES',
    'abilities': '🔥 HABILIDADES',
    'credits': '🏆 RANKING',
  };
  
  // Gradiente Uniforme
  const uniformGradient = ['#ff8a00', '#e52e71']; 
  const buttonGradients = {
    'play': uniformGradient,
    'settings': uniformGradient,
    'abilities': uniformGradient,
    'credits': uniformGradient,
  };

  const buttons = ['play', 'settings', 'abilities', 'credits'];

  buttons.forEach((buttonId, index) => {
    const y = currentY + index * (buttonHeight + buttonSpacing);
    // Fonte 26px e Botões Grandes
    drawButton(buttonX, y, buttonWidth, buttonHeight, buttonTexts[buttonId], buttonId, true, 26, buttonGradients[buttonId], 15, 'Bungee');
  });
}

function getCountryButtonDimensions() {
  const countryKeys = Object.keys(window.playersData || {});
  const buttonHeight = getResponsiveSize(80);
  const buttonSpacing = getResponsiveSize(20);
  const startY = (canvas.height - (countryKeys.length * buttonHeight + (countryKeys.length - 1) * buttonSpacing)) / 2;
  const quadWidth = getResponsiveSize(70);
  const rectWidth = getResponsiveSize(250);
  const totalButtonWidth = quadWidth + getResponsiveSize(20) + rectWidth;
  return { countryKeys, buttonHeight, buttonSpacing, startY, quadWidth, rectWidth, totalButtonWidth };
}

function drawCountrySelectScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!window.playersData) {
        drawErrorScreen("Erro: Dados dos países não carregados.");
        return;
    }

    // [ESTADO DE ANIMAÇÃO DE TRANSIÇÃO]
    // Inicializa o estado se for a primeira vez
    window.gameState.countryListXOffset = window.gameState.countryListXOffset === undefined ? -canvas.width : window.gameState.countryListXOffset;
    window.gameState.exitCountryId = window.gameState.exitCountryId || null;
    
    let targetOffset = 0; 
    
    // Define o TARGET para a animação de SAÍDA
    if (window.gameState.exitCountryId && window.gameState.exitCountryId !== 'voltar') {
        // País selecionado: Todos os não selecionados vão para a direita (canvas.width)
        targetOffset = canvas.width;
    } else if (window.gameState.exitCountryId === 'voltar') {
        // Voltar selecionado: Todos os botões saem pela esquerda
        targetOffset = -canvas.width;
    }
    
    // Suavização do movimento
    window.gameState.countryListXOffset += (targetOffset - window.gameState.countryListXOffset) * 0.1; // Suavidade ajustada para 0.1

    // Desenhar fundo gradiente e partículas
    drawGradientBackground();
    updateParticulas();
    drawParticulas();

    // Título (MODIFICAÇÃO: Fonte Bungee e tamanho muito reduzido)
    const titulo = "🌍 Escolha seu País";
    const titleFontSize = getResponsiveSize(30); // Reduzido drasticamente de 42 para 30
    const titleY = getResponsiveSize(40); // Posicionado mais perto do topo

    ctx.font = `bold ${titleFontSize}px Bungee`; 
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = getResponsiveSize(4); // Borda mais fina
    ctx.strokeStyle = "black";
    ctx.strokeText(titulo, canvas.width / 2, titleY);
    ctx.fillStyle = "#FFD700";
    ctx.fillText(titulo, canvas.width / 2, titleY);

    // Configurações de layout
    const countryKeys = Object.keys(window.playersData);
    const buttonHeight = getResponsiveSize(70); 
    const buttonSpacing = getResponsiveSize(30);
    const flagRectWidth = getResponsiveSize(100); 
    const rectWidth = getResponsiveSize(250); 
    const gap = getResponsiveSize(20); 
    const totalButtonWidth = flagRectWidth + gap + rectWidth;
    
    const totalListHeight = countryKeys.length * buttonHeight + (countryKeys.length - 1) * buttonSpacing;
    const startY = (canvas.height - totalListHeight) / 2;
    const initialButtonX = (canvas.width - totalButtonWidth) / 2;


    countryKeys.forEach((countryKey, index) => {
        const country = window.playersData[countryKey];
        const isUnlocked = window.gameState.unlockedCountries.includes(countryKey);
        const y = startY + index * (buttonHeight + buttonSpacing);
        
        let x = initialButtonX;

        // NOVO: Lógica de animação
        if (window.gameState.exitCountryId === countryKey) {
            // O botão clicado FICA (não aplica offset)
            x = initialButtonX; 
        } else {
            // Os outros botões aplicam o offset (entrada, saída para menu, ou saída para dificuldade)
            x = initialButtonX + window.gameState.countryListXOffset;
        }

        // [ANIMAÇÃO DE SALTO]
        const anim = gameState.containerJumpStates[`container_${countryKey}`] || { jumpProgress: 0, isJumping: false, jumpDirection: 1 };
        const jumpFactor = anim.jumpProgress < 0.5 ? anim.jumpProgress * 0.2 : (1 - anim.jumpProgress) * 0.2;
        const scaleY = 1 + (anim.jumpDirection === 1 ? jumpFactor : -jumpFactor);
        const translateY = -buttonHeight * jumpFactor * (anim.jumpDirection === 1 ? 1 : -1);

        ctx.save();
        ctx.translate(x + totalButtonWidth / 2, y + buttonHeight / 2 + translateY);
        ctx.scale(1, scaleY);
        ctx.translate(-(x + totalButtonWidth / 2), -(y + buttonHeight / 2));


        // [CUSTOMIZAÇÃO DE CORES E IMAGEM]
        const colors = COUNTRY_COLORS[countryKey];

        // 1. Retângulo da Bandeira
        ctx.fillStyle = isUnlocked ? colors.secondary : "#444"; 
        roundRect(ctx, x, y, flagRectWidth, buttonHeight, 10, true, false);

        // Desenhar Imagem da Bandeira (Mantendo proporção)
        const flagImage = loadedImages[country.flag];
        if (flagImage && flagImage.complete) {
            // Redimensionamento para preencher o container de 100x70 mantendo a proporção
            const containerWidth = flagRectWidth;
            const containerHeight = buttonHeight;
            const flagRatio = flagImage.width / flagImage.height;
            
            let imgWidth, imgHeight;
            const padding = 0.8; 
            
            // Ajusta o tamanho da imagem para caber no container com padding, sem achatar.
            if (containerWidth / containerHeight > flagRatio) {
                imgHeight = containerHeight * padding; 
                imgWidth = imgHeight * flagRatio;
            } else { 
                imgWidth = containerWidth * padding;
                imgHeight = imgWidth / flagRatio;
            }

            const imgX = x + (containerWidth - imgWidth) / 2;
            const imgY = y + (containerHeight - imgHeight) / 2;
            
            ctx.drawImage(flagImage, imgX, imgY, imgWidth, imgHeight);
        }

        // Desenhar Cadeado (se bloqueado)
        if (!isUnlocked) {
          ctx.font = `${getResponsiveSize(24)}px Arial`;
          ctx.fillStyle = "#FFF"; 
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🔒", x + flagRectWidth / 2, y + buttonHeight / 2 + getResponsiveSize(10));
        }

        // 2. Retângulo do Nome do País
        const grad = ctx.createLinearGradient(x + flagRectWidth + gap, y, x + flagRectWidth + gap + rectWidth, y + buttonHeight);
        grad.addColorStop(0, isUnlocked ? `rgba(255,255,255,0.2)` : "#222");
        grad.addColorStop(1, isUnlocked ? `${colors.main}99` : "#555");
        ctx.fillStyle = grad;
        roundRect(ctx, x + flagRectWidth + gap, y, rectWidth, buttonHeight, 10, true, false);

        // MODIFICAÇÃO: Remoção da borda branca
        // ctx.strokeStyle = "#fff";
        // ctx.lineWidth = getResponsiveSize(2);
        // ctx.strokeRect(x + flagRectWidth + gap, y, rectWidth, buttonHeight);

        // Desenhar Nome do País
        ctx.fillStyle = "#fff";
        ctx.font = `${getResponsiveSize(28)}px Arial`;
        ctx.fillText(getCountryDisplayName(countryKey), x + flagRectWidth + gap + rectWidth / 2, y + buttonHeight / 2);

        ctx.restore();

        window.gameState.containerJumpStates[`container_${countryKey}`] = anim;
    });

    // Botão de Voltar (Sempre se move se a lista estiver se movendo)
    const backButtonWidth = getResponsiveSize(220); 
    const backButtonHeight = getResponsiveSize(65); 
    const backButtonX = (canvas.width - backButtonWidth) / 2;
    const backButtonY = canvas.height - backButtonHeight - getResponsiveSize(25); 
    
    // O botão de voltar se move com o offset
    let finalBackX = backButtonX + window.gameState.countryListXOffset;
    
    const animBack = gameState.buttonJumpStates['backFromCountrySelect'] || { jumpProgress: 0, isJumping: false, jumpDirection: 1 };
    const jumpFactorBack = animBack.jumpProgress < 0.5 ? animBack.jumpProgress * 0.2 : (1 - animBack.jumpProgress) * 0.2;
    ctx.save();
    ctx.translate(finalBackX + backButtonWidth / 2, backButtonY + backButtonHeight / 2);
    ctx.scale(1 + (animBack.jumpDirection === 1 ? jumpFactorBack : -jumpFactorBack), 1 + (animBack.jumpDirection === 1 ? jumpFactorBack : -jumpFactorBack));
    ctx.translate(-(finalBackX + backButtonWidth / 2), -(backButtonY + backButtonHeight / 2));

    const backGrad = ctx.createLinearGradient(finalBackX, backButtonY, finalBackX + backButtonWidth, backButtonY + backButtonHeight);
    backGrad.addColorStop(0, "#ff8a00");
    backGrad.addColorStop(1, "#e52e71");
    ctx.fillStyle = backGrad;
    roundRect(ctx, finalBackX, backButtonY, backButtonWidth, backButtonHeight, 15, true, true);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = getResponsiveSize(2);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${getResponsiveSize(24)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⬅ Voltar", finalBackX + backButtonWidth / 2, backButtonY + backButtonHeight / 2);
    ctx.restore();
    
    function getCountryDisplayName(key) {
        const names = {
            england: "Inglaterra",
            espanha: "Espanha",
            brasil: "Brasil"
        };
        return names[key] || key;
    }
    
    atualizarParticulasClique();
    desenharParticulasClique();
}

function drawDifficultySelectScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const difficultySelectBackground = loadedImages[window.playersData[gameState.currentCountry]?.gameBackground] || loadedImages[window.playersData['england']?.gameBackground] || loadedImages[FALLBACK_IMAGE_PATH];
  ctx.drawImage(difficultySelectBackground, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = `${getResponsiveSize(40)}px Arial`;
  ctx.textAlign = 'center';
  let titleY = canvas.height * 0.15;
  if (canvas.height / canvas.width < 0.65) titleY = canvas.height * 0.1;
  ctx.fillText('Dificuldade', canvas.width / 2, titleY);
  const buttonWidth = getResponsiveSize(200);
  const buttonHeight = getResponsiveSize(50);
  const buttonX = (canvas.width - buttonWidth) / 2;
  let startY = canvas.height * 0.3;
  if (canvas.height / canvas.width < 0.65) startY = canvas.height * 0.25;
  const buttonSpacing = getResponsiveSize(20);
  let effectiveButtonSpacing = buttonSpacing;
  if (canvas.height / canvas.width < 0.65) effectiveButtonSpacing *= 0.7;
  const difficulties = ['easy', 'medium', 'hard'];
  const unlockedForCountry = gameState.unlockedDifficulties[gameState.currentCountry] || [];
  difficulties.forEach((difficulty, index) => {
    const isUnlocked = unlockedForCountry.includes(difficulty);
    const y = startY + index * (buttonHeight + effectiveButtonSpacing);
    drawButton(buttonX, y, buttonWidth, buttonHeight, difficulty.charAt(0).toUpperCase() + difficulty.slice(1), difficulty, isUnlocked);
    if (!isUnlocked) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(buttonX, y, buttonWidth, buttonHeight);
      ctx.fillStyle = 'white';
      ctx.font = `${getResponsiveSize(25)}px Arial`;
      ctx.fillText('Bloqueado', buttonX + buttonWidth / 2, y + buttonHeight / 2 + 5);
    }
  });
  const backButtonWidth = getResponsiveSize(150);
  const backButtonHeight = getResponsiveSize(50);
  const backButtonX = (canvas.width - backButtonWidth) / 2;
  const lastDifficultyY = startY + (difficulties.length - 1) * (buttonHeight + effectiveButtonSpacing);
  const backButtonY = lastDifficultyY + getResponsiveSize(80);
  drawButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 'Voltar', 'backFromDifficultySelect');
}

function drawGameScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gameBackground = loadedImages[window.playersData[gameState.currentCountry]?.gameBackground] || loadedImages[FALLBACK_IMAGE_PATH];
    if (gameBackground && gameBackground.complete) {
        ctx.drawImage(gameBackground, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const backImage = loadedImages[window.playersData[gameState.currentCountry]?.backImage] || loadedImages[FALLBACK_IMAGE_PATH];
    gameState.cards.forEach(card => {
        let imageToDraw;
        let currentWidth = card.width;
        let currentX = card.x;
        if (card.isFlipping) {
            const scaleFactor = Math.abs(Math.cos(card.flipProgress * Math.PI));
            currentWidth = card.width * scaleFactor;
            currentX = card.x + (card.width - currentWidth) / 2;
            imageToDraw = card.flipProgress < 0.5 ? (card.flipDirection === 1 ? backImage : loadedImages[card.imagePath]) : (card.flipDirection === 1 ? loadedImages[card.imagePath] : backImage);
        } else {
            imageToDraw = (card.isFlipped || card.isMatched) ? loadedImages[card.imagePath] : backImage;
        }
        if (imageToDraw) ctx.drawImage(imageToDraw, currentX, card.y, currentWidth, card.height);
        else {
            ctx.fillStyle = '#666';
            ctx.fillRect(currentX, card.y, currentWidth, card.height);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(currentX, card.y, currentWidth, card.height);
        }
    });
    ctx.fillStyle = gameState.timer <= 5 ? 'red' : 'white';
    ctx.font = `${getResponsiveSize(24)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const timerY = canvas.height - getResponsiveSize(30);
    const formattedTime = Math.max(0, Math.floor(typeof gameState.timer === 'number' ? gameState.timer : 0));
    ctx.fillText(`${formattedTime}`, canvas.width / 2, timerY);
    const menuButtonWidth = getResponsiveSize(50);
    const menuButtonHeight = getResponsiveSize(50);
    const menuButtonX = getResponsiveSize(20);
    const menuButtonY = canvas.height - menuButtonHeight - getResponsiveSize(20);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight);
    ctx.fillStyle = 'white';
    ctx.font = `${getResponsiveSize(30)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('II', menuButtonX + menuButtonWidth / 2, menuButtonY + menuButtonHeight / 2);
    // drawButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 'Voltar', 'backFromDifficultySelect', true, 18);
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = `${getResponsiveSize(60)}px Arial`;
  ctx.textAlign = 'center';
  const titleY = canvas.height * 0.3;
  if (gameState.matchedCards.length === gameState.cards.length) {
    ctx.fillText('Vitória!', canvas.width / 2, titleY);
  } else {
    ctx.fillText('Tempo', canvas.width / 2, titleY);
    ctx.fillText('Esgotado', canvas.width / 2, titleY + getResponsiveSize(60));
  }
  ctx.font = `${getResponsiveSize(30)}px Arial`;
  const timeY = titleY + (gameState.matchedCards.length === gameState.cards.length ? getResponsiveSize(60) : getResponsiveSize(120));
  ctx.fillText(`${gameState.time}s`, canvas.width / 2, timeY);
  const buttonWidth = getResponsiveSize(200);
  const buttonHeight = getResponsiveSize(50);
  const buttonX = (canvas.width - buttonWidth) / 2;
  let buttonY = timeY + getResponsiveSize(80);
  if (gameState.matchedCards.length === gameState.cards.length) {
    drawButton(buttonX, buttonY, buttonWidth, buttonHeight, 'Voltar', 'backFromGameOver');
    drawButton(buttonX, buttonY + buttonHeight + getResponsiveSize(20), buttonWidth, buttonHeight, 'Continuar', 'continueGameOver');
  } else {
    drawButton(buttonX, buttonY, buttonWidth, buttonHeight, 'Voltar', 'backFromGameOver');
  }
}

function drawPauseScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = `${getResponsiveSize(60)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('PAUSADO', canvas.width / 2, canvas.height * 0.3);
  const buttonWidth = getResponsiveSize(250);
  const buttonHeight = getResponsiveSize(60);
  const buttonX = (canvas.width - buttonWidth) / 2;
  const startY = canvas.height * 0.45;
  const buttonSpacing = getResponsiveSize(20);
  drawButton(buttonX, startY, buttonWidth, buttonHeight, 'Retomar', 'resume');
  drawButton(buttonX, startY + buttonHeight + buttonSpacing, buttonWidth, buttonHeight, 'Menu', 'menuFromPause');
  drawButton(buttonX, startY + 2 * (buttonHeight + buttonSpacing), buttonWidth, buttonHeight, 'CONFIG.', 'settingsFromPause');
}

function drawSettingsScreen() {
    drawMenuBackground();
    ctx.fillStyle = 'white';
    ctx.font = `${getResponsiveSize(40)}px Arial`;
    ctx.textAlign = 'center';
    let titleY = canvas.height * 0.2;
    if (canvas.height / canvas.width < 0.65) titleY = canvas.height * 0.15;
    ctx.fillText('CONFIG.', canvas.width / 2, titleY);

    const settingsButtonWidth = getResponsiveSize(250);
    const settingsButtonHeight = getResponsiveSize(60);
    const settingsButtonX = (canvas.width - settingsButtonWidth) / 2;
    let settingsStartY = canvas.height * 0.4;
    if (canvas.height / canvas.width < 0.65) settingsStartY = canvas.height * 0.35;
    const buttonSpacing = getResponsiveSize(20);
    let effectiveSettingsButtonSpacing = buttonSpacing;
    if (canvas.height / canvas.width < 0.65) effectiveSettingsButtonSpacing *= 0.7;

    drawButton(settingsButtonX, settingsStartY, settingsButtonWidth, settingsButtonHeight, `Música: ${gameState.musicEnabled ? 'Ligado' : 'Desligado'}`, 'toggleMusic');
    drawButton(settingsButtonX, settingsStartY + settingsButtonHeight + effectiveSettingsButtonSpacing, settingsButtonWidth, settingsButtonHeight, `Efeitos: ${gameState.sfxEnabled ? 'Ligado' : 'Desligado'}`, 'toggleSfx');

    const backButtonWidth = getResponsiveSize(150);
    const backButtonHeight = getResponsiveSize(50);
    const backButtonX = (canvas.width - backButtonWidth) / 2;
    const backButtonY = settingsStartY + 2 * (settingsButtonHeight + effectiveSettingsButtonSpacing) + getResponsiveSize(20);
    drawButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 'Voltar', 'backFromSettings', true, 18);
}

function drawCreditsScreen() {
  drawMenuBackground();
  ctx.fillStyle = 'white';
  ctx.font = `${getResponsiveSize(40)}px Arial`;
  ctx.textAlign = 'center';
  let titleY = canvas.height * 0.2;
  if (canvas.height / canvas.width < 0.65) titleY = canvas.height * 0.15;
  ctx.fillText('Ranking', canvas.width / 2, titleY);
  ctx.font = `${getResponsiveSize(24)}px Arial`;
  let textStartY = canvas.height * 0.3;
  let textLineHeight = getResponsiveSize(30);
  if (canvas.height / canvas.width < 0.65) {
    textStartY = canvas.height * 0.25;
    textLineHeight *= 0.8;
  }
  const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
  if (rankings.length === 0) {
    ctx.fillText('Nenhuma pontuação registrada.', canvas.width / 2, textStartY);
  } else {
    rankings.forEach((entry, index) => {
      const text = `${index + 1}. ${entry.country.charAt(0).toUpperCase() + entry.country.slice(1)} - ${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}: ${entry.score} pts (${entry.moves} mov., ${entry.time}s) - ${entry.date}`;
      ctx.fillText(text, canvas.width / 2, textStartY + index * textLineHeight);
    });
  }
  const backButtonWidth = getResponsiveSize(150);
  const backButtonHeight = getResponsiveSize(50);
  const backButtonX = (canvas.width - backButtonWidth) / 2;
  const backButtonY = canvas.height - backButtonHeight - getResponsiveSize(20);
  drawButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 'Voltar', 'backFromCredits', true, 18);
}

function criarParticulasCliqueBotao(x, y, largura, altura, cor = "#0ff") {
  for (let i = 0; i < 15; i++) {
    particulasClique.push({
      x: x + Math.random() * largura,
      y: y + Math.random() * altura,
      r: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      alpha: 1,
      cor: cor
    });
  }
}

function atualizarParticulasClique() {
  for (let i = particulasClique.length - 1; i >= 0; i--) {
    const p = particulasClique[i];
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.05;
    if (p.alpha <= 0) particulasClique.splice(i, 1);
  }
}

function desenharParticulasClique() {
  particulasClique.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(p.cor)},${p.alpha})`;
    ctx.fill();
  });
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

function drawErrorScreen(message) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'red';
  ctx.font = `${getResponsiveSize(30)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function drawLoadingScreen(progress) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = `${getResponsiveSize(40)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const percent = Math.min(100, Math.max(0, Math.floor(progress * 100)));
  ctx.fillText(`Carregando... ${percent}%`, canvas.width / 2, canvas.height * 0.4);

  const barWidth = getResponsiveSize(300);
  const barHeight = getResponsiveSize(30);
  const barX = (canvas.width - barWidth) / 2;
  const barY = canvas.height * 0.5;
  ctx.fillStyle = 'white';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = '#007bff';
  ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
}


    drawMenuBackground();
    drawCoinsCounter();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const mainContainerWidth = getResponsiveSize(320);
    const mainContainerHeight = getResponsiveSize(280);
    const mainContainerX = (canvas.width - mainContainerWidth) / 2;
    const mainContainerY = (canvas.height - mainContainerHeight) / 2 - getResponsiveSize(50);
    
    // Fundo do container principal com um gradiente
    const gradient = ctx.createLinearGradient(mainContainerX, mainContainerY, mainContainerX + mainContainerWidth, mainContainerY + mainContainerHeight);
    gradient.addColorStop(0, '#333');
    gradient.addColorStop(1, '#111');
    ctx.fillStyle = gradient;
    roundRect(ctx, mainContainerX, mainContainerY, mainContainerWidth, mainContainerHeight, 20, true, false);
    
    // Contorno do container
    ctx.strokeStyle = '#4caf50'; // Verde-esmeralda para o contorno
    ctx.lineWidth = 4;
    roundRect(ctx, mainContainerX, mainContainerY, mainContainerWidth, mainContainerHeight, 20, false, true);

function drawAbilitiesScreen() {
    // 1. Fundo da tela
    ctx.fillStyle = '#1A237E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Contador de moedas
    drawCoinsCounter();

    // 3. Título da tela
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `30px 'Press Start 2P'`;
    ctx.fillText("HABILIDADES", canvas.width / 2, canvas.height * 0.2);

    // --- Configurações da habilidade ---
    const bonusTimeAbility = {
        key: 'bonusTime',
        level: window.gameState.abilityLevels.bonusTime || 0,
        xp: window.gameState.abilityLevels.bonusTimeXP || 0,
        xpNeeded: 100,
        maxLevel: 5,
    };
    bonusTimeAbility.cost = (bonusTimeAbility.level + 1) * 10;

    // --- Posições e tamanhos para os elementos centrais ---
    const centralY = canvas.height * 0.35;
    const padding = getResponsiveSize(20);

    // 4. Barra de progresso da habilidade
    const barWidth = getResponsiveSize(300);
    const barHeight = getResponsiveSize(30);
    const barX = (canvas.width - barWidth) / 2;
    const barY = centralY;

    ctx.fillStyle = '#666';
    roundRect(ctx, barX, barY, barWidth, barHeight, 5, true, false);

    const progressWidth = (bonusTimeAbility.xp / bonusTimeAbility.xpNeeded) * barWidth;
    ctx.fillStyle = '#00AA00';
    roundRect(ctx, barX, barY, progressWidth, barHeight, 5, true, false);
    
    // 5. Botão de Evoluir (com a nova fonte)
    const evolveButtonWidth = getResponsiveSize(200);
    const evolveButtonHeight = getResponsiveSize(50);
    const evolveButtonX = (canvas.width - evolveButtonWidth) / 2;
    const evolveButtonY = barY + barHeight + getResponsiveSize(30);

    const canEvolve = window.gameState.playerCoins >= bonusTimeAbility.cost && bonusTimeAbility.level < bonusTimeAbility.maxLevel;
    const buttonColor = canEvolve ? '#00AA00' : '#AA0000';

    drawButton(
        evolveButtonX,
        evolveButtonY,
        evolveButtonWidth,
        evolveButtonHeight,
        "EVOLUIR",
        'evolveAbility',
        canEvolve,
        getResponsiveSize(18),
        buttonColor,
        'Bungee' // <-- Nova fonte para o botão
    );

    // 6. Texto do custo abaixo do botão
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `${getResponsiveSize(18)}px Arial`;
    ctx.fillText(`Custo: ${bonusTimeAbility.cost} 💰`, canvas.width / 2, evolveButtonY + evolveButtonHeight + getResponsiveSize(20));

    // 7. Botão de Voltar
    const backButtonWidth = getResponsiveSize(150);
    const backButtonHeight = getResponsiveSize(50);
    const backButtonX = (canvas.width - backButtonWidth) / 2;
    const backButtonY = canvas.height - backButtonHeight - getResponsiveSize(20);

    drawButton(
        backButtonX,
        backButtonY,
        backButtonWidth,
        backButtonHeight,
        "Voltar",
        'backFromAbilities',
        true,
        getResponsiveSize(15)
    );
}
    
// Adicione esta nova função no final do ficheiro, antes da função render().
function drawAbilitiesTutorialScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';

    const titleSize = getResponsiveSize(40);
    const textSize = getResponsiveSize(25);
    const margin = getResponsiveSize(30);

    ctx.font = `${titleSize}px Arial`;
    ctx.fillText('Bem-vindo às Habilidades!', canvas.width / 2, canvas.height * 0.2);

    ctx.font = `${textSize}px Arial`;
    const tutorialText = [
        "As habilidades dão-lhe poderes únicos para o ajudar a ganhar moedas.",
        "Use as moedas que ganha a jogar para desbloquear ou melhorar os seus poderes.",
        "Ganhe moedas extra em dificuldades mais altas!",
        "O jogo fica mais fácil se souber como e quando usar cada poder."
    ];

    let currentY = canvas.height * 0.35;
    const lineHeight = getResponsiveSize(35);
    tutorialText.forEach(line => {
        ctx.fillText(line, canvas.width / 2, currentY);
        currentY += lineHeight;
    });

    const buttonWidth = getResponsiveSize(180);
    const buttonHeight = getResponsiveSize(60);
    const buttonX = (canvas.width - buttonWidth) / 2;
    const buttonY = canvas.height * 0.8;

    drawButton(buttonX, buttonY, buttonWidth, buttonHeight, 'Continuar', 'tutorialContinue');
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (gameState.screen) {
    case SCREENS.LOADING:
      drawLoadingScreen();
      break;
    case SCREENS.MENU:
      drawMenuScreen();
      break;
    case SCREENS.COUNTRY_SELECT:
      drawCountrySelectScreen();
      break;
    case SCREENS.DIFFICULTY_SELECT:
      drawDifficultySelectScreen();
      break;
    case SCREENS.GAME:
      drawGameScreen();
      break;
    case SCREENS.GAME_OVER:
      drawGameOverScreen();
      break;
    case SCREENS.PAUSE:
      drawPauseScreen();
      break;
    case SCREENS.ABILITIES:
      drawAbilitiesScreen();
      break;
    case SCREENS.SETTINGS:
      drawSettingsScreen();
      break;
    case SCREENS.CREDITS:
      drawCreditsScreen();
      break;
    case SCREENS.ABILITIES_TUTORIAL:
      drawAbilitiesTutorialScreen();
      break;
  }
  // Mover atualização e desenho de partículas de clique para cá
  atualizarParticulasClique();
  desenharParticulasClique();
}

function drawTitle(text, fontSize, y) {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.fillText(text, canvas.width / 2, y);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') radius = { tl: radius, tr: radius, br: radius, bl: radius };
  else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) radius[side] = radius[side] || defaultRadius[side];
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
