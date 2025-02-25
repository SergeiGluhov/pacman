"use strict";

// Функция для преобразования массива строк в двумерный массив чисел
function parseMap(mapStringArray) {
  return mapStringArray.map(row => row.split("").map(Number));
}

// Глобальные переменные
let game;
let currentMap;

// --- Константы ---
const CELL_SIZE = 16;
const BOARD_COLS = 28;
const BOARD_ROWS = 31;

// --- Уровни ---
// Уровень 1 (31 строка, 28 символов)
const level1String = [
  "1111111111111111111111111111",
  "1222222222222112222222222221",
  "1211111111112111211111111121",
  "1211111111112111211111111121",
  "1222222222222222222222222221",
  "1211111111111111111111111121",
  "1211111111111111111111111121",
  "1222222222222112222222222221",
  "1211111111112111211111111121",
  "1211111111112111211111111121",
  "1222222222222222222222222221",
  "1211111111111111111111111121",
  "1211111111111111111111111121",
  "1222222222222112222222222221",
  "1211111111112111211111111121",
  "1211111111112111211111111121",
  "1222222222222222222222222221",
  "1211111111111111111111111121",
  "1211111111111111111111111121",
  "1222222222222112222222222221",
  "1211111111112111211111111121",
  "1211111111112111211111111121",
  "1222222222222222222222222221",
  "1211111111111111111111111121",
  "1211111111111111111111111121",
  "1222222222222112222222222221",
  "1211111111112111211111111121",
  "1211111111112111211111111121",
  "1222222222222222222222222221",
  "1111111111111111111111111111"
];

const level2String = [
  "1111111111111111111111111111",
  "1222222222222222222222222221",
  "1211111211111111112111111121",
  "1211111212222222222111111121",
  "1222221212222112222212222221",
  "1211111212222112222211111111",
  "1211111212222222222211111111",
  "1222221211111111112112222221",
  "1211111211111111112111111121",
  "1211111212222222222111111121",
  "1222221212222222222212222221",
  "1211111211111111112111111121",
  "1211111211111111112111111121",
  "1222222222222112222222222221",
  "1111111111112112111111111111",
  "1111111111112112111111111111",
  "1222222222222222222222222221",
  "1211111111111111111111111121",
  "1211111111111111111111111121",
  "1222222222222112222222222221",
  "1211111211112111112111111121",
  "1211111211112111112111111121",
  "1222221212222222222212222221",
  "1211111211111111112111111121",
  "1211111211111111112111111121",
  "1222222222222222222222222221",
  "1211111111112112111111111121",
  "1211111111112112111111111121",
  "1222222222222112222222222221",
  "1111111111111111111111111111",
  "1111111111111111111111111111"
];

const level3String = [
  "1111111111111111111111111111",
  "1222222222222222222222222221",
  "1211111211111111112111111121",
  "1211111212222222222111111121",
  "1222221212222112222212222221",
  "1211111212222112222211111111",
  "1211111212222222222211111111",
  "1222221211111111112112222221",
  "1211111211111111112111111121",
  "1211111212222222222111111121",
  "1222221212222222222212222221",
  "1211111211111111112111111121",
  "1211111211111111112111111121",
  "1222222222222112222222222221",
  "1111111111112112111111111111",
  "1111111122222222222211111111",
  "1222222222222222222222222221",
  "1211121112111211121111211121",
  "1211111221122211211111111111",
  "1222222222222222222222222221",
  "1212222222222222222222222121",
  "1212112112112112112112112111",
  "1211111111111111111111111121",
  "1222222222222222222222222221",
  "1211122111122111122111122111",
  "1212211221122112211221122111",
  "1222222222222222222222222221",
  "1211111111111111111111111121",
  "1212121212121212121212121211",
  "1222222222222222222222222221",
  "1111111111111111111111111111"
];

const parsedLevel1 = parseMap(level1String);
const parsedLevel2 = parseMap(level2String);
const parsedLevel3 = parseMap(level3String);

// --- Класс GameMap ---
class GameMap {
  constructor(layout) {
    this.layout = layout;
  }
  draw(ctx) {
    for (let row = 0; row < this.layout.length; row++) {
      for (let col = 0; col < this.layout[row].length; col++) {
        const cell = this.layout[row][col];
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        if (cell === 1) {
          ctx.fillStyle = 'blue';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        } else if (cell === 2) {
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }
  isWall(x, y) {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    if (row < 0 || row >= this.layout.length || col < 0 || col >= this.layout[0].length) {
      return true;
    }
    return this.layout[row][col] === 1;
  }
}

// --- Класс PacMan ---
class PacMan {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.speed = 150;
    this.radius = CELL_SIZE / 2;
    this.mouthAngle = 0.25;
    this.collisionSize = CELL_SIZE * 0.8;
    this.collisionOffset = (CELL_SIZE - this.collisionSize) / 2;
    this.lastTurnTile = null;
  }
  update(deltaTime, map) {
    const distance = (this.speed * deltaTime) / 1000;
    if ((this.nextDirection.x !== 0 || this.nextDirection.y !== 0) &&
        (this.nextDirection.x !== this.direction.x || this.nextDirection.y !== this.direction.y) &&
        this.canMove(this.nextDirection, map)) {
      const centerX = this.x + this.radius;
      const centerY = this.y + this.radius;
      const cellCol = Math.floor(centerX / CELL_SIZE);
      const cellRow = Math.floor(centerY / CELL_SIZE);
      const gridCenterX = cellCol * CELL_SIZE + CELL_SIZE / 2;
      const gridCenterY = cellRow * CELL_SIZE + CELL_SIZE / 2;
      const threshold = 7;
      if (Math.abs(centerX - gridCenterX) < threshold &&
          Math.abs(centerY - gridCenterY) < threshold) {
        this.x = gridCenterX - this.radius;
        this.y = gridCenterY - this.radius;
        this.direction = { ...this.nextDirection };
        this.lastTurnTile = { col: cellCol, row: cellRow };
      }
    }
    let newX = this.x + this.direction.x * distance;
    if (!this.collides(newX, this.y, map)) {
      this.x = newX;
    }
    let newY = this.y + this.direction.y * distance;
    if (!this.collides(this.x, newY, map)) {
      this.y = newY;
    }
  }
  collides(newX, newY, map) {
    const EPSILON = 0.1;
    const left = newX + this.collisionOffset + EPSILON;
    const top = newY + this.collisionOffset + EPSILON;
    const right = left + this.collisionSize - 2 * EPSILON;
    const bottom = top + this.collisionSize - 2 * EPSILON;
    const corners = [
      { x: left, y: top },
      { x: right, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom }
    ];
    for (let corner of corners) {
      if (map.isWall(corner.x, corner.y)) return true;
    }
    return false;
  }
  canMove(direction, map) {
    const testX = this.x + direction.x * CELL_SIZE;
    const testY = this.y + direction.y * CELL_SIZE;
    return !this.collides(testX, testY, map);
  }
  draw(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.x + this.radius, this.y + this.radius, this.radius,
      this.mouthAngle * Math.PI, (2 - this.mouthAngle) * Math.PI);
    ctx.lineTo(this.x + this.radius, this.y + this.radius);
    ctx.fill();
  }
}

// --- Новый класс Ghost ---
// Призрак всегда находится в центре клетки. При достижении центра выбирает новое направление.
// Если рядом находится Pac-Man и он виден (без преград по строке или столбцу), то выбирается направление к нему.
// Если призрак слишком долго двигается в одном направлении (зацикливается), он принудительно выбирает случайное направление.
class Ghost {
  constructor(tileX, tileY, color, map) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.color = color;
    this.map = map;
    this.speed = 80;
    this.radius = CELL_SIZE * 0.5;
    this.x = this.tileX * CELL_SIZE + CELL_SIZE / 2;
    this.y = this.tileY * CELL_SIZE + CELL_SIZE / 2;
    this.straightCount = 0;
    this.direction = this.getRandomDirection();
    this.chooseTarget();
  }
  getAvailableDirections() {
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    let available = [];
    for (let d of dirs) {
      const nx = this.tileX + d.dx;
      const ny = this.tileY + d.dy;
      if (ny >= 0 && ny < this.map.layout.length &&
          nx >= 0 && nx < this.map.layout[0].length &&
          this.map.layout[ny][nx] !== 1) {
        available.push(d);
      }
    }
    return available;
  }
  getRandomDirection() {
    let available = this.getAvailableDirections();
    if (available.length === 0) return { dx: 0, dy: 0 };
    return available[Math.floor(Math.random() * available.length)];
  }
  chooseTarget() {
    this.targetTileX = this.tileX + this.direction.dx;
    this.targetTileY = this.tileY + this.direction.dy;
  }
  canSeePacman(pacman) {
    const ghostTileX = this.tileX;
    const ghostTileY = this.tileY;
    const pacTileX = Math.floor((pacman.x + pacman.radius) / CELL_SIZE);
    const pacTileY = Math.floor((pacman.y + pacman.radius) / CELL_SIZE);
    if (ghostTileY === pacTileY) {
      const minX = Math.min(ghostTileX, pacTileX);
      const maxX = Math.max(ghostTileX, pacTileX);
      for (let x = minX + 1; x < maxX; x++) {
        if (this.map.layout[ghostTileY][x] === 1) return false;
      }
      return true;
    } else if (ghostTileX === pacTileX) {
      const minY = Math.min(ghostTileY, pacTileY);
      const maxY = Math.max(ghostTileY, pacTileY);
      for (let y = minY + 1; y < maxY; y++) {
        if (this.map.layout[y][ghostTileX] === 1) return false;
      }
      return true;
    }
    return false;
  }
  chooseDirection(pacman) {
    let available = this.getAvailableDirections();
    if (this.direction.dx !== 0 || this.direction.dy !== 0) {
      let nonReverse = available.filter(d => !(d.dx === -this.direction.dx && d.dy === -this.direction.dy));
      if (nonReverse.length > 0) {
        available = nonReverse;
      }
    }
    if (pacman && this.canSeePacman(pacman)) {
      const pacTileX = Math.floor((pacman.x + pacman.radius) / CELL_SIZE);
      const pacTileY = Math.floor((pacman.y + pacman.radius) / CELL_SIZE);
      for (let d of available) {
        if (this.tileX + d.dx === pacTileX && this.tileY + d.dy === pacTileY) {
          this.direction = d;
          this.straightCount = 0;
          this.chooseTarget();
          return;
        }
      }
    }
    let canContinue = available.some(d => d.dx === this.direction.dx && d.dy === this.direction.dy);
    if (canContinue && Math.random() < 0.7 && this.straightCount < 3) {
      this.straightCount++;
      this.chooseTarget();
      return;
    }
    this.direction = available[Math.floor(Math.random() * available.length)];
    this.straightCount = 0;
    this.chooseTarget();
  }
  update(deltaTime, map, pacman) {
    const targetCenter = {
      x: this.targetTileX * CELL_SIZE + CELL_SIZE / 2,
      y: this.targetTileY * CELL_SIZE + CELL_SIZE / 2
    };
    const currentCenter = { x: this.x, y: this.y };
    const dx = targetCenter.x - currentCenter.x;
    const dy = targetCenter.y - currentCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveDist = (this.speed * deltaTime) / 1000;
    if (moveDist >= dist) {
      this.x = targetCenter.x;
      this.y = targetCenter.y;
      this.tileX = this.targetTileX;
      this.tileY = this.targetTileY;
      this.chooseDirection(pacman);
    } else {
      this.x += (dx / dist) * moveDist;
      this.y += (dy / dist) * moveDist;
    }
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Класс игры ---
class Game {
  constructor(canvas, ctx, levelMap) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.map = new GameMap(levelMap);
    this.pacman = new PacMan(1 * CELL_SIZE, 3 * CELL_SIZE);
    this.ghosts = [
      new Ghost(14, 10, 'red', this.map),
      new Ghost(12, 10, 'pink', this.map),
      new Ghost(16, 10, 'cyan', this.map)
    ];
    this.score = 0;
    this.lives = 3;
    this.lastTime = 0;
    this.running = true;
  }
  start() {
    this.running = true;
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  gameLoop(timestamp) {
    if (!this.running) return;
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update(deltaTime);
    this.resolveGhostConflicts();
    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  update(deltaTime) {
    this.pacman.update(deltaTime, this.map);
    for (const ghost of this.ghosts) {
      ghost.update(deltaTime, this.map, this.pacman);
    }
    this.checkPellets();
    this.checkGhostCollisions();
  }
  checkPellets() {
    const pacCenterX = this.pacman.x + this.pacman.radius;
    const pacCenterY = this.pacman.y + this.pacman.radius;
    const col = Math.floor(pacCenterX / CELL_SIZE);
    const row = Math.floor(pacCenterY / CELL_SIZE);
    if (this.map.layout[row] && this.map.layout[row][col] === 2) {
      this.map.layout[row][col] = 0;
      this.score += 10;
    }
  }
  checkGhostCollisions() {
    for (let i = 0; i < this.ghosts.length; i++) {
      const ghost = this.ghosts[i];
      const pacCenterX = this.pacman.x + this.pacman.radius;
      const pacCenterY = this.pacman.y + this.pacman.radius;
      const ghostCenterX = ghost.x;
      const ghostCenterY = ghost.y;
      const dx = pacCenterX - ghostCenterX;
      const dy = pacCenterY - ghostCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.pacman.radius + ghost.radius - 2) {
        this.lives--;
        if (this.lives <= 0) {
          this.gameOver();
        } else {
          this.resetPacman();
        }
        break;
      }
    }
  }
  resolveGhostConflicts() {
    let occupied = new Set();
    for (let ghost of this.ghosts) {
      let key = ghost.tileX + "," + ghost.tileY;
      if (occupied.has(key)) {
        ghost.chooseDirection(this.pacman);
        ghost.x += Math.random() * 4 - 2;
        ghost.y += Math.random() * 4 - 2;
      } else {
        occupied.add(key);
      }
    }
  }
  resetPacman() {
    this.pacman.x = 1 * CELL_SIZE;
    this.pacman.y = 3 * CELL_SIZE;
    this.pacman.direction = { x: 0, y: 0 };
    this.pacman.nextDirection = { x: 0, y: 0 };
  }
  gameOver() {
    this.running = false;
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gameOverMenu').style.display = 'block';
    document.getElementById('finalScore').textContent = "Ваш счет: " + this.score;
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.map.draw(this.ctx);
    this.pacman.draw(this.ctx);
    for (const ghost of this.ghosts) {
      ghost.draw(this.ctx);
    }
    this.drawUI();
  }
  drawUI() {
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px Arial';
    this.ctx.fillText("Score: " + this.score, 0, this.canvas.height - 10);
    this.ctx.fillText("Lives: " + this.lives, this.canvas.width - 60, this.canvas.height - 10);
  }
}

// --- Мобильное управление ---
// Добавляем кнопки управления для сенсорных устройств внутрь #gameContainer
function setupTouchControls() {
  const controlsHTML = `
    <div id="touchControls">
      <button id="upButton">↑</button>
      <div>
        <button id="leftButton">←</button>
        <button id="downButton">↓</button>
        <button id="rightButton">→</button>
      </div>
    </div>
  `;
  const gameContainer = document.getElementById("gameContainer");
  if (gameContainer) {
    gameContainer.insertAdjacentHTML("beforeend", controlsHTML);
  }
  
  const upButton = document.getElementById("upButton");
  const downButton = document.getElementById("downButton");
  const leftButton = document.getElementById("leftButton");
  const rightButton = document.getElementById("rightButton");

  if (upButton) {
    upButton.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (game && game.pacman) game.pacman.nextDirection = { x: 0, y: -1 };
    });
    upButton.addEventListener("click", () => {
      if (game && game.pacman) game.pacman.nextDirection = { x: 0, y: -1 };
    });
  }
  if (downButton) {
    downButton.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (game && game.pacman) game.pacman.nextDirection = { x: 0, y: 1 };
    });
    downButton.addEventListener("click", () => {
      if (game && game.pacman) game.pacman.nextDirection = { x: 0, y: 1 };
    });
  }
  if (leftButton) {
    leftButton.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (game && game.pacman) game.pacman.nextDirection = { x: -1, y: 0 };
    });
    leftButton.addEventListener("click", () => {
      if (game && game.pacman) game.pacman.nextDirection = { x: -1, y: 0 };
    });
  }
  if (rightButton) {
    rightButton.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (game && game.pacman) game.pacman.nextDirection = { x: 1, y: 0 };
    });
    rightButton.addEventListener("click", () => {
      if (game && game.pacman) game.pacman.nextDirection = { x: 1, y: 0 };
    });
  }
}

window.addEventListener("load", setupTouchControls);

// --- Обработчики клавиатуры ---
document.addEventListener('keydown', (event) => {
  if (!game || !game.pacman) return;
  switch (event.key) {
    case 'ArrowUp':
      game.pacman.nextDirection = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      game.pacman.nextDirection = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      game.pacman.nextDirection = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      game.pacman.nextDirection = { x: 1, y: 0 };
      break;
  }
});

// --- Обработчики меню ---
document.querySelectorAll('#menu button').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameOverMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    const level = button.getAttribute('data-level');
    let selectedMap;
    if (level === "1") {
      selectedMap = parseMap(level1String);
    } else if (level === "2") {
      selectedMap = parseMap(level2String);
    } else if (level === "3") {
      selectedMap = parseMap(level3String);
    }
    currentMap = JSON.parse(JSON.stringify(selectedMap));;
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    game = new Game(canvas, ctx, selectedMap);
    game.start();
  });
});

document.getElementById('restartGame').addEventListener('click', () => {
  if (game) {
    game.score = 0;
    game.lives = 3;
    // Создаем новый экземпляр игры с сохраненной текущей картой
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    game = new Game(canvas, ctx, currentMap);
    document.getElementById('gameOverMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    game.start();
  }
});

document.getElementById('selectLevel').addEventListener('click', () => {
  document.getElementById('gameOverMenu').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('menu').style.display = 'block';
});
