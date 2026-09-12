/* =============================================================================
   PLANN Design — naplywy sekcji i paralaksa hero
   Arkusze (.sheet) nasuwaja sie na poprzednia powierzchnie, a ta pod spodem
   zmniejsza sie do scale .98 i przygasa do brightness .95 proporcjonalnie do
   postepu przewijania. Wszystko na CSS transform — bez bibliotek.
   ============================================================================= */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero__video');
  const sheets = Array.from(document.querySelectorAll('.sheet'));

  /* Kolejnosc ukladania: kazdy nastepny arkusz lezy nad poprzednim.
     Gorna granica to 80 — wyzej sa nawigacja (100), menu (95) i rozmycie (90). */
  sheets.forEach((el, i) => { el.style.zIndex = String(Math.min(1 + i, 80)); });

  if (reduceMotion || !hero) return;

  const layers = [hero, ...sheets];
  const MAX_SCALE_DROP = 0.02;   /* do scale .98 */
  const MAX_DIM = 0.05;          /* do brightness .95 */
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = innerHeight;

    /* Paralaksa wideo: przesuwa sie o ok. 20% przewinietej drogi */
    if (video) {
      const y = Math.min(scrollY, vh * 1.2) * 0.2;
      hero.style.setProperty('--hero-par', y.toFixed(1) + 'px');

      /* Oszczednosc: przykryte wideo nie musi sie dekodowac */
      const covered = scrollY > vh * 1.3;
      if (covered && !video.paused) video.pause();
      else if (!covered && video.paused) { const p = video.play(); if (p) p.catch(() => {}); }
    }

    for (let i = 0; i < layers.length - 1; i++) {
      const current = layers[i];
      const next = layers[i + 1];
      const top = next.getBoundingClientRect().top;

      /* Postep nasuwania: 0 gdy nastepny arkusz dopiero wchodzi w ekran,
         1 gdy przykryl juz cala wysokosc okna */
      let p = (vh - top) / vh;
      p = p < 0 ? 0 : p > 1 ? 1 : p;

      if (p <= 0.001) {
        if (current.classList.contains('is-dimming')) {
          current.classList.remove('is-dimming');
          current.style.removeProperty('--sheet-scale');
          current.style.removeProperty('--sheet-bright');
        }
        continue;
      }
      current.classList.add('is-dimming');
      current.style.setProperty('--sheet-scale', (1 - MAX_SCALE_DROP * p).toFixed(4));
      current.style.setProperty('--sheet-bright', (1 - MAX_DIM * p).toFixed(4));
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  requestAnimationFrame(update);
})();
