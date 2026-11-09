// Shared demo behaviour (no network access of any kind: the demo CSP sets connect-src 'none' and form-action 'none').
//
// Demonstration forms: every <form> on a demo page is intercepted. Nothing is stored, logged or transmitted.
//   * Invalid input: each problem is shown next to its field (linked with aria-describedby, aria-invalid set), an
//     optional error summary (.demo-form__summary, role="alert") lists them as links, and focus moves to the first
//     invalid field. Messages come from data-error, falling back to the browser's own message.
//   * Groups: a <fieldset data-require-one> needs at least one checked box; radio groups use "required".
//   * Valid input: an on-page message says nothing was sent; the form is cleared.
//   * Without JavaScript the submit buttons stay disabled and a note explains why.
(() => {
  let uid = 0;
  const containerOf = (el) => el.closest('.demo-field, fieldset') || el.parentElement;
  const slotOf = (el) => containerOf(el)?.querySelector('.demo-error');
  const groupOf = (el) => (el.type === 'radio' || el.type === 'checkbox') && el.closest('fieldset') ? el.closest('fieldset') : null;
  const controlsOf = (key) => (key.matches('fieldset') ? [...key.querySelectorAll('input')] : [key]);
  const messageFor = (el) => {
    const group = groupOf(el);
    return (group?.dataset.error) || el.dataset.error || el.validationMessage || 'Please check this field.';
  };

  function syncGroups(form) {
    for (const fs of form.querySelectorAll('fieldset[data-require-one]')) {
      const boxes = [...fs.querySelectorAll('input[type="checkbox"]')];
      const any = boxes.some((b) => b.checked);
      boxes.forEach((b, i) => b.setCustomValidity(!any && i === 0 ? (fs.dataset.error || 'Choose at least one option.') : ''));
    }
  }
  function clear(key) {
    const slot = key.matches('fieldset') ? key.querySelector('.demo-error') : slotOf(key);
    for (const c of controlsOf(key)) {
      c.removeAttribute('aria-invalid');
      if (slot?.id) c.setAttribute('aria-describedby', (c.getAttribute('aria-describedby') || '').split(' ').filter((t) => t && t !== slot.id).join(' '));
      if (!c.getAttribute('aria-describedby')) c.removeAttribute('aria-describedby');
    }
    if (slot) { slot.hidden = true; slot.textContent = ''; }
  }
  function show(key, el) {
    const slot = key.matches('fieldset') ? key.querySelector('.demo-error') : slotOf(el);
    if (!slot) return false;
    if (!slot.id) slot.id = `demo-error-${++uid}`;
    slot.textContent = messageFor(el);
    slot.hidden = false;
    for (const c of controlsOf(key)) {
      c.setAttribute('aria-invalid', 'true');
      const d = (c.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (!d.includes(slot.id)) c.setAttribute('aria-describedby', [...d, slot.id].join(' '));
    }
    return true;
  }

  for (const form of document.querySelectorAll('form')) {
    form.setAttribute('novalidate', '');                  // we present validation ourselves
    for (const b of form.querySelectorAll('[data-demo-submit]')) b.disabled = false;
    for (const n of form.querySelectorAll('.demo-form__nojs')) n.hidden = true;
    const status = form.querySelector('.demo-form__status');
    const summary = form.querySelector('.demo-form__summary');

    // live re-check: once a field has been flagged, its message clears as soon as it becomes valid
    form.addEventListener('input', (e) => recheck(e.target));
    form.addEventListener('change', (e) => recheck(e.target));
    function recheck(el) {
      if (!(el instanceof HTMLElement) || !el.matches('input, textarea, select')) return;
      syncGroups(form);
      const key = groupOf(el) || el;
      const flagged = controlsOf(key).some((c) => c.getAttribute('aria-invalid') === 'true');
      if (flagged && controlsOf(key).every((c) => c.checkValidity())) clear(key);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      syncGroups(form);
      for (const el of form.querySelectorAll('input, textarea, select')) clear(groupOf(el) || el);
      const invalid = [...form.querySelectorAll('input, textarea, select')].filter((el) => !el.checkValidity());
      if (invalid.length) {
        if (status) status.hidden = true;
        const seen = new Set();
        const problems = [];
        let unslotted = false;
        for (const el of invalid) {
          const key = groupOf(el) || el;
          if (seen.has(key)) continue;
          seen.add(key);
          if (!show(key, el)) unslotted = true;
          problems.push({ el, text: messageFor(el) });
        }
        if (summary) {
          summary.replaceChildren();
          const h = document.createElement('p');
          h.className = 'demo-form__summary-title';
          h.textContent = form.dataset.summaryTitle || 'Please check the following:';
          const ul = document.createElement('ul');
          for (const p of problems) {
            if (!p.el.id) p.el.id = `demo-field-${++uid}`;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${p.el.id}`;
            a.textContent = p.text;
            a.addEventListener('click', (ev) => { ev.preventDefault(); p.el.focus(); });
            li.append(a);
            ul.append(li);
          }
          summary.append(h, ul);
          summary.hidden = false;
        } else if (unslotted) {
          form.reportValidity();                          // no inline slots on this form: use the browser's messages
        }
        problems[0].el.focus();
        return;
      }
      if (summary) { summary.hidden = true; summary.replaceChildren(); }
      if (status) {
        status.textContent = status.dataset.message
          || 'Demonstration only: nothing was sent. This form is not connected to any service.';
        status.hidden = false;
        status.focus();
      }
      form.reset();
    });
  }
})();
