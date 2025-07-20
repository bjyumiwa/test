document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('puzzle-board');
    const moveCountElement = document.getElementById('move-count');
    const shuffleButton = document.getElementById('shuffle-button');
    const winMessageElement = document.getElementById('win-message');
    const timerElement = document.getElementById('timer');

    const SIZE = 4;
    const TILE_COUNT = SIZE * SIZE;
    const EMPTY_TILE = TILE_COUNT;
    const TILE_SIZE = 75; // Same as in CSS
    const GAP = 5; // Same as in CSS

    let board = [];
    let moves = 0;
    let isGameWon = false;
    let timer = 0;
    let timerInterval = null;

    function getPosition(index) {
        const col = index % SIZE;
        const row = Math.floor(index / SIZE);
        return {
            x: col * (TILE_SIZE + GAP),
            y: row * (TILE_SIZE + GAP),
        };
    }

    function createTile(number, index) {
        const tile = document.createElement('div');
        if (number === EMPTY_TILE) {
            return null; // Don't create a DOM element for the empty tile
        }
        tile.className = 'tile';
        tile.textContent = number;
        tile.dataset.number = number;
        
        const { x, y } = getPosition(index);
        tile.style.transform = `translate(${x}px, ${y}px)`;

        // Set background position to show the correct part of the image
        const solvedIndex = number - 1;
        const bgCol = solvedIndex % SIZE;
        const bgRow = Math.floor(solvedIndex / SIZE);
        tile.style.backgroundPosition = `-${bgCol * TILE_SIZE}px -${bgRow * TILE_SIZE}px`;

        tile.addEventListener('click', () => handleTileClick(number));
        return tile;
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        board.forEach((number, index) => {
            const tileElement = createTile(number, index);
            if (tileElement) {
                boardElement.appendChild(tileElement);
            }
        });
    }

    function updateTilePositions() {
        board.forEach((number, index) => {
            if (number !== EMPTY_TILE) {
                const tileElement = boardElement.querySelector(`[data-number='${number}']`);
                const { x, y } = getPosition(index);
                tileElement.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
    }

    function handleTileClick(number) {
        if (isGameWon) return;

        const tileIndex = board.indexOf(number);
        const emptyIndex = board.indexOf(EMPTY_TILE);

        const tileRow = Math.floor(tileIndex / SIZE);
        const tileCol = tileIndex % SIZE;
        const emptyRow = Math.floor(emptyIndex / SIZE);
        const emptyCol = emptyIndex % SIZE;

        const isAdjacent =
            (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
            (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow);

        if (isAdjacent) {
            [board[tileIndex], board[emptyIndex]] = [board[emptyIndex], board[tileIndex]]; // Swap
            moves++;
            if (moves === 1) { // Start timer on the first move
                startTimer();
            }
            moveCountElement.textContent = moves;
            updateTilePositions();
            checkWin();
        }
    }

    function isSolvable(arr) {
        let inversions = 0;
        for (let i = 0; i < TILE_COUNT - 1; i++) {
            for (let j = i + 1; j < TILE_COUNT; j++) {
                if (arr[i] !== EMPTY_TILE && arr[j] !== EMPTY_TILE && arr[i] > arr[j]) {
                    inversions++;
                }
            }
        }
        
        const emptyRow = Math.floor(arr.indexOf(EMPTY_TILE) / SIZE);
        // For a 4x4 grid (even width), the puzzle is solvable if:
        // (number of inversions) + (row of the empty space, 1-indexed from the bottom) is even.
        const emptyRowFromBottom = SIZE - emptyRow;
        return (inversions + emptyRowFromBottom) % 2 === 0;
    }

    function shuffle() {
        moves = 0;
        isGameWon = false;
        moveCountElement.textContent = moves;
        winMessageElement.classList.add('hidden');
        
        // Reset and stop timer
        clearInterval(timerInterval);
        timerInterval = null;
        timer = 0;
        timerElement.textContent = `${timer}s`;

        board = Array.from({ length: TILE_COUNT }, (_, i) => i + 1);

        do {
            // Fisher-Yates shuffle
            for (let i = board.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [board[i], board[j]] = [board[j], board[i]];
            }
        } while (!isSolvable(board)); // Ensure the generated puzzle is solvable

        if (boardElement.children.length === 0) {
            renderBoard();
        } else {
            updateTilePositions();
        }
    }

    function checkWin() {
        for (let i = 0; i < TILE_COUNT - 1; i++) {
            if (board[i] !== i + 1) {
                return;
            }
        }
        isGameWon = true;
        winMessageElement.classList.remove('hidden');
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = `${timer}s`;
        }, 1000);
    }

    shuffleButton.addEventListener('click', shuffle);

    // Initial game setup
    shuffle();
});