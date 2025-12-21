function openContact() {
    if(typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("contactModal").style.display = "block";
}

function closeContact() {
    if(typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("contactModal").style.display = "none";
}

// Existing window.onclick ko update karein
window.onclick = function (e) { 
    if (e.target.className === 'modal') { 
        closeSkills(); 
        closeGame();
        closeExperience();
        closeContact(); // Naya add kiya
    } 
}

// Form Submission Logic
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
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

function openSuccess() {
    if(typeof sounds !== 'undefined') sounds.pop.play();
    document.getElementById("successModal").style.display = "block";
}

function closeSuccess() {
    document.getElementById("successModal").style.display = "none";
}

// Global click handler mein success modal bhi add karein
window.onclick = function (e) { 
    if (e.target.className === 'modal') { 
        closeSkills(); 
        closeGame();
        closeExperience();
        closeContact();
        closeSuccess();
    } 
}
