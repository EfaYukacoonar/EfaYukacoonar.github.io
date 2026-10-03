(() => {
  "use strict";

  // =========================================
  // DOM
  // =========================================

  const canvas = document.querySelector("#board");
  const ctx = canvas.getContext("2d");

  const scoreEl = document.querySelector("#score");
  const linesEl = document.querySelector("#lines");
  const levelEl = document.querySelector("#level");

  const overlay = document.querySelector("#overlay");
  const title = document.querySelector("#overlayTitle");
  const overlayText = document.querySelector("#overlayText");
  const startButton = document.querySelector("#start");
  const status = document.querySelector("#status");

  const pauseButton = document.querySelector("#pauseTop");

  const holdEl = document.querySelector("#hold");
  const nextEl = document.querySelector("#next");

  // =========================================
  // Board
  // =========================================

  const CELL = 30;
  const WIDTH = 10;
  const HEIGHT = 20;

  // =========================================
  // Tetromino colors
  // =========================================

  const colors = {
    I: "#55e8ff",
    J: "#668cff",
    L: "#ffad5c",
    O: "#ffe66b",
    S: "#65e887",
    T: "#bd79ff",
    Z: "#ff668b"
  };

  // =========================================
  // Tetromino shapes
  // =========================================

  const shapes = {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],

    J: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],

    L: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],

    O: [
      [1, 1],
      [1, 1]
    ],

    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],

    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],

    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ]
  };

  const types = Object.keys(shapes);

  // =========================================
  // Game state
  // =========================================

  let board = [];
  let piece = null;

  let next = [];
  let hold = null;

  let canHold = true;

  let score = 0;
  let lines = 0;
  let level = 1;

  let running = false;
  let paused = false;

  let dropTimer = 0;
  let lastTime = 0;
  let animationFrame = null;

  // =========================================
  // Utility
  // =========================================

  function cloneMatrix(matrix) {
    return matrix.map(row => row.slice());
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  // =========================================
  // 7-Bag system
  // =========================================

  function refillNext() {
    while (next.length < 6) {
      next.push(...shuffle(types.slice()));
    }
  }

  // =========================================
  // Create piece
  // =========================================

  function createPiece(type) {
    const matrix = cloneMatrix(shapes[type]);

    return {
      type,
      matrix,
      x: Math.floor((WIDTH - matrix[0].length) / 2),
      y: -1
    };
  }

  // =========================================
  // Reset game
  // =========================================

  function resetGame() {
    board = Array.from(
      { length: HEIGHT },
      () => Array(WIDTH).fill(null)
    );

    next = [];
    hold = null;

    canHold = true;

    score = 0;
    lines = 0;
    level = 1;

    dropTimer = 0;

    refillNext();

    piece = createPiece(next.shift());

    refillNext();

    updateUI();
    draw();
  }

  // =========================================
  // Collision detection
  // =========================================

  function isColliding(
    currentPiece,
    offsetX = 0,
    offsetY = 0,
    matrix = currentPiece.matrix
  ) {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {

        if (!matrix[y][x]) {
          continue;
        }

        const boardX =
          currentPiece.x + x + offsetX;

        const boardY =
          currentPiece.y + y + offsetY;

        if (boardX < 0 || boardX >= WIDTH) {
          return true;
        }

        if (boardY >= HEIGHT) {
          return true;
        }

        if (
          boardY >= 0 &&
          board[boardY][boardX]
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // =========================================
  // Merge piece into board
  // =========================================

  function mergePiece() {
    piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {

        if (!value) {
          return;
        }

        const boardY = piece.y + y;
        const boardX = piece.x + x;

        if (
          boardY >= 0 &&
          boardY < HEIGHT &&
          boardX >= 0 &&
          boardX < WIDTH
        ) {
          board[boardY][boardX] = piece.type;
        }
      });
    });
  }

  // =========================================
  // Clear completed lines
  // =========================================

  function clearLines() {
    let cleared = 0;

    for (let y = HEIGHT - 1; y >= 0; y--) {

      if (board[y].every(Boolean)) {

        board.splice(y, 1);

        board.unshift(
          Array(WIDTH).fill(null)
        );

        cleared++;

        // Check the same row again after shifting.
        y++;
      }
    }

    if (cleared > 0) {

      const lineScores = [
        0,
        100,
        300,
        500,
        800
      ];

      score += lineScores[cleared] * level;

      lines += cleared;

      level =
        1 + Math.floor(lines / 10);
    }
  }

  // =========================================
  // Spawn next piece
  // =========================================

  function spawnPiece() {
    piece = createPiece(next.shift());

    refillNext();

    canHold = true;

    // Game over
    if (isColliding(piece)) {

      running = false;
      paused = false;

      status.textContent = "GAME OVER";

      showOverlay(
        "GAME OVER",
        `Score ${score.toLocaleString()}`,
        "RESTART"
      );
    }
  }

  // =========================================
  // Lock piece
  // =========================================

  function lockPiece() {
    mergePiece();

    clearLines();

    spawnPiece();

    updateUI();
  }

  // =========================================
  // Move
  // =========================================

  function move(direction) {

    if (!running || paused) {
      return;
    }

    if (!isColliding(piece, direction, 0)) {
      piece.x += direction;
    }

    draw();
  }

  // =========================================
  // Soft drop
  // =========================================

  function softDrop() {

    if (!running || paused) {
      return;
    }

    if (!isColliding(piece, 0, 1)) {

      piece.y++;

      // Small score bonus for manual soft drop.
      score++;

      dropTimer = 0;

    } else {
      lockPiece();
    }

    updateUI();
    draw();
  }

  // =========================================
  // Hard drop
  // =========================================

  function hardDrop() {

    if (!running || paused) {
      return;
    }

    let distance = 0;

    while (!isColliding(piece, 0, 1)) {
      piece.y++;
      distance++;
    }

    score += distance * 2;

    lockPiece();

    updateUI();
    draw();
  }

  // =========================================
  // Rotation
  // =========================================

  function rotatePiece() {

    if (!running || paused) {
      return;
    }

    const rotated = piece.matrix[0].map(
      (_, index) =>
        piece.matrix
          .map(row => row[index])
          .reverse()
    );

    // Simple wall-kick system.
    const kicks = [
      0,
      -1,
      1,
      -2,
      2
    ];

    for (const kick of kicks) {

      if (
        !isColliding(
          piece,
          kick,
          0,
          rotated
        )
      ) {

        piece.x += kick;
        piece.matrix = rotated;

        break;
      }
    }

    draw();
  }

  // =========================================
  // Hold
  // =========================================

  function holdPiece() {

    if (
      !running ||
      paused ||
      !canHold
    ) {
      return;
    }

    const currentType = piece.type;

    if (hold === null) {

      hold = currentType;

      spawnPiece();

    } else {

      const heldType = hold;

      hold = currentType;

      piece = createPiece(heldType);
    }

    canHold = false;

    draw();
  }

  // =========================================
  // Pause
  // =========================================

  function togglePause() {

    if (!running) {
      return;
    }

    paused = !paused;

    if (paused) {

      status.textContent = "PAUSED";

      showOverlay(
        "PAUSED",
        "Take a breath.",
        "RESUME"
      );

    } else {

      status.textContent = "PLAYING";

      hideOverlay();

      lastTime = performance.now();
    }

    draw();
  }

  // =========================================
  // Overlay
  // =========================================

  function showOverlay(
    overlayTitle,
    text,
    buttonText
  ) {
    title.textContent = overlayTitle;
    overlayText.textContent = text;
    startButton.textContent = buttonText;

    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  // =========================================
  // Draw cell
  // =========================================

  function drawCell(
    x,
    y,
    type,
    alpha = 1
  ) {

    if (y < 0) {
      return;
    }

    ctx.save();

    ctx.globalAlpha = alpha;

    ctx.fillStyle = colors[type];

    ctx.fillRect(
      x * CELL + 1,
      y * CELL + 1,
      CELL - 2,
      CELL - 2
    );

    // Highlight
    ctx.fillStyle = "#ffffff30";

    ctx.fillRect(
      x * CELL + 3,
      y * CELL + 3,
      CELL - 6,
      3
    );

    ctx.restore();
  }

  // =========================================
  // Draw board
  // =========================================

  function draw() {

    // Background
    ctx.fillStyle = "#060913";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Grid
    ctx.strokeStyle = "#687ca01f";

    for (let x = 0; x <= WIDTH; x++) {

      ctx.beginPath();

      ctx.moveTo(
        x * CELL + 0.5,
        0
      );

      ctx.lineTo(
        x * CELL + 0.5,
        canvas.height
      );

      ctx.stroke();
    }

    for (let y = 0; y <= HEIGHT; y++) {

      ctx.beginPath();

      ctx.moveTo(
        0,
        y * CELL + 0.5
      );

      ctx.lineTo(
        canvas.width,
        y * CELL + 0.5
      );

      ctx.stroke();
    }

    // Locked blocks
    board.forEach((row, y) => {

      row.forEach((type, x) => {

        if (type) {
          drawCell(x, y, type);
        }

      });
    });

    // Current piece + ghost
    if (piece) {

      let ghostY = piece.y;

      while (
        !isColliding(
          {
            ...piece,
            y: ghostY
          },
          0,
          1
        )
      ) {
        ghostY++;
      }

      // Ghost
      piece.matrix.forEach(
        (row, y) => {

          row.forEach(
            (value, x) => {

              if (value) {

                drawCell(
                  piece.x + x,
                  ghostY + y,
                  piece.type,
                  0.16
                );
              }
            }
          );
        }
      );

      // Active piece
      piece.matrix.forEach(
        (row, y) => {

          row.forEach(
            (value, x) => {

              if (value) {

                drawCell(
                  piece.x + x,
                  piece.y + y,
                  piece.type
                );
              }
            }
          );
        }
      );
    }

    renderPreviews();
  }

  // =========================================
  // Preview grid
  // =========================================

  function createPreviewGrid(
    element,
    type
  ) {

    element.innerHTML = "";

    for (let y = 0; y < 4; y++) {

      for (let x = 0; x < 4; x++) {

        const cell =
          document.createElement("span");

        const matrix = shapes[type];

        if (
          matrix &&
          matrix[y] &&
          matrix[y][x]
        ) {
          cell.style.background =
            colors[type];
        }

        element.appendChild(cell);
      }
    }
  }

  // =========================================
  // Render HOLD / NEXT
  // =========================================

  function renderPreviews() {

    // HOLD
    holdEl.innerHTML = "";

    if (hold) {
      createPreviewGrid(
        holdEl,
        hold
      );
    } else {

      for (let i = 0; i < 16; i++) {
        holdEl.appendChild(
          document.createElement("span")
        );
      }
    }

    // NEXT
    nextEl.innerHTML = "";

    next.slice(0, 4).forEach(type => {

      const item =
        document.createElement("div");

      item.className = "next-item";

      const grid =
        document.createElement("div");

      grid.className = "next-grid";

      createPreviewGrid(
        grid,
        type
      );

      item.appendChild(grid);

      nextEl.appendChild(item);
    });
  }

  // =========================================
  // Update UI
  // =========================================

  function updateUI() {

    scoreEl.textContent =
      score.toLocaleString();

    linesEl.textContent =
      lines;

    levelEl.textContent =
      level;
  }

  // =========================================
  // Game loop
  // =========================================

  function gameLoop(time) {

    if (!running) {
      return;
    }

    const delta =
      time - lastTime;

    lastTime = time;

    if (!paused) {

      dropTimer += delta;

      // Faster as level increases.
      const interval =
        Math.max(
          75,
          800 - (level - 1) * 65
        );

      if (dropTimer >= interval) {

        dropTimer = 0;

        if (
          !isColliding(
            piece,
            0,
            1
          )
        ) {

          piece.y++;

        } else {

          lockPiece();
        }
      }

      draw();
    }

    animationFrame =
      requestAnimationFrame(gameLoop);
  }

  // =========================================
  // Keyboard controls
  // =========================================

  const keyboardActions = {

    ArrowLeft: () => move(-1),

    a: () => move(-1),
    A: () => move(-1),

    ArrowRight: () => move(1),

    d: () => move(1),
    D: () => move(1),

    ArrowDown: softDrop,

    s: softDrop,
    S: softDrop,

    ArrowUp: rotatePiece,

    x: rotatePiece,
    X: rotatePiece,

    w: rotatePiece,
    W: rotatePiece,

    " ": hardDrop,

    c: holdPiece,
    C: holdPiece,

    Shift: holdPiece,

    Escape: togglePause,

    p: togglePause,
    P: togglePause
  };

  window.addEventListener(
    "keydown",
    event => {

      const key = event.key;

      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowDown",
          "ArrowUp",
          " ",
          "Shift"
        ].includes(key)
      ) {
        event.preventDefault();
      }

      const action =
        keyboardActions[key];

      if (action) {
        action();
      }
    },
    {
      passive: false
    }
  );

  // =========================================
  // Touch controls
  // =========================================

  document
    .querySelectorAll("[data-a]")
    .forEach(button => {

      button.addEventListener(
        "pointerdown",
        event => {

          event.preventDefault();

          const action =
            button.dataset.a;

          switch (action) {

            case "left":
              move(-1);
              break;

            case "right":
              move(1);
              break;

            case "down":
              softDrop();
              break;

            case "drop":
              hardDrop();
              break;

            case "rotate":
              rotatePiece();
              break;

            case "hold":
              holdPiece();
              break;

            case "pause":
              togglePause();
              break;
          }
        }
      );
    });

  // =========================================
  // Start / restart button
  // =========================================

  startButton.addEventListener(
    "click",
    () => {

      // Resume
      if (paused) {

        togglePause();

        return;
      }

      // Start / restart
      resetGame();

      running = true;
      paused = false;

      hideOverlay();

      status.textContent =
        "PLAYING";

      lastTime =
        performance.now();

      cancelAnimationFrame(
        animationFrame
      );

      animationFrame =
        requestAnimationFrame(
          gameLoop
        );
    }
  );

  // =========================================
  // Top pause button
  // =========================================

  pauseButton.addEventListener(
    "click",
    togglePause
  );

  // =========================================
  // Initial state
  // =========================================

  resetGame();

  showOverlay(
    "TETRIS",
    "Keyboard or touch controls",
    "START GAME"
  );

})();
