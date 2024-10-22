let gameState = [];
let currentPlayer = 'computer0';
let board = document.getElementById('board');
let isPaused = false;
let gameInterval;

// Web Audio API context
let audioContext;

function initializeAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(frequency, duration) {
    if (!audioContext) initializeAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playCaptureSound() {
    playSound(500, 0.1); // Higher pitch, shorter duration
}

function playKingSound() {
    playSound(300, 0.3); // Lower pitch, longer duration
}

function initializeBoard() {
    gameState = [];
    for (let i = 0; i < 8; i++) {
        gameState[i] = [];
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 1) {
                if (i < 3) {
                    gameState[i][j] = { player: 'computer0', isKing: false };
                } else if (i > 4) {
                    gameState[i][j] = { player: 'computer1', isKing: false };
                } else {
                    gameState[i][j] = null;
                }
            } else {
                gameState[i][j] = null;
            }
        }
    }
    renderBoard();
    updateGameStatus("Game ready. Press 'Give Permission to Start' to begin.");
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

            board.appendChild(cell);
        }
    }
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', restartGame); // Add this line

function startGame() {
    initializeBoard();
    updateGameStatus("Game started. Computer 0's turn.");
    currentPlayer = 'computer0';
    gameInterval = setInterval(computerMove, 2000);
}

function computerMove() {
    if (isPaused) return;

    let validMoves = getValidMoves(currentPlayer);
    if (validMoves.length > 0) {
        let move = validMoves[Math.floor(Math.random() * validMoves.length)];
        makeMove(move);
        renderBoard();
        updateGameStatus(`${currentPlayer === 'computer0' ? "Computer 1" : "Computer 0"}'s turn.`);
    } else {
        endGame();
    }
}

function getValidMoves(player) {
    let moves = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (gameState[i][j] && gameState[i][j].player === player) {
                moves = moves.concat(getMovesForPiece(i, j));
            }
        }
    }
    // Prioritize jumps if available
    const jumps = moves.filter(move => move.isJump);
    return jumps.length > 0 ? jumps : moves;
}

function getMovesForPiece(row, col) {
    const piece = gameState[row][col];
    const moves = [];
    const directions = piece.isKing ? [-1, 1] : [piece.player === 'computer0' ? 1 : -1];

    for (let dRow of directions) {
        for (let dCol of [-1, 1]) {
            // Check for regular moves
            if (isValidMove(row, col, row + dRow, col + dCol)) {
                moves.push({ from: { row, col }, to: { row: row + dRow, col: col + dCol } });
            }
            // Check for jumps
            if (isValidJump(row, col, row + dRow * 2, col + dCol * 2, row + dRow, col + dCol)) {
                moves.push({ from: { row, col }, to: { row: row + dRow * 2, col: col + dCol * 2 }, isJump: true });
            }
        }
    }
    return moves;
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    return toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8 && gameState[toRow][toCol] === null;
}

function isValidJump(fromRow, fromCol, toRow, toCol, overRow, overCol) {
    if (!isValidMove(fromRow, fromCol, toRow, toCol)) return false;
    const jumpedPiece = gameState[overRow][overCol];
    return jumpedPiece && jumpedPiece.player !== gameState[fromRow][fromCol].player;
}

function makeMove(move) {
    let { from, to } = move;
    const movingPiece = gameState[from.row][from.col];
    gameState[to.row][to.col] = movingPiece;
    gameState[from.row][from.col] = null;

    if (Math.abs(from.row - to.row) === 2) {
        let jumpedRow = (from.row + to.row) / 2;
        let jumpedCol = (from.col + to.col) / 2;
        gameState[jumpedRow][jumpedCol] = null;
        playCaptureSound();

        // Check for multiple jumps
        let furtherJumps = getMovesForPiece(to.row, to.col).filter(m => m.isJump);
        if (furtherJumps.length > 0) {
            setTimeout(() => {
                makeMove(furtherJumps[Math.floor(Math.random() * furtherJumps.length)]);
                renderBoard();
            }, 500);
            return;
        }
    }

    // King promotion
    if (!movingPiece.isKing &&
        ((to.row === 0 && movingPiece.player === 'computer1') ||
         (to.row === 7 && movingPiece.player === 'computer0'))) {
        movingPiece.isKing = true;
        playKingSound();
    }

    currentPlayer = currentPlayer === 'computer0' ? 'computer1' : 'computer0';
}

function togglePause() {
    isPaused = !isPaused;
    const pausePlayBtn = document.getElementById('pause-play-btn');
    pausePlayBtn.textContent = isPaused ? 'Resume' : 'Pause';
    updateGameStatus(isPaused ? "Game paused." : `Game resumed. ${currentPlayer === 'computer0' ? "Computer 0" : "Computer 1"}'s turn.`);
}

function endGame() {
    clearInterval(gameInterval);
    const winner = currentPlayer === 'computer0' ? 'Computer 1' : 'Computer 0';
    updateGameStatus(`Game over! ${winner} wins!`);
}

function updateGameStatus(message) {
    const statusElement = document.getElementById('game-status');
    statusElement.textContent = message;
}

function restartGame() {
    initializeBoard(); // Reinitialize the board
    updateGameStatus("Game reset. Press 'Give Permission to Start' to begin.");
}

// Initialize the board on page load
initializeBoard();