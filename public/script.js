"use strict";

// Глобальная переменная для игры
let game;

// --- Константы ---
const CELL_SIZE = 16;
const BOARD_COLS = 28;
const BOARD_ROWS = 31;

// --- Уровни ---
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

function parseMap(mapStringArray) {
  return mapStringArray.map(row => row.split("").map(Number));
}

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
    // Запоминаем клетку, в центре которой Pac-Man повернул
    this.lastTurnTile = null;
  }
  update(deltaTime, map) {
    const distance = (this.speed * deltaTime) / 2000;
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

// --- Класс Ghost с "памятью" поворотов и случайным отклонением от прямой ---
class Ghost {
  constructor(tileX, tileY, color, map) {
    // Текущая клетка (центр которой служит отправной точкой)
    this.tileX = tileX;
    this.tileY = tileY;
    this.color = color;
    this.speed = 80; // скорость (пикселей/сек)
    // Позиция призрака – центр клетки
    this.position = {
      x: tileX * CELL_SIZE + CELL_SIZE / 2,
      y: tileY * CELL_SIZE + CELL_SIZE / 2
    };
    // "Память" поворотов Pac-Man (массив объектов с полями col и row)
    this.memoryPath = [];
    // Время последнего обнаружения Pac-Man
    this.lastSeen = 0;
    // Выбираем случайное начальное направление из доступных
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    let available = directions.filter(d => {
      const nx = this.tileX + d.dx;
      const ny = this.tileY + d.dy;
      return ny >= 0 && ny < map.layout.length &&
             nx >= 0 && nx < map.layout[0].length &&
             map.layout[ny][nx] !== 1;
    });
    this.direction = available[Math.floor(Math.random() * available.length)];
    this.setTarget();
  }

  // Вычисляем целевую клетку, куда движется призрак
  setTarget() {
    this.targetTileX = this.tileX + this.direction.dx;
    this.targetTileY = this.tileY + this.direction.dy;
  }

  // Обновление позиции призрака
  update(deltaTime, map, pacman) {
    const targetCenter = {
      x: this.targetTileX * CELL_SIZE + CELL_SIZE / 2,
      y: this.targetTileY * CELL_SIZE + CELL_SIZE / 2
    };
    const moveDist = (this.speed * deltaTime) / 1000;
    const dx = targetCenter.x - this.position.x;
    const dy = targetCenter.y - this.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (moveDist >= dist) {
      // Дошли до центра следующей клетки
      this.position = targetCenter;
      this.tileX = this.targetTileX;
      this.tileY = this.targetTileY;
      // Выбираем новое направление с учетом запомненных поворотов и случайного отклонения
      this.chooseDirection(map, pacman);
      this.setTarget();
    } else {
      const nx = dx / dist;
      const ny = dy / dist;
      this.position.x += nx * moveDist;
      this.position.y += ny * moveDist;
    }
  }

  // Выбор направления в узле
  chooseDirection(map, pacman) {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    // Собираем доступные направления (соседние клетки, не являющиеся стенами)
    let available = directions.filter(d => {
      const nx = this.tileX + d.dx;
      const ny = this.tileY + d.dy;
      return ny >= 0 && ny < map.layout.length &&
             nx >= 0 && nx < map.layout[0].length &&
             map.layout[ny][nx] !== 1;
    });

    const now = performance.now();
    // Если призрак видит Pac-Man, обновляем время обнаружения и запоминаем поворот
    if (pacman && this.canSeePacman(pacman, map)) {
      this.lastSeen = now;
      if (pacman.lastTurnTile) {
        let exists = this.memoryPath.some(tile =>
          tile.col === pacman.lastTurnTile.col && tile.row === pacman.lastTurnTile.row
        );
        if (!exists && (pacman.lastTurnTile.col !== this.tileX || pacman.lastTurnTile.row !== this.tileY)) {
          this.memoryPath.push({ col: pacman.lastTurnTile.col, row: pacman.lastTurnTile.row });
        }
      }
    } else {
      // Если призрак не видит Pac-Man более 2 секунд, очищаем память
      if (now - this.lastSeen > 2000) {
        this.memoryPath = [];
      }
    }

    // Определяем целевую клетку для погони:
    // Если память не пуста – цель берём из памяти (первая записанная точка)
    let target;
    if (this.memoryPath.length > 0) {
      target = this.memoryPath[0];
      if (this.tileX === target.col && this.tileY === target.row) {
        this.memoryPath.shift();
        target = this.memoryPath.length > 0
          ? this.memoryPath[0]
          : (pacman ? {
              col: Math.floor((pacman.x + pacman.radius) / CELL_SIZE),
              row: Math.floor((pacman.y + pacman.radius) / CELL_SIZE)
            } : null);
      }
    } else if (pacman && this.canSeePacman(pacman, map)) {
      target = {
        col: Math.floor((pacman.x + pacman.radius) / CELL_SIZE),
        row: Math.floor((pacman.y + pacman.radius) / CELL_SIZE)
      };
    }

    if (target) {
      // Из доступных направлений выбираем то, которое минимизирует расстояние до цели
      let bestDir = available[0];
      let bestDist = Infinity;
      for (let d of available) {
        const candidateX = this.tileX + d.dx;
        const candidateY = this.tileY + d.dy;
        const dx = target.col - candidateX;
        const dy = target.row - candidateY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) {
          bestDist = dist;
          bestDir = d;
        }
      }
      this.direction = bestDir;
      return;
    }

    // Если ни памяти, ни видимости нет:
    // Исключаем обратное направление, если есть другие варианты
    const reverse = { dx: -this.direction.dx, dy: -this.direction.dy };
    let nonReverse = available.filter(d => !(d.dx === reverse.dx && d.dy === reverse.dy));
    if (nonReverse.length > 0) {
      available = nonReverse;
    }
    // Если текущее направление доступно, иногда (с вероятностью 30%) выбираем альтернативное направление
    if (available.some(d => d.dx === this.direction.dx && d.dy === this.direction.dy)) {
      if (Math.random() < 0.3) {
        let alternatives = available.filter(d => !(d.dx === this.direction.dx && d.dy === this.direction.dy));
        if (alternatives.length > 0) {
          this.direction = alternatives[Math.floor(Math.random() * alternatives.length)];
          return;
        }
      }
      return;
    }
    // Иначе выбираем случайное направление из оставшихся
    this.direction = available[Math.floor(Math.random() * available.length)];
  }

  // Проверка видимости Pac-Man: призрак видит его, если они в одной строке или столбце без преград
  canSeePacman(pacman, map) {
    const ghostTileX = this.tileX;
    const ghostTileY = this.tileY;
    const pacTileX = Math.floor((pacman.x + pacman.radius) / CELL_SIZE);
    const pacTileY = Math.floor((pacman.y + pacman.radius) / CELL_SIZE);
    if (ghostTileY === pacTileY) {
      const minX = Math.min(ghostTileX, pacTileX);
      const maxX = Math.max(ghostTileX, pacTileX);
      for (let x = minX + 1; x < maxX; x++) {
        if (map.layout[ghostTileY][x] === 1) return false;
      }
      return true;
    } else if (ghostTileX === pacTileX) {
      const minY = Math.min(ghostTileY, pacTileY);
      const maxY = Math.max(ghostTileY, pacTileY);
      for (let y = minY + 1; y < maxY; y++) {
        if (map.layout[y][ghostTileX] === 1) return false;
      }
      return true;
    }
    return false;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, CELL_SIZE / 2 - 1, 0, Math.PI * 2);
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
      const ghostCenterX = ghost.position.x;
      const ghostCenterY = ghost.position.y;
      const dx = pacCenterX - ghostCenterX;
      const dy = pacCenterY - ghostCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.pacman.radius + CELL_SIZE/2 - 2) {
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
      let tileCol = ghost.tileX;
      let tileRow = ghost.tileY;
      let key = tileCol + "," + tileRow;
      if (occupied.has(key)) {
        ghost.chooseDirection(this.map, this.pacman);
        ghost.position.x += Math.random() * 4 - 2;
        ghost.position.y += Math.random() * 4 - 2;
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

// --- Глобальный обработчик клавиатуры ---
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
    game.resetPacman();
    document.getElementById('gameOverMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    game.running = true;
    game.lastTime = performance.now();
    game.start();
  }
});

document.getElementById('selectLevel').addEventListener('click', () => {
  document.getElementById('gameOverMenu').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('menu').style.display = 'block';
});
