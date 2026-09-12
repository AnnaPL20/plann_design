/* =============================================================================
   PLANN Design — obiekt 3D pod menu
   Pryzma zlozona z czterech wlasnych okladek. Przewijanie obraca ja wokol osi
   pionowej, ruch kursora pochyla ja i przesuwa swiatlo. Caly ruch to zmienne
   CSS (--ry, --rx, --lx, --ly), wiec rysowaniem zajmuje sie przegladarka.
   Przy prefers-reduced-motion obiekt stoi nieruchomo w lekkim ujeciu.
   ============================================================================= */
(() => {
  const stage = document.querySelector('[data-obj3d]');
  const box = document.querySelector('[data-obj3d-box]');
  if (!stage || !box) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    box.style.setProperty('--ry', '-24deg');
    box.style.setProperty('--rx', '-8deg');
    return;
  }

  let ry = -24, rx = -8, tiltX = 0, tiltY = 0, ticking = false;

  const draw = () => {
    ticking = false;
    box.style.setProperty('--ry', (ry + tiltY).toFixed(2) + 'deg');
    box.style.setProperty('--rx', (rx + tiltX).toFixed(2) + 'deg');
  };
  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(draw);
  };

  /* Przewijanie: pelny obrot mniej wiecej na dwa ekrany wysokosci */
  const onScroll = () => {
    ry = -24 + (scrollY / Math.max(1, innerHeight * 2)) * 360;
    schedule();
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Kursor: pochylenie w granicach kilkunastu stopni i wedrujace swiatlo */
  stage.addEventListener('pointermove', event => {
    const r = stage.getBoundingClientRect();
    const nx = (event.clientX - r.left) / r.width - .5;
    const ny = (event.clientY - r.top) / r.height - .5;
    tiltY = nx * 26;
    tiltX = -ny * 16;
    stage.style.setProperty('--lx', (nx * 100 + 50).toFixed(1) + '%');
    stage.style.setProperty('--ly', (ny * 100 + 50).toFixed(1) + '%');
    stage.classList.add('is-lit');
    schedule();
  });
  stage.addEventListener('pointerleave', () => {
    tiltY = 0;
    tiltX = 0;
    stage.classList.remove('is-lit');
    schedule();
  });
})();
