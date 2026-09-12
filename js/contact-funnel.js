/* =============================================================================
   PLANN Design — lejek kontaktowy (contact.html)
   Cztery kroki: rodzaj wspolpracy, budzet, e-mail, krotki opis.
   Jeden krok na ekran, przejscia z rozmyciem, wysylka AJAX-em do FormSubmit.
   Bez bibliotek.
   ============================================================================= */
(() => {
  'use strict';

  const root = document.querySelector('[data-fn]');
  if (!root) return;

  const $ = sel => root.querySelector(sel);
  const $$ = sel => Array.from(root.querySelectorAll(sel));
  const t = key => (window.PLANN ? window.PLANN.t(key) : '');

  const ENDPOINT = 'https://formsubmit.co/ajax/annapytsko@gmail.com';
  const LAST_STEP = 4;
  const ANIM = 600; /* zgodne z czasem przejscia w CSS */

  const form = $('[data-fn-form]');
  const steps = $$('[data-fn-step]');
  const counter = $('[data-fn-count]');
  const nav = $('[data-fn-nav]');
  const backBtn = $('[data-fn-back]');
  const nextBtn = $('[data-fn-next]');
  const nextLabel = $('[data-fn-next-label]');
  const budgetInput = $('[data-fn-budget]');
  const notSureBtn = $('[data-fn-notsure]');
  const emailInput = $('[data-fn-email]');
  const emailError = $('[data-fn-error]');
  const messageInput = $('[data-fn-message]');
  const failBox = $('[data-fn-fail]');

  const stepEl = id => steps.find(el => el.dataset.fnStep === String(id));

  let current = 1;
  let sending = false;
  let service = null;   /* { value, key } */
  let notSure = false;

  /* ---------- Walidacja ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const emailOk = () => EMAIL_RE.test((emailInput.value || '').trim());
  const budgetOk = () => notSure || Boolean((budgetInput.value || '').trim());
  const stepValid = n => (n === 1 ? Boolean(service) : n === 2 ? budgetOk() : n === 3 ? emailOk() : true);

  const syncNav = () => {
    if (current === 'done') return;
    nextBtn.disabled = sending || !stepValid(current);
    backBtn.hidden = current === 1;
    if (nextLabel) {
      nextLabel.textContent = sending
        ? t('wiz.sending')
        : t(current === LAST_STEP ? 'ct.send' : 'ct.next');
    }
  };

  /* ---------- Przejscia miedzy krokami ---------- */
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

    const focusTarget = next === 2 ? budgetInput : next === 3 ? emailInput : next === 4 ? messageInput : null;
    if (focusTarget) setTimeout(() => focusTarget.focus({ preventScroll: true }), ANIM * 0.6);
  };

  /* ---------- Krok 1: chipsy uslug ---------- */
  const chips = $$('[data-fn-services] .chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        const on = c === chip;
        c.classList.toggle('is-picked', on);
        c.setAttribute('aria-checked', String(on));
      });
      service = { value: chip.dataset.value, key: chip.dataset.key };
      syncNav();
    });
  });

  /* ---------- Krok 2: budzet ---------- */
  const clearNotSure = () => {
    notSure = false;
    notSureBtn.classList.remove('is-picked');
    notSureBtn.setAttribute('aria-pressed', 'false');
  };

  budgetInput.addEventListener('input', () => {
    /* Zostawiamy tylko cyfry i separatory — pole ma wygladac jak kwota */
    budgetInput.value = budgetInput.value.replace(/[^\d .,]/g, '');
    if (budgetInput.value.trim()) clearNotSure();
    syncNav();
  });

  notSureBtn.addEventListener('click', () => {
    notSure = !notSure;
    notSureBtn.classList.toggle('is-picked', notSure);
    notSureBtn.setAttribute('aria-pressed', String(notSure));
    if (notSure) budgetInput.value = '';
    syncNav();
  });

  /* ---------- Krok 3: e-mail ---------- */
  emailInput.addEventListener('input', () => { emailError.hidden = true; syncNav(); });
  emailInput.addEventListener('blur', () => {
    emailError.hidden = !emailInput.value.trim() || emailOk();
  });

  /* ---------- Sterowanie ---------- */
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

  /* Klawiatura dziala na calej stronie, nie tylko gdy fokus siedzi w lejku */
  document.addEventListener('keydown', event => {
    if (current === 'done') return;
    if (event.target.closest && event.target.closest('.nav, .menu')) return;
    const inTextarea = event.target === messageInput;
    if (event.key === 'Enter') {
      if (inTextarea && !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      forward();
      return;
    }
    const inField = event.target === emailInput || event.target === budgetInput;
    if (event.key === 'ArrowLeft' && !inTextarea && !inField && current > 1) {
      event.preventDefault();
      goTo(current - 1);
    }
  });

  /* ---------- Podsumowanie ---------- */
  const budgetText = () => (notSure ? t('wiz.b5') : '€' + (budgetInput.value || '').trim());
  const renderSummary = () => {
    const map = {
      service: service ? t(service.key) : '',
      budget: budgetText(),
      email: (emailInput.value || '').trim()
    };
    $$('[data-fn-sum]').forEach(el => { el.textContent = map[el.dataset.fnSum] || '—'; });
  };
  if (window.PLANN) window.PLANN.onLang(() => { renderSummary(); syncNav(); });

  /* ---------- Wysylka ---------- */
  async function send() {
    sending = true;
    failBox.hidden = true;
    syncNav();

    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });
    data.service = service ? service.value : '';
    data.budget = notSure ? 'Not sure yet' : 'EUR ' + (budgetInput.value || '').trim();
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
