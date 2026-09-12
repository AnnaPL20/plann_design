/* =============================================================================
   PLANN Design — kreator zapytania (kontakt)
   Jeden duzy krok na ekran, przejscia z rozmyciem, walidacja adresu e-mail,
   wysylka AJAX-em do FormSubmit i ekran koncowy z podsumowaniem.
   Bez bibliotek.
   ============================================================================= */
(() => {
  'use strict';

  const wiz = document.querySelector('[data-wizard]');
  if (!wiz) return;

  const $ = (sel, ctx = wiz) => ctx.querySelector(sel);
  const $$ = (sel, ctx = wiz) => Array.from(ctx.querySelectorAll(sel));
  const t = key => (window.PLANN ? window.PLANN.t(key) : '');

  const ENDPOINT = 'https://formsubmit.co/ajax/annapytsko@gmail.com';
  const LAST_STEP = 4;
  const ANIM = 600; /* czas przejscia miedzy krokami — zgodny z CSS */

  const form = $('[data-wiz-form]');
  const steps = $$('[data-wiz-step]');
  const counter = $('[data-wiz-count]');
  const backBtn = $('[data-wiz-back]');
  const nextBtn = $('[data-wiz-next]');
  const nextLabel = $('[data-wiz-next-label]');
  const nav = $('[data-wiz-nav]');
  const emailInput = $('[data-wiz-email]');
  const emailError = $('[data-wiz-error]');
  const messageInput = $('[data-wiz-message]');
  const failBox = $('[data-wiz-fail]');

  const stepEl = id => steps.find(el => el.dataset.wizStep === String(id));

  /* Wybrane wartosci: osobno klucz tlumaczenia (do podsumowania na ekranie)
     i wartosc po angielsku (do tresci maila) */
  const picked = { service: null, budget: null };
  let current = 1;
  let sending = false;

  /* ---------- Walidacja ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const emailOk = () => EMAIL_RE.test((emailInput.value || '').trim());

  const stepValid = n => {
    if (n === 1) return Boolean(picked.service);
    if (n === 2) return Boolean(picked.budget);
    if (n === 3) return emailOk();
    return true; /* krok 4 jest nieobowiazkowy */
  };

  const syncNav = () => {
    if (current === 'done') return;
    nextBtn.disabled = sending || !stepValid(current);
    backBtn.disabled = current === 1;
    backBtn.hidden = current === 1;
    if (nextLabel) {
      nextLabel.textContent = sending
        ? t('wiz.sending')
        : t(current === LAST_STEP ? 'wiz.send' : 'wiz.next');
    }
  };

  /* ---------- Przejscie miedzy krokami ---------- */
  let outTimer = 0;
  const goTo = next => {
    if (next === current) return;
    const from = stepEl(current);
    const to = stepEl(next);
    if (!to) return;

    if (from) {
      from.classList.remove('is-active');
      from.classList.add('is-out');
      clearTimeout(outTimer);
      outTimer = setTimeout(() => from.classList.remove('is-out'), ANIM);
    }
    to.classList.remove('is-out');
    to.classList.add('is-active');
    current = next;

    if (counter) counter.textContent = next === 'done' ? '04' : String(next).padStart(2, '0');
    if (nav) nav.hidden = next === 'done';
    if (failBox && next !== 'done') failBox.hidden = true;
    syncNav();

    /* Kursor trafia tam, gdzie trzeba pisac — dopiero po zakonczeniu animacji */
    if (next === 3) setTimeout(() => emailInput.focus({ preventScroll: true }), ANIM * 0.6);
    if (next === 4) setTimeout(() => messageInput.focus({ preventScroll: true }), ANIM * 0.6);
  };

  /* ---------- Chipsy: wybor jednej opcji ---------- */
  $$('[data-wiz-group]').forEach(group => {
    const name = group.dataset.wizGroup;
    const chips = $$('.chip', group);
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          const on = c === chip;
          c.classList.toggle('is-picked', on);
          c.setAttribute('aria-checked', String(on));
        });
        picked[name] = {
          key: chip.querySelector('[data-i18n]').dataset.i18n,
          value: chip.dataset.value
        };
        if (emailError) emailError.hidden = true;
        syncNav();
      });
    });
  });

  /* ---------- E-mail ---------- */
  emailInput.addEventListener('input', () => {
    emailError.hidden = true;
    syncNav();
  });
  emailInput.addEventListener('blur', () => {
    emailError.hidden = !emailInput.value.trim() || emailOk();
  });

  /* ---------- Przyciski i klawiatura ---------- */
  const forward = () => {
    if (sending) return;
    if (!stepValid(current)) {
      if (current === 3 && emailInput.value.trim()) emailError.hidden = false;
      return;
    }
    if (current === LAST_STEP) send();
    else goTo(current + 1);
  };

  backBtn.addEventListener('click', () => { if (current > 1 && current !== 'done') goTo(current - 1); });
  form.addEventListener('submit', event => { event.preventDefault(); forward(); });

  wiz.addEventListener('keydown', event => {
    if (current === 'done') return;
    const inTextarea = event.target === messageInput;

    if (event.key === 'Enter') {
      if (inTextarea && !(event.ctrlKey || event.metaKey)) return; /* w polu tekstowym Enter robi nowy wiersz */
      event.preventDefault();
      forward();
      return;
    }
    /* Strzalka w lewo cofa — o ile kursor nie stoi w polu tekstowym */
    if (event.key === 'ArrowLeft' && !inTextarea && event.target !== emailInput) {
      if (current > 1) { event.preventDefault(); goTo(current - 1); }
    }
  });

  /* ---------- Podsumowanie na ekranie koncowym ---------- */
  const renderSummary = () => {
    const map = {
      service: picked.service ? t(picked.service.key) : '',
      budget: picked.budget ? t(picked.budget.key) : '',
      email: (emailInput.value || '').trim()
    };
    $$('[data-wiz-sum]').forEach(el => { el.textContent = map[el.dataset.wizSum] || '—'; });
  };
  if (window.PLANN) window.PLANN.onLang(() => { renderSummary(); syncNav(); });

  /* ---------- Wysylka przez FormSubmit ---------- */
  async function send() {
    sending = true;
    failBox.hidden = true;
    syncNav();

    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });
    data.service = picked.service ? picked.service.value : '';
    data.budget = picked.budget ? picked.budget.value : '';
    data.email = (emailInput.value || '').trim();
    data.message = (messageInput.value || '').trim();

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      sending = false;
      renderSummary();
      goTo('done');
    } catch (e) {
      sending = false;
      failBox.hidden = false;
      syncNav();
    }
  }

  syncNav();
})();
