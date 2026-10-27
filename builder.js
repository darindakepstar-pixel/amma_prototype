// АММА · 3D-конструктор букета · design & code: Дария Кромберг
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

/* ───────────── Каталог ───────────── */
const FLOWERS = [
  { id: 'rose', name: 'Роза', note: '50–60 см', size: 1, variants: [['Красная', '#B3203A'], ['Розовая', '#F08CA0'], ['Кремовая', '#F3E3C8'], ['Белая', '#F7F5F0']] },
  { id: 'peony', name: 'Пионовидная роза', note: 'Крупный бутон', size: 1.2, variants: [['Кремовая', '#F4E1C6'], ['Розовая', '#F3B4C2'], ['Коралловая', '#F39A86']] },
  { id: 'spray', name: 'Кустовая роза', note: '3–5 бутонов', size: 0.95, variants: [['Пудровая', '#E8B9B0'], ['Персиковая', '#F5BE94'], ['Белая', '#F7F5F0']] },
  { id: 'eustoma', name: 'Эустома', note: 'Нежная, как пион', size: 1, variants: [['Сиреневая', '#C9A8E0'], ['Белая', '#F7F5F0'], ['Пудровая', '#EBC3C8']] },
  { id: 'tulip', name: 'Тюльпан', note: 'Сезонный', size: 0.9, variants: [['Розовый', '#F28CA6'], ['Красный', '#D0283C'], ['Белый', '#F7F5F0'], ['Жёлтый', '#F6CF5A']] },
  { id: 'carnation', name: 'Гвоздика', note: 'Стойкая', size: 0.85, variants: [['Бордо', '#7A1E2C'], ['Розовая', '#F29BB0'], ['Белая', '#F7F5F0']] },
  { id: 'chrys', name: 'Хризантема кустовая', note: 'Ромашковидная', size: 1, variants: [['Белая', '#F7F5F0'], ['Жёлтая', '#F2D27A'], ['Сиреневая', '#D7B6E6']] },
  { id: 'alstro', name: 'Альстромерия', note: 'Стоит до 2 недель', size: 0.95, variants: [['Персиковая', '#F5A86E'], ['Розовая', '#F2A0B8'], ['Белая', '#F7F5F0']] },
  { id: 'hydrangea', name: 'Гортензия', note: 'Объём и воздух', size: 1.7, variants: [['Голубая', '#A9BFE6'], ['Белая', '#F2F2EC'], ['Розовая', '#F2BFD0']] }
];
const GREENS = [
  { id: 'euca', name: 'Эвкалипт', note: 'Серебристый', color: '#8FB3A0' },
  { id: 'pist', name: 'Фисташка', note: 'Сочная зелень', color: '#4F7F55' },
  { id: 'ruscus', name: 'Рускус', note: 'Тонкие листья', color: '#3F7A4A' },
  { id: 'gyps', name: 'Гипсофила', note: 'Белое облако', color: '#FFFFFF' }
];
const WRAPS = [
  { id: 'kraft', name: 'Крафт', color: '#D9C3A0' },
  { id: 'white', name: 'Белая матовая', color: '#F4F2EE' },
  { id: 'graphite', name: 'Графитовая', color: '#2B2E33' },
  { id: 'blush', name: 'Пудровая', color: '#EED3D3' },
  { id: 'film', name: 'Прозрачная плёнка', color: '#DDEAF0' },
  { id: 'none', name: 'Без упаковки', color: null }
];
const RIBBONS = [['Чёрная', '#1F2124'], ['Белая', '#FFFFFF'], ['Золото', '#C9A96E'], ['Зелёная', '#2F6B4F'], ['Пудровая', '#F3B4C2'], ['Красная', '#B3203A']];
const PRESETS = {
  'Классика': { flowers: { 'rose:0': 15 }, greens: { euca: 3 }, wrap: 'kraft', ribbon: 0 },
  'Нежный': { flowers: { 'peony:0': 5, 'eustoma:1': 4, 'spray:0': 3 }, greens: { euca: 3, gyps: 2 }, wrap: 'white', ribbon: 2 },
  'Яркий': { flowers: { 'tulip:3': 7, 'alstro:0': 5, 'chrys:1': 3 }, greens: { pist: 3 }, wrap: 'graphite', ribbon: 2 },
  'Облако': { flowers: { 'hydrangea:0': 3, 'rose:3': 7 }, greens: { gyps: 4, ruscus: 2 }, wrap: 'film', ribbon: 1 }
};
const MAX_STEMS = 101;

const state = { flowers: {}, greens: {}, wrap: 'kraft', ribbon: 0, card: '', tab: 'flowers', auto: true, picked: {} };
FLOWERS.forEach(f => { state.picked[f.id] = 0; });

/* ───────────── Сцена ───────────── */
const stageEl = document.getElementById('bq-stage');
const canvas = document.getElementById('bq-canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
} catch (e) {
  document.getElementById('bq-nogl').hidden = false;
  throw e;
}
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
camera.position.set(0, 1.9, 5.0);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1.0, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.2;
controls.maxDistance = 9;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 1.75;
controls.autoRotate = !reduce;
controls.autoRotateSpeed = 1.1;
let idleTimer = null;
controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idleTimer); });
controls.addEventListener('end', () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => { controls.autoRotate = state.auto && !reduce; }, 3500); });

scene.add(new THREE.HemisphereLight(0xffffff, 0xd8e4da, 0.95));
const sun = new THREE.DirectionalLight(0xfff3e6, 2.1); sun.position.set(3, 5, 4); scene.add(sun);
const rim = new THREE.DirectionalLight(0xe6f0ff, 0.7); rim.position.set(-4, 3, -3); scene.add(rim);

// мягкая тень под парящим букетом
const shTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(31,33,36,0.45)'); gr.addColorStop(1, 'rgba(31,33,36,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.32; scene.add(shadow);

const bouquet = new THREE.Group(); scene.add(bouquet);
const stemsGroup = new THREE.Group(); bouquet.add(stemsGroup);
const wrapGroup = new THREE.Group(); bouquet.add(wrapGroup);
const BIND = new THREE.Vector3(0, 0.55, 0);

/* ───────────── Материалы и геометрии ───────────── */
const matCache = new Map();
function mat(color, opts) {
  const key = color + JSON.stringify(opts || {});
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(color), roughness: 0.62, metalness: 0, side: THREE.DoubleSide }, opts || {})));
  return matCache.get(key);
}
const shade = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
const G = {
  stem: new THREE.CylinderGeometry(0.009, 0.011, 1, 6, 1).translate(0, 0.5, 0),
  bud: new THREE.SphereGeometry(0.06, 14, 10),
  calyx: new THREE.ConeGeometry(0.05, 0.07, 8, 1, true),
  disc: new THREE.CircleGeometry(0.034, 10),
  dot: new THREE.SphereGeometry(0.012, 6, 4),
  floret: new THREE.CircleGeometry(0.036, 4),
  leaf: new THREE.SphereGeometry(1, 10, 6),
  trumpet: new THREE.ConeGeometry(0.045, 0.11, 7, 1, true)
};
const petalGeo = (r, phiLen, thetaStart) => new THREE.SphereGeometry(r, 16, 10, 0, phiLen, thetaStart, Math.PI - thetaStart).translate(0, r * 0.75, 0);
const PG = {
  r1: petalGeo(0.062, 1.9, 0.32), r2: petalGeo(0.08, 1.75, 0.55), r3: petalGeo(0.098, 1.55, 0.85),
  p1: petalGeo(0.072, 1.8, 0.35), p2: petalGeo(0.095, 1.65, 0.6), p3: petalGeo(0.118, 1.5, 0.9),
  tulip: petalGeo(0.09, 1.3, 0.3), eus: petalGeo(0.105, 1.6, 0.8)
};
const carnGeo = (() => {
  const g = new THREE.SphereGeometry(0.1, 28, 18, 0, Math.PI * 2, 0, 1.75);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x), n = 1 + 0.12 * Math.sin(a * 14 + v.y * 60) + 0.06 * Math.sin(a * 31);
    v.x *= n; v.z *= n; v.y *= 0.8; p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
})();

/* ───────────── Модели цветов (голова смотрит вверх по +Y) ───────────── */
function ring(group, geo, count, color, tilt, offset) {
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geo, mat(color));
    m.rotation.set(0, (i / count) * Math.PI * 2 + (offset || 0), 0);
    if (tilt) { const g = new THREE.Group(); g.add(m); g.rotation.z = tilt; const o = new THREE.Group(); o.add(g); o.rotation.y = (i / count) * Math.PI * 2; m.rotation.y = 0; group.add(o); }
    else group.add(m);
  }
}
function petalGeometry(w, h, cup, curl) {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.bezierCurveTo(w * 0.72, h * 0.04, w * 0.8, h * 0.72, w * 0.38, h * 0.98);
  sh.quadraticCurveTo(0, h * 1.1, -w * 0.38, h * 0.98);
  sh.bezierCurveTo(-w * 0.8, h * 0.72, -w * 0.72, h * 0.04, 0, 0);
  const g = new THREE.ShapeGeometry(sh, 10), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, -cup * (x * x) / (w * w) * h * 0.55 + curl * Math.pow(y / h, 3) * h * 0.45);
  }
  g.computeVertexNormals();
  return g;
}
const PETAL = {
  rS: petalGeometry(0.06, 0.085, 0.9, 0.0), rM: petalGeometry(0.066, 0.09, 0.7, 0.25), rL: petalGeometry(0.07, 0.092, 0.5, 0.55),
  tulip: petalGeometry(0.058, 0.13, 0.85, -0.1), eus: petalGeometry(0.075, 0.1, 0.55, 0.35)
};
function spiralHead(color, n, tiltA, tiltB, scaleA, scaleB) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(G.bud, mat(shade(color, 0.8))); core.scale.set(0.6, 0.75, 0.6); core.position.y = 0.03; g.add(core);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1), geo = t < 0.35 ? PETAL.rS : t < 0.7 ? PETAL.rM : PETAL.rL;
    const m = new THREE.Mesh(geo, mat(shade(color, 0.84 + t * 0.18)));
    m.position.z = 0.003 + t * 0.014; m.rotation.x = tiltA + t * (tiltB - tiltA); m.scale.setScalar(scaleA + t * (scaleB - scaleA));
    const pv = new THREE.Group(); pv.rotation.y = i * 2.39996; pv.add(m); g.add(pv);
  }
  const cx = new THREE.Mesh(G.calyx, mat('#4F7F55')); cx.rotation.x = Math.PI; cx.position.y = -0.01; cx.scale.setScalar(0.8); g.add(cx);
  return g;
}
function roseHead(color, big) { return big ? spiralHead(color, 30, 0.04, 1.05, 0.55, 1.2) : spiralHead(color, 20, 0.03, 0.78, 0.6, 1.12); }
function sprayHead(color) {
  const g = new THREE.Group();
  [[0, 0.06, 0], [0.11, -0.02, 0.03], [-0.09, -0.03, 0.06], [0.02, -0.05, -0.11]].forEach(([x, y, z], i) => {
    const h = roseHead(color, false); h.scale.setScalar(i === 0 ? 0.62 : 0.5); h.position.set(x, y, z); h.rotation.set(z * 3, 0, -x * 3); g.add(h);
    const st = new THREE.Mesh(G.stem, mat('#5E8F5C')); st.scale.set(0.6, Math.hypot(x, y + 0.1, z) + 0.02, 0.6); st.position.set(0, -0.1, 0);
    st.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y + 0.1, z).normalize()); g.add(st);
  });
  return g;
}
function eustomaHead(color) {
  const g = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const t = i / 8, m = new THREE.Mesh(PETAL.eus, mat(shade(color, 0.9 + t * 0.1)));
    m.position.z = 0.008; m.rotation.x = 0.35 + t * 0.45; m.scale.setScalar(0.85 + t * 0.25);
    const pv = new THREE.Group(); pv.rotation.y = i * 2.39996; pv.add(m); g.add(pv);
  }
  const c = new THREE.Mesh(G.bud, mat('#D9D49A')); c.scale.setScalar(0.28); c.position.y = 0.03; g.add(c);
  return g;
}
function tulipHead(color) {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(PETAL.tulip, mat(i % 2 ? color : shade(color, 0.9)));
    m.position.z = i % 2 ? 0.022 : 0.014; m.rotation.x = 0.14 + (i % 2) * 0.06;
    const pv = new THREE.Group(); pv.rotation.y = i * (Math.PI / 3) + (i % 2) * 0.2; pv.add(m); g.add(pv);
  }
  return g;
}
function carnationHead(color) {
  const g = new THREE.Group(); const m = new THREE.Mesh(carnGeo, mat(color)); g.add(m);
  const cx = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.09, 8), mat('#6E9A6B')); cx.position.y = -0.05; g.add(cx); return g;
}
function daisy(color) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 6), mat(color === '#F2D27A' ? '#C98E2E' : '#E3C35A')); c.scale.y = 0.6; g.add(c);
  for (let i = 0; i < 16; i++) { const p = new THREE.Mesh(G.leaf, mat(color)); p.scale.set(0.012, 0.004, 0.05); const a = i / 16 * Math.PI * 2; p.position.set(Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05); p.rotation.y = -a + Math.PI / 2; p.rotation.x = 0.25; g.add(p); }
  return g;
}
function chrysHead(color) {
  const g = new THREE.Group();
  [[0, 0.05, 0], [0.1, 0, 0.04], [-0.08, -0.01, 0.07], [0.03, -0.02, -0.1], [-0.09, 0.02, -0.05]].forEach(([x, y, z]) => { const d = daisy(color); d.position.set(x, y, z); d.rotation.set(z * 2.5, 0, -x * 2.5); g.add(d); });
  return g;
}
function alstroHead(color) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2, t = new THREE.Mesh(G.trumpet, mat(i % 2 ? color : shade(color, 0.93)));
    t.position.set(Math.cos(a) * 0.05, 0.03, Math.sin(a) * 0.05); t.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); t.rotateX(Math.PI); g.add(t);
    const sp = new THREE.Mesh(G.dot, mat('#7A3A2A')); sp.position.copy(t.position).multiplyScalar(1.3); sp.position.y = 0.06; g.add(sp);
  }
  return g;
}
function hydrangeaHead(color) {
  const g = new THREE.Group(), N = 240, inst = new THREE.InstancedMesh(G.floret, mat(color), N);
  const dummy = new THREE.Object3D(), c = new THREE.Color(color), tmp = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N, th = Math.acos(1 - 1.7 * t), ph = i * 2.39996, r = 0.2;
    dummy.position.set(r * Math.sin(th) * Math.cos(ph), r * Math.cos(th) * 0.85, r * Math.sin(th) * Math.sin(ph));
    dummy.lookAt(dummy.position.clone().multiplyScalar(2)); dummy.rotateZ(ph); dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
    inst.setColorAt(i, tmp.copy(c).multiplyScalar(0.9 + ((i * 7919) % 100) / 500));
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 10), mat(shade(color, 0.8))); core.scale.y = 0.8; g.add(core, inst); return g;
}
function greenSprig(kind, color) {
  const g = new THREE.Group(), len = 0.55;
  const st = new THREE.Mesh(G.stem, mat(shade(color === '#FFFFFF' ? '#7FA27A' : color, 0.85))); st.scale.set(0.7, len, 0.7); g.add(st);
  const n = kind === 'gyps' ? 0 : 9;
  for (let i = 0; i < n; i++) {
    const y = 0.12 + (i / n) * (len - 0.12), side = i % 2 ? 1 : -1, l = new THREE.Mesh(kind === 'euca' ? G.disc : G.leaf, mat(color));
    if (kind === 'euca') { l.position.set(side * 0.03, y, 0); l.rotation.set(0.3, side * 0.6, 0); l.scale.setScalar(1 - i * 0.04); }
    else if (kind === 'pist') { l.scale.set(0.022, 0.06, 0.006); l.position.set(side * 0.04, y, 0); l.rotation.z = -side * 0.9; }
    else { l.scale.set(0.012, 0.045, 0.004); l.position.set(side * 0.025, y, 0); l.rotation.z = -side * 0.7; }
    g.add(l);
  }
  if (kind === 'gyps') {
    const N = 70, inst = new THREE.InstancedMesh(G.dot, mat('#FFFFFF', { roughness: 0.9 }), N), d = new THREE.Object3D();
    for (let i = 0; i < N; i++) { const a = i * 2.39996, r = 0.05 + ((i * 37) % 10) / 70; d.position.set(Math.cos(a) * r, len - 0.05 + ((i * 13) % 10) / 90, Math.sin(a) * r); d.scale.setScalar(0.8 + (i % 5) / 6); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); }
    g.add(inst);
  }
  return g;
}
const headCache = new Map();
function makeHead(id, color) {
  const key = id + color;
  if (!headCache.has(key)) {
    const f = { rose: () => roseHead(color, false), peony: () => roseHead(color, true), spray: () => sprayHead(color), eustoma: () => eustomaHead(color), tulip: () => tulipHead(color), carnation: () => carnationHead(color), chrys: () => chrysHead(color), alstro: () => alstroHead(color), hydrangea: () => hydrangeaHead(color) }[id];
    headCache.set(key, f());
  }
  return headCache.get(key).clone();
}

/* ───────────── Раскладка стеблей ───────────── */
const live = new Map(); // key -> {obj, stem, target, born}
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
function stemList() {
  const list = [];
  FLOWERS.forEach(f => f.variants.forEach((v, vi) => { const n = state.flowers[f.id + ':' + vi] || 0; for (let k = 0; k < n; k++) list.push({ key: `${f.id}:${vi}#${k}`, id: f.id, color: v[1], size: f.size, green: false }); }));
  GREENS.forEach(g => { const n = state.greens[g.id] || 0; for (let k = 0; k < n; k++) list.push({ key: `${g.id}#${k}`, id: g.id, color: g.color, size: 1, green: true }); });
  return list;
}
let domeR = 0.3;
function layout() {
  const list = stemList(), flowers = list.filter(s => !s.green), greens = list.filter(s => s.green);
  const area = flowers.reduce((a, s) => a + s.size * s.size, 0);
  domeR = 0.14 + 0.11 * Math.sqrt(area);
  flowers.sort((a, b) => (hash(a.key) - a.size * 0.35) - (hash(b.key) - b.size * 0.35));
  const N = flowers.length, center = new THREE.Vector3(0, 1.0 + domeR * 0.55, 0);
  flowers.forEach((s, i) => {
    const t = N === 1 ? 0 : (i + 0.5) / N, th = Math.acos(1 - t * (1 - Math.cos(1.25))), ph = i * 2.39996 + hash(s.key);
    s.pos = new THREE.Vector3(Math.sin(th) * Math.cos(ph) * domeR, Math.cos(th) * domeR * 0.55, Math.sin(th) * Math.sin(ph) * domeR).add(center);
  });
  greens.forEach((s, i) => {
    const ph = (i / Math.max(1, greens.length)) * Math.PI * 2 + hash(s.key) * 0.6, r = domeR * 1.05 + 0.05;
    s.pos = new THREE.Vector3(Math.cos(ph) * r, center.y - domeR * 0.35 + hash(s.key + 'y') * 0.12, Math.sin(ph) * r);
  });
  const keys = new Set(list.map(s => s.key));
  for (const [k, o] of live) if (!keys.has(k)) { o.dying = performance.now(); }
  list.forEach(s => {
    let o = live.get(s.key);
    if (!o || o.dying) {
      if (o) { stemsGroup.remove(o.obj, o.stem); }
      const obj = s.green ? greenSprig(s.id, s.color) : makeHead(s.id, s.color);
      const stem = new THREE.Mesh(G.stem, mat(s.green ? shade(s.color === '#FFFFFF' ? '#7FA27A' : s.color, 0.85) : '#5E8F5C'));
      obj.scale.setScalar(0.001); stemsGroup.add(obj, stem);
      o = { obj, stem, cur: s.pos.clone().lerp(BIND, 0.4), born: performance.now(), green: s.green, size: s.size };
      live.set(s.key, o);
    }
    o.target = s.pos;
  });
  updateWrap();
}
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3(), tmpD = new THREE.Vector3();
function easeOutBack(x) { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
function animateStems(now) {
  for (const [k, o] of live) {
    let sc;
    if (o.dying) {
      const t = Math.min(1, (now - o.dying) / 300); sc = 1 - t;
      if (t >= 1) { stemsGroup.remove(o.obj, o.stem); live.delete(k); continue; }
    } else sc = easeOutBack(Math.min(1, (now - o.born) / 520));
    o.cur.lerp(o.target, reduce ? 1 : 0.12);
    const dir = tmpD.copy(o.cur).sub(BIND).normalize();
    o.obj.position.copy(o.cur);
    o.obj.quaternion.setFromUnitVectors(UP, o.green ? tmpV.copy(dir).add(new THREE.Vector3(0, 0.6, 0)).normalize() : dir);
    if (o.green) o.obj.position.copy(BIND).addScaledVector(tmpV, 0.12);
    o.obj.scale.setScalar(Math.max(0.001, sc) * (o.green ? 1.3 : o.size > 1.3 ? 1.05 : 2.1));
    const bottom = tmpV.copy(BIND).addScaledVector(dir, -0.62);
    const len = o.cur.distanceTo(bottom) - (o.green ? 0.3 : 0.04);
    o.stem.position.copy(bottom);
    o.stem.quaternion.setFromUnitVectors(UP, tmpD.copy(o.cur).sub(bottom).normalize());
    o.stem.scale.set(1, Math.max(0.01, len) * Math.max(0.001, sc), 1);
  }
}

/* ───────────── Упаковка и лента ───────────── */
function updateWrap() {
  wrapGroup.clear();
  const w = WRAPS.find(x => x.id === state.wrap), R = domeR, ribbonColor = RIBBONS[state.ribbon][1];
  if (w && w.color) {
    const film = w.id === 'film';
    const m = film ? new THREE.MeshPhysicalMaterial({ color: '#E8F2F6', roughness: 0.15, transparent: true, opacity: 0.35, side: THREE.DoubleSide, clearcoat: 1 }) : mat(w.color, { roughness: 0.9 });
    const cy = 1.0 + R * 0.55;
    const back = [[0.05, 0.0], [0.09, 0.25], [0.12, BIND.y], [R * 0.8 + 0.08, cy - R * 0.45], [R * 1.08 + 0.12, cy + R * 0.05], [R * 1.18 + 0.16, cy + R * 0.28]].map(p => new THREE.Vector2(p[0], p[1]));
    const front = [[0.05, 0.0], [0.09, 0.25], [0.12, BIND.y], [R * 0.78 + 0.08, cy - R * 0.55], [R * 0.98 + 0.12, cy - R * 0.22]].map(p => new THREE.Vector2(p[0], p[1]));
    const b = new THREE.Mesh(new THREE.LatheGeometry(back, 40, Math.PI * 0.42, Math.PI * 1.16), m);
    const f = new THREE.Mesh(new THREE.LatheGeometry(front, 40, -Math.PI * 0.62, Math.PI * 1.24), film ? m : mat(shade(w.color, 1.03), { roughness: 0.9 }));
    wrapGroup.add(b, f);
  }
  const knot = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 10, 40), mat(ribbonColor, { roughness: 0.4 }));
  knot.rotation.x = Math.PI / 2; knot.position.y = BIND.y; wrapGroup.add(knot);
  [-1, 1].forEach(sd => {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 30), mat(ribbonColor, { roughness: 0.4 }));
    loop.scale.set(1.3, 0.8, 1); loop.position.set(sd * 0.1, BIND.y + 0.02, 0.17); loop.rotation.z = sd * 0.35; wrapGroup.add(loop);
    const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.32), mat(ribbonColor, { roughness: 0.4 }));
    tail.position.set(sd * 0.06, BIND.y - 0.17, 0.17); tail.rotation.z = sd * 0.25; wrapGroup.add(tail);
  });
}

/* ───────────── Цикл отрисовки ───────────── */
function resize() {
  const r = stageEl.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stageEl); resize();
function frame(now) {
  const t = now / 1000;
  bouquet.position.y = reduce ? 0 : Math.sin(t * 0.9) * 0.05;
  const s = 1 - (reduce ? 0 : Math.sin(t * 0.9)) * 0.08; shadow.scale.setScalar(s * (0.8 + domeR));
  shadow.material.opacity = 0.9 - (reduce ? 0 : Math.sin(t * 0.9)) * 0.2;
  animateStems(now); controls.update(); renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ───────────── Панель ───────────── */
const panel = document.getElementById('bq-panel');
const summaryEl = document.getElementById('bq-summary');
const emptyEl = document.getElementById('bq-empty');
const total = () => Object.values(state.flowers).reduce((a, b) => a + b, 0) + Object.values(state.greens).reduce((a, b) => a + b, 0);
const el = (tag, attrs, html) => { const e = document.createElement(tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v)); if (html != null) e.innerHTML = html; return e; };
function stepper(label, value, onMinus, onPlus) {
  const w = el('div', { class: 'bq-step', role: 'group', 'aria-label': label });
  const m = el('button', { type: 'button', class: 'bq-round', 'aria-label': 'Убрать: ' + label }, '−');
  const v = el('span', { class: 'bq-count', 'aria-live': 'polite' }, String(value));
  const p = el('button', { type: 'button', class: 'bq-round bq-round--dark', 'aria-label': 'Добавить: ' + label }, '+');
  m.disabled = value === 0; p.disabled = total() >= MAX_STEMS;
  m.onclick = onMinus; p.onclick = onPlus; w.append(m, v, p); return w;
}
function renderPanel() {
  panel.innerHTML = '';
  if (state.tab === 'flowers') {
    FLOWERS.forEach(f => {
      const vi = state.picked[f.id], key = f.id + ':' + vi, n = state.flowers[key] || 0;
      const row = el('div', { class: 'bq-row' });
      const info = el('div', { class: 'bq-info' }, `<span class="bq-name">${f.name}</span><span class="bq-note">${f.note} · [цена] ₽/шт</span>`);
      const sw = el('div', { class: 'bq-swatches', role: 'radiogroup', 'aria-label': 'Цвет: ' + f.name });
      f.variants.forEach((v, i) => {
        const cnt = state.flowers[f.id + ':' + i] || 0;
        const b = el('button', { type: 'button', role: 'radio', 'aria-checked': String(i === vi), class: 'bq-sw' + (i === vi ? ' is-on' : ''), 'aria-label': v[0] + (cnt ? `, в букете ${cnt}` : ''), title: v[0], style: `--c:${v[1]}` }, cnt ? `<i>${cnt}</i>` : '');
        b.onclick = () => { state.picked[f.id] = i; renderPanel(); };
        sw.appendChild(b);
      });
      info.appendChild(sw);
      row.append(info, stepper(`${f.name}, ${f.variants[vi][0].toLowerCase()}`, n, () => change('flowers', key, -1), () => change('flowers', key, 1)));
      panel.appendChild(row);
    });
  } else if (state.tab === 'greens') {
    GREENS.forEach(g => {
      const n = state.greens[g.id] || 0, row = el('div', { class: 'bq-row' });
      row.append(el('div', { class: 'bq-info' }, `<span class="bq-name"><span class="bq-dot" style="--c:${g.color}"></span>${g.name}</span><span class="bq-note">${g.note} · [цена] ₽/ветка</span>`),
        stepper(g.name, n, () => change('greens', g.id, -1), () => change('greens', g.id, 1)));
      panel.appendChild(row);
    });
  } else if (state.tab === 'wrap') {
    const grid = el('div', { class: 'bq-grid', role: 'radiogroup', 'aria-label': 'Упаковка' });
    WRAPS.forEach(w => {
      const b = el('button', { type: 'button', role: 'radio', 'aria-checked': String(state.wrap === w.id), class: 'bq-card' + (state.wrap === w.id ? ' is-on' : '') },
        `<span class="bq-paper" style="--c:${w.color || 'transparent'}">${w.color ? '' : '—'}</span><span>${w.name}</span>`);
      b.onclick = () => { state.wrap = w.id; updateWrap(); renderPanel(); renderSummary(); };
      grid.appendChild(b);
    });
    panel.appendChild(grid);
  } else {
    panel.appendChild(el('div', { class: 'bq-name', style: 'margin-bottom:10px' }, 'Лента'));
    const rg = el('div', { class: 'bq-swatches bq-swatches--big', role: 'radiogroup', 'aria-label': 'Цвет ленты' });
    RIBBONS.forEach((r, i) => {
      const b = el('button', { type: 'button', role: 'radio', 'aria-checked': String(state.ribbon === i), class: 'bq-sw' + (state.ribbon === i ? ' is-on' : ''), 'aria-label': r[0], title: r[0], style: `--c:${r[1]}` });
      b.onclick = () => { state.ribbon = i; updateWrap(); renderPanel(); renderSummary(); };
      rg.appendChild(b);
    });
    panel.appendChild(rg);
    const lab = el('label', { for: 'bq-card', class: 'bq-name', style: 'display:block;margin:22px 0 8px' }, 'Открытка');
    const ta = el('textarea', { id: 'bq-card', rows: '4', class: 'bq-textarea', placeholder: 'Напишите пожелание — подпишем от руки', maxlength: '300' });
    ta.value = state.card; ta.oninput = () => { state.card = ta.value; };
    panel.append(lab, ta);
  }
  document.querySelectorAll('[data-bq-tab]').forEach(b => { const on = b.dataset.bqTab === state.tab; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
}
function change(group, key, d) {
  if (d > 0 && total() >= MAX_STEMS) return;
  state[group][key] = Math.max(0, (state[group][key] || 0) + d);
  if (!state[group][key]) delete state[group][key];
  layout(); renderPanel(); renderSummary();
}
function renderSummary() {
  const parts = [];
  FLOWERS.forEach(f => f.variants.forEach((v, i) => { const n = state.flowers[f.id + ':' + i]; if (n) parts.push(`${f.name} ${v[0].toLowerCase()} × ${n}`); }));
  GREENS.forEach(g => { const n = state.greens[g.id]; if (n) parts.push(`${g.name} × ${n}`); });
  const w = WRAPS.find(x => x.id === state.wrap), n = total();
  const kinds = Object.keys(state.flowers).length;
  summaryEl.innerHTML = `<div class="bq-total"><span>${n ? `${n} ${plural(n, 'стебель', 'стебля', 'стеблей')} · ${kinds} ${plural(kinds, 'вид', 'вида', 'видов')} цветов` : 'Букет пока пустой'}</span><b>[сумма] ₽</b></div>
    <div class="bq-chips">${parts.map(p => `<span>${p}</span>`).join('')}<span>${w.name}</span><span>Лента: ${RIBBONS[state.ribbon][0].toLowerCase()}</span></div>`;
  emptyEl.hidden = n > 0;
  canvas.setAttribute('aria-label', n ? 'Ваш букет: ' + parts.join(', ') + ', упаковка ' + w.name.toLowerCase() : 'Пустой букет — добавьте цветы');
  document.getElementById('bq-cart').disabled = n === 0;
  document.getElementById('bq-send').disabled = n === 0;
}
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; }
function applyPreset(p) {
  state.flowers = Object.assign({}, p.flowers); state.greens = Object.assign({}, p.greens); state.wrap = p.wrap; state.ribbon = p.ribbon;
  Object.keys(p.flowers).forEach(k => { const [id, vi] = k.split(':'); state.picked[id] = +vi; });
  layout(); renderPanel(); renderSummary();
}
function toast(msg) { const t = document.getElementById('bq-toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 3200); }

document.querySelectorAll('[data-bq-tab]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.bqTab; renderPanel(); }));
const presetsEl = document.getElementById('bq-presets');
Object.keys(PRESETS).forEach(name => { const b = el('button', { type: 'button', class: 'bq-chip' }, name); b.onclick = () => applyPreset(PRESETS[name]); presetsEl.appendChild(b); });
document.getElementById('bq-random').onclick = () => {
  const pick = a => a[Math.floor(Math.random() * a.length)], fl = {}, used = new Set();
  const types = 2 + Math.floor(Math.random() * 2);
  while (used.size < types) used.add(pick(FLOWERS));
  used.forEach(f => { const vi = Math.floor(Math.random() * f.variants.length); fl[f.id + ':' + vi] = f.id === 'hydrangea' ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 7); });
  const g = pick(GREENS); applyPreset({ flowers: fl, greens: { [g.id]: 2 + Math.floor(Math.random() * 3) }, wrap: pick(WRAPS).id, ribbon: Math.floor(Math.random() * RIBBONS.length) });
};
document.getElementById('bq-reset').onclick = () => applyPreset({ flowers: {}, greens: {}, wrap: 'kraft', ribbon: 0 });
const autoBtn = document.getElementById('bq-auto');
autoBtn.onclick = () => { state.auto = !state.auto; controls.autoRotate = state.auto && !reduce; autoBtn.setAttribute('aria-pressed', String(state.auto)); };
document.getElementById('bq-photo').onclick = () => {
  renderer.render(scene, camera);
  const a = document.createElement('a'); a.download = 'moy-buket-amma.png'; a.href = canvas.toDataURL('image/png'); a.click();
};
document.getElementById('bq-cart').onclick = () => toast('Букет добавлен в корзину. Флорист соберёт его по этой схеме.');
document.getElementById('bq-send').onclick = () => toast('Схема отправлена флористу — он проверит состав и напишет вам в течение [времени].');

applyPreset(PRESETS['Нежный']);
window.__bq = { state, live };
