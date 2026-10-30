// АММА · 3D-конструктор: букет, букет в коробке, горшечное растение · design & code: Дария Кромберг
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import { RoomEnvironment } from './RoomEnvironment.js';
import { makeHead, greenSprig, stemMaterial, paperMaterial } from './flowers.js';
import { loadBrand, wrapPaperTex, bandTex, hatbox, giftBox, boxBag, bag, sleeve, pickTag, card, pot, ribbonMat, sticker, messageCard, frontBow, plantBox, pickPlantBox, PLANT_BOXES } from './packaging.js';
import { PLANTS, makePlant, potR } from './plants.js';
import { P as PR, priceOf, fmt, plantPrice, potPrice } from './prices.js';

/* ───────────── Каталог ───────────── */
const FLOWERS = [
  { id: 'rose', name: 'Роза', note: '50–60 см', size: 1, variants: [['Красная', '#B3203A'], ['Розовая', '#F08CA0'], ['Кремовая', '#F3E3C8'], ['Белая', '#F7F5F0']] },
  { id: 'peony', name: 'Пионовидная роза', note: 'Крупный бутон', size: 1.2, variants: [['Кремовая', '#F4E1C6'], ['Розовая', '#F3B4C2'], ['Коралловая', '#F39A86'], ['Оранжевая', '#F0823F'], ['Персиковая', '#F6BC98']] },
  { id: 'spray', name: 'Кустовая роза', note: '3–5 бутонов', size: 0.95, variants: [['Пудровая', '#E8B9B0'], ['Персиковая', '#F5BE94'], ['Белая', '#F7F5F0']] },
  { id: 'eustoma', name: 'Эустома', note: 'Нежная, как пион', size: 1, variants: [['Сиреневая', '#C9A8E0'], ['Белая', '#F7F5F0'], ['Пудровая', '#EBC3C8']] },
  { id: 'tulip', name: 'Тюльпан', note: 'Сезонный', size: 0.9, variants: [['Розовый', '#F28CA6'], ['Красный', '#D0283C'], ['Белый', '#F7F5F0'], ['Жёлтый', '#F6CF5A']] },
  { id: 'carnation', name: 'Гвоздика', note: 'Стойкая', size: 0.85, variants: [['Бордо', '#7A1E2C'], ['Розовая', '#F29BB0'], ['Белая', '#F7F5F0'], ['Кремовая', '#F2D9BE'], ['Красная', '#C21F32']] },
  { id: 'chrys', name: 'Хризантема кустовая', note: 'Ромашковидная', size: 1, variants: [['Белая', '#F7F5F0'], ['Жёлтая', '#F2D27A'], ['Сиреневая', '#D7B6E6']] },
  { id: 'alstro', name: 'Альстромерия', note: 'Стоит до 2 недель', size: 0.95, variants: [['Персиковая', '#F5A86E'], ['Розовая', '#F2A0B8'], ['Белая', '#F7F5F0']] },
  { id: 'hydrangea', name: 'Гортензия', note: 'Объём и воздух', size: 1.7, variants: [['Голубая', '#A9BFE6'], ['Белая', '#F2F2EC'], ['Розовая', '#F2BFD0']] }
];
const GREENS = [
  { id: 'euca', name: 'Эвкалипт', note: 'Серебристый', color: '#8FB3A0' },
  { id: 'pist', name: 'Фисташка', note: 'Сочная зелень', color: '#4F7F55' },
  { id: 'ruscus', name: 'Рускус', note: 'Тонкие листья', color: '#3F7A4A' },
  { id: 'gyps', name: 'Гипсофила', note: 'Белое облако', color: '#FFFFFF' },
  { id: 'stipa', name: 'Ковыль', note: 'Пушистые перья', color: '#EFE7D6' }
];
const WRAPS = [
  { id: 'amma-white', name: 'Белая АММА', paper: 'white', swatch: '#F7F6F2' },
  { id: 'amma-graphite', name: 'Графитовая АММА', paper: 'graphite', swatch: '#2B2E33' },
  { id: 'calque', name: 'Калька', paper: 'calque', swatch: '#ECEAE4' },
  { id: 'kraft', name: 'Крафт', color: '#D9C3A0', swatch: '#D9C3A0' },
  { id: 'blush', name: 'Пудровая', color: '#EED3D3', swatch: '#EED3D3' },
  { id: 'film', name: 'Прозрачная плёнка', color: '#DDEAF0', swatch: '#DDEAF0' },
  { id: 'vase', name: 'В вазе (банч)', vase: true, swatch: '#E4EEF0' },
  { id: 'none', name: 'Без упаковки', color: null, swatch: null }
];
const BOXES = [
  { id: 'hat-graphite', type: 'hat', tone: 'graphite', name: 'Шляпная, графит', swatch: '#1F2124' },
  { id: 'hat-white', type: 'hat', tone: 'white', name: 'Шляпная, белая', swatch: '#FFFFFF' },
  { id: 'hat-forest', type: 'hat', tone: 'forest', name: 'Шляпная, зелёная', swatch: '#1F4030' },
  { id: 'bag-forest', type: 'bag', tone: 'forest', name: 'Коробка-сумочка', swatch: '#1F4030' },
  { id: 'bag-graphite', type: 'bag', tone: 'graphite', name: 'Сумочка, графит', swatch: '#1F2124' },
  { id: 'gift', type: 'gift', tone: 'forest', name: 'Подарочная коробка', swatch: '#1F4030' }
];
const RIBBONS = [['Чёрная', '#1F2124'], ['Белая', '#FFFFFF'], ['Золото', '#C9A96E'], ['Зелёная', '#2F6B4F'], ['Пудровая', '#F3B4C2'], ['Красная', '#B3203A']];
const POTS = [
  { id: 'tech', name: 'Технический горшок', swatch: '#2A2C30', note: 'Для пересадки в своё кашпо' },
  { id: 'white', name: 'Белое кашпо', swatch: '#F4F3EF', note: 'Керамика, глазурь' },
  { id: 'graphite', name: 'Графитовое кашпо', swatch: '#2E3136', note: 'Керамика, глазурь' },
  { id: 'forest', name: 'Зелёное кашпо', swatch: '#1F4030', note: 'Фирменный зелёный' }
];
const PACK = [
  { id: 'label', name: 'Стикер на горшок', note: 'Знак АММА и название сорта' },
  { id: 'sleeve', name: 'Рукав-конус', note: 'Белый, со знаком — защищает листья' },
  { id: 'tag', name: 'Бирка-втыкалка', note: 'Уход, цена и QR' },
  { id: 'care', name: 'Карточка ухода', note: 'Подробно об уходе' },
  { id: 'ribbon', name: 'Лента с бантом', note: 'Атлас, цвет на выбор' },
  { id: 'gift', name: 'Подарочная коробка', note: 'Зелёная, с тишью' },
  { id: 'bag', name: 'Пакет АММА', note: 'Белый, с ручками' }
];
const PRESETS = {
  bouquet: {
    'Классика': { flowers: { 'rose:0': 15 }, greens: { euca: 3 }, wrap: 'amma-white', ribbon: 0 },
    'Нежный': { flowers: { 'peony:0': 5, 'eustoma:1': 4, 'spray:0': 3 }, greens: { euca: 3, gyps: 2 }, wrap: 'amma-white', ribbon: 2 },
    'Яркий': { flowers: { 'tulip:3': 7, 'alstro:0': 5, 'chrys:1': 3 }, greens: { pist: 3 }, wrap: 'amma-graphite', ribbon: 2 },
    'Облако': { flowers: { 'hydrangea:0': 3, 'rose:3': 7 }, greens: { gyps: 4, ruscus: 2 }, wrap: 'calque', ribbon: 1 }
  },
  box: {
    'Розы в шляпной': { flowers: { 'rose:1': 15 }, greens: { euca: 2 }, box: 'hat-graphite', ribbon: 1 },
    'Пионовидные': { flowers: { 'peony:0': 7, 'spray:0': 4 }, greens: { gyps: 2 }, box: 'hat-white', ribbon: 2 },
    'Сумочка': { flowers: { 'eustoma:0': 5, 'rose:2': 5, 'hydrangea:0': 1 }, greens: { pist: 2 }, box: 'bag-forest', ribbon: 2 },
    'Подарок': { flowers: { 'rose:0': 9, 'carnation:0': 4 }, greens: { euca: 3 }, box: 'gift', ribbon: 2 }
  },
  potted: {
    'Милый суккулент': { plant: 'echeveria', size: 9, pot: 'white', pack: ['label', 'ribbon', 'care'] },
    'Аглаонема в подарок': { plant: 'agla-red', size: 12, pot: 'white', pack: ['sleeve', 'tag', 'gift', 'ribbon'] },
    'Для офиса': { plant: 'zz', size: 14, pot: 'graphite', pack: ['label', 'tag', 'bag'] },
    'Цветущий': { plant: 'anth-red', size: 12, pot: 'tech', pack: ['sleeve', 'label', 'care'] }
  }
};
const TABS = {
  bouquet: [['flowers', '1 · Цветы'], ['greens', '2 · Зелень'], ['wrap', '3 · Упаковка'], ['ribbon', '4 · Лента']],
  box: [['flowers', '1 · Цветы'], ['greens', '2 · Зелень'], ['box', '3 · Коробка'], ['ribbon', '4 · Открытка']],
  potted: [['plant', '1 · Растение'], ['pot', '2 · Кашпо'], ['pack', '3 · Упаковка'], ['ribbon', '4 · Лента']]
};
const MAX_STEMS = 101;

const state = { mode: 'bouquet', flowers: {}, greens: {}, wrap: 'amma-white', band: true, box: 'hat-graphite', ribbon: 0, card: '', tab: 'flowers', auto: true, picked: {},
  plant: 'agla-red', size: 12, pot: 'white', pack: new Set(['sleeve', 'tag']), group: 'Все', giftClosed: false };
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
controls.minDistance = 1.6;
controls.maxDistance = 11;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 1.75;
controls.autoRotate = !reduce;
controls.autoRotateSpeed = 1.1;
let idleTimer = null;
let dragging = false;
controls.addEventListener('start', () => { dragging = true; controls.autoRotate = false; clearTimeout(idleTimer); });
controls.addEventListener('end', () => { dragging = false; fitDist = camera.position.distanceTo(controls.target); clearTimeout(idleTimer); idleTimer = setTimeout(() => { controls.autoRotate = state.auto && !reduce; }, 3500); });

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8e4da, 0.35));
const sun = new THREE.DirectionalLight(0xfff1e2, 2.3); sun.position.set(2.5, 5, 3.5);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015; sun.shadow.radius = 4;
Object.assign(sun.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 1, far: 12 });
sun.target.position.set(0, 1, 0); scene.add(sun, sun.target);
const rim = new THREE.DirectionalLight(0xe6f0ff, 0.9); rim.position.set(-4, 3, -3); scene.add(rim);

const shTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(31,33,36,0.45)'); gr.addColorStop(1, 'rgba(31,33,36,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.32; scene.add(shadow);

const floatGroup = new THREE.Group(); scene.add(floatGroup);       // всё, что парит
const bouquet = new THREE.Group(); floatGroup.add(bouquet);
const stemsGroup = new THREE.Group(); bouquet.add(stemsGroup);
const wrapGroup = new THREE.Group(); bouquet.add(wrapGroup);
const boxGroup = new THREE.Group(); floatGroup.add(boxGroup);
const boxRibbon = new THREE.Group(); floatGroup.add(boxRibbon);
const cardGroup = new THREE.Group(); floatGroup.add(cardGroup);
const plantGroup = new THREE.Group(); floatGroup.add(plantGroup);
const BIND = new THREE.Vector3(0, 0.55, 0);
const BOX_Y = 0.32;

const shade = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
const G = { stem: new THREE.CylinderGeometry(0.0085, 0.011, 1, 8, 1).translate(0, 0.5, 0) };

/* ───────────── Раскладка стеблей ───────────── */
const live = new Map();
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
function stemList() {
  const list = [];
  FLOWERS.forEach(f => f.variants.forEach((v, vi) => { const n = state.flowers[f.id + ':' + vi] || 0; for (let k = 0; k < n; k++) list.push({ key: `${f.id}:${vi}#${k}`, id: f.id, color: v[1], size: f.size, green: false }); }));
  GREENS.forEach(g => { const n = state.greens[g.id] || 0; for (let k = 0; k < n; k++) list.push({ key: `${g.id}#${k}`, id: g.id, color: g.color, size: 1, green: true }); });
  return list;
}
let domeR = 0.3, fitDist = 5.2, boxInfo = null;
const camTarget = new THREE.Vector3(0, 1.0, 0);
function layout() {
  const list = stemList(), flowers = list.filter(s => !s.green), greens = list.filter(s => s.green);
  const area = flowers.reduce((a, s) => a + s.size * s.size, 0);
  flowers.sort((a, b) => (hash(a.key) - a.size * 0.35) - (hash(b.key) - b.size * 0.35));
  const N = flowers.length;
  if (state.mode === 'box') {
    buildBox(area);
    const { top, rx, rz } = boxInfo, R = Math.max(rx, rz);
    flowers.forEach((s, i) => {
      const q = Math.sqrt((i + 0.5) / Math.max(1, N)), ph = i * 2.39996 + hash(s.key) * 0.5;
      const x = Math.cos(ph) * q * rx * 0.86, z = Math.sin(ph) * q * rz * 0.86;
      s.pos = new THREE.Vector3(x, BOX_Y + top + 0.06 + (1 - q * q) * R * 0.32, z);
      s.dir = new THREE.Vector3(x / R * 0.9, 1, z / R * 0.9).normalize();
    });
    greens.forEach((s, i) => {
      const ph = (i / Math.max(1, greens.length)) * Math.PI * 2 + hash(s.key) * 0.6;
      s.pos = new THREE.Vector3(Math.cos(ph) * rx * 0.92, BOX_Y + top - 0.02, Math.sin(ph) * rz * 0.92);
      s.dir = new THREE.Vector3(Math.cos(ph) * 1.4, 1, Math.sin(ph) * 1.4).normalize();
    });
    camTarget.set(0, BOX_Y + top * 0.7, 0);
    fitDist = 3.6 + R * 2.6;
  } else {
    domeR = 0.12 + 0.1 * Math.sqrt(area);
    fitDist = 4.6 + Math.max(0, domeR - 0.4) * 5;
    const center = new THREE.Vector3(0, 1.0 + domeR * 0.6, 0);
    const thMax = N > 30 ? 1.45 : N > 15 ? 1.25 : 1.1, yk = N > 30 ? 0.8 : 0.6;
    flowers.forEach((s, i) => {
      const t = N === 1 ? 0 : (i + 0.5) / N, th = Math.acos(1 - t * (1 - Math.cos(thMax))), ph = i * 2.39996 + hash(s.key);
      s.pos = new THREE.Vector3(Math.sin(th) * Math.cos(ph) * domeR, (Math.cos(th) - (N > 30 ? 0.3 : 0)) * domeR * yk, Math.sin(th) * Math.sin(ph) * domeR).add(center);
    });
    greens.forEach((s, i) => {
      const ph = (i / Math.max(1, greens.length)) * Math.PI * 2 + hash(s.key) * 0.6, r = domeR * 1.05 + 0.05;
      s.pos = new THREE.Vector3(Math.cos(ph) * r, center.y - domeR * 0.35 + hash(s.key + 'y') * 0.12, Math.sin(ph) * r);
    });
    camTarget.set(0, 1.0, 0);
  }
  const keys = new Set(list.map(s => s.key));
  for (const [k, o] of live) if (!keys.has(k)) { o.dying = performance.now(); }
  list.forEach(s => {
    let o = live.get(s.key);
    if (!o || o.dying) {
      if (o) { stemsGroup.remove(o.obj, o.stem); }
      const obj = s.green ? greenSprig(s.id) : makeHead(s.id, s.color, state.mode === 'bouquet' && hash(s.key + 'leaf') < (list.length > 35 ? 0.15 : 0.65), list.length > 35);
      const stem = new THREE.Mesh(G.stem, stemMaterial); stem.castShadow = true;
      obj.scale.setScalar(0.001); stemsGroup.add(obj, stem);
      o = { obj, stem, cur: s.pos.clone().lerp(state.mode === 'box' ? new THREE.Vector3(0, BOX_Y + boxInfo.top, 0) : BIND, 0.4), born: performance.now(), green: s.green, size: s.size };
      live.set(s.key, o);
    }
    o.target = s.pos; o.dir = s.dir || null;
  });
  if (state.mode === 'bouquet') updateWrap();
  updateCard();
}
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3(), tmpD = new THREE.Vector3();
function easeOutBack(x) { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
function animateStems(now) {
  const inBox = state.mode === 'box', vase = isVase();
  for (const [k, o] of live) {
    let sc;
    if (o.dying) {
      const t = Math.min(1, (now - o.dying) / 300); sc = 1 - t;
      if (t >= 1) { stemsGroup.remove(o.obj, o.stem); live.delete(k); continue; }
    } else sc = easeOutBack(Math.min(1, (now - o.born) / 520));
    o.cur.lerp(o.target, reduce ? 1 : 0.12);
    o.obj.position.copy(o.cur);
    if (inBox && o.dir) {
      o.obj.quaternion.setFromUnitVectors(UP, o.dir);
      o.stem.visible = false;
      o.obj.scale.setScalar(Math.max(0.001, sc) * (o.green ? 1.05 : o.size > 1.3 ? 1.1 : 2.45));
      continue;
    }
    o.stem.visible = true;
    const dir = tmpD.copy(o.cur).sub(BIND).normalize();
    o.obj.quaternion.setFromUnitVectors(UP, o.green ? tmpV.copy(dir).add(new THREE.Vector3(0, 0.6, 0)).normalize() : dir);
    if (o.green) o.obj.position.copy(BIND).addScaledVector(tmpV, 0.12);
    o.obj.scale.setScalar(Math.max(0.001, sc) * (o.green ? 1.3 : o.size > 1.3 ? 1.1 : 2.45));
    const bottom = tmpV.copy(BIND).addScaledVector(dir, -0.62);
    if (vase) { const rr = Math.hypot(bottom.x, bottom.z), mx = 0.12; if (rr > mx) { bottom.x *= mx / rr; bottom.z *= mx / rr; } bottom.y = Math.max(bottom.y, -0.27); }
    const len = o.cur.distanceTo(bottom) - (o.green ? 0.3 : 0.04);
    o.stem.position.copy(bottom);
    o.stem.quaternion.setFromUnitVectors(UP, tmpD.copy(o.cur).sub(bottom).normalize());
    o.stem.scale.set(1, Math.max(0.01, len) * Math.max(0.001, sc), 1);
  }
}

/* ───────────── Упаковка букета и лента ───────────── */
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
const brandPaper = new Map();
function wrapMat(w, light) {
  if (w.paper) {
    const key = w.paper + light;
    if (!brandPaper.has(key)) {
      const t = wrapPaperTex(w.paper).clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1.4);
      brandPaper.set(key, new THREE.MeshStandardMaterial({ map: t, color: light ? '#FFFFFF' : '#F2F2F2', roughness: 0.9, side: THREE.DoubleSide, envMapIntensity: 0.4, transparent: w.paper === 'calque', opacity: w.paper === 'calque' ? 0.82 : 1, depthWrite: w.paper !== 'calque' }));
    }
    return brandPaper.get(key);
  }
  return paperMaterial(light ? shade(w.color, 1.04) : w.color, w.id === 'film');
}
function ribbonBow(group, y, ribbonColor) {
  const rmat = ribbonMat(ribbonColor);
  const knot = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 12, 48), rmat);
  knot.scale.set(1, 1, 1.6); knot.rotation.x = Math.PI / 2; knot.position.y = y; group.add(knot);
  [-1, 1].forEach(sd => {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 10, 36), rmat);
    loop.scale.set(1.3, 0.8, 2.2); loop.position.set(sd * 0.1, y + 0.02, 0.17); loop.rotation.z = sd * 0.35; group.add(loop);
    const tg = new THREE.PlaneGeometry(0.05, 0.34, 1, 12), tp = tg.attributes.position;
    for (let i = 0; i < tp.count; i++) { const yy = tp.getY(i); tp.setZ(i, Math.sin(yy * 14 + sd) * 0.012); }
    tg.computeVertexNormals();
    const tail = new THREE.Mesh(tg, rmat);
    tail.position.set(sd * 0.06, y - 0.18, 0.18); tail.rotation.z = sd * 0.25; group.add(tail);
  });
  group.traverse(o => { if (o.isMesh && o.material === rmat) o.castShadow = true; });
}
function updateWrap() {
  wrapGroup.clear();
  const w = WRAPS.find(x => x.id === state.wrap), R = domeR, ribbonColor = RIBBONS[state.ribbon][1];
  if (w && (w.color || w.paper)) {
    const film = w.id === 'film', m = wrapMat(w, false), m2 = film ? m : wrapMat(w, true);
    const cy = 1.0 + R * 0.55;
    const back = [[0.05, 0.0], [0.09, 0.25], [0.12, BIND.y], [R * 0.8 + 0.08, cy - R * 0.5], [R * 1.05 + 0.12, cy - R * 0.1], [R * 1.15 + 0.15, cy + R * 0.12]].map(p => new THREE.Vector2(p[0], p[1]));
    const front = [[0.05, 0.0], [0.09, 0.25], [0.12, BIND.y], [R * 0.78 + 0.08, cy - R * 0.55], [R * 0.98 + 0.12, cy - R * 0.22]].map(p => new THREE.Vector2(p[0], p[1]));
    const b = new THREE.Mesh(crinkle(new THREE.LatheGeometry(back, 72, Math.PI * 0.42, Math.PI * 1.16), 0.07, 1.3), m);
    const f = new THREE.Mesh(crinkle(new THREE.LatheGeometry(front, 72, -Math.PI * 0.62, Math.PI * 1.24), 0.06, 4.1), m2);
    const b2 = new THREE.Mesh(crinkle(new THREE.LatheGeometry(back.map(p => new THREE.Vector2(p.x * 0.97, p.y * 0.985)), 72, Math.PI * 1.25, Math.PI * 0.9), 0.08, 7.7), m2);
    [b, f, b2].forEach(x => { x.castShadow = !film; x.receiveShadow = true; });
    wrapGroup.add(b, b2, f);
    // бандероль АММА: графитовая полоса со знаком поверх бумаги
    if (state.band && !film) {
      const y0 = BIND.y + 0.09, h = 0.075, top = cy - R * 0.55, kk = (y0 - BIND.y) / Math.max(0.05, top - BIND.y);
      const rb = 0.12 + (R * 0.78 - 0.04) * kk + 0.055, rt = 0.12 + (R * 0.78 - 0.04) * ((y0 + h - BIND.y) / Math.max(0.05, top - BIND.y)) + 0.065;
      const t = bandTex().clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 64, 1, true, -Math.PI * 0.62, Math.PI * 1.24), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, side: THREE.DoubleSide }));
      band.position.y = y0 + h / 2; band.castShadow = true; wrapGroup.add(band);
    }
  }
  if (w && w.vase) { buildVase(); return; }
  ribbonBow(wrapGroup, BIND.y, ribbonColor);
}
// стеклянная ваза с водой: банч стоит, стебли видны сквозь стекло
function buildVase() {
  const y0 = -0.31, y1 = BIND.y + 0.03, pts = [[0, y0], [0.15, y0], [0.165, y0 + 0.02], [0.175, y0 + 0.3], [0.17, y1 - 0.12], [0.155, y1]].map(p => new THREE.Vector2(p[0], p[1]));
  const glass = new THREE.MeshPhysicalMaterial({ color: '#EAF4F2', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.4 });
  const v = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), glass); v.renderOrder = 2; wrapGroup.add(v);
  const rimM = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.004, 8, 64), new THREE.MeshPhysicalMaterial({ color: '#DDEBE8', roughness: 0.05, transparent: true, opacity: 0.5, clearcoat: 1 })); rimM.rotation.x = Math.PI / 2; rimM.position.y = y1; wrapGroup.add(rimM);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.025, 48), new THREE.MeshPhysicalMaterial({ color: '#D5E6E2', roughness: 0.05, transparent: true, opacity: 0.45, clearcoat: 1 })); base.position.y = y0 + 0.0125; wrapGroup.add(base);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.168, 0.162, 0.32, 48), new THREE.MeshPhysicalMaterial({ color: '#CFE3E6', roughness: 0.02, transparent: true, opacity: 0.18, depthWrite: false })); water.position.y = y0 + 0.025 + 0.16; water.renderOrder = 1; wrapGroup.add(water);
}
const isVase = () => state.mode === 'bouquet' && state.wrap === 'vase';

/* ───────────── Коробка для цветов ───────────── */
let boxKey = '';
function buildBox(area) {
  const b = BOXES.find(x => x.id === state.box) || BOXES[0];
  const r = Math.min(0.75, Math.max(0.3, 0.1 + 0.13 * Math.sqrt(Math.max(1, area))));
  const rq = Math.round(r * 20) / 20, key = b.id + rq;
  if (key === boxKey) return;
  boxKey = key; boxGroup.clear();
  let obj;
  if (b.type === 'hat') { obj = hatbox(b.tone, rq, 0.26 + rq * 0.5); boxInfo = { top: obj.userData.top, rx: rq, rz: rq, shape: 'round', h: 0.26 + rq * 0.5 }; }
  else if (b.type === 'bag') { obj = boxBag(b.tone, rq * 1.9, rq * 1.2, 0.3 + rq * 0.75); boxInfo = { top: obj.userData.top, rx: obj.userData.w / 2, rz: obj.userData.d / 2, shape: 'bag', h: 0.3 + rq * 0.75, w: rq * 1.9, d: rq * 1.2 }; }
  else { obj = giftBox(b.tone, rq * 2, rq * 2, 0.24 + rq * 0.15, { open: true, tissuePaper: false, ribbon: false, foam: true }); boxInfo = { top: obj.userData.top, rx: rq, rz: rq, shape: 'rect', h: 0.24 + rq * 0.15, w: rq * 2, d: rq * 2 }; }
  obj.position.y = BOX_Y; boxGroup.add(obj);
  updateBoxRibbon();
}
// цветная атласная лента вокруг коробки и бант спереди
const HIDE = new THREE.MeshBasicMaterial({ visible: false });
function updateBoxRibbon() {
  boxRibbon.clear();
  if (state.mode !== 'box' || !boxInfo) return;
  const rc = RIBBONS[state.ribbon][1], m = ribbonMat(rc), bi = boxInfo, hh = 0.05;
  let y, front;
  if (bi.shape === 'round') {
    y = BOX_Y + bi.h * 0.86;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(bi.rx * 1.008, bi.rx * 1.008, hh, 96, 1, true), m); band.position.y = y; boxRibbon.add(band);
    front = bi.rx * 1.008;
  } else {
    y = BOX_Y + bi.h * (bi.shape === 'bag' ? 0.84 : 0.55);
    const k = bi.shape === 'bag' ? 1 - (1 - 0.88) * 0.84 : 1, kz = bi.shape === 'bag' ? 1 - (1 - 0.94) * 0.84 : 1;
    const band = new THREE.Mesh(new THREE.BoxGeometry(bi.w * k * 1.012, hh, bi.d * kz * 1.02), [m, m, HIDE, HIDE, m, m]); band.position.y = y; boxRibbon.add(band);
    front = bi.d * kz * 0.51;
  }
  const bow = frontBow(rc, 0.9 + Math.max(bi.rx, bi.rz) * 0.6); bow.position.set(0, y + 0.01, front + 0.012); boxRibbon.add(bow);
  boxRibbon.traverse(o => { if (o.isMesh) o.castShadow = true; });
}
// открытка с текстом покупателя: на шпажке в коробке или на ленте букета
function updateCard() {
  cardGroup.children.forEach(o => o.traverse(x => x.userData.dispose && x.userData.dispose()));
  cardGroup.clear();
  const txt = (state.card || '').trim();
  if (!txt || state.mode === 'potted') return;
  const c = messageCard(txt), holder = new THREE.Group();
  const clear = new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: 0.1, transparent: true, opacity: 0.45, clearcoat: 1 });
  if (state.mode === 'box' && boxInfo) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.42, 8).translate(0, 0.21, 0), clear);
    const clip = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 8, 16), clear); clip.position.y = 0.42;
    c.position.y = 0.42 + 0.14; c.scale.setScalar(1.35); holder.add(stick, clip, c);
    holder.position.set(boxInfo.rx * 0.38, BOX_Y + boxInfo.top - 0.08, boxInfo.rz * 0.82);
    holder.rotation.set(-0.3, 0.22, -0.04);
  } else {
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.1, 6), ribbonMat(RIBBONS[state.ribbon][1])); string.position.y = 0.05;
    c.position.y = -0.15; c.scale.setScalar(1.3); holder.add(string, c);
    holder.position.set(0.08, BIND.y - 0.06, 0.25); holder.rotation.set(0.12, -0.15, 0.1);
  }
  cardGroup.add(holder);
}

/* ───────────── Горшечное растение ───────────── */
let plantBoxSize = null;
function buildPlant() {
  plantGroup.clear();
  const p = PLANTS.find(x => x.id === state.plant), cm = state.size, r = potR(cm), on = k => state.pack.has(k), gift = on('gift');
  const nm = p.name.replace(/«|»/g, ''), rc = RIBBONS[state.ribbon][1];
  const root = new THREE.Group(); plantGroup.add(root);
  const potObj = pot(state.pot, r, on('label') ? nm : null);
  const plant = makePlant(p.id, cm); plant.position.y = potObj.userData.soilY;
  const unit = new THREE.Group(); unit.add(potObj, plant);
  const bb = new THREE.Box3().setFromObject(plant), ph = Math.max(0.2, bb.max.y), pw = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
  if (on('sleeve')) { const sl = sleeve(r * 0.98, Math.max(r * 1.9, pw * 0.42), Math.min(ph * 0.82, Math.max(0.5, ph * 0.7))); unit.add(sl); }
  if (on('tag')) { const t = pickTag(nm, p.care); t.scale.setScalar(Math.min(1, 0.6 + r)); t.position.set(r * 0.45, potObj.userData.soilY - 0.08, r * 0.35); t.rotation.set(-0.12, -0.5, 0.06); unit.add(t); }
  // лента: в подарочной коробке — на крышке, иначе — на кашпо с плоским бантом спереди
  if (on('ribbon') && !gift) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(r * 0.995, 0.009, 8, 64), ribbonMat(rc));
    band.rotation.x = Math.PI / 2; band.position.y = potObj.userData.h * 0.8; unit.add(band);
    const bow = frontBow(rc, 0.4 + r * 0.9); bow.position.set(0, potObj.userData.h * 0.8, r * 1.0); unit.add(bow);
  }
  plantBoxSize = null;
  let boxW = 0;
  if (gift) {
    const total = potObj.userData.h + ph, B = pickPlantBox(r * 2, total, pw);
    plantBoxSize = B;
    const box = plantBox(B.id, { closed: state.giftClosed, ribbon: on('ribbon') ? rc : '#C9A96E' });
    boxW = box.userData.w; root.add(box);
    unit.position.y = 0.05;
    const fitY = Math.min(1, (box.userData.h - 0.06) / (total * 1.02)), fitXZ = Math.min(fitY, (boxW * 0.9) / Math.max(pw * fitY, r * 2.05)); unit.scale.set(fitXZ, fitY, fitXZ);
  }
  root.add(unit);
  const side = gift ? boxW / 2 : r * 1.3;
  if (on('care')) { const c = card('care', nm); c.scale.setScalar(0.8); if (gift) { c.position.set(-(side + 0.22), 0, side * 0.55); c.rotation.set(-0.14, 0.4, 0); } else { c.position.set(side + 0.25, 0, r * 0.6); c.rotation.set(-0.14, -0.35, 0); } root.add(c); }
  if (on('bag')) { const b = bag('wide'); b.scale.setScalar(0.75 + r * 0.8); b.position.set(-(side + (on('care') && gift ? 0.85 : 0.5)), 0, -0.2); b.rotation.y = 0.35; root.add(b); }
  root.position.y = 0.05;
  root.traverse(o => { if (o.isMesh && !o.userData.noShadow) { o.castShadow = true; o.receiveShadow = !gift; } });
  const all = new THREE.Box3().setFromObject(root), size = all.getSize(new THREE.Vector3()), c = all.getCenter(new THREE.Vector3());
  camTarget.set(c.x * 0.3, c.y, 0);
  fitDist = Math.max(2.2, Math.max(size.y, size.x * 0.75) * 2.3 + 0.8);
  canvas.setAttribute('aria-label', `${p.name} в горшке ${cm} см, ${POTS.find(x => x.id === state.pot).name.toLowerCase()}` + (plantBoxSize ? `, в подарочной коробке ${plantBoxSize.id}` : ''));
}

/* ───────────── Режимы ───────────── */
function applyMode() {
  const m = state.mode;
  boxRibbon.visible = m === 'box';
  bouquet.visible = m !== 'potted'; wrapGroup.visible = m === 'bouquet'; boxGroup.visible = m === 'box'; plantGroup.visible = m === 'potted';
  if (m === 'potted') buildPlant(); else { boxKey = ''; if (m === 'bouquet') boxGroup.clear(); layout(); }
  shadow.position.y = m === 'bouquet' ? -0.32 : -0.02;
  updateBoxRibbon(); updateCard();
}

/* ───────────── Цикл отрисовки ───────────── */
function resize() {
  const r = stageEl.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stageEl); resize();
function frame(now) {
  if (window.__bqPause) { requestAnimationFrame(frame); return; }
  const t = now / 1000, bob = reduce || isVase() ? 0 : Math.sin(t * 0.9);
  floatGroup.position.y = bob * (state.mode === 'bouquet' ? 0.05 : 0.03);
  const base = state.mode === 'bouquet' ? 0.8 + domeR : state.mode === 'box' ? 0.6 + (boxInfo ? Math.max(boxInfo.rx, boxInfo.rz) * 1.6 : 0.6) : 1.3;
  shadow.scale.setScalar((1 - bob * 0.08) * base);
  shadow.material.opacity = 0.9 - bob * 0.2;
  controls.target.lerp(camTarget, 0.08);
  if (!dragging) { const d = camera.position.distanceTo(controls.target); if (Math.abs(d - fitDist) > 0.02) camera.position.sub(controls.target).setLength(d + (fitDist - d) * 0.08).add(controls.target); }
  animateStems(now); controls.update(); renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

/* ───────────── Панель ───────────── */
const panel = document.getElementById('bq-panel');
const summaryEl = document.getElementById('bq-summary');
const emptyEl = document.getElementById('bq-empty');
const tabsEl = document.getElementById('bq-tabs');
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
function choiceGrid(label, items, current, onPick, visual, price) {
  const grid = el('div', { class: 'bq-grid', role: 'radiogroup', 'aria-label': label });
  items.forEach(it => {
    const b = el('button', { type: 'button', role: 'radio', 'aria-checked': String(current === it.id), class: 'bq-card' + (current === it.id ? ' is-on' : '') }, visual(it) + `<span>${it.name}</span>` + (it.note ? `<small class="bq-note">${it.note}</small>` : '') + (price ? `<small class="bq-note"><b>${price(it)}</b></small>` : ''));
    b.onclick = () => onPick(it.id); grid.appendChild(b);
  });
  return grid;
}
function renderTabs() {
  tabsEl.innerHTML = '';
  TABS[state.mode].forEach(([id, label]) => {
    const b = el('button', { type: 'button', class: 'bq-tab' + (state.tab === id ? ' is-on' : ''), role: 'tab', 'aria-selected': String(state.tab === id), 'data-bq-tab': id }, label);
    b.onclick = () => { state.tab = id; renderTabs(); renderPanel(); };
    tabsEl.appendChild(b);
  });
  document.querySelectorAll('[data-bq-mode]').forEach(b => { const on = b.dataset.bqMode === state.mode; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
}
let cardTimer = null;
function ribbonPanel(withCard) {
  panel.appendChild(el('div', { class: 'bq-name', style: 'margin-bottom:10px' }, 'Лента'));
  const rg = el('div', { class: 'bq-swatches bq-swatches--big', role: 'radiogroup', 'aria-label': 'Цвет ленты' });
  RIBBONS.forEach((r, i) => {
    const b = el('button', { type: 'button', role: 'radio', 'aria-checked': String(state.ribbon === i), class: 'bq-sw' + (state.ribbon === i ? ' is-on' : ''), 'aria-label': r[0], title: r[0], style: `--c:${r[1]}` });
    b.onclick = () => { state.ribbon = i; if (state.mode === 'potted') { if (!state.pack.has('ribbon')) state.pack.add('ribbon'); buildPlant(); } else if (state.mode === 'bouquet') { updateWrap(); updateCard(); } else updateBoxRibbon(); renderPanel(); renderSummary(); };
    rg.appendChild(b);
  });
  panel.appendChild(rg);
  if (state.mode === 'potted') panel.appendChild(el('p', { class: 'bq-note', style: 'margin:10px 0 0' }, 'Лента повязывается на кашпо с бантом спереди.'));
  if (withCard) {
    const lab = el('label', { for: 'bq-card', class: 'bq-name', style: 'display:block;margin:22px 0 8px' }, 'Открытка');
    const ta = el('textarea', { id: 'bq-card', rows: '4', class: 'bq-textarea', placeholder: 'Напишите пожелание — подпишем от руки', maxlength: '300' });
    ta.value = state.card; ta.oninput = () => { state.card = ta.value; clearTimeout(cardTimer); cardTimer = setTimeout(() => { updateCard(); renderSummary(); }, 250); };
    panel.append(lab, ta);
  }
}
function renderPanel() {
  panel.innerHTML = '';
  const t = state.tab;
  if (t === 'flowers') {
    FLOWERS.forEach(f => {
      const vi = state.picked[f.id], key = f.id + ':' + vi, n = state.flowers[key] || 0;
      const row = el('div', { class: 'bq-row' });
      const info = el('div', { class: 'bq-info' }, `<span class="bq-name">${f.name}</span><span class="bq-note">${f.note} · ${fmt(PR.flower[f.id])}/шт</span>`);
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
  } else if (t === 'greens') {
    GREENS.forEach(g => {
      const n = state.greens[g.id] || 0, row = el('div', { class: 'bq-row' });
      row.append(el('div', { class: 'bq-info' }, `<span class="bq-name"><span class="bq-dot" style="--c:${g.color}"></span>${g.name}</span><span class="bq-note">${g.note} · ${fmt(PR.green[g.id])}/ветка</span>`),
        stepper(g.name, n, () => change('greens', g.id, -1), () => change('greens', g.id, 1)));
      panel.appendChild(row);
    });
  } else if (t === 'wrap') {
    panel.appendChild(choiceGrid('Упаковка', WRAPS, state.wrap, id => { state.wrap = id; updateWrap(); renderPanel(); renderSummary(); },
      w => `<span class="bq-paper${w.paper ? ' bq-paper--amma bq-paper--' + w.paper : ''}" style="--c:${w.swatch || 'transparent'}">${w.swatch ? '' : '—'}</span>`, w => w.id === 'vase' ? 'пачкой, ваза не входит' : PR.wrap[w.id] ? fmt(PR.wrap[w.id]) : 'бесплатно'));
    const lab = el('label', { class: 'bq-toggle' }, `<input type="checkbox" ${state.band ? 'checked' : ''}> <span><b>Бандероль АММА</b><small class="bq-note">Графитовая полоса со знаком поверх бумаги</small></span>`);
    lab.querySelector('input').onchange = e => { state.band = e.target.checked; updateWrap(); renderSummary(); };
    panel.appendChild(lab);
  } else if (t === 'box') {
    panel.appendChild(choiceGrid('Коробка', BOXES, state.box, id => { state.box = id; boxKey = ''; layout(); renderPanel(); renderSummary(); },
      b => `<span class="bq-boxicon bq-boxicon--${b.type}" style="--c:${b.swatch}"></span>`, b => fmt(PR.box[b.id])));
    panel.appendChild(el('p', { class: 'bq-note', style: 'margin:12px 4px 0;line-height:1.5' }, 'Цветы ставятся во влажную флористическую губку — композиция стоит без вазы. Размер коробки подбирается под количество цветов.'));
  } else if (t === 'plant') {
    const groups = ['Все', ...new Set(PLANTS.map(p => p.group))];
    const gr = el('div', { class: 'bq-filter', role: 'radiogroup', 'aria-label': 'Группа растений' });
    groups.forEach(g => { const b = el('button', { type: 'button', role: 'radio', 'aria-checked': String(state.group === g), class: 'bq-chip' + (state.group === g ? ' is-on' : '') }, g); b.onclick = () => { state.group = g; renderPanel(); }; gr.appendChild(b); });
    panel.appendChild(gr);
    PLANTS.filter(p => state.group === 'Все' || p.group === state.group).forEach(p => {
      const on = state.plant === p.id, row = el('div', { class: 'bq-row' + (on ? ' is-on' : '') });
      const info = el('div', { class: 'bq-info' }, `<span class="bq-name">${p.name}</span><span class="bq-note">${p.note} · от ${fmt(plantPrice(p.id, p.sizes[0]))}</span>`);
      const sizes = el('div', { class: 'bq-swatches', role: 'radiogroup', 'aria-label': 'Размер горшка: ' + p.name });
      p.sizes.forEach(cm => { const sel = on && state.size === cm; const b = el('button', { type: 'button', role: 'radio', 'aria-checked': String(sel), class: 'bq-size' + (sel ? ' is-on' : '') }, cm + ' см'); b.onclick = () => { state.plant = p.id; state.size = cm; buildPlant(); renderPanel(); renderSummary(); }; sizes.appendChild(b); });
      info.appendChild(sizes);
      const pick = el('button', { type: 'button', class: 'bq-pick' + (on ? ' is-on' : ''), 'aria-pressed': String(on) }, on ? 'Выбрано' : 'Выбрать');
      pick.onclick = () => { state.plant = p.id; if (!p.sizes.includes(state.size)) state.size = p.sizes[0]; buildPlant(); renderPanel(); renderSummary(); };
      row.append(info, pick); panel.appendChild(row);
    });
  } else if (t === 'pot') {
    panel.appendChild(choiceGrid('Кашпо', POTS, state.pot, id => { state.pot = id; buildPlant(); renderPanel(); renderSummary(); },
      p => `<span class="bq-potic" style="--c:${p.swatch}"></span>`, p => potPrice(p.id, state.size) ? fmt(potPrice(p.id, state.size)) : 'входит в цену'));
  } else if (t === 'pack') {
    panel.appendChild(el('p', { class: 'bq-note', style: 'margin:0 4px 6px' }, 'Отметьте, что положить вместе с растением:'));
    PACK.forEach(a => {
      const lab = el('label', { class: 'bq-toggle' }, `<input type="checkbox" ${state.pack.has(a.id) ? 'checked' : ''}> <span><b>${a.name}</b><small class="bq-note">${a.note} · ${a.id === 'gift' ? 'от ' + fmt(PR.giftBox.S) : PR.pack[a.id] ? fmt(PR.pack[a.id]) : 'бесплатно'}</small></span>`);
      lab.querySelector('input').onchange = e => { e.target.checked ? state.pack.add(a.id) : state.pack.delete(a.id); buildPlant(); renderPanel(); renderSummary(); };
      panel.appendChild(lab);
      if (a.id === 'gift' && state.pack.has('gift')) {
        const sub = el('div', { class: 'bq-sub' });
        const B = plantBoxSize || PLANT_BOXES[1];
        sub.appendChild(el('div', { class: 'bq-note' }, `Размер подобран под растение: <b>${B.id} · ${B.cm.join('×')} см</b>. С окном — растение видно, даже когда коробка закрыта.`));
        const sizes = el('div', { class: 'bq-sizes', 'aria-label': 'Размеры коробок' }, PLANT_BOXES.map(b => `<span class="bq-size${b.id === B.id ? ' is-on' : ''}" title="${b.note}">${b.id} · ${b.cm.join('×')}</span>`).join(''));
        const cl = el('label', { class: 'bq-toggle bq-toggle--sub' }, `<input type="checkbox" ${state.giftClosed ? 'checked' : ''}> <span><b>Закрыть крышку</b><small class="bq-note">Так коробку получит адресат</small></span>`);
        cl.querySelector('input').onchange = e => { state.giftClosed = e.target.checked; buildPlant(); };
        sub.append(sizes, cl); panel.appendChild(sub);
      }
    });
  } else ribbonPanel(state.mode !== 'potted');
}
function change(group, key, d) {
  if (d > 0 && total() >= MAX_STEMS) return;
  state[group][key] = Math.max(0, (state[group][key] || 0) + d);
  if (!state[group][key]) delete state[group][key];
  layout(); renderPanel(); renderSummary();
}
function renderSummary() {
  if (state.mode === 'potted') {
    const p = PLANTS.find(x => x.id === state.plant), potN = POTS.find(x => x.id === state.pot).name;
    const packs = PACK.filter(a => state.pack.has(a.id)).map(a => a.name + (a.id === 'ribbon' ? ': ' + RIBBONS[state.ribbon][0].toLowerCase() : a.id === 'gift' && plantBoxSize ? ' ' + plantBoxSize.id + ' · ' + plantBoxSize.cm.join('×') + ' см' : ''));
    summaryEl.innerHTML = `<div class="bq-total"><span>${p.name} · горшок ${state.size} см</span><b>${fmt(priceOf(state, plantBoxSize && plantBoxSize.id))}</b></div><div class="bq-chips"><span>${potN}</span>${packs.map(x => `<span>${x}</span>`).join('')}</div>`;
    emptyEl.hidden = true;
    document.getElementById('bq-cart').disabled = false; document.getElementById('bq-send').disabled = false;
    document.getElementById('bq-send').textContent = 'Спросить флориста';
    return;
  }
  document.getElementById('bq-send').textContent = 'Отправить флористу';
  const parts = [];
  FLOWERS.forEach(f => f.variants.forEach((v, i) => { const n = state.flowers[f.id + ':' + i]; if (n) parts.push(`${f.name} ${v[0].toLowerCase()} × ${n}`); }));
  GREENS.forEach(g => { const n = state.greens[g.id]; if (n) parts.push(`${g.name} × ${n}`); });
  const n = total(), kinds = Object.keys(state.flowers).length;
  const cardChip = state.card.trim() ? ['Открытка: «' + (state.card.trim().length > 28 ? state.card.trim().slice(0, 28) + '…' : state.card.trim()) + '»'] : [];
  const packChips = state.mode === 'box' ? [BOXES.find(x => x.id === state.box).name, 'Лента: ' + RIBBONS[state.ribbon][0].toLowerCase(), ...cardChip] : state.wrap === 'vase' ? ['В вазе (банч)', ...cardChip] : [WRAPS.find(x => x.id === state.wrap).name, ...(state.band && state.wrap !== 'none' && state.wrap !== 'film' ? ['Бандероль АММА'] : []), 'Лента: ' + RIBBONS[state.ribbon][0].toLowerCase(), ...cardChip];
  if (n && state.wrap !== 'vase' || n && state.mode === 'box') packChips.push('Сборка флористом ' + fmt(state.mode === 'box' ? PR.assembly.box : PR.assembly.bouquet));
  summaryEl.innerHTML = `<div class="bq-total"><span>${n ? `${n} ${plural(n, 'стебель', 'стебля', 'стеблей')} · ${kinds} ${plural(kinds, 'вид', 'вида', 'видов')} цветов` : (state.mode === 'box' ? 'Коробка пока пустая' : 'Букет пока пустой')}</span><b>${n ? fmt(priceOf(state)) : '0\u00A0₽'}</b></div>
    <div class="bq-chips">${parts.map(p => `<span>${p}</span>`).join('')}${packChips.map(p => `<span>${p}</span>`).join('')}</div>`;
  emptyEl.hidden = n > 0;
  emptyEl.textContent = state.mode === 'box' ? 'Коробка пока пустая — добавьте цветы справа' : 'Букет пока пустой — добавьте первый цветок справа';
  canvas.setAttribute('aria-label', n ? (state.mode === 'box' ? 'Цветы в коробке: ' : 'Ваш букет: ') + parts.join(', ') + ', ' + packChips[0].toLowerCase() : 'Пусто — добавьте цветы');
  document.getElementById('bq-cart').disabled = n === 0;
  document.getElementById('bq-send').disabled = n === 0;
}
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; }
function applyPreset(p) {
  if (state.mode === 'potted') {
    state.plant = p.plant; state.size = p.size; state.pot = p.pot; state.pack = new Set(p.pack); buildPlant(); renderPanel(); renderSummary(); return;
  }
  state.flowers = Object.assign({}, p.flowers); state.greens = Object.assign({}, p.greens); state.ribbon = p.ribbon;
  if (p.wrap) state.wrap = p.wrap; if (p.box) { state.box = p.box; boxKey = ''; }
  Object.keys(p.flowers).forEach(k => { const [id, vi] = k.split(':'); state.picked[id] = +vi; });
  layout(); renderPanel(); renderSummary();
}
function toast(msg) { const t = document.getElementById('bq-toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 3200); }

const presetsEl = document.getElementById('bq-presets');
function renderPresets() {
  presetsEl.innerHTML = '';
  Object.keys(PRESETS[state.mode]).forEach(name => { const b = el('button', { type: 'button', class: 'bq-chip' }, name); b.onclick = () => applyPreset(PRESETS[state.mode][name]); presetsEl.appendChild(b); });
}
const TITLES = {
  bouquet: ['Соберите свой букет', 'Добавляйте цветы, зелень, упаковку и ленту — букет соберётся в 3D. Флорист соберёт его по этой схеме из свежего прихода.'],
  box: ['Цветы в коробке', 'Выберите цветы и коробку АММА: шляпную, сумочку или подарочную. Композиция стоит во влажной губке без вазы.'],
  potted: ['Растение в подарок', 'Выберите горшечное растение — от суккулента до аглаонемы — кашпо и упаковку. Всё покажем в 3D, как получит адресат.']
};
function setMode(m, preset) {
  state.mode = m; state.tab = TABS[m][0][0];
  document.getElementById('bq-title').textContent = TITLES[m][0]; document.getElementById('bq-lead').textContent = TITLES[m][1];
  document.getElementById('bq-random').textContent = m === 'potted' ? 'Случайное растение' : m === 'box' ? 'Случайная коробка' : 'Случайный букет';
  renderTabs(); renderPresets(); applyMode();
  if (preset) applyPreset(PRESETS[m][Object.keys(PRESETS[m])[0]]); else { renderPanel(); renderSummary(); }
  try { history.replaceState(null, '', m === 'bouquet' ? location.pathname : '#' + m); } catch (e) {}
}
document.querySelectorAll('[data-bq-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.bqMode, state.mode !== b.dataset.bqMode && (b.dataset.bqMode === 'potted' || !total()))));
document.getElementById('bq-random').onclick = () => {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  if (state.mode === 'potted') { const p = pick(PLANTS); applyPreset({ plant: p.id, size: pick(p.sizes), pot: pick(POTS).id, pack: PACK.filter(() => Math.random() > 0.55).map(a => a.id) }); return; }
  const fl = {}, used = new Set(), types = 2 + Math.floor(Math.random() * 2);
  while (used.size < types) used.add(pick(FLOWERS));
  used.forEach(f => { const vi = Math.floor(Math.random() * f.variants.length); fl[f.id + ':' + vi] = f.id === 'hydrangea' ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 7); });
  const g = pick(GREENS); applyPreset({ flowers: fl, greens: { [g.id]: 2 + Math.floor(Math.random() * 3) }, wrap: pick(WRAPS).id, box: pick(BOXES).id, ribbon: Math.floor(Math.random() * RIBBONS.length) });
};
document.getElementById('bq-reset').onclick = () => { if (state.mode === 'potted') applyPreset({ plant: 'echeveria', size: 9, pot: 'tech', pack: [] }); else applyPreset({ flowers: {}, greens: {}, wrap: 'amma-white', ribbon: 0 }); };
const autoBtn = document.getElementById('bq-auto');
autoBtn.onclick = () => { state.auto = !state.auto; controls.autoRotate = state.auto && !reduce; autoBtn.setAttribute('aria-pressed', String(state.auto)); };
document.getElementById('bq-photo').onclick = () => {
  renderer.render(scene, camera);
  const a = document.createElement('a'); a.download = state.mode === 'potted' ? 'rastenie-amma.png' : 'moy-buket-amma.png'; a.href = canvas.toDataURL('image/png'); a.click();
};
document.getElementById('bq-cart').onclick = () => toast(state.mode === 'potted' ? 'Растение добавлено в корзину — упакуем, как на картинке.' : 'Добавлено в корзину. Флорист соберёт по этой схеме.');
document.getElementById('bq-send').onclick = () => toast(state.mode === 'potted' ? 'Вопрос отправлен — флорист подскажет по уходу и наличию в течение [времени].' : 'Схема отправлена флористу — он проверит состав и напишет вам в течение [времени].');

loadBrand().then(() => {
  const start = (location.hash || '').replace('#', '');
  let cfg = null;
  if (start.startsWith('cfg=')) { try { cfg = JSON.parse(decodeURIComponent(start.slice(4))); } catch (e) { cfg = null; } }
  if (cfg && TABS[cfg.mode]) {
    if (cfg.mode === 'potted') state.giftClosed = !!cfg.giftClosed;
    if (cfg.card) state.card = String(cfg.card).slice(0, 160);
    setMode(cfg.mode, false); applyPreset(Object.assign({ flowers: {}, greens: {}, ribbon: 0, pack: [] }, cfg));
    try { history.replaceState(null, '', cfg.mode === 'bouquet' ? location.pathname : '#' + cfg.mode); } catch (e) {}
  } else setMode(TABS[start] ? start : 'bouquet', true);
  requestAnimationFrame(frame);
});
// для скриншотов: дорисовать всё сразу, без анимации
function renderNow() { const t = performance.now() + 5000; for (let i = 0; i < 80; i++) { animateStems(t); controls.target.lerp(camTarget, 0.2); const d = camera.position.distanceTo(controls.target); camera.position.sub(controls.target).setLength(d + (fitDist - d) * 0.2).add(controls.target); } controls.update(); renderer.render(scene, camera); }
window.__bq = { floatGroup, renderNow, state, live, renderer, setMode, scene, camera, applyPreset, buildPlant, layout, controls, PLANTS };
