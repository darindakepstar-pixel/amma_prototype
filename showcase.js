// АММА · 3D-витрина фирменной упаковки · design & code: Дария Кромберг
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import { RoomEnvironment } from './RoomEnvironment.js';
import { makeHead, greenSprig } from './flowers.js';
import { loadBrand, hatbox, giftBox, boxBag, bag, sleeve, sticker, pickTag, carrier, card, tapeRoll, paperRolls, shippingBox, pot, plantBox } from './packaging.js';
import { makePlant, potR } from './plants.js';

/* ───────── что показываем ───────── */
function roses(group, n, top, rx, rz, color = '#F08CA0') {
  for (let i = 0; i < n; i++) {
    const q = Math.sqrt((i + 0.5) / n), ph = i * 2.39996, x = Math.cos(ph) * q * rx * 0.85, z = Math.sin(ph) * q * rz * 0.85;
    const h = makeHead('rose', i % 4 === 3 ? '#F7F5F0' : color, false, false);
    h.position.set(x, top + 0.06 + (1 - q * q) * Math.max(rx, rz) * 0.3, z);
    h.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x * 0.9 / rx, 1, z * 0.9 / rz).normalize());
    h.scale.setScalar(2.45); group.add(h);
  }
  for (let i = 0; i < 6; i++) { const ph = i / 6 * Math.PI * 2, s = greenSprig('euca'); s.position.set(Math.cos(ph) * rx * 0.92, top - 0.02, Math.sin(ph) * rz * 0.92); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(ph) * 1.4, 1, Math.sin(ph) * 1.4).normalize()); s.scale.setScalar(1.05); group.add(s); }
}
function potted(id, cm, style, label, extra) {
  const g = new THREE.Group(), r = potR(cm), p = pot(style, r, label), pl = makePlant(id, cm); pl.position.y = p.userData.soilY; g.add(p, pl);
  if (extra) extra(g, r, p); return g;
}
const row = (items, gap) => { const g = new THREE.Group(); let x = 0; const widths = items.map(o => new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).x); const tot = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1); items.forEach((o, i) => { o.position.x += -tot / 2 + x + widths[i] / 2; x += widths[i] + gap; g.add(o); }); return g; };

const ITEMS = [
  { group: 'Подарочная линия', id: 'gift', name: 'Подарочная коробка', spec: 'Зелёная, тиснение кремом, золотая рамка, лента со знаком. S 20×20 · M 30×30 · L 40×30 см', make: () => giftBox('forest', 0.9, 0.9, 0.36, { open: false }) },
  { group: 'Подарочная линия', id: 'gift-open', name: 'Коробка открытая, с тишью', spec: 'Кремовая бумага-тишью с узором из знака, крышка прислонена сзади', make: () => giftBox('forest', 0.9, 0.9, 0.36, { open: true }) },
  { group: 'Коробки для цветов', id: 'hat3', name: 'Шляпные коробки', spec: 'Графит, белая, зелёная. Ø 16, 20, 24 см, влагостойкий вкладыш под губку', make: () => row([hatbox('graphite', 0.36, 0.42, { lid: true }), hatbox('white', 0.36, 0.42, { lid: true }), hatbox('forest', 0.36, 0.42, { lid: true })], 0.18) },
  { group: 'Коробки для цветов', id: 'hat-roses', name: 'Шляпная коробка с розами', spec: 'Цветы во влажной губке, стоят без вазы', make: () => { const g = new THREE.Group(), b = hatbox('graphite', 0.42, 0.46); g.add(b); roses(g, 15, b.userData.top, 0.42, 0.42); return g; } },
  { group: 'Коробки для цветов', id: 'boxbag', name: 'Коробка-сумочка', spec: 'Сужается кверху, ручка-шнур, вкладыш с губкой. Для композиций от 4 000 ₽', make: () => { const g = new THREE.Group(), b = boxBag('forest', 0.7, 0.44, 0.62); g.add(b); roses(g, 11, b.userData.top, b.userData.w / 2, b.userData.d / 2, '#F3B4C2'); return g; } },
  { group: 'Букеты', id: 'paper', name: 'Бумага для букетов', spec: 'Белая матовая со знаком, графитовая с серебром и калька', make: () => paperRolls() },
  { group: 'Горшечные растения', id: 'sleeve', name: 'Рукав-конус', spec: 'Белый матовый полипропилен с перфорацией, знак графитом. Под горшки 9–17 см', make: () => potted('agla-red', 12, 'tech', null, (g, r) => g.add(sleeve(r * 0.98, 0.5, 0.75))) },
  { group: 'Горшечные растения', id: 'label', name: 'Стикер на горшок и бирка', spec: 'Графитовый стикер 6×4 см с названием сорта, бирка-втыкалка с уходом, ценой и QR', make: () => potted('zz', 14, 'white', 'Замиокулькас', (g, r, p) => { const t = pickTag('Замиокулькас', 'Полив раз в 2–3 недели, полутень'); t.position.set(r * 0.45, p.userData.soilY - 0.08, r * 0.3); t.rotation.set(-0.1, -0.4, 0.05); g.add(t); }) },
  { group: 'Горшечные растения', id: 'carrier', name: 'Лоток-переноска', spec: 'На 6 горшков 9 см, сбоку знак кремом', make: () => { const g = new THREE.Group(), c = carrier(); g.add(c); const ids = ['echeveria', 'cactus', 'haworthia', 'echeveria-pink', 'cactus', 'echeveria']; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const pp = potted(ids[i * 2 + j], 9, 'tech', null); pp.position.set((i - 1) * 0.3, 0.02, (j - 0.5) * 0.3); g.add(pp); } return g; } },
  { group: 'Горшечные растения', id: 'plantbox', name: 'Коробки для растений S–XL', spec: 'С окном и крышкой: S 20×20×20, M 25×25×35, L 30×30×50, XL 35×35×70 см. Размер подбирается под растение', make: () => { const sz = ['S', 'M', 'L', 'XL'], ids = [['echeveria', 9], ['agla-red', 12], ['monstera', 12], ['ficus', 17]]; return row(sz.map((z, i) => { const g = new THREE.Group(), b = plantBox(z, { closed: i % 2 === 1 }); g.add(b); const pp = potted(ids[i][0], ids[i][1], 'white', null); const bh = new THREE.Box3().setFromObject(pp).getSize(new THREE.Vector3()).y; pp.scale.setScalar(Math.min(1, (b.userData.h - 0.08) / bh)); pp.position.y = 0.04; g.add(pp); return g; }), 0.5); } },
  { group: 'Пакеты', id: 'bags', name: 'Пакеты АММА', spec: 'Белый с чёрными ручками, подарочный зелёный, широкий для горшков', make: () => row([bag('white'), bag('gift'), bag('wide')], 0.25) },
  { group: 'Наклейки и лента', id: 'stickers', name: 'Наклейки и фирменный скотч', spec: 'Основная графитовая, печать на подарок, праздничная с Аммиком, «Напрямую из Юньнани»', make: () => { const g = new THREE.Group(); const s = [sticker('graphite'), sticker('gift'), sticker('ammik'), sticker('oval', 0.12)]; s.forEach((o, i) => { o.position.set((i - 1.5) * 0.48, 0.003, 0.25); o.rotation.y = (i - 1.5) * 0.15; g.add(o); }); const t1 = tapeRoll('graphite'), t2 = tapeRoll('white'); t1.position.set(-0.35, 0, -0.35); t2.position.set(0.35, 0, -0.35); g.add(t1, t2); return g; } },
  { group: 'Печать', id: 'cards', name: 'Открытки, карточка ухода, ценник', spec: 'Открытка базовая и с Аммиком, карточка ухода 10×15 см, ценник на полку', make: () => { const cs = [card('basic'), card('ammik'), card('care', 'Аглаонема'), card('price')]; cs.forEach((c, i) => { c.rotation.set(-0.12, (i - 1.5) * -0.12, 0); }); return row(cs, 0.14); } },
  { group: 'Опт', id: 'ship', name: 'Транспортный короб', spec: '100×40×30 см, печать графитом по гофре, этикетка с QR, плашка температуры', make: () => { const a = shippingBox('+2…+5 °C'), b = shippingBox('+15…+18 °C'); b.position.set(0.15, 0.3, -0.02); b.rotation.y = 0.12; const g = new THREE.Group(); g.add(a, b); return g; } }
];

/* ───────── сцена ───────── */
const stageEl = document.getElementById('sc-stage'), canvas = document.getElementById('sc-canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true }); }
catch (e) { document.getElementById('sc-nogl').hidden = false; throw e; }
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60);
camera.position.set(2.2, 1.6, 3.6);
const controls = new OrbitControls(camera, canvas);
Object.assign(controls, { enableDamping: true, enablePan: false, minDistance: 0.8, maxDistance: 12, maxPolarAngle: 1.5, autoRotate: !reduce, autoRotateSpeed: 0.9 });
let dragging = false, idle;
controls.addEventListener('start', () => { dragging = true; controls.autoRotate = false; clearTimeout(idle); });
controls.addEventListener('end', () => { dragging = false; fit = camera.position.distanceTo(controls.target); idle = setTimeout(() => { controls.autoRotate = !reduce; }, 3500); });
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8e4da, 0.35));
const sun = new THREE.DirectionalLight(0xfff1e2, 2.2); sun.position.set(2.5, 5, 3.5); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015; sun.shadow.radius = 4;
Object.assign(sun.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 }); scene.add(sun);
const rim = new THREE.DirectionalLight(0xe6f0ff, 0.8); rim.position.set(-4, 3, -3); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 64).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.16 })); floor.receiveShadow = true; scene.add(floor);
const holder = new THREE.Group(); scene.add(holder);
let fit = 4, target = new THREE.Vector3(0, 0.4, 0);
function show(id) {
  const it = ITEMS.find(x => x.id === id); holder.clear();
  const obj = it.make(); obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  holder.add(obj);
  const bb = new THREE.Box3().setFromObject(obj), size = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
  obj.position.x -= c.x; obj.position.z -= c.z; obj.position.y -= bb.min.y;
  target.set(0, size.y * 0.45, 0);
  const span = Math.max(size.x, size.y * 1.25, size.z);
  fit = span * 2.25 + 0.8;
  document.getElementById('sc-name').textContent = it.name; document.getElementById('sc-spec').textContent = it.spec;
  canvas.setAttribute('aria-label', '3D-модель: ' + it.name);
  document.querySelectorAll('[data-sc]').forEach(b => { const on = b.dataset.sc === id; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
}
function resize() { const r = stageEl.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(stageEl); resize();
function frame() {
  if (window.__scPause) { requestAnimationFrame(frame); return; }
  controls.target.lerp(target, 0.1);
  if (!dragging) { const d = camera.position.distanceTo(controls.target); if (Math.abs(d - fit) > 0.01) camera.position.sub(controls.target).setLength(d + (fit - d) * 0.1).add(controls.target); }
  controls.update(); renderer.render(scene, camera); requestAnimationFrame(frame);
}

/* ───────── список ───────── */
const list = document.getElementById('sc-list');
let lastGroup = '';
ITEMS.forEach(it => {
  if (it.group !== lastGroup) { lastGroup = it.group; const h = document.createElement('div'); h.className = 'sc-group'; h.textContent = it.group; list.appendChild(h); }
  const b = document.createElement('button'); b.type = 'button'; b.className = 'sc-item'; b.dataset.sc = it.id; b.setAttribute('aria-pressed', 'false');
  b.innerHTML = `<b>${it.name}</b><span>${it.spec}</span>`; b.onclick = () => show(it.id); list.appendChild(b);
});
document.getElementById('sc-auto').onclick = e => { controls.autoRotate = !controls.autoRotate; e.currentTarget.setAttribute('aria-pressed', String(controls.autoRotate)); };
document.getElementById('sc-photo').onclick = () => { renderer.render(scene, camera); const a = document.createElement('a'); a.download = 'upakovka-amma.png'; a.href = canvas.toDataURL('image/png'); a.click(); };
loadBrand().then(() => { show((location.hash || '').replace('#', '') && ITEMS.find(x => '#' + x.id === location.hash) ? location.hash.slice(1) : 'gift'); requestAnimationFrame(frame); });
function renderNow() { for (let i = 0; i < 60; i++) { controls.target.lerp(target, 0.25); const d = camera.position.distanceTo(controls.target); camera.position.sub(controls.target).setLength(d + (fit - d) * 0.25).add(controls.target); } controls.update(); renderer.render(scene, camera); }
window.__sc = { renderNow, show, ITEMS, renderer };
