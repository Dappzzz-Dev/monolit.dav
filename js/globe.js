// TAG: Globe - interactive Earth rendered with Three.js.
// The scene uses local Natural Earth data so it works without a second API request.

import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

// TAG: Globe configuration. Keep these values in one place for easy tuning.
const CONFIG = {
  speed: 2,
  direction: 'left',
  initialLatitude: 23,
  initialLongitude: -23,
  scale: 8,
  dragSpeed: 5,
  smoothing: 8,
  detail: 5,
  dotSize: 5,
  dotDensity: 8,
  oceanColor: '#000000',
  dotColor: '#ffffff',
  outlineColor: '#ffffff',
  gridColor: '#d4d4d4',
  outlineOpacity: 0.7,
  gridOpacity: 0.22,
  showGrid: true,
  birthPlace: { lat: -7.68, lng: 110.84, label: 'I was born here' },
  // TAG: Tempat-tempat yang ingin dikunjungi - ditandai titik kecil di peta.
  // Koordinat pakai nama negara/kota populer (Tōkyō, Zürich, London, ...).
  visitPlaces: [
    { key: 'japan',       lat: 35.68, lng: 139.76 },
    { key: 'switzerland', lat: 47.37, lng: 8.54   },
    { key: 'london',      lat: 51.51, lng: -0.13  },
    { key: 'netherlands', lat: 52.37, lng: 4.90   },
    { key: 'usa',         lat: 40.71, lng: -74.01 },
  ],
};

// TAG: Label multi-bahasa untuk penanda di peta (di-sinkronkan via event
// `langchange` dari sistem i18n; ikut bahasa HTML yang diset i18n.js).
const LABELS = {
  id: {
    born: 'Aku lahir di sini',
    title: 'Tempat yang ingin kukunjungi',
    japan: 'Jepang', switzerland: 'Swiss', london: 'London',
    netherlands: 'Belanda', usa: 'Amerika',
  },
  en: {
    born: 'I was born here',
    japan: 'Japan', switzerland: 'Switzerland', london: 'London',
    netherlands: 'Netherlands', usa: 'USA',
  },
  ja: {
    born: 'ここで生まれた',
    title: '行きたい場所',
    japan: '日本', switzerland: 'スイス', london: 'ロンドン',
    netherlands: 'オランダ', usa: 'アメリカ',
  },
  es: {
    born: 'Nací aquí',
    title: 'Lugares que quiero visitar',
    japan: 'Japón', switzerland: 'Suiza', london: 'Londres',
    netherlands: 'Países Bajos', usa: 'EE. UU.',
  },
};

// TAG: Baca bahasa aktif dari <html lang> yang di-set i18n.js.
function getLang() {
  try { return document.documentElement.lang || 'en'; } catch (e) { return 'en'; }
}

// TAG: Ambil label sesuai bahasa aktif, fallback ke Inggris.
function label(key) {
  const lang = getLang();
  const pack = LABELS[lang] || LABELS.en;
  return pack[key] != null ? pack[key] : (LABELS.en[key] || '');
}

// TAG: Convert UI-style values into the internal values used by the scene.
function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

// TAG: Convert a color string into normalized RGBA values for canvas work.
function parseColor(input) {
  const value = String(input || '').trim();
  const match = value.match(/^#?([0-9a-f]{3,8})$/i);
  if (!match) return { r: 0, g: 0, b: 0, a: 1 };

  let hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split('').map((char) => char + char).join('');
  }
  if (hex.length === 6) hex += 'ff';

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    a: parseInt(hex.slice(6, 8), 16) / 255,
  };
}

// TAG: Convert geographic coordinates into points on a unit sphere.
function latLngToVector(lat, lng, radius) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lngRad = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(
    Math.cos(latRad) * Math.sin(lngRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.cos(lngRad) * radius,
  );
}

// TAG: Reduce GeoJSON detail to keep the outline light enough for a portfolio hero.
function simplifyRing(ring, detail) {
  if (!ring || ring.length < 2 || detail >= 10) return ring;
  const step = Math.max(1, Math.floor(mapRange(detail, 1, 10, 10, 1)));
  const result = [ring[0]];
  for (let index = step; index < ring.length - 1; index += step) {
    result.push(ring[index]);
  }
  result.push(ring[ring.length - 1]);
  return result;
}

// TAG: Normalize both standard GeoJSON pairs and the compact flat rings in the bundled asset.
function normalizeRing(ring) {
  if (!Array.isArray(ring) || ring.length < 2) return [];
  if (Array.isArray(ring[0])) return ring;
  const pairs = [];
  for (let index = 0; index + 1 < ring.length; index += 2) {
    pairs.push([ring[index], ring[index + 1]]);
  }
  return pairs;
}

// TAG: Find rings in standard GeoJSON and in the flattened rings from the bundled asset.
function extractRings(geometry) {
  const rings = [];
  const visit = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length === 0) return;
    if (typeof coordinates[0] === 'number') {
      rings.push(coordinates);
      return;
    }
    if (Array.isArray(coordinates[0]) && typeof coordinates[0][0] === 'number') {
      rings.push(coordinates);
      return;
    }
    coordinates.forEach(visit);
  };
  visit(geometry?.coordinates);
  return rings;
}

// TAG: Draw land into a bitmap. The bitmap becomes the source of truth for land dots.
function createLandMask(features, width = 2048, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is not supported in this browser.');

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#fff';
  context.beginPath();

  const drawRing = (ring) => {
    const points = normalizeRing(ring);
    if (points.length < 2) return;
    points.forEach(([lng, lat], index) => {
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
  };

  features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;
    extractRings(geometry).forEach(drawRing);
  });
  context.fill();

  return context.getImageData(0, 0, width, height).data;
}

// TAG: Read a point from the land bitmap, including longitude wraparound.
function isLand(mask, lng, lat, width, height) {
  const x = ((Math.round(((lng + 180) / 360) * width) % width) + width) % width;
  const y = Math.max(0, Math.min(height - 1, Math.round(((90 - lat) / 180) * height)));
  return mask[(y * width + x) * 4] > 128;
}

// TAG: Create a subtle wire grid that follows the globe surface.
function createGrid(radius) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: CONFIG.gridColor,
    transparent: true,
    opacity: CONFIG.gridOpacity,
  });

  for (let latitude = -75; latitude <= 75; latitude += 15) {
    const points = [];
    for (let longitude = -180; longitude <= 180; longitude += 5) {
      points.push(latLngToVector(latitude, longitude, radius * 1.002));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  for (let longitude = -180; longitude < 180; longitude += 15) {
    const points = [];
    for (let latitude = -90; latitude <= 90; latitude += 5) {
      points.push(latLngToVector(latitude, longitude, radius * 1.002));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }
  return group;
}

// TAG: Create continent outlines from the same local data used for the dots.
function createLandOutlines(features, radius) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: CONFIG.outlineColor,
    transparent: true,
    opacity: CONFIG.outlineOpacity,
  });

  const addRing = (ring) => {
    const simplified = simplifyRing(normalizeRing(ring), CONFIG.detail);
    const points = simplified.map(([lng, lat]) => latLngToVector(lat, lng, radius * 1.006));
    if (points.length > 1) {
      points.push(points[0].clone());
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
    }
  };

  features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;
    extractRings(geometry).forEach(addRing);
  });
  return group;
}

// TAG: Create instanced dots only on land, matching the supplied Originkit globe logic.
function createLandDots(mask, radius, width, height) {
  const coordinates = [];
  const spacing = mapRange(CONFIG.dotDensity, 1, 10, 2, 0.75);

  for (let latitude = -90; latitude <= 90; latitude += spacing) {
    const cosine = Math.cos(THREE.MathUtils.degToRad(latitude));
    const longitudeStep = cosine > 0.02 ? spacing / Math.max(0.3, cosine) : 360;
    for (let longitude = -180; longitude < 180; longitude += longitudeStep) {
      if (isLand(mask, longitude, latitude, width, height)) {
        coordinates.push([longitude, latitude]);
      }
    }
  }

  const geometry = new THREE.SphereGeometry(
    radius * mapRange(CONFIG.dotSize, 1, 10, 0.0015, 0.006),
    4,
    4,
  );
  const material = new THREE.MeshBasicMaterial({ color: CONFIG.dotColor });
  const dots = new THREE.InstancedMesh(geometry, material, coordinates.length);
  const matrix = new THREE.Matrix4();

  coordinates.forEach(([longitude, latitude], index) => {
    matrix.setPosition(latLngToVector(latitude, longitude, radius * 1.012));
    dots.setMatrixAt(index, matrix);
  });
  dots.instanceMatrix.needsUpdate = true;
  return dots;
}

// TAG: Prefer the complete world dataset, then keep the bundled file as an offline fallback.
async function loadLandData() {
  const sources = [
    'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/physical/ne_50m_land.json',
    './assets/ne_50m_land.json',
  ];
  let lastError;

  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Land data request failed (${response.status}).`);
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  // TAG: The ocean/grid can still render when both data sources are unavailable.
  console.warn('[Globe] Land data unavailable; rendering the base globe.', lastError);
  return { features: [] };
}

// TAG: Mount the globe and return a cleanup function for future page transitions.
async function mountGlobe() {
  const container = document.getElementById('globe-container');
  if (!container) return;

  let renderer;
  let resizeObserver;
  let animationFrame;

  try {
    const world = await loadLandData();
    const features = Array.isArray(world.features) ? world.features : [];

    const radius = mapRange(CONFIG.scale, 1, 20, 0.8, 1.45);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const rendererWidth = container.clientWidth || 600;
    const rendererHeight = container.clientHeight || 400;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(rendererWidth, rendererHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label', 'Interactive rotating globe');
    renderer.domElement.style.touchAction = 'none';
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.replaceChildren(renderer.domElement);

    // TAG: Camera distance keeps the full globe visible at every supported scale.
    const fitCamera = () => {
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 400;
      camera.aspect = width / height;
      camera.position.set(0, 0, radius / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.08);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    fitCamera();

    // TAG: Build the scene layers in a deliberate order for clean depth and contrast.
    const globe = new THREE.Group();
    globe.rotation.y = THREE.MathUtils.degToRad(CONFIG.initialLongitude);
    globe.rotation.x = THREE.MathUtils.degToRad(CONFIG.initialLatitude);
    scene.add(globe);
    const ocean = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.MeshBasicMaterial({ color: CONFIG.oceanColor }),
    );
    globe.add(ocean);
    if (CONFIG.showGrid) globe.add(createGrid(radius));
    globe.add(createLandOutlines(features, radius));

    const maskWidth = 1024;
    const maskHeight = 512;
    // honey: mask 1024x512 (was 2048x1024) — cukup untuk menempatkan titik-titik
    // benua; mempercepat pembentukan mask saat load tanpa beda visual berarti.
    const landMask = createLandMask(features, maskWidth, maskHeight);
    globe.add(createLandDots(landMask, radius, maskWidth, maskHeight));

    // TAG: Birthplace marker. Coordinates point to the Sukoharjo/Solo area in Central Java.
    const birthMarkerMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const birthMarker = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.017, 16, 16),
      birthMarkerMaterial,
    );
    birthMarker.position.copy(
      latLngToVector(CONFIG.birthPlace.lat, CONFIG.birthPlace.lng, radius * 1.025),
    );
    globe.add(birthMarker);

    // TAG: HTML label stays crisp and readable while its 3D marker follows the globe.
    const birthLabel = document.createElement('div');
    birthLabel.className = 'birth-marker';
    birthLabel.setAttribute('role', 'status');
    birthLabel.innerHTML = '<span class="birth-marker__pin" aria-hidden="true"></span><span class="birth-marker__text"></span>';
    container.appendChild(birthLabel);

    // TAG: Titik tujuan tetap putih agar menyatu dengan dot globe tanpa panel legenda.
    const visitDotGeometry = new THREE.SphereGeometry(radius * 0.014, 16, 16);
    const visitDotMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    const visitDots = new THREE.InstancedMesh(
      visitDotGeometry,
      visitDotMaterial,
      CONFIG.visitPlaces.length,
    );
    // TAG: Instances are spread across the sphere; the default local bounds
    // can cull the complete marker mesh even while individual dots are visible.
    visitDots.frustumCulled = false;
    visitDots.renderOrder = 2;
    const visitMatrix = new THREE.Matrix4();
    CONFIG.visitPlaces.forEach((place, index) => {
      visitMatrix.setPosition(latLngToVector(place.lat, place.lng, radius * 1.025));
      visitDots.setMatrixAt(index, visitMatrix);
    });
    visitDots.instanceMatrix.needsUpdate = true;
    globe.add(visitDots);

    // TAG: Posisi lokal tiap titik kunjungan (dipakai untuk proyeksi label),
    // dikunci ke permukaan bola seperti penanda lahir.
    const visitPositions = CONFIG.visitPlaces.map((place) =>
      latLngToVector(place.lat, place.lng, radius * 1.025),
    );

    const birthText = birthLabel.querySelector('.birth-marker__text');

    // TAG: Label nama kota untuk tiap titik kunjungan, mengikuti posisi titik
    // di bola (muncul hanya saat titik ada di sisi yang menghadap kamera).
    const visitLabels = CONFIG.visitPlaces.map(() => {
      const el = document.createElement('div');
      el.className = 'visit-marker';
      el.innerHTML = '<span class="visit-marker__text"></span>';
      container.appendChild(el);
      return el;
    });

    // TAG: Render ulang label sesuai bahasa aktif (dipanggil saat mount dan langchange).
    const renderLabels = () => {
      if (birthText) birthText.textContent = label('born');
      visitLabels.forEach((el, index) => {
        el.querySelector('.visit-marker__text').textContent =
          `I want go to ${label(CONFIG.visitPlaces[index].key)}`;
      });
    };
    const onLangChange = () => renderLabels();
    window.addEventListener('langchange', onLangChange);
    renderLabels();

    // TAG: Pointer interaction state. Dragging changes the target, not the rendered rotation directly.
    const target = {
      x: THREE.MathUtils.degToRad(CONFIG.initialLongitude),
      y: THREE.MathUtils.degToRad(CONFIG.initialLatitude),
    };
    const current = { x: target.x, y: target.y };
    const velocity = { x: 0, y: 0 };
    const smoothing = mapRange(Math.max(0, Math.min(10, CONFIG.smoothing)), 0, 10, 0.4, 0.03);
    const sensitivity = mapRange(CONFIG.dragSpeed, 0, 10, 0.001, 0.02);
    const autoSpeed = mapRange(CONFIG.speed, 0, 10, 0, 0.009) * (CONFIG.direction === 'left' ? -1 : 1);
    let pointerActive = false;
    let dragging = false;
    let lastPointer = { x: 0, y: 0 };
    let dragOrigin = { x: 0, y: 0 };

    const clampLatitude = () => {
      target.y = THREE.MathUtils.clamp(target.y, -Math.PI / 2, Math.PI / 2);
    };
    const onPointerDown = (event) => {
      pointerActive = true;
      dragging = false;
      velocity.x = 0;
      velocity.y = 0;
      lastPointer = { x: event.clientX, y: event.clientY };
      dragOrigin = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event) => {
      if (!pointerActive) return;
      const originDistance = Math.hypot(
        event.clientX - dragOrigin.x,
        event.clientY - dragOrigin.y,
      );
      // TAG: A hover or stationary click never pauses auto-rotation.
      if (!dragging && originDistance < 3) return;
      dragging = true;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      target.x += dx * sensitivity;
      target.y += dy * sensitivity;
      velocity.x = dx * sensitivity * 0.3;
      velocity.y = dy * sensitivity * 0.3;
      clampLatitude();
      lastPointer = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event) => {
      pointerActive = false;
      dragging = false;
      renderer.domElement.releasePointerCapture?.(event.pointerId);
    };

    const onWheel = (event) => {
      event.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + event.deltaY * 0.002,
        radius * 1.35,
        radius * 5,
      );
    };

    // TAG: Project the marker to the label and hide it while the marker is on the far side.
    const markerScreenPosition = new THREE.Vector3();
    const markerViewDirection = new THREE.Vector3();
    const cameraViewDirection = new THREE.Vector3();
    const visitScreenPosition = new THREE.Vector3();
    const visitViewDirection = new THREE.Vector3();
    const updateBirthLabel = () => {
      birthMarker.getWorldPosition(markerScreenPosition);
      markerViewDirection.copy(markerScreenPosition).normalize();
      cameraViewDirection.copy(camera.position).normalize();
      // TAG: 0.55 keeps the marker inside the central viewing area, not at the horizon.
      const visible = markerViewDirection.dot(cameraViewDirection) > 0.55;
      birthLabel.classList.toggle('is-visible', visible);
      birthLabel.setAttribute('aria-hidden', String(!visible));
      markerScreenPosition.project(camera);
      birthLabel.style.left = `${(markerScreenPosition.x * 0.5 + 0.5) * container.clientWidth}px`;
      birthLabel.style.top = `${(-markerScreenPosition.y * 0.5 + 0.5) * container.clientHeight}px`;
      const targetOpacity = visible ? 1 : 0;
      birthMarkerMaterial.opacity += (targetOpacity - birthMarkerMaterial.opacity) * 0.18;
    };
    // TAG: Proyeksikan label tiap titik kunjungan; label hanya muncul saat
    // titik ada di sisi bola yang menghadap kamera (persis perilaku marker lahir).
    const updateVisitLabels = () => {
      const visibleIndexes = [];
      for (let i = 0; i < visitPositions.length; i += 1) {
        const el = visitLabels[i];
        if (!el) continue;
        markerViewDirection
          .copy(visitPositions[i])
          .applyQuaternion(globe.quaternion)
          .normalize();
        visitViewDirection.copy(camera.position).normalize();
        const visible = markerViewDirection.dot(visitViewDirection) > 0.55;
        if (!visible) {
          el.classList.remove('is-visible');
          el.setAttribute('aria-hidden', 'true');
          continue;
        }
        visitScreenPosition.copy(visitPositions[i]).applyQuaternion(globe.quaternion);
        visitScreenPosition.project(camera);
        el.style.left = `${(visitScreenPosition.x * 0.5 + 0.5) * container.clientWidth}px`;
        el.style.top = `${(-visitScreenPosition.y * 0.5 + 0.5) * container.clientHeight}px`;
        el.classList.add('is-visible');
        el.setAttribute('aria-hidden', 'false');
        visibleIndexes.push(i);
      }
      visitLabels.forEach((el) => el.classList.remove('is-current'));
      if (visibleIndexes.length) {
        const currentIndex = visibleIndexes[visitFocusIndex % visibleIndexes.length];
        visitLabels[currentIndex].classList.add('is-current');
      }
    };
    let visitFocusIndex = 0;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const visitFocusTimer = prefersReducedMotion ? null : window.setInterval(() => {
      visitFocusIndex += 1;
      updateVisitLabels();
    }, 2800);

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // TAG: Render loop blends drag inertia, smooth rotation, and natural auto-rotation.
    const animate = () => {
      if (!dragging) target.x += autoSpeed;
      if (!dragging) {
        target.x += velocity.x;
        target.y += velocity.y;
        velocity.x *= 0.94;
        velocity.y *= 0.94;
        clampLatitude();
      }
      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;
      globe.rotation.y = current.x;
      globe.rotation.x = current.y;
      globe.updateMatrixWorld();
      updateBirthLabel();
      updateVisitLabels();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    resizeObserver = new ResizeObserver(fitCamera);
    resizeObserver.observe(container);
    animate();

    // TAG: Cleanup removes listeners, observers, animation frames, and GPU resources.
    window.globeCleanup = () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      birthLabel.remove();
      visitLabels.forEach((el) => el.remove());
      window.clearInterval(visitFocusTimer);
      window.removeEventListener('langchange', onLangChange);
      scene.traverse((object) => {
        if (!object.isMesh && !object.isLine) return;
        object.geometry?.dispose();
        object.material?.dispose();
      });
      renderer.dispose();
      container.replaceChildren();
    };
  } catch (error) {
    // TAG: Keep the page usable when WebGL or the local map asset is unavailable.
    console.error('[Globe] Unable to initialize:', error);
    const reason = error instanceof Error ? error.message : String(error);
    const message = document.createElement('div');
    message.className = 'globe-error';
    message.setAttribute('role', 'status');
    const title = document.createElement('strong');
    title.textContent = 'Earth visualization unavailable.';
    const detail = document.createElement('small');
    detail.textContent = reason;
    message.append(title, detail);
    container.replaceChildren(message);
  }
}

// TAG: Start after the module has loaded.
// honey: only boot the 3D globe on larger screens. The WebGL render loop + the
// land-dot particles are the heaviest cost on phones; on narrow (<900px) we
// skip the mount entirely so mobile stays smooth (hero falls back to CSS).
if(!matchMedia('(max-width:900px)').matches){
  mountGlobe();
}
