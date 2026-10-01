/* =============================================================================
   PLANN Design — filtry kierunkow nad siatka prac (01.10.2026)
   Wlascicielka: prace maja stac razem, w jednej siatce; jesli juz dzielic,
   to filtrami. Kazdy kafelek ma data-cat (web / brand / social / print /
   motion), pasek nad siatka ma przyciski data-wfilter. "All" pokazuje
   wszystko. Przelaczenie: siatka na chwile gasnie, kafelki sie podmieniaja,
   siatka wraca — bez skakania ukladu w trakcie.
   ============================================================================= */
(() => {
  'use strict';

  const bar = document.querySelector('[data-works-filters]');
  const grid = document.querySelector('[data-works-grid]');
  if (!bar || !grid) return;

  const buttons = Array.from(bar.querySelectorAll('[data-wfilter]'));
  const tiles = Array.from(grid.querySelectorAll('.wtile'));
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = 0;

  const show = cat => {
    tiles.forEach(tile => {
      const on = cat === 'all' || tile.dataset.cat === cat;
      tile.hidden = !on;
      /* Kafelek, ktory wraca, ma od razu byc widoczny — bez czekania na skrol */
      if (on) tile.classList.add('is-visible');
    });
  };

  const pick = cat => {
    buttons.forEach(b => {
      const on = b.dataset.wfilter === cat;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    clearTimeout(timer);
    if (calm) { show(cat); return; }
    grid.classList.add('is-switching');
    timer = setTimeout(() => {
      show(cat);
      requestAnimationFrame(() => grid.classList.remove('is-switching'));
    }, 260);
  };

  buttons.forEach(b => b.addEventListener('click', () => pick(b.dataset.wfilter)));
})();
