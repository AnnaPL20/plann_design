/* =============================================================================
   PLANN Design — Anna Pytsko · logika strony
   Wydzielone z index.html; laduje sie z atrybutem defer, wiec DOM jest gotowy.
   Zawartosc: slownik tlumaczen UA/EN/PL, motyw, menu, kursor, animacje wejscia
   (IntersectionObserver), podglad projektow, zegar studia.
   Zadnych zewnetrznych bibliotek — wszystko wlasnym kodem.
   ============================================================================= */
(() => {
  'use strict';

  /* ---------- Konfiguracja ---------- */
  const STUDIO_TZ = 'Europe/Warsaw'; // strefa czasowa zegara w sekcji hero

  /* ---------- Słownik tłumaczeń (UA / EN / PL) ----------
     Zawartosc siedzi w js/i18n.js — wspolnym pliku wszystkich stron. */
  const I18N = window.PLANN_DICT || { en: {} };

  /* ---------- Pomocnicze ---------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(pointer: fine)').matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* tryb prywatny */ } }
  };
  const t = (lang, key) => (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? '';
  let currentLang = 'en';

  /* Male publiczne API: inne moduly potrzebuja tlumaczen i sygnalu o zmianie jezyka */
  const langHandlers = [];
  window.PLANN = {
    t: key => t(currentLang, key),
    lang: () => currentLang,
    onLang: fn => { if (typeof fn === 'function') langHandlers.push(fn); },
    translate: scope => applyI18n(scope || document, currentLang)
  };

  /* ---------- Motyw (ciemny / jasny) ---------- */
  const themeBtn = $('#themeToggle');
  const applyTheme = theme => {
    root.dataset.theme = theme;
    store.set('plann-theme', theme);
    themeBtn && themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
    const meta = $('meta[name="theme-color"]');
    meta && meta.setAttribute('content', theme === 'light' ? '#faf9f7' : '#0b0b0c');
  };
  applyTheme(store.get('plann-theme') || 'light');
  themeBtn && themeBtn.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* ---------- Dzielenie nagłówków na słowa (animacja słowo po słowie) ---------- */
  const splitWords = el => {
    const text = el.textContent.trim();
    el.textContent = '';
    text.split(/\s+/).forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.style.setProperty('--i', i);
      span.textContent = word;
      el.appendChild(span);
      el.appendChild(document.createTextNode(' '));
    });
  };
  const replay = el => {
    el.classList.remove('is-in');
    void el.offsetWidth; // wymuszenie reflow, aby animacja odtworzyła się ponownie
    requestAnimationFrame(() => el.classList.add('is-in'));
  };

  /* Podmiana tekstow i atrybutow w dowolnym fragmencie drzewa —
     sklep buduje karty w JS, wiec musi umiec przetlumaczyc swieze wezly */
  const applyI18n = (scope, lang) => {
    $$('[data-i18n]', scope).forEach(el => { el.textContent = t(lang, el.dataset.i18n); });
    $$('[data-i18n-attr]', scope).forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(x => x.trim());
        if (attr && key) el.setAttribute(attr, t(lang, key));
      });
    });
  };

  /* ---------- Język ---------- */
  const setLang = (lang, initial = false) => {
    if (!I18N[lang]) lang = 'en';
    currentLang = lang;
    applyI18n(document, lang);
    root.lang = lang;
    const cursorLabel = $('.cursor span');
    if (cursorLabel) cursorLabel.textContent = t(lang, 'cursor.view');
    /* Podstrony maja wlasne klucze tytulu i opisu — wskazuje je data-meta-key na <body> */
    const metaKey = document.body.dataset.metaKey;
    document.title = metaKey ? t(lang, metaKey + '.metaTitle') : t(lang, 'meta.title');
    const desc = $('meta[name="description"]');
    desc && desc.setAttribute('content', metaKey ? t(lang, metaKey + '.metaDesc') : t(lang, 'meta.desc'));
    $$('[data-split]').forEach(el => {
      splitWords(el);
      if (!initial && (el.classList.contains('is-in') || !el.hasAttribute('data-reveal'))) replay(el);
    });
    $$('.lang__btn').forEach(b => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    store.set('plann-lang', lang);
    langHandlers.forEach(fn => { try { fn(lang); } catch (e) { /* modul nie moze zablokowac reszty */ } });
  };
  // Strona zawsze otwiera się po angielsku; wybór języka zapamiętywany w localStorage
  setLang(store.get('plann-lang') || 'en', true);
  $$('.lang__btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------- Start strony: animacje wejścia hero ---------- */
  const start = () => {
    if (document.body.classList.contains('is-loaded')) return;
    document.body.classList.add('is-loaded');
    $$('[data-split]:not([data-reveal])').forEach(el => el.classList.add('is-in'));
  };
  addEventListener('load', start);
  setTimeout(start, 1400); // zabezpieczenie, gdyby zasoby ładowały się długo

  /* ---------- Pojawianie się sekcji przy przewijaniu ---------- */
  $$('[data-reveal-stagger]').forEach(group => {
    $$(':scope > *', group).forEach((child, i) => child.style.setProperty('--d', (i * 0.08).toFixed(2) + 's'));
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        if (e.target.hasAttribute('data-split')) e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(el => io.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('is-visible', 'is-in'));
  }

  /* ---------- Nawigacja: stan po przewinięciu + aktywna sekcja ---------- */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('nav--scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Nawigacja jest ta sama na kazdej stronie, wiec odnosniki wygladaja jak
     "index.html#projects". Sledzimy tylko te, ktore wskazuja biezaca strone. */
  const PAGE = location.pathname.split('/').pop() || 'index.html';
  const localLinks = $$('.nav__link').map(link => {
    const href = link.getAttribute('href') || '';
    const cut = href.indexOf('#');
    const path = cut < 0 ? href : href.slice(0, cut);
    if (path && path !== PAGE) return null;                 // odnosnik na inna strone
    const id = cut < 0 ? 'home' : href.slice(cut + 1);       // "index.html" = gora strony
    const section = $('#' + id);
    return section ? { link, section } : null;
  }).filter(Boolean);

  if ('IntersectionObserver' in window && localLinks.length) {
    const so = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        localLinks.forEach(({ link, section }) => {
          if (section === e.target) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    localLinks.forEach(({ section }) => so.observe(section));
  }

  /* ---------- Menu mobilne ---------- */
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = open => {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', t(currentLang, open ? 'a11y.menuClose' : 'a11y.menuOpen'));
    document.body.classList.toggle('is-locked', open);
  };
  burger && burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu && $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Zegar (czas studia) ---------- */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: STUDIO_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tzName = () => {
      try {
        const part = new Intl.DateTimeFormat('en-GB', { timeZone: STUDIO_TZ, timeZoneName: 'short' }).formatToParts(new Date()).find(p => p.type === 'timeZoneName');
        return part ? part.value : '';
      } catch (e) { return ''; }
    };
    $$('[data-tz]').forEach(el => { el.textContent = tzName(); });
    const tick = () => { const s = fmt.format(new Date()); clocks.forEach(c => { c.textContent = s; }); };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Siatka odsłaniana wokół kursora ---------- */
  const spot = $('.gridlayer__spot');
  if (spot && finePointer && !reduceMotion) {
    let x = -9999, y = -9999, raf = 0;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        spot.style.setProperty('--mx', x + 'px');
        spot.style.setProperty('--my', y + 'px');
        raf = 0;
      });
    }, { passive: true });
    root.addEventListener('mouseleave', () => { spot.style.setProperty('--mx', '-9999px'); spot.style.setProperty('--my', '-9999px'); });
  }

  /* ---------- Niestandardowy kursor ---------- */
  const cursor = $('.cursor');
  if (cursor && finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, shown = false;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; cx = tx; cy = ty; cursor.classList.add('is-visible'); }
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', e => {
      const target = e.target instanceof Element ? e.target : null;
      const work = target?.closest('.card[data-case]');
      cursor.classList.toggle('is-work', Boolean(work));
      cursor.classList.toggle('is-hover', Boolean(work || target?.closest('a, button, [data-cursor]')));
    });
    root.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    root.addEventListener('mouseenter', () => shown && cursor.classList.add('is-visible'));
  }

  /* ---------- Рухомий інверсійний ефект на обкладинках ---------- */
  $$('.card__media').forEach(media => {
    media.addEventListener('pointerenter', () => media.classList.add('is-liquid'));
    media.addEventListener('pointermove', event => {
      const bounds = media.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const tilt = ((x / bounds.width) - .5) * 8;
      media.style.setProperty('--card-x', `${x}px`);
      media.style.setProperty('--card-y', `${y}px`);
      media.style.setProperty('--card-tilt', `${tilt}deg`);
    }, { passive: true });
    media.addEventListener('pointerleave', () => media.classList.remove('is-liquid'));
  });

  /* ---------- Горизонтальний перегляд кейсу ---------- */
  const caseViewer = $('#caseViewer');
  const caseMedia = $('[data-case-media]');
  const caseTitle = $('[data-case-title]');
  const caseDescription = $('[data-case-description]');
  const caseLink = $('[data-case-link]');
  const caseTrack = $('[data-case-track]');
  const caseProgress = $('[data-case-progress]');
  const caseAbout = $('[data-case-about]');
  const caseLoader = $('.case-loader');
  const caseLoaderTitle = $('[data-case-loader-title]');
  let caseOpenTimer = 0;
  const localGalleries = {
    'Creative Portfolio 2026': ['img/cover-portfolio.png', 'img/cover-aura.jpg', 'img/cover-biveris.jpg'],
    'BIVERIS Skin Lab': ['img/cover-biveris.jpg', 'img/cover-synq.jpg'],
    'AURA PUFFER': ['img/cover-aura.jpg', 'img/cover-magazine.jpg'],
    'SYNQ Loft Bar': ['img/cover-synq.jpg', 'img/cover-portfolio.png'],
    'Sweet Fashion Magazine': ['img/cover-magazine.jpg', 'img/cover-aura.jpg'],
    'Taxi Website': ['img/cover-portfolio.png', 'img/cover-synq.jpg'],
    'Video & Motion': ['img/hero-loop.mp4', 'img/motion-loop.mp4']
  };
  const caseDescriptions = {
    'Creative Portfolio 2026': 'A focused collection of visual identities, digital experiences and social direction.',
    'BIVERIS Skin Lab': 'A precise visual system built around clarity, trust and a considered digital experience.',
    'AURA PUFFER': 'A fashion-led visual direction with bold image-making and a strong editorial rhythm.',
    'SYNQ Loft Bar': 'A distinctive identity concept shaped for an atmospheric hospitality brand.',
    'Sweet Fashion Magazine': 'Editorial composition, typography and image direction brought into one visual language.',
    'Taxi Website': 'A clear digital concept designed to make the journey simple and memorable.',
    'Video & Motion': 'Short-form motion studies and visual experiments for social-first storytelling.'
  };
  const closeCase = () => {
    clearTimeout(caseOpenTimer);
    if (caseViewer && caseViewer.open) caseViewer.close();
    caseLoader?.classList.remove('is-active');
    document.body.classList.remove('is-locked');
  };
  $$('[data-case]').forEach(card => card.addEventListener('click', event => {
    if (!caseViewer || !caseMedia || !caseTitle) return;
    event.preventDefault();
    const title = card.dataset.case;
    const sources = localGalleries[title] || [$('.card__img', card)?.src];
    caseMedia.replaceChildren(...sources.filter(Boolean).map(source => {
      const isVideo = /\.mp4$/i.test(source);
      const media = document.createElement(isVideo ? 'video' : 'img');
      media.src = source;
      media.alt = `${title} project preview`;
      if (isVideo) {
        media.muted = true;
        media.loop = true;
        media.autoplay = true;
        media.playsInline = true;
      }
      return media;
    }));
    caseTitle.textContent = title;
    caseDescription.textContent = caseDescriptions[title] || '';
    caseLink.href = card.href;
    if (caseLoader && caseLoaderTitle) {
      caseLoaderTitle.textContent = card.dataset.case;
      caseLoader.classList.add('is-active');
    }
    document.body.classList.add('is-locked');
    caseOpenTimer = setTimeout(() => {
      caseViewer.showModal();
      caseTrack.scrollTo({ left: 0, behavior: 'instant' });
      caseProgress.textContent = '0%';
      setTimeout(() => caseLoader?.classList.remove('is-active'), 240);
    }, 620);
  }));
  caseTrack?.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    caseTrack.scrollLeft += event.deltaY;
  }, { passive: false });
  caseTrack?.addEventListener('scroll', () => {
    const max = caseTrack.scrollWidth - caseTrack.clientWidth;
    const progress = max > 0 ? Math.round((caseTrack.scrollLeft / max) * 100) : 100;
    if (caseProgress) caseProgress.textContent = `${progress}%`;
  }, { passive: true });
  caseAbout?.addEventListener('click', () => caseDescription?.classList.toggle('is-expanded'));

  /* ---------- Фокус послуг під час скролу ---------- */
  const serviceRows = $$('.svc__row');
  const focusService = () => {
    const target = innerHeight * .48;
    let closest = null;
    let distance = Infinity;
    serviceRows.forEach(row => {
      const rowDistance = Math.abs(row.getBoundingClientRect().top + row.offsetHeight / 2 - target);
      if (rowDistance < distance) {
        closest = row;
        distance = rowDistance;
      }
    });
    serviceRows.forEach(row => row.classList.toggle('is-focus', row === closest));
  };
  addEventListener('scroll', focusService, { passive: true });
  addEventListener('resize', focusService);
  requestAnimationFrame(focusService);

  $('[data-case-close]')?.addEventListener('click', closeCase);
  caseViewer?.addEventListener('click', event => {
    if (event.target === caseViewer) closeCase();
  });
  addEventListener('keydown', event => { if (event.key === 'Escape') closeCase(); });

  /* ---------- Rok w stopce ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
