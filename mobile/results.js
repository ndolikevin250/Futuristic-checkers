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
    const fixturesResults = document.getElementById('fixtures-results');
    const pausePlayBtn = document.getElementById('pause-play-btn');
    let results = JSON.parse(localStorage.getItem('roundResults')) || [];
    let isPaused = false;
    let timeoutId;

    function displayResults() {
        fixturesResults.innerHTML = results.map(result => `
            <div class="fixture-result">
                <span class="${result.winner === result.player1 ? 'winner' : ''}">${result.player1}</span>
                vs
                <span class="${result.winner === result.player2 ? 'winner' : ''}">${result.player2}</span>
                - Winner: ${result.winner}
            </div>
        `).join('');
    }

    function startCountdown() {
        timeoutId = setTimeout(() => {
            if (!isPaused) {
                window.location.href = 'championship.html';
            }
        }, 5000);
    }

    pausePlayBtn.addEventListener('click', function() {
        isPaused = !isPaused;
        this.textContent = isPaused ? 'Play' : 'Pause';
        if (isPaused) {
            clearTimeout(timeoutId);
        } else {
            startCountdown();
        }
    });

    displayResults();
    startCountdown();
});
