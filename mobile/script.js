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

// Call this function when the page loads
window.addEventListener('load', checkForUpdates);

// Add the rest of your game logic here, adjusting for mobile interactions as needed
// For example, you might want to use touch events instead of mouse events

document.addEventListener('DOMContentLoaded', function() {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const competitionBtn = document.getElementById('competition-btn');
    const learnBtn = document.getElementById('learn-btn');

    // Initialize the game
    initializeGame();

    // Add event listeners
    resetBtn.addEventListener('click', resetGame);
    settingsBtn.addEventListener('click', openSettings);
    competitionBtn.addEventListener('click', enterCompetition);
    learnBtn.addEventListener('click', openLearnPage);

    // Add touch event listeners for the game board
    board.addEventListener('touchstart', handleTouchStart);
    board.addEventListener('touchend', handleTouchEnd);
});

let touchStartCell = null;

function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (cell && cell.classList.contains('cell')) {
        touchStartCell = cell;
        // Highlight the touched cell or piece
        highlightCell(cell);
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (touchStartCell && cell && cell.classList.contains('cell')) {
        // Attempt to make a move from touchStartCell to cell
        makeMove(touchStartCell, cell);
    }
    // Remove any highlights
    clearHighlights();
    touchStartCell = null;
}

function highlightCell(cell) {
    cell.classList.add('highlighted');
}

function clearHighlights() {
    document.querySelectorAll('.cell.highlighted').forEach(cell => {
        cell.classList.remove('highlighted');
    });
}

function makeMove(fromCell, toCell) {
    // Implement your move logic here
    // This should include checking if the move is valid and updating the game state
    console.log(`Attempting move from ${fromCell.dataset.row},${fromCell.dataset.col} to ${toCell.dataset.row},${toCell.dataset.col}`);
    // Add your game logic here
}

function openSettings() {
    window.location.href = 'settings.html';
}

function enterCompetition() {
    window.location.href = 'competition.html';
}

function openLearnPage() {
    window.location.href = 'learn.html';
}

// ... rest of your game logic functions
