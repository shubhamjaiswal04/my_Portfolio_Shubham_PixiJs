// main.js
// const sounds = {
//     bg: new Howl({ src: ['https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1da4.mp3'], loop: true, volume: 0.1, html5: true }),
//     shoot: new Howl({ src: ['https://freesound.org/data/previews/341/341695_5858296-lq.mp3'], volume: 0.3 }),
//     pop: new Howl({ src: ['https://freesound.org/data/previews/411/411642_5121236-lq.mp3'], volume: 0.4 }),
//     click: new Howl({ src: ['https://freesound.org/data/previews/256/256113_3263906-lq.mp3'], volume: 0.2 }),
//     gameOver: new Howl({ src: ['https://freesound.org/data/previews/173/173859_2518933-lq.mp3'], volume: 0.5 })
// };

const sounds = {
    bg: new Howl({ src: [''], loop: true, volume: 0.1, html5: true }),
    shoot: new Howl({ src: [''], volume: 0.3 }),
    pop: new Howl({ src: [''], volume: 0.4 }),
    click: new Howl({ src: [''], volume: 0.2 }),
    gameOver: new Howl({ src: [''], volume: 0.5 })
};
function openGame() {
    sounds.click.play();
    sounds.bg.play();
    document.getElementById("gameModal").style.display = "block";
    if (typeof init === 'function') init();
}

function closeGame() {
    sounds.click.play();
    sounds.bg.stop();
    document.getElementById("gameModal").style.display = "none";
}

function toggleGames() {
    let h = document.getElementById('hidden-games'), b = document.getElementById('toggleBtn');
    if (h.style.display === 'none') { h.style.display = 'block'; b.innerHTML = 'Show Less ▲'; }
    else { h.style.display = 'none'; b.innerHTML = 'View All Games ▼'; }
}

// Typing Logic
const roles = ["Slot Game Developer", "PixiJS Developer", "Senior Software Engineer"];
let roleIndex = 0, charIndex = 0;

function type() {
    const target = document.getElementById("typing-text");
    if (!target) return;
    if (charIndex < roles[roleIndex].length) {
        target.textContent += roles[roleIndex].charAt(charIndex);
        charIndex++; setTimeout(type, 100);
    } else setTimeout(erase, 2000);
}

function erase() {
    const target = document.getElementById("typing-text");
    if (charIndex > 0) {
        target.textContent = roles[roleIndex].substring(0, charIndex - 1);
        charIndex--; setTimeout(erase, 50);
    } else {
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(type, 500);
    }
}

window.addEventListener('load', () => {
    type();
    gsap.to(".glow-ring", { rotation: 360, duration: 8, repeat: -1, ease: "none" });
});

function openSkills() { document.getElementById("skillsModal").style.display = "block"; }
function closeSkills() { document.getElementById("skillsModal").style.display = "none"; }
function openExperience() { document.getElementById("experienceModal").style.display = "block"; }
function closeExperience() { document.getElementById("experienceModal").style.display = "none"; }

window.onclick = function (e) {
    if (e.target.className === 'modal') {
        const modals = ['skillsModal', 'gameModal', 'experienceModal', 'contactModal', 'educationModal', 'rtpModal'];
        modals.forEach(m => document.getElementById(m).style.display = 'none');
        sounds.bg.stop();
    }
}