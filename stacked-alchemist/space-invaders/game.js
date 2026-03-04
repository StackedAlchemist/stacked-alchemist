import { player, initPlayer, updatePlayer, drawPlayer, drawLives } from "./player.js";
import { bullets, shootBullet, updateBullets, drawBullets } from "./bullet.js";
import { updateParticles, drawParticles } from "./enemy.js";
import {
    enemies,
    createEnemies,
    updateEnemies,
    drawEnemies,
    enemyBullets,
    enemyShoot,
    updateEnemyBullets,
    drawEnemyBullets,
    handleEnemyCollisions,
    isColliding
} from "./enemy.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2
    });
}
function drawStarfield() {
    ctx.fillStyle = "white";
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}


let gameState = "start"; // "start" | "playing" | "gameover" | "win"
let lastTime = 0;
let score = 0;
let enemyShootTimer = 0;
let lives = 3;

initPlayer(canvas);
createEnemies();

// Controls
document.addEventListener("keydown", e => {
    if (gameState === "start" && e.key === "Enter") {
        gameState = "playing";
    }

    if (gameState === "playing") {
        if (e.key === "ArrowLeft" || e.key === "a") player.movingLeft = true;
        if (e.key === "ArrowRight" || e.key === "d") player.movingRight = true;
        if (e.key === " " || e.key === "Spacebar") shootBullet(player);
    }

    if ((gameState === "gameover" || gameState === "win") && e.key === "r") {
        resetGame();
        gameState = "playing";
    }

    if ((gameState === "gameover" || gameState === "win") && e.key === "m") {
        resetGame();
        gameState = "start";
    }
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key === "a") player.movingLeft = false;
    if (e.key === "ArrowRight" || e.key === "d") player.movingRight = false;
});

function update() {
    if (gameState !== "playing") return;

    updatePlayer(canvas);
    updateBullets();
    updateEnemies(canvas);
    updateParticles();

    score += handleEnemyCollisions();

    if (enemies.length === 0) {
        gameState = "win";
        return;
    }

    enemyShootTimer++;
    if (enemyShootTimer > 60) {
        enemyShoot();
        enemyShootTimer = 0;
    }

    updateEnemyBullets(canvas);

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (isColliding(enemyBullets[i], player)) {
            enemyBullets.splice(i, 1);
            lives--;

            if (lives <= 0) {
                gameState = "gameover";
                return;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1) Background
    drawStarfield();

    // 2) Neon frame
    ctx.strokeStyle = "magenta";
    ctx.lineWidth = 4;
    ctx.shadowColor = "magenta";
    ctx.shadowBlur = 20;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    ctx.shadowBlur = 0;

    // 3) Menus
    if (gameState === "start") {
    ctx.fillStyle = "white";

    // Title
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Cosmic Rift Defender", canvas.width / 2, 200);

    // Subtitle
    ctx.font = "20px Arial";
    ctx.fillText("Press ENTER to Start", canvas.width / 2, 300);

    return;
}


    if (gameState === "gameover") {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, 200);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Retry", canvas.width / 2, 300);
    ctx.fillText("Press M for Main Menu", canvas.width / 2, 350);
    return;
}


    if (gameState === "win") {
    ctx.fillStyle = "lime";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvas.width / 2, 200);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Retry", canvas.width / 2, 300);
    ctx.fillText("Press M for Main Menu", canvas.width / 2, 350);
    return;
}


    // 4) Gameplay
    if (gameState === "playing") {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${score}`, 10, 25);

        drawPlayer(ctx);
        drawBullets(ctx);
        drawEnemies(ctx);
        drawEnemyBullets(ctx);
        drawLives(ctx, lives);

        // 5) Explosions on top of everything
        drawParticles(ctx);
    }
}


function gameLoop(timestamp) {
    lastTime = timestamp;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

function resetGame() {
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 60;
    player.movingLeft = false;
    player.movingRight = false;

    bullets.length = 0;
    enemyBullets.length = 0;

    enemies.length = 0;
    createEnemies();

    score = 0;
    lives = 3;
    enemyShootTimer = 0;
}
