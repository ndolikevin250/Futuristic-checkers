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
    const competitionBtn = document.getElementById('competition-btn');
    const championshipInProgress = localStorage.getItem('championshipInProgress') === 'true';

    if (championshipInProgress) {
        const currentRound = localStorage.getItem('currentRound') || 'Round of 16';
        competitionBtn.textContent = `Continue Championship (${currentRound})`;
    } else {
        competitionBtn.textContent = 'Begin Championship';
    }

    competitionBtn.addEventListener('click', function() {
        window.location.href = 'championship.html';
    });
});

console.log("Competition page loaded");
