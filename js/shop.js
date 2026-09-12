/* =============================================================================
   PLANN Design — witryna sklepu (shop.html)
   Siatka towarow z js/products.js, filtry-krople, okno szczegolow i zapis
   na liste startowa. Okladki to na razie plaskie gradientowe zaslepki
   z nazwa kategorii — zadnych obcych obrazow.
   ============================================================================= */
(() => {
  'use strict';

  const grid = document.querySelector('[data-shop-grid]');
  if (!grid) return;

  const filters = document.querySelector('[data-shop-filters]');
  const empty = document.querySelector('[data-shop-empty]');
  const modal = document.querySelector('[data-shop-modal]');
  const products = Array.isArray(window.PLANN_PRODUCTS) ? window.PLANN_PRODUCTS : [];
  const t = key => (window.PLANN ? window.PLANN.t(key) : '');

  const MAIL = 'annapytsko@gmail.com';
  const CAT_KEY = { social: 'sp.cSocial', decks: 'sp.cDecks', kits: 'sp.cKits' };
  const INC_KEYS = {
    social: ['sp.incSocial1', 'sp.incSocial2', 'sp.incSocial3'],
    decks: ['sp.incDecks1', 'sp.incDecks2', 'sp.incDecks3'],
    kits: ['sp.incKits1', 'sp.incKits2', 'sp.incKits3']
  };
  let active = 'all';

  const notifyHref = p => `mailto:${MAIL}?subject=${encodeURIComponent('Notify me: ' + p.name)}`;
  const askHref = p => `mailto:${MAIL}?subject=${encodeURIComponent('Question: ' + p.name)}`;

  /* ---------- Karta ---------- */
  const card = p => {
    const el = document.createElement('button');
    el.className = 'prod';
    el.type = 'button';
    el.dataset.id = p.id;
    el.innerHTML =
      `<span class="prod__media prod__media--${p.category}">
         <span class="prod__cat">${t(CAT_KEY[p.category])}</span>
       </span>
       <span class="prod__row">
         <span class="prod__name">${p.name}</span>
         <span class="prod__price">${p.price === 0 ? t('sp.free') : p.price}</span>
       </span>
       <span class="prod__badge">${t('sp.soon')}</span>`;
    el.addEventListener('click', () => openModal(p));
    return el;
  };

  const render = () => {
    const list = products.filter(p => active === 'all' || p.category === active);
    grid.replaceChildren(...list.map(card));
    if (empty) empty.hidden = list.length > 0;
  };

  /* ---------- Okno szczegolow ---------- */
  function openModal(p) {
    if (!modal) return;
    const live = p.status === 'live' && p.buyUrl && p.buyUrl !== 'REPLACE-ME';
    const includes = (INC_KEYS[p.category] || []).map(k => `<li>${t(k)}</li>`).join('');

    modal.querySelector('[data-modal-body]').innerHTML =
      `<div class="pmodal__media pmodal__media--${p.category}"><span class="prod__cat">${t(CAT_KEY[p.category])}</span></div>
       <div class="pmodal__info">
         <p class="label label--br">${t(CAT_KEY[p.category])}</p>
         <h2 class="display pmodal__name">${p.name}</h2>
         <p class="pmodal__desc">${t(p.descKey)}</p>

         <p class="label pmodal__sub">${t('sp.includes')}</p>
         <ul class="pmodal__list">${includes}</ul>

         <dl class="pmodal__facts">
           <div><dt class="label">${t('sp.formats')}</dt><dd>${p.formats}</dd></div>
           <div><dt class="label">${t('sp.price')}</dt><dd>${p.price === 0 ? t('sp.free') : p.price}</dd></div>
           <div><dt class="label">${t('sp.status')}</dt><dd>${live ? t('sp.live') : t('sp.soon')}</dd></div>
         </dl>

         <div class="pmodal__actions">
           ${live
             /* Prawdziwy adres platnosci wpisuje sie w js/products.js (pole buyUrl) */
             ? `<a class="btn btn--solid btn--lg" href="${p.buyUrl}" target="_blank" rel="noopener"><span class="btn__br" aria-hidden="true">[</span><span>${t('sp.buyNow')}</span><span class="btn__br" aria-hidden="true">]</span></a>`
             : `<a class="btn btn--solid btn--lg" href="${notifyHref(p)}"><span class="btn__br" aria-hidden="true">[</span><span>${t('sp.notify')}</span><span class="btn__br" aria-hidden="true">]</span></a>`}
           <a class="btn btn--lg" href="${askHref(p)}"><span class="btn__br" aria-hidden="true">[</span><span>${t('sp.ask')}</span><span class="btn__br" aria-hidden="true">]</span></a>
         </div>
       </div>`;
    modal.showModal();
    document.body.classList.add('is-locked');
  }

  const closeModal = () => {
    if (modal && modal.open) modal.close();
    document.body.classList.remove('is-locked');
  };
  modal?.querySelector('[data-modal-close]')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal?.addEventListener('close', () => document.body.classList.remove('is-locked'));

  /* ---------- Filtry ---------- */
  filters?.addEventListener('click', event => {
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

  /* ---------- Zapis na liste startowa ---------- */
  const listForm = document.querySelector('[data-launch-form]');
  if (listForm) {
    const mail = listForm.querySelector('[data-launch-email]');
    const note = document.querySelector('[data-launch-note]');
    const btnLabel = listForm.querySelector('[data-launch-label]');
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    listForm.addEventListener('submit', async event => {
      event.preventDefault();
      const value = (mail.value || '').trim();
      if (!EMAIL_RE.test(value)) {
        note.hidden = false;
        note.textContent = t('wiz.mailErr');
        note.classList.add('is-error');
        return;
      }
      note.hidden = true;
      const submit = listForm.querySelector('button[type="submit"]');
      submit.disabled = true;
      if (btnLabel) btnLabel.textContent = t('wiz.sending');

      const data = {};
      new FormData(listForm).forEach((v, k) => { data[k] = v; });
      try {
        const res = await fetch('https://formsubmit.co/ajax/' + MAIL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        listForm.hidden = true;
        note.hidden = false;
        note.classList.remove('is-error');
        note.textContent = t('sp.launchOk');
      } catch (e) {
        submit.disabled = false;
        if (btnLabel) btnLabel.textContent = t('sp.launchCta');
        note.hidden = false;
        note.classList.add('is-error');
        note.textContent = t('sp.launchFail');
      }
    });
  }

  render();
  if (window.PLANN) window.PLANN.onLang(() => { render(); if (modal?.open) closeModal(); });
})();
