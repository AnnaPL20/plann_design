/* =============================================================================
   PLANN Design — szklana bryla w sekcji hero (three.js, kopia lokalna)
   Zaokraglony szescian z materialem transmisyjnym: powolny obrot i lagodne
   przechylenie za kursorem. Biblioteka laduje sie dopiero wtedy, gdy naprawde
   jest potrzebna, wiec nie obciaza pierwszego ekranu.
   Brak WebGL lub slabe urzadzenie -> sekcja zostaje taka, jaka byla.
   ============================================================================= */

const hero = document.querySelector('.hero');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Warunki wstepne ---------- */
const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
};

const cores = navigator.hardwareConcurrency || 4;
const memory = navigator.deviceMemory || 4;
const weak = cores <= 3 || memory <= 3;
const small = matchMedia('(max-width: 768px)').matches;

if (hero && !reduceMotion && hasWebGL() && !(weak && small)) {
  /* Start po zaladowaniu strony i w wolnej chwili przegladarki */
  const boot = () => { start().catch(() => { /* cicho: strona dziala bez 3D */ }); };
  const idle = () => (window.requestIdleCallback || (cb => setTimeout(cb, 400)))(boot, { timeout: 2500 });
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}

async function start() {
  const THREE = await import('./vendor/three.module.min.js');

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !small });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); // twardy limit dpr
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  /* ---------- Otoczenie: kilka swiecacych plaszczyzn zapieczonych w PMREM ----------
     Wlasna scenka zamiast pliku HDR — zero dodatkowych pobran. */
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x0d0d10);
  const panel = (color, intensity, x, y, z, sx, sy) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(sx, sy),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
    );
    m.material.color.multiplyScalar(intensity);
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    envScene.add(m);
  };
  panel(0xffffff, 3.4, 0, 6, 2, 10, 10);     // gorne swiatlo kluczowe
  panel(0xffe9e4, 1.9, -6, 1, 3, 8, 10);     // cieply odblask z lewej
  panel(0xdfe4ff, 1.5, 6, -1, -3, 8, 10);    // chlodny odblask z prawej
  panel(0xff3d2e, 0.9, 2, -5, 4, 8, 6);      // akcent marki od dolu

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(envScene, 0.03).texture;
  scene.environment = envMap;
  pmrem.dispose();

  /* ---------- Geometria: kula wygieta w zaokraglony szescian (superelipsoida) ---------- */
  const segments = small || weak ? 48 : 112;
  const rings = small || weak ? 32 : 72;
  const geometry = new THREE.SphereGeometry(1, segments, rings);
  const pos = geometry.attributes.position;
  const R = 1.22;
  const N = 4.2; // im wieksze, tym ostrzejsze naroza
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const k = Math.pow(
      Math.pow(Math.abs(v.x), N) + Math.pow(Math.abs(v.y), N) + Math.pow(Math.abs(v.z), N),
      -1 / N
    );
    pos.setXYZ(i, v.x * k * R, v.y * k * R, v.z * k * R);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transmission: 1,
    thickness: 1.5,
    ior: 1.47,
    dispersion: small || weak ? 0 : 1.2,   // delikatna aberracja chromatyczna
    iridescence: 0.28,
    iridescenceIOR: 1.28,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    attenuationColor: new THREE.Color(0xfff3f1),
    attenuationDistance: 6,
    envMapIntensity: 1.15
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.set(0.42, 0.6, 0.12);
  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 5);
  scene.add(key);

  /* ---------- Rozmiar ---------- */
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize, { passive: true });

  /* ---------- Przechylenie za kursorem ---------- */
  let tiltX = 0, tiltY = 0, curX = 0, curY = 0;
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      tiltY = (e.clientX / innerWidth - 0.5) * 0.5;
      tiltX = (e.clientY / innerHeight - 0.5) * 0.34;
    }, { passive: true });
  }

  /* ---------- Petla renderowania: pauza, gdy hero jest poza ekranem ---------- */
  let running = true;
  let frame = 0;
  const visible = () => !document.hidden && scrollY < innerHeight * 1.15;

  const loop = () => {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    if (!visible()) return;
    mesh.rotation.y += 0.0022;
    mesh.rotation.z = Math.sin(performance.now() * 0.00016) * 0.07;
    curX += (tiltX - curX) * 0.045;
    curY += (tiltY - curY) * 0.045;
    mesh.rotation.x = 0.42 + curX;
    mesh.position.x = curY * 0.35;
    renderer.render(scene, camera);
  };

  hero.classList.add('has-3d');
  loop();

  addEventListener('pagehide', () => { running = false; cancelAnimationFrame(frame); });
}
