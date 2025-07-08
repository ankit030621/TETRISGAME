let canvas = document.querySelector("#tetris");
let scoreboard = document.querySelector("#scoreboard");
let ctx = canvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
let cellSize = canvas.width / COLS;

ctx.scale(cellSize, cellSize);

const SHAPES = [
  [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]], // I
  [[0,1,0],[0,1,0],[1,1,0]], // J
  [[0,1,0],[0,1,0],[0,1,1]], // L
  [[1,1,0],[0,1,1],[0,0,0]], // S
  [[0,1,1],[1,1,0],[0,0,0]], // Z
  [[1,1,1],[0,1,0],[0,0,0]], // T
  [[1,1],[1,1]] // O
];

const COLORS = [
  "#000", "#9b5fe0", "#16a4d8", "#60dbe8", "#8bd346", "#efdf48", "#f9a52c", "#d64e12"
];

let grid = generateGrid();
let fallingPiece = null;
let score = 0;

setInterval(() => {
  updateGame();
}, 500);

function generateGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function updateGame() {
  clearLines();
  if (!fallingPiece) {
    fallingPiece = createPiece();
  }
  moveDown();
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
        (grid[y + i] && grid[y + i][x + j]) !== 0 ||
        x + j < 0 ||
        x + j >= COLS ||
        y + i >= ROWS
      ) {
        return true;
      }
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
  render();
}

function moveLeft() {
  if (!collision(fallingPiece.x - 1, fallingPiece.y)) {
    fallingPiece.x--;
  }
  render();
}

function moveRight() {
  if (!collision(fallingPiece.x + 1, fallingPiece.y)) {
    fallingPiece.x++;
  }
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
        if (fallingPiece.y + i < 0) {
          alert("Game Over");
          grid = generateGrid();
          score = 0;
        } else {
          grid[fallingPiece.y + i][fallingPiece.x + j] = fallingPiece.colorIndex;
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

  while (grid.length < ROWS) {
    grid.unshift(Array(COLS).fill(0));
  }

  if (lines > 0) {
    score += lines * 10;
  }
}

// Keyboard support
document.addEventListener("keydown", e => {
  if (!fallingPiece) return;
  if (e.key === "ArrowLeft") moveLeft();
  else if (e.key === "ArrowRight") moveRight();
  else if (e.key === "ArrowDown") moveDown();
  else if (e.key === "ArrowUp") rotate();
});

// Prevent scroll on arrow keys
window.addEventListener("keydown", function (e) {
  if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
}, false);
