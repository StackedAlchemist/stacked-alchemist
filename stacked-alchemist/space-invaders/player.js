export const player = {
    width: 40,
    height: 20,
    x: 0,
    y: 0,
    speed: 5,
    movingLeft: false,
    movingRight: false
};

export function initPlayer(canvas) {
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 60;
}

export function updatePlayer(canvas) {
    if (player.movingLeft) player.x -= player.speed;
    if (player.movingRight) player.x += player.speed;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

export function drawPlayer(ctx) {
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

export function drawLives(ctx, lives) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Lives: ${lives}`, 500, 25);
}
