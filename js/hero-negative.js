/* =============================================================================
   PLANN Design — plama negatywu w oknie hero
   Za kursorem (albo palcem) jedzie plama z mix-blend-mode: difference, ktora
   odwraca kolory monogramu i tla pod soba. To autorska animacja wlascicielki —
   nie zmieniac bez jej zgody (patrz CLAUDE.md).
   ============================================================================= */
(() => {
  'use strict';

  const media = document.querySelector('[data-hero-media]');
  const spot = document.querySelector('[data-hero-negative]');
  if (!media || !spot) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let x = 0;
  let y = 0;

  const paint = () => {
    raf = 0;
    spot.style.setProperty('--mx', x + 'px');
    spot.style.setProperty('--my', y + 'px');
  };

  const move = event => {
    const r = media.getBoundingClientRect();
    x = event.clientX - r.left;
    y = event.clientY - r.top;
    if (!raf) raf = requestAnimationFrame(paint);
  };

  media.addEventListener('pointerenter', event => {
    media.classList.add('is-negative');
    move(event);
  });
  media.addEventListener('pointermove', move, { passive: true });
  media.addEventListener('pointerleave', () => media.classList.remove('is-negative'));

  /* Bez myszy: plama raz przesuwa sie w poprzek okna, zeby efekt byl widoczny */
  if (!matchMedia('(pointer: fine)').matches && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const r = media.getBoundingClientRect();
        const t0 = performance.now();
        media.classList.add('is-negative');
        const step = now => {
          const p = Math.min((now - t0) / 2600, 1);
          x = r.width * p;
          y = r.height * (0.5 + Math.sin(p * Math.PI * 2) * 0.16);
          paint();
          if (p < 1) requestAnimationFrame(step);
          else media.classList.remove('is-negative');
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    io.observe(media);
  }
})();
