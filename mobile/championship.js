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
    console.log("Championship page loaded");

    const players = [
        'User', 'Magnus', 'Kasparov', 'Carlsen', 'Capablanca', 
        'Fischer', 'Alekhine', 'Tal', 'Botvinnik', 'Lasker', 
        'Anand', 'Karpov', 'Spassky', 'Petrosian', 'Kramnik', 'Morphy'
    ];

    let championshipInProgress = false;
    let currentFixtures = [];
    let currentRound = '';

    // ... (rest of the championship.js code remains the same)
});
