/* ============================================================
   ARCANE CLOCK — Upgraded JS
   Military time · World clocks · Alarm · Countdown timer · Themes
============================================================ */

/* ── State ── */
let isMilitary  = localStorage.getItem("clock_military") === "true";
let currentTheme= localStorage.getItem("clock_theme") || "teal";
let alarmTime   = localStorage.getItem("clock_alarm") || "";
let alarmFired  = false;

let timerTotal    = 0;
let timerRemaining= 0;
let timerInterval = null;
let timerRunning  = false;

/* ── World Clock Zones ── */
const WORLD_ZONES = [
  { city: "New York",   tz: "America/New_York",    flag: "🇺🇸" },
  { city: "London",     tz: "Europe/London",        flag: "🇬🇧" },
  { city: "Paris",      tz: "Europe/Paris",         flag: "🇫🇷" },
  { city: "Dubai",      tz: "Asia/Dubai",           flag: "🇦🇪" },
  { city: "Tokyo",      tz: "Asia/Tokyo",           flag: "🇯🇵" },
  { city: "Sydney",     tz: "Australia/Sydney",     flag: "🇦🇺" },
  { city: "Los Angeles",tz: "America/Los_Angeles",  flag: "🇺🇸" },
  { city: "São Paulo",  tz: "America/Sao_Paulo",    flag: "🇧🇷" },
];

/* ── DOM ── */
const hoursEl    = document.getElementById("hours");
const minutesEl  = document.getElementById("minutes");
const secondsEl  = document.getElementById("seconds");
const ampmEl     = document.getElementById("ampm");
const dateEl     = document.getElementById("dateDisplay");
const eyebrowEl  = document.getElementById("clockEyebrow");
const modeLabelEl= document.getElementById("modeLabel");
const worldGrid  = document.getElementById("worldGrid");
const alarmStatus= document.getElementById("alarmStatus");
const timerDisplay=document.getElementById("timerDisplay");
const timerBar   = document.getElementById("timerBar");

/* ── Cursor ── */
const dot = document.getElementById("cursorDot");
const ring= document.getElementById("cursorRing");
let mx=0,my=0,rx=0,ry=0;
document.addEventListener("mousemove", e=>{ mx=e.clientX; my=e.clientY; });
(function ac(){
  rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
  if(dot){ dot.style.left=mx+"px"; dot.style.top=my+"px"; }
  if(ring){ ring.style.left=rx+"px"; ring.style.top=ry+"px"; }
  requestAnimationFrame(ac);
})();

/* ── Init ── */
document.addEventListener("DOMContentLoaded", ()=>{
  applyTheme(currentTheme);
  buildWorldGrid();
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(updateWorldClocks, 1000);
  updateModeLabel();
  if (alarmTime) {
    alarmStatus.textContent = `⏰ Alarm set for ${formatAlarmDisplay(alarmTime)}`;
    document.getElementById("alarmTime").value = alarmTime;
  }
  bindEvents();
});

/* ── Main Clock ── */
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  // Date
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  if (isMilitary) {
    hoursEl.textContent  = pad(h);
    ampmEl.classList.add("hidden");
  } else {
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    hoursEl.textContent  = pad(h);
    ampmEl.textContent   = ampm;
    ampmEl.classList.remove("hidden");
  }

  minutesEl.textContent = pad(m);
  secondsEl.textContent = pad(s);

  // Check alarm
  if (alarmTime && !alarmFired) {
    const [ah, am] = alarmTime.split(":").map(Number);
    if (now.getHours() === ah && now.getMinutes() === am && now.getSeconds() === 0) {
      triggerAlarm();
    }
  }
}

/* ── World Clocks ── */
function buildWorldGrid() {
  worldGrid.innerHTML = WORLD_ZONES.map((z,i) => `
    <div class="world-card" id="wc-${i}">
      <div class="wc-city">${z.flag} ${z.city}</div>
      <div class="wc-time" id="wct-${i}">--:--</div>
      <div class="wc-date" id="wcd-${i}"></div>
    </div>`).join("");
  updateWorldClocks();
}

function updateWorldClocks() {
  const now = new Date();
  WORLD_ZONES.forEach((z,i)=>{
    const opts12 = { timeZone: z.tz, hour:"2-digit", minute:"2-digit", hour12: !isMilitary };
    const optsDate = { timeZone: z.tz, weekday:"short", month:"short", day:"numeric" };
    try {
      document.getElementById(`wct-${i}`).textContent = now.toLocaleTimeString("en-US", opts12);
      document.getElementById(`wcd-${i}`).textContent = now.toLocaleDateString("en-US", optsDate);
    } catch {}
  });
}

/* ── Events ── */
function bindEvents() {

  // Theme buttons
  document.querySelectorAll(".theme-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(".theme-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      applyTheme(btn.dataset.theme);
    });
  });

  // Military toggle
  document.getElementById("militaryToggle").addEventListener("click",()=>{
    isMilitary = !isMilitary;
    localStorage.setItem("clock_military", isMilitary);
    updateModeLabel();
    updateClock();
    updateWorldClocks();
    document.getElementById("militaryToggle").classList.toggle("active", isMilitary);
  });

  // Alarm panel toggle
  document.getElementById("alarmBtn").addEventListener("click",()=>{
    togglePanel("alarmPanel", "alarmBtn");
  });

  // Timer panel toggle
  document.getElementById("timerBtn").addEventListener("click",()=>{
    togglePanel("timerPanel", "timerBtn");
  });

  // Set alarm
  document.getElementById("setAlarm").addEventListener("click",()=>{
    const val = document.getElementById("alarmTime").value;
    if (!val) return;
    alarmTime = val;
    alarmFired = false;
    localStorage.setItem("clock_alarm", alarmTime);
    alarmStatus.textContent = `⏰ Alarm set for ${formatAlarmDisplay(alarmTime)}`;
  });

  // Clear alarm
  document.getElementById("clearAlarm").addEventListener("click",()=>{
    alarmTime = "";
    alarmFired = false;
    localStorage.removeItem("clock_alarm");
    document.getElementById("alarmTime").value = "";
    alarmStatus.textContent = "Alarm cleared.";
    setTimeout(()=>{ alarmStatus.textContent=""; }, 2000);
  });

  // Timer start
  document.getElementById("startTimer").addEventListener("click",()=>{
    if (timerRunning) {
      // Pause
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById("startTimer").textContent = "Resume";
      return;
    }
    if (timerRemaining === 0) {
      // Fresh start
      const h = parseInt(document.getElementById("timerHours").value)   || 0;
      const m = parseInt(document.getElementById("timerMinutes").value) || 0;
      const s = parseInt(document.getElementById("timerSeconds").value) || 0;
      timerTotal = h*3600 + m*60 + s;
      if (timerTotal <= 0) return;
      timerRemaining = timerTotal;
    }
    timerRunning = true;
    document.getElementById("startTimer").textContent = "Pause";
    timerInterval = setInterval(tickTimer, 1000);
  });

  // Timer reset
  document.getElementById("resetTimer").addEventListener("click",()=>{
    clearInterval(timerInterval);
    timerRunning = false;
    timerRemaining = 0;
    timerTotal = 0;
    document.getElementById("startTimer").textContent = "Start";
    timerDisplay.textContent = "00:00:00";
    timerDisplay.classList.remove("urgent");
    timerBar.style.width = "100%";
  });
}

/* ── Timer Tick ── */
function tickTimer() {
  if (timerRemaining <= 0) {
    clearInterval(timerInterval);
    timerRunning = false;
    timerDisplay.textContent = "DONE!";
    timerDisplay.classList.add("urgent");
    timerBar.style.width = "0%";
    document.getElementById("startTimer").textContent = "Start";
    timerRemaining = 0;
    playBeep();
    return;
  }
  timerRemaining--;
  const h = Math.floor(timerRemaining/3600);
  const m = Math.floor((timerRemaining%3600)/60);
  const s = timerRemaining % 60;
  timerDisplay.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  timerDisplay.classList.toggle("urgent", timerRemaining <= 10);
  timerBar.style.width = timerTotal > 0 ? (timerRemaining/timerTotal*100)+"%" : "0%";
}

/* ── Alarm Trigger ── */
function triggerAlarm() {
  alarmFired = true;
  playBeep(true);
  const overlay = document.createElement("div");
  overlay.className = "alarm-ring-overlay";
  overlay.innerHTML = `
    <div class="ring-text">⏰ ALARM!</div>
    <div class="ring-text" style="font-size:1.5rem">${formatAlarmDisplay(alarmTime)}</div>
    <button class="ring-dismiss">Dismiss</button>`;
  document.body.appendChild(overlay);
  overlay.querySelector(".ring-dismiss").addEventListener("click",()=>{
    overlay.remove();
  });
}

/* ── Audio ── */
function playBeep(loop=false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let count = 0;
    const maxBeeps = loop ? 6 : 3;
    function beep() {
      if (count >= maxBeeps) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
      count++;
      setTimeout(beep, 600);
    }
    beep();
  } catch {}
}

/* ── Theme ── */
function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem("clock_theme", theme);
  document.body.setAttribute("data-theme", theme === "teal" ? "" : theme);
  document.querySelectorAll(".theme-btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.theme === theme);
  });
}

/* ── Panel toggle ── */
function togglePanel(panelId, btnId) {
  const panel = document.getElementById(panelId);
  const btn   = document.getElementById(btnId);
  const isHidden = panel.classList.contains("hidden");
  // Close all panels first
  document.querySelectorAll(".panel-section").forEach(p=>p.classList.add("hidden"));
  document.querySelectorAll(".ctrl-btn").forEach(b=>b.classList.remove("active"));
  if (isHidden) {
    panel.classList.remove("hidden");
    btn.classList.add("active");
  }
}

/* ── Helpers ── */
function pad(n) { return String(n).padStart(2,"0"); }
function updateModeLabel() {
  modeLabelEl.textContent = isMilitary ? "24H" : "12H";
  eyebrowEl.textContent   = isMilitary ? "LOCAL TIME — 24H" : "LOCAL TIME";
  document.getElementById("militaryToggle").classList.toggle("active", isMilitary);
}
function formatAlarmDisplay(t) {
  if (!t) return "";
  const [h,m] = t.split(":").map(Number);
  if (isMilitary) return `${pad(h)}:${pad(m)}`;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h%12||12}:${pad(m)} ${ampm}`;
}
