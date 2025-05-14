const canvas = document.getElementById('hockeyTable');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');
const score1Elem = document.getElementById('score1');
const score2Elem = document.getElementById('score2');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_RADIUS = 30;
const PUCK_RADIUS = 16;
const PADDLE_SPEED = 6;
const AI_SPEED = 3.2;

let gameInterval;
let running = false;
let paddleDrag = false; // flag for drag & drop

let score1 = 0;
let score2 = 0;

let paddle1 = {
    x: WIDTH/2,
    y: HEIGHT - 50,
    dx: 0,
    dy: 0
};

let paddle2 = {
    x: WIDTH/2,
    y: 50,
    dx: 0,
    dy: 0
};

let puck = {
    x: WIDTH/2,
    y: HEIGHT/2,
    dx: 4,
    dy: 3
};

// To pause AI if the puck is trapped in a corner
let stuckInCorner = false;
let stuckTimer = 0;

function resetPuck() {
    puck.x = WIDTH/2;
    puck.y = HEIGHT/2;
    let angle = Math.random() * Math.PI * 2;
    puck.dx = 4 * Math.cos(angle);
    puck.dy = 3 * Math.sin(angle);
}

function drawTable() {
    ctx.clearRect(0,0,WIDTH,HEIGHT);

    ctx.strokeStyle = '#3fa7f4';
    ctx.lineWidth = 2;

   // Center line
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT/2);
    ctx.lineTo(WIDTH, HEIGHT/2);
    ctx.stroke();

    // Upper gate
    ctx.beginPath();
    ctx.arc(WIDTH/2, 0, 70, 0, Math.PI, true);
    ctx.moveTo(WIDTH/2 - 70, 0);
    ctx.lineTo(WIDTH/2 - 70, 10);
    ctx.moveTo(WIDTH/2 + 70, 0);
    ctx.lineTo(WIDTH/2 + 70, 10);
    ctx.stroke();

    // Lower gate
    ctx.beginPath();
    ctx.arc(WIDTH/2, HEIGHT, 70, 0, Math.PI, false);
    ctx.moveTo(WIDTH/2 - 70, HEIGHT);
    ctx.lineTo(WIDTH/2 - 70, HEIGHT-10);
    ctx.moveTo(WIDTH/2 + 70, HEIGHT);
    ctx.lineTo(WIDTH/2 + 70, HEIGHT-10);
    ctx.stroke();
}

function drawPaddle(paddle, color='#ffb300') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(paddle.x, paddle.y, PADDLE_RADIUS, 0, Math.PI*2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#feca57';
    ctx.stroke();
}

function drawPuck() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, PUCK_RADIUS, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function update() {
   // Control the player's paddle touch/mouse-cursor
// paddle1.x/paddle1.y are updated in pointermove

// Limit the paddle to the field (lower half, not beyond the canvas)
    paddle1.x = Math.max(PADDLE_RADIUS, Math.min(WIDTH - PADDLE_RADIUS, paddle1.x));
    paddle1.y = Math.max(HEIGHT/2 + PADDLE_RADIUS, Math.min(HEIGHT - PADDLE_RADIUS, paddle1.y));

   // AI (with some corner improvements)
    updateAIPaddle();

    // Puck movement
    puck.x += puck.dx;
    puck.y += puck.dy;

   // Collisions and "gates"
  // Bounce off side walls, except gates
    if (puck.x < PUCK_RADIUS || puck.x > WIDTH - PUCK_RADIUS) {
        puck.dx *= -1;
        puck.x = Math.max(PUCK_RADIUS, Math.min(WIDTH-PUCK_RADIUS, puck.x));
    }
    // Rebound from the back walls, except for the goal areas
    if ((puck.y < PUCK_RADIUS && Math.abs(puck.x - WIDTH/2) > 70)
        || (puck.y > HEIGHT - PUCK_RADIUS && Math.abs(puck.x - WIDTH/2) > 70)) {
        puck.dy *= -1;
        puck.y = puck.y < HEIGHT/2 ? PUCK_RADIUS : HEIGHT-PUCK_RADIUS;
    }
    // GOAL
    if (puck.y < 0 && Math.abs(puck.x - WIDTH/2) < 70) {
        score1++;
        updateScore();
        resetPuck();
        stuckInCorner = false;
    }
    if (puck.y > HEIGHT && Math.abs(puck.x - WIDTH/2) < 70) {
        score2++;
        updateScore();
        resetPuck();
        stuckInCorner = false;
    }

    // Collisions
    checkCollision(paddle1);
    checkCollision(paddle2);
}

function updateAIPaddle() {
    // Check: if the puck is in the corner for a long time, the bot will back off a little
    if (puck.y < HEIGHT/6 && (puck.x < PUCK_RADIUS + 20 || puck.x > WIDTH - PUCK_RADIUS - 20)) {
        stuckTimer++;
        if (stuckTimer > 40) {
            // The bot will move to the center of its zone or move slightly away from the corner (do not press the puck!)
            paddle2.x += (WIDTH/2 - paddle2.x) * 0.13;
            paddle2.y += (60 - paddle2.y) * 0.2;
            stuckInCorner = true;
            return;
        }
    } else {
        stuckTimer = 0;
        stuckInCorner = false;
    }
   // AI moves only if the puck is on its half
    if (puck.y < HEIGHT/2) {
        let dx = puck.x - paddle2.x;
        let dy = puck.y - paddle2.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 1) {
            paddle2.x += AI_SPEED * dx / dist;
            paddle2.y += AI_SPEED * dy / dist;
            paddle2.x = Math.max(PADDLE_RADIUS, Math.min(WIDTH - PADDLE_RADIUS, paddle2.x));
            paddle2.y = Math.max(PADDLE_RADIUS, Math.min(HEIGHT/2 - PADDLE_RADIUS, paddle2.y));
        }
    } else {
        // when the puck is on the player's side, the AI ​​can rest in the center of his half
        paddle2.x += (WIDTH/2 - paddle2.x) * 0.07;
        paddle2.y += (50 - paddle2.y) * 0.08;
    }
}

function checkCollision(paddle) {
    let dx = puck.x - paddle.x;
    let dy = puck.y - paddle.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < PADDLE_RADIUS + PUCK_RADIUS) {
        // New puck angle and speed
        let angle = Math.atan2(dy, dx);
        let speed = Math.sqrt(puck.dx*puck.dx + puck.dy*puck.dy);
        // Let's increase the speed a little for dynamism
        speed = Math.min(speed + 0.7, 12);

        // Change only by contact vector (fully trust direction)
        puck.dx = speed * Math.cos(angle);
        puck.dy = speed * Math.sin(angle);

        // Move the puck a little further from the cue ball so it doesn't stick
        puck.x = paddle.x + (PADDLE_RADIUS + PUCK_RADIUS + 1) * Math.cos(angle);
        puck.y = paddle.y + (PADDLE_RADIUS + PUCK_RADIUS + 1) * Math.sin(angle);
    }
}

function updateScore() {
    score1Elem.textContent = score1;
    score2Elem.textContent = score2;
}

function draw() {
    drawTable();
    drawPaddle(paddle1, '#ffb300');
    drawPaddle(paddle2, '#00c6fb');
    drawPuck();
}

function gameLoop() {
    update();
    draw();
}

function startGame() {
    if (!running) {
        gameInterval = setInterval(gameLoop, 1000/60);
        running = true;
    }
}

function stopGame() {
    if (running) {
        clearInterval(gameInterval);
        running = false;
    }
}

function restartGame() {
    stopGame();
    score1 = 0;
    score2 = 0;
    updateScore();
    paddle1.x = WIDTH/2; paddle1.y = HEIGHT - 50;
    paddle2.x = WIDTH/2; paddle2.y = 50;
    resetPuck();
    draw();
}

startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);
restartBtn.addEventListener('click', restartGame);

restartGame();

// ===== Touchpad / Mouse Control =====

// Check if movement has started: cursor/finger within user's bit radius
canvas.addEventListener('pointerdown', (e) => {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    let mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    let my = (e.clientY - rect.top) * (canvas.height / rect.height);
    let dx = mx - paddle1.x, dy = my - paddle1.y;
    if (dx*dx + dy*dy < PADDLE_RADIUS*PADDLE_RADIUS * 2) {
        paddleDrag = true;
        setPaddleTo(mx, my);
    }
});

canvas.addEventListener('pointermove', (e) => {
    if (!running) return;
    if (!paddleDrag) return;
    const rect = canvas.getBoundingClientRect();
    let mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    let my = (e.clientY - rect.top) * (canvas.height / rect.height);
    setPaddleTo(mx, my);
});

canvas.addEventListener('pointerup', () => {
    paddleDrag = false;
});
canvas.addEventListener('pointerleave', () => {
    paddleDrag = false;
});

function setPaddleTo(mx, my) {
    // Bottom half only and within canvas
    paddle1.x = Math.max(PADDLE_RADIUS, Math.min(WIDTH - PADDLE_RADIUS, mx));
    paddle1.y = Math.max(HEIGHT/2 + PADDLE_RADIUS, Math.min(HEIGHT - PADDLE_RADIUS, my));
}

// Alternative arrow controls (can be disabled)
document.addEventListener('keydown', function(e) {
    if (!running) return;
    if (e.key === "ArrowLeft") paddle1.dx = -PADDLE_SPEED;
    if (e.key === "ArrowRight") paddle1.dx = PADDLE_SPEED;
    if (e.key === "ArrowUp") paddle1.dy = -PADDLE_SPEED;
    if (e.key === "ArrowDown") paddle1.dy = PADDLE_SPEED;
});
document.addEventListener('keyup', function(e) {
    if (["ArrowLeft","ArrowRight"].includes(e.key)) paddle1.dx = 0;
    if (["ArrowUp","ArrowDown"].includes(e.key)) paddle1.dy = 0;
});

//If you want to disable arrow control completely, remove the doc.addEventListener block above