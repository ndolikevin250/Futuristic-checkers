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
