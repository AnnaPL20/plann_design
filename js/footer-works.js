/* =============================================================================
   PLANN Design — pasek prac w stopce
   Kafelki same, po kolei, powoli sie rozswietlaja. Gdy kursor wejdzie na pasek,
   automat oddaje sterowanie myszy; po zjechaniu kursora wraca po chwili.
   ============================================================================= */
(() => {
  'use strict';

  const strip = document.querySelector('.footer__works');
  if (!strip) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(strip.querySelectorAll('.footer__work'));
  if (!items.length) return;

  const STEP = 1100;   /* co ile milisekund przechodzi do nastepnego kafelka */
  const RESUME = 900;  /* po jakim czasie od zjechania kursora wraca automat */

  let index = -1;
  let timer = 0;
  let resumeTimer = 0;
  let inView = false;

  const clear = () => items.forEach(el => el.classList.remove('is-auto'));

  const tick = () => {
    index = (index + 1) % items.length;
    clear();
    items[index].classList.add('is-auto');
  };

  const play = () => {
    if (timer || !inView || strip.classList.contains('is-manual')) return;
    tick();
    timer = setInterval(tick, STEP);
  };

  const stop = () => {
    clearInterval(timer);
    timer = 0;
    clear();
  };

  /* Automat chodzi tylko wtedy, gdy stopka jest na ekranie */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        inView = e.isIntersecting;
        if (inView) play();
        else stop();
      });
    }, { threshold: 0.15 }).observe(strip);
  } else {
    inView = true;
    play();
  }

  /* Mysz ma pierwszenstwo przed automatem */
  strip.addEventListener('pointerenter', () => {
    clearTimeout(resumeTimer);
    strip.classList.add('is-manual');
    stop();
  });

  strip.addEventListener('pointerleave', () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      strip.classList.remove('is-manual');
      play();
    }, RESUME);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else play();
  });
})();
