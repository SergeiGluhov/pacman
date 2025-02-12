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
        this.pacman = new PacMan(1 * CELL_SIZE, 1 * CELL_SIZE);
        this.ghosts = [
            new Ghost(14 * CELL_SIZE, 11 * CELL_SIZE, 'red'),
            // Можно добавить больше привидений
        ];
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
    }

    render() {
        // Очистка холста
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.map.draw(this.ctx);
        this.pacman.draw(this.ctx);
        for (const ghost of this.ghosts) {
            ghost.draw(this.ctx);
        }
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

// Класс Pac-Man
class PacMan {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = { x: 0, y: 0 };       // Текущее направление
        this.nextDirection = { x: 0, y: 0 };   // Следующее направление (при нажатии клавиши)
        this.speed = 100; // скорость в пикселях в секунду
        this.radius = CELL_SIZE / 2;
        this.mouthAngle = 0.25; // для анимации рта (пока просто значение)
    }

    update(deltaTime, map) {
        // Если новое направление возможно, переключаемся
        if (this.canMove(this.nextDirection, map)) {
            this.direction = { ...this.nextDirection };
        }

        // Вычисляем новое положение
        const distance = (this.speed * deltaTime) / 1000;
        const newX = this.x + this.direction.x * distance;
        const newY = this.y + this.direction.y * distance;

        // Проверяем, нет ли стены на пути
        if (!map.isWall(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    canMove(direction, map) {
        const testX = this.x + direction.x * CELL_SIZE;
        const testY = this.y + direction.y * CELL_SIZE;
        return !map.isWall(testX, testY);
    }

    draw(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        // Рисуем дугу с вырезанным сектором для эффекта открытого рта
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

// Класс для привидений
class Ghost {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = 80; // скорость привидения
        // Задаём начальное направление (например, вправо)
        this.direction = { x: 1, y: 0 };
        this.radius = CELL_SIZE / 2;
    }

    update(deltaTime, map, pacman) {
        const distance = (this.speed * deltaTime) / 1000;
        // Если движемся и ожидается столкновение со стеной, меняем направление
        if (map.isWall(this.x + this.direction.x * distance, this.y + this.direction.y * distance)) {
            this.chooseNewDirection(map);
        } else {
            this.x += this.direction.x * distance;
            this.y += this.direction.y * distance;
        }
    }

    chooseNewDirection(map) {
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
        ];
        // Фильтруем направления, чтобы исключить движение в стену
        const validDirections = directions.filter(dir => {
            return !map.isWall(this.x + dir.x * CELL_SIZE, this.y + dir.y * CELL_SIZE);
        });
        if (validDirections.length > 0) {
            const randIndex = Math.floor(Math.random() * validDirections.length);
            this.direction = validDirections[randIndex];
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Рисуем верхнюю половину круга (тело привидения)
        ctx.arc(
            this.x + this.radius,
            this.y + this.radius,
            this.radius,
            Math.PI,
            2 * Math.PI
        );
        ctx.lineTo(this.x, this.y + this.radius);
        ctx.fill();
    }
}

// Инициализация Canvas и запуск игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = new Game(canvas, ctx);


// Обработка нажатия клавиш для управления Pac-Man
document.addEventListener('keydown', (event) => {
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
game.start();