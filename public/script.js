"use strict";

/*
  script.js
  Основной скрипт для:
    - логики Pac-Man
    - логики Ghost
    - логики GameMap
    - управления меню и модальными окнами
*/

/*
  parseMap(mapStringArray):
    Преобразует массив строк (каждая — одна строка уровня) 
    в двумерный массив чисел. 
    0 = пустое пространство
    1 = стена
    2 = пеллета (точка для сбора)
*/
function parseMap(mapStringArray) {
  return mapStringArray.map(row => row.split("").map(Number));
}

// Глобальные переменные
let game;        // объект Game (текущая игра)
let currentMap;  // копия выбранной карты, для восстановления пеллет

// Константы
const CELL_SIZE = 16;  
const BOARD_COLS = 28; 
const BOARD_ROWS = 31;

// Примеры уровней (31 строк, 28 символов)
// Здесь по усечённому примеру.
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

// Преобразуем строки в массив чисел
const parsedLevel1 = parseMap(level1String);
const parsedLevel2 = parseMap(level2String);
const parsedLevel3 = parseMap(level3String);

/*
  Класс GameMap:
  Хранит layout (двумерный массив), рисует стены и пеллеты.
  isWall(x,y) проверяет, является ли (x,y) стеной.
*/
class GameMap {
  constructor(layout) {
    this.layout = layout;
  }
  // Рендер карты на canvas
  draw(ctx) {
    for (let row=0; row<this.layout.length; row++){
      for (let col=0; col<this.layout[row].length; col++){
        const cell=this.layout[row][col];
        const x=col*CELL_SIZE;
        const y=row*CELL_SIZE;
        if(cell===1){
          // Рисуем стену (синим)
          ctx.fillStyle='blue';
          ctx.fillRect(x,y,CELL_SIZE,CELL_SIZE);
        } else if(cell===2){
          // Рисуем пеллету
          ctx.fillStyle='white';
          ctx.beginPath();
          ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 2, 0, 2*Math.PI);
          ctx.fill();
        }
      }
    }
  }
  // Проверка: является ли (x,y) стеной
  isWall(x,y){
    const col=Math.floor(x/CELL_SIZE);
    const row=Math.floor(y/CELL_SIZE);
    if(row<0||row>=this.layout.length||col<0||col>=this.layout[0].length){
      return true; // за границей считаем стеной
    }
    return this.layout[row][col]===1;
  }
}

/*
  Класс PacMan:
  - хранит координаты (x,y), скорость, радиус
  - direction и nextDirection (куда двигаться сейчас и куда хотим повернуть)
  - update(...) обновляет координаты Pac-Man
  - draw(...) рисует жёлтый круг
*/
class PacMan {
  constructor(x,y){
    this.x=x;
    this.y=y;
    this.direction={x:0,y:0};
    this.nextDirection={x:0,y:0};
    this.speed=150; 
    this.radius=CELL_SIZE/2;
    this.mouthAngle=0.25; // угол "рта"
    this.collisionSize=CELL_SIZE*0.8;
    this.collisionOffset=(CELL_SIZE - this.collisionSize)/2;
    this.lastTurnTile=null;
  }

  // Обновляем позицию Pac-Man
  update(deltaTime,map){
    const distance=(this.speed * deltaTime)/1000;
    // Проверяем, можно ли повернуть
    if((this.nextDirection.x!==0||this.nextDirection.y!==0) &&
       (this.nextDirection.x!==this.direction.x||this.nextDirection.y!==this.direction.y) &&
       this.canMove(this.nextDirection,map)){
      // Проверим, близки ли к центру клетки
      const centerX=this.x+this.radius;
      const centerY=this.y+this.radius;
      const cellCol=Math.floor(centerX/CELL_SIZE);
      const cellRow=Math.floor(centerY/CELL_SIZE);
      const gridCenterX=cellCol*CELL_SIZE + CELL_SIZE/2;
      const gridCenterY=cellRow*CELL_SIZE + CELL_SIZE/2;
      const threshold=7;
      if(Math.abs(centerX-gridCenterX)<threshold && Math.abs(centerY-gridCenterY)<threshold){
        // Выравниваем координаты Pac-Man
        this.x=gridCenterX - this.radius;
        this.y=gridCenterY - this.radius;
        this.direction={...this.nextDirection};
        this.lastTurnTile={col:cellCol, row:cellRow};
      }
    }
    // Двигаемся по текущему direction
    let newX=this.x + this.direction.x*distance;
    if(!this.collides(newX,this.y,map)){
      this.x=newX;
    }
    let newY=this.y + this.direction.y*distance;
    if(!this.collides(this.x,newY,map)){
      this.y=newY;
    }
  }

  // Проверка столкновений (учитываем уменьшенную collisionSize)
  collides(newX,newY,map){
    const EPSILON=0.1;
    const left=newX + this.collisionOffset + EPSILON;
    const top =newY + this.collisionOffset + EPSILON;
    const right=left + this.collisionSize -2*EPSILON;
    const bottom=top + this.collisionSize -2*EPSILON;
    const corners=[
      {x:left, y:top},
      {x:right,y:top},
      {x:left, y:bottom},
      {x:right,y:bottom}
    ];
    for(const corner of corners){
      if(map.isWall(corner.x,corner.y)) return true;
    }
    return false;
  }

  // Проверяем, можем ли мы пойти в direction (на одну клетку)
  canMove(direction,map){
    const testX=this.x + direction.x*CELL_SIZE;
    const testY=this.y + direction.y*CELL_SIZE;
    return !this.collides(testX,testY,map);
  }

  // Рисуем Pac-Man
  draw(ctx){
    ctx.fillStyle='yellow';
    ctx.beginPath();
    ctx.arc(
      this.x+this.radius,
      this.y+this.radius,
      this.radius,
      this.mouthAngle*Math.PI,
      (2-this.mouthAngle)*Math.PI
    );
    ctx.lineTo(this.x+this.radius,this.y+this.radius);
    ctx.fill();
  }
}

/*
  Класс Ghost:
  - хранит позицию в клетках (tileX, tileY)
  - движется между центрами клеток
  - при достижении клетки выбирает новое направление (не разворачивается)
  - если видит Pac-Man по строке или столбцу, идёт к нему
  - избегает зацикливания
*/
class Ghost {
  constructor(tileX,tileY,color,map){
    this.tileX=tileX;
    this.tileY=tileY;
    this.color=color;
    this.map=map;
    this.speed=80;
    this.radius=CELL_SIZE*0.5;
    this.x=tileX*CELL_SIZE + CELL_SIZE/2;
    this.y=tileY*CELL_SIZE + CELL_SIZE/2;
    this.straightCount=0;
    this.direction=this.getRandomDirection();
    this.chooseTarget();
  }

  // Собираем направления, где нет стены
  getAvailableDirections(){
    const dirs=[
      {dx:1, dy:0},
      {dx:-1,dy:0},
      {dx:0,  dy:1},
      {dx:0,  dy:-1}
    ];
    let available=[];
    for(let d of dirs){
      const nx=this.tileX + d.dx;
      const ny=this.tileY + d.dy;
      if(ny>=0 && ny<this.map.layout.length && 
         nx>=0 && nx<this.map.layout[0].length &&
         this.map.layout[ny][nx]!==1){
        available.push(d);
      }
    }
    return available;
  }

  // Выбираем случайное направление из доступных
  getRandomDirection(){
    const arr=this.getAvailableDirections();
    if(!arr.length) return {dx:0, dy:0};
    return arr[Math.floor(Math.random()*arr.length)];
  }

  // целевая клетка (targetTileX, targetTileY) = tileX+direction.dx, tileY+direction.dy
  chooseTarget(){
    this.targetTileX=this.tileX + this.direction.dx;
    this.targetTileY=this.tileY + this.direction.dy;
  }

  // Проверяем, находится ли Pac-Man в одной строке/столбце без стен
  canSeePacman(pacman){
    const ghostTileX=this.tileX;
    const ghostTileY=this.tileY;
    const pacTileX=Math.floor((pacman.x+pacman.radius)/CELL_SIZE);
    const pacTileY=Math.floor((pacman.y+pacman.radius)/CELL_SIZE);
    if(ghostTileY===pacTileY){
      const minX=Math.min(ghostTileX,pacTileX);
      const maxX=Math.max(ghostTileX,pacTileX);
      for(let x=minX+1;x<maxX;x++){
        if(this.map.layout[ghostTileY][x]===1) return false;
      }
      return true;
    } else if(ghostTileX===pacTileX){
      const minY=Math.min(ghostTileY,pacTileY);
      const maxY=Math.max(ghostTileY,pacTileY);
      for(let y=minY+1;y<maxY;y++){
        if(this.map.layout[y][ghostTileX]===1) return false;
      }
      return true;
    }
    return false;
  }

  // Логика выбора направления при достижении центра клетки
  chooseDirection(pacman){
    let available=this.getAvailableDirections();
    // Исключаем разворот, если есть другие варианты
    if(this.direction.dx!==0||this.direction.dy!==0){
      const reverse={dx:-this.direction.dx,dy:-this.direction.dy};
      let nonReverse=available.filter(d=>!(d.dx===reverse.dx&&d.dy===reverse.dy));
      if(nonReverse.length>0) available=nonReverse;
    }
    // Если видим Pac-Man, пытаемся идти к нему
    if(pacman && this.canSeePacman(pacman)){
      const pacTileX=Math.floor((pacman.x+pacman.radius)/CELL_SIZE);
      const pacTileY=Math.floor((pacman.y+pacman.radius)/CELL_SIZE);
      for(let d of available){
        if(this.tileX+d.dx===pacTileX && this.tileY+d.dy===pacTileY){
          this.direction=d;
          this.straightCount=0;
          this.chooseTarget();
          return;
        }
      }
    }
    // С вероятностью 70% идём прямо, если не зациклились
    const canContinue=available.some(d=>d.dx===this.direction.dx&&d.dy===this.direction.dy);
    if(canContinue && Math.random()<0.7 && this.straightCount<3){
      this.straightCount++;
      this.chooseTarget();
      return;
    }
    // Иначе случайное из доступных
    this.direction=available[Math.floor(Math.random()*available.length)];
    this.straightCount=0;
    this.chooseTarget();
  }

  // Движение (призрак идёт к центру targetTileX/Y)
  update(deltaTime,map,pacman){
    const targetCenter={
      x:this.targetTileX*CELL_SIZE + CELL_SIZE/2,
      y:this.targetTileY*CELL_SIZE + CELL_SIZE/2
    };
    const dx=targetCenter.x - this.x;
    const dy=targetCenter.y - this.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const moveDist=(this.speed*deltaTime)/1000;
    if(moveDist>=dist){
      // Достигли центра
      this.x=targetCenter.x;
      this.y=targetCenter.y;
      this.tileX=this.targetTileX;
      this.tileY=this.targetTileY;
      this.chooseDirection(pacman);
    } else {
      this.x+=(dx/dist)*moveDist;
      this.y+=(dy/dist)*moveDist;
    }
  }

  // Рисуем призрака
  draw(ctx){
    ctx.fillStyle=this.color;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius-1,0,Math.PI*2);
    ctx.fill();
  }
}

/*
  Класс Game:
  - хранит Pac-Man, призраков, карту
  - обрабатывает игровой цикл (start, gameLoop)
  - проверяет пеллеты и столкновения
  - при потере жизни — resetPacman
  - при окончании жизней — gameOver
  - при съедании всех пеллет — levelComplete (новое окно)
*/
class Game {
  constructor(canvas,ctx,levelMap){
    this.canvas=canvas;
    this.ctx=ctx;
    this.map=new GameMap(levelMap);
    // Pac-Man в клетке (1,3)
    this.pacman=new PacMan(1*CELL_SIZE,3*CELL_SIZE);
    // Несколько призраков в центре карты
    this.ghosts=[
      new Ghost(14,10,'red', this.map),
      new Ghost(12,10,'pink',this.map),
      new Ghost(16,10,'cyan',this.map)
    ];
    this.score=0;
    this.lives=3;
    this.lastTime=0;
    this.running=true;
  }

  // Запуск игрового цикла
  start(){
    this.running=true;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  // Собственно игровой цикл (обновление + рендер)
  gameLoop(timestamp){
    if(!this.running)return;
    const deltaTime=timestamp-this.lastTime;
    this.lastTime=timestamp;
    this.update(deltaTime);
    this.resolveGhostConflicts();
    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  // Обновляем Pac-Man, призраков, проверяем пеллеты, столкновения
  update(deltaTime){
    this.pacman.update(deltaTime,this.map);
    for(const g of this.ghosts){
      g.update(deltaTime,this.map,this.pacman);
    }
    this.checkPellets();
    this.checkGhostCollisions();
    // Проверяем, не съедены ли все пеллеты
    this.checkLevelComplete();
  }

  // Если Pac-Man находится в клетке, где layout=2, «съедаем» пеллету (layout=0)
  checkPellets(){
    const pacX=this.pacman.x+this.pacman.radius;
    const pacY=this.pacman.y+this.pacman.radius;
    const col=Math.floor(pacX/CELL_SIZE);
    const row=Math.floor(pacY/CELL_SIZE);
    if(this.map.layout[row] && this.map.layout[row][col]===2){
      this.map.layout[row][col]=0;
      this.score+=10;
    }
  }

  // Если Pac-Man столкнулся с призраком, либо теряем жизнь, либо gameOver
  checkGhostCollisions(){
    for(let i=0;i<this.ghosts.length;i++){
      const ghost=this.ghosts[i];
      const pacCenterX=this.pacman.x+this.pacman.radius;
      const pacCenterY=this.pacman.y+this.pacman.radius;
      const dx=pacCenterX-ghost.x;
      const dy=pacCenterY-ghost.y;
      const distance=Math.sqrt(dx*dx+dy*dy);
      if(distance<this.pacman.radius+ghost.radius-2){
        this.lives--;
        if(this.lives<=0){
          this.gameOver();
        } else {
          this.resetPacman();
        }
        break;
      }
    }
  }

  // Проверяем, остались ли пеллеты (2) в layout
  checkLevelComplete(){
    let foundPellet=false;
    for(let r=0; r<this.map.layout.length; r++){
      for(let c=0; c<this.map.layout[r].length; c++){
        if(this.map.layout[r][c]===2){
          foundPellet=true;
          break;
        }
      }
      if(foundPellet) break;
    }
    // Если нет пеллет => уровень пройден
    if(!foundPellet){
      this.levelComplete();
    }
  }

  // Если все пеллеты съедены — показываем окно levelCompleteMenu
  levelComplete(){
    this.running=false;
    // Скрываем gameContainer
    document.getElementById('gameContainer').style.display='none';
    // Показываем меню «Уровень пройден»
    document.getElementById('levelCompleteMenu').style.display='block';
    // Выводим счёт
    document.getElementById('completionScore').textContent="Ваш счет: "+this.score;
  }

  // Если два призрака оказались в одной клетке, смещаем одного
  resolveGhostConflicts(){
    let occupied=new Set();
    for(const ghost of this.ghosts){
      const key=ghost.tileX+","+ghost.tileY;
      if(occupied.has(key)){
        ghost.chooseDirection(this.pacman);
        ghost.x+=Math.random()*4-2;
        ghost.y+=Math.random()*4-2;
      } else {
        occupied.add(key);
      }
    }
  }

  // Сброс Pac-Man при потере жизни
  resetPacman(){
    this.pacman.x=1*CELL_SIZE;
    this.pacman.y=3*CELL_SIZE;
    this.pacman.direction={x:0,y:0};
    this.pacman.nextDirection={x:0,y:0};
  }

  // Если жизни закончились => «Конец игры»
  gameOver(){
    this.running=false;
    // Скрываем игру
    document.getElementById('gameContainer').style.display='none';
    // Показываем меню Game Over
    document.getElementById('gameOverMenu').style.display='block';
    // Выводим счёт
    document.getElementById('finalScore').textContent="Ваш счет: "+this.score;
  }

  // Рендер (очищаем canvas, рисуем карту, Pac-Man, призраков и UI)
  render(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.map.draw(this.ctx);
    this.pacman.draw(this.ctx);
    for(const ghost of this.ghosts){
      ghost.draw(this.ctx);
    }
    this.drawUI();
  }

  // Рисуем счёт и жизни
  drawUI(){
    this.ctx.fillStyle='white';
    this.ctx.font='16px Arial';
    this.ctx.fillText("Score: "+this.score,0,this.canvas.height-10);
    this.ctx.fillText("Lives: "+this.lives,this.canvas.width-60,this.canvas.height-10);
  }
}

// ============================================================================
// Мобильное управление (touchControls) - добавляем при загрузке окна
// ============================================================================
function setupTouchControls(){
  // Добавляем в #gameContainer разметку кнопок управления
  const controlsHTML=`
    <div id="touchControls">
      <button id="upButton">↑</button>
      <div>
        <button id="leftButton">←</button>
        <button id="downButton">↓</button>
        <button id="rightButton">→</button>
      </div>
    </div>
  `;
  const gameContainer=document.getElementById("gameContainer");
  if(gameContainer){
    gameContainer.insertAdjacentHTML("beforeend",controlsHTML);
  }

  // Небольшие стили для кнопок
  const style=document.createElement("style");
  style.textContent=`
    #touchControls {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      z-index: 1000;
    }
    #touchControls button {
      width: 60px;
      height: 60px;
      font-size: 24px;
      margin: 5px;
      border-radius: 10px;
      background-color: rgba(255,255,255,0.7);
      border: none;
    }
  `;
  document.head.appendChild(style);

  // Обработчики на «touchend» и «click» для каждой кнопки
  const upButton   = document.getElementById("upButton");
  const downButton = document.getElementById("downButton");
  const leftButton = document.getElementById("leftButton");
  const rightButton= document.getElementById("rightButton");

  if(upButton){
    upButton.addEventListener("touchend",(e)=>{
      e.preventDefault();
      if(game && game.pacman){
        game.pacman.nextDirection={x:0,y:-1};
      }
    });
    upButton.addEventListener("click",()=>{
      if(game && game.pacman){
        game.pacman.nextDirection={x:0,y:-1};
      }
    });
  }
  if(downButton){
    downButton.addEventListener("touchend",(e)=>{
      e.preventDefault();
      if(game && game.pacman){
        game.pacman.nextDirection={x:0,y:1};
      }
    });
    downButton.addEventListener("click",()=>{
      if(game && game.pacman){
        game.pacman.nextDirection={x:0,y:1};
      }
    });
  }
  if(leftButton){
    leftButton.addEventListener("touchend",(e)=>{
      e.preventDefault();
      if(game && game.pacman){
        game.pacman.nextDirection={x:-1,y:0};
      }
    });
    leftButton.addEventListener("click",()=>{
      if(game && game.pacman){
        game.pacman.nextDirection={x:-1,y:0};
      }
    });
  }
  if(rightButton){
    rightButton.addEventListener("touchend",(e)=>{
      e.preventDefault();
      if(game && game.pacman){
        game.pacman.nextDirection={x:1,y:0};
      }
    });
    rightButton.addEventListener("click",()=>{
      if(game && game.pacman){
        game.pacman.nextDirection={x:1,y:0};
      }
    });
  }
}

// Запускаем добавление кнопок при загрузке
window.addEventListener("load", setupTouchControls);

// ============================================================================
// Обработчики клавиатуры (стрелки)
// ============================================================================
document.addEventListener('keydown',(event)=>{
  if(!game||!game.pacman)return;
  switch(event.key){
    case 'ArrowUp':
      game.pacman.nextDirection={x:0,y:-1};
      break;
    case 'ArrowDown':
      game.pacman.nextDirection={x:0,y:1};
      break;
    case 'ArrowLeft':
      game.pacman.nextDirection={x:-1,y:0};
      break;
    case 'ArrowRight':
      game.pacman.nextDirection={x:1,y:0};
      break;
  }
});

// ============================================================================
// Обработчики меню
// ============================================================================
document.querySelectorAll('#menu button').forEach(button=>{
  button.addEventListener('click',()=>{
    // Скрываем главное меню, Game Over и «Уровень пройден»
    document.getElementById('menu').style.display='none';
    document.getElementById('gameOverMenu').style.display='none';
    document.getElementById('levelCompleteMenu').style.display='none';

    const level=button.getAttribute('data-level');
    if(level){
      // Если нажали конкретный уровень, показываем контейнер игры
      document.getElementById('gameContainer').style.display='block';

      // Делаем копию карты
      let selectedMap;
      if(level==="1"){
        selectedMap=JSON.parse(JSON.stringify(parsedLevel1));
      } else if(level==="2"){
        selectedMap=JSON.parse(JSON.stringify(parsedLevel2));
      } else if(level==="3"){
        selectedMap=JSON.parse(JSON.stringify(parsedLevel3));
      }
      currentMap=JSON.parse(JSON.stringify(selectedMap));

      // Создаём объект Game и запускаем
      const canvas=document.getElementById('gameCanvas');
      const ctx=canvas.getContext('2d');
      game=new Game(canvas,ctx,selectedMap);
      game.start();
    } else {
      // Если это "Информация", она обрабатывается отдельно
      // (см. ниже infoButton)
    }
  });
});

// Кнопка «Начать сначала» (из меню Game Over)
document.getElementById('restartGame').addEventListener('click',()=>{
  if(game){
    game.score=0;
    game.lives=3;
    // Копируем currentMap заново, чтобы пеллеты восстановились
    const newMap=JSON.parse(JSON.stringify(currentMap));
    const canvas=document.getElementById('gameCanvas');
    const ctx=canvas.getContext('2d');
    game=new Game(canvas,ctx,newMap);
    // Скрываем Game Over
    document.getElementById('gameOverMenu').style.display='none';
    // Показываем игровой контейнер
    document.getElementById('gameContainer').style.display='block';
    game.start();
  }
});

// Кнопка «Выбрать уровень» (из меню Game Over)
document.getElementById('selectLevel').addEventListener('click',()=>{
  // Скрываем меню Game Over и игровое поле
  document.getElementById('gameOverMenu').style.display='none';
  document.getElementById('gameContainer').style.display='none';
  // Показываем главное меню
  document.getElementById('menu').style.display='block';
});

// Кнопка «Следующий уровень» (новое меню levelCompleteMenu)
document.getElementById('nextLevel').addEventListener('click',()=>{
  // В данном примере просто возвращаемся в меню.
  // Можно автоматически запускать другой уровень по логике.
  document.getElementById('levelCompleteMenu').style.display='none';
  document.getElementById('gameContainer').style.display='none';
  document.getElementById('menu').style.display='block';
});

// Кнопка «Выбрать уровень» (из меню «Уровень пройден»)
document.getElementById('selectLevel2').addEventListener('click',()=>{
  // Скрываем levelCompleteMenu, скрываем gameContainer
  document.getElementById('levelCompleteMenu').style.display='none';
  document.getElementById('gameContainer').style.display='none';
  // Показываем главное меню
  document.getElementById('menu').style.display='block';
});

// ============================================================================
// Модальное окно «Информация»
// ============================================================================
const infoButton   = document.getElementById('infoButton');   // кнопка «Информация» в меню
const infoModal    = document.getElementById('infoModal');    // окно
const closeModal   = document.getElementById('closeModal');   // крестик закрытия

// При нажатии «Информация» открываем окно
infoButton.addEventListener('click',()=>{
  // Показываем окно
  infoModal.style.display='block';
  // Скрываем поле игры, чтобы не было видно «остатков» старой игры
  document.getElementById('gameContainer').style.display='none';
});

// Крестик закрытия
closeModal.addEventListener('click',()=>{
  // Скрываем модальное окно
  infoModal.style.display='none';
  // Возвращаем главное меню
  document.getElementById('menu').style.display='block';
});