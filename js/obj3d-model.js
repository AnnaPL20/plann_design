/* =============================================================================
   PLANN Design — model 3D pod menu (rzezbiona glowa)
   Zamiast pryzmy z okladek stoi tu prawdziwy model: models/rodin-head.glb.
   Glowa odwraca sie za kursorem — obrot w poziomie i lekkie pochylenie,
   wszystko z tlumieniem, zeby ruch byl miekki. Przewijanie dokłada delikatny
   obrot, wiec dawne "przewijaj, zeby obracac" nadal dziala.

   Zasady:
   — biblioteki lokalnie (js/vendor/), zadnych CDN-ow;
   — gdy brak WebGL albo model sie nie wczyta, zostaje stara pryzma CSS
     (js/obj3d.js kreci nia dalej) — strona nigdy nie zostaje z pusta dziura;
   — prefers-reduced-motion: jedna nieruchoma klatka, bez petli animacji;
   — rysujemy tylko wtedy, gdy sekcja jest na ekranie, a karta aktywna.
   ============================================================================= */
import {
  ACESFilmicToneMapping, AmbientLight, Box3, Color, DirectionalLight, Group,
  PerspectiveCamera, PMREMGenerator, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
} from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const stage = document.querySelector('[data-obj3d]');
const canvas = document.querySelector('[data-obj3d-canvas]');
if (stage && canvas) init();

function init() {
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  /* Brak WebGL — konczymy po cichu, zostaje pryzma CSS */
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(0, 0, 5.4);

  /* Swiatlo otoczenia z RoomEnvironment — daje gipsowi miekkie odbicia */
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  pmrem.dispose();

  const key = new DirectionalLight(0xffffff, 2.1);
  key.position.set(2.4, 3, 3.4);
  scene.add(key);
  const rim = new DirectionalLight(0xffffff, 1.1);
  rim.position.set(-3, 1.2, -2.4);
  scene.add(rim);
  const fill = new AmbientLight(0xffffff, .5);
  scene.add(fill);

  /* Pivot trzyma model wysrodkowany, obracamy wlasnie jego */
  const pivot = new Group();
  scene.add(pivot);

  /* --- rozmiar plotna ------------------------------------------------------ */
  const resize = () => {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    frame();
  };
  new ResizeObserver(resize).observe(stage);

  /* --- kadrowanie: model ma wypelnic scene niezaleznie od swoich wymiarow --- */
  const fitModel = obj => {
    const box = new Box3().setFromObject(obj);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = 2 / Math.max(size.x, size.y, size.z);
    obj.position.sub(center);           /* srodek bryly na osi obrotu */
    obj.position.y += size.y * .04;     /* odrobine w dol: glowa siedzi nizej */
    const holder = new Group();
    holder.scale.setScalar(scale);
    holder.add(obj);
    pivot.add(holder);
  };

  /* --- ruch: cel i wartosc biezaca, roznica gasnie co klatke --------------- */
  const target = { yaw: 0, pitch: 0, drift: 0, lx: 0, ly: 0 };
  const now = { yaw: 0, pitch: 0, drift: 0, lx: 0, ly: 0 };
  const DEG = Math.PI / 180;

  const clamp = v => v < -1 ? -1 : v > 1 ? 1 : v;

  const onPointer = event => {
    /* Kat liczymy od srodka sceny do kursora — glowa naprawde patrzy w jego
       strone, a nie tylko przechyla sie wedlug polozenia myszy w oknie.
       Kursor prosto nad obiektem daje zero obrotu w poziomie. */
    const r = stage.getBoundingClientRect();
    const nx = clamp((event.clientX - (r.left + r.width / 2)) / (innerWidth * .42));
    const ny = clamp((event.clientY - (r.top + r.height / 2)) / (innerHeight * .55));
    target.yaw = nx * 58 * DEG;
    target.pitch = ny * 15 * DEG;
    /* Dawne "swiatlo za kursorem" z pryzmy: tam byl gradient na scianach,
       tutaj wedruje prawdziwa lampa w scenie — efekt ten sam, tylko uczciwy */
    target.lx = nx;
    target.ly = ny;
    /* Poswiata pod modelem nadal chodzi za kursorem — te same zmienne CSS */
    stage.style.setProperty('--lx', (nx * 50 + 50).toFixed(1) + '%');
    stage.style.setProperty('--ly', (ny * 50 + 50).toFixed(1) + '%');
    stage.classList.add('is-lit');
    wake();
  };
  const onLeave = () => {
    target.yaw = 0;
    target.pitch = 0;
    target.lx = 0;
    target.ly = 0;
    stage.classList.remove('is-lit');
    wake();
  };
  const onScroll = () => {
    /* Delikatne odplyniecie przy przewijaniu — dawny obrot, tylko spokojniejszy */
    target.drift = (scrollY / Math.max(1, innerHeight * 2)) * 90 * DEG;
    wake();
  };

  /* --- petla: chodzi tylko wtedy, gdy cos sie zmienia ---------------------- */
  let raf = 0, visible = false, ready = false;

  const frame = () => {
    if (ready) renderer.render(scene, camera);
  };

  const tick = () => {
    raf = 0;
    let moving = false;
    for (const k of ['yaw', 'pitch', 'drift', 'lx', 'ly']) {
      const d = target[k] - now[k];
      if (Math.abs(d) > 1e-4) { now[k] += d * .12; moving = true; }
      else now[k] = target[k];
    }
    pivot.rotation.y = now.yaw + now.drift;
    pivot.rotation.x = now.pitch;
    /* Lampa glowna wedruje za kursorem, boczna idzie w przeciwna strone —
       dzieki temu blask na lakierze przesuwa sie razem z myszka */
    key.position.set(2.2 + now.lx * 3.4, 2.8 - now.ly * 2.6, 3.4);
    rim.position.set(-3 + now.lx * 2, 1.2 - now.ly * 1.4, -2.4);
    frame();
    if (moving) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    /* Ograniczony ruch: jedno ujecie, zadnej petli — ustawiamy poze przy
       wczytaniu, pozniej kazde wywolanie konczy sie tu i teraz */
    if (calm.matches) return;
    if (!visible || document.hidden || raf) return;
    raf = requestAnimationFrame(tick);
  };

  /* --- wczytanie modelu ---------------------------------------------------- */
  new GLTFLoader().load(
    'models/rodin-head.glb',
    gltf => {
      fitModel(gltf.scene);
      ready = true;
      if (calm.matches) pivot.rotation.set(0, -.18, 0);
      resize();
      /* Pryzma CSS ustepuje miejsca dopiero teraz — po udanym wczytaniu */
      stage.classList.add('is-model');
      requestAnimationFrame(() => stage.classList.add('is-model-in'));
      wake();
    },
    undefined,
    () => { renderer.dispose(); }   /* blad — zostaje pryzma, nic nie pokazujemy */
  );

  /* --- nasluchy ------------------------------------------------------------ */
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) wake();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '120px' }).observe(stage);

  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pointerleave', onLeave);
  addEventListener('blur', onLeave);
  addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', wake);
  onScroll();

  /* Ciemny motyw: mocniejsze swiatlo boczne, zeby gips nie zlewal sie z tlem */
  const applyTheme = () => {
    const dark = root.dataset.theme === 'dark';
    scene.background = null;
    key.intensity = dark ? 2.6 : 2.1;
    rim.intensity = dark ? 1.9 : 1.1;
    rim.color = new Color(dark ? 0xbfd4ff : 0xffffff);
    fill.intensity = dark ? .34 : .5;
    renderer.toneMappingExposure = dark ? .96 : 1.05;
    frame();
  };
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  applyTheme();
}
