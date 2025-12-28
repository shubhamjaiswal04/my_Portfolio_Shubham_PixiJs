
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
     showAchievement("Tech Master 🛠️", "Full-Stack Tech Stack revealed!");

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



document.addEventListener('DOMContentLoaded', () => {
    gsap.to(".glow-ring", {
        rotation: 360,
        duration: 8, // Speed thodi fast ki hai
        repeat: -1,
        ease: "none"
    });
});




// Modal Functions
function openExperience() {
    if(typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("experienceModal").style.display = "block";
    showAchievement("The Professional 💼", "4+ Years of Industry Journey Unlocked.");
}

function closeExperience() {
    if(typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("experienceModal").style.display = "none";
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



// main.js - Consolidated Typing Logic
const roles = ["Slot Game Developer", "PixiJS Developer", "Senior Software Engineer"];
let roleIndex = 0;
let charIndex = 0;

function type() {
    const target = document.getElementById("typing-text");
    if (!target) return; // Guard clause agar element na mile

    if (charIndex < roles[roleIndex].length) {
        target.textContent += roles[roleIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, 100);
    } else {
        setTimeout(erase, 2000);
    }
}

function erase() {
    const target = document.getElementById("typing-text");
    if (!target) return;

    if (charIndex > 0) {
        target.textContent = roles[roleIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, 50);
    } else {
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(type, 500);
    }
}

// FIX: Start typing ONLY when window is fully loaded
window.addEventListener('load', () => {
    type();
    
    // Ring rotation fix - Yahan sirf ek baar rakhein
    gsap.to(".glow-ring", {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "none"
    });
});

// 3. Inspect Element Protection (Right Click & Shortcuts)
document.addEventListener('contextmenu', event => event.preventDefault()); // Right click block
document.onkeydown = function(e) {
    if(e.keyCode == 123) return false; // F12 block
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false; // Ctrl+Shift+I
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false; // Ctrl+Shift+J
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false; // Ctrl+U (View Source)
};


function openRTP() {
    document.getElementById("rtpModal").style.display = "block";
    // Achievement trigger karein
    if(typeof showAchievement === 'function') {
        showAchievement("The Mathematician", "Exploring the core Math Engine logic.");
    }
}

function closeRTP() {
    document.getElementById("rtpModal").style.display = "none";
}

function calculateRTP() {
    const bet = parseFloat(document.getElementById("totalBet").value);
    const win = parseFloat(document.getElementById("totalWin").value);
    const display = document.getElementById("rtpDisplay");
    const resultDiv = document.getElementById("rtpResult");
    const status = document.getElementById("rtpStatus");

    if (bet > 0) {
        const rtp = ((win / bet) * 100).toFixed(2);
        resultDiv.style.display = "block";
        display.innerText = rtp + "%";

        // Logic for industry standards
        if (rtp >= 92 && rtp <= 98) {
            status.innerText = "✅ GLI COMPLIANT: Standard Market RTP";
            status.style.color = "#25d366";
        } else if (rtp > 98) {
            status.innerText = "🔥 HIGH PAYOUT: Player Advantage Mode";
            status.style.color = "#4facfe";
        } else {
            status.innerText = "⚠️ HIGH VOLATILITY: Operator Advantage Mode";
            status.style.color = "#ff4757";
        }

        // GSAP Animation for impact
        gsap.from(display, { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });
    } else {
        alert("Please enter a valid Bet amount.");
    }
}

// --- ACHIEVEMENT SYSTEM ---
function showAchievement(title, msg) {
    const toast = document.getElementById('achievement-toast');
    document.getElementById('toast-title').innerText = title;
    document.getElementById('toast-msg').innerText = msg;

    toast.classList.add('show');
    // Sound play logic if available
    if(typeof sounds !== 'undefined' && sounds.win) sounds.win.play();

    setTimeout(() => toast.classList.remove('show'), 4000);
}

// Trigger achievements on button clicks
// document.querySelector('.exp-btn').addEventListener('click', () => {
//     showAchievement("The Professional", "Unlocked: 4+ Years of Industry Journey.");
// });

// document.querySelector('.skills-btn').addEventListener('click', () => {
//     showAchievement("Tech Master", "Unlocked: Full-Stack Tech Stack revealed.");
// });
function resetHighScore() {
    if (confirm("Reset high score?")) {
        localStorage.removeItem('bubbleHighScore');
        document.getElementById('high-score').innerText = '0';
        showAchievement("Score Reset 🧹", "Aapka record saaf kar diya gaya hai.");
    }
}


// Live Jackpot Ticker Logic
let jackpotVal = 12450.75;
setInterval(() => {
    jackpotVal += Math.random() * 0.85;
    const ticker = document.getElementById('jackpot-amt');
    if(ticker) ticker.innerText = "GRAND JACKPOT: $" + jackpotVal.toLocaleString(undefined, {minimumFractionDigits: 2});
}, 150);


function handleDownload(btn) {
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    const resumePath = "./src/Resume/Shubham_Jaiswal_PixiJs_Resume.pdf"; // Aapka path

    // Step 1: Show Loading
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    btn.style.pointerEvents = 'none'; // Double click rokein

    // Step 2: Simulate processing then open in new tab
    setTimeout(() => {
        // Achievement unlock trigger karein
        if(typeof showAchievement === 'function') {
            showAchievement("The Candidate", "Resume processing complete. Good luck!");
        }

        // Open resume in new tab
        window.open(resumePath, '_blank');

        // Step 3: Reset Button
        btnText.style.display = 'flex';
        btnLoader.style.display = 'none';
        btn.style.pointerEvents = 'auto';
    }, 1200); // 1.2 second ka delay professional lagta hai
}


// 1. Page load hote hi purana High Score check karein
document.addEventListener('DOMContentLoaded', () => {
    gsap.to(".glow-ring", {
        rotation: 360,
        duration: 8, // Speed thodi fast ki hai
        repeat: -1,
        ease: "none"
    });

});









// hide this while uploading builds


function openSuccess() {
    // Mission Accomplished sound logic
    if(typeof sounds !== 'undefined') {
        sounds.pop.play(); // Bubble pop sound ya win sound use karein
    }

    document.getElementById("successModal").style.display = "block";

    // Achievement system ke saath integrate karein
    if(typeof showAchievement === 'function') {
        showAchievement("The Communicator", "Successfully established a secure link!");
    }
}

// Glow Ring Color Transition (Gold to Blue)
gsap.to(".glow-ring", {
    borderColor: "#ffd700", // Gold
    boxShadow: "0 0 20px #ffd700, inset 0 0 20px #ffd700",
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
});

// main.js ke end mein ise replace karein
window.onclick = function (e) {
    if (e.target.className === 'modal') {
        // Sabhi close functions ko ek saath call karein
        if(typeof closeSkills === 'function') closeSkills();
        if(typeof closeGame === 'function') closeGame();
        if(typeof closeExperience === 'function') closeExperience();
        if(typeof closeContact === 'function') closeContact();
        if(typeof closeSuccess === 'function') closeSuccess();
        if(typeof closeEducation === 'function') closeEducation();
        if(typeof closeRTP === 'function') closeRTP();
    }
}

// main.js mein social link par click listener add karein
const waBtn = document.querySelector('.wa-btn');
if(waBtn) {
    waBtn.addEventListener('click', () => {
        showAchievement("Direct Link 📱", "Opening WhatsApp to connect with Shubham...");
    });
}