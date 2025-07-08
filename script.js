// Game variables
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 30;
const tetrominoSequence = [];
let bestScore = localStorage.getItem('tetrisBestScore') || 0;
let score = 0;

// DOM elements
const gameOverModal = document.getElementById('game-over-modal');
const tryAgainBtn = document.getElementById('try-again-btn');
const bestScoreDisplay = document.getElementById('best-score');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const rotateBtn = document.getElementById('rotate-btn');
const downBtn = document.getElementById('down-btn');

// Initialize canvas size
function initCanvasSize() {
  if (window.innerWidth <= 768 || window.innerHeight <= 700) {
    canvas.width = 300;
    canvas.height = 600;
  } else {
    canvas.width = 320;
    canvas.height = 640;
  }
}

initCanvasSize();
window.addEventListener('resize', initCanvasSize);

// Playfield
const playfield = [];
for (let row = -2; row < 20; row++) {
  playfield[row] = [];
  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

// Tetromino shapes
const tetrominos = {
  'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
  'J': [[1,0,0], [1,1,1], [0,0,0]],
  'L': [[0,0,1], [1,1,1], [0,0,0]],
  'O': [[1,1], [1,1]],
  'S': [[0,1,1], [1,1,0], [0,0,0]],
  'Z': [[1,1,0], [0,1,1], [0,0,0]],
  'T': [[0,1,0], [1,1,1], [0,0,0]]
};

// Colors for tetrominos
const colors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange'
};

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;

// Helper functions
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }
  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === 'I' ? -1 : -2;
  return { name, matrix, row, col };
}

function rotate(matrix) {
  const N = matrix.length - 1;
  return matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
}

function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
          cellCol + col < 0 ||
          cellCol + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          playfield[cellRow + row][cellCol + col])
        ) {
        return false;
      }
    }
  }
  return true;
}

function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        if (tetromino.row + row < 0) {
          return showGameOver();
        }
        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // Check for line clears and update score
  let linesCleared = 0;
  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every(cell => !!cell)) {
      linesCleared++;
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r-1][c];
        }
      }
    } else {
      row--;
    }
  }

  // Update score based on lines cleared
  if (linesCleared > 0) {
    score += linesCleared * 100;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('tetrisBestScore', bestScore);
    }
  }

  tetromino = getNextTetromino();
}

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;
  bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
  gameOverModal.style.display = 'flex';
}

function resetGame() {
  // Clear the playfield
  for (let row = -2; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }
  
  // Reset game variables
  tetrominoSequence.length = 0;
  count = 0;
  score = 0;
  gameOver = false;
  tetromino = getNextTetromino();
  
  // Hide game over modal
  gameOverModal.style.display = 'none';
  
  // Start the game loop
  rAF = requestAnimationFrame(loop);
}

// Game controls
function moveLeft() {
  if (gameOver) return;
  const col = tetromino.col - 1;
  if (isValidMove(tetromino.matrix, tetromino.row, col)) {
    tetromino.col = col;
  }
}

function moveRight() {
  if (gameOver) return;
  const col = tetromino.col + 1;
  if (isValidMove(tetromino.matrix, tetromino.row, col)) {
    tetromino.col = col;
  }
}

function rotateTetromino() {
  if (gameOver) return;
  const matrix = rotate(tetromino.matrix);
  if (isValidMove(matrix, tetromino.row, tetromino.col)) {
    tetromino.matrix = matrix;
  }
}

function moveDown() {
  if (gameOver) return;
  const row = tetromino.row + 1;
  if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
    tetromino.row = row - 1;
    placeTetromino();
    return;
  }
  tetromino.row = row;
}

// Event listeners
document.addEventListener('keydown', function(e) {
  if (gameOver) return;

  switch(e.which) {
    case 37: moveLeft(); break;
    case 39: moveRight(); break;
    case 38: rotateTetromino(); break;
    case 40: moveDown(); break;
  }
});

leftBtn.addEventListener('click', moveLeft);
rightBtn.addEventListener('click', moveRight);
rotateBtn.addEventListener('click', rotateTetromino);
downBtn.addEventListener('click', moveDown);
tryAgainBtn.addEventListener('click', resetGame);

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, false);

canvas.addEventListener('touchend', (e) => {
  if (gameOver) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) moveRight();
    else moveLeft();
  } else {
    if (dy > 0) moveDown();
    else rotateTetromino();
  }
}, false);

// Game loop
function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the playfield
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];
        context.fillRect(col * grid, row * grid, grid-1, grid-1);
      }
    }
  }

  // Draw the active tetromino
  if (tetromino) {
    if (++count > 35) {
      tetromino.row++;
      count = 0;
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
      }
    }

    context.fillStyle = colors[tetromino.name];
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect(
            (tetromino.col + col) * grid, 
            (tetromino.row + row) * grid, 
            grid-1, 
            grid-1
          );
        }
      }
    }
  }
}

// Start the game
resetGame();
