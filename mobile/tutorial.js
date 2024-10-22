const VERSION = "1.0.0";
let lastCheckedVersion = localStorage.getItem('lastCheckedVersion') || VERSION;

async function checkForUpdates() {
    try {
        const response = await fetch('version.json');
        const data = await response.json();
        if (data.version !== lastCheckedVersion) {
            alert(`A new version (${data.version}) is available. Please refresh the page to update.`);
            localStorage.setItem('lastCheckedVersion', data.version);
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
}

window.addEventListener('load', checkForUpdates);

document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.querySelector('.back-button');
    const nextButton = document.getElementById('next-btn');

    // Add touch event listeners for better mobile responsiveness
    backButton.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });

    backButton.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
        window.location.href = 'learn.html';
    });

    nextButton.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });

    nextButton.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
        // Add functionality for next tutorial page or advanced rules
        console.log('Next button clicked');
    });

    // Prevent default touch behavior to avoid delays
    document.addEventListener('touchstart', function(event) {
        if (event.target.tagName === 'BUTTON' || event.target.classList.contains('back-button')) {
            event.preventDefault();
        }
    }, { passive: false });
});

// Add any additional functionality for the tutorial page here
