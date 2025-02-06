let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

function generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function showHostScreen() {
    document.getElementById('selection-screen').classList.add('d-none');
    document.getElementById('host-screen').classList.remove('d-none');
    document.getElementById('game-code').textContent = generateGameCode();
}

function showJoinScreen() {
    document.getElementById('selection-screen').classList.add('d-none');
    document.getElementById('join-screen').classList.remove('d-none');
}

function backToSelection() {
    document.getElementById('selection-screen').classList.remove('d-none');
    document.getElementById('host-screen').classList.add('d-none');
    document.getElementById('join-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.add('d-none');
    resetGame();
}

function joinGame() {
    const code = document.getElementById('code-input').value;
    if (code.length === 6) {
        document.getElementById('join-screen').classList.add('d-none');
        document.getElementById('game-screen').classList.remove('d-none');
    }
}

function makeMove(index) {
    if (gameBoard[index] === '' && gameActive) {
        gameBoard[index] = currentPlayer;
        document.getElementsByClassName('game-cell')[index].textContent = currentPlayer;

        if (checkWin()) {
            document.getElementById('game-status').textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
            return;
        }

        if (gameBoard.every(cell => cell !== '')) {
            document.getElementById('game-status').textContent = "It's a draw!";
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('game-status').textContent = `Current turn: ${currentPlayer}`;
    }
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c];
    });
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    document.getElementById('game-status').textContent = `Your turn (X)`;
    Array.from(document.getElementsByClassName('game-cell')).forEach(cell => {
        cell.textContent = '';
    });
}