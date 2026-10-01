/* =============================================================================
   PLANN Design — glebia prac przy przewijaniu (01.10.2026)
   Wlascicielka: "jak przewijam, to co jeszcze nie dojechalo ma byc jakby
   w tle, a to, co przy mnie — blisko; taki plynny, przestrzenny ruch".
   Kazdy kafelek dostaje zmienna --depth (0 = srodek ekranu, 1 = daleko),
   a CSS (sekcja 96) zamienia ja na skale, rozmycie i przezroczystosc.
   Jeden nasluch na rAF, zadnych bibliotek. Przy prefers-reduced-motion
   kafelki stoja plasko.
   ============================================================================= */
(() => {
  'use strict';

  const grid = document.querySelector('[data-works-grid]');
  if (!grid) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tiles = Array.from(grid.querySelectorAll('.wtile'));
  let raf = 0;

  const paint = () => {
    raf = 0;
    const mid = innerHeight / 2;
    const span = innerHeight * .95;
    tiles.forEach(tile => {
      if (tile.hidden) return;
      const r = tile.getBoundingClientRect();
      const c = r.top + r.height / 2;
      const d = Math.min(1, Math.abs(c - mid) / span);
      tile.style.setProperty('--depth', d.toFixed(3));
    });
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };

  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask, { passive: true });
  /* Po zmianie filtra kafelki zmieniaja miejsce — liczymy od nowa */
  if ('MutationObserver' in window) {
    new MutationObserver(ask).observe(grid, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
  }
  ask();
})();
