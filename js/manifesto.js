/* =============================================================================
   PLANN Design — manifest podswietlany slowo po slowie
   Akapit dzielony jest na slowa; w miare przewijania kolejne rozjasniaja sie
   z szarosci do czerni. Bez bibliotek, jeden nasluch na rAF.
   ============================================================================= */
(() => {
  'use strict';

  const el = document.querySelector('[data-manifesto]');
  if (!el) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Podzial na slowa — powtarzany po kazdej zmianie jezyka */
  let words = [];
  const split = () => {
    const text = el.textContent.trim();
    el.textContent = '';
    words = text.split(/\s+/).map(word => {
      const span = document.createElement('span');
      span.className = 'mw';
      span.textContent = word;
      el.appendChild(span);
      el.appendChild(document.createTextNode(' '));
      return span;
    });
  };
  split();

  if (reduceMotion) {
    el.classList.add('is-done');
    return;
  }

  let ticking = false;
  const paint = () => {
    ticking = false;
    const r = el.getBoundingClientRect();
    /* Postep: 0 gdy akapit wchodzi od dolu, 1 gdy dojedzie do gornej trzeciej */
    const span = r.height + innerHeight * 0.55;
    const progress = (innerHeight * 0.82 - r.top) / span;
    const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
    const lit = p * words.length;
    words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  if (window.PLANN) window.PLANN.onLang(() => { split(); onScroll(); });
  requestAnimationFrame(paint);
})();
