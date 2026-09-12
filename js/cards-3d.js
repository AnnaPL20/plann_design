/* =============================================================================
   PLANN Design — karty projektow w 3D
   Przechylenie do 6 stopni za kursorem, sprezysty powrot i polysk sunacy po
   okladce. Na ekranach dotykowych wylaczone.
   ============================================================================= */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  if (reduceMotion || !finePointer) return;

  const MAX = 6; // maksymalne wychylenie w stopniach

  document.querySelectorAll('.card__media').forEach(media => {
    /* Polysk jako osobny element — pseudo-elementy karty sa juz zajete */
    const gloss = document.createElement('span');
    gloss.className = 'card__gloss';
    gloss.setAttribute('aria-hidden', 'true');
    media.appendChild(gloss);

    let raf = 0, px = 0, py = 0;

    const paint = () => {
      raf = 0;
      media.style.setProperty('--rx', (-py * MAX).toFixed(2) + 'deg');
      media.style.setProperty('--ry', (px * MAX).toFixed(2) + 'deg');
      media.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
      media.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
    };

    media.addEventListener('pointermove', event => {
      const r = media.getBoundingClientRect();
      px = (event.clientX - r.left) / r.width - 0.5;
      py = (event.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });

    media.addEventListener('pointerenter', () => media.classList.add('is-tilting'));

    media.addEventListener('pointerleave', () => {
      media.classList.remove('is-tilting');
      /* Sprezysty powrot do zera */
      media.style.setProperty('--rx', '0deg');
      media.style.setProperty('--ry', '0deg');
    });
  });
})();
