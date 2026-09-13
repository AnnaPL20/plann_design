/* =============================================================================
   PLANN Design — plynne przewijanie i jednolite pojawianie sie blokow
   Lenis (kopia lokalna w js/vendor/) z lerp 0.08 oraz wspolny
   IntersectionObserver z kaskada dla kart, wierszy uslug i stopki.
   ============================================================================= */
(() => {
  'use strict';

  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- Inercyjne przewijanie ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      lerp: 0.055,   /* nizej = lagodniej: przewijanie dochodzi miekko, bez szarpania */
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      autoRaf: false
    });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    root.classList.add('has-lenis');
  }

  /* ---------- Kotwice: plynne dojscie z zapasem pod przyklejona szapka ---------- */
  const headerOffset = () => {
    const h = parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 60;
    return -(h + 32);
  };

  /* Odnosniki w nawigacji maja postac "index.html#projects" — gdy wskazuja
     biezaca strone, przewijamy plynnie zamiast przeladowywac. */
  const PAGE = location.pathname.split('/').pop() || 'index.html';

  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.classList.contains('skip')) return;
    const href = link.getAttribute('href') || '';
    const cut = href.indexOf('#');
    if (cut < 0) return;                                     // zwykla nawigacja
    const path = href.slice(0, cut);
    if (path && path !== PAGE) return;                       // inna strona
    const id = href.slice(cut);
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: headerOffset(), duration: 1.15 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ---------- Jednolity system pojawiania sie blokow ---------- */
  /* Kaskada wewnatrz grup: kazde kolejne dziecko startuje 70 ms pozniej */
  $$('[data-reveal-stagger]').forEach(group => {
    $$(':scope > *', group).forEach((child, i) => {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
      child.style.setProperty('--d', (i * 0.08).toFixed(2) + 's');
    });
  });

  if (!('IntersectionObserver' in window) || reduceMotion) {
    $$('[data-reveal]').forEach(el => el.classList.add('is-visible', 'is-in'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      if (entry.target.hasAttribute('data-split')) entry.target.classList.add('is-in');
      io.unobserve(entry.target); // raz na blok
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  $$('[data-reveal]').forEach(el => {
    if (!el.classList.contains('is-visible')) io.observe(el);
  });
})();
