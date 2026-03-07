/* ============================================================
   ARCANE SPELL GENERATOR
   - Unique Web Audio synthesized sound per spell
   - Click individual spells OR hit Cast Random
   - Canvas animation per spell
============================================================ */

const SPELLS = {
  "ignis-lux":      { name: "Ignis Lux",      sub: "Flame of Light",    desc: "A pillar of sacred fire tears upward from nothing, consuming shadow and doubt in white-gold flame. The air itself ignites where it passes.",                                      render: renderIgnisLux,      sound: soundIgnisLux      },
  "glacies-orbis":  { name: "Glacies Orbis",  sub: "Orb of Ice",        desc: "A perfect sphere of absolute cold crystallizes from nothing. Frost fractures spread outward in geometric patterns, freezing the air solid.",                                        render: renderGlaciesOrbis,  sound: soundGlaciesOrbis  },
  "fulmen-arcanum": { name: "Fulmen Arcanum", sub: "Arcane Thunder",    desc: "Lightning tears through the aether in jagged, branching arcs. The crack arrives before the light fades, and the air smells of burned sky.",                                        render: renderFulmenArcanum, sound: soundFulmenArcanum },
  "umbra-velo":     { name: "Umbra Velo",     sub: "Cloak of Shadows",  desc: "Darkness gathers and folds inward like silk drawn through a ring. Shadow tendrils spiral toward the caster, weaving a shroud that swallows light whole.",                          render: renderUmbraVelo,     sound: soundUmbraVelo     },
  "vitae-nexus":    { name: "Vitae Nexus",    sub: "Bind Life",         desc: "Threads of living green energy spiral outward and back, binding wounds, mending fractures, pulling torn things back toward wholeness.",                                              render: renderVitaeNexus,    sound: soundVitaeNexus    },
  "aetheris-vox":   { name: "Aetheris Vox",   sub: "Voice of the Void", desc: "The void speaks. Rippling waves of pure aether radiate outward in concentric rings, unmaking sound and bending reality at their edges.",                                           render: renderAetherisVox,   sound: soundAetherisVox   },
  "tempus-fractum": { name: "Tempus Fractum", sub: "Shatter Time",      desc: "Reality fractures. Crystalline shards of frozen time splinter outward in every direction, each one reflecting a moment that no longer exists.",                                     render: renderTempusFractum, sound: soundTempusFractum }
};

const SPELL_KEYS = Object.keys(SPELLS);
let canvas, ctx, animId = null, frame = 0, particles = [], audioCtx = null;

/* ── Init ── */
window.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("spell-canvas");
  ctx    = canvas.getContext("2d");
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);
  document.querySelectorAll(".spell-btn").forEach(btn => {
    btn.addEventListener("click", () => { const k = btn.dataset.spell; if (SPELLS[k]) castSpell(k, btn); });
  });
  document.getElementById("cast-random-btn").addEventListener("click", castRandom);
});

function sizeCanvas() { const w = canvas.parentElement; canvas.width = w.offsetWidth; canvas.height = w.offsetHeight; }
function getAC() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function castRandom() {
  const key = SPELL_KEYS[Math.floor(Math.random() * SPELL_KEYS.length)];
  const btn = document.querySelector(`.spell-btn[data-spell="${key}"]`);
  const cb  = document.getElementById("cast-random-btn");
  cb.classList.remove("firing"); void cb.offsetWidth; cb.classList.add("firing");
  castSpell(key, btn);
}

function castSpell(key, btn) {
  const spell = SPELLS[key];
  document.querySelectorAll(".spell-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.getElementById("canvas-idle").classList.add("hidden");
  const detail = document.getElementById("spell-detail");
  detail.style.display = "block"; detail.style.animation = "none"; void detail.offsetWidth; detail.style.animation = "";
  document.getElementById("detail-name").textContent = spell.name;
  document.getElementById("detail-sub").textContent  = spell.sub;
  document.getElementById("detail-desc").textContent = spell.desc;
  try { spell.sound(getAC()); } catch(e) {}
  if (animId) cancelAnimationFrame(animId);
  particles = []; frame = 0; sizeCanvas();
  spell.render();
}

/* ── Helpers ── */
const rand  = (a, b) => Math.random() * (b - a) + a;
const randi = (a, b) => Math.floor(rand(a, b));
const lerp  = (a, b, t) => a + (b - a) * t;
const cx    = () => canvas.width  / 2;
const cy    = () => canvas.height / 2;
function loop(fn) { (function tick() { fn(); frame++; animId = requestAnimationFrame(tick); })(); }

/* ============================================================
   SOUNDS (Web Audio API)
============================================================ */

function soundIgnisLux(ac) {
  const dur = 2.2, bs = ac.sampleRate * dur, buf = ac.createBuffer(1, bs, ac.sampleRate), d = buf.getChannelData(0);
  let ln = 0;
  for (let i = 0; i < bs; i++) { ln += (Math.random() * 2 - 1) * 0.08; ln = Math.max(-1, Math.min(1, ln)); d[i] = ln; }
  const src = ac.createBufferSource(); src.buffer = buf;
  const lpf = ac.createBiquadFilter(); lpf.type = "lowpass"; lpf.frequency.value = 600; lpf.Q.value = 1.2;
  const g = ac.createGain(); g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(0.55, ac.currentTime + 0.3); g.gain.linearRampToValueAtTime(0.45, ac.currentTime + 1.5); g.gain.linearRampToValueAtTime(0, ac.currentTime + dur);
  src.connect(lpf); lpf.connect(g); g.connect(ac.destination);
  const src2 = ac.createBufferSource(); src2.buffer = buf;
  const bpf = ac.createBiquadFilter(); bpf.type = "bandpass"; bpf.frequency.value = 1200; bpf.Q.value = 0.8;
  const g2 = ac.createGain(); g2.gain.setValueAtTime(0, ac.currentTime); g2.gain.linearRampToValueAtTime(0.18, ac.currentTime + 0.15); g2.gain.linearRampToValueAtTime(0, ac.currentTime + dur);
  src2.connect(bpf); bpf.connect(g2); g2.connect(ac.destination);
  src.start(ac.currentTime); src2.start(ac.currentTime);
}

function soundGlaciesOrbis(ac) {
  const now = ac.currentTime;
  [880, 1320, 1760, 2200, 2640].forEach((freq, i) => {
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = "sine"; osc.frequency.value = freq;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.14 / (i + 1), now + 0.01 + i * 0.04); g.gain.exponentialRampToValueAtTime(0.001, now + 1.8 + i * 0.3);
    osc.connect(g); g.connect(ac.destination); osc.start(now + i * 0.04); osc.stop(now + 2.5);
  });
  const bs2 = ac.sampleRate * 0.08, b2 = ac.createBuffer(1, bs2, ac.sampleRate), d2 = b2.getChannelData(0);
  for (let i = 0; i < bs2; i++) d2[i] = Math.random() * 2 - 1;
  const s2 = ac.createBufferSource(); s2.buffer = b2;
  const h = ac.createBiquadFilter(); h.type = "highpass"; h.frequency.value = 4000;
  const ng = ac.createGain(); ng.gain.setValueAtTime(0.3, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  s2.connect(h); h.connect(ng); ng.connect(ac.destination); s2.start(now);
}

function soundFulmenArcanum(ac) {
  const now = ac.currentTime;
  const bs = ac.sampleRate * 0.12, buf = ac.createBuffer(1, bs, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const bpf = ac.createBiquadFilter(); bpf.type = "bandpass"; bpf.frequency.value = 3000; bpf.Q.value = 0.5;
  const ng = ac.createGain(); ng.gain.setValueAtTime(0.8, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  src.connect(bpf); bpf.connect(ng); ng.connect(ac.destination); src.start(now);
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = "sawtooth"; osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
  g.gain.setValueAtTime(0.4, now + 0.04); g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  osc.connect(g); g.connect(ac.destination); osc.start(now + 0.04); osc.stop(now + 1.0);
  const bs2 = ac.sampleRate * 0.5, buf2 = ac.createBuffer(1, bs2, ac.sampleRate), d2 = buf2.getChannelData(0);
  for (let i = 0; i < bs2; i++) d2[i] = Math.random() * 2 - 1;
  const src2 = ac.createBufferSource(); src2.buffer = buf2;
  const bpf2 = ac.createBiquadFilter(); bpf2.type = "bandpass"; bpf2.frequency.value = 6000; bpf2.Q.value = 2;
  const ng2 = ac.createGain(); ng2.gain.setValueAtTime(0.15, now + 0.02); ng2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  src2.connect(bpf2); bpf2.connect(ng2); ng2.connect(ac.destination); src2.start(now + 0.02);
}

function soundUmbraVelo(ac) {
  const now = ac.currentTime;
  const o1 = ac.createOscillator(), g1 = ac.createGain();
  o1.type = "sine"; o1.frequency.setValueAtTime(80, now); o1.frequency.linearRampToValueAtTime(40, now + 2.5);
  g1.gain.setValueAtTime(0, now); g1.gain.linearRampToValueAtTime(0.5, now + 0.4); g1.gain.linearRampToValueAtTime(0, now + 2.5);
  o1.connect(g1); g1.connect(ac.destination); o1.start(now); o1.stop(now + 2.6);
  const o2 = ac.createOscillator(), g2 = ac.createGain();
  o2.type = "triangle"; o2.frequency.setValueAtTime(160, now); o2.frequency.exponentialRampToValueAtTime(55, now + 2.2);
  g2.gain.setValueAtTime(0, now); g2.gain.linearRampToValueAtTime(0.2, now + 0.6); g2.gain.linearRampToValueAtTime(0, now + 2.2);
  o2.connect(g2); g2.connect(ac.destination); o2.start(now); o2.stop(now + 2.3);
  const bs = ac.sampleRate * 1.5, buf = ac.createBuffer(1, bs, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const lpf = ac.createBiquadFilter(); lpf.type = "lowpass"; lpf.frequency.value = 300;
  const ng = ac.createGain(); ng.gain.setValueAtTime(0, now); ng.gain.linearRampToValueAtTime(0.12, now + 0.5); ng.gain.linearRampToValueAtTime(0, now + 1.5);
  src.connect(lpf); lpf.connect(ng); ng.connect(ac.destination); src.start(now);
}

function soundVitaeNexus(ac) {
  const now = ac.currentTime;
  [220, 277.18, 329.63, 440].forEach((freq, i) => {
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = "sine"; osc.frequency.value = freq;
    const vib = ac.createOscillator(), vg = ac.createGain();
    vib.frequency.value = 5.5; vg.gain.value = freq * 0.006;
    vib.connect(vg); vg.connect(osc.frequency); vib.start(now); vib.stop(now + 2.2);
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.18 - i * 0.025, now + 0.2 + i * 0.06); g.gain.linearRampToValueAtTime(0.14 - i * 0.02, now + 1.2); g.gain.linearRampToValueAtTime(0, now + 2.2);
    osc.connect(g); g.connect(ac.destination); osc.start(now); osc.stop(now + 2.3);
  });
  const osc5 = ac.createOscillator(), g5 = ac.createGain();
  osc5.type = "sine"; osc5.frequency.value = 1320;
  g5.gain.setValueAtTime(0, now); g5.gain.linearRampToValueAtTime(0.06, now + 0.1); g5.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc5.connect(g5); g5.connect(ac.destination); osc5.start(now); osc5.stop(now + 0.9);
}

function soundAetherisVox(ac) {
  const now = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(260, now); o.frequency.linearRampToValueAtTime(310, now + 0.8); o.frequency.linearRampToValueAtTime(190, now + 2.0);
  g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.3, now + 0.3); g.gain.linearRampToValueAtTime(0, now + 2.0);
  o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 2.1);
  const o2 = ac.createOscillator(), g2 = ac.createGain();
  o2.type = "triangle"; o2.frequency.setValueAtTime(520, now); o2.frequency.linearRampToValueAtTime(380, now + 2.0);
  g2.gain.setValueAtTime(0, now); g2.gain.linearRampToValueAtTime(0.12, now + 0.5); g2.gain.linearRampToValueAtTime(0, now + 2.0);
  o2.connect(g2); g2.connect(ac.destination); o2.start(now); o2.stop(now + 2.1);
  const bs = ac.sampleRate * 1.8, buf = ac.createBuffer(1, bs, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const bpf = ac.createBiquadFilter(); bpf.type = "bandpass"; bpf.frequency.value = 700; bpf.Q.value = 3;
  const ng = ac.createGain(); ng.gain.setValueAtTime(0, now); ng.gain.linearRampToValueAtTime(0.08, now + 0.4); ng.gain.linearRampToValueAtTime(0, now + 1.8);
  src.connect(bpf); bpf.connect(ng); ng.connect(ac.destination); src.start(now);
}

function soundTempusFractum(ac) {
  const now = ac.currentTime;
  const bs = ac.sampleRate * 0.05, buf = ac.createBuffer(1, bs, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const ng = ac.createGain(); ng.gain.setValueAtTime(0.9, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  src.connect(ng); ng.connect(ac.destination); src.start(now);
  [1800, 2200, 2700, 3200, 1500, 2900, 2100].forEach((freq, i) => {
    const delay = 0.02 + i * 0.035 + Math.random() * 0.04;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0, now + delay); g.gain.linearRampToValueAtTime(0.12, now + delay + 0.008); g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);
    o.connect(g); g.connect(ac.destination); o.start(now + delay); o.stop(now + delay + 0.4);
  });
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = "sawtooth"; osc.frequency.setValueAtTime(90, now); osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);
  g.gain.setValueAtTime(0.35, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  osc.connect(g); g.connect(ac.destination); osc.start(now); osc.stop(now + 0.75);
  const bs2 = ac.sampleRate * 1.2, buf2 = ac.createBuffer(1, bs2, ac.sampleRate), d2 = buf2.getChannelData(0);
  for (let i = 0; i < bs2; i++) d2[i] = (Math.random() * 2 - 1) * (1 - i / bs2);
  const src2 = ac.createBufferSource(); src2.buffer = buf2;
  const hpf = ac.createBiquadFilter(); hpf.type = "highpass"; hpf.frequency.value = 2500;
  const ng2 = ac.createGain(); ng2.gain.setValueAtTime(0.12, now + 0.05); ng2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  src2.connect(hpf); hpf.connect(ng2); ng2.connect(ac.destination); src2.start(now + 0.05);
}

/* ============================================================
   CANVAS RENDERERS
============================================================ */

function renderIgnisLux() {
  for (let i = 0; i < 60; i++) spawnFire();
  loop(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pool = ctx.createRadialGradient(cx(), canvas.height, 0, cx(), canvas.height, 140);
    pool.addColorStop(0, "rgba(255,100,0,0.4)"); pool.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(cx(), canvas.height, 140, 50, 0, 0, Math.PI * 2); ctx.fill();
    if (frame % 2 === 0) for (let i = 0; i < 5; i++) spawnFire();
    particles.forEach(p => {
      p.x += p.vx + Math.sin(frame * 0.04 + p.seed) * 0.6; p.y += p.vy; p.life -= p.decay; p.r *= 0.994;
      const a = Math.max(0, p.life * 0.9); ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `hsl(${p.hue+20},100%,85%)`); g.addColorStop(0.4, `hsl(${p.hue},100%,55%)`); g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1; particles = particles.filter(p => p.life > 0 && p.y > -30);
  });
}
function spawnFire() {
  particles.push({ x: cx()+rand(-30,30), y: canvas.height-rand(0,20), vx: rand(-0.8,0.8), vy: rand(-4.5,-1.8), r: rand(8,22), life:1, decay: rand(0.009,0.022), hue: rand(0,45), seed: rand(0,Math.PI*2) });
}

function renderGlaciesOrbis() {
  const spikes = Array.from({length:28},(_,i)=>({ angle:(i/28)*Math.PI*2, r:rand(50,120), len:rand(18,50), w:rand(1,3), drift:rand(-0.004,0.004), a:rand(0.3,0.9) }));
  loop(() => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const pulse=0.5+0.5*Math.sin(frame*0.06), orbR=55+pulse*8;
    const og=ctx.createRadialGradient(cx()-10,cy()-10,0,cx(),cy(),orbR);
    og.addColorStop(0,"rgba(225,245,255,0.98)"); og.addColorStop(0.4,"rgba(120,190,255,0.75)"); og.addColorStop(0.8,"rgba(40,110,200,0.4)"); og.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=og; ctx.beginPath(); ctx.arc(cx(),cy(),orbR,0,Math.PI*2); ctx.fill();
    const fg=ctx.createRadialGradient(cx(),cy(),orbR*0.8,cx(),cy(),orbR*2.2);
    fg.addColorStop(0,"rgba(100,180,255,0.15)"); fg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(cx(),cy(),orbR*2.2,0,Math.PI*2); ctx.fill();
    spikes.forEach(s=>{
      s.angle+=s.drift;
      const ax=cx()+Math.cos(s.angle)*(s.r-s.len*0.5), ay=cy()+Math.sin(s.angle)*(s.r-s.len*0.5);
      const bx=cx()+Math.cos(s.angle)*(s.r+s.len*0.5), by=cy()+Math.sin(s.angle)*(s.r+s.len*0.5);
      ctx.globalAlpha=s.a*(0.5+0.5*Math.sin(frame*0.05+s.angle*3));
      ctx.strokeStyle="rgba(200,230,255,0.95)"; ctx.lineWidth=s.w; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
    });
    for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2+frame*0.025,r=22+Math.sin(frame*0.09+i)*10;ctx.globalAlpha=0.8;ctx.fillStyle="rgba(255,255,255,0.95)";ctx.beginPath();ctx.arc(cx()+Math.cos(a)*r,cy()+Math.sin(a)*r,2,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
  });
}

function renderFulmenArcanum() {
  loop(() => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const pulse=0.5+0.5*Math.sin(frame*0.18);
    const cg=ctx.createRadialGradient(cx(),cy(),0,cx(),cy(),55+pulse*20);
    cg.addColorStop(0,"rgba(255,240,100,0.65)"); cg.addColorStop(0.4,"rgba(255,180,0,0.25)"); cg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx(),cy(),70+pulse*20,0,Math.PI*2); ctx.fill();
    if(frame%3===0){const count=randi(3,7);for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),d=rand(70,140);drawBolt(cx(),cy(),cx()+Math.cos(a)*d,cy()+Math.sin(a)*d,4,rand(0.55,1.0));}}
    ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.shadowColor="transparent";
  });
}
function drawBolt(x1,y1,x2,y2,depth,alpha){
  if(depth<=0||alpha<0.06)return;
  const mx=(x1+x2)/2+rand(-28,28), my=(y1+y2)/2+rand(-28,28);
  ctx.globalAlpha=alpha*0.5; ctx.strokeStyle="rgba(255,200,50,1)"; ctx.lineWidth=depth*1.5; ctx.lineCap="round"; ctx.shadowBlur=14; ctx.shadowColor="#ffd700";
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(mx,my); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.globalAlpha=alpha*0.7; ctx.strokeStyle="rgba(255,255,255,0.95)"; ctx.lineWidth=depth*0.4; ctx.shadowBlur=0;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(mx,my); ctx.lineTo(x2,y2); ctx.stroke();
  if(Math.random()<0.45)drawBolt(mx,my,mx+rand(-40,40),my+rand(-40,40),depth-1,alpha*0.5);
  drawBolt(x1,y1,mx,my,depth-1,alpha*0.8); drawBolt(mx,my,x2,y2,depth-1,alpha*0.8);
}

function renderUmbraVelo() {
  const tendrils=Array.from({length:18},(_,i)=>({angle:(i/18)*Math.PI*2+rand(-0.15,0.15),startR:rand(canvas.width*0.38,canvas.width*0.52),endR:rand(18,45),prog:rand(0,0.3),speed:rand(0.005,0.012),w:rand(2,7),wobble:rand(0.02,0.07),wAmt:rand(0.1,0.5)}));
  loop(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const dg=ctx.createRadialGradient(cx(),cy(),0,cx(),cy(),75);
    dg.addColorStop(0,"rgba(0,0,0,0.96)"); dg.addColorStop(0.55,"rgba(15,10,30,0.7)"); dg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=dg; ctx.beginPath(); ctx.arc(cx(),cy(),75,0,Math.PI*2); ctx.fill();
    tendrils.forEach(t=>{
      t.prog=Math.min(1,t.prog+t.speed);
      const r=lerp(t.startR,t.endR,t.prog), wa=t.angle+Math.sin(frame*t.wobble)*t.wAmt;
      const tx=cx()+Math.cos(wa)*r, ty=cy()+Math.sin(wa)*r;
      const alpha=t.prog<0.5?t.prog*2:(1-t.prog)*2;
      ctx.globalAlpha=alpha*0.75; ctx.strokeStyle=`rgba(90,60,130,${alpha})`; ctx.lineWidth=t.w*(1-t.prog*0.5); ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(cx(),cy()); ctx.quadraticCurveTo(cx()+Math.cos(wa+0.35)*r*0.55,cy()+Math.sin(wa+0.35)*r*0.55,tx,ty); ctx.stroke();
      if(t.prog>=1){t.prog=0;t.startR=rand(canvas.width*0.34,canvas.width*0.50);t.angle+=rand(-0.25,0.25);}
    });
    ctx.globalAlpha=1;
  });
}

function renderVitaeNexus() {
  loop(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const pulse=0.5+0.5*Math.sin(frame*0.08);
    const cg=ctx.createRadialGradient(cx(),cy(),0,cx(),cy(),38+pulse*12);
    cg.addColorStop(0,"rgba(255,255,255,0.98)"); cg.addColorStop(0.3,"rgba(0,240,160,0.8)"); cg.addColorStop(1,"rgba(0,180,100,0)");
    ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx(),cy(),45+pulse*12,0,Math.PI*2); ctx.fill();
    for(let strand=0;strand<3;strand++){
      const offset=(strand/3)*Math.PI*2; ctx.beginPath(); ctx.strokeStyle="rgba(0,230,140,0.55)"; ctx.lineWidth=1.8; let moved=false;
      for(let t=0;t<=Math.PI*9;t+=0.06){const r=(t/(Math.PI*9))*125,a=t+offset+frame*0.038,px=cx()+Math.cos(a)*r,py=cy()+Math.sin(a)*r;if(!moved){ctx.moveTo(px,py);moved=true;}else ctx.lineTo(px,py);}
      ctx.stroke();
    }
    for(let i=0;i<9;i++){
      const a=(i/9)*Math.PI*2+frame*0.028,r=68+Math.sin(frame*0.07+i*1.4)*22;
      const sg=ctx.createRadialGradient(cx()+Math.cos(a)*r,cy()+Math.sin(a)*r,0,cx()+Math.cos(a)*r,cy()+Math.sin(a)*r,9);
      sg.addColorStop(0,"rgba(255,255,255,1)"); sg.addColorStop(1,"rgba(0,220,140,0)");
      ctx.globalAlpha=0.45+0.55*Math.sin(frame*0.12+i); ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(cx()+Math.cos(a)*r,cy()+Math.sin(a)*r,9,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  });
}

function renderAetherisVox() {
  const rings=[]; const spawnRing=()=>rings.push({r:0,life:1,speed:rand(2,3.8),w:rand(1,3)});
  for(let i=0;i<3;i++)setTimeout(spawnRing,i*320);
  loop(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const pulse=0.5+0.5*Math.sin(frame*0.09);
    const vg=ctx.createRadialGradient(cx(),cy(),0,cx(),cy(),42+pulse*14);
    vg.addColorStop(0,"rgba(180,80,255,0.92)"); vg.addColorStop(0.5,"rgba(90,0,160,0.5)"); vg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=vg; ctx.beginPath(); ctx.arc(cx(),cy(),50+pulse*14,0,Math.PI*2); ctx.fill();
    if(frame%38===0)spawnRing();
    for(let i=rings.length-1;i>=0;i--){const ring=rings[i];ring.r+=ring.speed;ring.life-=0.007;if(ring.life<=0){rings.splice(i,1);continue;}ctx.globalAlpha=ring.life*0.65;ctx.strokeStyle=`rgba(190,90,255,${ring.life})`;ctx.lineWidth=ring.w;ctx.beginPath();ctx.arc(cx(),cy(),ring.r,0,Math.PI*2);ctx.stroke();}
    for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2+frame*0.032,r=58+Math.sin(frame*0.06+i)*16;ctx.globalAlpha=0.5+0.5*Math.sin(frame*0.11+i);ctx.fillStyle="#c39bd3";ctx.beginPath();ctx.arc(cx()+Math.cos(a)*r,cy()+Math.sin(a)*r,2.5,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
  });
}

function renderTempusFractum() {
  const spawnShards=()=>{for(let i=0;i<22;i++){const angle=rand(0,Math.PI*2),speed=rand(2.5,6.5);particles.push({x:cx(),y:cy(),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:1,decay:rand(0.008,0.018),r:rand(10,30),rot:rand(0,Math.PI*2),rotV:rand(-0.07,0.07),sides:randi(3,7)});}};
  spawnShards();
  loop(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const pulse=0.5+0.5*Math.sin(frame*0.14);
    const fg=ctx.createRadialGradient(cx(),cy(),0,cx(),cy(),58+pulse*20);
    fg.addColorStop(0,"rgba(0,215,255,0.6)"); fg.addColorStop(0.5,"rgba(0,100,180,0.25)"); fg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(cx(),cy(),65+pulse*20,0,Math.PI*2); ctx.fill();
    if(frame%55===0||frame%85===0)spawnShards();
    particles.forEach(s=>{
      s.x+=s.vx; s.y+=s.vy; s.vx*=0.972; s.vy*=0.972; s.rot+=s.rotV; s.life-=s.decay;
      const a=Math.max(0,s.life); ctx.globalAlpha=a*0.88; ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.rot);
      const sg=ctx.createLinearGradient(-s.r,-s.r,s.r,s.r);
      sg.addColorStop(0,`rgba(180,240,255,${a})`); sg.addColorStop(1,`rgba(0,200,255,${a*0.5})`);
      ctx.fillStyle=sg; ctx.strokeStyle=`rgba(255,255,255,${a*0.85})`; ctx.lineWidth=0.8;
      ctx.beginPath();
      for(let i=0;i<s.sides;i++){const ang=(i/s.sides)*Math.PI*2,rr=s.r*(0.65+0.35*Math.sin(ang*2));i===0?ctx.moveTo(Math.cos(ang)*rr,Math.sin(ang)*rr):ctx.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr);}
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    });
    ctx.globalAlpha=1; particles=particles.filter(p=>p.life>0);
  });
}
