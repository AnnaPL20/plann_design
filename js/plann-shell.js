/* =============================================================================
   PLANN design — wspolna oprawa podstron (09.10.2026)
   Kontakt, sklep i brief chodza teraz w tym samym czarnym stylu co glowna:
   ten sam kroj, ziarno, winieta, kwadratowy kursor w negatywie, nawigacja
   po srodku u gory i przelacznik jezyka w lewym rogu.
   Plik daje tez stare API window.PLANN (t / lang / onLang / translate),
   z ktorego korzystaja js/contact-funnel.js, js/shop.js i js/brief.js —
   dzieki temu ich logika zostaje bez zmian.
   ============================================================================= */
(() => {
  'use strict';

  const DICT = window.PLANN_DICT || { en: {} };
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* tryb prywatny */ } },
  };
  let lang = store.get('plann-lang') || 'en';
  if (!DICT[lang]) lang = 'en';
  const t = key => (DICT[lang] && DICT[lang][key]) ?? DICT.en[key] ?? '';
  const handlers = [];

  const applyI18n = (scope = document) => {
    scope.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(x => x.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  };

  const setLang = next => {
    if (!DICT[next]) return;
    lang = next;
    store.set('plann-lang', lang);
    document.documentElement.lang = lang;
    applyI18n();
    document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
    const metaKey = document.body.dataset.metaKey;
    if (metaKey) {
      document.title = t(metaKey + '.metaTitle') || document.title;
      const d = document.querySelector('meta[name="description"]');
      if (d && t(metaKey + '.metaDesc')) d.setAttribute('content', t(metaKey + '.metaDesc'));
    }
    const cur = document.querySelector('.cur .r span');
    if (cur) cur.textContent = t('cursor.view');
    handlers.forEach(fn => { try { fn(lang); } catch (e) { /* jeden modul nie blokuje reszty */ } });
  };

  window.PLANN = {
    t,
    lang: () => lang,
    onLang: fn => { if (typeof fn === 'function') handlers.push(fn); },
    translate: scope => applyI18n(scope || document),
  };

  setLang(lang);
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* Rok w stopce */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Kwadratowy kursor w negatywie ---------- */
  const cur = document.querySelector('.cur');
  if (cur && matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lerp = (a, b, k) => a + (b - a) * k;
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx = lerp(cx, tx, .2); cy = lerp(cy, ty, .2);
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => {
      const el = e.target instanceof Element ? e.target : null;
      cur.classList.toggle('view', Boolean(el && el.closest('[data-cursor-view]')));
      cur.classList.toggle('drag', Boolean(el && !el.closest('[data-cursor-view]') && el.closest('a, button, input, textarea, label')));
    });
  }
})();
