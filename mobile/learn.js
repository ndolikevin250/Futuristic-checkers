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
    const buttons = document.querySelectorAll('.master-button');
    const backButton = document.querySelector('.back-button');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const href = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            window.location.href = href;
        });
    });

    backButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'index.html';
    });

    // Prevent default touch behavior to avoid delays
    document.addEventListener('touchstart', function(event) {
        if (event.target.classList.contains('master-button') || event.target.classList.contains('back-button')) {
            event.preventDefault();
        }
    }, { passive: false });
});

// Add any additional functionality for the learn page here
