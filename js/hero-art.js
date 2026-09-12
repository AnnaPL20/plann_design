/* =============================================================================
   PLANN Design — rozkolorowanka w sekcji hero
   Monogram PA rysowany na canvasie w dwoch warstwach: cienki kontur i warstwa
   kolorowa, ktora odslania sie tam, gdzie przejdzie kursor (albo palec).
   Zamalowane miejsca zostaja — maska w osobnym canvasie tylko przyrasta.
   Bez bibliotek, ksztalty wziete z img/logo-pa-dark.svg.
   ============================================================================= */
(() => {
  'use strict';

  const canvas = document.querySelector('[data-hero-art]');
  if (!canvas || !canvas.getContext) return;

  const hero = canvas.closest('.hero');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  /* Sciezki monogramu PA — identyczne jak w pliku SVG loga */
  const D = [
    'M687.04,456.1v36.37c0,18.04-4.4,31.63-13.09,40.39-8.63,8.79-22.29,13.26-40.55,13.26h-220.62v50.32h-63.61v-140.34c0-18,4.4-31.59,13.07-40.39,8.68-8.79,22.33-13.25,40.57-13.25h230.59c18.24,0,31.89,4.46,40.57,13.25,8.67,8.8,13.07,22.39,13.07,40.39Z',
    'M1040.35,456.1v140.34h-63.63v-50.66h-210.62v50.66h-63.62v-140.34c0-18,4.4-31.59,13.07-40.39,8.7-8.8,22.34-13.25,40.55-13.25h230.28c18.46,0,32.21,4.46,40.89,13.25,8.68,8.81,13.08,22.4,13.08,40.39Z'
  ];
  const PATHS = D.map(d => new Path2D(d));
  /* Prostokat obejmujacy oba znaki w ukladzie wspolrzednych pliku SVG */
  const BOX = { x: 349.17, y: 402.45, w: 691.18, h: 193.99 };

  const ctx = canvas.getContext('2d');
  const tmp = document.createElement('canvas');   // warstwa kolorowa po maskowaniu
  const tctx = tmp.getContext('2d');
  const mask = document.createElement('canvas');  // maska pedzla, mniejsza rozdzielczosc
  const mctx = mask.getContext('2d');

  const MASK_SCALE = 0.45;  // maska to miekkie plamy, nie potrzebuje pelnej rozdzielczosci
  let scale = 1, tx = 0, ty = 0, dpr = 1;
  let dirty = true;
  let painted = false;     // czy uzytkownik zaczal juz malowac

  const themeColors = () => {
    const cs = getComputedStyle(document.documentElement);
    const accent = (cs.getPropertyValue('--t-accent') || '').trim() || '#ff3d2e';
    const fg = getComputedStyle(document.body).color || '#0b0b0c';
    return { accent, fg };
  };

  /* ---------- Rozmiar i dopasowanie znaku ---------- */
  const fit = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    dpr = Math.min(devicePixelRatio || 1, 1.75);

    /* Zachowujemy dotychczasowe malowanie przy zmianie rozmiaru okna */
    const old = mask.width ? document.createElement('canvas') : null;
    if (old) {
      old.width = mask.width;
      old.height = mask.height;
      old.getContext('2d').drawImage(mask, 0, 0);
    }

    canvas.width = tmp.width = Math.round(r.width * dpr);
    canvas.height = tmp.height = Math.round(r.height * dpr);
    mask.width = Math.max(2, Math.round(canvas.width * MASK_SCALE));
    mask.height = Math.max(2, Math.round(canvas.height * MASK_SCALE));
    if (old) mctx.drawImage(old, 0, 0, mask.width, mask.height);

    /* Znak zajmuje wiekszosc kadru, ale nie dotyka krawedzi */
    const fill = r.width < 760 ? 0.94 : 0.82;
    scale = Math.min((canvas.width * fill) / BOX.w, (canvas.height * 0.62) / BOX.h);
    tx = (canvas.width - BOX.w * scale) / 2 - BOX.x * scale;
    ty = (canvas.height - BOX.h * scale) / 2 - BOX.y * scale;
    dirty = true;
    return true;
  };

  /* ---------- Rysowanie klatki ---------- */
  const render = () => {
    const { accent, fg } = themeColors();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Warstwa 1: kontur */
    ctx.setTransform(scale, 0, 0, scale, tx, ty);
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1.3, 2 * dpr) / scale;
    ctx.strokeStyle = fg;
    ctx.globalAlpha = 0.38;
    PATHS.forEach(p => ctx.stroke(p));
    ctx.globalAlpha = 1;

    /* Warstwa 2: kolor przycinany maska pedzla */
    tctx.setTransform(1, 0, 0, 1, 0, 0);
    tctx.clearRect(0, 0, tmp.width, tmp.height);
    tctx.setTransform(scale, 0, 0, scale, tx, ty);
    tctx.fillStyle = accent;
    tctx.strokeStyle = accent;
    tctx.lineJoin = 'round';
    tctx.lineWidth = Math.max(1.1, 1.6 * dpr) / scale;
    PATHS.forEach(p => { tctx.fill(p); tctx.stroke(p); });

    tctx.setTransform(1, 0, 0, 1, 0, 0);
    tctx.globalCompositeOperation = 'destination-in';
    tctx.drawImage(mask, 0, 0, tmp.width, tmp.height);
    tctx.globalCompositeOperation = 'source-over';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.88;
    ctx.drawImage(tmp, 0, 0);
    ctx.globalAlpha = 1;
  };

  let frame = 0;
  const loop = () => {
    frame = 0;
    if (dirty) { dirty = false; render(); }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(loop); };

  /* ---------- Pedzel ---------- */
  const brush = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = ((clientX - r.left) / r.width) * mask.width;
    const y = ((clientY - r.top) / r.height) * mask.height;
    if (x < -40 || y < -40 || x > mask.width + 40 || y > mask.height + 40) return;

    const rad = Math.max(mask.width, mask.height) * 0.05;
    const g = mctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.55, 'rgba(0,0,0,.82)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g;
    mctx.beginPath();
    mctx.arc(x, y, rad, 0, Math.PI * 2);
    mctx.fill();
    painted = true;
    dirty = true;
    schedule();
  };

  /* ---------- Jednorazowe automatyczne rozkolorowanie od lewej do prawej ---------- */
  const autoPaint = () => {
    if (painted) return;
    if (reduceMotion) {
      mctx.fillStyle = '#000';
      mctx.fillRect(0, 0, mask.width, mask.height);
      dirty = true;
      schedule();
      return;
    }
    const DURATION = 2800;
    const t0 = performance.now();
    const soft = mask.width * 0.2;
    const step = now => {
      if (painted) return;             // gdy uzytkownik przejmie pedzel, automat ustepuje
      const p = Math.min((now - t0) / DURATION, 1);
      const edge = mask.width * p;
      const g = mctx.createLinearGradient(edge - soft, 0, edge, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      mctx.fillStyle = g;
      mctx.fillRect(0, 0, Math.max(0, edge), mask.height);
      dirty = true;
      schedule();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Start ---------- */
  if (!fit()) requestAnimationFrame(fit);
  schedule();

  addEventListener('resize', () => { fit(); schedule(); }, { passive: true });

  if (hero) {
    hero.addEventListener('pointermove', e => brush(e.clientX, e.clientY), { passive: true });
    hero.addEventListener('pointerdown', e => brush(e.clientX, e.clientY), { passive: true });
  }

  /* Bez myszy (dotyk) albo przy ograniczonym ruchu znak maluje sie sam */
  if (!finePointer || reduceMotion) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          io.disconnect();
          setTimeout(autoPaint, 500);
        });
      }, { threshold: 0.2 });
      io.observe(canvas);
    } else {
      setTimeout(autoPaint, 700);
    }
  }

  /* Zmiana motywu — kolory liczone sa na nowo */
  new MutationObserver(() => { dirty = true; schedule(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
