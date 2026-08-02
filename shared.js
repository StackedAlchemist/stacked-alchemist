/* ============================================================
 STACKED ALCHEMIST - SHARED INTERACTIONS
 Starfield · Cursor · Nav · Reveal · Glass tilt · Particles
============================================================ */

(function () {
 'use strict';

 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

 // ===========================
 // FOOTER YEAR
 // ===========================
 document.querySelectorAll('[data-year]').forEach((el) => {
 el.textContent = new Date().getFullYear();
 });

 // ===========================
 // CUSTOM CURSOR
 // ===========================
 const dot = document.getElementById('cursorDot');
 const ring = document.getElementById('cursorRing');

 if (dot && ring && !isTouch) {
 document.body.classList.add('has-custom-cursor');
 let mx = -100, my = -100, rx = -100, ry = -100;

 window.addEventListener('mousemove', (e) => {
 mx = e.clientX;
 my = e.clientY;
 dot.style.left = mx + 'px';
 dot.style.top = my + 'px';
 }, { passive: true });

 function animateRing() {
 rx += (mx - rx) * 0.16;
 ry += (my - ry) * 0.16;
 ring.style.left = rx + 'px';
 ring.style.top = ry + 'px';
 requestAnimationFrame(animateRing);
 }
 animateRing();

 const hoverSelector = 'a, button, .glass-card, .chip, .nav-toggle, input, textarea, select, [data-cursor="hover"]';
 document.querySelectorAll(hoverSelector).forEach((el) => {
 el.addEventListener('mouseenter', () => {
 dot.classList.add('is-hover');
 ring.classList.add('is-hover');
 });
 el.addEventListener('mouseleave', () => {
 dot.classList.remove('is-hover');
 ring.classList.remove('is-hover');
 });
 });

 document.addEventListener('mouseleave', () => {
 dot.style.opacity = '0';
 ring.style.opacity = '0';
 });
 document.addEventListener('mouseenter', () => {
 dot.style.opacity = '1';
 ring.style.opacity = '1';
 });
 }

 // ===========================
 // MOBILE NAV
 // ===========================
 const navToggle = document.getElementById('navToggle');
 const mobileNav = document.getElementById('mobileNav');

 if (navToggle && mobileNav) {
 navToggle.addEventListener('click', () => {
 const open = mobileNav.classList.toggle('open');
 navToggle.classList.toggle('open', open);
 navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
 });

 mobileNav.querySelectorAll('a').forEach((link) => {
 link.addEventListener('click', () => {
 mobileNav.classList.remove('open');
 navToggle.classList.remove('open');
 navToggle.setAttribute('aria-expanded', 'false');
 });
 });
 }

 // ===========================
 // SCROLL REVEAL
 // ===========================
 const revealEls = document.querySelectorAll('.reveal');
 if (revealEls.length && !reducedMotion) {
 const observer = new IntersectionObserver(
 (entries) => {
 entries.forEach((entry) => {
 if (entry.isIntersecting) {
 entry.target.classList.add('visible');
 observer.unobserve(entry.target);
 }
 });
 },
 { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
 );
 revealEls.forEach((el) => observer.observe(el));
 } else {
 revealEls.forEach((el) => el.classList.add('visible'));
 }

  // ===========================
  // STARFIELD CANVAS
  // Constellation links + shooting stars
  // ===========================
  const canvas = document.getElementById('starfield');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let meteors = [];
    let w = 0, h = 0, dpr = 1;
    let animId = null;
    let mouseX = 0.5, mouseY = 0.5;
    let linkDist = 130;
    let frame = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      linkDist = Math.min(150, Math.max(100, Math.min(w, h) * 0.12));
      seedStars();
    }

    function seedStars() {
      const count = Math.min(Math.floor((w * h) / 3800), 260);
      stars = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        let hue = 'white';
        if (roll < 0.14) hue = 'gold';
        else if (roll < 0.28) hue = 'teal';
        else if (roll < 0.34) hue = 'violet';

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.35,
          a: Math.random() * 0.55 + 0.35,
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.025 + 0.008,
          layer: Math.random() < 0.35 ? 2 : 1,
          hue: hue,
          // slow drift so the web feels alive
          dx: (Math.random() - 0.5) * 0.12,
          dy: (Math.random() - 0.5) * 0.12,
        });
      }
    }

    function spawnMeteor() {
      // More frequent, more visible shooting stars
      if (meteors.length > 4) return;
      // ~2% chance per frame at 60fps ≈ one every ~0.8s when free
      if (Math.random() > 0.018) return;

      const fromLeft = Math.random() > 0.45;
      const speed = Math.random() * 8 + 10;
      meteors.push({
        x: fromLeft ? -40 : w + 40,
        y: Math.random() * h * 0.55,
        vx: fromLeft ? speed : -speed,
        vy: Math.random() * 4 + 2.5,
        life: 1,
        len: Math.random() * 90 + 70,
        thick: Math.random() * 1.5 + 1.5,
        hue: Math.random() < 0.5 ? 'teal' : (Math.random() < 0.5 ? 'gold' : 'white'),
      });
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / w;
      mouseY = e.clientY / h;
    }, { passive: true });

    function starColor(hue, alpha) {
      if (hue === 'gold') return `rgba(224, 192, 106, ${alpha})`;
      if (hue === 'teal') return `rgba(0, 240, 208, ${alpha})`;
      if (hue === 'violet') return `rgba(155, 109, 255, ${alpha})`;
      return `rgba(232, 236, 244, ${alpha})`;
    }

    function draw() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const px = (mouseX - 0.5) * 14;
      const py = (mouseY - 0.5) * 10;

      // Update positions + cache screen coords
      const pts = [];
      for (const s of stars) {
        s.x += s.dx;
        s.y += s.dy;
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;

        s.tw += s.sp;
        const twinkle = 0.55 + Math.sin(s.tw) * 0.45;
        const alpha = s.a * twinkle;
        const lx = s.x + px * s.layer * 0.4;
        const ly = s.y + py * s.layer * 0.4;
        pts.push({ s, lx, ly, alpha });
      }

      // ── Constellation lines between nearby stars ──
      const maxLinks = 3;
      const linkCounts = new Array(pts.length).fill(0);
      const dist2 = linkDist * linkDist;

      ctx.lineCap = 'round';
      for (let i = 0; i < pts.length; i++) {
        if (linkCounts[i] >= maxLinks) continue;
        const a = pts[i];
        // only link brighter / slightly larger stars more often for cleaner web
        for (let j = i + 1; j < pts.length; j++) {
          if (linkCounts[i] >= maxLinks) break;
          if (linkCounts[j] >= maxLinks) continue;
          const b = pts[j];
          const dx = a.lx - b.lx;
          const dy = a.ly - b.ly;
          const d2 = dx * dx + dy * dy;
          if (d2 > dist2 || d2 < 40) continue;

          const d = Math.sqrt(d2);
          const strength = 1 - d / linkDist;
          const lineA = strength * 0.42 * Math.min(a.alpha, b.alpha);

          // gold-teal blend along the link
          const grad = ctx.createLinearGradient(a.lx, a.ly, b.lx, b.ly);
          if (a.s.hue === 'teal' || b.s.hue === 'teal') {
            grad.addColorStop(0, `rgba(0, 240, 208, ${lineA})`);
            grad.addColorStop(1, `rgba(224, 192, 106, ${lineA * 0.85})`);
          } else if (a.s.hue === 'violet' || b.s.hue === 'violet') {
            grad.addColorStop(0, `rgba(155, 109, 255, ${lineA})`);
            grad.addColorStop(1, `rgba(224, 192, 106, ${lineA * 0.8})`);
          } else {
            grad.addColorStop(0, `rgba(224, 192, 106, ${lineA})`);
            grad.addColorStop(1, `rgba(232, 236, 244, ${lineA * 0.7})`);
          }

          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.8 + strength * 0.9;
          ctx.beginPath();
          ctx.moveTo(a.lx, a.ly);
          ctx.lineTo(b.lx, b.ly);
          ctx.stroke();

          linkCounts[i]++;
          linkCounts[j]++;
        }
      }

      // ── Stars (dots) ──
      for (const p of pts) {
        const { s, lx, ly, alpha } = p;
        ctx.fillStyle = starColor(s.hue, alpha);
        ctx.beginPath();
        ctx.arc(lx, ly, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.r > 1.0 && alpha > 0.4) {
          ctx.beginPath();
          ctx.arc(lx, ly, s.r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = starColor(s.hue, alpha * 0.18);
          ctx.fill();
        }
      }

      // ── Shooting stars ──
      spawnMeteor();
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.009;

        const tailX = m.x - m.vx * (m.len / 9);
        const tailY = m.y - m.vy * (m.len / 9);

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        if (m.hue === 'teal') {
          grad.addColorStop(0, `rgba(255, 255, 255, ${m.life})`);
          grad.addColorStop(0.25, `rgba(0, 240, 208, ${m.life * 0.85})`);
          grad.addColorStop(1, 'rgba(0, 240, 208, 0)');
        } else if (m.hue === 'gold') {
          grad.addColorStop(0, `rgba(255, 255, 255, ${m.life})`);
          grad.addColorStop(0.25, `rgba(224, 192, 106, ${m.life * 0.9})`);
          grad.addColorStop(1, 'rgba(224, 192, 106, 0)');
        } else {
          grad.addColorStop(0, `rgba(255, 255, 255, ${m.life})`);
          grad.addColorStop(0.3, `rgba(200, 220, 255, ${m.life * 0.7})`);
          grad.addColorStop(1, 'rgba(155, 109, 255, 0)');
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thick;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // bright head
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thick * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${m.life * 0.95})`;
        ctx.fill();

        if (m.life <= 0 || m.x < -120 || m.x > w + 120 || m.y > h + 80) {
          meteors.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        draw();
      }
    });
  }

  // GLASS CARD TILT (subtle 3D)
 // ===========================
 if (!isTouch && !reducedMotion) {
 document.querySelectorAll('[data-tilt]').forEach((card) => {
 card.addEventListener('mousemove', (e) => {
 const rect = card.getBoundingClientRect();
 const x = (e.clientX - rect.left) / rect.width;
 const y = (e.clientY - rect.top) / rect.height;
 const rx = (0.5 - y) * 8;
 const ry = (x - 0.5) * 10;
 card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
 });
 card.addEventListener('mouseleave', () => {
 card.style.transform = '';
 });
 });
 }

 // ===========================
 // MAGNETIC BUTTONS
 // ===========================
 if (!isTouch && !reducedMotion) {
 document.querySelectorAll('[data-magnetic]').forEach((btn) => {
 btn.addEventListener('mousemove', (e) => {
 const rect = btn.getBoundingClientRect();
 const x = e.clientX - rect.left - rect.width / 2;
 const y = e.clientY - rect.top - rect.height / 2;
 btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
 });
 btn.addEventListener('mouseleave', () => {
 btn.style.transform = '';
 });
 });
 }

 // ===========================
 // PARALLAX ORBS
 // ===========================
 const orbs = document.querySelectorAll('[data-parallax]');
 if (orbs.length && !reducedMotion) {
 window.addEventListener('scroll', () => {
 const sc = window.scrollY;
 orbs.forEach((orb) => {
 const speed = parseFloat(orb.dataset.parallax) || 0.15;
 orb.style.transform = `translate3d(0, ${sc * speed}px, 0)`;
 });
 }, { passive: true });
 }

 // ===========================
 // HASH SCROLL OFFSET (fixed nav)
 // ===========================
 if (window.location.hash) {
 setTimeout(() => {
 const target = document.querySelector(window.location.hash);
 if (target) {
 const y = target.getBoundingClientRect().top + window.scrollY - 100;
 window.scrollTo({ top: y, behavior: 'smooth' });
 }
 }, 100);
 }

})();
