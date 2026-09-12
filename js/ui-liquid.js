/* =============================================================================
   PLANN Design — krople szkla (liquid glass)
   Wedrujacy odblask pod kursorem, efekt galarety przy klikniecu, falka (ripple)
   oraz plynny przelacznik jezyka z filtrem gooey.
   Bez bibliotek: Web Animations API + zmienne CSS.
   ============================================================================= */
(() => {
  'use strict';

  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Wszystkie elementy, ktore maja zachowywac sie jak kropla */
  const DROP = '.btn, .pill, .chip, .lang__btn';

  /* ---------- Odblask wedrujacy za kursorem (--x / --y) ---------- */
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    let pending = null;
    const paint = () => {
      if (!pending) return;
      const { el, x, y } = pending;
      pending = null;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty('--x', (((x - r.left) / r.width) * 100).toFixed(1) + '%');
      el.style.setProperty('--y', (((y - r.top) / r.height) * 100).toFixed(1) + '%');
    };
    document.addEventListener('pointermove', event => {
      const el = event.target instanceof Element ? event.target.closest(DROP) : null;
      if (!el) return;
      const first = !pending;
      pending = { el, x: event.clientX, y: event.clientY };
      if (first) requestAnimationFrame(paint);
    }, { passive: true });
  }

  /* ---------- Galareta + falka przy klikniecu ---------- */
  const JELLY = [
    { transform: 'scale(1, 1)',        offset: 0 },
    { transform: 'scale(1.12, .86)',   offset: .16 },
    { transform: 'scale(.94, 1.07)',   offset: .38 },
    { transform: 'scale(1.05, .96)',   offset: .58 },
    { transform: 'scale(.98, 1.02)',   offset: .78 },
    { transform: 'scale(1, 1)',        offset: 1 }
  ];

  const ripple = (el, event) => {
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.1;
    const span = document.createElement('span');
    span.className = 'drop-ripple';
    span.style.setProperty('--r', size + 'px');
    span.style.left = (event.clientX - r.left) + 'px';
    span.style.top = (event.clientY - r.top) + 'px';
    el.appendChild(span);
    const anim = span.animate(
      [{ transform: 'scale(.05)', opacity: .85 }, { transform: 'scale(1)', opacity: 0 }],
      { duration: 600, easing: 'cubic-bezier(.22,.61,.36,1)' }
    );
    anim.finished.then(() => span.remove(), () => span.remove());
  };

  if (!reduceMotion) {
    document.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      const el = event.target instanceof Element ? event.target.closest(DROP) : null;
      if (!el || el.disabled) return;
      el.animate(JELLY, { duration: 620, easing: 'cubic-bezier(.22,.61,.36,1)' });
      ripple(el, event);
    }, { passive: true });
  }

  /* ---------- Przelacznik jezyka: kropla przelewa sie miedzy pozycjami ---------- */
  const setupLang = group => {
    if (group.querySelector('.lang__goo')) return;
    const goo = document.createElement('span');
    goo.className = 'lang__goo';
    goo.setAttribute('aria-hidden', 'true');
    goo.innerHTML = '<span class="lang__blob lang__blob--trail"></span><span class="lang__blob"></span>';
    group.prepend(goo);

    const blobs = Array.from(goo.children);
    const place = () => {
      const active = group.querySelector('.lang__btn.is-active');
      if (!active) return;
      const base = group.getBoundingClientRect();
      const box = active.getBoundingClientRect();
      // 3px to wewnetrzny odstep .lang__goo — odejmujemy go od przesuniecia
      const tx = Math.round(box.left - base.left - 3);
      blobs.forEach(b => {
        b.style.setProperty('--tx', tx + 'px');
        b.style.setProperty('--w', Math.round(box.width) + 'px');
      });
      group.classList.add('is-ready');
    };

    requestAnimationFrame(place);
    addEventListener('resize', place, { passive: true });
    // Klasa .is-active ustawiana jest w script.js przy zmianie jezyka
    new MutationObserver(() => requestAnimationFrame(place))
      .observe(group, { attributes: true, attributeFilter: ['class'], subtree: true });
    // Po doladowaniu fontow szerokosc pigulek moze sie zmienic
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  };

  if (!reduceMotion) $$('.lang').forEach(setupLang);
})();
