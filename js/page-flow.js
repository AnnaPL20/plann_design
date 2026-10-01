/* =============================================================================
   PLANN Design — przeplywanie miedzy stronami (01.10.2026)
   Wlascicielka: przejscia miedzy podstronami maja "przeplywac", a nie ciac.
   Klikniecie wlasnego odnosnika najpierw wygasza strone (przezroczystosc
   i rozmycie, style.css sekcja 102), a dopiero potem przechodzi dalej.
   Nowa strona wplywa z rozmycia (klasa is-page-in na body). W przegladarkach
   z cross-document view transitions dochodzi do tego miekkie przenikanie
   (@view-transition w CSS) — tam, gdzie go nie ma, wystarcza to, co tu.
   Nie dotyka: kotwic na tej samej stronie (prowadzi je js/scroll.js),
   odnosnikow w nowej karcie, pobran, poczty i obcych adresow.
   ============================================================================= */
(() => {
  'use strict';

  const body = document.body;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Wejscie: klasa dopiero po pierwszej klatce, zeby przejscie mialo od czego startowac */
  requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('is-page-in')));

  /* Powrot przyciskiem "wstecz" z pamieci przegladarki: strona nie moze zostac wygaszona */
  addEventListener('pageshow', event => {
    if (event.persisted) body.classList.remove('is-page-out');
  });

  /* Strzalka do gory (02.10.2026, prosba wlascicielki): prawy dolny rog,
     pokazuje sie po przewinieciu okolo jednego ekranu. Klik prowadzi do
     #main — plynne dojscie obsluguje js/scroll.js (Lenis). */
  const top = document.createElement('a');
  top.className = 'totop';
  top.href = '#main';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 14V2M3.5 6.5 8 2l4.5 4.5"/></svg>';
  body.appendChild(top);
  let topRaf = 0;
  const topCheck = () => {
    topRaf = 0;
    top.classList.toggle('is-on', scrollY > innerHeight * .9);
  };
  addEventListener('scroll', () => { if (!topRaf) topRaf = requestAnimationFrame(topCheck); }, { passive: true });
  topCheck();

  if (calm) return;

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    let url;
    try { url = new URL(link.href, location.href); } catch (e) { return; }
    if (url.origin !== location.origin) return;                 /* obcy adres, poczta itp. */
    if (url.pathname === location.pathname && url.hash) return;  /* kotwica na tej stronie */
    if (url.href === location.href) return;

    event.preventDefault();
    body.classList.add('is-page-out');
    setTimeout(() => { location.href = url.href; }, 400);
  });
})();
