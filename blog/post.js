/* ============================================================
   POST.JS — Loads post metadata + content from posts.json
============================================================ */

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

// Reading progress bar
const progressBar = document.getElementById('readProgress');
window.addEventListener('scroll', () => {
  const d = document.documentElement;
  const pct = (window.scrollY / (d.scrollHeight - d.clientHeight)) * 100;
  if (progressBar) progressBar.style.width = Math.min(pct, 100) + '%';
});

// Get post ID from URL
function getPostId() {
  return new URLSearchParams(window.location.search).get('id');
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}

// Render the post header from metadata
function renderHeader(post) {
  const color = CAT_COLORS[post.category] || '#00ffc8';
  const el = document.getElementById('postHeader');
  if (!el) return;

  document.title = `${post.title} — The Grimoire`;

  el.innerHTML = `
    <div class="post-header-inner">
      <a href="blog.html" class="ph-back">← The Grimoire</a>
      <div class="ph-meta">
        <span class="ph-cat" style="color:${color};border-color:${color}44;background:${color}12">
          ${CAT_LABELS[post.category] || post.category}
        </span>
        <span class="ph-dot">·</span>
        <span class="ph-date">${formatDate(post.date)}</span>
        <span class="ph-dot">·</span>
        <span class="ph-read">~${post.readTime} min read</span>
        <span class="ph-dot">·</span>
        <span class="ph-read">${post.wordCount.toLocaleString()} words</span>
      </div>
      <h1 class="ph-title">${post.title}</h1>
      ${post.subtitle ? `<p class="ph-subtitle">${post.subtitle}</p>` : ''}
      <div class="ph-tags">
        ${post.tags.map(t => `<span class="ph-tag">#${t}</span>`).join('')}
      </div>
    </div>
  `;
}

// Render prev/next navigation
function renderPostNav(posts, currentId) {
  const idx  = posts.findIndex(p => p.id === currentId);
  const prev = posts[idx - 1];
  const next = posts[idx + 1];
  const el   = document.getElementById('postNav');
  if (!el) return;

  el.innerHTML = `
    ${prev ? `<a href="post.html?id=${prev.id}" class="post-nav-link prev">
      <span class="pnl-dir">← Previous</span>
      <span class="pnl-title">${prev.title}</span>
    </a>` : '<div></div>'}
    ${next ? `<a href="post.html?id=${next.id}" class="post-nav-link next">
      <span class="pnl-dir">Next →</span>
      <span class="pnl-title">${next.title}</span>
    </a>` : '<div></div>'}
  `;
}

// Load post content from its HTML file
async function loadPostContent(post) {
  const el = document.getElementById('postContent');
  if (!el) return;

  try {
    const res  = await fetch(post.file);
    if (!res.ok) throw new Error('File not found');
    const html = await res.text();
    el.innerHTML = html;
  } catch {
    el.innerHTML = `
      <p style="font-family:var(--font-ui);color:var(--muted);font-size:.8rem;letter-spacing:.1em;text-align:center;padding:3rem 0">
        // Post content file not found at <code>${post.file}</code><br><br>
        Create the file and add your content — the system is ready.
      </p>
    `;
  }
}

// Main init
async function init() {
  const id = getPostId();
  if (!id) {
    window.location.href = 'blog.html';
    return;
  }

  try {
    const res   = await fetch('posts.json');
    const posts = await res.json();
    const post  = posts.find(p => p.id === id);

    if (!post) {
      window.location.href = 'blog.html';
      return;
    }

    renderHeader(post);
    renderPostNav(posts, id);
    await loadPostContent(post);

  } catch (err) {
    console.error('Failed to load post:', err);
  }
}

init();
