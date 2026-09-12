/* =============================================================================
   PLANN Design — wstega okladek plynaca po luku
   Kafelki jada w lewo; im dalej od srodka, tym mocniej odchylone, mniejsze
   i nizej — razem daja wrazenie luku. Na waskich ekranach zwykla plaska tasma.
   ============================================================================= */
(() => {
  'use strict';

  const arc = document.querySelector('[data-arc]');
  const track = document.querySelector('[data-arc-track]');
  if (!arc || !track) return;

  const items = Array.from(track.children);
  if (!items.length) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flat = matchMedia('(max-width: 768px)');

  const SPEED = 42; /* pikseli na sekunde */
  let offset = 0;
  let half = 0;
  let last = 0;
  let paused = false;
  let frame = 0;
  let running = false;

  const measure = () => { half = track.scrollWidth / 2; };

  const reset = () => {
    track.style.transform = '';
    items.forEach(it => {
      it.style.transform = '';
      it.style.opacity = '';
      it.style.zIndex = '';
    });
  };

  const tick = now => {
    frame = requestAnimationFrame(tick);
    const dt = last ? Math.min(now - last, 60) : 16;
    last = now;

    if (!paused) offset -= (SPEED * dt) / 1000;
    if (half > 0 && offset <= -half) offset += half;
    track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;

    const center = arc.clientWidth / 2;
    if (!center) return;

    items.forEach(item => {
      const x = item.offsetLeft + item.offsetWidth / 2 + offset - center;
      const k = Math.max(-1.7, Math.min(1.7, x / center));
      const a = Math.abs(k);
      item.style.transform =
        `rotateY(${(-k * 32).toFixed(2)}deg) ` +
        `translateZ(${(-a * 180).toFixed(1)}px) ` +
        `translateY(${(a * a * 52).toFixed(1)}px) ` +
        `scale(${(1 - a * 0.13).toFixed(3)})`;
      item.style.zIndex = String(120 - Math.round(a * 60));
      item.style.opacity = Math.max(0.22, 1 - a * 0.46).toFixed(2);
    });
  };

  const start = () => {
    if (running) return;
    running = true;
    measure();
    last = 0;
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
    reset();
  };

  const apply = () => {
    const shouldRun = !reduceMotion && !flat.matches;
    arc.classList.toggle('is-flat', !shouldRun);
    if (shouldRun) start();
    else stop();
  };

  apply();
  flat.addEventListener('change', apply);
  addEventListener('resize', measure, { passive: true });

  arc.addEventListener('pointerenter', () => { paused = true; });
  arc.addEventListener('pointerleave', () => { paused = false; });
  arc.addEventListener('focusin', () => { paused = true; });
  arc.addEventListener('focusout', () => { paused = false; });
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });
})();
