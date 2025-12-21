function openEducation() {
    if(typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("educationModal").style.display = "block";
}

function closeEducation() {
    document.getElementById("educationModal").style.display = "none";
}

// Global click handler update
window.onclick = function (e) { 
    if (e.target.className === 'modal') { 
        closeSkills(); 
        closeGame();
        closeExperience();
        closeContact();
        closeSuccess();
        closeEducation(); // Naya add kiya
    } 
}