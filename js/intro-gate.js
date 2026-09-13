/* =============================================================================
   PLANN Design — kurtyna wejsciowa
   Strona otwiera sie czernia, z ktorej wykreca sie znak PA: obraca sie do
   pionu i ostrzy z rozmycia. Potem kurtyna gasnie i wchodzi tresc.
   Kurtyna trzyma przewijanie tylko na czas swojego pokazu — nigdy dluzej,
   nawet gdyby cos poszlo nie tak (jest twardy limit czasu).
   Przy prefers-reduced-motion kurtyny nie ma wcale (style.css sekcja 74).
   ============================================================================= */
(() => {
  'use strict';

  const gate = document.querySelector('.intro-gate');
  if (!gate) return;

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  if (calm) { gate.remove(); return; }

  body.classList.add('is-gating');

  const open = () => {
    if (body.classList.contains('is-gate-open')) return;
    body.classList.add('is-gate-open');
    body.classList.remove('is-gating');
    /* Po wygaszeniu kurtyna schodzi z drogi zupelnie */
    setTimeout(() => gate.remove(), 1200);
  };

  /* Czas liczymy zegarem, a nie zdarzeniem animacji: animationend potrafi
     przyjsc za wczesnie (karta w tle, przyspieszone klatki), a wtedy kurtyna
     gasla, zanim znak zdazyl sie wykrecic. Tu pokaz zawsze trwa tyle samo. */
  setTimeout(open, 1750);
})();
