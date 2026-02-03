const selectionPhase = document.getElementById('selection-phase');
const resultPhase = document.getElementById('result-phase');
const resultTitle = document.getElementById('result-title');
const resultSubtitle = document.getElementById('result-subtitle');
const playerHandImg = document.getElementById('player-hand-img');
const cpuHandImg = document.getElementById('cpu-hand-img');

const winsEl = document.getElementById('wins');
const lossesEl = document.getElementById('losses');
const drawsEl = document.getElementById('draws');

let stats = {
    wins: 0,
    losses: 0,
    draws: 0
};

// Map selection names to image files
const assets = {
    'stone': { img: 'hand_rock.png', label: 'Rock' },
    'paper': { img: 'hand_paper.png', label: 'Paper' },
    'scissors': { img: 'hand_scissors.png', label: 'Scissors' }
};

function init() {
    loadStats();
    updateScoreBoard();
}

function getComputerChoice() {
    const choices = ['stone', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * 3)];
}

const resetBtnEl = document.querySelector('.reset-btn');
const playAgainBtn = document.querySelector('.play-again-btn');

function playRound(playerChoice) {
    // 1. Switch to result view
    selectionPhase.classList.add('hidden');
    resultPhase.classList.remove('hidden');

    // Hide Reset Button during play
    if (resetBtnEl) resetBtnEl.style.display = 'none';

    // 2. Hide result text AND Play Again button naturally (visibility) so layout space is preserved
    resultTitle.classList.remove('hidden');
    resultSubtitle.classList.remove('hidden');

    resultTitle.classList.add('invisible');
    resultSubtitle.classList.add('invisible');
    if (playAgainBtn) playAgainBtn.classList.add('invisible'); // Hide button but keep space

    // 3. Reset hands to Rock for the "Shake" animation (standard RPS behavior)
    playerHandImg.src = assets['stone'].img;
    cpuHandImg.src = assets['stone'].img;

    // 4. Add shake classes
    playerHandImg.classList.add('shake-left');
    cpuHandImg.classList.add('shake-right');

    let cpuChoice = getComputerChoice();

    // Reduce draws: If it matches, re-roll immediately (reduces draw chance from 33% to 11%)
    if (cpuChoice === playerChoice) {
        cpuChoice = getComputerChoice();
    }

    const result = determineWinner(playerChoice, cpuChoice);

    // 5. Wait for animation
    setTimeout(() => {
        // Stop shaking
        playerHandImg.classList.remove('shake-left');
        cpuHandImg.classList.remove('shake-right');

        // Show actual hands
        playerHandImg.src = assets[playerChoice].img;
        cpuHandImg.src = assets[cpuChoice].img;

        // Show result text and button (remove invisible)
        resultTitle.classList.remove('invisible');
        resultSubtitle.classList.remove('invisible');
        if (playAgainBtn) playAgainBtn.classList.remove('invisible');

        // 1. Update Stats for this round FIRST
        if (result === 'win') {
            stats.wins++;
        } else if (result === 'lose') {
            stats.losses++;
        } else {
            stats.draws++;
        }

        // 2. Check if 3 decisive rounds (Wins + Losses) have been played
        const totalDecisive = stats.wins + stats.losses;

        if (totalDecisive >= 3) {
            // Series Over Logic

            // Add Pop Animation
            resultTitle.classList.add('pop-animate');

            if (stats.wins > stats.losses) {
                resultTitle.textContent = "VICTORY!";
                resultTitle.style.color = "#22c55e"; // Green
                resultSubtitle.textContent = `You won the match ${stats.wins}-${stats.losses}!`;
                runConfetti();
            } else if (stats.losses > stats.wins) {
                resultTitle.textContent = "DEFEAT!";
                resultTitle.style.color = "#ef4444"; // Red
                resultSubtitle.textContent = `Better luck next time! (Score: ${stats.losses}-${stats.wins})`;
            } else {
                resultTitle.textContent = "DRAW!";
                resultTitle.style.color = "#334155";
                resultSubtitle.textContent = "It's a tie game!";
            }

            // Change button to Start New Game
            if (playAgainBtn) playAgainBtn.textContent = "New Game";

        } else {
            // Normal Round Result Logic
            resultTitle.classList.remove('pop-animate'); // Ensure no pop for normal rounds

            if (result === 'win') {
                resultTitle.textContent = "You Win!";
                resultTitle.style.color = "green";
                resultSubtitle.textContent = `${assets[playerChoice].label} beats ${assets[cpuChoice].label}!`;
            } else if (result === 'lose') {
                resultTitle.textContent = "You Lose!";
                resultTitle.style.color = "red";
                resultSubtitle.textContent = `${assets[cpuChoice].label} beats ${assets[playerChoice].label}!`;
            } else {
                resultTitle.textContent = "Draw!";
                resultTitle.style.color = "#333";
                resultSubtitle.textContent = "";
            }
        }

        updateScoreBoard();
        saveStats();
    }, 1300); // 1.3s delay (0.5+0.5+0.3)
}

function determineWinner(p, c) {
    if (p === c) return 'draw';
    if (
        (p === 'stone' && c === 'scissors') ||
        (p === 'paper' && c === 'stone') ||
        (p === 'scissors' && c === 'paper')
    ) {
        return 'win';
    }
    return 'lose';
}

const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

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
    if (particles.length > 0) requestAnimationFrame(updateConfetti);
}

function runConfetti() {
    createConfetti();
    updateConfetti();
}

function resetBoard() {
    // Determine if we need to full reset (if game was over)
    const playAgainBtn = document.querySelector('.play-again-btn');
    if (playAgainBtn.textContent === "New Game") {
        stats = { wins: 0, losses: 0, draws: 0 };
        updateScoreBoard();
        saveStats();
        playAgainBtn.textContent = "Play Again";

        // Clear confetti and pop animation
        particles = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resultTitle.classList.remove('pop-animate');
    }

    resultPhase.classList.add('hidden');
    selectionPhase.classList.remove('hidden');
    // Show Reset Button again
    if (resetBtnEl) resetBtnEl.style.display = 'block';
}

const totalGamesEl = document.getElementById('total-games');
const playerScoreVal = document.getElementById('player-score-val');
const cpuScoreVal = document.getElementById('cpu-score-val');

function updateScoreBoard() {
    // Old footer stats (might be hidden but we keep logic consistent)
    if (winsEl) winsEl.textContent = stats.wins;
    if (lossesEl) lossesEl.textContent = stats.losses;
    if (drawsEl) drawsEl.textContent = stats.draws;

    // New Landing Page Stats
    if (playerScoreVal) playerScoreVal.textContent = stats.wins;
    if (cpuScoreVal) cpuScoreVal.textContent = stats.losses; // CPU wins = My losses

    // Calculate total games
    const total = stats.wins + stats.losses + stats.draws;
    if (totalGamesEl) totalGamesEl.textContent = total;
}

function resetScore() {
    stats = { wins: 0, losses: 0, draws: 0 };
    updateScoreBoard();
    saveStats();
    resetBoard();
}

function saveStats() {
    localStorage.setItem('rps-stats', JSON.stringify(stats));
}

function loadStats() {
    const saved = localStorage.getItem('rps-stats');
    if (saved) {
        stats = JSON.parse(saved);
    }
}

// Global click to reset if in result phase (optional, but convenient)
document.addEventListener('click', (e) => {
    if (!resultPhase.classList.contains('hidden') && !e.target.closest('.choice-option')) {
        // resetBoard(); 
        // Commented out to prevent accidental resets if they want to read. 
        // Added explicit back button or clicking the hands? 
        // User can just click whatever.
    }
});

init();
