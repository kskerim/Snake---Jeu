// --- Paramètres du jeu ---
const GRID_SIZE = 20; // 20x20 cases
const INIT_SNAKE = [ {x: 10, y: 10} ];
const INIT_DIR = {x: 1, y: 0};
const MOVE_INTERVAL = 110; // ms
const APPLE_EFFECT_DURATION = 180; // ms

// --- Variables du jeu ---
let snake, direction, nextDirection, apple, score, running, gameOver, appleEffect, moveTimer;
let canvas, ctx, scoreEl, gameOverEl, restartBtn;
let canvasSize, cellSize;

// --- Initialisation ---
window.onload = () => {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  scoreEl = document.getElementById('score-value');
  gameOverEl = document.getElementById('game-over');
  restartBtn = document.getElementById('restart-btn');
  adaptCanvasSize();
  window.addEventListener('resize', adaptCanvasSize);
  restartBtn.onclick = startGame;
  canvas.addEventListener('click', () => { if (gameOver) startGame(); });
  document.addEventListener('keydown', handleKey);
  startGame();
};

// --- Adapter la taille du canvas pour le responsive ---
function adaptCanvasSize() {
  let min = Math.min(window.innerWidth, window.innerHeight * 0.8, 420);
  min = Math.max(min, 220);
  canvasSize = Math.floor(min / GRID_SIZE) * GRID_SIZE;
  cellSize = canvasSize / GRID_SIZE;
  canvas.width = canvas.height = canvasSize;
}

// --- Démarrer ou redémarrer le jeu ---
function startGame() {
  snake = [...INIT_SNAKE];
  direction = {...INIT_DIR};
  nextDirection = {...INIT_DIR};
  score = 0;
  running = true;
  gameOver = false;
  appleEffect = 0;
  placeApple();
  scoreEl.textContent = score;
  gameOverEl.style.display = 'none';
  restartBtn.style.display = 'none';
  moveTimer = Date.now();
  requestAnimationFrame(gameLoop);
}

// --- Placer la pomme à une position libre ---
function placeApple() {
  while (true) {
    let x = Math.floor(Math.random() * GRID_SIZE);
    let y = Math.floor(Math.random() * GRID_SIZE);
    if (!snake.some(s => s.x === x && s.y === y)) {
      apple = {x, y};
      break;
    }
  }
}

// --- Gestion des touches clavier ---
function handleKey(e) {
  if (!running && (e.key === 'r' || e.key === 'R')) { startGame(); return; }
  if (!running) return;
  let d = null;
  if (e.key === 'ArrowUp' || e.key === 'z' || e.key === 'Z') d = {x:0, y:-1};
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') d = {x:0, y:1};
  if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q') d = {x:-1, y:0};
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') d = {x:1, y:0};
  if (d && (d.x !== -direction.x || d.y !== -direction.y)) {
    nextDirection = d;
  }
}

// --- Boucle principale du jeu ---
function gameLoop() {
  if (!running) return;
  let now = Date.now();
  if (now - moveTimer > MOVE_INTERVAL) {
    moveSnake();
    moveTimer = now;
  }
  draw();
  requestAnimationFrame(gameLoop);
}

// --- Déplacer le serpent ---
function moveSnake() {
  direction = {...nextDirection};
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  // Collision murs
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    endGame();
    return;
  }
  // Collision avec soi-même
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }
  snake.unshift(head);
  // Si la pomme est mangée
  if (head.x === apple.x && head.y === apple.y) {
    score++;
    scoreEl.textContent = score;
    placeApple();
    appleEffect = APPLE_EFFECT_DURATION;
  } else {
    snake.pop();
  }
}

// --- Fin de partie ---
function endGame() {
  running = false;
  gameOver = true;
  gameOverEl.innerHTML = `GAME OVER<br>Score : ${score}<br><span style='font-size:1rem'>Appuyez sur R ou cliquez pour rejouer</span>`;
  gameOverEl.style.display = 'block';
  restartBtn.style.display = 'inline-block';
}

// --- Dessiner le jeu ---
function draw() {
  // Effet de vibration du canvas lors de la prise de pomme
  if (appleEffect > 0) {
    let shake = Math.random() * 4 - 2;
    canvas.style.boxShadow = `0 4px 24px #000a, 0 0 ${8 + shake}px #ff4444`;
    appleEffect -= 16;
  } else {
    canvas.style.boxShadow = '0 4px 24px #000a';
    appleEffect = 0;
  }
  // Fond
  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  // Pomme (effet grossissement si mangée)
  ctx.save();
  if (appleEffect > 0) {
    let scale = 1 + 0.25 * (appleEffect / APPLE_EFFECT_DURATION);
    ctx.translate((apple.x + 0.5) * cellSize, (apple.y + 0.5) * cellSize);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, cellSize * 0.45, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 12;
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc((apple.x + 0.5) * cellSize, (apple.y + 0.5) * cellSize, cellSize * 0.45, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 0;
    ctx.fill();
  }
  ctx.restore();
  // Serpent
  for (let i = 0; i < snake.length; i++) {
    ctx.save();
    let s = snake[i];
    ctx.beginPath();
    ctx.rect(s.x * cellSize + 1, s.y * cellSize + 1, cellSize - 2, cellSize - 2);
    ctx.fillStyle = i === 0 ? '#44ff44' : '#22bb22';
    ctx.shadowColor = i === 0 ? '#fff' : 'transparent';
    ctx.shadowBlur = i === 0 ? 6 : 0;
    ctx.fill();
    ctx.restore();
  }
}
