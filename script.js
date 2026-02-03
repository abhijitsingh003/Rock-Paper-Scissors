const selectionPhase = document.getElementById('selection-phase');
const resultPhase = document.getElementById('result-phase');
const resultTitle = document.getElementById('result-title');
const resultSubtitle = document.getElementById('result-subtitle');
const playerHandImg = document.getElementById('player-hand-img');
const cpuHandImg = document.getElementById('cpu-hand-img');

const winsEl = null; // Removed
const lossesEl = null; // Removed 
const drawsEl = null; // Removed

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

// const resetBtnEl = document.querySelector('.reset-btn'); // Removed footer button
const playAgainBtn = document.querySelector('.play-again-btn');

function playRound(playerChoice) {
    // 1. Switch to result view
    selectionPhase.classList.add('hidden');
    resultPhase.classList.remove('hidden');

    // 2. Hide result text AND Play Again button naturally (visibility) so layout space is preserved
    resultTitle.classList.remove('hidden');
    resultSubtitle.classList.remove('hidden');

    resultTitle.classList.add('invisible');
    resultSubtitle.classList.add('invisible');
    if (playAgainBtn) playAgainBtn.classList.add('invisible'); // Hide button but keep space

    // 3. Reset hands to Rock for the "Shake" animation (standard RPS behavior)
    playerHandImg.src = assets['stone'].img;
    playerHandImg.dataset.choice = ''; // Reset styling to default
    playerHandImg.parentElement.classList.remove('pop-hand'); // Reset pop

    cpuHandImg.src = assets['stone'].img;
    cpuHandImg.dataset.choice = '';
    cpuHandImg.parentElement.classList.remove('pop-hand');

    // 4. Add shake classes
    playerHandImg.classList.add('shake-left');
    cpuHandImg.classList.add('shake-right');

    let cpuChoice = getComputerChoice();

    // Improved Randomness & Aggressive Draw Reduction
    // If it's a draw, 90% of the time switch to a different move.
    // This lowers draw probability from ~33% to ~3%.
    if (cpuChoice === playerChoice && Math.random() < 0.9) {
        const altMoves = ['stone', 'paper', 'scissors'].filter(m => m !== playerChoice);
        cpuChoice = altMoves[Math.floor(Math.random() * altMoves.length)];
    }

    const result = determineWinner(playerChoice, cpuChoice);

    // 5. Wait for animation - OPACITY SWAP FIX
    setTimeout(() => {
        // 1. Hide hands instantly to mask the "Static Rock" frame
        playerHandImg.style.transition = 'none'; // Ensure no fade duration
        cpuHandImg.style.transition = 'none';
        playerHandImg.style.opacity = '0';
        cpuHandImg.style.opacity = '0';

        // 2. Stop shaking
        playerHandImg.classList.remove('shake-left');
        cpuHandImg.classList.remove('shake-right');

        // 3. Swap Images (Happens while invisible)
        playerHandImg.src = assets[playerChoice].img;
        playerHandImg.dataset.choice = playerChoice;

        cpuHandImg.src = assets[cpuChoice].img;
        cpuHandImg.dataset.choice = cpuChoice;

        // 4. Force Browser Reflow (Ensure the swap is painted in logic)
        void playerHandImg.offsetWidth;

        // 5. Show Hands & Pop
        playerHandImg.style.opacity = '1';
        cpuHandImg.style.opacity = '1';

        playerHandImg.parentElement.classList.add('pop-hand');
        cpuHandImg.parentElement.classList.add('pop-hand');

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
                resultSubtitle.innerHTML = `You won the match!<br><span style="font-size: 0.6em; display: block; margin-top: 5px; color: #666;">Final Score: <span class="series-score win">${stats.wins} - ${stats.losses}</span></span>`;
                runConfetti();
            } else if (stats.losses > stats.wins) {
                resultTitle.textContent = "DEFEAT!";
                resultTitle.style.color = "#ef4444"; // Red
                resultSubtitle.innerHTML = `Better luck next time!<br><span style="font-size: 0.6em; display: block; margin-top: 5px; color: #666;">Final Score: <span class="series-score lose">${stats.wins} - ${stats.losses}</span></span>`;
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

            // Show series progress on button
            if (playAgainBtn) playAgainBtn.textContent = `Next Round (${totalDecisive}/3)`;

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
    }, 1200); // 1.2s: Full 3rd shake (Increase by 0.3s)
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

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Init immediately

let particles = [];
let confettiId = null;

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

function resetBoard() {
    // 1. Navigate immediately (Fixes 'click twice' issue by prioritizing UI switch)
    resultPhase.classList.add('hidden');
    selectionPhase.classList.remove('hidden');

    // 2. Check if we need to full reset (if series was completed)
    const totalDecisive = stats.wins + stats.losses;
    const playAgainBtn = document.querySelector('.play-again-btn');

    if (totalDecisive >= 3) {
        stats = { wins: 0, losses: 0, draws: 0 };
        updateScoreBoard();
        saveStats();

        // Reset text
        if (playAgainBtn) playAgainBtn.textContent = "Play Again";

        // Clear confetti and pop animation
        if (confettiId) cancelAnimationFrame(confettiId); // Stop loop
        particles = [];
        resizeCanvas(); // Ensure size matches viewport
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (resultTitle) resultTitle.classList.remove('pop-animate');
    }
    // Show Reset Button again
    // if (resetBtnEl) resetBtnEl.style.display = 'block'; // Removed footer logic
}

// const totalGamesEl = document.getElementById('total-games'); // Removed
const playerScoreVal = document.getElementById('player-score-val');
const cpuScoreVal = document.getElementById('cpu-score-val');

function updateScoreBoard() {
    if (playerScoreVal) playerScoreVal.textContent = stats.wins;
    if (cpuScoreVal) cpuScoreVal.textContent = stats.losses; // CPU wins = My losses
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

function resetScore() {
    stats = { wins: 0, losses: 0, draws: 0 };
    updateScoreBoard();
    saveStats();

    // Explicit cleanup since resetBoard only cleans on series end
    if (typeof confettiId !== 'undefined' && confettiId) cancelAnimationFrame(confettiId);
    particles = [];
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (resultTitle) resultTitle.classList.remove('pop-animate');

    // Reset Play Again button text if needed
    const playAgainBtn = document.querySelector('.play-again-btn');
    if (playAgainBtn) playAgainBtn.textContent = "Play Again";

    resetBoard();
}

init();
