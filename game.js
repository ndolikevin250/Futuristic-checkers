document.addEventListener('DOMContentLoaded', function() {
    console.log("Game page loaded");

    const gameBoard = document.getElementById('game-board');
    const currentPlayerDisplay = document.getElementById('current-player');
    const computerNameDisplay = document.getElementById('computer-name');
    let currentPlayer = 'red';
    let selectedPiece = null;
    let board = [];

    // List of computer player names
    const computerNames = [
        'Magnus', 'Kasparov', 'Carlsen', 'Capablanca', 
        'Fischer', 'Alekhine', 'Tal', 'Botvinnik', 'Lasker', 
        'Anand', 'Karpov', 'Spassky', 'Petrosian', 'Kramnik', 'Morphy'
    ];

    // Set a random computer name
    function setComputerName() {
        const randomName = computerNames[Math.floor(Math.random() * computerNames.length)];
        computerNameDisplay.textContent = randomName;
    }

    // Initialize the game board
    function initializeBoard() {
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if ((row + col) % 2 !== 0) {
                    if (row < 3) {
                        addPiece(cell, 'black');
                        board[row][col] = { color: 'black', isKing: false };
                    } else if (row > 4) {
                        addPiece(cell, 'red');
                        board[row][col] = { color: 'red', isKing: false };
                    } else {
                        board[row][col] = null;
                    }
                } else {
                    board[row][col] = null;
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }

    function addPiece(cell, color) {
        const piece = document.createElement('div');
        piece.classList.add('piece', color);
        cell.appendChild(piece);
    }

    // Initialize the game
    setComputerName();
    initializeBoard();

    let gameWinner = null;

    const finishMatchBtn = document.getElementById('finish-match-btn');
    finishMatchBtn.disabled = true;

    // Add event listener for the finish match button
    finishMatchBtn.addEventListener('click', function() {
        if (gameWinner) {
            const userResult = {
                player1: 'User',
                player2: computerNameDisplay.textContent,
                winner: gameWinner === 'red' ? 'User' : computerNameDisplay.textContent
            };
            
            let roundResults = JSON.parse(localStorage.getItem('roundResults')) || [];
            roundResults.push(userResult);

            // Simulate results for other matches
            const remainingPlayers = JSON.parse(localStorage.getItem('remainingPlayers')) || [];
            const currentRound = localStorage.getItem('currentRound');
            let matchesToSimulate;

            switch (currentRound) {
                case 'Round of 16 (RO16)':
                    matchesToSimulate = 7;
                    break;
                case 'Quarter-finals (QF)':
                    matchesToSimulate = 3;
                    break;
                case 'Semi-finals (SF)':
                    matchesToSimulate = 1;
                    break;
                case 'Final':
                    matchesToSimulate = 0;
                    break;
                default:
                    matchesToSimulate = 0;
            }

            for (let i = 0; i < matchesToSimulate; i++) {
                const player1 = remainingPlayers.pop();
                const player2 = remainingPlayers.pop();
                const winner = Math.random() < 0.5 ? player1 : player2;
                roundResults.push({
                    player1: player1,
                    player2: player2,
                    winner: winner
                });
            }

            localStorage.setItem('roundResults', JSON.stringify(roundResults));
            window.location.href = 'results.html';
        }
    });

    // Initialize the game logic event listener
    let isJumpInProgress = false;

    function gameBoardClickHandler(e) {
        if (currentPlayer === 'red') { // Only allow clicks when it's the user's turn
            const clickedCell = e.target.closest('.cell');
            const clickedPiece = e.target.closest('.piece');

            if (clickedPiece && clickedPiece.classList.contains(currentPlayer) && !isJumpInProgress) {
                // Select the piece
                if (selectedPiece) {
                    selectedPiece.classList.remove('selected');
                }
                selectedPiece = clickedPiece;
                selectedPiece.classList.add('selected');
                highlightValidMoves(clickedCell);
            } else if (clickedCell && clickedCell.classList.contains('valid-move') && selectedPiece) {
                // Move the piece
                const fromRow = parseInt(selectedPiece.parentElement.dataset.row);
                const fromCol = parseInt(selectedPiece.parentElement.dataset.col);
                const toRow = parseInt(clickedCell.dataset.row);
                const toCol = parseInt(clickedCell.dataset.col);
                
                const jumpMade = movePiece(fromRow, fromCol, toRow, toCol);
                clearHighlights();

                if (jumpMade) {
                    const furtherJumps = getValidMoves(toRow, toCol).filter(move => move.isJump);
                    if (furtherJumps.length > 0) {
                        isJumpInProgress = true;
                        selectedPiece = clickedCell.firstChild;
                        selectedPiece.classList.add('selected');
                        highlightValidMoves(clickedCell);
                        return;
                    }
                }

                isJumpInProgress = false;
                if (!gameWinner) {
                    switchPlayer();
                }
            } else if (!isJumpInProgress) {
                // Deselect the piece
                if (selectedPiece) {
                    selectedPiece.classList.remove('selected');
                    selectedPiece = null;
                    clearHighlights();
                }
            }
        }
    }

    // Add the event listener using the separate function
    gameBoard.addEventListener('click', gameBoardClickHandler);

    function highlightValidMoves(cell) {
        clearHighlights();
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const moves = getValidMoves(row, col);
        
        moves.forEach(move => {
            const moveCell = gameBoard.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (moveCell) {
                moveCell.classList.add('valid-move');
            }
        });
    }

    function getValidMoves(row, col) {
        const piece = board[row][col];
        if (!piece) return [];

        const moves = [];
        const directions = piece.isKing ? [-1, 1] : [piece.color === 'red' ? -1 : 1];

        directions.forEach(rowDir => {
            [-1, 1].forEach(colDir => {
                let newRow = row + rowDir;
                let newCol = col + colDir;

                if (isValidCell(newRow, newCol) && !board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                } else if (isValidCell(newRow, newCol) && board[newRow][newCol] && board[newRow][newCol].color !== piece.color) {
                    let jumpRow = newRow + rowDir;
                    let jumpCol = newCol + colDir;
                    if (isValidCell(jumpRow, jumpCol) && !board[jumpRow][jumpCol]) {
                        moves.push({ row: jumpRow, col: jumpCol, isJump: true });
                    }
                }
            });
        });

        return moves;
    }

    function isValidCell(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    function clearHighlights() {
        const cells = gameBoard.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('valid-move'));
    }

    function movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        board[fromRow][fromCol] = null;
        board[toRow][toCol] = piece;

        // Remove the piece from the old cell
        const fromCell = gameBoard.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
        fromCell.innerHTML = '';

        // Add the piece to the new cell
        const toCell = gameBoard.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        addPiece(toCell, piece.color);
        if (piece.isKing) {
            toCell.firstChild.classList.add('king');
        }

        // Check if it's a jump move
        let jumpMade = false;
        if (Math.abs(fromRow - toRow) === 2) {
            const jumpedRow = (fromRow + toRow) / 2;
            const jumpedCol = (fromCol + toCol) / 2;
            board[jumpedRow][jumpedCol] = null;
            const jumpedCell = gameBoard.querySelector(`[data-row="${jumpedRow}"][data-col="${jumpedCol}"]`);
            jumpedCell.innerHTML = '';
            jumpMade = true;
        }

        // Check if the piece should become a king
        if ((piece.color === 'red' && toRow === 0) || (piece.color === 'black' && toRow === 7)) {
            piece.isKing = true;
            toCell.firstChild.classList.add('king');
        }

        checkForWinner();
        return jumpMade;
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
        currentPlayerDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} (${currentPlayer === 'red' ? 'User' : computerNameDisplay.textContent})`;

        if (currentPlayer === 'black') {
            setTimeout(makeComputerMove, 1000); // Delay computer move for better UX
        }
    }

    function makeComputerMove() {
        if (gameWinner) return; // Don't make moves if the game is over

        const allMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] && board[row][col].color === 'black') {
                    const moves = getValidMoves(row, col);
                    moves.forEach(move => {
                        allMoves.push({ from: { row, col }, to: move });
                    });
                }
            }
        }

        if (allMoves.length > 0) {
            const jumpMoves = allMoves.filter(move => move.to.isJump);
            let moveToMake = jumpMoves.length > 0 ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)] : allMoves[Math.floor(Math.random() * allMoves.length)];
            
            let jumpMade = movePiece(moveToMake.from.row, moveToMake.from.col, moveToMake.to.row, moveToMake.to.col);
            
            // Continue jumping if possible
            while (jumpMade) {
                const furtherJumps = getValidMoves(moveToMake.to.row, moveToMake.to.col).filter(move => move.isJump);
                if (furtherJumps.length > 0) {
                    moveToMake = { from: moveToMake.to, to: furtherJumps[Math.floor(Math.random() * furtherJumps.length)] };
                    jumpMade = movePiece(moveToMake.from.row, moveToMake.from.col, moveToMake.to.row, moveToMake.to.col);
                } else {
                    break;
                }
            }

            if (!gameWinner) {
                switchPlayer();
            }
        } else {
            gameWinner = 'red';
            finishMatchBtn.disabled = false;
            alert("Game over! Red (User) wins! Click 'Finish Match' to see overall results.");
        }
    }

    function checkForWinner() {
        let redPieces = 0;
        let blackPieces = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col]) {
                    if (board[row][col].color === 'red') {
                        redPieces++;
                    } else {
                        blackPieces++;
                    }
                }
            }
        }

        if (redPieces === 0) {
            gameWinner = 'black';
        } else if (blackPieces === 0) {
            gameWinner = 'red';
        }

        if (gameWinner) {
            finishMatchBtn.disabled = false;
            alert(`${gameWinner.charAt(0).toUpperCase() + gameWinner.slice(1)} wins! Click 'Finish Match' to see overall results.`);
            // Disable further moves
            gameBoard.removeEventListener('click', gameBoardClickHandler);
        }
    }
});
