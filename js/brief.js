/* =============================================================================
   PLANN Design — formularz briefu (brief.html)
   Wysylka AJAX-em do FormSubmit na ten sam adres co formularz na stronie
   glownej, ten sam ekran podziekowania. Strona nie przeladowuje sie.
   ============================================================================= */
(() => {
  'use strict';

  const form = document.querySelector('[data-brief-form]');
  if (!form) return;

  const done = document.querySelector('[data-brief-done]');
  const fail = document.querySelector('[data-brief-fail]');
  const failText = document.querySelector('[data-brief-fail-text]');
  const sendBtn = document.querySelector('[data-brief-send]');
  const sendLabel = document.querySelector('[data-brief-send-label]');
  const nameInput = document.querySelector('[data-brief-name]');
  const emailInput = document.querySelector('[data-brief-email]');

  const ENDPOINT = 'https://formsubmit.co/ajax/annapytsko@gmail.com';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const t = key => (window.PLANN ? window.PLANN.t(key) : '');

  const showFail = key => {
    if (failText) failText.textContent = t(key);
    if (fail) fail.hidden = false;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sendBtn.disabled) return;
    if (fail) fail.hidden = true;

    const nameOk = Boolean((nameInput.value || '').trim());
    const mailOk = EMAIL_RE.test((emailInput.value || '').trim());
    if (!nameOk || !mailOk) {
      showFail('brief.required');
      (nameOk ? emailInput : nameInput).focus();
      return;
    }

    sendBtn.disabled = true;
    if (sendLabel) sendLabel.textContent = t('brief.sending');

    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.hidden = true;
      if (done) {
        done.hidden = false;
        done.classList.add('is-active');
        done.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      sendBtn.disabled = false;
      if (sendLabel) sendLabel.textContent = t('brief.send');
      showFail('brief.fail');
    }
  });
})();
