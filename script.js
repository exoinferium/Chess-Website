// Chess Game Logic

// Piece representations
const PIECES = {
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
};

// Game State
let board = [];
let selectedSquare = null;
let validMoves = [];
let moveHistory = [];
let capturedPieces = { white: [], black: [] };
let isWhiteTurn = true;
let boardFlipped = false;

// Initialize board
function initializeBoard() {
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    selectedSquare = null;
    validMoves = [];
    moveHistory = [];
    capturedPieces = { white: [], black: [] };
    isWhiteTurn = true;
    renderBoard();
}

// Render the chess board
function renderBoard() {
    const boardElement = document.getElementById('chessboard');
    boardElement.innerHTML = '';

    const displayBoard = boardFlipped ? board.map(row => [...row].reverse()).reverse() : board;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const actualRow = boardFlipped ? 7 - row : row;
            const actualCol = boardFlipped ? 7 - col : col;
            
            square.className = 'square';
            square.className += (row + col) % 2 === 0 ? ' light' : ' dark';
            square.id = `square-${actualRow}-${actualCol}`;
            
            const piece = displayBoard[row][actualCol];
            if (piece) {
                square.textContent = PIECES[piece];
                square.style.color = isWhitePiece(piece) ? '#f5f5f5' : '#333';
            }

            // Check if square is selected
            if (selectedSquare && selectedSquare.row === actualRow && selectedSquare.col === actualCol) {
                square.classList.add('selected');
            }

            // Check if square is a valid move
            if (validMoves.some(m => m.row === actualRow && m.col === actualCol)) {
                const capturesHere = displayBoard[row][actualCol] !== null;
                square.classList.add('valid-move');
                if (capturesHere) square.classList.add('capture');
            }

            square.onclick = () => handleSquareClick(actualRow, actualCol);
            boardElement.appendChild(square);
        }
    }

    updateGameStatus();
}

// Handle square click
function handleSquareClick(row, col) {
    const piece = board[row][col];

    // If clicking on a valid move, execute it
    if (validMoves.some(m => m.row === row && m.col === col)) {
        movePiece(selectedSquare, { row, col });
        return;
    }

    // If clicking on own piece, select it
    if (piece && isWhitePiece(piece) === isWhiteTurn) {
        selectedSquare = { row, col };
        validMoves = getValidMoves(row, col);
        renderBoard();
        return;
    }

    selectedSquare = null;
    validMoves = [];
    renderBoard();
}

// Check if piece is white
function isWhitePiece(piece) {
    return piece === piece.toUpperCase();
}

// Get valid moves for a piece
function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    const moves = [];
    const pieceType = piece.toLowerCase();

    switch (pieceType) {
        case 'p':
            moves.push(...getPawnMoves(row, col, piece));
            break;
        case 'n':
            moves.push(...getKnightMoves(row, col, piece));
            break;
        case 'b':
            moves.push(...getBishopMoves(row, col, piece));
            break;
        case 'r':
            moves.push(...getRookMoves(row, col, piece));
            break;
        case 'q':
            moves.push(...getQueenMoves(row, col, piece));
            break;
        case 'k':
            moves.push(...getKingMoves(row, col, piece));
            break;
    }

    return moves;
}

// Pawn moves
function getPawnMoves(row, col, piece) {
    const moves = [];
    const isWhite = isWhitePiece(piece);
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    // Move forward
    const newRow = row + direction;
    if (newRow >= 0 && newRow < 8 && !board[newRow][col]) {
        moves.push({ row: newRow, col });

        // Two squares from start
        if (row === startRow && !board[newRow + direction][col]) {
            moves.push({ row: newRow + direction, col });
        }
    }

    // Capture diagonally
    for (let colOffset of [-1, 1]) {
        const newCol = col + colOffset;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (target && isWhitePiece(target) !== isWhite) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }

    return moves;
}

// Knight moves
function getKnightMoves(row, col, piece) {
    const moves = [];
    const isWhite = isWhitePiece(piece);
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (let [dRow, dCol] of knightMoves) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (!target || isWhitePiece(target) !== isWhite) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }

    return moves;
}

// Bishop moves
function getBishopMoves(row, col, piece) {
    const moves = [];
    const isWhite = isWhitePiece(piece);
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (let [dRow, dCol] of directions) {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dRow * i;
            const newCol = col + dCol * i;
            if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;

            const target = board[newRow][newCol];
            if (!target) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (isWhitePiece(target) !== isWhite) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
        }
    }

    return moves;
}

// Rook moves
function getRookMoves(row, col, piece) {
    const moves = [];
    const isWhite = isWhitePiece(piece);
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let [dRow, dCol] of directions) {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dRow * i;
            const newCol = col + dCol * i;
            if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;

            const target = board[newRow][newCol];
            if (!target) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (isWhitePiece(target) !== isWhite) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
        }
    }

    return moves;
}

// Queen moves (combination of rook and bishop)
function getQueenMoves(row, col, piece) {
    return [...getRookMoves(row, col, piece), ...getBishopMoves(row, col, piece)];
}

// King moves
function getKingMoves(row, col, piece) {
    const moves = [];
    const isWhite = isWhitePiece(piece);

    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            if (dRow === 0 && dCol === 0) continue;

            const newRow = row + dRow;
            const newCol = col + dCol;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = board[newRow][newCol];
                if (!target || isWhitePiece(target) !== isWhite) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    return moves;
}

// Move piece
function movePiece(from, to) {
    const piece = board[from.row][from.col];
    const captured = board[to.row][to.col];

    // Record captured piece
    if (captured) {
        if (isWhitePiece(captured)) {
            capturedPieces.black.push(captured);
        } else {
            capturedPieces.white.push(captured);
        }
    }

    // Move piece
    board[to.row][to.col] = piece;
    board[from.row][from.col] = null;

    // Record move
    const fromNotation = String.fromCharCode(97 + from.col) + (8 - from.row);
    const toNotation = String.fromCharCode(97 + to.col) + (8 - to.row);
    const moveNotation = piece.toLowerCase() + ': ' + fromNotation + ' → ' + toNotation;
    moveHistory.push(moveNotation);

    // Check for pawn promotion
    if (piece.toLowerCase() === 'p') {
        if ((piece === 'P' && to.row === 0) || (piece === 'p' && to.row === 7)) {
            board[to.row][to.col] = piece === 'P' ? 'Q' : 'q';
        }
    }

    // Switch turn
    isWhiteTurn = !isWhiteTurn;
    selectedSquare = null;
    validMoves = [];
    renderBoard();
    updateCapturedPieces();
    updateMoveHistory();
}

// Update game status
function updateGameStatus() {
    const turnIndicator = document.getElementById('turn-indicator');
    const gameStatus = document.getElementById('game-status');

    turnIndicator.textContent = isWhiteTurn ? "White's Turn" : "Black's Turn";
    gameStatus.textContent = isWhiteTurn ? 'White to move' : 'Black to move';
}

// Update captured pieces display
function updateCapturedPieces() {
    const whiteCaptured = document.getElementById('white-captures');
    const blackCaptured = document.getElementById('black-captures');

    whiteCaptured.innerHTML = capturedPieces.white.map(p => `<span class="piece-icon">${PIECES[p]}</span>`).join('');
    blackCaptured.innerHTML = capturedPieces.black.map(p => `<span class="piece-icon">${PIECES[p]}</span>`).join('');
}

// Update move history display
function updateMoveHistory() {
    const moveHistoryDiv = document.getElementById('move-history');
    moveHistoryDiv.innerHTML = moveHistory
        .map(move => `<div class="move-item">${move}</div>`)
        .join('');
    moveHistoryDiv.scrollTop = moveHistoryDiv.scrollHeight;
}

// Reset board
function resetBoard() {
    initializeBoard();
    updateCapturedPieces();
    updateMoveHistory();
}

// Undo move
function undoMove() {
    if (moveHistory.length === 0) return;

    // This is a simplified undo - for a full implementation, 
    // you'd need to store previous board states
    alert('Undo feature coming soon! For now, use the New Game button to restart.');
}

// Toggle board perspective
function togglePerspective() {
    boardFlipped = !boardFlipped;
    renderBoard();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
});
