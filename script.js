// Константы для игры
const CELL_SIZE = 16;
const BOARD_COLS = 28;
const BOARD_ROWS = 31;

// Простой пример карты (0 - пустая клетка, 1 - стена, 2 - пеллета)
// const simpleMap = [
//   [1,1,1,1,1,1,1,1],
//   [1,2,2,2,2,2,2,1],
//   [1,2,1,1,1,1,2,1],
//   [1,2,2,2,2,2,2,1],

//   [1,1,1,1,1,1,1,1],
// ];

// Определяем карту в виде массива строк (каждая строка содержит 28 символов)
const mazeString = [
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

// Преобразуем массив строк в двумерный массив чисел
const simpleMap = mazeString.map(row => row.split("").map(Number));


// Основной класс игры, который управляет обновлением и отрисовкой
class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = new GameMap();
        // Задаём стартовые позиции, подбирайте их под вашу карту
        this.pacman = new PacMan(1 * CELL_SIZE, 3 * CELL_SIZE);
        this.ghosts = [
            new Ghost(14 * CELL_SIZE, 10 * CELL_SIZE, 'red'),
            new Ghost(10 * CELL_SIZE, 10 * CELL_SIZE, 'blue'),
            new Ghost(18 * CELL_SIZE, 10 * CELL_SIZE, 'green'),
            // Можно добавить больше привидений
        ];
        this.score = 0;
        this.lives = 3; // 3 жизни у Pac-Man
        this.lastTime = 0;
    }

    start() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.update(deltaTime);
        this.render();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        this.pacman.update(deltaTime, this.map);
        for (const ghost of this.ghosts) {
            ghost.update(deltaTime, this.map, this.pacman);
        }
        // Проверяем, не съел ли Pac-Man пеллету
        this.checkPellets();
        // Проверяем столкновения с призраками
        this.checkGhostCollisions();
    }

    checkPellets() {
        // Определяем клетку, в которой находится Pac-Man (используем центр)
        const pacmanCenterX = this.pacman.x + this.pacman.radius;
        const pacmanCenterY = this.pacman.y + this.pacman.radius;
        const col = Math.floor(pacmanCenterX / CELL_SIZE);
        const row = Math.floor(pacmanCenterY / CELL_SIZE);

        // Если в этой клетке находится пеллета, съедаем её
        if (this.map.layout[row] && this.map.layout[row][col] === 2) {
            this.map.layout[row][col] = 0; // удаляем пеллету
            this.score += 10;             // увеличиваем счет (например, на 10 очков)
        }
    }

    checkGhostCollisions() {
        // Перебираем всех призраков
        for (let i = 0; i < this.ghosts.length; i++) {
          const ghost = this.ghosts[i];
          // Вычисляем центры Pac-Man и призрака
          const pacCenterX = this.pacman.x + this.pacman.radius;
          const pacCenterY = this.pacman.y + this.pacman.radius;
          const ghostCenterX = ghost.x + ghost.radius;
          const ghostCenterY = ghost.y + ghost.radius;
          
          const dx = pacCenterX - ghostCenterX;
          const dy = pacCenterY - ghostCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Если расстояние меньше суммы радиусов (с небольшим запасом), считаем, что произошло столкновение
          if (distance < this.pacman.radius + ghost.radius - 2) {
            // Обрабатываем столкновение:
            this.lives--;  // отнимаем жизнь у Pac-Man
            this.resetPacman(); // сбрасываем позицию Pac-Man
            
            // Призрак "исчезает": удаляем его из массива
            this.ghosts.splice(i, 1);
            i--;
            
            // Если жизни закончились, можно реализовать логику Game Over
            break;
          }
        }
      }

      resetPacman() {
        // Устанавливаем Pac-Man в его начальную позицию и обнуляем направления
        this.pacman.x = 1 * CELL_SIZE;
        this.pacman.y = 3 * CELL_SIZE;
        this.pacman.direction = { x: 0, y: 0 };
        this.pacman.nextDirection = { x: 0, y: 0 };
      }

    render() {
        // Очистка холста
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Отрисовка карты
        this.map.draw(this.ctx);
        // Отрисовка Pac-Man
        this.pacman.draw(this.ctx);
        // Отрисовка привидений
        for (const ghost of this.ghosts) {
            ghost.draw(this.ctx);
        }
        // Отрисовка UI (счет)
        this.drawUI();
    }

    drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText("Score: " + this.score, 0, this.canvas.height - 10);
        this.ctx.fillText("Lives: " + this.lives, this.canvas.width - 60, this.canvas.height - 10);
    }
}

// Класс для карты игры
class GameMap {
    constructor() {
        this.layout = simpleMap;
    }

    draw(ctx) {
        for (let row = 0; row < this.layout.length; row++) {
            for (let col = 0; col < this.layout[row].length; col++) {
                const cell = this.layout[row][col];
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;
                if (cell === 1) {
                    // Рисуем стены
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                } else if (cell === 2) {
                    // Рисуем пеллеты
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 2, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
    }

    // Метод для проверки, является ли указанная точка стеной
    isWall(x, y) {
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);
        if (row < 0 || row >= this.layout.length || col < 0 || col >= this.layout[0].length) {
            return true; // Если вне границ, считаем стеной
        }
        return this.layout[row][col] === 1;
    }
}

class PacMan {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = { x: 0, y: 0 };     // Текущее направление движения
        this.nextDirection = { x: 0, y: 0 };  // Запрошенное направление (при нажатии клавиши)
        this.speed = 100;                   // Скорость в пикселях в секунду
        this.radius = CELL_SIZE / 2;        // Радиус для отрисовки (занимает всю клетку)
        this.mouthAngle = 0.25;             // Угол "открытости" рта (значение от 0 до 1)

        // Для проверки столкновений используем уменьшённый bounding box (например, 80% от CELL_SIZE)
        this.collisionSize = CELL_SIZE * 0.8;
        this.collisionOffset = (CELL_SIZE - this.collisionSize) / 2;
    }

    update(deltaTime, map) {
        const distance = (this.speed * deltaTime) / 1000;

        // Если запрошено новое направление (и оно отличается от текущего) и движение в нём возможно...
        if ((this.nextDirection.x !== 0 || this.nextDirection.y !== 0) &&
            (this.nextDirection.x !== this.direction.x || this.nextDirection.y !== this.direction.y) &&
            this.canMove(this.nextDirection, map)) {

            // Определяем текущий центр и центр клетки, в которой находится Pac‑Man.
            const centerX = this.x + this.radius;
            const centerY = this.y + this.radius;
            const cellCol = Math.floor(centerX / CELL_SIZE);
            const cellRow = Math.floor(centerY / CELL_SIZE);
            const gridCenterX = cellCol * CELL_SIZE + CELL_SIZE / 2;
            const gridCenterY = cellRow * CELL_SIZE + CELL_SIZE / 2;
            const threshold = 7; // Порог, в пределах которого считаем, что персонаж близок к центру

            // Если центр уже достаточно близко к центру клетки – выравниваем и меняем направление
            if (Math.abs(centerX - gridCenterX) < threshold &&
                Math.abs(centerY - gridCenterY) < threshold) {
                this.x = gridCenterX - this.radius;
                this.y = gridCenterY - this.radius;
                this.direction = { ...this.nextDirection };
            } else {
                // Предсказываем, где окажется центр в следующем шаге
                const predictedCenterX = centerX + this.direction.x * distance;
                const predictedCenterY = centerY + this.direction.y * distance;

                // Проверяем, происходит ли пересечение центра клетки по оси X или Y
                let crossX = false, crossY = false;
                if (this.direction.x !== 0) {
                    // Если центр до шага с одной стороны центра клетки, а после шага – с другой
                    if ((centerX - gridCenterX) * (predictedCenterX - gridCenterX) <= 0) {
                        crossX = true;
                    }
                }
                if (this.direction.y !== 0) {
                    if ((centerY - gridCenterY) * (predictedCenterY - gridCenterY) <= 0) {
                        crossY = true;
                    }
                }
                // Если хотя бы по одной оси центр пересекается – выполняем выравнивание и поворот
                if (crossX || crossY) {
                    this.x = gridCenterX - this.radius;
                    this.y = gridCenterY - this.radius;
                    this.direction = { ...this.nextDirection };
                }
            }
        }

        // Обновляем позицию по осям независимо от смены направления.
        // Обновление по оси X:
        let newX = this.x + this.direction.x * distance;
        if (!this.collides(newX, this.y, map)) {
            this.x = newX;
        }
        // Обновление по оси Y:
        let newY = this.y + this.direction.y * distance;
        if (!this.collides(this.x, newY, map)) {
            this.y = newY;
        }
    }

    // Проверка столкновений с использованием уменьшённого bounding box
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
            if (map.isWall(corner.x, corner.y)) {
                return true;
            }
        }
        return false;
    }

    // Проверка возможности движения в заданном направлении
    canMove(direction, map) {
        const testX = this.x + direction.x * CELL_SIZE;
        const testY = this.y + direction.y * CELL_SIZE;
        return !this.collides(testX, testY, map);
    }

    draw(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(
            this.x + this.radius,
            this.y + this.radius,
            this.radius,
            this.mouthAngle * Math.PI,
            (2 - this.mouthAngle) * Math.PI
        );
        ctx.lineTo(this.x + this.radius, this.y + this.radius);
        ctx.fill();
    }
}



class Ghost {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = 80; // Скорость привидения (можно настроить)
        // Начальное направление (например, вправо)
        this.direction = { x: 1, y: 0 };
        this.radius = CELL_SIZE / 2;

        // Для проверки столкновений используем уменьшённый bounding box (например, 80% от CELL_SIZE)
        this.collisionSize = CELL_SIZE * 0.8;
        this.collisionOffset = (CELL_SIZE - this.collisionSize) / 2;
    }

    update(deltaTime, map, pacman) {
        const distance = (this.speed * deltaTime) / 1000;

        // Сохраним текущую позицию
        const prevX = this.x;
        const prevY = this.y;

        // Обновляем позицию по оси X
        let newX = this.x + this.direction.x * distance;
        if (!this.collides(newX, this.y, map)) {
            this.x = newX;
        } else {
            // Если столкновение по оси X – выбираем новое направление
            this.chooseNewDirection(map);
            // Можно вернуть координату к предыдущему значению
            this.x = prevX;
        }

        // Обновляем позицию по оси Y
        let newY = this.y + this.direction.y * distance;
        if (!this.collides(this.x, newY, map)) {
            this.y = newY;
        } else {
            this.chooseNewDirection(map);
            this.y = prevY;
        }

        // Дополнительно можно реализовать смену направления при пересечении центра клетки,
        // если ghost находится в точке пересечения (это можно расширить для более сложного AI).
    }

    // Метод проверки столкновений с использованием уменьшённого bounding box
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
            if (map.isWall(corner.x, corner.y)) {
                return true;
            }
        }
        return false;
    }

    // Метод выбора нового направления движения при столкновении или в точке пересечения
    chooseNewDirection(map) {
        // Возможные направления
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];

        // Фильтруем направления, которые не ведут к столкновению
        const validDirections = directions.filter(dir => {
            const testX = this.x + dir.x * CELL_SIZE;
            const testY = this.y + dir.y * CELL_SIZE;
            return !this.collides(testX, testY, map);
        });

        // Если есть допустимые направления, выбираем случайное
        if (validDirections.length > 0) {
            const randIndex = Math.floor(Math.random() * validDirections.length);
            this.direction = validDirections[randIndex];
        } else {
            // Если нет – можно развернуться
            this.direction.x *= -1;
            this.direction.y *= -1;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Рисуем верхнюю половину круга (голову привидения)
        ctx.arc(
            this.x + this.radius,
            this.y + this.radius,
            this.radius,
            Math.PI,
            2 * Math.PI
        );
        // Рисуем "ножки" привидения – можно улучшить этот участок по желанию
        ctx.lineTo(this.x + this.radius * 2, this.y + this.radius);
        ctx.lineTo(this.x, this.y + this.radius);
        ctx.closePath();
        ctx.fill();
    }
}


// Инициализация Canvas и запуск игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = new Game(canvas, ctx);
game.start();

// Обработка нажатия клавиш для управления Pac-Man
document.addEventListener('keydown', (event) => {
    console.log("Нажата клавиша:", event.key);

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
