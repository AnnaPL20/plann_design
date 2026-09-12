/* =============================================================================
   PLANN Design — witryna sklepu (shop.html)
   Buduje siatke towarow z js/products.js, obsluguje filtry-chipsy i przelaczanie
   okladki po najechaniu. Gdy produkt ma buyUrl, przycisk staje sie "Buy"
   i dostaje klase payhip-buy-button (nakladka platnosci Payhip).
   ============================================================================= */
(() => {
  'use strict';

  const grid = document.querySelector('[data-shop-grid]');
  if (!grid) return;

  const filters = document.querySelector('[data-shop-filters]');
  const empty = document.querySelector('[data-shop-empty]');
  const products = Array.isArray(window.PLANN_PRODUCTS) ? window.PLANN_PRODUCTS : [];
  const t = key => (window.PLANN ? window.PLANN.t(key) : '');

  const MAIL = 'annapytsko@gmail.com';
  let active = 'all';

  const priceText = p => {
    if (p.status !== 'live') return t('sp.soon');
    if (p.price === 0) return t('sp.free');
    return p.price || '';
  };

  const card = p => {
    const el = document.createElement('article');
    el.className = 'prod';
    el.dataset.category = p.category;

    const covers = (p.covers || []).slice(0, 2);
    const media = covers.map((src, i) =>
      `<img class="prod__img${i === 1 ? ' prod__img--alt' : ''}" src="${src}" alt="${i === 0 ? p.name : ''}" loading="lazy"${i === 1 ? ' aria-hidden="true"' : ''}>`
    ).join('');

    const live = p.status === 'live' && p.buyUrl;
    const button = live
      ? `<a class="btn btn--solid prod__btn payhip-buy-button" href="${p.buyUrl}" data-theme="none" target="_blank" rel="noopener">
           <span class="btn__br" aria-hidden="true">[</span><span data-i18n="sp.buy">Buy</span><span class="btn__br" aria-hidden="true">]</span>
         </a>`
      : `<a class="btn prod__btn" href="mailto:${MAIL}?subject=${encodeURIComponent('Notify me: ' + p.name)}">
           <span class="btn__br" aria-hidden="true">[</span><span data-i18n="sp.notify">Notify me</span><span class="btn__br" aria-hidden="true">]</span>
         </a>`;

    el.innerHTML =
      `<div class="prod__media">${media}</div>
       <div class="prod__body">
         <h3 class="prod__name">${p.name}</h3>
         <p class="prod__price" data-price>${priceText(p)}</p>
       </div>
       ${button}`;
    return el;
  };

  const render = () => {
    grid.replaceChildren(...products
      .filter(p => active === 'all' || p.category === active)
      .map(card));
    if (empty) empty.hidden = grid.children.length > 0;
    /* Nowe wezly maja klucze data-i18n — trzeba je przetlumaczyc */
    if (window.PLANN) window.PLANN.translate(grid);
  };

  /* ---------- Filtry ---------- */
  if (filters) {
    filters.addEventListener('click', event => {
      const chip = event.target.closest('[data-filter]');
      if (!chip) return;
      active = chip.dataset.filter;
      Array.from(filters.querySelectorAll('[data-filter]')).forEach(c => {
        const on = c === chip;
        c.classList.toggle('is-picked', on);
        c.setAttribute('aria-pressed', String(on));
      });
      render();
    });
  }

  render();
  if (window.PLANN) window.PLANN.onLang(render);
})();
