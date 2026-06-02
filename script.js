const IMAGE_SOURCES = ['images/image1.jpeg', 'images/image2.jpeg', 'images/image3.jpeg'];
const TOTAL_ROUNDS = 10;

let currentRound = 1;
let score = 0;
let currentTarget = '';
let currentOptions = [];
let isLocked = false;
let musicEnabled = true;
let musicInterval = null;
let audioContext = null;

const gameBoard = document.getElementById('gameBoard');
const targetImage = document.getElementById('targetImage');
const feedback = document.getElementById('feedback');
const roundDisplay = document.getElementById('round');
const scoreDisplay = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');
const musicBtn = document.getElementById('musicBtn');
const startBtn = document.getElementById('startBtn');
const startScreen = document.getElementById('startScreen');
const gameWrapper = document.getElementById('gameWrapper');
const winMessage = document.getElementById('winMessage');

function shuffle(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

function initializeGame() {
    currentRound = 1;
    score = 0;
    isLocked = false;
    updateStats();
    winMessage.classList.add('hidden');
    generateRound();
}

function updateStats() {
    roundDisplay.textContent = `${currentRound}/${TOTAL_ROUNDS}`;
    scoreDisplay.textContent = score;
}

function playTone(freq, duration = 0.35, type = 'sine', gainValue = 0.025) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, now);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(gainValue, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
}

function startMusic() {
    if (!musicEnabled) return;
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    if (musicInterval) return;

    const pattern = [392.00, 523.25, 659.25, 523.25, 392.00, 329.63, 293.66, 329.63];
    let step = 0;

    musicInterval = setInterval(() => {
        const base = pattern[step % pattern.length];
        playTone(base, 0.16, 'triangle', 0.012);
        playTone(base * 1.25, 0.12, 'sine', 0.008);
        playTone(base * 1.5, 0.08, 'square', 0.005);
        step += 1;
    }, 320);
}

function stopMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}

function generateRound() {
    const target = IMAGE_SOURCES[Math.floor(Math.random() * IMAGE_SOURCES.length)];
    const otherOptions = IMAGE_SOURCES.filter(item => item !== target);
    const wrong = otherOptions[Math.floor(Math.random() * otherOptions.length)];

    currentTarget = target;
    currentOptions = shuffle([target, wrong]);
    isLocked = false;
    feedback.textContent = 'Choose the image that matches the target.';
    feedback.className = 'feedback';

    targetImage.innerHTML = `<img src="${target}" alt="Target image">`;
    renderChoices();
}

function renderChoices() {
    gameBoard.innerHTML = '';

    currentOptions.forEach((imageSrc) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-card';
        button.innerHTML = `<img src="${imageSrc}" alt="Choice image">`;
        button.addEventListener('click', () => chooseOption(imageSrc));
        gameBoard.appendChild(button);
    });
}

function chooseOption(selectedImage) {
    if (isLocked) return;

    isLocked = true;

    if (selectedImage === currentTarget) {
        score += 1;
        scoreDisplay.textContent = score;
        feedback.textContent = 'Correct! That is the matching image.';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = 'Not quite. The matching image is the one you saw above.';
        feedback.className = 'feedback wrong';
    }

    setTimeout(() => {
        if (currentRound >= TOTAL_ROUNDS) {
            endGame();
        } else {
            currentRound += 1;
            roundDisplay.textContent = `${currentRound}/${TOTAL_ROUNDS}`;
            generateRound();
        }
    }, 900);
}

function endGame() {
    stopMusic();

    document.getElementById('finalStats').innerHTML = `
        <strong>Completed 10 rounds!</strong><br>
        🎯 ${score} correct matches
    `;

    winMessage.classList.remove('hidden');
}

function startGame() {
    startScreen.classList.add('hidden');
    gameWrapper.classList.remove('hidden');
    if (musicEnabled) {
        startMusic();
    }
    initializeGame();
}

resetBtn.addEventListener('click', () => {
    gameWrapper.classList.remove('hidden');
    startScreen.classList.add('hidden');
    if (musicEnabled) {
        startMusic();
    }
    initializeGame();
});

musicBtn.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    musicBtn.textContent = musicEnabled ? 'Music: On' : 'Music: Off';

    if (musicEnabled) {
        startMusic();
    } else {
        stopMusic();
    }
});

startBtn.addEventListener('click', startGame);
window.addEventListener('DOMContentLoaded', () => {
    startScreen.classList.remove('hidden');
    gameWrapper.classList.add('hidden');
});
