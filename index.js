/* ============================================================
   INDEX JS — Tier tabs + carousel
============================================================ */

// ===========================
// PROJECT TIER TABS
// ===========================
const tierTabs    = document.querySelectorAll('.tier-tab');
const tierContent = document.querySelectorAll('.tier-content');

tierTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = 'tier-' + tab.getAttribute('data-tier');
    const target   = document.getElementById(targetId);
    if (!target) return;

    tierTabs.forEach(t => t.classList.remove('active'));
    tierContent.forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    target.classList.add('active');

    // Re-trigger reveal animations in newly visible content
    target.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  });
});

// ===========================
// CAROUSEL BUTTONS
// ===========================
document.querySelectorAll('.tier-content').forEach(tier => {
  const track = tier.querySelector('.carousel-track');
  const leftBtn  = tier.querySelector('.carousel-btn.left');
  const rightBtn = tier.querySelector('.carousel-btn.right');

  if (!track) return;

  const scrollAmt = 300;

  if (leftBtn) {
    leftBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
    });
  }

  if (rightBtn) {
    rightBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    });
  }
});
