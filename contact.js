function openContact() {
    if (typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("contactModal").style.display = "block";
}

function closeContact() {
    if (typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("contactModal").style.display = "none";
}

// contact.js mein openSuccess ko update karein
function openSuccess() {
    document.body.classList.add('modal-open'); // Scroll lock on
    if (typeof sounds !== 'undefined') sounds.pop.play();
    document.getElementById("successModal").style.display = "block";

    // GSAP Confetti Effect
    for (let i = 0; i < 50; i++) {
        createConfetti();
    }

    if (typeof showAchievement === 'function') {
        showAchievement("The Communicator 🚀", "Successfully established a secure link!");
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    document.getElementById("successModal").appendChild(confetti);

    const colors = ['#00f2fe', '#ffd700', '#ff0000', '#2ecc71'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    gsap.set(confetti, {
        x: Math.random() * window.innerWidth,
        y: -10,
        backgroundColor: color
    });

    gsap.to(confetti, {
        y: window.innerHeight + 10,
        x: "+=" + (Math.random() * 200 - 100),
        rotation: Math.random() * 360,
        duration: Math.random() * 2 + 1,
        ease: "power1.out",
        onComplete: () => confetti.remove()
    });
}

function closeSuccess() {
    document.body.classList.remove('modal-open'); // Scroll lock off
    document.getElementById("successModal").style.display = "none";
    
}

// Form Submission Logic
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Page refresh hone se rokein

        const formData = new FormData(this);
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                closeContact(); // Contact form band karein
                openSuccess();  // Thank you modal kholein
                this.reset();   // Form clear karein
            } else {
                alert("Oops! Something went wrong. Please try again.");
            }
        } catch (error) {
            alert("Connection error. Please check your internet.");
        } finally {
            submitBtn.innerText = "Send via Warp 🚀";
            submitBtn.disabled = false;
        }
    });
}



