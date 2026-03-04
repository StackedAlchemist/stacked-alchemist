/* ============================================================
   COSMIC RIFT DEFENDER — bullet.js
   Player bullets · Enemy bullets · Fire cooldown
============================================================ */

var bullets      = [];
var enemyBullets = [];
var lastFireTime = 0;
var FIRE_COOLDOWN = 250; // ms between shots

function shootBullet() {
  var now = Date.now();
  if (now - lastFireTime < FIRE_COOLDOWN) return;
  lastFireTime = now;

  bullets.push({
    x: player.x + player.w / 2 - 2,
    y: player.y,
    w: 4,
    h: 14
  });

  sfxShoot();
}

function updateBullets() {
  for (var i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= 8;
    if (bullets[i].y < 0) bullets.splice(i, 1);
  }
}

function drawBullets() {
  for (var i = 0; i < bullets.length; i++) {
    var b = bullets[i];
    ctx.shadowColor = "#ff3030";
    ctx.shadowBlur  = 12;
    var grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    grad.addColorStop(0, "#ff8080");
    grad.addColorStop(1, "#ff0000");
    ctx.fillStyle = grad;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }
  ctx.shadowBlur = 0;
}

function updateEnemyBullets() {
  for (var i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].y += enemyBullets[i].speed;
    if (enemyBullets[i].y > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }
    // Check collision with player
    if (collides(enemyBullets[i], player)) {
      spawnExplosion(player.x + player.w/2, player.y + player.h/2, "#00ffc8", 12);
      enemyBullets.splice(i, 1);
      loseLife();
    }
  }
}

function drawEnemyBullets() {
  for (var i = 0; i < enemyBullets.length; i++) {
    var b = enemyBullets[i];
    ctx.shadowColor = "#ffdd00";
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = "#ffee44";
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }
  ctx.shadowBlur = 0;
}
