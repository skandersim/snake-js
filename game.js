const canvas = document.querySelector('.field');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
let score = 0;

const highScoreEl = document.getElementById('highScore');
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
highScoreEl.textContent = highScore;

const darkCell  = '#1f5a3a';
const lightCell = '#2a7046';
const darkLine  = 'rgba(15, 55, 35, 0.55)';
const lightLine = 'rgba(180, 230, 150, 0.2)';

const cellSize = 20
let directionX = cellSize;
let directionY = 0;

let snake = [
    { x: 200, y: 100 },
    { x: 180, y: 100 },
    { x: 160, y: 100 },
    { x: 140, y: 100 },
]

const startButton = document.querySelector('.start-btn'); 
const startPage = document.querySelector('.start-page');
let interval = 0

function resetGame() {
    snake = [
        { x: 200, y: 100 },
        { x: 180, y: 100 },
        { x: 160, y: 100 },
        { x: 140, y: 100 },
    ];
    score = 0;
    scoreEl.textContent = score;
    spawnApple();
    drawGame(snake, cellSize);
}

startButton.addEventListener('click', () => {
    startPage.classList.add('hidden');
    clearInterval(interval);
    resetGame();
    interval = setInterval(movement, 150);
});

let apple;

function spawnApple () {
    let randomX;
    let randomY;
    let isOccupied = true;
    
    while (isOccupied) {
        randomX = Math.floor(Math.random() * (canvas.width / cellSize)) * cellSize;
        randomY = Math.floor(Math.random() * (canvas.height / cellSize)) * cellSize;

        isOccupied = false;

        isOccupied = snake.some(segment => segment.x === randomX && segment.y === randomY);
    };

    apple = { x: randomX, y: randomY };
};

spawnApple();

// pисует скруглённый прямоугольник для сегментов
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
}

// рисует поле
function drawBoard() {
    const cols = canvas.width / cellSize;
    const rows = canvas.height / cellSize;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * cellSize;
            const y = r * cellSize;
            const isDark = (r + c) % 2 === 0;
            ctx.fillStyle = isDark ? darkCell : lightCell;
            ctx.fillRect(x, y, cellSize, cellSize);

            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, cellSize, cellSize);
            ctx.clip();
            ctx.strokeStyle = isDark ? lightLine : darkLine;
            ctx.lineWidth = 1.5;
            for (let i = -cellSize; i <= cellSize * 2; i += 5) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i + cellSize, y + cellSize);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
}

// рисует глаза
function drawEyes(head) {
    const cx = head.x + cellSize / 2;
    const cy = head.y + cellSize / 2;
    const eyeOffset = 4;
    const eyeR = 2.4;
    const pupilR = 1.2;
    let dx = directionX / cellSize;
    let dy = directionY / cellSize;

    let ex1, ey1, ex2, ey2;
    if (dx === 1)      { ex1 = cx + eyeOffset - 1; ey1 = cy - eyeOffset + 1; ex2 = cx + eyeOffset - 1; ey2 = cy + eyeOffset - 1; }
    else if (dx === -1){ ex1 = cx - eyeOffset + 1; ey1 = cy - eyeOffset + 1; ex2 = cx - eyeOffset + 1; ey2 = cy + eyeOffset - 1; }
    else if (dy === -1){ ex1 = cx - eyeOffset + 1; ey1 = cy - eyeOffset + 1; ex2 = cx + eyeOffset - 1; ey2 = cy - eyeOffset + 1; }
    else               { ex1 = cx - eyeOffset + 1; ey1 = cy + eyeOffset - 1; ex2 = cx + eyeOffset - 1; ey2 = cy + eyeOffset - 1; }

    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ex1, ey1, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2, ey2, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(ex1 + dx * 0.8, ey1 + dy * 0.8, pupilR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex2 + dx * 0.8, ey2 + dy * 0.8, pupilR, 0, Math.PI * 2); ctx.fill();
}

// рисует красивое яблоко с листиком
function drawApple() {
    const cx = apple.x + cellSize / 2;
    const cy = apple.y + cellSize / 2;
    const r  = cellSize / 2 - 3;

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx + 1, cy + 2, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, r);
    grad.addColorStop(0, '#ff8a80');
    grad.addColorStop(0.6, '#e53935');
    grad.addColorStop(1, '#b71c1c');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - 3, cy - 3, 2.5, 1.5, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx + 2, cy - r - 3, cx + 1, cy - r - 5);
    ctx.stroke();

    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - r - 4, 3.5, 2, -0.6, 0, Math.PI * 2);
    ctx.fill();
}

function drawGame (snake, cellSize) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard();

    drawApple();

    // рисуем змейку сегментами с промежутками
    snake.forEach((segment, i) => {
        const isHead = i === 0;
        const pad = isHead ? 1.5 : 2.5;
        const x = segment.x + pad;
        const y = segment.y + pad;
        const size = cellSize - pad * 2;
        const radius = isHead ? 6 : 5;

        const t = i / Math.max(snake.length - 1, 1);
        const r1 = Math.round(90  + (50 - 90) * t);
        const g1 = Math.round(200 + (140 - 200) * t);
        const b1 = Math.round(110 + (70 - 110) * t);
        const r2 = Math.round(40  + (25 - 40) * t);
        const g2 = Math.round(140 + (95 - 140) * t);
        const b2 = Math.round(60  + (40 - 60) * t);

        const grad = ctx.createLinearGradient(x, y, x, y + size);
        grad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
        grad.addColorStop(1, `rgb(${r2},${g2},${b2})`);
        ctx.fillStyle = grad;

        roundRect(ctx, x, y, size, size, radius);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, size, size, radius);
        ctx.stroke();

        if (isHead) drawEyes(segment);
    });
}

drawGame(snake, cellSize);

function changeDirection(direction) {
    if (direction === 'down') {
        if (directionY < 0) return;
        directionX = 0;
        directionY = cellSize;
    } else if (direction === 'up') {
        if (directionY > 0) return;
        directionX = 0;
        directionY = -cellSize

    } else if (direction === 'left') {
        if (directionX > 0) return
        directionX = -cellSize;
        directionY = 0;

    } else if (direction === 'right') {
        if (directionX < 0) return
        directionX = cellSize;
        directionY = 0;
    }
};

const controls = document.querySelector('.directions-buttons');

controls.addEventListener('touchstart', (event) => {
    event.preventDefault();
    const pressedBtn = event.target.closest('.touch-btn');
    if (!pressedBtn) return;
    const direction = pressedBtn.dataset.direction;
    changeDirection(direction);
})

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') changeDirection('down');
    if (event.key === 'ArrowUp') changeDirection('up');
    if (event.key === 'ArrowLeft') changeDirection('left');
    if (event.key === 'ArrowRight') changeDirection('right');

    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
});

function movement () {
    let snakeX = snake[0].x + directionX;
    let snakeY = snake[0].y + directionY;

    const ateApple = snakeX === apple.x && snakeY === apple.y;

    if (ateApple) {
        score++;
        scoreEl.textContent = score;

        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    }

    if (snakeX >= canvas.width || snakeX < 0 || snakeY < 0 || snakeY >= canvas.height) {
        clearInterval(interval);
        startPage.classList.remove('hidden');
        startPage.querySelector('h2').textContent = 'Вы проиграли';
        startPage.querySelector('p').textContent = `Ваш счёт: ${score}. Нажмите «Старт», чтобы начать заново.`;
        return;
    }

    for (let i = 1; i < snake.length - 1; i++) {
        if (snakeX === snake[i].x && snakeY === snake[i].y) {
            clearInterval(interval);
            startPage.classList.remove('hidden');
            startPage.querySelector('h2').textContent = 'Вы проиграли';
            startPage.querySelector('p').textContent = `Ваш счёт: ${score}. Нажмите «Старт», чтобы начать заново.`;
            return;
        };
    };

    if (ateApple) {
        snake.unshift({ x: snakeX , y: snakeY });
        spawnApple();
    } else {
        snake.unshift({ x: snakeX , y: snakeY });
        snake.pop();
    }
    
    drawGame(snake, cellSize);
}

