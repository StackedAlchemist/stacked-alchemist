/* ============================================================
   SHARED JS — Stacked Alchemist Portfolio
   Handles: cursor, nav toggle, scroll reveal, footer year
============================================================ */

// ===========================
// FOOTER YEAR
// ===========================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===========================
// CUSTOM CURSOR
// ===========================
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mouseX = -100, mouseY = -100;
let ringX  = -100, ringY  = -100;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left  = mouseX + 'px';
  dot.style.top   = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  if (ring) {
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
  }
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover effect on links
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (dot) {
      dot.style.width  = '14px';
      dot.style.height = '14px';
      dot.style.background = 'var(--magenta)';
    }
    if (ring) {
      ring.style.width  = '44px';
      ring.style.height = '44px';
      ring.style.borderColor = 'var(--magenta)';
    }
  });
  el.addEventListener('mouseleave', () => {
    if (dot) {
      dot.style.width  = '8px';
      dot.style.height = '8px';
      dot.style.background = 'var(--teal)';
    }
    if (ring) {
      ring.style.width  = '28px';
      ring.style.height = '28px';
      ring.style.borderColor = 'var(--teal-dim)';
    }
  });
});

// Hide on leave
document.addEventListener('mouseleave', () => {
  if (dot)  dot.style.opacity  = '0';
  if (ring) ring.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  if (dot)  dot.style.opacity  = '1';
  if (ring) ring.style.opacity = '1';
});

// ===========================
// MOBILE NAV TOGGLE
// ===========================
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

// ===========================
// SCROLL REVEAL
// ===========================
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));
