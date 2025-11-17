window.gameLogic = window.gameLogic || {};

// NOVO: Adiciona a lógica para salvar o estado de uma partida em andamento.
window.gameLogic.saveGameInProgress = function() {
  const gameData = {
    screen: window.gameState.screen,
    cards: window.gameState.cards,
    flippedCards: window.gameState.flippedCards.map(card => card.id),
    matchedCards: window.gameState.matchedCards.map(card => card.id),
    moves: window.gameState.moves,
    time: window.gameState.time,
    currentCountry: window.gameState.currentCountry,
    currentDifficulty: window.gameState.currentDifficulty,
    timer: window.gameState.timer
  };
  localStorage.setItem('gameInProgress', JSON.stringify(gameData));
  console.log("Partida em andamento salva.");
};

// NOVO: Adiciona a lógica para carregar uma partida em andamento.
window.gameLogic.loadGameInProgress = function() {
  const savedGame = localStorage.getItem('gameInProgress');
  if (savedGame) {
    try {
      const gameData = JSON.parse(savedGame);

      // Reconstitui o estado do jogo
      window.gameState.screen = gameData.screen;
      // Reconstitui o array de cartas
      window.gameState.cards = gameData.cards.map((cardData, index) => {
        return {
          ...cardData,
          id: cardData.id || index // Adiciona um ID se não existir
        };
      });
      // Reconstitui as cartas viradas e combinadas usando os IDs
      window.gameState.flippedCards = gameData.flippedCards.map(id => window.gameState.cards.find(card => card.id === id)).filter(card => card);
      window.gameState.matchedCards = gameData.matchedCards.map(id => window.gameState.cards.find(card => card.id === id)).filter(card => card);
      window.gameState.moves = gameData.moves;
      window.gameState.time = gameData.time;
      window.gameState.currentCountry = gameData.currentCountry;
      window.gameState.currentDifficulty = gameData.currentDifficulty;
      window.gameState.timer = gameData.timer;

      console.log('Partida em andamento carregada com sucesso!');
      return true;
    } catch (e) {
      console.error('Erro ao carregar partida salva:', e);
      localStorage.removeItem('gameInProgress');
      return false;
    }
  }
  return false;
};

window.gameLogic.resetGame = function() {
  window.gameState.cards = [];
  window.gameState.flippedCards = [];
  window.gameState.matchedCards = [];
  window.gameState.moves = 0;
  window.gameState.time = 0;
  window.gameState.timer = null;
  window.gameState.currentCountry = null;
  window.gameState.currentDifficulty = null;
  localStorage.removeItem('gameInProgress');
  console.log("Partida reiniciada e dados salvos removidos.");
};


window.gameLogic.initGame = function() {
  const hasSavedGame = window.gameLogic.loadGameInProgress();

  if (!hasSavedGame) {
    clearInterval(window.gameState.timerInterval);
    window.gameState.cards = [];
    window.gameState.flippedCards = [];
    window.gameState.matchedCards = [];
    window.gameState.moves = 0;
    window.gameState.time = 0;
    window.gameState.timer = 0;
    window.gameState.isClickLocked = false;
  
    switch (window.gameState.currentDifficulty) {
      case 'easy': 
        window.gameState.timer = 45; 
        break;
      case 'medium': 
        window.gameState.timer = 30; 
        break;
      case 'hard': 
        window.gameState.timer = 75;
        break;
      default: 
        window.gameState.timer = 45;
    }
    window.gameState.timerInterval = setInterval(window.gameLogic.updateTimer, 1000);
  
    window.stopBackgroundMusic();
    window.playBackgroundMusic(window.playersData[window.gameState.currentCountry]?.gameMusic || './assets/audio/musica-menu.ogg');
  
    window.gameLogic.createCards();
    window.gameState.screen = window.SCREENS.GAME;
  } else {
    clearInterval(window.gameState.timerInterval);
    window.gameState.timerInterval = setInterval(window.gameLogic.updateTimer, 1000);
    window.gameState.screen = window.SCREENS.GAME;
  }
  
  window.removeEventListener('beforeunload', window.gameLogic.saveGameInProgress);
  window.addEventListener('beforeunload', window.gameLogic.saveGameInProgress);
};


window.gameLogic.updateTimer = function() {
  if (window.gameState.screen !== window.SCREENS.GAME) return;
  if (window.gameState.timer > 0) {
    window.gameState.timer--;
    window.gameState.time++;
  }
  if (window.gameState.timer <= 0) {
    clearInterval(window.gameState.timerInterval);
    window.playSoundEffect(window.SOUND_EFFECTS.LOSE); // Som de derrota
    window.gameState.screen = window.SCREENS.GAME_OVER;
    window.stopBackgroundMusic();
    window.gameState.isClickLocked = false;
    localStorage.removeItem('gameInProgress');
  }
  window.render();
};

window.gameLogic.createCards = function() {
  const country = window.playersData[window.gameState.currentCountry];
  if (!country) {
    console.error(`País ${window.gameState.currentCountry} não encontrado em playersData.`);
    return;
  }
  let imagesForDifficulty = [...(country[window.gameState.currentDifficulty] || [])];
  let numPairs, cols, rows;

  if (!window.gameState.imageUsageCount[window.gameState.currentCountry]?.[window.gameState.currentDifficulty]) {
    window.gameState.imageUsageCount[window.gameState.currentCountry] = window.gameState.imageUsageCount[window.gameState.currentCountry] || {};
    window.gameState.imageUsageCount[window.gameState.currentCountry][window.gameState.currentDifficulty] = {};
    imagesForDifficulty.forEach(img => {
      window.gameState.imageUsageCount[window.gameState.currentCountry][window.gameState.currentDifficulty][img] = 0;
    });
  }

  for (let i = imagesForDifficulty.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [imagesForDifficulty[i], imagesForDifficulty[j]] = [imagesForDifficulty[j], imagesForDifficulty[i]];
  }

  switch (window.gameState.currentDifficulty) {
    case 'easy': 
      numPairs = 8; 
      cols = 4; 
      rows = 4; 
      break;
    case 'medium': 
      numPairs = 10; 
      cols = 5; 
      rows = 4; 
      break;
    case 'hard': 
      numPairs = 15;
      cols = 6; 
      rows = 5;
      break;
    default: 
      numPairs = 8; 
      cols = 4; 
      rows = 4;
  }

  if (imagesForDifficulty.length < numPairs) {
    console.warn(`Imagens insuficientes para ${numPairs} pares na dificuldade ${window.gameState.currentDifficulty}. Usando ${imagesForDifficulty.length} pares.`);
    numPairs = imagesForDifficulty.length;
  }

  let selectedImages = imagesForDifficulty.slice(0, numPairs);
  selectedImages.forEach(img => {
    window.gameState.imageUsageCount[window.gameState.currentCountry][window.gameState.currentDifficulty][img]++;
  });
  window.saveGameState();

  let cardsData = [...selectedImages, ...selectedImages];
  for (let i = cardsData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardsData[i], cardsData[j]] = [cardsData[j], cardsData[i]];
  }

  // Ajustar cardSpacing para telas menores
  let cardSpacing = window.canvas.width < 600 ? 10 : 15;
  const availableWidth = window.canvas.width * (1 - window.CANVAS_MARGIN_X_PERCENT * 2);
  const availableHeight = window.canvas.height * (1 - window.CANVAS_MARGIN_Y_PERCENT * 2);

  let cardWidth = (availableWidth - (cols - 1) * cardSpacing) / cols;
  let cardHeight = cardWidth / window.CARD_ASPECT_RATIO;

  if (cardHeight * rows + (rows - 1) * cardSpacing > availableHeight) {
    cardHeight = (availableHeight - (rows - 1) * cardSpacing) / rows;
    cardWidth = cardHeight * window.CARD_ASPECT_RATIO;
  }

  const maxCardDimension = Math.min(window.canvas.width, window.canvas.height) * 0.18;
  if (cardWidth > maxCardDimension) {
    cardWidth = maxCardDimension;
    cardHeight = cardWidth / window.CARD_ASPECT_RATIO;
  }

  const totalGridWidth = cols * cardWidth + (cols - 1) * cardSpacing;
  const totalGridHeight = rows * cardHeight + (rows - 1) * cardSpacing;

  const startX = (window.canvas.width - totalGridWidth) / 2;
  const startY = window.CANVAS_MARGIN_Y_PERCENT * window.canvas.height;

  window.gameState.cards = cardsData.map((imagePath, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = startX + col * (cardWidth + cardSpacing);
    const y = startY + row * (cardHeight + cardSpacing);
    return { imagePath, x, y, width: cardWidth, height: cardHeight, isFlipped: false, isMatched: false, isFlipping: false, flipProgress: 0, flipDirection: 1, id: index }; // Adicionado ID para facilitar o salvamento
  });
};

window.gameLogic.handleCardClick = function(x, y) {
  if (window.gameState.isClickLocked || window.gameState.screen !== window.SCREENS.GAME) {
    return;
  }
  const card = window.gameState.cards.find(c =>
    x > c.x && x < c.x + c.width && y > c.y && y < c.y + c.height
  );

  if (card && !card.isFlipped && !card.isMatched && window.gameState.flippedCards.length < 2) {
    card.isFlipped = true;
    card.isFlipping = true;
    card.flipProgress = 0;
    card.flipDirection = 1;
    window.gameState.flippedCards.push(card);
    window.playSoundEffect(window.SOUND_EFFECTS.FLIP);
    window.gameState.moves++;
    window.gameLogic.saveGameInProgress();

    if (window.gameState.flippedCards.length === 2) {
      window.gameState.isClickLocked = true;
      setTimeout(() => {
        window.gameLogic.checkMatch();
      }, 1000);
    }
  }
};

function getAbilityCost(currentLevel) {
    return 5 * (currentLevel + 1);
}

window.gameLogic.checkMatch = function() {
    if (window.gameState.flippedCards.length < 2) return;
    const [card1, card2] = window.gameState.flippedCards;
    if (card1.imagePath === card2.imagePath) {
        card1.isMatched = card2.isMatched = true;
        window.gameState.matchedCards.push(card1, card2);
        window.playSoundEffect(window.SOUND_EFFECTS.MATCH);
        window.gameState.timer += 3;
        window.gameState.flippedCards = [];
        if (window.gameState.matchedCards.length === window.gameState.cards.length) {
            clearInterval(window.gameState.timerInterval);
            const score = 1000 - (window.gameState.moves * 10 + window.gameState.time);
            const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
            const currentDate = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            rankings.push({
                country: window.gameState.currentCountry,
                difficulty: window.gameState.currentDifficulty,
                score: score,
                moves: window.gameState.moves,
                time: window.gameState.time,
                date: currentDate
            });
            if (window.gameState.abilityLevels.bonusTime > 0) {
                window.gameState.time += window.gameState.abilityLevels.bonusTime;
                console.log(`Habilidade ativa: +${window.gameState.abilityLevels.bonusTime}s de tempo!`);
            }
            rankings.sort((a, b) => b.score - a.score);
            if (rankings.length > 10) rankings.length = 10;
            localStorage.setItem('rankings', JSON.stringify(rankings));

            switch (window.gameState.currentDifficulty) {
                case 'easy':
                    window.gameState.playerCoins += 5;
                    console.log('Você completou a dificuldade Fácil e ganhou 5 moedas!');
                    break;
                case 'medium':
                    window.gameState.playerCoins += 10;
                    console.log('Você completou a dificuldade Média e ganhou 10 moedas!');
                    break;
                case 'hard':
                    window.gameState.playerCoins += 15;
                    console.log('Você completou a dificuldade Difícil e ganhou 15 moedas!');
                    break;
            }
            window.saveGameState();

            setTimeout(() => {
                window.playSoundEffect(window.SOUND_EFFECTS.COIN_GAIN);
                window.playSoundEffect(window.SOUND_EFFECTS.WIN);
                window.gameState.screen = window.SCREENS.GAME_OVER;
                window.stopBackgroundMusic();
                window.playBackgroundMusic('./assets/audio/musica-menu.ogg');
                window.gameState.isClickLocked = false;
                localStorage.removeItem('gameInProgress');
                const difficulties = ['easy', 'medium', 'hard'];
                const currentDifficultyIndex = difficulties.indexOf(window.gameState.currentDifficulty);
                if (currentDifficultyIndex < difficulties.length - 1) {
                    const nextDifficulty = difficulties[currentDifficultyIndex + 1];
                    if (!window.gameState.unlockedDifficulties[window.gameState.currentCountry]) {
                        window.gameState.unlockedDifficulties[window.gameState.currentCountry] = ['easy'];
                    }
                    if (!window.gameState.unlockedDifficulties[window.gameState.currentCountry].includes(nextDifficulty)) {
                        window.gameState.unlockedDifficulties[window.gameState.currentCountry].push(nextDifficulty);
                        window.saveUnlockedDifficulties();
                        console.log(`Dificuldade ${nextDifficulty} desbloqueada para ${window.gameState.currentCountry}!`);
                    }
                } else {
                    const countryKeys = Object.keys(window.playersData);
                    const currentCountryIndex = countryKeys.indexOf(window.gameState.currentCountry);
                    if (currentCountryIndex < countryKeys.length - 1) {
                        const nextCountry = countryKeys[currentCountryIndex + 1];
                        if (!window.gameState.unlockedCountries.includes(nextCountry)) {
                            window.gameState.unlockedCountries.push(nextCountry);
                            window.saveUnlockedCountries();
                            console.log(`País ${nextCountry} desbloqueado!`);
                        }
                    }
                }
            }, 2000);
        } else {
            window.gameState.isClickLocked = false;
        }
    } else {
        // Esta é a parte corrigida, onde a linha extra foi removida.
        window.playSoundEffect(window.SOUND_EFFECTS.MISMATCH);
        card1.flipDirection = card2.flipDirection = -1;
        card1.isFlipping = card2.isFlipping = true;
        card1.flipProgress = card2.flipProgress = 0;
        window.gameState.flippedCards = [];
        window.gameState.isClickLocked = false;
    }
};
window.gameLogic.resetJumpStates = function() {
    window.gameState.containerJumpStates = {};
    window.gameState.buttonJumpStates = {};
};
