console.log('canvasutils.js carregado');

function getResponsiveSize(baseSize, referenceWidth = 400) {
  // === CORREÇÃO: Implementa um limite máximo de zoom ===
  const maxScaleFactor = 1.8; // Permite que o jogo seja no máximo 1.8x maior que o design original (ajustável)

  // Fator de escala inicial baseado na largura do canvas
  let scaleFactor = canvas.width / referenceWidth; 
  
  // Limita o fator de escala para evitar o "zoom" em monitores grandes
  scaleFactor = Math.min(scaleFactor, maxScaleFactor); 
  
  // Mantém a lógica original para telas muito estreitas/horizontais
  if (canvas.height / canvas.width < 0.65) scaleFactor *= 0.9;

  let size = baseSize * scaleFactor;
  return Math.max(size, 20); // Garante um tamanho mínimo
}

function drawButton(x, y, width, height, text, buttonId, isEnabled = true, fontSize, customColor = null, cornerRadius = 15, customFont = 'Bungee') {
  const anim = gameState.buttonJumpStates[buttonId] || { jumpProgress: 0, isJumping: false, jumpDirection: 1 };
  const jumpFactor = anim.jumpProgress < 0.5 ? anim.jumpProgress * 0.2 : (1 - anim.jumpProgress) * 0.2;
  const scaleY = 1 + (anim.jumpDirection === 1 ? jumpFactor : -jumpFactor);
  const translateY = -height * jumpFactor * (anim.jumpDirection === 1 ? 1 : -1);

  ctx.save();
  ctx.translate(x + width / 2, y + height / 2 + translateY);
  ctx.scale(1, scaleY);
  ctx.translate(-(x + width / 2), -(y + height / 2));

  // 1. Definição do Preenchimento (Gradiente - mantido uniforme pelo screenrenderers.js)
  let fillStyle;
  const defaultColors = ['#ff8a00', '#e52e71'];
  const colors = (Array.isArray(customColor) && customColor.length === 2) ? customColor : defaultColors;
  
  if (Array.isArray(colors) && colors.length === 2) {
      const grad = ctx.createLinearGradient(x, y, x + width, y); 
      grad.addColorStop(0, isEnabled ? colors[0] : '#555');
      grad.addColorStop(1, isEnabled ? colors[1] : '#444');
      fillStyle = grad;
  } else {
      fillStyle = isEnabled ? (customColor || '#007bff') : '#555';
  }

  // 2. Desenhar a Sombra do Container (para profundidade)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;
  
  ctx.fillStyle = fillStyle;
  window.roundRect(ctx, x, y, width, height, cornerRadius, true, false);

  ctx.restore(); // Restaura a sombra do container

  // 3. Texto (Sombra Suave e Simples)
  
  // 3.1 Configuração da Fonte
  // A fonte é maior (26px) para ajudar na leitura.
  ctx.font = `bold ${fontSize ? getResponsiveSize(fontSize) : getResponsiveSize(26)}px ${customFont}`; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textX = x + width / 2;
  const textY = y + height / 2;

  // 3.2 Sombra CLÁSSICA (Suave e Sutil)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'; // Preto semi-transparente
  ctx.shadowBlur = getResponsiveSize(1.5); // Muito suave
  ctx.shadowOffsetX = getResponsiveSize(1);
  ctx.shadowOffsetY = getResponsiveSize(1);
  
  // 3.3 Desenha o Texto Principal
  ctx.fillStyle = "#FFFFFF"; // Branco Puro (garante o contraste)
  ctx.fillText(text, textX, textY);

  // 3.4 CRUCIAL: Reseta a sombra do contexto
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.restore(); // Restaura a transformação de salto
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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    var lines = [];
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    lines.forEach((l, i) => {
        ctx.fillText(l.trim(), x, y + i * lineHeight);
    });
    return lines.length * lineHeight; // Retorna altura total para layout
}

// Função para atualizar a animação de "salto" dos botões
function updateContainerJump() {
  for (const key in gameState.buttonJumpStates) {
    const anim = gameState.buttonJumpStates[key];
    if (anim.isJumping) {
      anim.jumpProgress += anim.jumpDirection * 0.05;
      if (anim.jumpProgress >= 1 || anim.jumpProgress <= 0) {
        anim.jumpDirection *= -1;
      }
      if (anim.jumpProgress <= 0 && anim.jumpDirection === -1) {
        anim.isJumping = false;
        anim.jumpProgress = 0;
      }
    }
  }
}
