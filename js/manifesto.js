/* =============================================================================
   PLANN Design — tekst, ktory ciemnieje w miare czytania
   Akapit dzielony jest na slowa; w miare przewijania kolejne przechodza
   z szarosci do koloru tekstu. Bez bibliotek, jeden nasluch na rAF.

   18.09.2026 (prosba wlascicielki): efekt obsluguje juz KAZDY element
   z [data-manifesto], nie tylko jeden. Dzieki temu zapala sie i akapit
   w hero, i tekst o mnie — tak jak na serwisach, ktore pokazala.
   Uwaga: element musi miec caly swoj tekst z jednego klucza slownika,
   bo przy podziale na slowa jego wnetrze jest budowane od nowa.
   ============================================================================= */
(() => {
  'use strict';

  const blocks = Array.from(document.querySelectorAll('[data-manifesto]'));
  if (!blocks.length) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Podzial na slowa — powtarzany po kazdej zmianie jezyka */
  const split = block => {
    const text = block.el.textContent.trim();
    block.el.textContent = '';
    block.words = text.split(/\s+/).map(word => {
      const span = document.createElement('span');
      span.className = 'mw';
      span.textContent = word;
      block.el.appendChild(span);
      block.el.appendChild(document.createTextNode(' '));
      return span;
    });
  };

  const items = blocks.map(el => ({ el, words: [] }));
  items.forEach(split);

  if (reduceMotion) {
    items.forEach(block => block.el.classList.add('is-done'));
    return;
  }

  let ticking = false;
  const paint = () => {
    ticking = false;
    items.forEach(block => {
      const r = block.el.getBoundingClientRect();
      /* Postep: 0 gdy akapit wchodzi od dolu, 1 gdy dojedzie do gornej trzeciej */
      const span = r.height + innerHeight * 0.55;
      const progress = (innerHeight * 0.82 - r.top) / span;
      const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
      const lit = p * block.words.length;
      block.words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  /* Po zmianie jezyka slownik wpisuje tekst od nowa, wiec dzielimy raz jeszcze */
  if (window.PLANN) window.PLANN.onLang(() => { items.forEach(split); onScroll(); });
  requestAnimationFrame(paint);
})();
