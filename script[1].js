const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const overlay = document.getElementById('overlay');
const overlayMessage = document.getElementById('overlay-message');

const dinoSprite = new Image();
dinoSprite.src = './stitch.png'; // Use a relative path within your project folder
dinoSprite.onload = () => {
    console.log("Dino sprite sheet loaded!");
};

const DINO_FRAME_WIDTH = 45;
const DINO_FRAME_HEIGHT = 53;
const RUN_FRAMES = 2;
let currentFrame = 0 ;
let animationTimer = 0;
const ANIMATION_SPEED = 7;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const DINO_SIZE = 75 ;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_HEIGHT = 50;
const JUMP_SPEED = 20;
const GRAVITY = 0.8  ;
const DINO_START_Y = HEIGHT - DINO_SIZE - 30;
const GROUND_Y = HEIGHT - 20;
const FPS = 60;
let SPEED = 0;

let dino, obstacles, score, game_over, obstacle_timer, obstacle_frequency;

function resetGame() {
    dino = {
        x: 50,
        y: DINO_START_Y,
        size: DINO_SIZE,
        y_velocity: 0,
        is_jumping: false
    };

    obstacles = [];
    score = 0;
    game_over = false;
    obstacle_timer = 0;
    obstacle_frequency = 100;
    SPEED = 5;
    overlay.style.display = "none";
    scoreDisplay.textContent = score;
}

class Obstacle {
    constructor(x) {
        this.x = x;
        this.y = GROUND_Y - OBSTACLE_HEIGHT;
        
        // Randomized width and height
        this.width = Math.random() * 30 + 20; // Width between 20 to 50
        this.height = Math.random() * 50 + 30; // Height between 30 to 80
        
        this.speed = SPEED;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

function jump() {
    if (!dino.is_jumping && !game_over) {
        dino.is_jumping = true;
        dino.y_velocity = -JUMP_SPEED;
    }
}

function updateDino() {
    if (dino.is_jumping) {
        dino.y_velocity += GRAVITY;
        dino.y += dino.y_velocity;

        if (dino.y >= DINO_START_Y) {
            dino.y = DINO_START_Y;
            dino.is_jumping = false;
        }
    }
}

function drawDino() {
    const frameX = currentFrame * DINO_FRAME_WIDTH;

    ctx.drawImage(
        dinoSprite,
        frameX, 0,
        DINO_FRAME_WIDTH, DINO_FRAME_HEIGHT,
        dino.x, dino.y - (DINO_FRAME_HEIGHT - DINO_SIZE),
        DINO_FRAME_WIDTH * (DINO_SIZE / DINO_FRAME_HEIGHT),
        DINO_FRAME_HEIGHT * (DINO_SIZE / DINO_FRAME_HEIGHT)
    );

    // Stop animation after crash
    if (!game_over) {
        animationTimer++;
        if (animationTimer >= ANIMATION_SPEED) {
            animationTimer = 0;
            currentFrame = (currentFrame + 1) % RUN_FRAMES;
        }
    }
}

function checkCollision(dino, obstacle) {
    return (
        dino.x + dino.size > obstacle.x &&
        dino.x < obstacle.x + obstacle.width &&
        dino.y + dino.size > obstacle.y &&
        dino.y < obstacle.y + obstacle.height
    );
}

function updateGame() {
    if (!game_over) {
        obstacle_timer++;

        if (obstacle_timer >= obstacle_frequency) {
            obstacles.push(new Obstacle(WIDTH + 20+5+10));
            
            // Randomize the frequency of obstacle spawning
            obstacle_frequency = Math.random() * 50 + 100; // Between 100 and 150 frames
            obstacle_timer = 0;
        }

        updateDino();

        obstacles.forEach((obstacle, index) => {
            obstacle.update();

            if (obstacle.x < -obstacle.width) {
                obstacles.splice(index, 1);
            }

            if (checkCollision(dino, obstacle.getRect())) {
                game_over = true;
                overlayMessage.textContent = "YOU ARE DEAD, NOOB!.";
                overlay.style.display = "flex";
            }
        });

        score++;
        if (score % 100 === 0) {
            SPEED += 0.75;
        }

        scoreDisplay.textContent = score;
    }
}

function drawGame() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawDino();
    obstacles.forEach(obstacle => obstacle.draw());

    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(WIDTH, GROUND_Y);
    ctx.stroke();
}

function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
    if (e.code === 'Enter' && game_over) {
        resetGame();
    }
});

// Touch & click to jump (only when not game over)
canvas.addEventListener('touchstart', (e) => {
    if (!game_over) jump();
    e.preventDefault();
});

canvas.addEventListener('mousedown', (e) => {
    if (!game_over) jump();
    e.preventDefault();
});

// Start game
resetGame();
gameLoop();
