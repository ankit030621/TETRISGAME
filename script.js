let canvas = document.querySelector("#tetris");
let scoreboard = document.querySelector("#scoreboard");
let finalScore = document.querySelector("#finalScore");
let gameOverPopup = document.querySelector("#gameOverPopup");
let ctx = canvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
let cellSize = canvas.width / COLS;

ctx.scale(cellSize, cellSize);

const SHAPES = [
  [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  [[0,1,0],[0,1,0],[1,1,0]],
  [[0,1,0],[0,1,0],[0,1,1]],
  [[1,1,0],[0,1,1],[0,0,0]],
  [[0,1,1],[1,1,0],[0,0,0]],
  [[1,1,1],[0,1,0],[0,0,0]],
  [[1,1],[1,1]]
];

const COLORS = [
  "#000", "#9b5fe0", "#16a4d8", "#60dbe8", "#8bd346", "#efdf48", "#f9a52c", "#d64e12"
];

let grid = generateGrid();
let fallingPiece = null;
let score = 0;
let gameInterval = setInterval(updateGame, 500);

function generateGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function updateGame() {
  if (!fallingPiece) {
    fallingPiece = createPiece();
    if (collision(fallingPiece.x, fallingPiece.y)) {
      endGame();
      return;
    }
  }
  moveDown();
  clearLines();
  render();
}

function createPiece() {
  let index = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[index],
    colorIndex: index + 1,
    x: 3,
    y: 0
  };
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  grid.forEach((row, y) => {
    row.forEach((val, x) => {
      ctx.fillStyle = COLORS[val];
      if (val) ctx.fillRect(x, y, 1, 1);
    });
  });

  if (fallingPiece) {
    fallingPiece.shape.forEach((row, i) => {
      row.forEach((val, j) => {
        if (val) {
          ctx.fillStyle = COLORS[fallingPiece.colorIndex];
          ctx.fillRect(fallingPiece.x + j, fallingPiece.y + i, 1, 1);
        }
      });
    });
  }

  scoreboard.textContent = `Score: ${score}`;
}

function collision(x, y, shape = fallingPiece.shape) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (
        shape[i][j] &&
        (grid[y + i]?.[x + j] !== 0 ||
         x + j < 0 ||
         x + j >= COLS ||
         y + i >= ROWS)
      ) return true;
    }
  }
  return false;
}

function moveDown() {
  if (!collision(fallingPiece.x, fallingPiece.y + 1)) {
    fallingPiece.y++;
  } else {
    freezePiece();
    fallingPiece = null;
  }
}

function moveLeft() {
  if (!fallingPiece || collision(fallingPiece.x - 1, fallingPiece.y)) return;
  fallingPiece.x--;
  render();
}

function moveRight() {
  if (!fallingPiece || collision(fallingPiece.x + 1, fallingPiece.y)) return;
  fallingPiece.x++;
  render();
}

function rotate() {
  let rotated = fallingPiece.shape[0].map((_, i) =>
    fallingPiece.shape.map(row => row[i])
  ).reverse();

  if (!collision(fallingPiece.x, fallingPiece.y, rotated)) {
    fallingPiece.shape = rotated;
  }
  render();
}

function freezePiece() {
  fallingPiece.shape.forEach((row, i) => {
    row.forEach((val, j) => {
      if (val) {
        let y = fallingPiece.y + i;
        let x = fallingPiece.x + j;
        if (y < 0) {
          endGame();
        } else {
          grid[y][x] = fallingPiece.colorIndex;
        }
      }
    });
  });
}

function clearLines() {
  let lines = 0;
  grid = grid.filter(row => {
    if (row.every(cell => cell !== 0)) {
      lines++;
      return false;
    }
    return true;
  });
  while (grid.length < ROWS) grid.unshift(Array(COLS).fill(0));
  if (lines > 0) score += lines * 10;
}

function endGame() {
  clearInterval(gameInterval);
  gameOverPopup.classList.remove("hidden");
  finalScore.textContent = `Your Score: ${score}`;
}

function restartGame() {
  grid = generateGrid();
  score = 0;
  fallingPiece = null;
  gameOverPopup.classList.add("hidden");
  gameInterval = setInterval(updateGame, 500);
  render();
}

document.addEventListener("keydown", e => {
  if (!fallingPiece) return;
  if (e.key === "ArrowLeft") moveLeft();
  else if (e.key === "ArrowRight") moveRight();
  else if (e.key === "ArrowDown") moveDown();
  else if (e.key === "ArrowUp") rotate();
});

window.addEventListener("keydown", function (e) {
  if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
}, false);
