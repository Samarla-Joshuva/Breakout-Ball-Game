// Canvas and Context
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// Player (Paddle)
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 40;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
};

// Ball Settings
let ballWidth = 15;
let ballHeight = 10;
let ballVelocityX = 4;
let ballVelocityY = 2;

let balls = [
    {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY,
        out: false
    },
    {
        x: boardWidth / 2 - 40,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: -ballVelocityX,
        velocityY: ballVelocityY,
        out: false
    },
    {
        x: boardWidth / 2 + 40,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: -ballVelocityY,
        out: false
    }
];

// Blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3;
let blockMaxRows = 10;
let blockCount = 0;
let blockX = 15;
let blockY = 45;

// Game State
let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    createBlocks();
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    // Draw player
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    // Draw and move balls
    context.fillStyle = "white";
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        if (ball.out) continue;

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        context.fillRect(ball.x, ball.y, ball.width, ball.height);

        // Paddle collision
        if (topCollision(ball, player) || bottomCollision(ball, player)) {
            ball.velocityY *= -1;
        } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
            ball.velocityX *= -1;
        }

        // Wall collision
        if (ball.y <= 0) ball.velocityY *= -1;
        if (ball.x <= 0 || ball.x + ball.width >= boardWidth) ball.velocityX *= -1;

        // Bottom collision
        if (ball.y + ball.height >= boardHeight) {
            ball.out = true;
        }

        // Block collision
        for (let j = 0; j < blockArray.length; j++) {
            let block = blockArray[j];
            if (!block.break) {
                if (topCollision(ball, block) || bottomCollision(ball, block)) {
                    block.break = true;
                    ball.velocityY *= -1;
                    score += 100;
                    blockCount--;
                } else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                    block.break = true;
                    ball.velocityX *= -1;
                    score += 100;
                    blockCount--;
                }
            }
        }
    }

    // Check for game over
    if (balls.every(ball => ball.out)) {
        context.font = "20px sans-serif";
        context.fillStyle = "white";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOver = true;
    }

    // Draw blocks
    context.fillStyle = "lightgreen";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    // Next level
    if (blockCount === 0) {
        score += 100 * blockRows * blockColumns;
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    // Draw score
    context.font = "18px sans-serif";
    context.fillStyle = "yellow";
    context.fillText("SCORE:", 10, 25);
    context.font = "20px sans-serif";
    context.fillText(score, 90, 25);
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code === "Space") {
            resetGame();
        }
        return;
    }

    if (e.code === "ArrowLeft") {
        let nextX = player.x - player.velocityX;
        if (nextX >= 0) player.x = nextX;
    } else if (e.code === "ArrowRight") {
        let nextX = player.x + player.velocityX;
        if (nextX + player.width <= boardWidth) player.x = nextX;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = [];
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * (blockWidth + 10),
                y: blockY + r * (blockHeight + 10),
                width: blockWidth,
                height: blockHeight,
                break: false
            };
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;

    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    };

    balls = [
        {
            x: boardWidth / 2,
            y: boardHeight / 2,
            width: ballWidth,
            height: ballHeight,
            velocityX: ballVelocityX,
            velocityY: ballVelocityY,
            out: false
        },
        {
            x: boardWidth / 2 - 40,
            y: boardHeight / 2,
            width: ballWidth,
            height: ballHeight,
            velocityX: -ballVelocityX,
            velocityY: ballVelocityY,
            out: false
        },
        {
            x: boardWidth / 2 + 40,
            y: boardHeight / 2,
            width: ballWidth,
            height: ballHeight,
            velocityX: ballVelocityX,
            velocityY: -ballVelocityY,
            out: false
        }
    ];

    blockRows = 3;
    score = 0;
    createBlocks();
}
