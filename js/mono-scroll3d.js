/* =============================================================================
   PLANN Design — scena skrolu ze znakiem PA (pierwszy akt strony)

   Plotno lezy na caly ekran (position: fixed), za trescia i bez lapania
   klikniec. Tlo przezroczyste, wiec pod spodem widac zwykly papier serwisu.

   Model: wlasny wektor img/logo-pa-dark.svg wczytany przez SVGLoader. Kazdy
   z dwoch konturow — P i A — dostaje WLASNA bryle (ExtrudeGeometry) i wlasna
   grupe, bo w dalszej czesci beda sie rozchodzic i oblatywac nawzajem.
   Grubosc ~12% wysokosci znaku, faska ~2.5% na kilku segmentach.

   Material wedlug wskazan wlascicielki: jasny metal — MeshPhysicalMaterial,
   metalness 1, roughness 0.18, clearcoat 0.6, kolor #d9d9de.
   Swiatlo: RoomEnvironment jako otoczenie (metal zyje z odbic) plus miekka
   lampa z gory, ktora rzuca cien PCFSoft na niewidoczna podloge
   (ShadowMaterial o przezroczystosci 0.15).

   Zasady: biblioteki lokalnie w js/vendor/, zadnych CDN-ow; brak WebGL albo
   blad wczytania -> zostaje plaska monograma w hero.
   ============================================================================= */
import {
  ACESFilmicToneMapping, Box3, Color, DirectionalLight, DoubleSide,
  ExtrudeGeometry, Group, Mesh, MeshPhysicalMaterial, PCFSoftShadowMap,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, Scene, ShadowMaterial,
  SRGBColorSpace, Vector3, WebGLRenderer,
} from './vendor/three.module.min.js';
import { SVGLoader } from './vendor/SVGLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const canvas = document.querySelector('[data-mono3d]');
const stage = document.querySelector('[data-hero-scene]');
if (canvas && stage) init();

function init() {
  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const narrow = matchMedia('(max-width: 900px)');

  /* Bez WebGL konczymy po cichu — w hero zostaje plaska monograma */
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    return;
  }
  /* Na telefonie tniemy gestosc pikseli mocniej — plotno jest na caly ekran */
  const dprCap = () => (narrow.matches ? 1.25 : 1.5);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCap()));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, .1, 120);

  /* Otoczenie: bez niego metal jest plaska szara plama */
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .03).texture;
  pmrem.dispose();
  scene.environmentIntensity = 2.2;
  scene.environmentRotation.set(0, 2, 0);

  /* Miekka lampa z gory — ona rysuje cien i blask na fasce */
  const key = new DirectionalLight(0xfff6ec, 1.9);
  key.castShadow = true;
  /* Przy PCFSoftShadowMap three pomija shadow.radius — rozmycie bierze sie
     z wielkosci teksela, wiec mala mapa na szerokiej ramce daje lagodny cien */
  key.shadow.mapSize.set(256, 256);
  key.shadow.bias = -.0015;
  key.shadow.camera.near = .5;
  key.shadow.camera.far = 18;
  const sc = key.shadow.camera;
  sc.left = -3.4; sc.right = 3.4; sc.top = 3.4; sc.bottom = -3.4;
  sc.updateProjectionMatrix();
  scene.add(key, key.target);

  /* Druga lampa z przeciwka — rysuje krawedz znaku na jasnym tle */
  const rim = new DirectionalLight(0xdfe8ff, .9);
  rim.position.set(-3, 1.4, -2.8);
  scene.add(rim);

  /* Podloga: widac tylko cien, ktory na nia pada */
  const floor = new Mesh(
    new PlaneGeometry(40, 40),
    new ShadowMaterial({ opacity: .15, transparent: true })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  /* Hierarchia: rootGroup trzyma kadr i odwracanie za mysza, spinner obraca
     cala monograme, a w nim siedza dwie osobne polowki — P i A. */
  const rootGroup = new Group();
  const spinner = new Group();
  rootGroup.add(spinner);
  scene.add(rootGroup);

  const halves = [];      /* { group, rest } — polowki znaku */
  let material = null;
  let logoW = 3.4;        /* szerokosc znaku przy wysokosci rownej 1 */
  let ready = false;

  /* --- kadr ----------------------------------------------------------------- */
  const DEG = Math.PI / 180;
  /* Ile szerokosci ekranu zajmuje znak. Na telefonie znak ma byc mniejszy,
     zeby nie rozpychal kadru i nie zjadal calego pierwszego ekranu. */
  const fillFor = w => (w < 900 ? .62 : .46);
  const LIFT = .55;       /* ile znak stoi nad podloga */
  let heroShift = 0;      /* przesuniecie w gore/dol, zeby znak stanal w hero */
  let viewH = 4;

  /* Znak ma stac po srodku sceny hero, a nie po srodku okna — pasek z zegarem
     i pigulka siedzi nizej, wiec srodek kadru wypada wyzej niz srodek ekranu. */
  const heroOffsetPx = () => {
    const box = stage.getBoundingClientRect();
    return box.top + scrollY + box.height / 2 - innerHeight / 2;
  };

  const resize = () => {
    const w = innerWidth;
    const h = innerHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCap()));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const viewW = logoW / fillFor(w);
    viewH = viewW / camera.aspect;
    const dist = viewH / 2 / Math.tan(camera.fov * DEG / 2);
    heroShift = -heroOffsetPx() * (viewH / h);
    camera.position.set(0, LIFT + .35, dist);
    camera.lookAt(0, LIFT - .05, 0);
    camera.updateProjectionMatrix();
    place();
    frame();
  };

  /* --- ruch ----------------------------------------------------------------- */
  /* Odwracanie za mysza: do 25 stopni w poziomie i 10 w pionie */
  const tilt = { yaw: 0, pitch: 0 };
  const tiltTo = { yaw: 0, pitch: 0 };
  let spinAngle = 0;          /* powolne samoczynne obracanie w spoczynku */
  let last = 0;

  const clamp1 = v => (v < -1 ? -1 : v > 1 ? 1 : v);

  const place = () => {
    const y = LIFT + heroShift;
    rootGroup.position.set(0, y, 0);
    rootGroup.rotation.set(tilt.pitch, tilt.yaw, 0);
    spinner.rotation.y = spinAngle;
    /* Podloga jedzie pod znakiem — inaczej cien uciekalby na bok kadru */
    floor.position.y = y - .85;
    /* Lampa jedzie razem ze znakiem, wiec blask przelewa sie po fasce */
    key.position.set(tilt.yaw * 2.4 + .6, LIFT + heroShift + 4.4, 2.2);
    key.target.position.set(0, LIFT + heroShift - .2, 0);
    key.target.updateMatrixWorld();
  };

  /* --- petla ---------------------------------------------------------------- */
  let raf = 0;

  const frame = () => {
    if (ready) renderer.render(scene, camera);
  };

  const tick = now => {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, .05) : .016;
    last = now;

    spinAngle += dt * .12;                       /* powolny obrot w spoczynku */
    tilt.yaw += (tiltTo.yaw - tilt.yaw) * .08;   /* doganianie, bez skokow */
    tilt.pitch += (tiltTo.pitch - tilt.pitch) * .08;

    place();
    frame();
    wake();
  };

  const wake = () => {
    if (!ready || raf || calm.matches || document.hidden) return;
    raf = requestAnimationFrame(tick);
  };

  const sleep = () => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    last = 0;
  };

  /* --- budowa bryly ze znaku ------------------------------------------------ */
  new SVGLoader().load(
    'img/logo-pa-dark.svg',
    data => {
      /* Kazdy kontur SVG (P i A) idzie do wlasnej grupy — beda sie rozchodzic */
      const parts = [];
      data.paths.forEach(path => {
        const shapes = SVGLoader.createShapes(path);
        if (shapes.length) parts.push(shapes);
      });
      if (!parts.length) return;

      /* Wysokosc calego znaku liczymy raz, zeby grubosc i faska byly wspolne */
      const probe = new ExtrudeGeometry(parts.flat(), { depth: 1, bevelEnabled: false });
      probe.computeBoundingBox();
      const H = probe.boundingBox.max.y - probe.boundingBox.min.y;
      probe.dispose();

      material = new MeshPhysicalMaterial({
        color: new Color(0xd9d9de),
        metalness: 1,
        roughness: .18,
        clearcoat: .6,
        clearcoatRoughness: .14,
        side: DoubleSide,
      });

      const opts = {
        depth: H * .12,            /* grubosc ~12% wysokosci znaku */
        bevelEnabled: true,
        bevelThickness: H * .025,  /* faska ~2.5% wysokosci */
        bevelSize: H * .025,
        bevelOffset: 0,
        bevelSegments: 5,
        curveSegments: 14,
      };

      /* Najpierw kazda polowka wokol wlasnego srodka, potem wspolny kadr */
      const built = parts.map(shapes => {
        const geo = new ExtrudeGeometry(shapes, opts);
        geo.computeBoundingBox();
        const mid = geo.boundingBox.getCenter(new Vector3());
        geo.translate(-mid.x, -mid.y, -mid.z);
        geo.computeBoundingBox();
        return { geo, mid };
      });

      /* Pudelko calego znaku: srodki polowek plus ich wlasne rozmiary */
      const all = new Box3();
      built.forEach(b => {
        all.expandByPoint(b.mid.clone().add(b.geo.boundingBox.min));
        all.expandByPoint(b.mid.clone().add(b.geo.boundingBox.max));
      });
      const center = all.getCenter(new Vector3());
      const size = all.getSize(new Vector3());
      const unit = 1 / size.y;                   /* wysokosc znaku = 1 jednostka */
      logoW = size.x / size.y;

      built.forEach(b => {
        const mesh = new Mesh(b.geo, material);
        mesh.castShadow = true;
        mesh.scale.y = -1;                       /* SVG liczy Y w dol, three w gore */
        mesh.scale.multiplyScalar(unit);
        const group = new Group();
        group.add(mesh);
        const rest = new Vector3(
          (b.mid.x - center.x) * unit,
          -(b.mid.y - center.y) * unit,
          0
        );
        group.position.copy(rest);
        spinner.add(group);
        halves.push({ group, rest });
      });

      ready = true;
      applyTheme();
      resize();
      root.classList.add('has-mono3d');
      requestAnimationFrame(() => canvas.classList.add('is-on'));
      frame();
      wake();
    },
    undefined,
    () => { renderer.dispose(); }
  );

  /* --- nasluchy ------------------------------------------------------------- */
  addEventListener('resize', resize, { passive: true });

  if (fine.matches && !calm.matches) {
    addEventListener('pointermove', event => {
      tiltTo.yaw = clamp1(event.clientX / innerWidth * 2 - 1) * 25 * DEG;
      tiltTo.pitch = clamp1(event.clientY / innerHeight * 2 - 1) * 10 * DEG;
      wake();
    }, { passive: true });
    addEventListener('blur', () => { tiltTo.yaw = 0; tiltTo.pitch = 0; wake(); });
  }

  /* Niewidoczna karta nie rysuje nic */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) sleep(); else wake();
  });

  /* Ciemny motyw: jasny metal na czarnym tle traci odbicia, wiec dokladamy
     otoczeniu mocy. Kolor materialu zostaje taki, jak ustalila wlascicielka. */
  const applyTheme = () => {
    const dark = root.dataset.theme === 'dark';
    scene.environmentIntensity = dark ? 2.9 : 2.2;
    key.intensity = dark ? 2.6 : 1.9;
    rim.intensity = dark ? 1.6 : .9;
    renderer.toneMappingExposure = dark ? 1.2 : 1.05;
    floor.material.opacity = dark ? .28 : .15;
    frame();
  };
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
}
