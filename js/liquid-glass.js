/* =============================================================================
   PLANN Design — Liquid Glass (iOS 26): refrakcja i ruch kropel (02.10.2026)
   Wedlug opisu wlascicielki. Bez bibliotek.
   1. Refrakcja: mapa przesuniec rysowana na canvas (srodek neutralny
      0x80/0x80, do krawedzi radialnie rosnace przesuniecie w kanalach R i G),
      wpieta jako feImage + feDisplacementMap (scale 40, przy nacisnieciu 70)
      i uzyta w backdrop-filter: url(#lg-refract). Dziala w Chrome i Edge;
      tam, gdzie backdrop-filter nie przyjmuje filtra SVG, zostaje reszta
      warstw bez wygiecia (html bez klasy lg-refract).
   2. Ruch: wlasna sprezyna w requestAnimationFrame (stiffness ~400,
      damping ~22). Hover: blik-obwodka obraca sie za kursorem, krople
      lekko rosnie (1.02). Nacisniecie: 1.10 w ~160 ms, swiatlo w punkcie
      dotyku, mocniejsza refrakcja. Przytrzymanie i ruch: krople ciagnie sie
      za palcem (do 4 px, scaleX 1.06 / scaleY .96). Puszczenie: sprezyste
      wrocenie z jednym-dwoma zanikajacymi drganiami. Zadnych fal (ripple).
   3. Przelacznik jezyka: kropla przeplywa miedzy pozycjami, po drodze
      rozciaga sie (scaleX do 1.25 w polowie drogi) i sprezyscie siada.
   4. prefers-reduced-motion: tylko zmiana jasnosci (klasa is-pressed), bez ruchu.
   ============================================================================= */
(() => {
  'use strict';

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const root = document.documentElement;

  /* ---------- 1. Mapa przesuniec i filtry SVG ---------- */
  const buildMap = size => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);
    const d = img.data;
    const mid = (size - 1) / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = (x - mid) / mid;
        const ny = (y - mid) / mid;
        const r = Math.min(1, Math.hypot(nx, ny));
        /* W srodku nic, przy krawedzi pelne wygiecie — jak gruba kropla wody */
        const k = r * r * r;
        const ux = r ? nx / r : 0;
        const uy = r ? ny / r : 0;
        const i = (y * size + x) * 4;
        d[i] = Math.round(128 + ux * k * 127);
        d[i + 1] = Math.round(128 + uy * k * 127);
        d[i + 2] = 128;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  };

  const supportsRefract = () => {
    const probe = 'url(#lg-probe) blur(1px)';
    const ok = (CSS.supports && (CSS.supports('backdrop-filter', probe) || CSS.supports('-webkit-backdrop-filter', probe)));
    /* Safari deklaruje wsparcie, ale filtra SVG w backdrop-filter nie rysuje */
    const safari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
    return Boolean(ok) && !safari;
  };

  if (supportsRefract()) {
    const href = buildMap(256);
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    const filter = (id, scale) => {
      const f = document.createElementNS(NS, 'filter');
      f.setAttribute('id', id);
      f.setAttribute('x', '0'); f.setAttribute('y', '0');
      f.setAttribute('width', '1'); f.setAttribute('height', '1');
      f.setAttribute('filterUnits', 'objectBoundingBox');
      f.setAttribute('primitiveUnits', 'objectBoundingBox');
      f.setAttribute('color-interpolation-filters', 'sRGB');
      const im = document.createElementNS(NS, 'feImage');
      im.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
      im.setAttribute('href', href);
      im.setAttribute('x', '0'); im.setAttribute('y', '0');
      im.setAttribute('width', '1'); im.setAttribute('height', '1');
      im.setAttribute('preserveAspectRatio', 'none');
      im.setAttribute('result', 'map');
      const dm = document.createElementNS(NS, 'feDisplacementMap');
      dm.setAttribute('in', 'SourceGraphic');
      dm.setAttribute('in2', 'map');
      /* primitiveUnits=objectBoundingBox: scale liczy sie w ulamku szerokosci —
         40 px na kropli ~ 48-120 px to okolo 0.35 */
      dm.setAttribute('scale', String(scale));
      dm.setAttribute('xChannelSelector', 'R');
      dm.setAttribute('yChannelSelector', 'G');
      f.append(im, dm);
      return f;
    };
    svg.append(filter('lg-refract', .35), filter('lg-refract-strong', .6));
    document.body.prepend(svg);
    root.classList.add('lg-refract');
  }

  /* ---------- 2. Sprezyna ---------- */
  const spring = (k, c) => ({ k, c, x: 0, v: 0, t: 0, set(x) { this.x = x; this.t = x; this.v = 0; } });
  const stepSpring = (s, dt) => {
    const a = -s.k * (s.x - s.t) - s.c * s.v;
    s.v += a * dt;
    s.x += s.v * dt;
    if (Math.abs(s.v) < .002 && Math.abs(s.x - s.t) < .0005) { s.x = s.t; s.v = 0; return false; }
    return true;
  };

  const drops = new Map();
  let raf = 0;
  let last = 0;

  const state = el => {
    let s = drops.get(el);
    if (!s) {
      s = {
        el,
        scale: spring(400, 22),
        sx: spring(400, 22),
        sy: spring(400, 22),
        dx: spring(400, 22),
        dy: spring(400, 22),
        pressed: false,
        hover: false,
        px: 0, py: 0,
      };
      s.scale.set(1); s.sx.set(1); s.sy.set(1); s.dx.set(0); s.dy.set(0);
      drops.set(el, s);
    }
    return s;
  };

  const paint = s => {
    const st = s.el.style;
    st.setProperty('--lg-sx', (s.scale.x * s.sx.x).toFixed(4));
    st.setProperty('--lg-sy', (s.scale.x * s.sy.x).toFixed(4));
    st.setProperty('--lg-dx', s.dx.x.toFixed(2) + 'px');
    st.setProperty('--lg-dy', s.dy.x.toFixed(2) + 'px');
  };

  const tick = now => {
    raf = 0;
    const dt = Math.min((now - (last || now)) / 1000, .04);
    last = now;
    let alive = false;
    drops.forEach(s => {
      let moving = false;
      moving = stepSpring(s.scale, dt) || moving;
      moving = stepSpring(s.sx, dt) || moving;
      moving = stepSpring(s.sy, dt) || moving;
      moving = stepSpring(s.dx, dt) || moving;
      moving = stepSpring(s.dy, dt) || moving;
      paint(s);
      if (moving) alive = true;
    });
    if (alive) raf = requestAnimationFrame(tick); else last = 0;
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const targets = s => {
    s.scale.t = s.pressed ? 1.10 : (s.hover ? 1.02 : 1);
    if (!s.pressed) { s.sx.t = 1; s.sy.t = 1; s.dx.t = 0; s.dy.t = 0; }
    wake();
  };

  /* Nacisniecie ma dojsc do celu w ~160 ms — na ten czas sprezyna jest sztywniejsza */
  const press = (s, event) => {
    s.pressed = true;
    s.el.classList.add('is-pressed');
    const r = s.el.getBoundingClientRect();
    s.px = event.clientX; s.py = event.clientY;
    s.el.style.setProperty('--lg-px', (((event.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
    s.el.style.setProperty('--lg-py', (((event.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    s.el.style.setProperty('--lg-press', '1');
    s.scale.k = 700; s.scale.c = 34;
    targets(s);
  };

  const drag = (s, event) => {
    const dx = Math.max(-4, Math.min(4, (event.clientX - s.px) * .25));
    const dy = Math.max(-4, Math.min(4, (event.clientY - s.py) * .25));
    s.dx.t = dx; s.dy.t = dy;
    const along = Math.abs(dx) >= Math.abs(dy);
    s.sx.t = along ? 1.06 : .96;
    s.sy.t = along ? .96 : 1.06;
    wake();
  };

  const release = s => {
    if (!s.pressed) return;
    s.pressed = false;
    s.el.classList.remove('is-pressed');
    s.el.style.setProperty('--lg-press', '0');
    s.scale.k = 400; s.scale.c = 22;
    targets(s);
  };

  /* Blik-obwodka obraca sie za kursorem: kat liczony od srodka kropli */
  const aim = (s, event) => {
    const r = s.el.getBoundingClientRect();
    const a = Math.atan2(event.clientY - (r.top + r.height / 2), event.clientX - (r.left + r.width / 2));
    s.el.style.setProperty('--lg-angle', (a * 180 / Math.PI + 90 + 45).toFixed(1) + 'deg');
  };

  const bind = el => {
    const s = state(el);
    if (calm) {
      el.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
      const off = () => el.classList.remove('is-pressed');
      el.addEventListener('pointerup', off);
      el.addEventListener('pointercancel', off);
      el.addEventListener('pointerleave', off);
      return;
    }
    if (fine) {
      el.addEventListener('pointerenter', () => { s.hover = true; targets(s); });
      el.addEventListener('pointerleave', () => { s.hover = false; if (!s.pressed) targets(s); });
    }
    el.addEventListener('pointermove', event => {
      if (fine) aim(s, event);
      if (s.pressed) drag(s, event);
    });
    el.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      try { el.setPointerCapture(event.pointerId); } catch (e) { /* bez przechwytywania tez dziala */ }
      press(s, event);
    });
    const up = () => release(s);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
  };

  /* ---------- 3. Przelacznik jezyka ---------- */
  const bindSwitch = group => {
    const btns = Array.from(group.querySelectorAll('.lg-switch__btn, .lang__btn'));
    if (!btns.length) return;
    let blob = group.querySelector('.lg-switch__blob');
    if (!blob) {
      blob = document.createElement('span');
      blob.className = 'lg-switch__blob';
      blob.setAttribute('aria-hidden', 'true');
      group.prepend(blob);
    }
    const pos = spring(380, 20);
    const stretch = spring(500, 24);
    let from = 0, to = 0, w = 48, running = 0;

    const measure = btn => {
      const g = group.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      return { x: b.left - g.left - 4, w: b.width };
    };
    const paintBlob = () => {
      const span = Math.abs(to - from) || 1;
      const p = Math.min(1, Math.max(0, (pos.x - Math.min(from, to)) / span));
      /* W polowie drogi kropla jest najbardziej rozciagnieta */
      const sx = 1 + .25 * Math.sin(Math.PI * p) * (from === to ? 0 : 1);
      blob.style.setProperty('--x', pos.x.toFixed(2) + 'px');
      blob.style.setProperty('--w', w.toFixed(1) + 'px');
      blob.style.setProperty('--sx', (sx * stretch.x).toFixed(4));
      blob.style.setProperty('--sy', (2 - stretch.x).toFixed(4));
    };
    const loop = now => {
      running = 0;
      const dt = Math.min((now - (loop.last || now)) / 1000, .04);
      loop.last = now;
      const a = stepSpring(pos, dt);
      const b = stepSpring(stretch, dt);
      paintBlob();
      if (a || b) running = requestAnimationFrame(loop); else loop.last = 0;
    };
    const go = (btn, instant) => {
      btns.forEach(b => b.classList.toggle('is-active', b === btn));
      const m = measure(btn);
      w = m.w;
      from = pos.x;
      to = m.x;
      pos.t = m.x;
      stretch.t = 1;
      if (instant || calm) { pos.set(m.x); stretch.set(1); from = to; paintBlob(); return; }
      /* Lekki impuls: kropla "odbija sie" od miejsca, w ktorym siada */
      stretch.x = 1; stretch.v = .9;
      if (!running) running = requestAnimationFrame(loop);
    };
    btns.forEach(b => b.addEventListener('click', () => go(b)));
    const active = btns.find(b => b.classList.contains('is-active')) || btns[0];
    go(active, true);
    /* Przelacznik jezyka serwisu: klase is-active ustawia script.js — kropla jedzie za nia */
    if ('MutationObserver' in window) {
      new MutationObserver(() => {
        const now = btns.find(b => b.classList.contains('is-active'));
        if (now && now !== (go.current || active)) { go.current = now; go(now); }
      }).observe(group, { attributes: true, attributeFilter: ['class'], subtree: true });
    }
    addEventListener('resize', () => go(btns.find(b => b.classList.contains('is-active')) || btns[0], true), { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => go(btns.find(b => b.classList.contains('is-active')) || btns[0], true));
  };

  /* Klasy serwisu, ktore sa kroplami (css/liquid-glass.css, czesc "mapowanie") */
  const DROP = '.lg:not(.lg-switch), .btn, .chip, .socialbtn, .menu__pill, .totop, .burger';
  const SWITCH = '.lg-switch, .lang';
  const bound = new WeakSet();

  const init = scope => {
    scope.querySelectorAll(DROP).forEach(el => {
      if (el.closest(SWITCH) || drops.has(el)) return;
      bind(el);
    });
    scope.querySelectorAll(SWITCH).forEach(group => {
      if (bound.has(group)) return;
      bound.add(group);
      bindSwitch(group);
    });
  };
  init(document);
  /* Sklep i lejek buduja przyciski w JS — nowe krople podpinamy same */
  if ('MutationObserver' in window) {
    let pending = 0;
    new MutationObserver(() => {
      if (pending) return;
      pending = setTimeout(() => { pending = 0; init(document); }, 60);
    }).observe(document.body, { childList: true, subtree: true });
  }
  window.PLANN_LG = { init };
})();
