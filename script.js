const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

let gameState = [];
let currentPlayer = 'player';
let selectedPiece = null;
let jumpAvailable = false;
let gameOver = false;
let possibleMoves = [];
let playerStats = { pieces: 12, kings: 0, captures: 0 };
let computerStats = { pieces: 12, kings: 0, captures: 0 };

// Initialize overall stats
let playerOverallStats = {
    played: 0,
    won: 0,
    lost: 0,
    currentStreak: 0,
    longestStreak: 0
};

let computerOverallStats = {
    played: 0,
    won: 0,
    lost: 0
};

// Load overall stats from localStorage
function loadOverallStats() {
    const savedPlayerStats = localStorage.getItem('playerOverallStats');
    const savedComputerStats = localStorage.getItem('computerOverallStats');

    if (savedPlayerStats) {
        playerOverallStats = JSON.parse(savedPlayerStats);
    }

    if (savedComputerStats) {
        computerOverallStats = JSON.parse(savedComputerStats);
    }
}

// Save overall stats to localStorage
function saveOverallStats() {
    localStorage.setItem('playerOverallStats', JSON.stringify(playerOverallStats));
    localStorage.setItem('computerOverallStats', JSON.stringify(computerOverallStats));
}

// Call this function to update stats after a game ends
function endGame(winner) {
    gameOver = true;
    playerOverallStats.played++;
    computerOverallStats.played++;

    if (winner === 'Player') {
        playerOverallStats.won++;
        computerOverallStats.lost++;
        playerOverallStats.currentStreak++;
        playerOverallStats.longestStreak = Math.max(playerOverallStats.longestStreak, playerOverallStats.currentStreak);
    } else {
        playerOverallStats.lost++;
        computerOverallStats.won++;
        playerOverallStats.currentStreak = 0;
    }

    saveOverallStats(); // Save stats after updating
    updateStatsDisplay();
    updateStatus(`Game Over! ${winner} wins!`);
}

function initializeBoard() {
    gameState = [];
    for (let i = 0; i < 8; i++) {
        gameState[i] = [];
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 1) {
                if (i < 3) {
                    gameState[i][j] = { player: 'computer', isKing: false };
                } else if (i > 4) {
                    gameState[i][j] = { player: 'player', isKing: false };
                } else {
                    gameState[i][j] = null;
                }
            } else {
                gameState[i][j] = null;
            }
        }
    }
    playerStats = { pieces: 12, kings: 0, captures: 0 };
    computerStats = { pieces: 12, kings: 0, captures: 0 };
    updateStatsDisplay();
}

function renderBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            if (gameState[i][j]) {
                const piece = document.createElement('div');
                piece.classList.add('piece', gameState[i][j].player);
                if (gameState[i][j].isKing) {
                    piece.classList.add('king');
                }
                cell.appendChild(piece);
            }
            
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    if (currentPlayer === 'computer' || gameOver) return;
    
    const row = parseInt(event.target.closest('.cell').dataset.row);
    const col = parseInt(event.target.closest('.cell').dataset.col);
    
    if (selectedPiece) {
        const move = possibleMoves.find(m => m.row === row && m.col === col);
        if (move) {
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            if (move.jumped) {
                const additionalJumps = getValidJumps(row, col);
                if (additionalJumps.length > 0) {
                    selectedPiece = { row, col };
                    possibleMoves = additionalJumps;
                    clearHighlights();
                    highlightPossibleMoves(additionalJumps);
                    return;
                }
            }
            endTurn();
        } else {
            clearHighlights();
            if (gameState[row][col] && gameState[row][col].player === 'player') {
                selectPiece(row, col);
            } else {
                selectedPiece = null;
                possibleMoves = [];
            }
        }
    } else if (gameState[row][col] && gameState[row][col].player === 'player') {
        selectPiece(row, col);
    }
}

function selectPiece(row, col) {
    selectedPiece = { row, col };
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.querySelector('.piece').classList.add('selected');
    possibleMoves = getValidMoves(row, col);
    highlightPossibleMoves(possibleMoves);
}


function highlightPossibleMoves(moves) {
    moves.forEach(move => {
        const cell = document.querySelector(`.cell[data-row="${move.row}"][data-col="${move.col}"]`);
        cell.classList.add('possible-move');
        if (move.jumped) {
            cell.classList.add('possible-jump');
        }
    });
}

function clearHighlights() {
    const selected = document.querySelector('.piece.selected');
    if (selected) {
        selected.classList.remove('selected');
    }
    document.querySelectorAll('.cell.possible-move').forEach(cell => {
        cell.classList.remove('possible-move', 'possible-jump');
    });
}

function getValidMoves(row, col) {
    const moves = [];
    const piece = gameState[row][col];
    const directions = piece.isKing ? [-1, 1] : (piece.player === 'player' ? [-1] : [1]);
    
    for (const rowDir of directions) {
        for (const colDir of [-1, 1]) {
            if (isValidMove(row, col, row + rowDir, col + colDir)) {
                moves.push({ row: row + rowDir, col: col + colDir, jumped: false });
            }
            if (isValidJump(row, col, row + rowDir, col + colDir, row + 2 * rowDir, col + 2 * colDir)) {
                moves.push({ row: row + 2 * rowDir, col: col + 2 * colDir, jumped: true });
            }
        }
    }
    
    return moves;
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;
    if (gameState[toRow][toCol] !== null) return false;
    if (Math.abs(fromCol - toCol) !== 1) return false;
    const piece = gameState[fromRow][fromCol];
    if (!piece.isKing) {
        if (piece.player === 'player' && toRow - fromRow !== -1) return false;
        if (piece.player === 'computer' && toRow - fromRow !== 1) return false;
    }
    return true;
}

function isValidJump(fromRow, fromCol, overRow, overCol, toRow, toCol) {
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;
    if (gameState[toRow][toCol] !== null) return false;
    if (Math.abs(fromCol - toCol) !== 2) return false;
    const piece = gameState[fromRow][fromCol];
    if (!piece.isKing) {
        if (piece.player === 'player' && toRow - fromRow !== -2) return false;
        if (piece.player === 'computer' && toRow - fromRow !== 2) return false;
    }
    const jumpedPiece = gameState[overRow][overCol];
    if (!jumpedPiece || jumpedPiece.player === piece.player) return false;
    return true;
}


function movePiece(fromRow, fromCol, toRow, toCol) {
    gameState[toRow][toCol] = gameState[fromRow][fromCol];
    gameState[fromRow][fromCol] = null;
    
    if (Math.abs(fromRow - toRow) === 2) {
        const jumpedRow = (fromRow + toRow) / 2;
        const jumpedCol = (fromCol + toCol) / 2;
        const capturedPiece = gameState[jumpedRow][jumpedCol];
        gameState[jumpedRow][jumpedCol] = null;

        if (gameState[toRow][toCol].player === 'player') {
            playerStats.captures++;
            computerStats.pieces--;
        } else {
            computerStats.captures++;
            playerStats.pieces--;
        }
    }
    
    // Check for king promotion
    if (toRow === 0 && gameState[toRow][toCol].player === 'player') {
        gameState[toRow][toCol].isKing = true;
        playerStats.kings++;
    } else if (toRow === 7 && gameState[toRow][toCol].player === 'computer') {
        gameState[toRow][toCol].isKing = true;
        computerStats.kings++;
    }
    
    updateStatsDisplay();
    renderBoard();
}

function endTurn() {
    clearHighlights();
    selectedPiece = null;
    possibleMoves = [];
    if (!checkForGameOver()) {
        currentPlayer = 'computer';
        updateStatus();
        updatePlayerIcons();
        setTimeout(computerMove, 1000);
    }
}

function updateStatus(message) {
    status.textContent = message || `${currentPlayer === 'player' ? 'Your' : "Computer's"} turn`;
    updatePlayerIcons();
}

function checkForGameOver() {
    const playerMoves = getAllValidMoves('player');
    const computerMoves = getAllValidMoves('computer');

    if (playerMoves.length === 0) {
        endGame('Computer'); // Player has no moves left, computer wins
        return true;
    } else if (computerMoves.length === 0) {
        endGame('Player'); // Computer has no moves left, player wins
        return true;
    }
    return false; // Game is still ongoing
}

function computerMove() {
    const moves = getAllValidMoves('computer');
    if (moves.length > 0) {
        const jumpMoves = moves.filter(m => m.jumped);
        const move = jumpMoves.length > 0 ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)] : moves[Math.floor(Math.random() * moves.length)];
        
        setTimeout(() => {
            movePiece(move.fromRow, move.fromCol, move.row, move.col);
            
            if (move.jumped) {
                const additionalJumps = getValidJumps(move.row, move.col);
                if (additionalJumps.length > 0) {
                    setTimeout(() => computerMove(), 500);
                    return;
                }
            }
            
            if (!checkForGameOver()) {
                currentPlayer = 'player';
                updateStatus();
                updatePlayerIcons();
            }
        }, 500);
    } else {
        checkForGameOver();
    }
}

function endComputerTurn() {
    currentPlayer = 'player';
    updateStatus();
    updatePlayerIcons();
}

function getAllValidMoves(player) {
    const moves = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (gameState[i][j] && gameState[i][j].player === player) {
                const pieceMoves = getValidMoves(i, j);
                pieceMoves.forEach(move => {
                    moves.push({ ...move, fromRow: i, fromCol: j });
                });
            }
        }
    }
    return moves;
}

function getValidJumps(row, col) {
    return getValidMoves(row, col).filter(move => move.jumped);
}

function resetGame() {
    initializeBoard();
    renderBoard();
    currentPlayer = 'player';
    selectedPiece = null;
    possibleMoves = [];
    gameOver = false;
    playerStats = { pieces: 12, kings: 0, captures: 0 };
    computerStats = { pieces: 12, kings: 0, captures: 0 };
    clearHighlights();
    updateStatus();
    updatePlayerIcons();
    updateStatsDisplay();
}

resetBtn.addEventListener('click', resetGame);

// Initialize the game
function initializeGame() {
    loadOverallStats(); // Load overall stats when initializing the game
    const savedDifficulty = localStorage.getItem('gameDifficulty') || 'easy'; // Default to 'easy' if not set
    setGameDifficulty(savedDifficulty); // Set the game difficulty based on saved value
    resetGame(); // Initialize the game
}

// Call initializeGame instead of resetGame when the page loads
window.onload = initializeGame;

function setGameDifficulty(difficulty) {
    // Implement your logic to set the game difficulty
    // For example, you can adjust the AI behavior or game rules based on the difficulty level
    console.log(`Game difficulty set to: ${difficulty}`);
}

function updateStatsDisplay() {
    // Update current game stats
    document.getElementById('player-pieces').textContent = playerStats.pieces;
    document.getElementById('player-kings').textContent = playerStats.kings;
    document.getElementById('player-captures').textContent = playerStats.captures;
    document.getElementById('computer-pieces').textContent = computerStats.pieces;
    document.getElementById('computer-kings').textContent = computerStats.kings;
    document.getElementById('computer-captures').textContent = computerStats.captures;

    // Update overall stats
    document.getElementById('player-played').textContent = playerOverallStats.played;
    document.getElementById('player-won').textContent = playerOverallStats.won;
    document.getElementById('player-lost').textContent = playerOverallStats.lost;
    document.getElementById('player-current-streak').textContent = playerOverallStats.currentStreak;
    document.getElementById('player-longest-streak').textContent = playerOverallStats.longestStreak;
    document.getElementById('player-win-percentage').textContent = 
        playerOverallStats.played > 0 
            ? ((playerOverallStats.won / playerOverallStats.played) * 100).toFixed(1) + '%' 
            : '0%';

    document.getElementById('computer-played').textContent = computerOverallStats.played;
    document.getElementById('computer-won').textContent = computerOverallStats.won;
    document.getElementById('computer-lost').textContent = computerOverallStats.lost;
}

// Add event listeners for player icons
document.querySelector('.player-icon-left').addEventListener('click', () => toggleStatsPopup('player-stats'));
document.querySelector('.player-icon-right').addEventListener('click', () => toggleStatsPopup('computer-stats'));

function toggleStatsPopup(popupId) {
    const popup = document.getElementById(popupId);
    const otherPopupId = popupId === 'player-stats' ? 'computer-stats' : 'player-stats';
    const otherPopup = document.getElementById(otherPopupId);

    if (popup.style.display === 'block') {
        popup.style.display = 'none';
    } else {
        popup.style.display = 'block';
        otherPopup.style.display = 'none';
    }
}

// New function to update player icons based on whose turn it is
function updatePlayerIcons() {
    const playerIconLeft = document.querySelector('.player-icon-left');
    const playerIconRight = document.querySelector('.player-icon-right');

    if (currentPlayer === 'player') {
        playerIconLeft.classList.add('active');
        playerIconRight.classList.remove('active');
    } else {
        playerIconLeft.classList.remove('active');
        playerIconRight.classList.add('active');
    }
}

// Add this at the end of the file
document.getElementById('competition-btn').addEventListener('click', function() {
    window.location.href = 'competition.html';
});
