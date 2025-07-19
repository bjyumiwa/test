document.addEventListener('DOMContentLoaded', () => {
    const puzzleContainer = document.getElementById('puzzle-container');
    const shuffleButton = document.getElementById('shuffle-button');
    const messageEl = document.getElementById('message');

    const GRID_SIZE = 4;
    const TILE_SIZE = 100; // Corresponds to .tile width/height in CSS
    const GAP = 2; // Visual gap between tiles in the container

    let tiles = [];
    let emptyTile = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };

    function getTilePosition(row, col) {
        const x = col * (TILE_SIZE + GAP) + GAP;
        const y = row * (TILE_SIZE + GAP) + GAP;
        return { x, y };
    }

    function createTile(number, row, col) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        const { x, y } = getTilePosition(row, col);
        tile.style.transform = `translate(${x}px, ${y}px)`;
        tile.dataset.row = row;
        tile.dataset.col = col;

        if (number === GRID_SIZE * GRID_SIZE) {
            tile.classList.add('empty');
            tile.textContent = '';
        } else {
            tile.textContent = number;
            tile.addEventListener('click', () => onTileClick(tile));
        }

        return tile;
    }
    
    function onTileClick(tileElement) {
        const tileRow = parseInt(tileElement.dataset.row);
        const tileCol = parseInt(tileElement.dataset.col);

        const dx = Math.abs(tileRow - emptyTile.row);
        const dy = Math.abs(tileCol - emptyTile.col);

        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            moveTile(tileElement);
        }
    }
    
    function moveTile(tileElement) {
        const tileRow = parseInt(tileElement.dataset.row);
        const tileCol = parseInt(tileElement.dataset.col);

        // Swap positions in the data model
        const emptyTileElement = document.querySelector('.tile.empty');
        emptyTileElement.dataset.row = tileRow;
        emptyTileElement.dataset.col = tileCol;
        
        tileElement.dataset.row = emptyTile.row;
        tileElement.dataset.col = emptyTile.col;

        // Update CSS transforms
        const newEmptyPos = getTilePosition(tileRow, tileCol);
        emptyTileElement.style.transform = `translate(${newEmptyPos.x}px, ${newEmptyPos.y}px)`;
        
        const newTilePos = getTilePosition(emptyTile.row, emptyTile.col);
        tileElement.style.transform = `translate(${newTilePos.x}px, ${newTilePos.y}px)`;

        // Update empty tile logical position
        emptyTile = { row: tileRow, col: tileCol };

        checkWinCondition();
    }

    function checkWinCondition() {
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            const tile = tiles.find(t => parseInt(t.dataset.row) === row && parseInt(t.dataset.col) === col);

            if (!tile) continue; // Should not happen

            const tileNumber = tile.classList.contains('empty') ? GRID_SIZE * GRID_SIZE : parseInt(tile.textContent);
            if (tileNumber !== i + 1) {
                return; // Not solved
            }
        }
        messageEl.textContent = 'クリア！おめでとう！';
    }

    function shuffle() {
        messageEl.textContent = '';
        let shuffleCount = 200; // Make enough random moves to shuffle
        for (let i = 0; i < shuffleCount; i++) {
            const neighbors = [];
            const { row, col } = emptyTile;
            if (row > 0) neighbors.push({ row: row - 1, col });
            if (row < GRID_SIZE - 1) neighbors.push({ row: row + 1, col });
            if (col > 0) neighbors.push({ row, col: col - 1 });
            if (col < GRID_SIZE - 1) neighbors.push({ row, col: col + 1 });
            
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            const tileToMove = tiles.find(t => 
                parseInt(t.dataset.row) === randomNeighbor.row && 
                parseInt(t.dataset.col) === randomNeighbor.col
            );
            moveTile(tileToMove);
        }
        // After shuffling, clear the win message just in case
        messageEl.textContent = '';
    }

    function init() {
        puzzleContainer.innerHTML = '';
        tiles = [];
        emptyTile = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };
        
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const row = Math.floor(i / GRID_SIZE);
            const col = i % GRID_SIZE;
            const tile = createTile(i + 1, row, col);
            tiles.push(tile);
            puzzleContainer.appendChild(tile);
        }

        shuffleButton.addEventListener('click', shuffle);
    }

    init();
});

