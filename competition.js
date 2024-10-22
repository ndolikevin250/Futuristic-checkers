// This file is currently empty, but you can add JavaScript functionality
// for the competition page here in the future.
// Add event listener for the Begin Championship button
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
