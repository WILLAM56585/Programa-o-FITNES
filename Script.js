function nextSection(sectionId) {
    const sections = document.querySelectorAll('.container');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(`section-${sectionId}`).style.display = 'block';
    
    // Atualiza a barra de progresso global
    updateProgressBar(sectionId, 24);
    
    // Rola para o topo
    window.scrollTo({top: 0, behavior: 'smooth'});
    
    // Se for a seção 23, anima os passos
    if (sectionId == 23) {
        animateProgressSteps();
    }
    
    // Se for a seção 24, inicia o countdown
    if (sectionId == 24) {
        startCountdown();
    }
}

function updateProgressBar(currentStep, totalSteps) {
    const progress = document.getElementById('global-progress');
    const percentage = (currentStep / totalSteps) * 100;
    progress.style.width = `${percentage}%`;
}

function animateProgressSteps() {
    const steps = document.querySelectorAll('.progress-circle');
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.style.backgroundColor = '#4CAF50';
            step.style.color = 'white';
            step.style.borderColor = '#4CAF50';
        }, 500 * (index + 1));
    });
}

function startCountdown() {
    let minutes = 49;
    let seconds = 59;
    
    const countdownElement = document.getElementById('countdown');
    
    const timer = setInterval(() => {
        countdownElement.textContent = `Oferta disponível por: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} minutos`;
        
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(timer);
            } else {
                minutes--;
                seconds = 59;
            }
        } else {
            seconds--;
        }
    }, 1000);
}

function validateWeight() {
    const weightInput = document.getElementById('weight-input');
    const weight = parseInt(weightInput.value);
    const errorMessage = document.getElementById('error-message');
    
    if (weight >= 40 && weight <= 200) {
        errorMessage.style.display = 'none';
        sessionStorage.setItem('currentWeight', weight);
        nextSection(3);
        
        // Define o máximo do slider com base no peso atual
        const pesoSlider = document.getElementById('pesoSlider');
        pesoSlider.max = Math.min(130, weight);
        pesoSlider.value = Math.max(40, weight - 10); // Sugere uma meta 10kg abaixo
        updatePesoValue(pesoSlider.value);
    } else {
        errorMessage.style.display = 'block';
    }
}

function updatePesoValue(value) {
    document.getElementById('pesoValue').textContent = value;
}

function toggleSelection(card) {
    const noneCard = document.querySelector('.card.none');
    
    if (noneCard.classList.contains('selected')) {
        noneCard.classList.remove('selected');
        enableAllOptions();
    }
    
    card.classList.toggle('selected');
}

function selectNone(card) {
    const allCards = document.querySelectorAll('.list .card:not(.none)');
    
    if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        enableAllOptions();
    } else {
        card.classList.add('selected');
        disableAllOptions();
    }
}

function disableAllOptions() {
    const allCards = document.querySelectorAll('.list .card:not(.none)');
    allCards.forEach(card => {
        card.classList.remove('selected');
        card.classList.add('disabled');
    });
}

function enableAllOptions() {
    const allCards = document.querySelectorAll('.list .card:not(.none)');
    allCards.forEach(card => {
        card.classList.remove('disabled');
    });
}

function validateSelection(nextSectionId) {
    const selectedCards = document.querySelectorAll('.card.selected');
    const errorMessage = document.getElementById('error-message');
    
    if (selectedCards.length === 0) {
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
        nextSection(nextSectionId);
    }
}

function goToNextSection(nextSectionId) {
    nextSection(parseInt(nextSectionId.split('-')[1]));
}

function showSection(sectionId) {
    nextSection(parseInt(sectionId.split('-')[1]));
}

function selectSingleCard(card) {
    const cards = card.parentElement.querySelectorAll('.card');
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}

function toggleCardSelection(card) {
    card.classList.toggle('selected');
}

function toggleCard(card) {
    card.classList.toggle('selected');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    nextSection(1);
    updateProgressBar(1, 24);
});