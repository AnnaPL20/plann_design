/* =============================================================================
   PLANN Design — trzy kierunki uslug, rozwijane
   Jeden kierunek otwarty naraz. Panel ma atrybut hidden, wiec bez skryptu
   strona nadal czyta sie poprawnie, a czytniki ekranu dostaja aria-expanded.
   Wysokosc animujemy recznie (z auto nie da sie przejsc plynnie),
   przy prefers-reduced-motion panel po prostu sie pojawia.
   ============================================================================= */
(() => {
  const items = Array.from(document.querySelectorAll('.svc3__item'));
  if (!items.length) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const close = item => {
    const head = item.querySelector('.svc3__head');
    const panel = item.querySelector('.svc3__panel');
    if (!head || !panel || head.getAttribute('aria-expanded') !== 'true') return;
    head.setAttribute('aria-expanded', 'false');
    item.classList.remove('is-open');
    if (calm) { panel.hidden = true; return; }
    panel.style.height = panel.scrollHeight + 'px';
    requestAnimationFrame(() => { panel.style.height = '0px'; });
    panel.addEventListener('transitionend', function end(e) {
      if (e.propertyName !== 'height') return;
      panel.removeEventListener('transitionend', end);
      panel.hidden = true;
      panel.style.height = '';
    });
  };

  const open = item => {
    const head = item.querySelector('.svc3__head');
    const panel = item.querySelector('.svc3__panel');
    if (!head || !panel) return;
    head.setAttribute('aria-expanded', 'true');
    item.classList.add('is-open');
    panel.hidden = false;
    if (calm) return;
    panel.style.height = '0px';
    requestAnimationFrame(() => { panel.style.height = panel.scrollHeight + 'px'; });
    panel.addEventListener('transitionend', function end(e) {
      if (e.propertyName !== 'height') return;
      panel.removeEventListener('transitionend', end);
      panel.style.height = 'auto';
    });
  };

  items.forEach(item => {
    const head = item.querySelector('.svc3__head');
    head?.addEventListener('click', () => {
      const isOpen = head.getAttribute('aria-expanded') === 'true';
      items.forEach(close);
      if (!isOpen) open(item);
    });
  });

  /* Pierwszy kierunek otwarty od razu — zeby bylo widac, co kryje sie w srodku */
  open(items[0]);
})();
