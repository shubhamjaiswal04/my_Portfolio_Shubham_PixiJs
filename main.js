
(async () => {
    const app = new PIXI.Application();
    await app.init({ 
        canvas: document.getElementById('bg-canvas'), 
        resizeTo: window, 
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true, // Important for iOS/High DPI
        resolution: window.devicePixelRatio || 1
    });
    // await app.init({ 
    //     canvas: document.getElementById('bg-canvas'),
    //      resizeTo: window, 
    //      backgroundAlpha: 0});
    const stars = [];
    const starTexture = app.renderer.generateTexture(new PIXI.Graphics().circle(0, 0, 3).fill({ color: 0x4facfe, alpha: 0.5 }));

    for (let i = 0; i < 500; i++) {
        const s = new PIXI.Sprite(starTexture);
        s.x = Math.random() * app.screen.width; s.y = Math.random() * app.screen.height;
        s.anchor.set(0.5);
        s.vx = (Math.random() - 0.5) * 0.6; s.vy = (Math.random() - 0.5) * 0.6;
        app.stage.addChild(s); stars.push(s);
    }

    let mouseX = -1000, mouseY = -1000;
    window.addEventListener('mousemove', e => { 
        mouseX = e.clientX;
        mouseY = e.clientY; 
    });
// ticker for manage the stars
    app.ticker.add(() => {
        stars.forEach(s => {
            s.x += s.vx; s.y += s.vy;
            if (s.x < 0) s.x = app.screen.width; if (s.x > app.screen.width) s.x = 0;
            if (s.y < 0) s.y = app.screen.height; if (s.y > app.screen.height) s.y = 0;

            const dx = s.x - mouseX, dy = s.y - mouseY, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const angle = Math.atan2(dy, dx), force = (150 - dist) / 150;
                s.x += Math.cos(angle) * force * 5; s.y += Math.sin(angle) * force * 5;
            }
        });
    });
})();


// toggle functions for show games
function toggleGames() {
    let h = document.getElementById('hidden-games'), b = document.getElementById('toggleBtn');
    if (h.style.display === 'none') { h.style.display = 'block'; b.innerHTML = 'Show Less ▲'; }
    else { h.style.display = 'none'; b.innerHTML = 'View All Games ▼'; document.getElementById('projects').scrollIntoView({ behavior: 'smooth' }); }
}

// --- STABLE EXTERNAL SOUND LINKS ---
const sounds = {
    // 1. Background Music (Calm Synth)
    bg: new Howl({
        src: ['https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1da4.mp3'],
        loop: true,
        volume: 0.15,
        html5: true
    }),
    // 2. Shooting Sound (Laser/Pop)
    shoot: new Howl({
        src: ['https://freesound.org/data/previews/341/341695_5858296-lq.mp3'],
        volume: 0.4
    }),
    // 3. Bubble Pop Sound (Water/Plop)
    pop: new Howl({
        src: ['https://freesound.org/data/previews/411/411642_5121236-lq.mp3'],
        volume: 0.5
    }),
    // 4. Click Sound (UI)
    click: new Howl({
        src: ['https://freesound.org/data/previews/256/256113_3263906-lq.mp3'],
        volume: 0.3
    }),
    // 5. Game Over (Dull Thud)
    gameOver: new Howl({
        src: ['https://freesound.org/data/previews/173/173859_2518933-lq.mp3'],
        volume: 0.6
    })
};

// Mute logic waisi hi rahegi
let isMuted = false;
function toggleMute() {
    isMuted = !isMuted;
    Howler.mute(isMuted);
    const btn = document.getElementById('muteBtn');
    if(btn) {
        btn.innerHTML = isMuted ? "🔇 Unmute" : "🔊 Mute";
        btn.style.background = isMuted ? "#e74c3c" : "#555";
    }
}
// --- UI LOGIC ---
function openSkills() {
     document.getElementById("skillsModal").style.display = "block"; 
    
}
function closeSkills() {
     document.getElementById("skillsModal").style.display = "none"; 
}
function openGame() { 
    sounds.click.play(); // Play click
    sounds.bg.play();    // Start BG Music
    document.getElementById("gameModal").style.display = "block";
     resetGame();
}
function closeGame() { 
    sounds.click.play();
    sounds.bg.stop();
    document.getElementById("gameModal").style.display = "none";
}
window.onclick = function (e) { 
    if (e.target.className === 'modal') { 
        closeSkills(); closeGame();
    } 
}

// --- ------------------------------------------------------BUBBLE MASTER GAME ENGINE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const nextPreview = document.getElementById('next-bubble-preview');

const COLS = 8, ROWS = 14, RADIUS = 25, DIAMETER = 50;
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
let grid = [], fallingBubbles = [], particles = [], bullet = null;
let currentBubbleColor, nextBubbleColor, score = 0, angle = -Math.PI / 2, isGameOver = false;
//init function 
function init() {
    grid = []; fallingBubbles = []; particles = []; score = 0; isGameOver = false;
    scoreEl.innerText = '0';
    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            grid[r][c] = { active: r < 6, color: r < 6 ? getRandomColor() : null };
        }
    }
    nextBubbleColor = getRandomColor();
    loadLauncher();
}

// function for get random color for balls
function getRandomColor() { 
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}
// load launcher function
function loadLauncher() { 
    currentBubbleColor = nextBubbleColor;
    nextBubbleColor = getRandomColor(); 
    nextPreview.style.backgroundColor = nextBubbleColor;
}

// get tile cordinates
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
        sounds.shoot.play(); // Shooting sound
        bullet = { x: canvas.width / 2, y: canvas.height - 30, vx: Math.cos(angle) * 15, vy: Math.sin(angle) * 15, color: currentBubbleColor };
    }
});

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
        let matches = findMatches(closest.r, closest.c, b.color);
        if (matches.length >= 3) {
            matches.forEach(m => { grid[m.r][m.c].active = false; score += 10; });
            dropFloaters();
        } else if (closest.r >= 12) isGameOver = true;
        scoreEl.innerText = score; return true;
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

function gameLoop() {
    if (document.getElementById('gameModal').style.display === 'block') {
        update(); draw();
    }
    requestAnimationFrame(gameLoop);
}

function update() {
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
    if (!bullet && !isGameOver) {
        ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.moveTo(canvas.width / 2, canvas.height - 30);
        ctx.lineTo(canvas.width / 2 + Math.cos(angle) * 100, canvas.height - 30 + Math.sin(angle) * 100);
        ctx.strokeStyle = '#666'; ctx.stroke(); ctx.setLineDash([]);
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c].active) drawBubble(getTileCoordinate(r, c).x, getTileCoordinate(r, c).y, grid[r][c].color);
    fallingBubbles.forEach(b => drawBubble(b.x, b.y, b.color));
    if (bullet) drawBubble(bullet.x, bullet.y, bullet.color);
    if (!isGameOver) drawBubble(canvas.width / 2, canvas.height - 30, currentBubbleColor);
    if (isGameOver) { ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 400, 600); ctx.fillStyle = 'white'; ctx.font = '40px Arial'; ctx.fillText('GAME OVER', 80, 300); }
}

function drawBubble(x, y, col) {
    ctx.beginPath(); let g = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, RADIUS);
    g.addColorStop(0, '#fff'); g.addColorStop(1, col);
    ctx.fillStyle = g; ctx.arc(x, y, RADIUS - 1, 0, Math.PI * 2); ctx.fill();
}

function resetGame() { 
    init();

}
// Modal Functions
function openExperience() {
    if(typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("experienceModal").style.display = "block";
}

function closeExperience() {
    if(typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("experienceModal").style.display = "none";
}

// Window click logic (Pehele wale window.onclick ko update karein)
window.onclick = function (e) { 
    if (e.target.className === 'modal') { 
        closeSkills(); 
        closeGame();
        closeExperience(); // Naya add kiya
    } 
}

// Mobile detect karne ka function
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);



// Custom Cursor ko bhi sirf Desktop par enable karein
if (!isMobile) {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}
init();
requestAnimationFrame(gameLoop);






// GSAP Library CDN load kar lein index.html mein agar nahi hai toh
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
// Ensure GSAP is included in index.html
// 1. Profile Glow Rotation
gsap.to(".glow-ring", {
    rotation: 360,
    duration: 10,
    repeat: -1,
    ease: "none"
});

// 2. Typing Effect Logic
const roles = ["Slot Game Developer", "PixiJS Developer"];
let roleIndex = 0;
let charIndex = 0;
const target = document.getElementById("typing-text");

function type() {
    if (charIndex < roles[roleIndex].length) {
        target.textContent += roles[roleIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, 100);
    } else {
        setTimeout(erase, 2000);
    }
}

function erase() {
    if (charIndex > 0) {
        target.textContent = roles[roleIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, 50);
    } else {
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(type, 500);
    }
}

// Start animation on load
window.addEventListener('DOMContentLoaded', type);

// 3. Inspect Element Protection (Right Click & Shortcuts)
document.addEventListener('contextmenu', event => event.preventDefault()); // Right click block
document.onkeydown = function(e) {
    if(e.keyCode == 123) return false; // F12 block
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false; // Ctrl+Shift+I
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false; // Ctrl+Shift+J
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false; // Ctrl+U (View Source)
};