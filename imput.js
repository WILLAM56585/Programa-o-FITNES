let mouseX = 0, mouseY = 0;

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
});

canvas.addEventListener('click', (event) => {
  gameState.hasUserInteracted = true;
  handleCanvasClick(event);
});

function resetCountryContainerJumps() {
    if (gameState.containerJumpStates) {
        for (const key in gameState.containerJumpStates) {
            // Assume que os containers de país usam o prefixo 'container_'
            if (key.startsWith('container_')) {
                delete gameState.containerJumpStates[key];
            }
        }
    }
}

function isHovering(x, y, width, height) {
  return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
}

function handleCanvasClick(event) {
  if (gameState.isClickLocked) {
    console.log("Clique bloqueado, aguarde a animação.");
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  mouseX = clickX;
  mouseY = clickY;

  switch (gameState.screen) {
    case SCREENS.MENU:
      {
        const menuButtonWidth = getResponsiveSize(250);
        const menuButtonHeight = getResponsiveSize(60);
        const menuButtonX = (canvas.width - menuButtonWidth) / 2;
        const titleLineHeightMenu = getResponsiveSize(60);
        const totalTitleHeightMenu = titleLineHeightMenu * 2;
        const spaceBetweenTitleAndButtonsMenu = getResponsiveSize(40);
        const startYMenu = (canvas.height - (totalTitleHeightMenu + spaceBetweenTitleAndButtonsMenu + (4 * menuButtonHeight + 3 * getResponsiveSize(20)))) / 2 + totalTitleHeightMenu + spaceBetweenTitleAndButtonsMenu;
        const menuButtonSpacing = getResponsiveSize(20);
        let effectiveMenuButtonSpacing = menuButtonSpacing;
        if (canvas.height / canvas.width < 0.65) effectiveMenuButtonSpacing *= 0.7;

        if (isHovering(menuButtonX, startYMenu, menuButtonWidth, menuButtonHeight)) {
          gameState.buttonJumpStates['play'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
          gameState.isClickLocked = true;
          setTimeout(() => {
            gameState.screen = SCREENS.COUNTRY_SELECT;
            // NOVO: Limpa as animações de entrada dos países
            resetCountryContainerJumps(); 
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
          }, 300);
        } else if (isHovering(menuButtonX, startYMenu + menuButtonHeight + effectiveMenuButtonSpacing, menuButtonWidth, menuButtonHeight)) {
          gameState.buttonJumpStates['settings'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
          gameState.isClickLocked = true;
          setTimeout(() => {
            gameState.screen = SCREENS.SETTINGS;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
          }, 300);
        } else if (isHovering(menuButtonX, startYMenu + 2 * (menuButtonHeight + getResponsiveSize(20)), menuButtonWidth, menuButtonHeight)) {
  gameState.buttonJumpStates['abilities'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
  gameState.isClickLocked = true;
  setTimeout(() => {
    if (!gameState.hasSeenAbilitiesTutorial) {
      gameState.hasSeenAbilitiesTutorial = true;
      gameState.screen = SCREENS.ABILITIES_TUTORIAL;
      saveGameState();
    } else {
      gameState.screen = SCREENS.ABILITIES;
    }
    playSoundEffect(SOUND_EFFECTS.CLICK);
    gameState.isClickLocked = false;
    render();
  }, 300);
} else if (isHovering(menuButtonX, startYMenu + 3 * (menuButtonHeight + effectiveMenuButtonSpacing), menuButtonWidth, menuButtonHeight)) {
          gameState.buttonJumpStates['credits'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
          gameState.isClickLocked = true;
          setTimeout(() => {
            gameState.screen = SCREENS.CREDITS;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
          }, 300);
        }
      }
      break;

    case SCREENS.COUNTRY_SELECT:
      const backButtonWidthCS = getResponsiveSize(150);
      const backButtonHeightCS = getResponsiveSize(50);
      const backButtonXCS = (canvas.width - backButtonWidthCS) / 2;
      const backButtonYCS = canvas.height - backButtonHeightCS - getResponsiveSize(20);

      // 1. Verificar clique no botão de Voltar
      if (isHovering(backButtonXCS, backButtonYCS, backButtonWidthCS, backButtonHeightCS)) {
        gameState.buttonJumpStates['backFromCountrySelect'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        // Chamar a função de partículas, se ela existir
        if (typeof criarParticulasCliqueBotao === 'function') {
            criarParticulasCliqueBotao(backButtonXCS, backButtonYCS, backButtonWidthCS, backButtonHeightCS);
        }
        gameState.isClickLocked = true;
        setTimeout(() => {
          gameState.screen = SCREENS.MENU;
          playSoundEffect(SOUND_EFFECTS.CLICK);
          playBackgroundMusic('./assets/audio/musica-menu.ogg');
          gameState.isClickLocked = false;
          render();
        }, 300);
        return; // <--- ADICIONADO: Sai da função após o clique no botão Voltar
      }

      // 2. Verificar cliques nos países
      const countryKeys = Object.keys(window.playersData);
      const buttonHeight = getResponsiveSize(80);
      const buttonSpacing = getResponsiveSize(20);
      const startY = (canvas.height - (countryKeys.length * buttonHeight + (countryKeys.length - 1) * buttonSpacing)) / 2;
      const quadWidth = getResponsiveSize(70);
      const rectWidth = getResponsiveSize(250);
      const totalButtonWidth = quadWidth + getResponsiveSize(20) + rectWidth;

      for (let index = 0; index < countryKeys.length; index++) {
        const countryKey = countryKeys[index];
        const isUnlocked = gameState.unlockedCountries.includes(countryKey);
        const y = startY + index * (buttonHeight + buttonSpacing);
        const x = (canvas.width - totalButtonWidth) / 2;

        if (isHovering(x, y, totalButtonWidth, buttonHeight)) {
          // Chamar a função de partículas, se ela existir
          if (typeof criarParticulasCliqueBotao === 'function') {
              criarParticulasCliqueBotao(x, y, totalButtonWidth, buttonHeight);
          }
          
          if (isUnlocked) {
            gameState.containerJumpStates[`container_${countryKey}`] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            gameState.isClickLocked = true;
            setTimeout(() => {
              gameState.currentCountry = countryKey;
              gameState.screen = SCREENS.DIFFICULTY_SELECT;
              playSoundEffect(SOUND_EFFECTS.CLICK);
              gameState.isClickLocked = false;
              render();
            }, 300);
          } else {
            playSoundEffect(SOUND_EFFECTS.UPGRADE_FAIL);
            console.log(`País ${countryKey} está bloqueado!`);
          }
          return; // <--- ADICIONADO: Sai da função após clicar no país
        }
      }
      break;

case SCREENS.DIFFICULTY_SELECT:
      const backButtonWidthDS = getResponsiveSize(150);
      const backButtonHeightDS = getResponsiveSize(50);
      const backButtonXDS = (canvas.width - backButtonWidthDS) / 2;
      let startYDS = canvas.height * 0.3;
      if (canvas.height / canvas.width < 0.65) startYDS = canvas.height * 0.25;
      const buttonHeightDS = getResponsiveSize(50);
      const buttonSpacingDS = getResponsiveSize(20);
      let effectiveButtonSpacingDS = buttonSpacingDS;
      if (canvas.height / canvas.width < 0.65) effectiveButtonSpacingDS *= 0.7;

      const lastDifficultyY = startYDS + 2 * (buttonHeightDS + effectiveButtonSpacingDS);
      const backButtonYDS = lastDifficultyY + getResponsiveSize(80);

      // 1. Verificar clique no botão de Voltar
      if (isHovering(backButtonXDS, backButtonYDS, backButtonWidthDS, backButtonHeightDS)) {
        gameState.buttonJumpStates['backFromDifficultySelect'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        gameState.isClickLocked = true;
        setTimeout(() => {
          gameState.screen = SCREENS.COUNTRY_SELECT;
          // NOVO: Limpa as animações de entrada dos países
          resetCountryContainerJumps();
          playSoundEffect(SOUND_EFFECTS.CLICK);
          gameState.isClickLocked = false;
          render();
        }, 300);
        return; // Sai da função após o clique
      }

      // 2. Verificar clique nas dificuldades (Usando 'for' para permitir 'return')
      const buttonWidthDS = getResponsiveSize(200);
      const buttonXDS = (canvas.width - buttonWidthDS) / 2;
      const difficultiesDS = ['easy', 'medium', 'hard'];
      const unlockedForCountryDS = gameState.unlockedDifficulties[gameState.currentCountry] || [];

      for (let index = 0; index < difficultiesDS.length; index++) {
        const difficulty = difficultiesDS[index];
        const isUnlocked = unlockedForCountryDS.includes(difficulty);
        const y = startYDS + index * (buttonHeightDS + effectiveButtonSpacingDS);
        
        if (isHovering(buttonXDS, y, buttonWidthDS, buttonHeightDS) && isUnlocked) {
          gameState.buttonJumpStates[difficulty] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
          gameState.isClickLocked = true;
          setTimeout(() => {
            gameState.currentDifficulty = difficulty;
            window.gameLogic.initGame();
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
          }, 300);
          return; // <--- ADICIONADO: Sai da função após o clique
        }
      }
      break

    case SCREENS.GAME:
      {
        const menuButtonWidth = getResponsiveSize(50);
        const menuButtonHeight = getResponsiveSize(50);
        const menuButtonX = getResponsiveSize(20);
        const menuButtonY = canvas.height - menuButtonHeight - getResponsiveSize(20);
        if (isHovering(menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight)) {
          gameState.buttonJumpStates['toggleMenu'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
          gameState.isClickLocked = true;
          setTimeout(() => {
            gameState.screen = SCREENS.PAUSE;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
          }, 300);
        }

        if (gameState.isClickLocked) {
          console.log("Clique bloqueado, aguarde o processamento das cartas.");
          return;
        }

        for (const card of gameState.cards) {
          if (isHovering(card.x, card.y, card.width, card.height) && !card.isFlipped && !card.isMatched && !card.isFlipping) {
            card.isFlipping = true;
            card.flipProgress = 0;
            card.flipDirection = 1;
            gameState.flippedCards.push(card);
            gameState.moves++;
            playSoundEffect(SOUND_EFFECTS.FLIP);
            if (gameState.flippedCards.length === 2) {
              gameState.isClickLocked = true;
              setTimeout(window.gameLogic.checkMatch, 1000);
            }
            break;
          }
        }
      }
      break;

case SCREENS.ABILITIES_TUTORIAL:
    const tutorialContinueButtonWidth = getResponsiveSize(180);
    const tutorialContinueButtonHeight = getResponsiveSize(60);
    const tutorialContinueButtonX = (canvas.width - tutorialContinueButtonWidth) / 2;
    const tutorialContinueButtonY = canvas.height * 0.8;
    
    if (isHovering(tutorialContinueButtonX, tutorialContinueButtonY, tutorialContinueButtonWidth, tutorialContinueButtonHeight)) {
        gameState.buttonJumpStates['tutorialContinue'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        gameState.isClickLocked = true;
        setTimeout(() => {
            gameState.screen = SCREENS.ABILITIES;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
        }, 300);
    }
    break;

    case SCREENS.GAME_OVER:
      {
        const gameOverButtonWidth = getResponsiveSize(200);
        const gameOverButtonHeight = getResponsiveSize(50);
        const gameOverButtonX = (canvas.width - gameOverButtonWidth) / 2;
        const titleY = canvas.height * 0.3;
        const timeY = titleY + (gameState.matchedCards.length === gameState.cards.length ? getResponsiveSize(60) : getResponsiveSize(120));
        let gameOverButtonY = timeY + getResponsiveSize(80);

        if (gameState.matchedCards.length === gameState.cards.length) {
          if (isHovering(gameOverButtonX, gameOverButtonY, gameOverButtonWidth, gameOverButtonHeight)) {
    gameState.buttonJumpStates['backFromGameOver'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
    gameState.isClickLocked = true;
    setTimeout(() => {
        window.gameLogic.resetGame();
        gameState.screen = SCREENS.MENU;
        playSoundEffect(SOUND_EFFECTS.CLICK);
        gameState.isClickLocked = false;
        render();
    }, 300);

          } else if (isHovering(gameOverButtonX, gameOverButtonY + gameOverButtonHeight + getResponsiveSize(20), gameOverButtonWidth, gameOverButtonHeight)) {
            gameState.buttonJumpStates['continueGameOver'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            gameState.isClickLocked = true;
            setTimeout(() => {
              const difficulties = ['easy', 'medium', 'hard'];
              const currentDifficultyIndex = difficulties.indexOf(gameState.currentDifficulty);
              if (currentDifficultyIndex < difficulties.length - 1) {
                const nextDifficulty = difficulties[currentDifficultyIndex + 1];
                if (gameState.unlockedDifficulties[gameState.currentCountry]?.includes(nextDifficulty)) {
                  gameState.currentDifficulty = nextDifficulty;
                  window.gameLogic.initGame();
                } else {
                  gameState.screen = SCREENS.DIFFICULTY_SELECT;
                }
              } else {
                gameState.screen = SCREENS.COUNTRY_SELECT;
              }
              playSoundEffect(SOUND_EFFECTS.CLICK);
              gameState.isClickLocked = false;
              render();
            }, 300);
          }
        } else {
    if (isHovering(gameOverButtonX, gameOverButtonY, gameOverButtonWidth, gameOverButtonHeight)) {
        gameState.buttonJumpStates['backFromGameOver'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        gameState.isClickLocked = true;
        setTimeout(() => {
            gameState.screen = SCREENS.MENU;
            playSoundEffect(SOUND_EFFECTS.CLICK);
            gameState.isClickLocked = false;
            render();
        }, 300);
    }

        }
      }
      break;

    case SCREENS.PAUSE:
  const pauseButtonWidthPause = getResponsiveSize(250);
  const pauseButtonHeightPause = getResponsiveSize(60);
  const pauseButtonX = (canvas.width - pauseButtonWidthPause) / 2;
  const pauseStartY = canvas.height * 0.45;
  const pauseButtonSpacing = getResponsiveSize(20);

  if (isHovering(pauseButtonX, pauseStartY, pauseButtonWidthPause, pauseButtonHeightPause)) {
    gameState.buttonJumpStates['resume'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
    gameState.isClickLocked = true;
    setTimeout(() => {
      gameState.timerInterval = setInterval(window.gameLogic.updateTimer, 1000);
      playBackgroundMusic(window.playersData[gameState.currentCountry]?.gameMusic || './assets/audio/musica-menu.ogg');
      gameState.screen = SCREENS.GAME;
      playSoundEffect(SOUND_EFFECTS.CLICK);
      gameState.isClickLocked = false;
      render();
    }, 300);
  } else if (isHovering(pauseButtonX, pauseStartY + pauseButtonHeightPause + pauseButtonSpacing, pauseButtonWidthPause, pauseButtonHeightPause)) {
    gameState.buttonJumpStates['menuFromPause'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
    gameState.isClickLocked = true;
    setTimeout(() => {
      clearInterval(gameState.timerInterval);
      stopBackgroundMusic();
      playBackgroundMusic('./assets/audio/musica-menu.ogg');
      window.gameLogic.resetGame(); // Adicione esta linha
      gameState.screen = SCREENS.MENU;
      playSoundEffect(SOUND_EFFECTS.CLICK);
      gameState.isClickLocked = false;
      render();
    }, 300);
  } else if (isHovering(pauseButtonX, pauseStartY + 2 * (pauseButtonHeightPause + pauseButtonSpacing), pauseButtonWidthPause, pauseButtonHeightPause)) {
    gameState.buttonJumpStates['settingsFromPause'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
    gameState.isClickLocked = true;
    setTimeout(() => {
      gameState.screen = SCREENS.SETTINGS;
      playSoundEffect(SOUND_EFFECTS.CLICK);
      gameState.isClickLocked = false;
      render();
    }, 300);
  }
  break;

  case SCREENS.ABILITIES:
      {
        const backButtonWidth = getResponsiveSize(150);
        const backButtonHeight = getResponsiveSize(50);
        const backButtonX = (canvas.width - backButtonWidth) / 2;
        const backButtonY = canvas.height - backButtonHeight - getResponsiveSize(20);

        if (isHovering(backButtonX, backButtonY, backButtonWidth, backButtonHeight)) {
            gameState.buttonJumpStates['backFromAbilities'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            gameState.isClickLocked = true;
            setTimeout(() => {
                gameState.screen = SCREENS.MENU;
                playSoundEffect(SOUND_EFFECTS.CLICK);
                gameState.isClickLocked = false;
                render();
            }, 300);
        }

        const evolveButtonWidth = getResponsiveSize(200);
        const evolveButtonHeight = getResponsiveSize(50);
        const evolveButtonX = (canvas.width - evolveButtonWidth) / 2;
        const evolveButtonY = canvas.height * 0.4 + getResponsiveSize(150) + getResponsiveSize(30);

        const level = window.gameState.abilityLevels.bonusTime || 0;
        const cost = (level + 1) * 10;
        const maxLevel = 5;
        const canEvolve = window.gameState.playerCoins >= cost && level < maxLevel;

        if (isHovering(evolveButtonX, evolveButtonY, evolveButtonWidth, evolveButtonHeight)) {
            gameState.buttonJumpStates['evolveAbility'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
            gameState.isClickLocked = true;
            if (canEvolve) {
                setTimeout(() => {
                    window.gameState.playerCoins -= cost;
                    window.gameState.abilityLevels.bonusTime += 1;
                    // Adicionando um valor de XP para demonstrar a barra de progresso
                    window.gameState.abilityLevels.bonusTimeXP = (window.gameState.abilityLevels.bonusTimeXP || 0) + 20; 
                    window.saveGameState();
                    playSoundEffect(SOUND_EFFECTS.UPGRADE_SUCCESS);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            } else {
                setTimeout(() => {
                    playSoundEffect(SOUND_EFFECTS.UPGRADE_FAIL);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            }
        }
      }
      break;

    case SCREENS.SETTINGS:
        {
            const settingsButtonWidth = getResponsiveSize(250);
            const settingsButtonHeight = getResponsiveSize(60);
            const settingsButtonX = (canvas.width - settingsButtonWidth) / 2;
            let settingsStartY = canvas.height * 0.4;
            if (canvas.height / canvas.width < 0.65) settingsStartY = canvas.height * 0.35;
            const buttonSpacing = getResponsiveSize(20);
            let effectiveSettingsButtonSpacing = buttonSpacing;
            if (canvas.height / canvas.width < 0.65) effectiveSettingsButtonSpacing *= 0.7;

            const toggleMusicX = settingsButtonX;
            const toggleMusicY = settingsStartY;
            const toggleMusicWidth = settingsButtonWidth;
            const toggleMusicHeight = settingsButtonHeight;

            const toggleSfxX = settingsButtonX;
            const toggleSfxY = settingsStartY + settingsButtonHeight + effectiveSettingsButtonSpacing;
            const toggleSfxWidth = settingsButtonWidth;
            const toggleSfxHeight = settingsButtonHeight;

            const backButtonWidth = getResponsiveSize(150);
            const backButtonHeight = getResponsiveSize(50);
            const backButtonX = (canvas.width - backButtonWidth) / 2;
            const backButtonY = settingsStartY + 2 * (settingsButtonHeight + effectiveSettingsButtonSpacing) + getResponsiveSize(20);

            if (isHovering(toggleMusicX, toggleMusicY, toggleMusicWidth, toggleMusicHeight)) {
                gameState.buttonJumpStates['toggleMusic'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.musicEnabled = !gameState.musicEnabled;
                    if (gameState.musicEnabled) {
                        playBackgroundMusic(window.playersData[gameState.currentCountry].gameMusic);
                    } else {
                        if (gameState.backgroundMusic) {
                            gameState.backgroundMusic.pause();
                        }
                    }
                    window.playSoundEffect(SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            } else if (isHovering(toggleSfxX, toggleSfxY, toggleSfxWidth, toggleSfxHeight)) {
                gameState.buttonJumpStates['toggleSfx'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.sfxEnabled = !gameState.sfxEnabled;
                    window.playSoundEffect(SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            } else if (isHovering(backButtonX, backButtonY, backButtonWidth, backButtonHeight)) {
                gameState.buttonJumpStates['backFromSettings'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
                gameState.isClickLocked = true;
                setTimeout(() => {
                    gameState.screen = SCREENS.MENU;
                    window.playSoundEffect(SOUND_EFFECTS.CLICK);
                    gameState.isClickLocked = false;
                    render();
                }, 300);
            }
        }
        break;

    case SCREENS.CREDITS:
      const backButtonWidthCredits = getResponsiveSize(150);
      const backButtonHeightCredits = getResponsiveSize(50);
      const backButtonXCredits = (canvas.width - backButtonWidthCredits) / 2;
      const backButtonYCredits = canvas.height - backButtonHeightCredits - getResponsiveSize(20);
      if (isHovering(backButtonXCredits, backButtonYCredits, backButtonWidthCredits, backButtonHeightCredits)) {
        gameState.buttonJumpStates['backFromCredits'] = { jumpProgress: 0, isJumping: true, jumpDirection: 1 };
        gameState.isClickLocked = true;
        setTimeout(() => {
          gameState.screen = SCREENS.MENU;
          playSoundEffect(SOUND_EFFECTS.CLICK);
          gameState.isClickLocked = false;
          render();
        }, 300);
      }
      break;
  }
                   }
