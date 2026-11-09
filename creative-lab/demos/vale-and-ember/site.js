// Vale & Ember: small progressive enhancements. Everything works without this file: the hero is a single still
// photograph, category links jump to their sections, and portfolio links open the large image directly.
// No network APIs, no storage, no timers that run while nothing is happening.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------------------------------------------------------------- seasonal accent (decorative only)
  // Changes a hairline accent hue by month; never content, contrast-bearing text, or photographs.
  const m = new Date().getMonth();
  root.dataset.season = m <= 1 || m === 11 ? 'winter' : m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'autumn';

  // ---------------------------------------------------------------- hero: slow drifting cross-fade, with a pause control
  const hero = document.querySelector('.ve-hero');
  if (hero) {
    const btn = hero.querySelector('.ve-hero__pause');
    const label = btn.querySelector('.ve-hero__pause-label');
    let paused = false;
    const stage = hero.querySelector('.ve-hero__stage');
    const more = hero.querySelector('.ve-hero__more');
    const apply = () => {
      const motion = !reduce.matches;
      // the extra photographs are added (and downloaded) only when they will actually be shown
      if (motion && more && !stage.querySelector('.ve-hero__layer--2')) stage.append(more.content.cloneNode(true));
      root.classList.toggle('ve-motion', motion);
      hero.classList.toggle('is-paused', paused);
      btn.hidden = !motion;
      btn.setAttribute('aria-pressed', String(paused));
      label.textContent = paused ? 'Play background motion' : 'Pause background motion';
    };
    btn.addEventListener('click', () => { paused = !paused; apply(); });
    reduce.addEventListener('change', apply);
    apply();
  }

  // ---------------------------------------------------------------- booking: dates from today onward
  const date = document.querySelector('input[type="date"]');
  if (date) {
    const d = new Date();
    date.min = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ---------------------------------------------------------------- portfolio: category filter
  const filterNav = document.querySelector('.ve-filter');
  const sets = [...document.querySelectorAll('.ve-set')];
  const status = document.querySelector('.ve-filter__status');
  let current = 'all';
  if (filterNav && sets.length) {
    const list = filterNav.querySelector('ul');
    const allLi = document.createElement('li');
    allLi.innerHTML = '<a href="#main" data-filter="all">All <span class="ve-filter__n"></span></a>';
    allLi.querySelector('.ve-filter__n').textContent = String(document.querySelectorAll('.ve-tile').length);
    list.prepend(allLi);
    const buttons = [...filterNav.querySelectorAll('[data-filter]')].map((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 've-filter__btn';
      b.dataset.filter = a.dataset.filter;
      b.append(...a.childNodes);
      a.replaceWith(b);
      return b;
    });
    const select = (key, announce) => {
      current = key;
      for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.filter === key));
      for (const s of sets) s.hidden = key !== 'all' && s.dataset.category !== key;
      const n = document.querySelectorAll('.ve-set:not([hidden]) .ve-tile').length;
      if (announce && status) status.textContent = `Showing ${n} photographs${key === 'all' ? '' : ` in ${buttons.find((b) => b.dataset.filter === key).firstChild.textContent.trim()}`}.`;
    };
    for (const b of buttons) b.addEventListener('click', () => { select(b.dataset.filter, true); history.replaceState(null, '', b.dataset.filter === 'all' ? location.pathname : `#${b.dataset.filter}`); });
    const fromHash = () => { const h = location.hash.slice(1); return buttons.some((b) => b.dataset.filter === h) ? h : 'all'; };
    select(fromHash(), false);
    addEventListener('hashchange', () => select(fromHash(), true));   // category links while already on this page
  }

  // ---------------------------------------------------------------- portfolio: lightbox
  const dialog = document.querySelector('.ve-lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    const frame = dialog.querySelector('.ve-lightbox__frame');
    const title = dialog.querySelector('.ve-lightbox__title');
    const credit = dialog.querySelector('.ve-lightbox__credit');
    const count = dialog.querySelector('.ve-lightbox__count');
    let items = [], index = 0, opener = null;
    const visibleLinks = () => [...document.querySelectorAll('.ve-set:not([hidden]) .ve-tile__link')];
    const show = (i) => {
      index = (i + items.length) % items.length;
      const link = items[index];
      const pic = link.querySelector('picture').cloneNode(true);
      for (const el of pic.querySelectorAll('source, img')) el.setAttribute('sizes', '(min-width: 1200px) 1200px, 100vw');
      const img = pic.querySelector('img');
      img.removeAttribute('loading');
      img.removeAttribute('class');
      img.className = 've-lightbox__img';
      frame.replaceChildren(pic);
      title.textContent = link.dataset.caption;
      credit.textContent = link.dataset.credit;
      count.textContent = `Photograph ${index + 1} of ${items.length}`;
    };
    const open = (link) => {
      items = visibleLinks();
      opener = link;
      show(items.indexOf(link));
      dialog.showModal();
      dialog.querySelector('[data-lb="close"]').focus();
    };
    const close = () => dialog.close();
    dialog.addEventListener('close', () => { frame.replaceChildren(); if (opener && document.contains(opener)) opener.focus(); });
    document.addEventListener('click', (e) => {
      const link = e.target.closest?.('.ve-tile__link');
      if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(link);
    });
    dialog.addEventListener('click', (e) => {
      const action = e.target.closest?.('[data-lb]')?.dataset.lb;
      if (action === 'close') close();
      else if (action === 'next') show(index + 1);
      else if (action === 'prev') show(index - 1);
      else if (e.target === dialog) close();          // click on the backdrop
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      else if (e.key === 'Tab') {
        // keep focus inside the dialog (the page behind is already inert; this also keeps it off the browser chrome)
        const f = [...dialog.querySelectorAll('button')].filter((b) => !b.hidden);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
})();
