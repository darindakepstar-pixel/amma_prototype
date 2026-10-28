// АММА · 3D-конструктор букета · design & code: Дария Кромберг
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import { RoomEnvironment } from './RoomEnvironment.js';
import { makeHead, greenSprig, stemMaterial, paperMaterial } from './flowers.js';

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
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
camera.position.set(0, 1.9, 5.0);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1.0, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.2;
controls.maxDistance = 11;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 1.75;
controls.autoRotate = !reduce;
controls.autoRotateSpeed = 1.1;
let idleTimer = null;
let dragging = false;
controls.addEventListener('start', () => { dragging = true; controls.autoRotate = false; clearTimeout(idleTimer); });
controls.addEventListener('end', () => { dragging = false; fitDist = camera.position.distanceTo(controls.target); clearTimeout(idleTimer); idleTimer = setTimeout(() => { controls.autoRotate = state.auto && !reduce; }, 3500); });

// мягкий студийный свет: отражения от «комнаты», солнце с тенями, контровой свет
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8e4da, 0.35));
const sun = new THREE.DirectionalLight(0xfff1e2, 2.3); sun.position.set(2.5, 5, 3.5);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015; sun.shadow.radius = 4;
Object.assign(sun.shadow.camera, { left: -1.3, right: 1.3, top: 1.3, bottom: -1.3, near: 1, far: 12 });
sun.target.position.set(0, 1, 0); scene.add(sun, sun.target);
const rim = new THREE.DirectionalLight(0xe6f0ff, 0.9); rim.position.set(-4, 3, -3); scene.add(rim);

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

/* ───────────── Материалы ───────────── */
const matCache = new Map();
function mat(color, opts) {
  const key = color + JSON.stringify(opts || {});
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(color), roughness: 0.62, metalness: 0, side: THREE.DoubleSide }, opts || {})));
  return matCache.get(key);
}
const shade = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
const G = { stem: new THREE.CylinderGeometry(0.0085, 0.011, 1, 8, 1).translate(0, 0.5, 0) };

/* ───────────── Раскладка стеблей ───────────── */
const live = new Map(); // key -> {obj, stem, target, born}
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
function stemList() {
  const list = [];
  FLOWERS.forEach(f => f.variants.forEach((v, vi) => { const n = state.flowers[f.id + ':' + vi] || 0; for (let k = 0; k < n; k++) list.push({ key: `${f.id}:${vi}#${k}`, id: f.id, color: v[1], size: f.size, green: false }); }));
  GREENS.forEach(g => { const n = state.greens[g.id] || 0; for (let k = 0; k < n; k++) list.push({ key: `${g.id}#${k}`, id: g.id, color: g.color, size: 1, green: true }); });
  return list;
}
let domeR = 0.3, fitDist = 5.2;
function layout() {
  const list = stemList(), flowers = list.filter(s => !s.green), greens = list.filter(s => s.green);
  const area = flowers.reduce((a, s) => a + s.size * s.size, 0);
  domeR = 0.12 + 0.1 * Math.sqrt(area);
  fitDist = 4.6 + Math.max(0, domeR - 0.4) * 5;
  flowers.sort((a, b) => (hash(a.key) - a.size * 0.35) - (hash(b.key) - b.size * 0.35));
  const N = flowers.length, center = new THREE.Vector3(0, 1.0 + domeR * 0.6, 0);
  const thMax = N > 30 ? 1.45 : N > 15 ? 1.25 : 1.1, yk = N > 30 ? 0.8 : 0.6;
  flowers.forEach((s, i) => {
    const t = N === 1 ? 0 : (i + 0.5) / N, th = Math.acos(1 - t * (1 - Math.cos(thMax))), ph = i * 2.39996 + hash(s.key);
    s.pos = new THREE.Vector3(Math.sin(th) * Math.cos(ph) * domeR, (Math.cos(th) - (N > 30 ? 0.3 : 0)) * domeR * yk, Math.sin(th) * Math.sin(ph) * domeR).add(center);
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
      const obj = s.green ? greenSprig(s.id) : makeHead(s.id, s.color, hash(s.key + 'leaf') < (list.length > 35 ? 0.15 : 0.65), list.length > 35);
      const stem = new THREE.Mesh(G.stem, stemMaterial); stem.castShadow = true;
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
    o.obj.scale.setScalar(Math.max(0.001, sc) * (o.green ? 1.3 : o.size > 1.3 ? 1.1 : 2.45));
    const bottom = tmpV.copy(BIND).addScaledVector(dir, -0.62);
    const len = o.cur.distanceTo(bottom) - (o.green ? 0.3 : 0.04);
    o.stem.position.copy(bottom);
    o.stem.quaternion.setFromUnitVectors(UP, tmpD.copy(o.cur).sub(bottom).normalize());
    o.stem.scale.set(1, Math.max(0.01, len) * Math.max(0.001, sc), 1);
  }
}

/* ───────────── Упаковка и лента ───────────── */
// мятая бумага: лепесток упаковки с волнами-складками
function crinkle(geo, amp, seed) {
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x), r = Math.hypot(v.x, v.z), k = Math.min(1, Math.max(0, (v.y - BIND.y) / 0.5));
    const n = 1 + amp * k * (Math.sin(a * 11 + seed) * 0.6 + Math.sin(a * 23 + v.y * 9 + seed * 2) * 0.3 + Math.sin(a * 5 - seed) * 0.5);
    p.setXYZ(i, Math.cos(a) * r * n, v.y + amp * 0.4 * k * Math.sin(a * 7 + seed), Math.sin(a) * r * n);
  }
  geo.computeVertexNormals(); return geo;
}
function updateWrap() {
  wrapGroup.clear();
  const w = WRAPS.find(x => x.id === state.wrap), R = domeR, ribbonColor = RIBBONS[state.ribbon][1];
  if (w && w.color) {
    const film = w.id === 'film', m = paperMaterial(w.color, film), m2 = film ? m : paperMaterial(shade(w.color, 1.04), false);
    const cy = 1.0 + R * 0.55;
    const back = [[0.05, 0.0], [0.09, 0.25], [0.12, BIND.y], [R * 0.8 + 0.08, cy - R * 0.5], [R * 1.05 + 0.12, cy - R * 0.1], [R * 1.15 + 0.15, cy + R * 0.12]].map(p => new THREE.Vector2(p[0], p[1]));
    const front = [[0.05, 0.0], [0.09, 0.25], [0.12, BIND.y], [R * 0.78 + 0.08, cy - R * 0.55], [R * 0.98 + 0.12, cy - R * 0.22]].map(p => new THREE.Vector2(p[0], p[1]));
    const b = new THREE.Mesh(crinkle(new THREE.LatheGeometry(back, 72, Math.PI * 0.42, Math.PI * 1.16), 0.07, 1.3), m);
    const f = new THREE.Mesh(crinkle(new THREE.LatheGeometry(front, 72, -Math.PI * 0.62, Math.PI * 1.24), 0.06, 4.1), m2);
    // второй слой бумаги, чуть повёрнутый — как у настоящего букета
    const b2 = new THREE.Mesh(crinkle(new THREE.LatheGeometry(back.map(p => new THREE.Vector2(p.x * 0.97, p.y * 0.985)), 72, Math.PI * 1.25, Math.PI * 0.9), 0.08, 7.7), m2);
    [b, f, b2].forEach(x => { x.castShadow = !film; x.receiveShadow = true; });
    wrapGroup.add(b, b2, f);
  }
  const rmat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(ribbonColor), roughness: 0.32, sheen: 0.8, sheenColor: new THREE.Color(ribbonColor).lerp(new THREE.Color('#FFFFFF'), 0.5), side: THREE.DoubleSide, envMapIntensity: 0.7 });
  const knot = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 12, 48), rmat);
  knot.scale.set(1, 1, 1.6); knot.rotation.x = Math.PI / 2; knot.position.y = BIND.y; wrapGroup.add(knot);
  [-1, 1].forEach(sd => {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 10, 36), rmat);
    loop.scale.set(1.3, 0.8, 2.2); loop.position.set(sd * 0.1, BIND.y + 0.02, 0.17); loop.rotation.z = sd * 0.35; wrapGroup.add(loop);
    const tg = new THREE.PlaneGeometry(0.05, 0.34, 1, 12), tp = tg.attributes.position;
    for (let i = 0; i < tp.count; i++) { const y = tp.getY(i); tp.setZ(i, Math.sin(y * 14 + sd) * 0.012); }
    tg.computeVertexNormals();
    const tail = new THREE.Mesh(tg, rmat);
    tail.position.set(sd * 0.06, BIND.y - 0.18, 0.18); tail.rotation.z = sd * 0.25; wrapGroup.add(tail);
  });
  wrapGroup.traverse(o => { if (o.isMesh && o.material === rmat) o.castShadow = true; });
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
  // камера плавно отъезжает, если букет вырос (пока человек сам не крутит)
  if (!dragging) { const d = camera.position.distanceTo(controls.target); if (Math.abs(d - fitDist) > 0.02) camera.position.sub(controls.target).setLength(d + (fitDist - d) * 0.08).add(controls.target); }
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
window.__bq = { state, live, renderer };
