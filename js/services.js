/* =============================================================================
   PLANN Design — uslugi jako trzy rozwijane kierunki
   Klik rozwija podspis (animacja wysokosci w CSS), plus obraca sie o 45 stopni.
   Otwarty moze byc tylko jeden kierunek na raz.
   ============================================================================= */
(() => {
  'use strict';

  const dirs = Array.from(document.querySelectorAll('.svc__dir'));
  if (!dirs.length) return;

  const setOpen = (dir, open) => {
    dir.classList.toggle('is-open', open);
    const head = dir.querySelector('[data-svc-toggle]');
    if (head) head.setAttribute('aria-expanded', String(open));
  };

  dirs.forEach(dir => {
    const head = dir.querySelector('[data-svc-toggle]');
    if (!head) return;
    head.addEventListener('click', () => {
      const open = !dir.classList.contains('is-open');
      dirs.forEach(other => setOpen(other, other === dir && open));
    });
  });
})();
