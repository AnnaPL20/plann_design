/* =============================================================================
   PLANN Design — znak PA w scenie hero (czarny metal)
   Wlasny wektor img/logo-pa-dark.svg wczytany przez SVGLoader i wyciagniety
   w bryle (ExtrudeGeometry): grubosc ~12% wysokosci znaku, faska ~2.5% na
   kilku segmentach, zeby krawedzie lapaly swiatlo.

   Material: czarny metal z faktura. Drobne ziarno na mapie szorstkosci robimy
   na plotnie 2D w locie — zaden plik z zewnatrz nie jest potrzebny, a metal
   przestaje byc idealnym lustrem i zaczyna wygladac jak rzecz, nie jak render.

   Ruch: znak NIE kreci sie wokol wlasnej osi. Lezy w scenie i odwraca sie za
   kursorem — w lewo, w prawo, w gore, w dol — jakby za nim wodzil. Razem z
   nim jedzie swiatlo, wiec blask przelewa sie po fasce przy kazdym ruchu.
   Wszystko na tlumieniu, zeby nie bylo skokow.

   Cien: swiatlo gorne rzuca go na niewidoczna podloge pod znakiem
   (ShadowMaterial), kamera stoi odrobine wyzej, wiec cien lezy na plaszczyznie
   tak jak przy zdjeciu przedmiotu w studiu — a nie doklejony z boku.

   Zasady:
   — biblioteki lokalnie w js/vendor/, zadnych CDN-ow;
   — brak WebGL albo blad wczytania -> zostaje plaska monograma;
   — prefers-reduced-motion -> znak stoi nieruchomo, bez petli;
   — dpr do 1.5, rysowanie pauzuje, gdy hero wyjedzie z ekranu.
   ============================================================================= */
import {
  ACESFilmicToneMapping, Box3, CanvasTexture, Color, DirectionalLight, DoubleSide,
  ExtrudeGeometry, Group, Mesh, MeshPhysicalMaterial, PCFSoftShadowMap,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, RepeatWrapping, Scene,
  ShadowMaterial, SRGBColorSpace, Vector3, WebGLRenderer,
} from './vendor/three.module.min.js';
import { SVGLoader } from './vendor/SVGLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const stage = document.querySelector('[data-hero-scene]');
const canvas = document.querySelector('[data-hero-logo3d]');
if (stage && canvas) init();

/* Drobne ziarno na mape szorstkosci — czysta matematyka, zero plikow */
function grainTexture(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    /* Jasnosc chodzi wokol srodka: ciemniej = gladziej, jasniej = bardziej matowo */
    const n = 128 + (Math.random() - .5) * 96;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function init() {
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');

  /* Bez WebGL konczymy po cichu — zostaje plaska monograma */
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  /* Kamera odrobine nad znakiem i lekko w dol — dzieki temu widac podloge,
     a na niej cien. Z poziomu oczu podloga bylaby kreska i cienia nie byloby. */
  const camera = new PerspectiveCamera(30, 1, .1, 100);

  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .03).texture;
  pmrem.dispose();
  /* Sile i obrot otoczenia ustawiamy na scenie: przy scene.environment three
     pomija material.envMapIntensity (sprawdzone). Czarny metal zyje z odbic,
     wiec dajemy im sporo mocy — inaczej znak jest plaska czarna plama. */
  scene.environmentIntensity = 3.1;
  scene.environmentRotation.set(0, 2, 0);

  /* Swiatlo gorne: ono rzuca cien i ono robi blask na fasce */
  const key = new DirectionalLight(0xfff4e8, 2.6);
  key.castShadow = true;
  /* Miekkosc cienia: przy PCFSoftShadowMap three ignoruje shadow.radius,
     wiec rozmycie bierze sie z wielkosci teksela. Mala mapa na szerokiej
     ramce = lagodne, naturalne rozmycie zamiast szarej plyty. */
  key.shadow.mapSize.set(160, 160);
  key.shadow.bias = -.0015;
  key.shadow.camera.near = .5;
  key.shadow.camera.far = 14;
  const sc = key.shadow.camera;
  sc.left = -2.6; sc.right = 2.6; sc.top = 2.6; sc.bottom = -2.6;
  sc.updateProjectionMatrix();
  scene.add(key, key.target);

  /* Druga lampa z przeciwka — rysuje krawedz znaku na jasnym tle */
  const rim = new DirectionalLight(0xdfe8ff, 1.4);
  scene.add(rim);

  /* Podloga: widac tylko cien, ktory na nia pada */
  const floor = new Mesh(
    new PlaneGeometry(24, 24),
    new ShadowMaterial({ opacity: .085, transparent: true })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const pivot = new Group();
  scene.add(pivot);
  let material = null;   /* powstaje po wczytaniu wektora; motyw go dostraja */

  /* --- ruch ---------------------------------------------------------------- */
  const DEG = Math.PI / 180;
  const target = { yaw: 0, pitch: 0 };
  const now = { yaw: 0, pitch: 0 };
  const clamp = v => v < -1 ? -1 : v > 1 ? 1 : v;

  /* --- kadr ---------------------------------------------------------------- */
  /* Ile szerokosci sceny zajmuje znak. Na waskim ekranie musi byc wiekszy,
     inaczej gubi sie w bieli — liczymy to przy kazdym przeliczeniu kadru. */
  const fillFor = w => w < 700 ? .72 : .42;
  let logoW = 1;
  const LIFT = .62;          /* ile znak stoi nad podloga */

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    const viewW = logoW / fillFor(r.width);
    const viewH = viewW / camera.aspect;
    const dist = viewH / 2 / Math.tan(camera.fov * DEG / 2);
    /* Kamera patrzy na znak, ale z lekkiej gory — podloga wchodzi w kadr */
    camera.position.set(0, LIFT + .3, dist);
    camera.lookAt(0, LIFT - .06, 0);
    camera.updateProjectionMatrix();
    frame();
  };
  new ResizeObserver(resize).observe(canvas);

  /* --- petla --------------------------------------------------------------- */
  let raf = 0, visible = false, ready = false;

  const frame = () => {
    if (ready) renderer.render(scene, camera);
  };

  const place = () => {
    pivot.rotation.y = now.yaw;
    pivot.rotation.x = now.pitch;
    /* Lampy wedruja za kursorem — stad naturalne przelewanie sie swiatla */
    /* Lampa stoi wysoko i prawie nad znakiem — cien sciele sie pod nim,
       a nie ucieka w bok jak doklejona plama */
    key.position.set(now.yaw * 2.2 + .5, LIFT + 4.2 - now.pitch * 1.6, 1.7);
    rim.position.set(now.yaw * 2.4 - 3, LIFT + 1 - now.pitch * 1.6, -2.6);
  };

  const tick = () => {
    raf = 0;
    let moving = false;
    for (const k of ['yaw', 'pitch']) {
      const d = target[k] - now[k];
      if (Math.abs(d) > 2e-4) { now[k] += d * .07; moving = true; }
      else now[k] = target[k];
    }
    place();
    frame();
    if (moving && visible && !document.hidden) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (calm.matches || !ready) return;
    if (!visible || document.hidden || raf) return;
    raf = requestAnimationFrame(tick);
  };

  /* --- budowa bryly ze znaku ----------------------------------------------- */
  new SVGLoader().load(
    'img/logo-pa-dark.svg',
    data => {
      const shapes = [];
      data.paths.forEach(path => SVGLoader.createShapes(path).forEach(s => shapes.push(s)));
      if (!shapes.length) return;

      const flat = new ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false });
      flat.computeBoundingBox();
      const h = flat.boundingBox.max.y - flat.boundingBox.min.y;
      flat.dispose();

      const geo = new ExtrudeGeometry(shapes, {
        depth: h * .26,                /* grubszy znak — ma byc bryla, nie naklejka */
        bevelEnabled: true,
        bevelThickness: h * .05,      /* szersza faska = bardziej opukly, miekki brzeg */
        bevelSize: h * .05,
        bevelOffset: 0,
        bevelSegments: 7,
        curveSegments: 14,
      });
      geo.center();

      material = new MeshPhysicalMaterial({
        color: new Color(0x1c1c22),   /* czarny, ale nie martwa czern */
        metalness: 1,
        /* Uwaga: roughnessMap MNOZY sie przez te wartosc, a ziarno ma srednia
           okolo 0.5 — stad tak wysoka liczba. Efektywna szorstkosc wychodzi
           okolo 0.45 z wahaniem, czyli piaskowany metal, a nie fortepianowy lakier. */
        roughness: .95,
        roughnessMap: grainTexture(), /* faktura: metal nie jest idealnym lustrem */
        clearcoat: .55,
        clearcoatRoughness: .22,
        side: DoubleSide,
      });

      const mesh = new Mesh(geo, material);
      mesh.scale.y = -1;              /* SVG liczy Y w dol, three w gore */
      mesh.castShadow = true;
      pivot.add(mesh);

      const box = new Box3().setFromObject(pivot);
      const size = box.getSize(new Vector3());
      pivot.scale.setScalar(1 / size.y);
      logoW = size.x / size.y;

      /* Znak stoi nad podloga, nie wbity w nia */
      pivot.position.y = LIFT;
      key.target.position.set(0, LIFT - .2, 0);
      key.target.updateMatrixWorld();

      ready = true;
      applyTheme();
      place();
      resize();
      stage.classList.add('has-logo3d');
      requestAnimationFrame(() => stage.classList.add('has-logo3d-in'));
      frame();
    },
    undefined,
    () => { renderer.dispose(); }
  );

  /* --- nasluchy ------------------------------------------------------------ */
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) wake();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '80px' }).observe(stage);

  /* Kursor prowadzi znak. Na dotyku nic sie nie rusza — znak po prostu stoi. */
  if (fine.matches && !calm.matches) {
    addEventListener('pointermove', event => {
      const nx = clamp(event.clientX / innerWidth * 2 - 1);
      const ny = clamp(event.clientY / innerHeight * 2 - 1);
      target.yaw = nx * 46 * DEG;
      target.pitch = ny * 26 * DEG;
      wake();
    }, { passive: true });
    addEventListener('blur', () => { target.yaw = 0; target.pitch = 0; wake(); });
  }

  document.addEventListener('visibilitychange', wake);

  /* Ciemny motyw: czarny metal na czarnym tle sam z siebie znika, wiec
     podkrecamy odbicia i swiatla. Znak zostaje czarny — tylko widoczny. */
  const root = document.documentElement;
  const applyTheme = () => {
    const dark = root.dataset.theme === 'dark';
    scene.environmentIntensity = dark ? 5.2 : 3.1;
    key.intensity = dark ? 4.2 : 2.6;
    rim.intensity = dark ? 3.4 : 1.4;
    renderer.toneMappingExposure = dark ? 1.35 : 1.15;
    if (material) {
      material.color.set(dark ? 0x2a2a33 : 0x1c1c22);
      material.needsUpdate = true;
    }
    frame();
  };
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  applyTheme();
}
