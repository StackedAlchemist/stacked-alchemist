/* ============================================================
   COSMIC RIFT DEFENDER — enemy.js
   Enemy types · Formation marching · Shooting · Particles
============================================================ */

var enemies          = [];
var enemyDirection   = 1;
var enemySpeedCurrent= 1;
var enemyShootTimer  = 0;

var ENEMY_TYPES = [
  { color:"#00ffff", glowColor:"#00ffff", points:10, shape:"rect"    },
  { color:"#ff44ff", glowColor:"#ff00ff", points:20, shape:"diamond" },
  { color:"#ffaa00", glowColor:"#ff8800", points:30, shape:"cross"   },
  { color:"#ff4444", glowColor:"#ff0000", points:50, shape:"boss"    }
];

/* ── Create enemy formation ── */
function createEnemies() {
  enemies.length = 0;
  var diff = DIFFICULTIES[difficulty];
  var rows = Math.min(3 + Math.floor(wave / 2), 6);
  var cols = Math.min(6 + Math.floor(wave / 3), 10);
  var ew   = Math.floor((canvas.width - 80) / (cols + 1.8));
  var eh   = 20;
  var pad  = Math.floor(ew * 0.35);

  enemySpeedCurrent = diff.enemySpeed;
  enemyDirection    = 1;

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var typeIdx = (r === 0 && wave > 3) ? 3 : Math.min(Math.floor(r * (4 / rows)), 3);
      var type    = ENEMY_TYPES[typeIdx];
      enemies.push({
        x:          40 + c * (ew + pad / 2),
        y:          40 + r * (eh + 12),
        w:          ew,
        h:          eh,
        type:       type,
        hp:         typeIdx === 3 ? 2 : 1,
        animOffset: Math.random() * Math.PI * 2
      });
    }
  }
}

/* ── Update formation march ── */
function updateEnemies() {
  // Move entire formation
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].x += enemySpeedCurrent * enemyDirection;
  }

  if (enemies.length === 0) return;

  // Check formation edges
  var leftmost  = enemies[0].x;
  var rightmost = enemies[0].x + enemies[0].w;
  for (var i = 1; i < enemies.length; i++) {
    if (enemies[i].x < leftmost)            leftmost  = enemies[i].x;
    if (enemies[i].x + enemies[i].w > rightmost) rightmost = enemies[i].x + enemies[i].w;
  }

  if (rightmost >= canvas.width - 10 || leftmost <= 10) {
    // Snap back inside boundary cleanly
    if (rightmost >= canvas.width - 10) {
      var over = rightmost - (canvas.width - 10);
      for (var i = 0; i < enemies.length; i++) enemies[i].x -= over;
    } else {
      var over = 10 - leftmost;
      for (var i = 0; i < enemies.length; i++) enemies[i].x += over;
    }
    // Drop and reverse
    enemyDirection *= -1;
    for (var i = 0; i < enemies.length; i++) enemies[i].y += 12;
  }
}

/* ── Enemy shooting ── */
function enemyShoot() {
  if (enemies.length === 0) return;
  var diff    = DIFFICULTIES[difficulty];
  var shooter = enemies[Math.floor(Math.random() * enemies.length)];
  enemyBullets.push({
    x:     shooter.x + shooter.w / 2 - 2,
    y:     shooter.y + shooter.h,
    w:     4,
    h:     10,
    speed: diff.enemyBulletSpeed
  });
}

/* ── Draw enemies ── */
function drawEnemies() {
  for (var i = 0; i < enemies.length; i++) {
    drawEnemy(enemies[i]);
  }
}

function drawEnemy(e) {
  var cx  = e.x + e.w / 2;
  var cy  = e.y + e.h / 2;
  var bob = Math.sin(Date.now() * 0.002 + e.animOffset) * 2;

  ctx.shadowColor = e.type.glowColor;
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = e.hp > 1 ? "#ffffff" : e.type.color;

  if (e.type.shape === "rect") {
    ctx.fillRect(e.x, e.y + bob, e.w, e.h);
    // Antenna
    ctx.fillRect(cx - 1, e.y + bob - 5, 2, 5);
    ctx.fillRect(cx - 5, e.y + bob - 7, 4, 2);
    ctx.fillRect(cx + 1, e.y + bob - 7, 4, 2);

  } else if (e.type.shape === "diamond") {
    ctx.beginPath();
    ctx.moveTo(cx,       e.y + bob);
    ctx.lineTo(e.x+e.w,  cy  + bob);
    ctx.lineTo(cx,       e.y + e.h + bob);
    ctx.lineTo(e.x,      cy  + bob);
    ctx.closePath();
    ctx.fill();

  } else if (e.type.shape === "cross") {
    var t = Math.floor(e.w * 0.25);
    ctx.fillRect(e.x + t, e.y + bob,       e.w - t*2, e.h);
    ctx.fillRect(e.x,     cy - t/2 + bob,  e.w,       t);

  } else { // boss
    ctx.beginPath();
    ctx.moveTo(cx,              e.y + bob);
    ctx.lineTo(e.x + e.w,       e.y + e.h*0.4 + bob);
    ctx.lineTo(e.x + e.w*0.8,   e.y + e.h + bob);
    ctx.lineTo(e.x + e.w*0.2,   e.y + e.h + bob);
    ctx.lineTo(e.x,              e.y + e.h*0.4 + bob);
    ctx.closePath();
    ctx.fill();
    // HP bar pip
    if (e.hp > 1) {
      ctx.fillStyle = "white";
      ctx.fillRect(cx - 5, e.y + bob - 8, 10, 3);
    }
  }

  ctx.shadowBlur = 0;
}

/* ── Handle bullet vs enemy collisions ── */
function handleEnemyCollisions() {
  for (var i = enemies.length - 1; i >= 0; i--) {
    for (var j = bullets.length - 1; j >= 0; j--) {
      if (collides(bullets[j], enemies[i])) {
        enemies[i].hp--;
        bullets.splice(j, 1);

        if (enemies[i].hp <= 0) {
          spawnExplosion(
            enemies[i].x + enemies[i].w / 2,
            enemies[i].y + enemies[i].h / 2,
            enemies[i].type.glowColor
          );
          score += Math.round(enemies[i].type.points * DIFFICULTIES[difficulty].scoreMult);
          sfxExplode();
          enemies.splice(i, 1);
        } else {
          spawnHitSpark(enemies[i].x + enemies[i].w/2, enemies[i].y + enemies[i].h/2);
          sfxHit();
        }
        break;
      }
    }
  }
}

/* ── Particles ── */
var particles = [];

function spawnExplosion(x, y, color, count) {
  count = count || 18;
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = Math.random() * 4 + 1;
    particles.push({
      x: x, y: y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 40, maxLife: 40,
      color: color || "#ff8800",
      size: Math.random() * 3 + 1
    });
  }
}

function spawnHitSpark(x, y) {
  for (var i = 0; i < 6; i++) {
    var angle = Math.random() * Math.PI * 2;
    particles.push({
      x: x, y: y,
      dx: Math.cos(angle) * 2,
      dy: Math.sin(angle) * 2,
      life: 12, maxLife: 12,
      color: "#ffffff", size: 1.5
    });
  }
}

function updateParticles() {
  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].x += particles[i].dx;
    particles[i].y += particles[i].dy;
    particles[i].life--;
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = p.color;
    ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur  = 0;
}

/* ── Collision helper ── */
function collides(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
