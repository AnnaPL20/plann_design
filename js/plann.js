/* =============================================================================
   PLANN design — strona glowna (09.10.2026)
   Kula z kart prac (Three.js, lokalnie z js/vendor), napis z kropek (logo
   z maski SVG, potem slowa web / branding / plan), tekst w rogach z efektem
   "scramble", loader 00 -> 100, wlasny kursor, podglad projektu z czarnym
   ekranem i znakiem PA. Zadnego dzwieku. Bez bibliotek poza Three.js.
   Teksty: js/i18n.js (EN / UA / PL), klucze "ui.*", "sl*.*", "case.*".
   ============================================================================= */
import {
  WebGLRenderer, Scene, FogExp2, PerspectiveCamera, TextureLoader, PlaneGeometry,
  MeshBasicMaterial, Mesh, Vector3, Vector2, Raycaster, SRGBColorSpace, FrontSide,
} from './vendor/three.module.min.js';

/* ===== Prace: zoptymalizowane kadry z img/work (dluzszy bok 1200 px) ===== */
const IMGS = [
  { p: 'web', proj: 'nis', w: 1080, h: 1344, src: 'img/work/1.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/2.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/3.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/4.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/5.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/6.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/7.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/8.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/9.jpg' },
  { p: 'web', proj: 'nis', w: 1080, h: 1350, src: 'img/work/10.jpg' },
  { p: 'brand', proj: 'portfolio', w: 1400, h: 562, src: 'img/work/cover-portfolio.jpg' },
  { p: 'brand', proj: 'biveris', w: 1023, h: 1537, src: 'img/work/cover-biveris.jpg' },
  { p: 'brand', proj: 'synq', w: 736, h: 920, src: 'img/work/cover-synq.jpg' },
  { p: 'social', proj: 'aura', w: 1023, h: 1537, src: 'img/work/cover-aura.jpg' },
  { p: 'social', proj: 'magazine', w: 1600, h: 914, src: 'img/work/cover-magazine.jpg' },
];

/* Projekty do podgladu: nazwa, odnosnik, opis (klucz slownika) i kadry */
const PROJ = {
  nis:       { name: 'Nothing is seen',        link: 'https://www.behance.net/pl_annetka', desc: 'pj.nis',       year: '2026' },
  portfolio: { name: 'Creative Portfolio 2026', link: 'https://www.behance.net/gallery/247999533/Creative-Portfolio-2026-Branding-Web-Social-Media', desc: 'pj.portfolio', year: '2026' },
  biveris:   { name: 'BIVERIS Skin Lab',        link: 'https://www.behance.net/gallery/239621207/BIVERIS-Skin-Lab-Clinical-Brand-Identity-UX-System', desc: 'pj.biveris', year: '2025' },
  synq:      { name: 'SYNQ Loft Bar',           link: 'https://www.behance.net/gallery/230004703/Logo-and-brand-identity-for-a-Loft-bar-SYNQ', desc: 'pj.synq', year: '2024' },
  aura:      { name: 'AURA PUFFER',             link: 'https://www.behance.net/gallery/237225941/AURA-PUFFER-Fashion-Banner-Series', desc: 'pj.aura', year: '2025' },
  magazine:  { name: 'Sweet Fashion Magazine',  link: 'https://www.behance.net/gallery/195214865/Magazine-Sweet-Fashion', desc: 'pj.magazine', year: '2024' },
};

/* Slajdy napisu z kropek. Pierwszy to logo z pliku SVG, dalej slowa.
   Zeby zmienic slowa, wystarczy podmienic pole "word" (i teksty w slowniku).
   "filter" wskazuje, ktore karty na kuli sa podswietlone. */
const SLIDES = [
  { word: 'PLANN', logo: 'img/logo-pa-white.svg', filter: null,    list: 'sl0.list', desc: 'sl0.desc' },
  { word: 'web',      filter: 'web',    list: 'sl1.list', desc: 'sl1.desc' },
  { word: 'branding', filter: 'brand',  list: 'sl2.list', desc: 'sl2.desc' },
  { word: 'plan',     filter: 'social', list: 'sl3.list', desc: 'sl3.desc' },
];
const SLIDE_MS = 4600;   /* ile trwa jedno slowo */

/* ===== Slownik ===== */
const DICT = window.PLANN_DICT || { en: {} };
const store = {
  get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* tryb prywatny */ } },
};
let lang = store.get('plann-lang') || 'en';
if (!DICT[lang]) lang = 'en';
const t = key => (DICT[lang] && DICT[lang][key]) ?? DICT.en[key] ?? '';
const applyI18n = () => {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
};

const isTouch = matchMedia('(hover: none)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = x => 1 - Math.pow(1 - x, 4);

/* ===== Mysz ===== */
const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, in: false };
let down = false, dragDist = 0, lx = 0, ly = 0;

/* ===== Three.js: kula z kart ===== */
const cv = document.getElementById('gl');
const renderer = new WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = SRGBColorSpace;
renderer.setClearColor(0x050506, 1);
const scene = new Scene();
scene.fog = new FogExp2(0x050506, 0.035);
const camera = new PerspectiveCamera(78, innerWidth / innerHeight, 0.1, 100);
camera.rotation.order = 'YXZ';

const R = 11;
const cards = [];
const textures = [];
let loaded = 0;
const ldn = document.getElementById('ldn'), ldb = document.getElementById('ldb');
const loader = new TextureLoader();
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const texPromises = IMGS.map((im, i) => new Promise(res => {
  loader.load(im.src, tx => {
    tx.colorSpace = SRGBColorSpace;
    tx.anisotropy = Math.min(8, maxAniso);
    textures[i] = tx; loaded++;
    const p = Math.round(loaded / IMGS.length * 100);
    ldn.textContent = String(p).padStart(2, '0'); ldb.style.width = p + '%';
    res();
  }, undefined, () => { loaded++; res(); });
}));

/* Generator losowy z ziarnem, zeby uklad kart byl zawsze ten sam */
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function buildSphere() {
  const geos = IMGS.map(im => {
    const asp = im.w / im.h, A = 3.3;
    return new PlaneGeometry(Math.sqrt(A * asp), Math.sqrt(A / asp));
  });
  const rows = 9, eMin = -66, eMax = 66;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const e = (eMin + (eMax - eMin) * r / (rows - 1)) * Math.PI / 180;
    const n = Math.max(5, Math.floor(2 * Math.PI * R * Math.cos(e) / 3.05));
    const off = rnd() * Math.PI * 2;
    for (let k = 0; k < n; k++) {
      if (rnd() < .14) continue;             /* puste miejsca dla oddechu */
      const th = off + k / n * Math.PI * 2 + (rnd() - .5) * .12;
      const el = e + (rnd() - .5) * .06;
      const dir = new Vector3(Math.cos(el) * Math.sin(th), Math.sin(el), Math.cos(el) * Math.cos(th));
      const ii = (idx * 7 + r * 3) % IMGS.length; idx++;
      const mat = new MeshBasicMaterial({ map: textures[ii] || null, transparent: true, opacity: 0, side: FrontSide });
      const m = new Mesh(geos[ii], mat);
      const s = .82 + rnd() * .38;
      m.userData = { dir, ii, s, roll: (rnd() - .5) * .22, k: 3.2, hov: 0, dim: 1, delay: rnd() * 1.1, ph: rnd() * 6.28 };
      m.position.copy(dir).multiplyScalar(R * 3.2);
      m.lookAt(0, 0, 0); m.rotateZ(m.userData.roll);
      m.scale.setScalar(s);
      scene.add(m); cards.push(m);
    }
  }
}

/* ===== Kamera ===== */
let yaw = 0, pitch = 0, tYaw = 0, tPitch = 0, fov = 96, tFov = 78, yawVel = 0;
let started = false, t0 = 0;
const ray = new Raycaster(), ndc = new Vector2();
let hovered = null;
const fwd = new Vector3();

function centerOn(m) {
  const d = m.userData.dir;
  const y = Math.atan2(-d.x, -d.z);
  tYaw = y + Math.PI * 2 * Math.round((yaw - y) / (Math.PI * 2));
  tPitch = clamp(Math.asin(d.y) * .85, -.7, .7);
}

function tick(now) {
  requestAnimationFrame(tick);
  const tt = now / 1000;
  if (started) {
    const el = tt - t0;
    if (!down) {
      tYaw -= 0.0009;                       /* powolny obrot wlasny */
      if (mouse.in && !isTouch && !lbOpen) {
        const dz = Math.abs(mouse.nx) > .18 ? mouse.nx - .18 * Math.sign(mouse.nx) : 0;
        yawVel = lerp(yawVel, -dz * 0.018, .05);
        tPitch = clamp(lerp(tPitch, mouse.ny * .38, .02), -.7, .7);
      } else yawVel *= .95;
      tYaw += yawVel;
    }
    yaw = lerp(yaw, tYaw, .06); pitch = lerp(pitch, tPitch, .06);
    fov = lerp(fov, tFov, .05);
    camera.rotation.set(pitch, yaw, Math.sin(tt * .3) * .015);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.getWorldDirection(fwd);

    /* najechanie przez raycast */
    if (!isTouch && !down && !lbOpen && mouse.in) {
      ndc.set(mouse.x / innerWidth * 2 - 1, -(mouse.y / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(cards, false)[0];
      const h = hit && hit.object.material.opacity > .5 ? hit.object : null;
      if (h !== hovered) { hovered = h; setCursor(h ? 'view' : ''); }
    }

    const filt = SLIDES[slide].filter;
    for (const m of cards) {
      const u = m.userData;
      const p = clamp((el - u.delay) / 1.6, 0, 1), e = easeOut(p);
      const tk = 1 + (hovered === m ? -.07 : 0) + Math.sin(tt * .7 + u.ph) * .012;
      u.k = lerp(3.2, tk, e);
      u.hov = lerp(u.hov, hovered === m ? 1 : 0, .12);
      const match = !filt || IMGS[u.ii].p === filt;
      u.dim = lerp(u.dim, match ? 1 : .14, .06);
      m.position.copy(u.dir).multiplyScalar(R * u.k);
      m.scale.setScalar(u.s * (1 + u.hov * .16));
      const dt = u.dir.dot(fwd);
      const b = clamp((dt + .15) / 1.05, 0, 1);
      const br = (.22 + .78 * b * b) * u.dim + u.hov * .25;
      m.material.color.setScalar(Math.min(1, br));
      m.material.opacity = e;
    }
  }
  renderer.render(scene, camera);
  drawDots(tt);
}

/* ===== Napis z kropek ===== */
const dc = document.getElementById('dots'), dx = dc.getContext('2d');
let DW = 0, DH = 0, DPR = 1, cell = 10;
let parts = [], targets = {}, slide = 0;
const off = document.createElement('canvas'), ox = off.getContext('2d', { willReadFrequently: true });
let logoImg = null;   /* wczytane SVG logo — maska dla pierwszego slajdu */

function sizeDots() {
  DPR = Math.min(devicePixelRatio, 2);
  DW = innerWidth; DH = innerHeight;
  dc.width = DW * DPR; dc.height = DH * DPR;
  dx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
/* Szerokosc napisu: najdluzsze slowo zajmuje okolo 68% ekranu (90% na telefonie) */
function textWidth() { return Math.min(DW * (DW < 760 ? .9 : .68), 1100); }

function sampleCanvas(w, h, c, rs) {
  /* Zbiera cele kropek z plotna o rozmiarze w x h komorek; c = rozmiar komorki,
     rs = wzgledny promien kropki */
  const d = ox.getImageData(0, 0, w, h).data, out = [];
  const x0 = DW / 2 - w * c / 2, y0 = DH / 2 - h * c / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 110) out.push({ x: x0 + (x + .5) * c, y: y0 + (y + .5) * c, rs });
  }
  return out;
}
/* Rozmiar komorki liczymy raz, z najdluzszego slowa — inaczej logo (budowane
   jako pierwsze) dostawaloby komorke z poprzedniego ustawienia okna */
function recalcCell() {
  const maxLen = Math.max(...SLIDES.filter(s => !s.logo).map(s => s.word.length));
  cell = Math.max(5, textWidth() / (maxLen * 6.6));
}
function wordTargets(word) {
  const fs = 10.8;
  ox.font = `800 ${fs}px "JetBrains Mono", monospace`;
  const w = Math.ceil(ox.measureText(word).width) + 4, h = Math.ceil(fs * 1.4);
  off.width = w; off.height = h;
  ox.font = `800 ${fs}px "JetBrains Mono", monospace`;
  ox.fillStyle = '#fff'; ox.textBaseline = 'middle';
  ox.clearRect(0, 0, w, h); ox.fillText(word, 2, h / 2 + .5);
  return sampleCanvas(w, h, cell, 1);
}
function logoTargets() {
  /* Znak PA idzie na drobniejszej siatce (polowa komorki) — inaczej mialby
     kilka rzedow i nie dalo by sie go odczytac. Szerokosc i wysokosc sa
     ograniczone, zeby znak miescil sie w kadrze takze na niskim oknie. */
  const c = cell * .6;
  const ar = (logoImg.naturalWidth || 700) / (logoImg.naturalHeight || 202);
  let tw = Math.min(DW * (DW < 760 ? .66 : .4), 660);
  let th = tw / ar;
  const maxH = DH * .3;
  if (th > maxH) { th = maxH; tw = th * ar; }
  const w = Math.max(24, Math.round(tw / c));
  const h = Math.max(8, Math.round(th / c));
  off.width = w; off.height = h;
  ox.clearRect(0, 0, w, h);
  ox.drawImage(logoImg, 0, 0, w, h);
  return sampleCanvas(w, h, c, .78);
}
function buildTargets() {
  targets = {};
  recalcCell();
  SLIDES.forEach(s => { targets[s.word] = (s.logo && logoImg) ? logoTargets() : wordTargets(s.word); });
  const N = Math.max(...Object.values(targets).map(a => a.length));
  while (parts.length < N) {
    parts.push({ x: DW / 2 + (Math.random() - .5) * DW * 1.2, y: DH / 2 + (Math.random() - .5) * DH * 1.2, vx: 0, vy: 0, tx: 0, ty: 0, s: 0, ts: 0, rs: 1, trs: 1, h: 0, del: Math.random() * 1.2, tw: Math.random() * 6.28 });
  }
  assign(SLIDES[slide].word);
}
function assign(word) {
  const T = targets[word].slice();
  for (let i = T.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [T[i], T[j]] = [T[j], T[i]]; }
  parts.forEach((p, i) => {
    if (i < T.length) { p.tx = T[i].x; p.ty = T[i].y; p.ts = 1; p.trs = T[i].rs; }
    else { const a = Math.random() * 6.28, r = Math.max(DW, DH) * .6; p.tx = DW / 2 + Math.cos(a) * r * Math.random(); p.ty = DH / 2 + Math.sin(a) * r * Math.random() * .6; p.ts = 0; }
  });
}
let dotsOn = false, dotsT0 = 0;
function drawDots(tt) {
  dx.clearRect(0, 0, DW, DH);
  if (!dotsOn) return;
  const el = tt - dotsT0, rad = cell * .36, RR = Math.max(70, cell * 7);
  const mx = mouse.x, my = mouse.y, act = mouse.in && !lbOpen;
  dx.fillStyle = '#f6f2ee';
  dx.beginPath();
  const blue = [];
  /* 09.10.2026 (prosba wlascicielki): napis sklada sie z kwadracikow
     z lekko zaokraglonymi rogami, nie z kolek */
  const square = (x, y, r) => {
    const s = r * 1.78, k = Math.min(s * .3, 2.2);
    if (dx.roundRect) dx.roundRect(x - s / 2, y - s / 2, s, s, k);
    else dx.rect(x - s / 2, y - s / 2, s, s);
  };
  for (const p of parts) {
    if (el < p.del) continue;
    let fx = (p.tx - p.x) * .07, fy = (p.ty - p.y) * .07;
    if (act) {
      const ddx = p.x - mx, ddy = p.y - my, d2 = ddx * ddx + ddy * ddy;
      if (d2 < RR * RR) { const d = Math.sqrt(d2) || 1, f = (1 - d / RR) * cell * 1.6; fx += ddx / d * f; fy += ddy / d * f; p.h = 1; }
    }
    p.vx = (p.vx + fx) * .76; p.vy = (p.vy + fy) * .76;
    p.x += p.vx; p.y += p.vy;
    p.s = lerp(p.s, p.ts, .08);
    p.rs = lerp(p.rs, p.trs, .08);
    p.h *= .94;
    const tw = .85 + .15 * Math.sin(tt * 3 + p.tw);
    const r = rad * p.s * p.rs * tw;
    if (r < .3) continue;
    if (p.h > .15) { blue.push(p, r); continue; }
    square(p.x, p.y, r);
  }
  dx.fill();
  if (blue.length) {
    dx.fillStyle = '#bcd6e8'; dx.beginPath();
    for (let i = 0; i < blue.length; i += 2) square(blue[i].x, blue[i].y, blue[i + 1] * 1.1);
    dx.fill();
  }
}

/* ===== Tekst "scramble": litery przebieraja sie i skladaja w nowe slowo ===== */
const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function scramble(el, lines) {
  const total = 24; let f = 0;
  clearInterval(el._t);
  if (calm) { el.innerHTML = lines.map(esc).join('<br>'); return; }
  el._t = setInterval(() => {
    f++;
    el.innerHTML = lines.map(l => {
      let s = '';
      for (let i = 0; i < l.length; i++) {
        const rev = f > i * 0.6 + 4;
        s += (rev || l[i] === ' ') ? l[i] : CH[Math.random() * CH.length | 0];
      }
      return esc(s);
    }).join('<br>');
    if (f > total + lines.reduce((a, l) => Math.max(a, l.length), 0) * 0.6) { clearInterval(el._t); el.innerHTML = lines.map(esc).join('<br>'); }
  }, 34);
}

/* ===== Slajdy ===== */
const pag = document.getElementById('pag');
SLIDES.forEach((s, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', s.word); b.onclick = () => go(i); pag.appendChild(b); });
const $list = document.getElementById('list'), $desc = document.getElementById('desc');
let autoT = null;
const lines = key => t(key).split('|');
function go(i, silent) {
  slide = (i + SLIDES.length) % SLIDES.length;
  const s = SLIDES[slide];
  [...pag.children].forEach((b, k) => b.classList.toggle('on', k === slide));
  const lst = lines(s.list), dsc = lines(s.desc);
  scramble($list, lst); scramble($desc, dsc);
  if (parts.length) assign(s.word);
  if (s.filter) {
    let best = null, bd = -2;
    camera.getWorldDirection(fwd);
    for (const m of cards) { if (IMGS[m.userData.ii].p !== s.filter) continue; const d = m.userData.dir.dot(fwd); if (d > bd) { bd = d; best = m; } }
    if (best) centerOn(best);
  }
  clearTimeout(autoT); autoT = setTimeout(() => go(slide + 1, true), SLIDE_MS);
}
/* Strzalka "dalej" zdjeta 15.10.2026 na prosbe wlascicielki — slajdy
   przelaczaja sie same, kropkami u dolu i strzalkami na klawiaturze */

/* ===== Podglad projektu: czarny ekran ze znakiem, potem stega kadrow ===== */
const lb = document.getElementById('lb'), lbTrack = document.getElementById('lbTrack'), lbTitle = document.getElementById('lbTitle'),
  lbDesc = document.getElementById('lbDesc'), lbLink = document.getElementById('lbLink'), lbProg = document.getElementById('lbProg'),
  lbAbout = document.getElementById('lbAbout'), gate = document.getElementById('gate'), gateName = document.getElementById('gateName');
let lbOpen = false, gateT = 0;
function openProject(ii) {
  const im = IMGS[ii], pj = PROJ[im.proj];
  const frames = IMGS.filter(x => x.proj === im.proj);
  gateName.textContent = pj.name;
  gate.classList.add('on');
  setCursor(''); clearTimeout(autoT); lbOpen = true;
  clearTimeout(gateT);
  gateT = setTimeout(() => {
    lbTrack.replaceChildren(...frames.map(f => { const img = document.createElement('img'); img.src = f.src; img.alt = pj.name; return img; }));
    lbTitle.textContent = pj.name;
    lbDesc.textContent = t(pj.desc);
    lbDesc.classList.remove('open'); lbAbout.setAttribute('aria-expanded', 'false');
    lbLink.href = pj.link;
    lbProg.textContent = `${String(frames.length).padStart(2, '0')} ${t('ui.frames')} · ${pj.year}`;
    lbTrack.scrollTo({ left: 0, behavior: 'instant' });
    lb.classList.add('open');
    setTimeout(() => gate.classList.remove('on'), 260);
  }, 620);
}
function closeProject() { lb.classList.remove('open'); gate.classList.remove('on'); lbOpen = false; go(slide, true); }
document.getElementById('lbX').onclick = closeProject;
lbAbout.onclick = () => { const o = lbDesc.classList.toggle('open'); lbAbout.setAttribute('aria-expanded', String(o)); };
lb.addEventListener('click', e => { if (e.target === lb) closeProject(); });
lbTrack.addEventListener('wheel', e => { if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; e.preventDefault(); lbTrack.scrollLeft += e.deltaY; }, { passive: false });
addEventListener('keydown', e => {
  if (lbOpen) { if (e.key === 'Escape') closeProject(); }
  else { if (e.key === 'ArrowRight') go(slide + 1); if (e.key === 'ArrowLeft') go(slide - 1); }
});

/* ===== Kursor ===== */
const cur = document.getElementById('cur');
let cx = mouse.x, cy = mouse.y;
function setCursor(s) { cur.classList.toggle('view', s === 'view'); cur.classList.toggle('drag', s === 'drag'); }
(function cl() { cx = lerp(cx, mouse.x, .2); cy = lerp(cy, mouse.y, .2); cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(cl); })();

/* ===== Zdarzenia ===== */
function onUi(e) { return e.target.closest && e.target.closest('button, a, .lb, .lang'); }
addEventListener('pointermove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY; mouse.in = true;
  mouse.nx = e.clientX / innerWidth * 2 - 1; mouse.ny = e.clientY / innerHeight * 2 - 1;
  if (down) {
    const ddx = e.clientX - lx, ddy = e.clientY - ly;
    dragDist += Math.abs(ddx) + Math.abs(ddy);
    tYaw += ddx * .0042; tPitch = clamp(tPitch + ddy * .0034, -.7, .7);
    lx = e.clientX; ly = e.clientY;
    if (dragDist > 6) { setCursor('drag'); hovered = null; }
  }
});
document.addEventListener('pointerleave', () => { mouse.in = false; });
addEventListener('pointerdown', e => {
  if (onUi(e) || lbOpen) return;
  down = true; dragDist = 0; lx = e.clientX; ly = e.clientY; yawVel = 0;
  hideHint();
});
addEventListener('pointerup', e => {
  if (!down) return; down = false; setCursor('');
  if (dragDist < 6 && !onUi(e)) {
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(cards, false)[0];
    if (hit) openProject(hit.object.userData.ii);
  }
  if (isTouch) mouse.in = false;
});
addEventListener('wheel', e => { if (lbOpen) return; tFov = clamp(tFov + e.deltaY * .03, 52, 96); hideHint(); }, { passive: true });
let hintHidden = false;
function hideHint() { if (hintHidden) return; hintHidden = true; setTimeout(() => { document.getElementById('hint').style.opacity = 0; }, 2500); }

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  sizeDots(); buildTargets();
});

/* Jezyk: przelacznik w rogu; po zmianie teksty skladaja sie od nowa */
document.querySelectorAll('.lang button').forEach(b => b.onclick = () => {
  lang = b.dataset.lang; store.set('plann-lang', lang); applyI18n(); go(slide, true);
});

/* ===== Start ===== */
applyI18n();
renderer.setSize(innerWidth, innerHeight, false);
sizeDots();
requestAnimationFrame(tick);
const fontReady = (document.fonts && document.fonts.load)
  ? Promise.race([document.fonts.load('800 20px "JetBrains Mono"'), new Promise(r => setTimeout(r, 2500))])
  : Promise.resolve();
const logoReady = new Promise(res => {
  const im = new Image();
  im.onload = () => { logoImg = im; res(); };
  im.onerror = () => res();
  im.src = SLIDES[0].logo;
});
Promise.all([...texPromises, fontReady, logoReady]).then(() => {
  buildSphere();
  buildTargets();
  go(0, true);
  setTimeout(() => {
    document.getElementById('ld').classList.add('done');
    started = true; t0 = performance.now() / 1000;
    setTimeout(() => { dotsOn = true; dotsT0 = performance.now() / 1000; }, 700);
  }, 350);
});
