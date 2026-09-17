/* =============================================================================
   PLANN Design — scena skrolu ze znakiem PA (pierwszy akt strony)

   Plotno lezy na caly ekran (position: fixed), za trescia i bez lapania
   klikniec. Tlo przezroczyste, wiec pod spodem widac zwykly papier serwisu.

   Model: wlasny wektor img/logo-pa-dark.svg wczytany przez SVGLoader. Kazdy
   z dwoch konturow — P i A — dostaje WLASNA bryle (ExtrudeGeometry) i wlasna
   grupe, bo w dalszej czesci beda sie rozchodzic i oblatywac nawzajem.
   Grubosc ~12% wysokosci znaku, faska ~2.5% na kilku segmentach.

   Material: MeshPhysicalMaterial, metalness 1, roughness 0.18, clearcoat 0.6.
   Kolor wedlug wskazan wlascicielki (17.09.2026) jedzie z postepem skrolu:
   w hero znak jest czarnym metalem, przy przewijaniu rozjasnia sie do bieli.
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
/* Sekcja, na ktorej konczy sie pierwszy akt — dalej strona zyje jak dotad */
const act = document.querySelector('[data-mono3d-end]');
if (canvas && stage) init();

function init() {
  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const narrow = matchMedia('(max-width: 900px)');

  /* Bez WebGL konczymy po cichu — w hero zostaje plaska monograma.
     Pytamy o kontekst sami, na osobnym plotnie: three przy nieudanej probie
     wypisuje blad do konsoli, a konsola ma byc czysta. */
  const check = document.createElement('canvas');
  if (!(check.getContext('webgl2') || check.getContext('webgl'))) return;

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
  const fillFor = w => (w < 900 ? .72 : .46);
  const LIFT = .55;       /* ile znak stoi nad podloga */
  let heroShift = 0;      /* przesuniecie w gore/dol, zeby znak stanal w hero */
  let viewH = 4;
  let dist0 = 8;          /* odleglosc kamery w spoczynku (przed najazdem) */

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
    dist0 = viewH / 2 / Math.tan(camera.fov * DEG / 2);
    heroShift = -heroOffsetPx() * (viewH / h);
    camera.updateProjectionMatrix();
    measure();
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
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);

  /* --- taniec skrolu --------------------------------------------------------- */
  /* Postep liczymy od gory strony do konca sekcji-manifestu: 0 na samej gorze,
     1 gdy dol tej sekcji dojedzie do dolu okna. Surowa wartosc idzie przez
     doganianie, dzieki czemu znak nie skacze za kolkiem myszy. Wartosc
     0.05 zamiast 0.08 (17.09.2026, prosba wlascicielki): znak przekreca sie
     wolniej i dlugo dochodzi do celu, wiec ruch jest gladszy. */
  let actEnd = 1;         /* przewiniecie w pikselach, na ktorym akt sie konczy */
  let prog = 0;           /* postep po wygladzeniu */
  let rawProg = 0;        /* postep prosto ze skrolu */
  let live = false;       /* czy mozemy juz sterowac przezroczystoscia plotna */
  let shadowBase = .15;   /* sila cienia w spoczynku — motyw ja dostraja */
  /* Kolor znaku: w hero czarny metal, a w miare przewijania przechodzi w bialy.
     W ciemnym motywie czern startowa jest odrobine jasniejsza, bo czarny znak
     na czarnym tle po prostu znika. */
  const INK_LIGHT = new Color(0x15151a);
  const INK_DARK = new Color(0x2e2e37);
  const SNOW = new Color(0xececf1);
  const metal = new Color();
  let dark = false;       /* czy strona stoi na ciemnym motywie */

  const measure = () => {
    const end = act ? act.getBoundingClientRect().bottom + scrollY - innerHeight : innerHeight;
    actEnd = Math.max(end, 1);
  };

  /* Kawalek osi czasu 0..1 z calego postepu */
  const seg = (a, b) => clamp01((prog - a) / (b - a));
  const easeInOut = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /* Promien, na ktory rozchodza sie polowki: w bok i w glab.
     Trzymamy go krotko — rozsuniete polowki nie moga wychodzic poza kadr
     ani przykrywac calego akapitu manifestu. */
  const ORBIT_X = () => logoW * (narrow.matches ? .22 : .30);
  const ORBIT_Z = () => logoW * (narrow.matches ? .20 : .28);

  const place = () => {
    /* 0.00–0.35 najazd kamery i pol obrotu, 0.35–0.70 oblot polowek,
       0.70–1.00 powrot do monogramu, zmniejszenie i wyjscie w gore */
    const sA = easeInOut(seg(0, .35));
    const sB = easeInOut(seg(.35, .70));
    /* Skladanie konczy sie przed samym koncem aktu: znak ma zdazyc stanac
       przodem do widza i byc czytelny, zanim ruszy w gore */
    const sC = easeInOut(seg(.70, .88));
    const sOut = easeInOut(seg(.84, 1));

    /* Kamera powoli naježdža — znak rosnie w kadrze bez skoku perspektywy */
    camera.position.set(0, LIFT + .35, dist0 * (1 - .12 * sA));
    camera.lookAt(0, LIFT - .05, 0);

    /* Rozejscie polowek: narasta do 0.35, trzyma sie w czasie oblotu
       i wraca do zera, zanim znak zlozy sie z powrotem w monograme */
    const sep = easeOut(seg(.06, .35)) * (1 - sC);

    /* Znak zaczyna w srodku sceny hero, potem wychodzi na srodek okna,
       a na koncu ucieka w gore poza kadr. Rozsuniete polowki zajmuja wiecej
       miejsca, wiec na czas oblotu caly uklad lekko sie kurczy. */
    /* Na telefonie znak nie schodzi az na srodek okna — tam czeka naglowek,
       a dwa czarne wiersze na metalu robia sie nieczytelne */
    const y = LIFT + heroShift * (1 - sA * (narrow.matches ? .3 : 1)) + sOut * viewH * .9;
    rootGroup.position.set(0, y, 0);
    rootGroup.scale.setScalar((1 - .16 * sep) * (1 - .62 * sOut));

    /* Odwracanie za mysza dziala w spoczynku i ustepuje, gdy prowadzi skrol.
       Do tego lekkie skiniecie w czasie obrotu — dzieki niemu znak nigdy nie
       staje idealnie bokiem, wiec nie znika na chwile z kadru. */
    const hand = 1 - sA;
    rootGroup.rotation.set(tilt.pitch * hand + .16 * Math.sin(Math.PI * sA), tilt.yaw * hand, 0);
    /* Pol obrotu w pierwszej czesci i drugie pol na powrocie — znak konczy
       przodem do widza, dokladnie tak, jak zaczynal */
    spinner.rotation.y = spinAngle + Math.PI * sA + Math.PI * sC;

    /* Kat oblotu: lekkie odchylenie na starcie, potem pelna petla wokol
       wspolnego srodka — konczy sie tam, gdzie sie zaczela */
    const th = sA * Math.PI * .35 + sB * Math.PI * 2;
    const rx = ORBIT_X();
    const rz = ORBIT_Z();
    halves.forEach((half, i) => {
      const dir = i === 0 ? -1 : 1;     /* P w lewo, A w prawo */
      const ox = dir * rx * Math.cos(th);
      const oz = dir * rz * Math.sin(th);
      const oy = dir * .2 * Math.sin(th);
      const r = half.rest;
      half.group.position.set(
        r.x + (ox - r.x) * sep,
        r.y + (oy - r.y) * sep,
        r.z + (oz - r.z) * sep
      );
    });

    /* Podloga jedzie pod znakiem — inaczej cien uciekalby na bok kadru.
       Przy rozsunietych polowkach cienie robia sie dlugie i klada sie na
       tekscie, wiec na czas oblotu wyraznie je scieramy. */
    floor.position.y = y - .85;
    floor.material.opacity = shadowBase * (1 - .55 * sep);
    /* Lampa jedzie razem ze znakiem, wiec blask przelewa sie po fasce */
    key.position.set(tilt.yaw * hand * 2.4 + .6, y + 4.4, 1.4);
    key.target.position.set(0, y - .2, 0);
    key.target.updateMatrixWorld();

    /* Kolor znaku jedzie razem z postepem: w hero czarny metal, a przy
       przewijaniu rozjasnia sie do bieli. Czern zyje z odbic mocniej niz biel,
       wiec otoczenie przygasa dopiero wtedy, gdy znak juz zbielal. */
    const shine = easeInOut(seg(.04, .45));
    if (material) {
      metal.lerpColors(dark ? INK_DARK : INK_LIGHT, SNOW, shine);
      material.color.copy(metal);
    }
    scene.environmentIntensity = (dark ? 3.6 : 2.9) - .7 * shine;

    /* Na koniec aktu plotno gasnie i strona zyje dalej jak zawsze */
    if (live) canvas.style.opacity = clamp01((.99 - prog) / .12).toFixed(3);
  };

  /* --- petla ---------------------------------------------------------------- */
  let raf = 0;

  const frame = () => {
    if (!ready) return;
    renderer.render(scene, camera);
    /* Na telefonie cien liczymy raz i zostawiamy — przeliczanie mapy cieni
       przy kazdej klatce jest tam najdrozsza rzecza w calej scenie */
    if (narrow.matches && renderer.shadowMap.autoUpdate) {
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = false;
    }
  };

  const tick = now => {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, .05) : .016;
    last = now;

    rawProg = clamp01(scrollY / actEnd);
    prog += (rawProg - prog) * .05;              /* doganianie postepu skrolu */
    if (Math.abs(rawProg - prog) < .0004) prog = rawProg;

    /* Samoczynny obrot tylko w spoczynku — dalej prowadzi skrol */
    spinAngle += dt * .12 * (1 - clamp01(prog / .2));
    tilt.yaw += (tiltTo.yaw - tilt.yaw) * .08;   /* doganianie, bez skokow */
    tilt.pitch += (tiltTo.pitch - tilt.pitch) * .08;

    place();
    frame();
    /* Po akcie petla zasypia — plotno jest wygaszone, nie ma czego rysowac */
    if (prog < .9995 || rawProg < .9995) wake();
  };

  const wake = () => {
    if (!ready || raf || calm.matches || document.hidden) return;
    raf = requestAnimationFrame(tick);
  };

  const sleep = () => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    last = 0;
  };

  /* Wersja spokojna: zamiast tanca — jeden nieruchomy znak w hero.
     Plotno pokazuje sie tylko wtedy, gdy hero jest na ekranie. */
  const quietGate = () => {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(entries => {
      canvas.classList.toggle('is-on', entries[0].isIntersecting);
    }, { rootMargin: '0px' }).observe(stage);
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
        color: new Color(0x15151a),   /* start w czerni — dalej prowadzi skrol */
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
      if (calm.matches) {
        /* prefers-reduced-motion: znak stoi nieruchomo w hero, bez tanca.
           Plotno chowa sie samo, gdy hero wyjedzie z ekranu — inaczej
           wisialoby nad cala strona. Przezroczystosc prowadzi tu CSS. */
        quietGate();
      } else {
        /* Dopiero po wejsciu plotna przejmujemy przezroczystosc w swoje rece —
           inaczej gladkie przejscie z CSS gryzloby sie z gaszeniem na koncu aktu */
        setTimeout(() => {
          canvas.classList.add('is-live');
          live = true;
          place();
          frame();
        }, 1300);
      }
      frame();
      wake();
    },
    undefined,
    () => { renderer.dispose(); }
  );

  /* --- nasluchy ------------------------------------------------------------- */
  addEventListener('resize', resize, { passive: true });
  addEventListener('scroll', wake, { passive: true });
  /* Obrot telefonu albo zmiana okna: na duzym ekranie cien znow ma zyc */
  narrow.addEventListener('change', () => {
    renderer.shadowMap.autoUpdate = !narrow.matches;
    renderer.shadowMap.needsUpdate = true;
    resize();
    wake();
  });
  /* Zmiana jezyka albo doladowanie kroju zmienia wysokosc sekcji — mierzymy
     akt od nowa, zeby postep dalej konczyl sie dokladnie na manifescie */
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);

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

  /* Gdyby przegladarka zabrala kontekst 3D (slaby sprzet, uspiony laptop),
     wracamy do plaskiej monogramy zamiast zostawiac puste plotno */
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    sleep();
    ready = false;
    root.classList.remove('has-mono3d');
    canvas.classList.remove('is-on');
  });

  /* Ciemny motyw: jasny metal na czarnym tle traci odbicia, wiec dokladamy
     otoczeniu mocy. */
  const applyTheme = () => {
    dark = root.dataset.theme === 'dark';
    key.intensity = dark ? 2.6 : 1.9;
    rim.intensity = dark ? 1.6 : .9;
    renderer.toneMappingExposure = dark ? 1.2 : 1.05;
    shadowBase = dark ? .28 : .15;
    place();
    frame();
  };
  new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
}
