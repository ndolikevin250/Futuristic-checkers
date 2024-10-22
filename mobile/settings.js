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
    const saveButton = document.getElementById('save-btn');
    const backButton = document.getElementById('back-btn');
    const difficultySelect = document.getElementById('difficulty-select');
    const soundToggle = document.getElementById('sound-toggle');

    // Load saved settings from localStorage
    const savedDifficulty = localStorage.getItem('gameDifficulty') || 'easy';
    const savedSound = localStorage.getItem('gameSound') === 'true';

    difficultySelect.value = savedDifficulty;
    soundToggle.checked = savedSound;

    saveButton.addEventListener('click', function() {
        const selectedDifficulty = difficultySelect.value;
        const isSoundOn = soundToggle.checked;

        localStorage.setItem('gameDifficulty', selectedDifficulty);
        localStorage.setItem('gameSound', isSoundOn);

        // Provide feedback to the user
        alert('Settings saved successfully!');
        window.location.href = 'index.html';
    });

    backButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // Add touch event listeners for better mobile responsiveness
    [saveButton, backButton].forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });

        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Prevent default touch behavior to avoid delays
    document.addEventListener('touchstart', function(event) {
        if (event.target.tagName === 'BUTTON') {
            event.preventDefault();
        }
    }, { passive: false });
});
