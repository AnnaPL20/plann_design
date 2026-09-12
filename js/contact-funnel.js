/* =============================================================================
   PLANN Design — lejek kontaktowy (contact.html)
   Trzy kroki: e-mail, budzet, krotki opis. Naglowek zostaje na gorze i przygasa,
   gdy uzytkownik zacznie wypelniac. Wysylka AJAX-em do FormSubmit.
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
  const LAST_STEP = 3;
  const ANIM = 600; /* zgodne z czasem przejscia w CSS */

  const form = $('[data-fn-form]');
  const steps = $$('[data-fn-step]');
  const counter = $('[data-fn-count]');
  const nav = $('[data-fn-nav]');
  const backBtn = $('[data-fn-back]');
  const nextBtn = $('[data-fn-next]');
  const nextLabel = $('[data-fn-next-label]');
  const emailInput = $('[data-fn-email]');
  const emailError = $('[data-fn-error]');
  const messageInput = $('[data-fn-message]');
  const amountValue = $('[data-fn-amount-value]');
  const amountBox = $('[data-fn-amount]');
  const failBox = $('[data-fn-fail]');

  const stepEl = id => steps.find(el => el.dataset.fnStep === String(id));

  let current = 1;
  let sending = false;
  let budget = null;   /* { value, display, displayKey, cur } */

  /* ---------- Naglowek przygasa po pierwszym dotknieciu formularza ---------- */
  const engage = () => root.classList.add('is-engaged');

  /* ---------- Walidacja ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const emailOk = () => EMAIL_RE.test((emailInput.value || '').trim());
  const stepValid = n => (n === 1 ? emailOk() : n === 2 ? Boolean(budget) : true);

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

    if (counter) counter.textContent = next === 'done' ? '03' : String(next).padStart(2, '0');
    if (nav) nav.hidden = next === 'done';
    if (failBox && next !== 'done') failBox.hidden = true;
    syncNav();

    if (next === 1) setTimeout(() => emailInput.focus({ preventScroll: true }), ANIM * 0.6);
    if (next === 3) setTimeout(() => messageInput.focus({ preventScroll: true }), ANIM * 0.6);
  };

  /* ---------- Krok 1: e-mail ---------- */
  emailInput.addEventListener('input', () => {
    engage();
    emailError.hidden = true;
    syncNav();
  });
  emailInput.addEventListener('blur', () => {
    emailError.hidden = !emailInput.value.trim() || emailOk();
  });

  /* ---------- Krok 2: budzet wskakuje w wielka cyfre ---------- */
  const paintAmount = () => {
    if (!budget) {
      amountValue.textContent = '—';
      amountBox.classList.remove('is-text');
      amountBox.dataset.cur = '1';
      return;
    }
    amountValue.textContent = budget.displayKey ? t(budget.displayKey) : budget.display;
    amountBox.dataset.cur = budget.cur;
    amountBox.classList.toggle('is-text', budget.cur === '0');
  };

  const chips = $$('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      engage();
      chips.forEach(c => {
        const on = c === chip;
        c.classList.toggle('is-picked', on);
        c.setAttribute('aria-checked', String(on));
      });
      budget = {
        value: chip.dataset.value,
        display: chip.dataset.display || '',
        displayKey: chip.dataset.displayKey || '',
        cur: chip.dataset.cur || '1'
      };
      paintAmount();
      amountBox.classList.remove('is-pop');
      void amountBox.offsetWidth;      /* reflow: animacja ma zagrac ponownie */
      amountBox.classList.add('is-pop');
      syncNav();
    });
  });
  paintAmount();

  /* ---------- Krok 3 ---------- */
  messageInput.addEventListener('input', engage);

  /* ---------- Sterowanie ---------- */
  const forward = () => {
    if (sending) return;
    if (!stepValid(current)) {
      if (current === 1 && emailInput.value.trim()) emailError.hidden = false;
      return;
    }
    if (current === LAST_STEP) send();
    else goTo(current + 1);
  };

  backBtn.addEventListener('click', () => { if (current > 1 && current !== 'done') goTo(current - 1); });
  form.addEventListener('submit', event => { event.preventDefault(); forward(); });

  /* Klawiatura dziala na calej stronie — nie tylko gdy fokus siedzi w lejku */
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
    if (event.key === 'ArrowLeft' && !inTextarea && event.target !== emailInput && current > 1) {
      event.preventDefault();
      goTo(current - 1);
    }
  });

  /* ---------- Podsumowanie ---------- */
  const renderSummary = () => {
    const map = {
      budget: budget ? (budget.displayKey ? t(budget.displayKey) : '€' + budget.display) : '',
      email: (emailInput.value || '').trim()
    };
    $$('[data-fn-sum]').forEach(el => { el.textContent = map[el.dataset.fnSum] || '—'; });
  };
  if (window.PLANN) window.PLANN.onLang(() => { paintAmount(); renderSummary(); syncNav(); });

  /* ---------- Wysylka ---------- */
  async function send() {
    sending = true;
    failBox.hidden = true;
    syncNav();

    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });
    data.email = (emailInput.value || '').trim();
    data.budget = budget ? budget.value : '';
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
  setTimeout(() => emailInput.focus({ preventScroll: true }), 600);
})();
