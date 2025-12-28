let shotCount = 0;
const BOMB_COLOR = '#000000'; // Black color for bomb






let particles = []; // Burst effects ke liye

// Particle create karne ka function
function createBurst(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0, // Alpha/Life value
            color: color,
            size: Math.random() * 5 + 2
        });
    }
}
// --- BUBBLE MASTER GAME ENGINE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const nextPreview = document.getElementById('next-bubble-preview');

const COLS = 8, ROWS = 14, RADIUS = 25, DIAMETER = 50;
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
let grid = [], fallingBubbles = [], bullet = null;
let currentBubbleColor, nextBubbleColor, score = 0, angle = -Math.PI / 2, isGameOver = false;

// Difficulty & Level Variables
let level = 1;
let bubbleSpeed = 15;

function init() {
    // High Score load karein
    const savedHighScore = localStorage.getItem('bubbleHighScore') || 0;
    const hsElement = document.getElementById('high-score');
    if (hsElement) hsElement.innerText = savedHighScore;

    grid = []; fallingBubbles = []; score = 0; isGameOver = false; level = 1; bubbleSpeed = 15;
    scoreEl.innerText = '0';
    if (document.getElementById('current-level')) document.getElementById('current-level').innerText = '1';

    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            grid[r][c] = { active: r < 6, color: r < 6 ? getRandomColor() : null };
        }
    }
    nextBubbleColor = getRandomColor();
    loadLauncher();
}

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// function loadLauncher() {
//     currentBubbleColor = nextBubbleColor;
//     nextBubbleColor = getRandomColor();
//     nextPreview.style.backgroundColor = nextBubbleColor;
// }
function loadLauncher() {
    shotCount++;
    currentBubbleColor = nextBubbleColor;

    // Har 10 shots ke baad bomb aayega
    if (shotCount % 10 === 0) {
        nextBubbleColor = BOMB_COLOR;
    } else {
        nextBubbleColor = getRandomColor();
    }
    nextPreview.style.backgroundColor = nextBubbleColor;
}

function updateDifficulty() {
    let newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
        level = newLevel;
        bubbleSpeed = 15 + (level * 2); // Speed badhti jayegi
        if (document.getElementById('current-level')) document.getElementById('current-level').innerText = level;
        if (typeof showAchievement === 'function') {
            showAchievement("Level Up! 🚀", `Level ${level}: Speed increases!`);
        }
    }
}

function getTileCoordinate(r, c) {
    let x = c * DIAMETER + RADIUS + (r % 2 !== 0 ? RADIUS : 0);
    let y = r * (DIAMETER * 0.85) + RADIUS;
    return { x, y };
}

function getNeighbors(r, c) {
    let ns = [], os = (r % 2 === 0) ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]] : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    os.forEach(o => {
        let nr = r + o[0], nc = c + o[1];
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) ns.push({ r: nr, c: nc });
    });
    return ns;
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    angle = Math.atan2((e.clientY - rect.top) - (canvas.height - 30), (e.clientX - rect.left) - (canvas.width / 2));
    angle = Math.max(-2.9, Math.min(-0.2, angle));
});

canvas.addEventListener('mousedown', () => {
    if (!bullet && !isGameOver) {
        if (typeof sounds !== 'undefined') sounds.shoot.play();
        bullet = {
            x: canvas.width / 2,
            y: canvas.height - 30,
            vx: Math.cos(angle) * bubbleSpeed,
            vy: Math.sin(angle) * bubbleSpeed,
            color: currentBubbleColor
        };
        // Recoil effect
        canvas.style.transform = "translateY(5px)";
        setTimeout(() => canvas.style.transform = "translateY(0)", 50);
    }
});

// 2. Score update karne wala function (Ise apne game logic mein call karein)
function updateHighScore(currentScore) {
    const savedHighScore = parseInt(localStorage.getItem('bubbleHighScore') || 0);
    
    if (currentScore > savedHighScore) {
        localStorage.setItem('bubbleHighScore', currentScore);
        const highScoreElement = document.getElementById('high-score');
        if(highScoreElement) {
            highScoreElement.innerText = currentScore;
            // GSAP effect for new high score
            gsap.from(highScoreElement, { scale: 1.5, color: "#00f2fe", duration: 0.5 });
        }
        
        // Achievement trigger karein
        if(typeof showAchievement === 'function') {
            showAchievement("New Record! 🎯", `You Have Scored ${currentScore} as a high score!`);
        }
    }
}

function snapToGrid(b) {
    let closest = null, minDist = Infinity;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c].active) continue;
            let pos = getTileCoordinate(r, c), dist = Math.hypot(b.x - pos.x, b.y - pos.y);
            if (dist < minDist) { minDist = dist; closest = { r, c }; }
        }
    }

    if (closest && minDist < RADIUS * 1.6) {
        grid[closest.r][closest.c] = { active: true, color: b.color };

        // --- BOMB LOGIC ---
        if (b.color === BOMB_COLOR) {
            createBurst(b.x, b.y, BOMB_COLOR);
            grid[closest.r][closest.c].active = false;

            let explosionArea = getNeighbors(closest.r, closest.c);
            let extendedArea = [];
            explosionArea.forEach(n => {
                extendedArea.push(...getNeighbors(n.r, n.c));
            });
            let fullBlastArea = [...new Set([...explosionArea, ...extendedArea])];

            fullBlastArea.forEach(n => {
                if (grid[n.r][n.c] && grid[n.r][n.c].active) {
                    let pos = getTileCoordinate(n.r, n.c);
                    createBurst(pos.x, pos.y, grid[n.r][n.c].color);
                    grid[n.r][n.c].active = false;
                    score += 50; // Score update
                }
            });

            // YAHAN SCORE UPDATE ZAROORI HAI
            scoreEl.innerText = score;
            if (typeof sounds !== 'undefined') sounds.gameOver.play();

            dropFloaters();
            return true;
        }

        // --- NORMAL MATCH LOGIC ---
        let matches = findMatches(closest.r, closest.c, b.color);
        if (matches.length >= 3) {
            matches.forEach(m => {
                let pos = getTileCoordinate(m.r, m.c);
                createBurst(pos.x, pos.y, grid[m.r][m.c].color);
                grid[m.r][m.c].active = false;
                score += 10;
            });
            dropFloaters();
            if (typeof sounds !== 'undefined') sounds.pop.play();
            updateDifficulty();
        } else if (closest.r >= 12) {
            isGameOver = true;
            if (typeof updateHighScore === 'function') updateHighScore(score);
            if (typeof sounds !== 'undefined') sounds.gameOver.play();
        }

        scoreEl.innerText = score; // Final screen update
        if (typeof updateHighScore === 'function') {
            updateHighScore(score); // Har match ya bomb ke baad high score check karein
        }
        return true;
    }
    return false;
}



function findMatches(r, c, col) {
    let found = [], stack = [{ r, c }], visited = new Set([`${r},${c}`]);
    while (stack.length) {
        let curr = stack.pop(); found.push(curr);
        getNeighbors(curr.r, curr.c).forEach(n => {
            if (grid[n.r][n.c].active && grid[n.r][n.c].color === col && !visited.has(`${n.r},${n.c}`)) {
                visited.add(`${n.r},${n.c}`); stack.push(n);
            }
        });
    }
    return found;
}

function dropFloaters() {
    let safe = new Set(), queue = [];
    for (let c = 0; c < COLS; c++) if (grid[0][c].active) { safe.add(`0,${c}`); queue.push({ r: 0, c }); }
    while (queue.length) {
        let curr = queue.shift();
        getNeighbors(curr.r, curr.c).forEach(n => {
            if (grid[n.r][n.c].active && !safe.has(`${n.r},${n.c}`)) { safe.add(`${n.r},${n.c}`); queue.push(n); }
        });
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (grid[r][c].active && !safe.has(`${r},${c}`)) {
            let p = getTileCoordinate(r, c);
            fallingBubbles.push({ x: p.x, y: p.y, color: grid[r][c].color, vy: -2 });
            grid[r][c].active = false; score += 20;
        }
    }
}

function update() {
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02; // Dhire dhire gayab hona
        if (p.life <= 0) particles.splice(i, 1);
    });
    if (bullet) {
        bullet.x += bullet.vx; bullet.y += bullet.vy;
        if (bullet.x < RADIUS || bullet.x > canvas.width - RADIUS) bullet.vx *= -1;
        let hit = false;
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (grid[r][c].active) {
                let p = getTileCoordinate(r, c);
                if (Math.hypot(bullet.x - p.x, bullet.y - p.y) < DIAMETER - 5) hit = true;
            }
        }
        if (hit || bullet.y < RADIUS) { snapToGrid(bullet); bullet = null; loadLauncher(); }
    }
    fallingBubbles.forEach((b, i) => { b.y += b.vy; b.vy += 0.5; if (b.y > canvas.height) fallingBubbles.splice(i, 1); });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset alpha
    });
    if (!bullet && !isGameOver) {
        ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.moveTo(canvas.width / 2, canvas.height - 30);
        ctx.lineTo(canvas.width / 2 + Math.cos(angle) * 100, canvas.height - 30 + Math.sin(angle) * 100);
        ctx.strokeStyle = '#666'; ctx.stroke(); ctx.setLineDash([]);
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c].active) drawBubble(getTileCoordinate(r, c).x, getTileCoordinate(r, c).y, grid[r][c].color);
    fallingBubbles.forEach(b => drawBubble(b.x, b.y, b.color));
    if (bullet) drawBubble(bullet.x, bullet.y, bullet.color);
    if (!isGameOver) drawBubble(canvas.width / 2, canvas.height - 30, currentBubbleColor);

    if (isGameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = '#00f2fe';
        ctx.font = 'bold 45px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 35px Arial';
        ctx.fillText('SCORE: ' + score, canvas.width / 2, canvas.height / 2 + 50);
    }
}

function drawBubble(x, y, col) {
    ctx.beginPath(); let g = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, RADIUS);
    g.addColorStop(0, '#fff'); g.addColorStop(1, col);
    ctx.fillStyle = g; ctx.arc(x, y, RADIUS - 1, 0, Math.PI * 2); ctx.fill();
}

function gameLoop() {
    if (document.getElementById('gameModal').style.display === 'block') {
        update(); draw();
    }
    requestAnimationFrame(gameLoop);
}

function resetGame() { init(); }

// Start
init();
requestAnimationFrame(gameLoop);