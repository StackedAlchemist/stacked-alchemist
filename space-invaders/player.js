/* ============================================================
   COSMIC RIFT DEFENDER — player.js
   Player ship: state, movement, drawing
============================================================ */

var player = {
  x: 0, y: 0,
  w: 44, h: 22,
  speed: 5,
  left: false,
  right: false
};

function initPlayer() {
  player.x = canvas.width  / 2 - player.w / 2;
  player.y = canvas.height - 55;
}

function updatePlayer() {
  if (player.left)  player.x = Math.max(0, player.x - player.speed);
  if (player.right) player.x = Math.min(canvas.width - player.w, player.x + player.speed);
}

function drawPlayer() {
  var cx = player.x + player.w / 2;

  // Engine glow
  ctx.shadowColor = "#00ffc8";
  ctx.shadowBlur  = 18;

  // Ship body
  ctx.fillStyle = "#00ffc8";
  ctx.beginPath();
  ctx.moveTo(cx,                      player.y);
  ctx.lineTo(player.x + player.w,     player.y + player.h);
  ctx.lineTo(player.x + player.w*0.7, player.y + player.h*0.75);
  ctx.lineTo(cx,                      player.y + player.h*0.9);
  ctx.lineTo(player.x + player.w*0.3, player.y + player.h*0.75);
  ctx.lineTo(player.x,                player.y + player.h);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = "rgba(0,255,200,0.35)";
  ctx.beginPath();
  ctx.ellipse(cx, player.y + player.h * 0.4, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Engine exhaust flicker
  var flicker = 0.6 + Math.random() * 0.4;
  ctx.fillStyle = "rgba(0,200,255," + flicker + ")";
  ctx.beginPath();
  ctx.moveTo(player.x + player.w*0.35, player.y + player.h);
  ctx.lineTo(cx,                        player.y + player.h + 8 + Math.random()*8);
  ctx.lineTo(player.x + player.w*0.65, player.y + player.h);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
}
