/* =============================================================================
   PLANN Design — gestosc siatki prac
   Pasek nad galeria przelacza liczbe kafelkow w rzedzie: 2, 3 albo 4.
   Wybor zapisuje sie w przegladarce, wiec przy powrocie strona pamieta,
   jak wlascicielka (albo gosc) lubi ogladac prace.
   Na waskim ekranie pasek jest schowany, a liczbe kolumn ustala CSS.
   ============================================================================= */
(() => {
  'use strict';

  const grid = document.querySelector('[data-works-grid]');
  const buttons = Array.from(document.querySelectorAll('.works__view'));
  if (!grid || !buttons.length) return;

  const KEY = 'plann-works-cols';

  const apply = cols => {
    grid.style.setProperty('--cols', cols);
    buttons.forEach(b => {
      const on = b.dataset.view === String(cols);
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem(KEY, String(cols)); } catch (e) { /* tryb prywatny */ }
  };

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* tryb prywatny */ }
  if (saved && ['2', '3', '4'].includes(saved)) apply(saved);

  buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.view)));
})();
