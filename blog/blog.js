/* ============================================================
   THE GRIMOIRE — Blog Engine
   Loads posts.json, renders cards, handles filter/search
============================================================ */

// ===========================
// CURSOR
// ===========================
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = -100, my = -100, rx = -100, ry = -100;

window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (dot) { dot.style.left = mx+'px'; dot.style.top = my+'px'; }
});

(function animRing() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  if (ring) { ring.style.left = rx+'px'; ring.style.top = ry+'px'; }
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a,button,input').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (dot)  { dot.style.width='14px';  dot.style.height='14px';  dot.style.background='#7b6ff5'; }
    if (ring) { ring.style.width='40px'; ring.style.height='40px'; ring.style.borderColor='rgba(123,111,245,0.4)'; }
  });
  el.addEventListener('mouseleave', () => {
    if (dot)  { dot.style.width='8px';   dot.style.height='8px';   dot.style.background='var(--teal)'; }
    if (ring) { ring.style.width='28px'; ring.style.height='28px'; ring.style.borderColor='rgba(0,255,200,0.3)'; }
  });
});

// ===========================
// YEAR
// ===========================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===========================
// NAV TOGGLE
// ===========================
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

// ===========================
// SCROLL REVEAL
// ===========================
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function observeReveals() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

// ===========================
// EMBER PARTICLES
// ===========================
const canvas = document.getElementById('emberCanvas');
const ctx    = canvas ? canvas.getContext('2d') : null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const embers = [];
for (let i = 0; i < 40; i++) {
  embers.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.8 + 0.4,
    sx: (Math.random() - 0.5) * 0.5,
    sy: -(Math.random() * 0.8 + 0.3),
    life: Math.random(),
    decay: Math.random() * 0.003 + 0.001,
    hue: Math.random() > 0.5 ? 170 : 270
  });
}

(function animEmbers() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  embers.forEach((e, i) => {
    e.x += e.sx + Math.sin(Date.now()*0.0008+i)*0.25;
    e.y += e.sy;
    e.life -= e.decay;
    if (e.life <= 0 || e.y < -10) {
      embers[i] = { x: Math.random()*window.innerWidth, y: window.innerHeight+5,
        size: Math.random()*1.8+0.4, sx:(Math.random()-.5)*.5, sy:-(Math.random()*.8+.3),
        life:1, decay: Math.random()*.003+.001, hue: Math.random()>.5?170:270 };
      return;
    }
    ctx.save();
    ctx.globalAlpha = e.life * 0.6;
    ctx.shadowColor = `hsl(${e.hue},100%,65%)`;
    ctx.shadowBlur  = 5;
    ctx.fillStyle   = `hsl(${e.hue},80%,65%)`;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  });
  requestAnimationFrame(animEmbers);
})();

// ===========================
// CATEGORY HELPERS
// ===========================
const CAT_LABELS = {
  fiction:    'Fiction',
  poetry:     'Poetry',
  devjournal: 'Dev Journal',
  reflection: 'Reflection',
  gaming:     'Gaming'
};

const CAT_COLORS = {
  fiction:    '#c8852a',
  poetry:     '#7b6ff5',
  devjournal: '#00ffc8',
  reflection: '#00d4aa',
  gaming:     '#ff4da6'
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===========================
// RENDER FEATURED POST
// ===========================
function renderFeatured(post) {
  const wrap = document.getElementById('featuredPost');
  if (!wrap || !post) return;

  const color = CAT_COLORS[post.category] || '#00ffc8';
  const colorDim = color + '22';

  wrap.innerHTML = `
    <a href="post.html?id=${post.id}" class="featured-card reveal" style="text-decoration:none;color:inherit">
      <div class="fc-cover">
        <div class="fc-cover-bg" style="background:linear-gradient(160deg,${colorDim},rgba(8,6,26,0.95))"></div>
        <div class="fc-cover-ring" style="width:200px;height:200px;border-color:${color}18;animation:ring-spin 30s linear infinite"></div>
        <div class="fc-cover-ring" style="width:140px;height:140px;border-color:${color}25;border-style:dashed;animation:ring-spin 20s linear infinite reverse"></div>
        <span class="fc-cover-icon" style="filter:drop-shadow(0 0 25px ${color})">${post.coverIcon}</span>
      </div>
      <div class="fc-body">
        <div class="fc-meta">
          <span class="fc-cat" style="color:${color};border-color:${color}44;background:${color}10">
            ${CAT_LABELS[post.category] || post.category}
          </span>
          <span class="fc-date">${formatDate(post.date)}</span>
          <span class="fc-read-time">~${post.readTime} min read</span>
        </div>
        <h2 class="fc-title">${post.title}</h2>
        ${post.subtitle ? `<p class="fc-subtitle">${post.subtitle}</p>` : ''}
        <p class="fc-excerpt">${post.excerpt}</p>
        <div class="fc-tags">
          ${post.tags.map(t => `<span class="fc-tag">#${t}</span>`).join('')}
        </div>
        <span class="fc-read-btn" style="border-color:${color};color:${color}">
          📖 Read Now
        </span>
      </div>
    </a>
  `;

  // Add ring-spin keyframe if not present
  if (!document.getElementById('ringSpinKF')) {
    const s = document.createElement('style');
    s.id = 'ringSpinKF';
    s.textContent = `@keyframes ring-spin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}`;
    document.head.appendChild(s);
  }

  observeReveals();
}

// ===========================
// RENDER POST CARDS
// ===========================
function renderCards(posts) {
  const grid = document.getElementById('postsGrid');
  const empty = document.getElementById('emptyState');
  const countEl = document.getElementById('postCount');
  if (!grid) return;

  // Update count
  if (countEl) {
    countEl.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''}`;
  }

  if (posts.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  grid.innerHTML = posts.map((post, i) => {
    const color = CAT_COLORS[post.category] || '#00ffc8';
    const delay  = (i % 3) * 0.1;
    return `
      <a href="post.html?id=${post.id}" class="post-card reveal" data-cat="${post.category}"
         style="text-decoration:none;transition-delay:${delay}s" data-id="${post.id}">
        <div class="pc-cover">
          <span class="pc-icon" style="filter:drop-shadow(0 0 16px ${color}88)">${post.coverIcon}</span>
        </div>
        <div class="pc-body">
          <div class="pc-meta">
            <span class="pc-cat">${CAT_LABELS[post.category] || post.category}</span>
            <span class="pc-date">${formatDate(post.date)}</span>
          </div>
          <h3 class="pc-title">${post.title}</h3>
          <p class="pc-excerpt">${post.excerpt}</p>
          <div class="pc-footer">
            <span class="pc-read-time">~${post.readTime} min · ${post.wordCount.toLocaleString()} words</span>
            <span class="pc-arrow" style="color:${color}">→</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  observeReveals();
}

// ===========================
// FILTER + SEARCH ENGINE
// ===========================
let allPosts    = [];
let activeFilter = 'all';
let searchQuery  = '';

function applyFilters() {
  let filtered = [...allPosts];

  // Category filter
  if (activeFilter !== 'all') {
    filtered = filtered.filter(p => p.category === activeFilter);
  }

  // Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(q))
    );
  }

  renderCards(filtered);
}

// Filter tabs
document.querySelectorAll('.ftab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.getAttribute('data-cat');
    applyFilters();
  });
});

// Search input
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value;
    applyFilters();
  });
}

// Nav category links
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', e => {
    const url = new URL(a.href, window.location.href);
    const cat = url.searchParams.get('cat');
    if (cat) {
      e.preventDefault();
      activeFilter = cat;
      document.querySelectorAll('.ftab').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-cat') === cat);
      });
      applyFilters();
      document.getElementById('postsSection')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===========================
// LOAD POSTS FROM JSON
// ===========================
async function loadPosts() {
  try {
    const res   = await fetch('posts.json');
    const posts = await res.json();
    allPosts = posts;

    // Featured = first post marked featured, or just first post
    const featured = posts.find(p => p.featured) || posts[0];
    renderFeatured(featured);

    // All posts in grid (exclude featured from main grid so it's not duplicated)
    renderCards(posts);

    // Check URL for category pre-filter
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    if (catParam) {
      activeFilter = catParam;
      document.querySelectorAll('.ftab').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-cat') === catParam);
      });
      applyFilters();
    }

  } catch (err) {
    console.error('Could not load posts.json:', err);
    // Show fallback
    const grid = document.getElementById('postsGrid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:var(--font-ui);color:var(--muted);font-size:.8rem;letter-spacing:.1em">
          // posts.json not found — add your posts.json file to this directory
        </div>`;
    }
  }
}

loadPosts();
