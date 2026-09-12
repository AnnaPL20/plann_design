/* =============================================================================
   PLANN Design — nasuwanie kart projektow
   Karty prac sa przyklejone (CSS: position: sticky) pod menu. Ten skrypt liczy
   tylko, jak mocno nastepna karta przykryla poprzednia, i zapisuje wynik w
   zmiennej --cover (0 = odslonieta, 1 = calkiem przykryta). Reszte — skale,
   rozmycie i przygaszenie — robi CSS, dzieki czemu nic nie miga przy scrollu.
   Przy prefers-reduced-motion skrypt nie rusza niczego.
   ============================================================================= */
(() => {
  const rows = Array.from(document.querySelectorAll('.works .wrow'));
  if (rows.length < 2) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const inners = rows.map(row => row.querySelector('.wrow__inner') || row);
  let ticking = false;

  const update = () => {
    ticking = false;
    for (let i = 0; i < rows.length; i++) {
      const inner = inners[i];
      if (i === rows.length - 1) { inner.style.setProperty('--cover', '0'); continue; }

      const here = rows[i].getBoundingClientRect();
      const next = rows[i + 1].getBoundingClientRect();
      /* Odleglosc miedzy gornymi krawedziami: pelna wysokosc karty = odslonieta,
         zero = nastepna karta stoi dokladnie na niej. */
      const span = here.height || 1;
      const cover = 1 - (next.top - here.top) / span;
      inner.style.setProperty('--cover', Math.min(1, Math.max(0, cover)).toFixed(3));
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  addEventListener('load', onScroll);
  update();
})();
