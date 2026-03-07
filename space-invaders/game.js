/* ============================================================
   COSMIC RIFT DEFENDER — game.js
   Game loop · State · Audio · Input · HUD · Difficulty
============================================================ */

/* ── Canvas ── */
var canvas = document.getElementById("gameCanvas");
var ctx    = canvas.getContext("2d");

function resizeCanvas() {
  var maxW = Math.min(window.innerWidth - 20, 680);
  var maxH = Math.min(window.innerHeight - 160, 680);
  var size = Math.min(maxW, maxH);
  canvas.width  = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener("resize", function() {
  resizeCanvas();
  if (gameState !== "playing") drawMenu();
});

/* ── Difficulty presets ── */
var DIFFICULTIES = {
  cadet:     { label:"CADET",     enemySpeed:0.35, shootInterval:110, enemyBulletSpeed:1.5, lives:5, scoreMult:1   },
  pilot:     { label:"PILOT",     enemySpeed:0.6,  shootInterval:80,  enemyBulletSpeed:2.2, lives:3, scoreMult:1.5 },
  commander: { label:"COMMANDER", enemySpeed:0.95, shootInterval:55,  enemyBulletSpeed:3.2, lives:2, scoreMult:2   },
  riftlord:  { label:"RIFTLORD",  enemySpeed:1.4,  shootInterval:32,  enemyBulletSpeed:4.5, lives:1, scoreMult:3   }
};
var difficulty = "pilot";

/* ── High scores ── */
var highScores = JSON.parse(localStorage.getItem("crd_highscores") || "{}");
function getBest(diff)       { return highScores[diff] || 0; }
function saveBest(diff, sc)  { if (sc > getBest(diff)) { highScores[diff] = sc; localStorage.setItem("crd_highscores", JSON.stringify(highScores)); } }

/* ── Audio (Web Audio API, no files needed) ── */
var audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type, duration, vol, sweep) {
  try {
    var ac   = getAudio();
    var osc  = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = type; osc.frequency.value = freq;
    if (sweep) osc.frequency.exponentialRampToValueAtTime(sweep, ac.currentTime + duration);
    gain.gain.setValueAtTime(vol || 0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + duration);
  } catch(e) {}
}
function sfxShoot()     { playTone(880, "square",   0.08, 0.15, 220); }
function sfxExplode()   { playTone(120, "sawtooth", 0.3,  0.2,  40); setTimeout(function(){ playTone(80,"sawtooth",0.2,0.15,30); }, 80); }
function sfxHit()       { playTone(200, "sawtooth", 0.25, 0.3,  50); }
function sfxWaveClear() { playTone(262,"triangle",0.6,0.04); setTimeout(function(){ playTone(330,"triangle",0.6,0.04); },200); setTimeout(function(){ playTone(392,"triangle",0.8,0.04); },400); }
function sfxGameOver()  { playTone(300,"sawtooth",0.4,0.3,50); setTimeout(function(){ playTone(200,"sawtooth",0.4,0.25,40); },300); setTimeout(function(){ playTone(100,"sawtooth",0.5,0.2,40); },600); }

/* ── Game state ── */
var gameState = "menu";
var score     = 0;
var wave      = 1;
var lives     = 3;

/* ── Starfield ── */
var stars = [];
function initStars() {
  stars.length = 0;
  for (var i = 0; i < 120; i++) {
    stars.push({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      size:   Math.random() * 1.8 + 0.3,
      speed:  Math.random() * 0.6 + 0.1,
      bright: Math.random()
    });
  }
}

function updateStars() {
  for (var i = 0; i < stars.length; i++) {
    stars[i].y += stars[i].speed;
    if (stars[i].y > canvas.height) {
      stars[i].y = 0;
      stars[i].x = Math.random() * canvas.width;
    }
  }
}

function drawStarfield() {
  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    ctx.fillStyle = "rgba(255,255,255," + (0.3 + s.bright * 0.5) + ")";
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
}

function drawBorder() {
  var grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grd.addColorStop(0,   "rgba(0,255,200,0.6)");
  grd.addColorStop(0.5, "rgba(0,100,255,0.4)");
  grd.addColorStop(1,   "rgba(0,255,200,0.6)");
  ctx.strokeStyle = grd; ctx.lineWidth = 2;
  ctx.shadowColor = "#00ffc8"; ctx.shadowBlur = 15;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  ctx.shadowBlur = 0;
}

/* ── Main update ── */
function update() {
  if (gameState !== "playing") return;

  updateStars();
  updatePlayer();
  updateBullets();
  updateEnemies();
  updateParticles();
  handleEnemyCollisions();

  // Wave cleared?
  if (enemies.length === 0) {
    sfxWaveClear();
    wave++;
    enemyShootTimer = 0;
    setTimeout(function() { createEnemies(); }, 800);
    return;
  }

  // Enemy shooting
  enemyShootTimer++;
  if (enemyShootTimer >= DIFFICULTIES[difficulty].shootInterval) {
    enemyShoot();
    enemyShootTimer = 0;
  }

  updateEnemyBullets();

  // Enemies reached player?
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].y + enemies[i].h > player.y - 10) {
      loseLife(); return;
    }
  }

  updateHUD();
}

/* ── Main draw ── */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStarfield();
  drawBorder();

  if (gameState === "playing") {
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawEnemyBullets();
    drawParticles();
  } else if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "gameover") {
    drawGameOver();
  } else if (gameState === "win") {
    drawWin();
  }
}

/* ── Screen draws ── */
function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStarfield();
  drawBorder();

  var cx = canvas.width / 2;
  ctx.textAlign = "center";

  // Title
  ctx.font        = "900 " + clamp(28, 5, 44) + "px Orbitron,monospace";
  ctx.fillStyle   = "#00ffc8";
  ctx.shadowColor = "#00ffc8"; ctx.shadowBlur = 25;
  ctx.fillText("COSMIC RIFT", cx, canvas.height * 0.2);
  ctx.fillText("DEFENDER",    cx, canvas.height * 0.2 + clamp(32, 6, 48));
  ctx.shadowBlur = 0;

  ctx.font      = clamp(9, 1.4, 12) + "px Share Tech Mono,monospace";
  ctx.fillStyle = "rgba(0,255,200,0.45)";
  ctx.fillText("v2.0  ·  UPGRADED", cx, canvas.height * 0.2 + clamp(58, 10, 75));

  // Difficulty buttons
  var diffs  = Object.keys(DIFFICULTIES);
  var btnW   = clamp(90, 16, 130);
  var btnH   = clamp(34, 6, 44);
  var gap    = clamp(7, 1.2, 10);
  var totalW = diffs.length * (btnW + gap) - gap;
  var startX = cx - totalW / 2;
  var btnY   = canvas.height * 0.44;

  ctx.font      = clamp(8, 1.3, 11) + "px Share Tech Mono,monospace";
  ctx.fillStyle = "rgba(0,255,200,0.45)";
  ctx.fillText("SELECT DIFFICULTY", cx, btnY - 14);

  canvas._diffBtns = [];
  for (var i = 0; i < diffs.length; i++) {
    var key    = diffs[i];
    var d      = DIFFICULTIES[key];
    var bx     = startX + i * (btnW + gap);
    var active = difficulty === key;

    ctx.fillStyle   = active ? "rgba(0,255,200,0.2)" : "rgba(0,255,200,0.04)";
    ctx.strokeStyle = active ? "rgba(0,255,200,0.8)" : "rgba(0,255,200,0.25)";
    ctx.lineWidth   = active ? 2 : 1;
    if (active) { ctx.shadowColor = "#00ffc8"; ctx.shadowBlur = 12; }
    roundRect(bx, btnY, btnW, btnH, 6);
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = active ? "#00ffc8" : "rgba(0,255,200,0.55)";
    ctx.font      = clamp(8, 1.3, 10) + "px Orbitron,monospace";
    ctx.fillText(d.label, bx + btnW/2, btnY + btnH/2 + 4);

    canvas._diffBtns.push({ key:key, x:bx, y:btnY, w:btnW, h:btnH });
  }

  // Best score
  var best = getBest(difficulty);
  if (best > 0) {
    ctx.font      = clamp(9, 1.4, 12) + "px Share Tech Mono,monospace";
    ctx.fillStyle = "rgba(255,200,0,0.7)";
    ctx.fillText("BEST: " + best, cx, btnY + btnH + 22);
  }

  // Controls hint
  ctx.font      = clamp(8, 1.3, 11) + "px Share Tech Mono,monospace";
  ctx.fillStyle = "rgba(0,255,200,0.4)";
  ctx.fillText("← → / A D   MOVE        SPACE   FIRE", cx, canvas.height * 0.7);
  ctx.fillText("ENTER / TAP   START",                  cx, canvas.height * 0.7 + clamp(18, 3, 22));

  // Pulsing start prompt
  ctx.font        = "900 " + clamp(12, 2, 16) + "px Orbitron,monospace";
  ctx.fillStyle   = "#00ffc8";
  ctx.shadowColor = "#00ffc8"; ctx.shadowBlur = 20;
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.003);
  ctx.fillText("PRESS ENTER TO LAUNCH", cx, canvas.height * 0.86);
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}

function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStarfield(); drawBorder();
  var cx = canvas.width / 2;
  ctx.textAlign = "center";

  ctx.font        = "900 " + clamp(28, 5, 40) + "px Orbitron,monospace";
  ctx.fillStyle   = "#ff3030";
  ctx.shadowColor = "#ff0000"; ctx.shadowBlur = 30;
  ctx.fillText("GAME OVER", cx, canvas.height * 0.3);
  ctx.shadowBlur = 0;

  ctx.font      = clamp(11, 2, 14) + "px Share Tech Mono,monospace";
  ctx.fillStyle = "#00ffc8";
  ctx.fillText("SCORE: " + score, cx, canvas.height * 0.42);
  ctx.fillStyle = "rgba(255,200,0,0.9)";
  ctx.fillText("BEST:  " + getBest(difficulty), cx, canvas.height * 0.49);
  ctx.fillStyle = "rgba(0,255,200,0.5)";
  ctx.fillText("WAVE: " + wave + "   DIFFICULTY: " + DIFFICULTIES[difficulty].label, cx, canvas.height * 0.56);

  ctx.font      = clamp(9, 1.5, 12) + "px Share Tech Mono,monospace";
  ctx.fillStyle = "rgba(0,255,200,0.6)";
  ctx.fillText("R — RETRY          M — MENU", cx, canvas.height * 0.72);
}

function drawWin() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStarfield(); drawBorder();
  var cx = canvas.width / 2;
  ctx.textAlign = "center";

  ctx.font        = "900 " + clamp(26, 4, 38) + "px Orbitron,monospace";
  ctx.fillStyle   = "#00ffc8";
  ctx.shadowColor = "#00ffc8"; ctx.shadowBlur = 30;
  ctx.fillText("RIFT SEALED!", cx, canvas.height * 0.3);
  ctx.shadowBlur = 0;

  ctx.font      = clamp(10, 1.8, 14) + "px Share Tech Mono,monospace";
  ctx.fillStyle = "#ffdd00";
  ctx.fillText("WAVE " + (wave-1) + " CLEARED  ·  SCORE: " + score, cx, canvas.height * 0.44);
  ctx.fillStyle = "rgba(0,255,200,0.6)";
  ctx.fillText("R — NEXT WAVE          M — MENU", cx, canvas.height * 0.7);
}

/* ── Game control ── */
function startGame() {
  getAudio(); // unlock audio on user gesture
  gameState = "playing";
  updateHUD();
}

function resetGame() {
  score           = 0;
  wave            = 1;
  enemyShootTimer = 0;
  lastFireTime    = 0;
  lives           = DIFFICULTIES[difficulty].lives;
  bullets.length  = 0;
  enemyBullets.length = 0;
  particles.length    = 0;
  initPlayer();
  createEnemies();
  updateHUD();
}

function loseLife() {
  lives--;
  sfxHit();
  updateHUD();
  if (lives <= 0) {
    gameState = "gameover";
    saveBest(difficulty, score);
    sfxGameOver();
  }
}

/* ── HUD ── */
function updateHUD() {
  document.getElementById("hudScore").textContent = score;
  document.getElementById("hudBest").textContent  = getBest(difficulty);
  document.getElementById("hudWave").textContent  = wave;
  document.getElementById("hudLevel").textContent = DIFFICULTIES[difficulty].label;
  var pips   = document.getElementById("livesPips");
  var maxL   = DIFFICULTIES[difficulty].lives;
  var html   = "";
  for (var i = 0; i < maxL; i++) {
    html += '<div class="life-pip ' + (i < lives ? "active" : "") + '"></div>';
  }
  pips.innerHTML = html;
}

/* ── Input ── */
document.addEventListener("keydown", function(e) {
  if (gameState === "menu") {
    if (e.key === "Enter") { startGame(); return; }
    var diffs = Object.keys(DIFFICULTIES);
    var idx   = diffs.indexOf(difficulty);
    if ((e.key === "ArrowLeft")  && idx > 0)              difficulty = diffs[idx-1];
    if ((e.key === "ArrowRight") && idx < diffs.length-1) difficulty = diffs[idx+1];
    lives = DIFFICULTIES[difficulty].lives;
    updateHUD();
    return;
  }
  if (gameState === "gameover" || gameState === "win") {
    if (e.key === "r" || e.key === "R") { resetGame(); startGame(); return; }
    if (e.key === "m" || e.key === "M") { resetGame(); gameState = "menu"; return; }
  }
  if (gameState === "playing") {
    if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") player.left  = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") player.right = true;
    if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); shootBullet(); }
    if (e.key === "Escape") gameState = "menu";
  }
});

document.addEventListener("keyup", function(e) {
  if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") player.left  = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") player.right = false;
});

// Canvas click for difficulty selection
canvas.addEventListener("click", function(e) {
  if (gameState !== "menu") return;
  var rect   = canvas.getBoundingClientRect();
  var scaleX = canvas.width  / rect.width;
  var scaleY = canvas.height / rect.height;
  var cx     = (e.clientX - rect.left) * scaleX;
  var cy     = (e.clientY - rect.top)  * scaleY;
  if (canvas._diffBtns) {
    for (var i = 0; i < canvas._diffBtns.length; i++) {
      var b = canvas._diffBtns[i];
      if (cx >= b.x && cx <= b.x+b.w && cy >= b.y && cy <= b.y+b.h) {
        difficulty = b.key; lives = DIFFICULTIES[difficulty].lives; updateHUD(); return;
      }
    }
  }
  if (cy > canvas.height * 0.78) startGame();
});

/* ── Touch controls ── */
function addTouch(btnId, onStart, onEnd) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  var start = function() { btn.classList.add("pressed"); onStart(); };
  var end   = function() { btn.classList.remove("pressed"); if (onEnd) onEnd(); };
  btn.addEventListener("touchstart", function(e) { e.preventDefault(); start(); }, { passive:false });
  btn.addEventListener("touchend",   function(e) { e.preventDefault(); end();   }, { passive:false });
  btn.addEventListener("mousedown",  start);
  btn.addEventListener("mouseup",    end);
  btn.addEventListener("mouseleave", end);
}

addTouch("btnLeft",  function(){ if(gameState==="playing") player.left=true;  }, function(){ player.left=false; });
addTouch("btnRight", function(){ if(gameState==="playing") player.right=true; }, function(){ player.right=false; });
addTouch("btnFire",  function(){
  if (gameState === "menu")                              { startGame(); return; }
  if (gameState === "playing")                           { shootBullet(); }
  if (gameState === "gameover" || gameState === "win")   { resetGame(); startGame(); }
});

// Auto-fire while holding fire on mobile
var touchFireInterval = null;
document.getElementById("btnFire").addEventListener("touchstart", function(e) {
  e.preventDefault();
  if (gameState !== "playing") return;
  touchFireInterval = setInterval(function() { if (gameState === "playing") shootBullet(); }, 280);
}, { passive:false });
document.getElementById("btnFire").addEventListener("touchend", function() {
  clearInterval(touchFireInterval); touchFireInterval = null;
}, { passive:false });

/* ── Helpers ── */
function clamp(base, vwMult, max) {
  var vw = canvas.width / 100;
  return Math.min(Math.max(base * 0.6, vwMult * vw), max);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

/* ── Boot ── */
initStars();
initPlayer();
createEnemies();
resetGame();
gameState = "menu";
updateHUD();

/* ── Game loop ── */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
