const selectionPhase = document.getElementById('selection-phase');
const resultPhase = document.getElementById('result-phase');
const resultTitle = document.getElementById('result-title');
const resultSubtitle = document.getElementById('result-subtitle');
const playerHandImg = document.getElementById('player-hand-img');
const cpuHandImg = document.getElementById('cpu-hand-img');
const playerScoreVal = document.getElementById('player-score-val');
const cpuScoreVal = document.getElementById('cpu-score-val');
const playAgainBtn = document.querySelector('.play-again-btn');
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let stats = { wins: 0, losses: 0, draws: 0 };
let particles = [];
let confettiId = null;

const assets = {
    'stone': { img: 'hand_rock.png', label: 'Rock' },
    'paper': { img: 'hand_paper.png', label: 'Paper' },
    'scissors': { img: 'hand_scissors.png', label: 'Scissors' }
};

const VERSION = "1.6 - Optimized";

function init() {
    loadStats();
    updateScoreBoard();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    console.log("RPS Game Initialized - Version:", VERSION);
}

function getComputerChoice(playerChoice) {
    const choices = ['stone', 'paper', 'scissors'];
    let choice = choices[Math.floor(Math.random() * 3)];

    // Aggressive Draw Reduction: 90% chance to switch if it matches player
    if (choice === playerChoice && Math.random() < 0.9) {
        const altMoves = choices.filter(m => m !== playerChoice);
        choice = altMoves[Math.floor(Math.random() * altMoves.length)];
    }
    return choice;
}

function playRound(playerChoice) {
    // UI Swap
    selectionPhase.classList.add('hidden');
    resultPhase.classList.remove('hidden');

    // Hide results initially
    resultTitle.classList.add('invisible');
    resultSubtitle.classList.add('invisible');
    resultTitle.classList.remove('pop-animate');
    if (playAgainBtn) playAgainBtn.classList.add('invisible');

    // Reset Hands
    resetHandsAnimation();

    const cpuChoice = getComputerChoice(playerChoice);
    const result = determineWinner(playerChoice, cpuChoice);

    // Animation Delay
    setTimeout(() => {
        revealResult(playerChoice, cpuChoice, result);
    }, 1200);
}

function resetHandsAnimation() {
    playerHandImg.src = assets['stone'].img;
    cpuHandImg.src = assets['stone'].img;
    playerHandImg.dataset.choice = '';
    cpuHandImg.dataset.choice = '';

    playerHandImg.parentElement.classList.remove('pop-hand');
    cpuHandImg.parentElement.classList.remove('pop-hand');

    playerHandImg.classList.add('shake-left');
    cpuHandImg.classList.add('shake-right');
}

function revealResult(playerChoice, cpuChoice, result) {
    // 1. Freeze & Hide current shake state
    const pT = getComputedStyle(playerHandImg).transform;
    const cT = getComputedStyle(cpuHandImg).transform;

    playerHandImg.style.transform = pT;
    cpuHandImg.style.transform = cT;
    playerHandImg.style.transition = 'none';
    cpuHandImg.style.transition = 'none';
    playerHandImg.style.opacity = '0';
    cpuHandImg.style.opacity = '0';

    // 2. Update Source & Classes next frame
    requestAnimationFrame(() => {
        playerHandImg.classList.remove('shake-left');
        cpuHandImg.classList.remove('shake-right');

        playerHandImg.src = assets[playerChoice].img;
        playerHandImg.dataset.choice = playerChoice;

        cpuHandImg.src = assets[cpuChoice].img;
        cpuHandImg.dataset.choice = cpuChoice;

        // 3. Release and Show
        requestAnimationFrame(() => {
            playerHandImg.style.transform = '';
            cpuHandImg.style.transform = '';
            playerHandImg.style.opacity = '1';
            cpuHandImg.style.opacity = '1';

            playerHandImg.parentElement.classList.add('pop-hand');
            cpuHandImg.parentElement.classList.add('pop-hand');

            updateStats(result);
            showResultText(playerChoice, cpuChoice, result);

            if (playAgainBtn) playAgainBtn.classList.remove('invisible');
        });
    });
}

function determineWinner(p, c) {
    if (p === c) return 'draw';
    const wins = { 'stone': 'scissors', 'paper': 'stone', 'scissors': 'paper' };
    return wins[p] === c ? 'win' : 'lose';
}

function updateStats(result) {
    if (result === 'win') stats.wins++;
    else if (result === 'lose') stats.losses++;
    else stats.draws++;

    updateScoreBoard();
    saveStats();
}

function showResultText(playerChoice, cpuChoice, result) {
    resultTitle.classList.remove('invisible');
    resultSubtitle.classList.remove('invisible');

    const totalDecisive = stats.wins + stats.losses;
    const isSeriesEnd = totalDecisive >= 3;

    if (isSeriesEnd) {
        handleSeriesEnd();
    } else {
        handleRoundResult(result, playerChoice, cpuChoice, totalDecisive);
    }
}

function handleRoundResult(result, playerChoice, cpuChoice, totalDecisive) {
    if (playAgainBtn) playAgainBtn.textContent = `Next Round (${totalDecisive}/3)`;

    const colors = { win: 'green', lose: 'red', draw: '#333' };
    resultTitle.style.color = colors[result];

    if (result === 'win') {
        resultTitle.textContent = "You Win!";
        resultSubtitle.textContent = `${assets[playerChoice].label} beats ${assets[cpuChoice].label}!`;
    } else if (result === 'lose') {
        resultTitle.textContent = "You Lose!";
        resultSubtitle.textContent = `${assets[cpuChoice].label} beats ${assets[playerChoice].label}!`;
    } else {
        resultTitle.textContent = "Draw!";
        resultSubtitle.textContent = "It's a tie game!";
    }
}

function handleSeriesEnd() {
    resultTitle.classList.add('pop-animate');
    if (playAgainBtn) playAgainBtn.textContent = "New Game";

    if (stats.wins > stats.losses) {
        resultTitle.textContent = "VICTORY!";
        resultTitle.style.color = "#22c55e";
        resultSubtitle.innerHTML = `You won the match!<br><span style="font-size: 0.6em; display: block; margin-top: 5px; color: #666;">Final Score: <span class="series-score win">${stats.wins} - ${stats.losses}</span></span>`;
        runConfetti();
    } else if (stats.losses > stats.wins) {
        resultTitle.textContent = "DEFEAT!";
        resultTitle.style.color = "#ef4444";
        resultSubtitle.innerHTML = `Better luck next time!<br><span style="font-size: 0.6em; display: block; margin-top: 5px; color: #666;">Final Score: <span class="series-score lose">${stats.wins} - ${stats.losses}</span></span>`;
    } else {
        resultTitle.textContent = "DRAW!";
        resultTitle.style.color = "#334155";
        resultSubtitle.textContent = "It's a tie game!";
    }
}

function resetBoard() {
    resultPhase.classList.add('hidden');
    selectionPhase.classList.remove('hidden');

    const totalDecisive = stats.wins + stats.losses;
    if (totalDecisive >= 3) {
        resetGame();
    }
}

function resetGame() {
    stats = { wins: 0, losses: 0, draws: 0 };
    updateScoreBoard();
    saveStats();

    if (playAgainBtn) playAgainBtn.textContent = "Play Again";
    if (confettiId) cancelAnimationFrame(confettiId);
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resetScore() {
    resetGame();
    resetBoard();
}

function updateScoreBoard() {
    if (playerScoreVal) playerScoreVal.textContent = stats.wins;
    if (cpuScoreVal) cpuScoreVal.textContent = stats.losses;
}

function saveStats() {
    try { localStorage.setItem('rps-stats', JSON.stringify(stats)); }
    catch (e) { console.warn("Storage warning", e); }
}

function loadStats() {
    try {
        const saved = localStorage.getItem('rps-stats');
        if (saved) stats = JSON.parse(saved);
    } catch (e) { console.warn("Storage warning", e); }
}

// Confetti Logic
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createConfetti() {
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 5 + 2,
            angle: Math.random() * 6.28
        });
    }
}

function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        p.y += p.speed;
        p.x += Math.sin(p.angle) * 2;
        p.angle += 0.1;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.y > canvas.height) particles.splice(index, 1);
    });

    if (particles.length > 0) {
        confettiId = requestAnimationFrame(updateConfetti);
    }
}

function runConfetti() {
    createConfetti();
    updateConfetti();
}

init();
