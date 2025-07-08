<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Tetris Game</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="game-container">
    <canvas id="game"></canvas>
    <div class="controls">
      <button id="left-btn" class="control-btn">←</button>
      <button id="rotate-btn" class="control-btn">↻</button>
      <button id="right-btn" class="control-btn">→</button>
      <button id="down-btn" class="control-btn">↓</button>
    </div>
    <div id="game-over-modal" class="modal">
      <div class="modal-content">
        <h2>GAME OVER!</h2>
        <p id="best-score">Best Score: 0</p>
        <button id="try-again-btn">Try Again</button>
      </div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>
