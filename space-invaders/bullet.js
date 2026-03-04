export const bullets = [];
const bulletSpeed = 7;

export function shootBullet(player) {
    const shootSound = document.getElementById("shootSound");
    if (shootSound) {
        shootSound.currentTime = 0; // allows rapid-fire without delay
        shootSound.play().catch(() => {}); // prevents autoplay errors
    }

    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10
    });
}

export function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y < 0) bullets.splice(i, 1);
    }
}

export function drawBullets(ctx) {
    ctx.fillStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 12;

    bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    ctx.shadowBlur = 0;
}
