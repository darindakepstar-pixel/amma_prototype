// АММА · модели цветов для 3D-конструктора · design & code: Дария Кромберг
// Всё строится в коде: лепестки — изогнутые сетки с текстурой прожилок,
// одна голова цветка = 2–4 объединённые сетки (быстро даже на 101 стебель).
import * as THREE from 'three';
import { mergeGeometries } from './BufferGeometryUtils.js';

/* ───────── утилиты ───────── */
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const GOLD = 2.39996323;
const col = (hex, k = 1, toward, amt = 0) => { const c = new THREE.Color(hex); if (toward) c.lerp(new THREE.Color(toward), amt); return c.multiplyScalar(k); };
const M = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3().setScalar(s));
// лепесток по кругу: поворот вокруг оси цветка, сдвиг наружу и вверх
const ringM = (a, y0, r0, s = 1) => new THREE.Matrix4().makeRotationY(a).multiply(new THREE.Matrix4().makeTranslation(0, y0, r0)).multiply(new THREE.Matrix4().makeScale(s, s, s));
// направить ось +Y вдоль вектора dir и поставить в точку p
const alongM = (p, dir, s = 1, spin = 0) => {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin));
  return new THREE.Matrix4().compose(p, q, new THREE.Vector3().setScalar(s));
};

/* ───────── формы контура (полуширина по длине v ∈ 0…1) ───────── */
const OUT = {
  disc: v => Math.sqrt(Math.max(0, 1 - Math.pow(2 * v - 1, 2))),
  // формы с округлым краем: ширина у кончика не уходит в ноль, дугу края даёт roundTip
  rose: v => lerp(0.3, 1, smooth(0, 0.5, v)) * (1 - 0.12 * smooth(0.6, 1, v)),
  cupped: v => lerp(0.42, 1, smooth(0, 0.4, v)) * (1 - 0.08 * smooth(0.6, 1, v)),
  spoon: v => lerp(0.25, 1, smooth(0, 0.6, v)) * (1 - 0.1 * smooth(0.7, 1, v)),
  obovate: v => Math.pow(Math.sin(Math.PI * Math.pow(v, 0.72)), 0.5) * (0.28 + 0.72 * smooth(0, 0.5, v)),
  broad: v => Math.pow(Math.sin(Math.PI * Math.pow(v, 0.6)), 0.4) * (0.4 + 0.6 * smooth(0, 0.35, v)),
  ovate: v => Math.pow(Math.sin(Math.PI * Math.pow(v, 0.95)), 0.7),
  lance: v => Math.pow(Math.sin(Math.PI * v), 0.9) * (1 - 0.35 * v),
  strap: v => Math.pow(Math.min(1, v * 5), 0.5) * (1 - Math.pow(v, 10)),
  round: v => Math.pow(Math.sin(Math.PI * v), 0.55),
  sepal: v => Math.pow(Math.sin(Math.PI * Math.pow(v, 0.5)), 1.1) * (1 - 0.6 * v)
};

/* ───────── лепесток: изогнутая сетка ─────────
   Основание в начале координат, растёт вдоль +Y, «наружу» от центра цветка — +Z.
   cup — чашеобразность поперёк, bend0/bend — наклон и изгиб вдоль,
   reflex — отгиб кончика наружу, wave — волна края, fringe — бахрома, serr — зубчики. */
const geoCache = new Map();
function petal(o) {
  const key = JSON.stringify(o);
  if (geoCache.has(key)) return geoCache.get(key);
  const { len, wid, su = 8, sv = 10, shape = 'obovate', cup = 0.6, bend0 = 0, bend = 0.2, reflex = 0, reflexAt = 0.45,
    wave = 0, waveF = 6, fringe = 0, fringeK = 8, serr = 0, serrK = 9, twist = 0, seed = 0, fold = 0, roll = 0, roundTip = 0 } = o;
  const F = OUT[shape];
  // хребет лепестка: таблица точек (y, z, угол)
  const N = 48, tbl = []; let y = 0, z = 0;
  for (let k = 0; k <= N; k++) {
    const v = k / N, th = bend0 + bend * v + reflex * Math.pow(smooth(reflexAt, 1, v), 2);
    tbl.push([y, z, th]);
    y += Math.cos(th) * len / N; z += Math.sin(th) * len / N;
  }
  const spine = v => { const f = Math.min(N - 1e-6, Math.max(0, v * N)), k = Math.floor(f), t = f - k, a = tbl[k], b = tbl[k + 1]; return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; };
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= sv; j++) {
    const v = j / sv;
    for (let i = 0; i <= su; i++) {
      const u = -1 + 2 * i / su;
      const tri = fringe ? Math.abs((((u * fringeK * 0.5 + 0.25) % 1) + 1) % 1 * 2 - 1) : 0;
      const arc = roundTip ? 1 - roundTip * (1 - Math.sqrt(Math.max(0, 1 - u * u))) : 1;
      const vv = v * arc * (1 - fringe * tri * smooth(0.3, 1, v));
      let hw = wid * 0.5 * F(vv);
      if (serr) hw *= 1 - serr * Math.pow(Math.abs(Math.sin(vv * serrK * Math.PI)), 3) * smooth(0.15, 0.4, vv);
      const x = u * hw, [sy, sz, th] = spine(vv);
      const off = cup * u * u * hw + fold * Math.abs(u) * hw - roll * Math.pow(Math.abs(u), 3) * hw * smooth(0.35, 1, vv) + wave * Math.sin(waveF * (vv * 3 + u * 0.9) + seed * 7.1) * Math.pow(Math.abs(u), 1.5) * vv;
      const tw = twist * vv, ny = Math.sin(th), nz = -Math.cos(th);
      pos.push(x * Math.cos(tw), sy + ny * off, sz + nz * off + x * Math.sin(tw));
      uv.push(u * 0.5 + 0.5, vv);
    }
  }
  const row = su + 1;
  for (let j = 0; j < sv; j++) for (let i = 0; i < su; i++) {
    const a = j * row + i, b = a + 1, c = a + row, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  geoCache.set(key, g);
  return g;
}
// внутренний лепесток розы: дуга вокруг оси цветка на своём радиусе (как свиток)
function wrapPetal(o) {
  const key = 'w' + LITE + JSON.stringify(o);
  if (geoCache.has(key)) return geoCache.get(key);
  const { r, h, span, open = 0.25, roll = 0.15, lean = 0, su = LITE ? 10 : 14, sv = LITE ? 5 : 8 } = o;
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= sv; j++) {
    const v = j / sv;
    for (let i = 0; i <= su; i++) {
      const u = -1 + 2 * i / su, top = 1 - 0.22 * u * u - 0.08 * Math.pow(Math.abs(u), 4);
      const vy = v * top, a = u * span / 2;
      const rr = r * (1 + open * vy * vy) + roll * h * Math.pow(smooth(0.7, 1, v), 2) + lean * vy * h;
      pos.push(Math.sin(a) * rr, vy * h, Math.cos(a) * rr);
      uv.push(u * 0.5 + 0.5, vy);
    }
  }
  const row = su + 1;
  for (let j = 0; j < sv; j++) for (let i = 0; i < su; i++) { const a = j * row + i, b = a + 1, c = a + row, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  geoCache.set(key, g); return g;
}
// лепесток тюльпана: выпуклая дуга вокруг оси, профиль бокала-яйца
function tulipPetal(span, h, rMax, flare) {
  const key = 't' + [span, h, rMax, flare].join();
  if (geoCache.has(key)) return geoCache.get(key);
  const su = 14, sv = 14, pos = [], uv = [], idx = [];
  for (let j = 0; j <= sv; j++) {
    const v = j / sv;
    for (let i = 0; i <= su; i++) {
      const u = -1 + 2 * i / su, top = 1 - 0.14 * u * u - 0.1 * Math.pow(Math.abs(u), 6);
      const vy = v * top, a = u * span / 2;
      const prof = 0.25 + 0.75 * Math.pow(Math.sin(Math.PI * Math.min(1, vy * 0.95 + 0.05) * 0.78), 0.9);
      const rr = rMax * prof + flare * h * Math.pow(smooth(0.82, 1, v), 2);
      pos.push(Math.sin(a) * rr, vy * h, Math.cos(a) * rr);
      uv.push(u * 0.5 + 0.5, vy);
    }
  }
  const row = su + 1;
  for (let j = 0; j < sv; j++) for (let i = 0; i < su; i++) { const a = j * row + i, b = a + 1, c = a + row, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  geoCache.set(key, g); return g;
}
const PRIM = {
  ball: new THREE.SphereGeometry(1, 14, 10),
  lowball: new THREE.SphereGeometry(1, 6, 4),
  cyl: new THREE.CylinderGeometry(0.85, 1, 1, 7, 1).translate(0, 0.5, 0),
  cone: new THREE.ConeGeometry(1, 1, 10, 1, true).translate(0, 0.5, 0)
};

/* ───────── текстуры ───────── */
const texCache = new Map();
function canvasTex(key, draw, size = 256) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); draw(g, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  texCache.set(key, t); return t;
}
const css = c => '#' + c.getHexString();
// v = 0 (основание) внизу холста
function petalTex(kind, hex, o = {}) {
  return canvasTex('p' + kind + hex + JSON.stringify(o), (g, S) => {
    const base = new THREE.Color(hex), hsl = {}; base.getHSL(hsl);
    const light = hsl.l > 0.82;
    const root = o.root ? new THREE.Color(o.root) : light ? base.clone().lerp(new THREE.Color('#C9D9A0'), 0.55) : base.clone().multiplyScalar(0.72);
    const tip = o.tip ? new THREE.Color(o.tip) : light ? base.clone().lerp(new THREE.Color('#FFFFFF'), 0.4) : base.clone().offsetHSL(0, 0.04, 0.04);
    const gr = g.createLinearGradient(0, S, 0, 0);
    gr.addColorStop(0, css(root)); gr.addColorStop(o.rootLen || 0.3, css(base)); gr.addColorStop(0.85, css(base.clone().lerp(tip, 0.5))); gr.addColorStop(1, css(tip));
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    // края чуть светлее или темнее
    const eg = g.createLinearGradient(0, 0, S, 0), ec = o.edgeDark ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)';
    eg.addColorStop(0, ec); eg.addColorStop(0.18, 'rgba(0,0,0,0)'); eg.addColorStop(0.82, 'rgba(0,0,0,0)'); eg.addColorStop(1, ec);
    g.fillStyle = eg; g.fillRect(0, 0, S, S);
    if (o.blotch) { const bg = g.createRadialGradient(S / 2, S, 4, S / 2, S, S * 0.32); bg.addColorStop(0, o.blotch); bg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = bg; g.fillRect(0, 0, S, S); }
    // прожилки
    const r = rng(hex.length * 97 + kind.length * 31);
    g.lineCap = 'round';
    const vn = o.veins ?? 0.5;
    for (let k = 0; k < 26; k++) {
      const x0 = S / 2 + (k - 12.5) * 2.2, x1 = S / 2 + (k - 12.5) * (S / 28) * (1 + r() * 0.3);
      const vc = base.clone().multiplyScalar(0.55);
      g.strokeStyle = o.veinLight ? `rgba(255,255,255,${(0.05 + r() * 0.05) * vn * 2})` : `rgba(${Math.round(vc.r * 255)},${Math.round(vc.g * 255)},${Math.round(vc.b * 255)},${(0.08 + r() * 0.08) * vn * 2})`;
      g.lineWidth = 0.8 + r() * 1.2;
      g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(x0 + (x1 - x0) * 0.2, S * 0.45, x1, -4); g.stroke();
    }
    if (o.stripes) {
      g.strokeStyle = o.stripes; g.lineWidth = 2.2;
      for (let k = 0; k < 14; k++) { const x = S * (0.32 + r() * 0.36), y = S * (0.38 + r() * 0.3); g.globalAlpha = 0.55 + r() * 0.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 18 - r() * 30); g.stroke(); }
      g.globalAlpha = 1;
    }
    // зерно
    for (let k = 0; k < 2600; k++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.025 + r() * 0.03})`; g.fillRect(r() * S, r() * S, 1.4, 1.4); }
  });
}
// лист: светло-серая основа с прожилками, цвет даёт вершинный оттенок
const leafTex = () => canvasTex('leaf', (g, S) => {
  const gr = g.createLinearGradient(0, S, 0, 0); gr.addColorStop(0, '#D8DCCF'); gr.addColorStop(1, '#F2F4EC');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  const r = rng(7);
  g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(S / 2, S); g.lineTo(S / 2, 0); g.stroke();
  g.lineWidth = 1.4;
  for (let k = 0; k < 9; k++) { const y = S * (0.92 - k * 0.1); [-1, 1].forEach(sd => { g.strokeStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.moveTo(S / 2, y); g.quadraticCurveTo(S / 2 + sd * S * 0.22, y - S * 0.06, S / 2 + sd * S * 0.48, y - S * 0.16); g.stroke(); }); }
  const eg = g.createLinearGradient(0, 0, S, 0); eg.addColorStop(0, 'rgba(0,0,0,0.12)'); eg.addColorStop(0.25, 'rgba(0,0,0,0)'); eg.addColorStop(0.75, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,0.12)');
  g.fillStyle = eg; g.fillRect(0, 0, S, S);
  for (let k = 0; k < 2000; k++) { g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.04})`; g.fillRect(r() * S, r() * S, 1.2, 1.2); }
});
const paperTex = () => canvasTex('paper', (g, S) => {
  g.fillStyle = '#EEEEEE'; g.fillRect(0, 0, S, S);
  const r = rng(11);
  for (let k = 0; k < 900; k++) { g.strokeStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.04 + r() * 0.05})`; g.lineWidth = 0.6 + r(); const x = r() * S, y = r() * S, a = r() * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (4 + r() * 14), y + Math.sin(a) * (4 + r() * 14)); g.stroke(); }
  for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(0,0,0,${0.05 + r() * 0.05})`; g.lineWidth = 1 + r() * 2; const x = r() * S; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 60, S); g.stroke(); }
}, 512);

/* ───────── материалы ───────── */
const matCache = new Map();
const cachedMat = (key, make) => { if (!matCache.has(key)) matCache.set(key, make()); return matCache.get(key); };
const petalMat = (kind, hex, o = {}, look = {}) => cachedMat('pm' + kind + hex + JSON.stringify(o) + JSON.stringify(look), () => new THREE.MeshPhysicalMaterial({
  map: petalTex(kind, hex, o), vertexColors: true, side: THREE.DoubleSide,
  roughness: look.roughness ?? 0.6, sheen: (look.sheen ?? 0.7) * 0.6, sheenRoughness: 0.45,
  sheenColor: new THREE.Color(hex).lerp(new THREE.Color('#FFFFFF'), 0.22), envMapIntensity: 0.32,
  emissive: new THREE.Color(hex).multiplyScalar(0.07), emissiveMap: petalTex(kind, hex, o)
}));
const leafMat = (gloss = 0.5) => cachedMat('leaf' + gloss, () => new THREE.MeshPhysicalMaterial({ map: leafTex(), vertexColors: true, side: THREE.DoubleSide, roughness: gloss, sheen: 0.25, sheenColor: new THREE.Color('#E8F0E0'), envMapIntensity: 0.6 }));
const plainMat = (rough = 0.7) => cachedMat('plain' + rough, () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, side: THREE.DoubleSide, envMapIntensity: 0.5 }));
export const stemMaterial = cachedMat('stem', () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#5E8F5C'), roughness: 0.55, envMapIntensity: 0.5 }));
export const paperMaterial = (hex, film) => cachedMat('paper' + hex + film, () => film
  ? new THREE.MeshPhysicalMaterial({ color: '#EAF4F8', roughness: 0.08, transparent: true, opacity: 0.32, side: THREE.DoubleSide, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2, depthWrite: false })
  : new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), map: paperTex(), roughness: 0.92, side: THREE.DoubleSide, envMapIntensity: 0.4 }));

/* ───────── сборщик: всё одного материала → одна сетка ───────── */
class Acc {
  constructor() { this.parts = new Map(); }
  add(mat, geo, m4, tint = '#FFFFFF') {
    let g = geo.clone(); if (m4) g.applyMatrix4(m4);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    const c = tint instanceof THREE.Color ? tint : new THREE.Color(tint), n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    this.parts.get(mat).push(g);
    return this;
  }
  merge(sub, m4) {
    for (const [mat, list] of sub.parts) {
      if (!this.parts.has(mat)) this.parts.set(mat, []);
      list.forEach(g => this.parts.get(mat).push(g.clone().applyMatrix4(m4)));
    }
    return this;
  }
  build() {
    const grp = new THREE.Group();
    for (const [mat, list] of this.parts) {
      const mesh = new THREE.Mesh(mergeGeometries(list, false), mat);
      mesh.castShadow = mesh.receiveShadow = true; grp.add(mesh);
    }
    return grp;
  }
}
const vary = (r, amt = 0.08) => new THREE.Color(1, 1, 1).multiplyScalar(1 - amt + r() * amt * 1.4);

/* ───────── части, общие для многих цветов ───────── */
const GREEN = '#4E7D4B', GREEN_D = '#3D6A3D';
function sepals(acc, n, len, y, r, down, seed) {
  const R = rng(seed), lm = leafMat(0.6);
  for (let i = 0; i < n; i++) acc.add(lm, petal({ len, wid: len * 0.28, shape: 'sepal', cup: 0.5, bend0: down, bend: 0.4, reflex: 0.6, su: 4, sv: 8 }), ringM(i / n * Math.PI * 2 + R() * 0.3, y, r), col(GREEN, 0.95 + R() * 0.1));
}
function stemPiece(acc, from, to, rad, tint = GREEN) {
  const d = to.clone().sub(from), L = d.length();
  acc.add(plainMat(0.55), PRIM.cyl, alongM(from, d, 1).multiply(new THREE.Matrix4().makeScale(rad, L, rad)), tint);
}
// сложный лист розы: черешок + 3 или 5 резных листочков
function roseLeaf(acc, base, dir, size, seed) {
  const R = rng(seed), lm = leafMat(0.42), d = dir.clone().normalize();
  const tip = base.clone().addScaledVector(d, size * 0.11);
  stemPiece(acc, base, tip, 0.0022 * size / 0.6, GREEN_D);
  const side = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
  const leaflet = petal({ len: 0.055 * size, wid: 0.034 * size, shape: 'ovate', cup: 0.35, fold: 0.25, bend0: 0, bend: 0.25, reflex: 0.2, serr: 0.12, serrK: 11, su: 6, sv: 9 });
  const tint = col('#3F6B3A', 0.95 + R() * 0.12);
  acc.add(lm, leaflet, alongM(tip, d, 1, R()), tint);
  [0.35, 0.75].forEach((t, k) => [-1, 1].forEach(sd => {
    const p = base.clone().addScaledVector(d, size * 0.11 * t);
    const dd = d.clone().multiplyScalar(0.6).addScaledVector(side, sd).normalize();
    acc.add(lm, leaflet, alongM(p, dd, 0.82 - k * 0.12, sd * 0.5), tint);
  }));
}

/* ───────── цветы ───────── */
// Роза: спираль из ~34 лепестков, высокий центр, отогнутые наружные лепестки
function rose(acc, hex, opt = {}) {
  const R = rng(opt.seed || 3), garden = opt.garden, bud = opt.bud;
  const pm = petalMat(garden ? 'garden' : 'rose', hex, { veins: 0.3 }, { sheen: 0.9, roughness: 0.58 });
  // 1) свёрнутый центр
  const NC = bud ? 7 : garden ? (LITE ? 10 : 16) : (LITE ? 8 : 11);
  for (let i = 0; i < NC; i++) {
    const t = i / (NC - 1);
    const g = wrapPetal(garden
      ? { r: lerp(0.003, 0.03, t), h: lerp(0.034, 0.048, t), span: lerp(3.4, 2.4, t), open: lerp(0.2, 0.45, t), roll: lerp(0.02, 0.2, t) }
      : { r: lerp(0.0025, bud ? 0.016 : 0.021, t), h: lerp(0.05, bud ? 0.056 : 0.062, t), span: lerp(3.6, 2.5, t), open: lerp(0.15, 0.32, t), roll: lerp(0.02, 0.18, t) });
    acc.add(pm, g, M(0, 0.002, 0, 0, i * GOLD * 1.37 + R() * 0.2, 0), vary(R, 0.05).multiplyScalar(lerp(0.8, 0.92, t)));
  }
  // 2) раскрытые лепестки
  const N = bud ? 3 : garden ? (LITE ? 16 : 24) : (LITE ? 12 : 18);
  for (let i = 0; i < N; i++) {
    const e = N === 1 ? 1 : i / (N - 1);
    const g = petal(garden ? {
      len: lerp(0.068, 0.095, Math.pow(e, 0.6)), wid: lerp(0.08, 0.098, e), shape: 'rose', roundTip: 0.32,
      cup: 0.8, bend0: lerp(0.2, 0.85, Math.pow(e, 1.2)), bend: lerp(0.25, 0.35, e), reflex: lerp(0.1, 0.3, e * e), reflexAt: 0.5, roll: lerp(0.4, 0.8, e),
      wave: 0.0015, waveF: 5, seed: i % 5, su: LITE ? 8 : 12, sv: LITE ? 8 : 12
    } : {
      len: lerp(bud ? 0.06 : 0.07, 0.09, Math.pow(e, 0.6)), wid: lerp(0.07, 0.088, e), shape: 'rose', roundTip: 0.28,
      cup: lerp(0.8, 0.7, e), bend0: bud ? 0.02 : lerp(0.08, 0.36, Math.pow(e, 1.2)), bend: lerp(0.2, 0.38, e),
      reflex: bud ? 0 : lerp(0.15, 0.5, e * e), reflexAt: 0.5, roll: bud ? 0.1 : lerp(0.5, 1.15, e),
      wave: 0.0015 + e * 0.002, waveF: 4, seed: i % 7, su: LITE ? 8 : 12, sv: LITE ? 9 : 14
    });
    const a = i * GOLD + R() * 0.1, r0 = lerp(garden ? 0.033 : 0.025, garden ? 0.042 : 0.031, e);
    acc.add(pm, g, ringM(a, 0, r0), vary(R, 0.06).multiplyScalar(lerp(0.94, 1.04, e)));
  }
  acc.add(plainMat(0.5), PRIM.ball, M(0, -0.012, 0).multiply(new THREE.Matrix4().makeScale(0.017, 0.02, 0.017)), col('#5D8A4E'));
  sepals(acc, 5, bud ? 0.036 : 0.038, -0.012, 0.012, bud ? 0.25 : 1.75, 5);
}
function roseHead(hex, leafy, garden) {
  const acc = new Acc(); rose(acc, hex, { garden, seed: 3 });
  if (leafy) { roseLeaf(acc, new THREE.Vector3(0, -0.09, 0), new THREE.Vector3(1, 0.7, 0.2), 0.8, 21); roseLeaf(acc, new THREE.Vector3(0, -0.15, 0), new THREE.Vector3(-0.8, 0.8, -0.4), 0.75, 22); }
  return acc.build();
}
// Кустовая роза: 3 цветка и 2 бутона на разветвлённом стебле
function sprayHead(hex, leafy) {
  const acc = new Acc(), R = rng(9);
  const pts = [[0, 0.07, 0, 0.62], [0.085, 0.01, 0.03, 0.52], [-0.07, -0.005, 0.055, 0.5], [0.02, -0.03, -0.09, 0.36, 1], [-0.06, 0.035, -0.05, 0.3, 1]];
  pts.forEach(([x, y, z, s, b], i) => {
    const sub = new Acc(); rose(sub, hex, { seed: 30 + i, bud: !!b });
    const p = new THREE.Vector3(x, y, z), from = new THREE.Vector3(0, -0.09, 0);
    stemPiece(acc, from, p, 0.0035);
    const m = alongM(p, p.clone().sub(from).add(new THREE.Vector3(0, 0.12, 0)), s);
    acc.merge(sub, m);
  });
  if (leafy) roseLeaf(acc, new THREE.Vector3(0, -0.13, 0), new THREE.Vector3(0.9, 0.4, -0.3), 0.8, 23);
  return acc.build();
}
// Эустома: два круга широких волнистых лепестков + закрученный бутон
function eustomaHead(hex, leafy) {
  const acc = new Acc(), R = rng(13);
  const pm = petalMat('eus', hex, { veins: 0.35, rootLen: 0.22 }, { sheen: 0.6, roughness: 0.55 });
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const g = petal({ len: lerp(0.06, 0.085, t), wid: lerp(0.07, 0.09, t), shape: 'spoon', roundTip: 0.3, cup: lerp(1.1, 0.7, t), bend0: lerp(0.05, 0.45, t), bend: 0.35, reflex: 0.25, wave: 0.009, waveF: 7, seed: i, su: 10, sv: 10 });
    acc.add(pm, g, ringM(i * GOLD, 0, lerp(0.004, 0.012, t)), vary(R, 0.06));
  }
  acc.add(plainMat(0.5), PRIM.ball, M(0, 0.022, 0).multiply(new THREE.Matrix4().makeScale(0.006, 0.02, 0.006)), col('#B8C77A'));
  for (let k = 0; k < 5; k++) acc.add(plainMat(0.5), PRIM.ball, ringM(k / 5 * Math.PI * 2, 0.02, 0.008).multiply(new THREE.Matrix4().makeScale(0.003, 0.009, 0.003)), col('#E3D27A'));
  sepals(acc, 5, 0.03, -0.004, 0.006, 1.2, 14);
  // бутон на боковом стебельке
  const bp = new THREE.Vector3(0.07, -0.04, 0.02), from = new THREE.Vector3(0, -0.1, 0);
  stemPiece(acc, from, bp, 0.003);
  const bm = alongM(bp, new THREE.Vector3(0.4, 1, 0.1), 1);
  const budPm = petalMat('eusbud', hex, { root: '#9DB37A', rootLen: 0.6, veins: 0.3 });
  for (let k = 0; k < 5; k++) acc.add(budPm, petal({ len: 0.06, wid: 0.03, shape: 'lance', cup: 1.6, bend0: -0.12, bend: -0.05, twist: 1.3, su: 6, sv: 9 }), bm.clone().multiply(ringM(k / 5 * Math.PI * 2, 0, 0.003)));
  if (leafy) [-1, 1].forEach(sd => acc.add(leafMat(0.55), petal({ len: 0.09, wid: 0.035, shape: 'lance', cup: 0.4, fold: 0.2, bend0: 0.5, bend: 0.4, su: 6, sv: 9 }), M(0, -0.16, 0, 0, sd > 0 ? 0 : Math.PI, 0), col('#6F8F6A')));
  return acc.build();
}
// Тюльпан: 6 гладких лепестков бокалом
function tulipHead(hex, leafy) {
  const acc = new Acc(), R = rng(17);
  const yellowBase = new THREE.Color(hex).getHSL({}).l < 0.8 ? '#E6C24A' : null;
  const pm = petalMat('tulip', hex, { veins: 0.25, root: yellowBase || undefined, rootLen: 0.18 }, { sheen: 0.3, roughness: 0.38 });
  for (let i = 0; i < 6; i++) {
    const inner = i % 2;
    const g = tulipPetal(inner ? 2.25 : 2.35, inner ? 0.098 : 0.104, inner ? 0.036 : 0.04, 0.05);
    acc.add(pm, g, M(0, 0, 0, 0, i * Math.PI / 3 + R() * 0.06, 0), vary(R, 0.05).multiplyScalar(inner ? 0.9 : 1));
  }
  acc.add(plainMat(0.5), PRIM.ball, M(0, -0.004, 0).multiply(new THREE.Matrix4().makeScale(0.016, 0.012, 0.016)), col('#6E9A5A'));
  if (leafy) acc.add(leafMat(0.5), petal({ len: 0.24, wid: 0.06, shape: 'lance', cup: 0.9, fold: 0.15, bend0: 0.15, bend: 0.5, su: 7, sv: 12 }), M(0, -0.3, 0.005, 0, R() * 6, 0), col('#7A9A82'));
  return acc.build();
}
// Гвоздика: много бахромчатых лепестков + длинная чашечка
function carnationHead(hex, leafy) {
  const acc = new Acc(), R = rng(19);
  const pm = petalMat('carn', hex, { veins: 0.55, edgeDark: new THREE.Color(hex).getHSL({}).l > 0.8 }, { sheen: 0.5, roughness: 0.6 });
  const N = 42;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const g = petal({ len: lerp(0.04, 0.062, t), wid: lerp(0.04, 0.06, t), shape: 'broad', cup: lerp(0.9, 0.25, t), bend0: lerp(0.0, 1.25, Math.pow(t, 0.8)), bend: 0.25, reflex: 0.15, fringe: 0.22, fringeK: 10, wave: 0.006, waveF: 9, seed: i % 6, su: 12, sv: 8 });
    acc.add(pm, g, ringM(i * GOLD, lerp(0.022, 0.012, t), lerp(0.002, 0.01, t)), vary(R, 0.07));
  }
  acc.add(plainMat(0.6), PRIM.cyl, M(0, -0.06, 0).multiply(new THREE.Matrix4().makeScale(0.016, 0.075, 0.016)), col('#6E9A82'));
  for (let k = 0; k < 5; k++) acc.add(leafMat(0.6), petal({ len: 0.018, wid: 0.01, shape: 'sepal', cup: 0.6, bend0: 0.1, su: 4, sv: 5 }), ringM(k / 5 * Math.PI * 2, 0.012, 0.012), col('#6E9A82'));
  if (leafy) [-1, 1].forEach(sd => acc.add(leafMat(0.6), petal({ len: 0.08, wid: 0.012, shape: 'lance', cup: 0.5, bend0: 0.7, bend: 0.6, su: 4, sv: 8 }), M(0, -0.14, 0, 0, sd > 0 ? 0.4 : 3.5, 0), col('#7A9E8E')));
  return acc.build();
}
// Ромашковидная хризантема: язычки + серединка из трубчатых цветков
function daisy(acc, hex, seed, s, mt) {
  const R = rng(seed), pm = petalMat('chrys', hex, { veins: 0.3, rootLen: 0.15 }, { sheen: 0.4, roughness: 0.6 });
  const disc = new THREE.Color(hex).getHSL({}).l > 0.85 ? '#D9B23A' : new THREE.Color(hex).getHSL({}).h > 0.1 && new THREE.Color(hex).getHSL({}).h < 0.2 ? '#B9832A' : '#C8A63A';
  for (let i = 0; i < 22; i++) {
    const g = petal({ len: 0.052, wid: 0.013, shape: 'strap', cup: 0.35, bend0: 1.32 + R() * 0.12, bend: 0.05, reflex: 0.25, fringe: 0.08, fringeK: 2, su: 4, sv: 8 });
    acc.add(pm, g, mt.clone().multiply(ringM(i / 22 * Math.PI * 2 + R() * 0.1, 0.004, 0.012, s)), vary(R, 0.05));
  }
  acc.add(plainMat(0.8), PRIM.ball, mt.clone().multiply(M(0, 0.004, 0).multiply(new THREE.Matrix4().makeScale(0.016 * s, 0.008 * s, 0.016 * s))), col(disc, 0.85));
  for (let k = 0; k < 34; k++) { const a = k * GOLD, r = Math.sqrt(k / 34) * 0.014 * s; acc.add(plainMat(0.8), PRIM.lowball, mt.clone().multiply(M(Math.cos(a) * r, 0.01 * s - r * 0.25, Math.sin(a) * r, 0, 0, 0, 0.0028 * s)), col(disc, k < 10 ? 0.75 : 1.05)); }
}
function chrysHead(hex, leafy) {
  const acc = new Acc(), from = new THREE.Vector3(0, -0.12, 0);
  [[0, 0.06, 0], [0.09, 0.02, 0.04], [-0.075, 0.01, 0.06], [0.03, 0, -0.09], [-0.08, 0.035, -0.045]].forEach(([x, y, z], i) => {
    const p = new THREE.Vector3(x, y, z); stemPiece(acc, from, p, 0.003);
    daisy(acc, hex, 40 + i, i ? 0.9 : 1, alongM(p, p.clone().sub(from).add(new THREE.Vector3(0, 0.1, 0)), 1));
  });
  if (leafy) [-1, 1].forEach(sd => acc.add(leafMat(0.6), petal({ len: 0.07, wid: 0.04, shape: 'ovate', cup: 0.3, serr: 0.35, serrK: 5, bend0: 0.8, bend: 0.4, su: 7, sv: 9 }), M(0, -0.17, 0, 0, sd > 0 ? 0.3 : 3.4, 0), col('#4F7A45')));
  return acc.build();
}
// Альстромерия: соцветие из 5 воронок со штрихами на внутренних лепестках
function alstroHead(hex, leafy) {
  const acc = new Acc(), R = rng(23);
  const outer = petalMat('alstroO', hex, { veins: 0.3, rootLen: 0.25, root: '#B9C98A' }, { sheen: 0.45, roughness: 0.5 });
  const inner = petalMat('alstroI', hex, { veins: 0.2, rootLen: 0.2, tip: css(new THREE.Color(hex).lerp(new THREE.Color('#F2C94C'), 0.55)), stripes: '#4A1A22' }, { sheen: 0.45, roughness: 0.5 });
  const from = new THREE.Vector3(0, -0.08, 0);
  for (let f = 0; f < 5; f++) {
    const a = f / 5 * Math.PI * 2 + 0.3, p = new THREE.Vector3(Math.cos(a) * 0.065, 0.015 + (f % 2) * 0.02, Math.sin(a) * 0.065);
    stemPiece(acc, from, p, 0.0025);
    const m = alongM(p, p.clone().sub(from).add(new THREE.Vector3(0, 0.05, 0)), 1, R() * 6);
    for (let i = 0; i < 6; i++) {
      const isIn = i % 2;
      const g = petal({ len: isIn ? 0.058 : 0.062, wid: isIn ? 0.024 : 0.036, shape: isIn ? 'lance' : 'spoon', roundTip: isIn ? 0 : 0.35, cup: 0.75, bend0: 0.42, bend: 0.25, reflex: 0.4, su: 6, sv: 9 });
      acc.add(isIn ? inner : outer, g, m.clone().multiply(ringM(i * Math.PI / 3, 0, 0.004)), vary(R, 0.05));
    }
    for (let k = 0; k < 6; k++) {
      const sa = k / 6 * Math.PI * 2, sp = new THREE.Vector3(Math.cos(sa) * 0.012, 0.045, Math.sin(sa) * 0.012).applyMatrix4(m), base = new THREE.Vector3(0, 0.004, 0).applyMatrix4(m);
      stemPiece(acc, base, sp, 0.0008, '#D9C49A');
      acc.add(plainMat(0.7), PRIM.lowball, new THREE.Matrix4().compose(sp, new THREE.Quaternion(), new THREE.Vector3(0.0028, 0.0045, 0.0028)), col('#7A4A2E'));
    }
  }
  if (leafy) [-1, 1].forEach(sd => acc.add(leafMat(0.5), petal({ len: 0.08, wid: 0.022, shape: 'lance', cup: 0.3, twist: 0.8, bend0: 0.6, bend: 0.5, su: 5, sv: 8 }), M(0, -0.15, 0, 0, sd > 0 ? 0.8 : 3.9, 0), col('#5E8A55')));
  return acc.build();
}
// Гортензия: шапка из ~180 цветков по 4 округлых лепестка
function hydrangeaHead(hex, leafy) {
  const acc = new Acc(), R = rng(29);
  const pm = petalMat('hydr', hex, { veins: 0.25, rootLen: 0.2, root: css(new THREE.Color(hex).lerp(new THREE.Color('#C8D6A0'), 0.5)) }, { sheen: 0.5, roughness: 0.65 });
  const sep = petal({ len: 0.024, wid: 0.026, shape: 'spoon', roundTip: 0.5, cup: 0.5, bend0: 1.2, bend: 0.2, reflex: 0.1, su: 5, sv: 5 });
  const N = 260, base = new THREE.Color(hex), alt = base.clone().offsetHSL(0.05, 0.04, -0.06);
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N, th = Math.acos(1 - 1.75 * t), ph = i * GOLD;
    const n = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th) * 0.82, Math.sin(th) * Math.sin(ph));
    const p = n.clone().multiplyScalar(0.19 + R() * 0.01), m = alongM(p, n.clone().add(new THREE.Vector3((R() - 0.5) * 0.4, 0, (R() - 0.5) * 0.4)), 1.1 + R() * 0.3, R() * 6);
    const tint = new THREE.Color(1, 1, 1).lerp(new THREE.Color(1, 1, 1).multiply(alt).multiply(new THREE.Color(1 / Math.max(0.01, base.r), 1 / Math.max(0.01, base.g), 1 / Math.max(0.01, base.b))), R() * 0.5);
    for (let k = 0; k < 4; k++) acc.add(pm, sep, m.clone().multiply(ringM(k * Math.PI / 2, 0, 0.002)), tint.clone().multiplyScalar(0.95 + R() * 0.1));
    acc.add(plainMat(0.6), PRIM.lowball, m.clone().multiply(M(0, 0.003, 0, 0, 0, 0, 0.0025)), col(hex, 0.7));
  }
  acc.add(plainMat(0.8), PRIM.ball, M(0, 0, 0).multiply(new THREE.Matrix4().makeScale(0.175, 0.145, 0.175)), col(hex, 0.62, '#7E9A6E', 0.35));
  if (leafy) [-1, 1].forEach(sd => acc.add(leafMat(0.5), petal({ len: 0.16, wid: 0.1, shape: 'ovate', cup: 0.35, fold: 0.2, serr: 0.08, serrK: 14, bend0: 1.0, bend: 0.4, su: 8, sv: 10 }), M(0, -0.12, 0, 0, sd > 0 ? 0.6 : 3.7, 0), col('#4E7A45')));
  return acc.build();
}

/* ───────── зелень ───────── */
// Эвкалипт «серебряный доллар»: пары круглых сизых листьев
function eucalyptus(acc, R) {
  const lm = leafMat(0.85), len = 0.55, tint = col('#93B3AB');
  stemPiece(acc, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, len, 0.01), 0.0035, '#8A7A6A');
  for (let i = 0; i < 11; i++) {
    const y = 0.08 + i / 11 * (len - 0.08), s = 1.15 - i * 0.06, p = new THREE.Vector3(0.02 * y / len, y, 0.01 * y / len);
    [-1, 1].forEach(sd => acc.add(lm, petal({ len: 0.07, wid: 0.07, shape: 'disc', cup: 0.25, bend0: 0.75, bend: 0.25, reflex: 0.08, su: 10, sv: 10 }), M(p.x, p.y, p.z, 0, i * 1.2 + (sd > 0 ? 0 : Math.PI), 0, s), tint.clone().multiplyScalar(0.92 + R() * 0.14)));
  }
}
// Фисташка: веточки с узкими блестящими листочками
function pistacia(acc, R) {
  const lm = leafMat(0.38), len = 0.55, tint = col('#3E6B40');
  stemPiece(acc, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, len, 0), 0.003, '#6B5A48');
  for (let b = 0; b < 6; b++) {
    const y = 0.15 + b / 6 * (len - 0.15), a = b * 2.2, from = new THREE.Vector3(0, y, 0), dir = new THREE.Vector3(Math.cos(a), 0.9, Math.sin(a)).normalize();
    const to = from.clone().addScaledVector(dir, 0.1);
    stemPiece(acc, from, to, 0.0018, '#6B5A48');
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    for (let k = 0; k < 4; k++) [-1, 1].forEach(sd => {
      const p = from.clone().addScaledVector(dir, 0.025 + k * 0.022);
      acc.add(lm, petal({ len: 0.034, wid: 0.012, shape: 'lance', cup: 0.4, fold: 0.2, bend0: 0, bend: 0.3, su: 4, sv: 6 }), alongM(p, dir.clone().multiplyScalar(0.5).addScaledVector(side, sd), 1, sd), tint.clone().multiplyScalar(0.9 + R() * 0.2));
    });
    acc.add(lm, petal({ len: 0.034, wid: 0.012, shape: 'lance', cup: 0.4, bend0: 0, bend: 0.3, su: 4, sv: 6 }), alongM(to, dir), tint);
  }
}
// Рускус: дугой изогнутая ветка с очередными ланцетными листьями
function ruscus(acc, R) {
  const lm = leafMat(0.4), tint = col('#3B6E45');
  let prev = new THREE.Vector3(0, 0, 0);
  for (let i = 1; i <= 18; i++) {
    const t = i / 18, p = new THREE.Vector3(0.06 * t * t, 0.58 * t, 0);
    stemPiece(acc, prev, p, 0.0022);
    if (i > 3) { const sd = i % 2 ? 1 : -1; acc.add(lm, petal({ len: 0.075 - t * 0.02, wid: 0.024, shape: 'lance', cup: 0.3, fold: 0.15, bend0: 0.7, bend: 0.3, su: 4, sv: 7 }), M(p.x, p.y, p.z, 0, sd > 0 ? 0.3 : 3.4, 0), tint.clone().multiplyScalar(0.9 + R() * 0.2)); }
    prev = p;
  }
}
// Гипсофила: ветвистое облако мелких белых цветков
function gypsophila(acc, R) {
  const fl = petalMat('gyps', '#FBFAF6', { veins: 0.1 }, { sheen: 0.3, roughness: 0.8 }), len = 0.5;
  stemPiece(acc, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, len, 0), 0.0025, '#7FA27A');
  const tiny = petal({ len: 0.006, wid: 0.007, shape: 'round', cup: 0.5, bend0: 1.1, su: 3, sv: 3 });
  for (let b = 0; b < 7; b++) {
    const y = len * (0.55 + b / 7 * 0.45), a = b * GOLD, from = new THREE.Vector3(0, y, 0);
    const mid = from.clone().add(new THREE.Vector3(Math.cos(a) * 0.07, 0.05, Math.sin(a) * 0.07));
    stemPiece(acc, from, mid, 0.0012, '#86A880');
    for (let k = 0; k < 5; k++) {
      const a2 = a + (k - 2) * 0.5, end = mid.clone().add(new THREE.Vector3(Math.cos(a2) * 0.035, 0.03 + R() * 0.03, Math.sin(a2) * 0.035));
      stemPiece(acc, mid, end, 0.0008, '#86A880');
      for (let f = 0; f < 4; f++) {
        const p = end.clone().add(new THREE.Vector3((R() - 0.5) * 0.022, (R() - 0.3) * 0.016, (R() - 0.5) * 0.022)), m = alongM(p, new THREE.Vector3(R() - 0.5, 1, R() - 0.5), 1, R() * 6);
        for (let q = 0; q < 5; q++) acc.add(fl, tiny, m.clone().multiply(ringM(q / 5 * Math.PI * 2, 0, 0.0008)), vary(R, 0.04));
      }
    }
  }
}

/* ───────── публичный интерфейс ───────── */
const headCache = new Map();
let LITE = false;
export function makeHead(id, hex, leafy = false, lite = false) {
  const key = id + hex + leafy + lite;
  LITE = lite;
  if (!headCache.has(key)) {
    const f = { rose: () => roseHead(hex, leafy, false), peony: () => roseHead(hex, leafy, true), spray: () => sprayHead(hex, leafy), eustoma: () => eustomaHead(hex, leafy), tulip: () => tulipHead(hex, leafy), carnation: () => carnationHead(hex, leafy), chrys: () => chrysHead(hex, leafy), alstro: () => alstroHead(hex, leafy), hydrangea: () => hydrangeaHead(hex, leafy) }[id];
    headCache.set(key, f());
  }
  return headCache.get(key).clone();
}
const sprigCache = new Map();
export function greenSprig(kind) {
  if (!sprigCache.has(kind)) {
    const acc = new Acc(), R = rng(kind.length * 13 + 5);
    ({ euca: eucalyptus, pist: pistacia, ruscus, gyps: gypsophila }[kind])(acc, R);
    sprigCache.set(kind, acc.build());
  }
  return sprigCache.get(kind).clone();
}
export { rng };
