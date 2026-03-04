import { bullets } from "./bullet.js";

export const enemies = [];
const enemyRows = 4;
const enemyCols = 8;
const enemyWidth = 30;
const enemyHeight = 20;
let enemySpeed = 1;
let enemyDirection = 1;

export const enemyBullets = [];
const enemyBulletSpeed = 3;

export function createEnemies() {
    const padding = 20;
    const offsetTop = 40;
    const offsetLeft = 40;

    enemies.length = 0;

    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: offsetLeft + col * (enemyWidth + padding),
                y: offsetTop + row * (enemyHeight + padding),
                width: enemyWidth,
                height: enemyHeight
            });
        }
    }
}

export function updateEnemies(canvas) {
    let hitEdge = false;

    enemies.forEach(enemy => {
        enemy.x += enemySpeed * enemyDirection;
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) hitEdge = true;
    });

    if (hitEdge) {
        enemyDirection *= -1;
        enemies.forEach(enemy => enemy.y += 20);
    }
}

export function drawEnemies(ctx) {
    ctx.fillStyle = "cyan";
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 15;
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    ctx.shadowBlur = 0;
}

export function enemyShoot() {
    if (enemies.length === 0) return;

    const shooter = enemies[Math.floor(Math.random() * enemies.length)];

    enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 10
    });
}

export function updateEnemyBullets(canvas) {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBulletSpeed;

        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
}

export function drawEnemyBullets(ctx) {
    ctx.fillStyle = "yellow";
    ctx.shadowColor = "yellow";
    ctx.shadowBlur = 10;
    enemyBullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });
    ctx.shadowBlur = 0;
}

export function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export const particles = [];

export function spawnExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x,
            y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            life: 30
        });
    }
}

export function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

export function drawParticles(ctx) {
    ctx.fillStyle = "orange";
    particles.forEach(p => {
        ctx.fillRect(p.x, p.y, 3, 3);
    });
}

export function handleEnemyCollisions() {
    let kills = 0;

    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (isColliding(bullets[j], enemies[i])) {

                // spawn explosion at enemy position
                spawnExplosion(enemies[i].x + enemies[i].width / 2,
                               enemies[i].y + enemies[i].height / 2);

                // play explosion sound safely
                const explosionSound = document.getElementById("explosionSound");
                if (explosionSound) {
                    explosionSound.currentTime = 0;
                    explosionSound.play().catch(() => {});
                }

                enemies.splice(i, 1);
                bullets.splice(j, 1);
                kills++;
                break;
            }
        }
    }

    return kills;
}
