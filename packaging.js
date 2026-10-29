// АММА · 3D-модели фирменной упаковки · design & code: Дария Кромберг
// Коробки, пакеты, рукав, наклейки, открытки, бирки и транспортный короб.
// Все надписи — текстуры, нарисованные в коде поверх знака АММА (svg).
import * as THREE from 'three';

/* ───────── цвета бренда ───────── */
export const C = {
  graphite: '#1F2124', graphite7: '#3A3E44', stone: '#F7F6F3', white: '#FFFFFF', line: '#E2E0DC',
  forest: '#1F4030', forest6: '#2F6B4F', forest1: '#E4EFE8', mint: '#9FC2AA', gold: '#C9A96E',
  cream: '#F6EFDE', silver: '#B8BCC2', oak: '#A87B52', kraft: '#C9A57A', blush: '#F6E3E3'
};

/* ───────── знак и Аммик ───────── */
const IMG = {};
const FILES = {
  graphite: 'amma-wordmark-graphite.svg', white: 'amma-wordmark-white.svg', cream: 'amma-wordmark-cream.svg',
  silver: 'amma-wordmark-silver.svg', forest: 'amma-wordmark-forest.svg', wave: 'ammik-wave.webp', joy: 'ammik-joy.webp'
};
let brandReady = null;
export function loadBrand(base = '') {
  if (brandReady) return brandReady;
  const imgs = Object.entries(FILES).map(([k, f]) => new Promise(res => {
    const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = () => res(); im.src = base + f;
  }));
  const font = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 40px Manrope'), document.fonts.load('700 20px Manrope'), document.fonts.load('500 40px Caveat')]).catch(() => {}) : Promise.resolve();
  brandReady = Promise.all([...imgs, font]);
  return brandReady;
}
const LOGO_K = 521 / 120;
// знак шириной w с центром в (cx, cy); tone — какой цвет знака
function logo(g, tone, cx, cy, w, alpha = 1) {
  const h = w / LOGO_K;
  g.save(); g.globalAlpha = alpha;
  if (IMG[tone]) g.drawImage(IMG[tone], cx - w / 2, cy - h / 2, w, h);
  else { g.fillStyle = { graphite: C.graphite, white: '#fff', cream: C.cream, silver: C.silver, forest: C.forest }[tone]; g.font = `800 ${h * 0.95}px Manrope, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('АММА', cx, cy); }
  g.restore();
}
// дескриптор между двумя линиями, как в логотипе
function descriptor(g, color, cx, cy, size) {
  g.save(); g.fillStyle = color; g.strokeStyle = color; g.lineWidth = Math.max(1, size * 0.09);
  g.font = `700 ${size}px Manrope, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const txt = 'Ц В Е Т Ы   И   Р А С Т Е Н И Я', tw = g.measureText(txt).width;
  g.fillText(txt, cx, cy);
  g.beginPath(); g.moveTo(cx - tw / 2 - size * 2.6, cy); g.lineTo(cx - tw / 2 - size * 0.8, cy); g.moveTo(cx + tw / 2 + size * 0.8, cy); g.lineTo(cx + tw / 2 + size * 2.6, cy); g.stroke();
  g.restore();
}
function text(g, str, x, y, size, color, weight = 700, align = 'left', spacing = 0) {
  g.save(); g.fillStyle = color; g.font = `${weight} ${size}px Manrope, Arial`; g.textAlign = align; g.textBaseline = 'middle';
  if (spacing && 'letterSpacing' in g) g.letterSpacing = spacing + 'px';
  g.fillText(str, x, y); g.restore();
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function grain(g, W, H, n, a = 0.03, seed = 7) {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < n; k++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${a * (0.5 + r())})`; g.fillRect(r() * W, r() * H, 1.5, 1.5); }
}
function qr(g, x, y, s, fg = C.graphite) {
  g.save(); g.fillStyle = '#fff'; g.fillRect(x, y, s, s);
  const n = 21, c = s / n; let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  g.fillStyle = fg;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r() > 0.52) g.fillRect(x + i * c, y + j * c, c + 0.5, c + 0.5);
  [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([a, b]) => { g.fillStyle = fg; g.fillRect(x + a * c, y + b * c, 7 * c, 7 * c); g.fillStyle = '#fff'; g.fillRect(x + (a + 1) * c, y + (b + 1) * c, 5 * c, 5 * c); g.fillStyle = fg; g.fillRect(x + (a + 2) * c, y + (b + 2) * c, 3 * c, 3 * c); });
  g.restore();
}

/* ───────── текстуры ───────── */
const texCache = new Map();
function tex(key, W, H, draw, repeat) {
  if (texCache.has(key)) return texCache.get(key);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); draw(g, W, H);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  texCache.set(key, t); return t;
}
const mats = new Map();
function mat(key, make) { if (!mats.has(key)) mats.set(key, make()); return mats.get(key); }
const solid = (hex, rough = 0.75, extra = {}) => mat('s' + hex + rough + JSON.stringify(extra), () => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(hex), roughness: rough, envMapIntensity: 0.5 }, extra)));
const mapped = (t, rough = 0.75, extra = {}) => mat('m' + t.uuid + rough + JSON.stringify(extra), () => new THREE.MeshStandardMaterial(Object.assign({ map: t, roughness: rough, envMapIntensity: 0.5 }, extra)));
const HIDE = new THREE.MeshBasicMaterial({ visible: false });

const TONE = { graphite: { bg: C.graphite, logo: 'silver', line: null, inner: C.graphite7 }, white: { bg: C.white, logo: 'graphite', line: null, inner: '#EFEDE8' }, forest: { bg: C.forest, logo: 'cream', line: C.gold, inner: '#183325' } };

// бумага для букетов: белая со знаком, графитовая с серебром, калька
export function wrapPaperTex(kind) {
  return tex('wrap' + kind, 512, 512, (g, W, H) => {
    g.fillStyle = kind === 'graphite' ? '#2B2E33' : kind === 'calque' ? '#ECEAE4' : '#F7F6F2'; g.fillRect(0, 0, W, H);
    grain(g, W, H, 3000, 0.035);
    if (kind !== 'calque') for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) logo(g, kind === 'graphite' ? 'silver' : 'graphite', (x + 0.5 + (y % 2) * 0.5) * W / 3, (y + 0.5) * H / 4, 92, kind === 'graphite' ? 0.33 : 0.16);
  }, true);
}
// бандероль: графитовая полоса со знаком серебром
export function bandTex() {
  return tex('band', 1024, 128, (g, W, H) => {
    g.fillStyle = C.graphite; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 4; k++) logo(g, 'silver', (k + 0.5) * W / 4, H / 2, 150);
  }, true);
}
// лента со знаком (атлас) — для подарочных коробок
export function ribbonTex(tone = 'forest') {
  return tex('ribbon' + tone, 1024, 64, (g, W, H) => {
    g.fillStyle = tone === 'forest' ? C.forest : tone === 'cream' ? C.cream : C.graphite; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 6; k++) logo(g, tone === 'cream' ? 'forest' : 'cream', (k + 0.5) * W / 6, H / 2, 96);
  }, true);
}
export const ribbonMat = (hex) => mat('rib' + hex, () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex), roughness: 0.32, sheen: 0.8, sheenColor: new THREE.Color(hex).lerp(new THREE.Color('#FFFFFF'), 0.5), side: THREE.DoubleSide, envMapIntensity: 0.7 }));

/* ───────── геометрия ───────── */
// открытая сверху коробка: снаружи цвет/текстуры по граням, внутри своя заливка
function openBox(w, h, d, faces, inner, taper = 1) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
  if (taper !== 1) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > h / 2) { p.setX(i, p.getX(i) * taper); p.setZ(i, p.getZ(i) * (1 - (1 - taper) * 0.5)); } geo.computeVertexNormals(); }
  const outer = new THREE.Mesh(geo, [faces.side, faces.side, HIDE, faces.bottom || faces.side, faces.front, faces.back || faces.front]);
  const ig = geo.clone(); ig.scale(0.97, 1, 0.97); ig.translate(0, 0.004, 0);
  const innerM = new THREE.Mesh(ig, [inner, inner, HIDE, inner, inner, inner].map(m => m === HIDE ? m : mat('back' + m.uuid, () => { const c = m.clone(); c.side = THREE.BackSide; return c; })));
  outer.castShadow = outer.receiveShadow = innerM.receiveShadow = true;
  g.add(outer, innerM); return g;
}
// мятая бумага-тишью, выглядывает из коробки
function tissue(w, d, y, color = C.cream, tone = 'forest', seed = 3) {
  const geo = new THREE.PlaneGeometry(w * 1.25, d * 1.25, 36, 36); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), edge = Math.max(Math.abs(x) / (w * 0.62), Math.abs(z) / (d * 0.62));
    p.setY(i, Math.sin(x * 23 + seed) * 0.012 + Math.sin(z * 19 + x * 7) * 0.01 + Math.max(0, edge - 0.78) * 0.5);
  }
  geo.computeVertexNormals(); geo.translate(0, y, 0);
  const t = tex('tissue' + tone + color, 512, 512, (g, W, H) => { g.fillStyle = color; g.fillRect(0, 0, W, H); grain(g, W, H, 2500, 0.03); for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 3; xx++) logo(g, tone, (xx + 0.5) * W / 3, (yy + 0.5) * H / 3, 90, 0.22); }, true);
  const m = new THREE.Mesh(geo, mapped(t, 0.95, { side: THREE.DoubleSide })); m.receiveShadow = true; return m;
}
function handleArc(r, tube, color, y, x0) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 40, Math.PI), solid(color, 0.6));
  m.position.set(x0, y, 0); m.castShadow = true; return m;
}

/* ───────── коробки для цветов ───────── */
function sideTex(tone, W = 2048, H = 340, line = true, descr = true) {
  const T = TONE[tone];
  return tex('side' + tone + W + H + line + descr, W, H, (g) => {
    g.fillStyle = T.bg; g.fillRect(0, 0, W, H); grain(g, W, H, 3000, 0.025);
    [0.25, 0.75].forEach(u => { logo(g, T.logo, u * W, H * (descr ? 0.46 : 0.52), W * 0.13); if (descr) descriptor(g, T.logo === 'graphite' ? C.graphite : T.logo === 'silver' ? C.silver : C.cream, u * W, H * 0.46 + W * 0.04, W * 0.0055); });
    if (T.line && line) { g.fillStyle = T.line; g.fillRect(0, H * 0.12, W, Math.max(2, H * 0.012)); }
  });
}
// шляпная коробка: открытая, с губкой — сверху ставятся цветы
export function hatbox(tone = 'graphite', r = 0.42, h = 0.46, { foam = true, lid = false } = {}) {
  const T = TONE[tone], g = new THREE.Group();
  const side = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 72, 1, true).translate(0, h / 2, 0), mapped(sideTex(tone, 2048, Math.round(2048 * h / (2 * Math.PI * r) / 8) * 8), 0.7));
  side.rotation.y = -Math.PI / 2;
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.985, r * 0.985, h, 72, 1, true).translate(0, h / 2, 0), solid(T.inner, 0.8, { side: THREE.BackSide }));
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(r, 72).rotateX(Math.PI / 2), solid(T.bg, 0.8));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.993, 0.007, 8, 96), solid(T.bg, 0.6)); rim.rotation.x = Math.PI / 2; rim.position.y = h;
  [side, inner, bottom, rim].forEach(m => { m.castShadow = m.receiveShadow = true; });
  g.add(side, inner, bottom, rim);
  if (foam) { const f = new THREE.Mesh(new THREE.CircleGeometry(r * 0.98, 64).rotateX(-Math.PI / 2), solid('#2E5A3A', 0.95)); f.position.y = h - 0.05; g.add(f); }
  if (lid) {
    const lh = 0.11, lt = tex('lidtop' + tone, 512, 512, (gg, W, H) => { gg.fillStyle = T.bg; gg.fillRect(0, 0, W, H); grain(gg, W, H, 1500, 0.025); if (T.line) { gg.strokeStyle = T.line; gg.lineWidth = 3; gg.beginPath(); gg.arc(W / 2, H / 2, W * 0.42, 0, Math.PI * 2); gg.stroke(); } logo(gg, T.logo, W / 2, H / 2, W * 0.46); });
    const lidG = new THREE.Group();
    const ls = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.03, r * 1.03, lh, 72, 1, true), solid(T.bg, 0.7));
    const lt2 = new THREE.Mesh(new THREE.CircleGeometry(r * 1.03, 72).rotateX(-Math.PI / 2), mapped(lt, 0.7)); lt2.position.y = lh / 2;
    lidG.add(ls, lt2); lidG.position.y = h + lh / 2 - 0.04; lidG.traverse(o => { o.castShadow = o.receiveShadow = true; }); g.add(lidG);
  }
  g.userData = { top: h - 0.03, r, shape: 'round' };
  return g;
}
// подарочная коробка: зелёная, крышка с тиснением; open — крышка прислонена сзади
export function giftBox(tone = 'forest', w = 0.8, d = 0.8, h = 0.32, { open = true, tissuePaper = true, ribbon = true, foam = false } = {}) {
  const T = TONE[tone], g = new THREE.Group();
  const sideT = tex('gbside' + tone, 512, 256, (gg, W, H) => { gg.fillStyle = T.bg; gg.fillRect(0, 0, W, H); grain(gg, W, H, 900, 0.025); });
  const box = openBox(w, h, d, { side: mapped(sideT, 0.7), front: mapped(sideT, 0.7) }, solid(T.inner, 0.85));
  g.add(box);
  const lidT = tex('gblid' + tone, 768, 768, (gg, W, H) => {
    gg.fillStyle = T.bg; gg.fillRect(0, 0, W, H); grain(gg, W, H, 2500, 0.025);
    gg.strokeStyle = C.gold; gg.lineWidth = 3; gg.strokeRect(W * 0.06, H * 0.06, W * 0.88, H * 0.88);
    logo(gg, T.logo, W / 2, H * 0.47, W * 0.44); descriptor(gg, T.logo === 'graphite' ? C.graphite : T.logo === 'silver' ? C.silver : C.cream, W / 2, H * 0.6, W * 0.022);
  });
  const lh = 0.07;
  const lidGeo = new THREE.BoxGeometry(w * 1.03, lh, d * 1.03);
  const lid = new THREE.Mesh(lidGeo, [mapped(sideT, 0.7), mapped(sideT, 0.7), mapped(lidT, 0.6), solid(T.inner, 0.85), mapped(sideT, 0.7), mapped(sideT, 0.7)]);
  lid.castShadow = lid.receiveShadow = true;
  if (open) { lid.position.set(0, h * 0.5 + d * 0.5, -d * 0.62); lid.rotation.x = Math.PI / 2 - 0.25; }
  else lid.position.y = h + lh / 2 - 0.02;
  g.add(lid);
  if (open && tissuePaper) g.add(tissue(w, d, h - 0.04, C.cream, T.logo === 'cream' ? 'forest' : 'graphite'));
  if (open && foam) { const f = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.95, d * 0.95).rotateX(-Math.PI / 2), solid('#2E5A3A', 0.95)); f.position.y = h - 0.05; g.add(f); }
  if (ribbon) {
    const rm = mapped(ribbonTex(tone === 'forest' ? 'cream' : 'forest'), 0.35, { side: THREE.DoubleSide });
    const band = (len, rot) => { const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.004, 0.06), rm); m.rotation.y = rot; return m; };
    const top = open ? null : h + lh - 0.015;
    if (!open) { const b1 = band(w * 1.04, 0), b2 = band(d * 1.04, Math.PI / 2); b1.position.y = b2.position.y = top; g.add(b1, b2); }
    // лента по бокам
    const sideBand = new THREE.Mesh(new THREE.BoxGeometry(w * 1.005, 0.06, d * 1.005), [rm, rm, HIDE, HIDE, rm, rm]); sideBand.position.y = h * 0.5; g.add(sideBand);
  }
  g.userData = { top: h - 0.03, w, d, shape: 'rect' };
  return g;
}
// коробка-сумочка: чуть сужается кверху, ручка из шнура
export function boxBag(tone = 'forest', w = 0.66, d = 0.42, h = 0.6, { foam = true } = {}) {
  const T = TONE[tone], g = new THREE.Group();
  const front = tex('bbfront' + tone, 512, 512, (gg, W, H) => { gg.fillStyle = T.bg; gg.fillRect(0, 0, W, H); grain(gg, W, H, 1500, 0.025); logo(gg, T.logo, W / 2, H * 0.5, W * 0.5); descriptor(gg, T.logo === 'graphite' ? C.graphite : T.logo === 'silver' ? C.silver : C.cream, W / 2, H * 0.62, W * 0.024); if (T.line) { gg.fillStyle = T.line; gg.fillRect(0, H * 0.1, W, 3); } });
  const sideT = tex('bbside' + tone, 256, 256, (gg, W, H) => { gg.fillStyle = T.bg; gg.fillRect(0, 0, W, H); grain(gg, W, H, 600, 0.025); });
  g.add(openBox(w, h, d, { side: mapped(sideT, 0.7), front: mapped(front, 0.7) }, solid(T.inner, 0.85), 0.88));
  const cord = tone === 'white' ? C.graphite : tone === 'forest' ? C.cream : C.silver;
  const hd = new THREE.Mesh(new THREE.TorusGeometry(w * 0.3, 0.012, 10, 48, Math.PI), solid(cord, 0.6)); hd.position.y = h - 0.02; hd.castShadow = true; g.add(hd);
  if (foam) { const f = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.84, d * 0.9).rotateX(-Math.PI / 2), solid('#2E5A3A', 0.95)); f.position.y = h - 0.05; g.add(f); }
  g.userData = { top: h - 0.03, w: w * 0.88, d: d * 0.94, shape: 'rect' };
  return g;
}

/* ───────── пакеты ───────── */
export function bag(kind = 'white') {
  const cfg = { white: { w: 0.9, h: 1.1, d: 0.32, bg: C.white, side: '#EFEDE8', logo: 'graphite', handle: C.graphite, descr: true }, gift: { w: 0.72, h: 0.9, d: 0.26, bg: C.forest, side: '#183325', logo: 'cream', handle: C.cream, descr: true, gold: true }, wide: { w: 0.66, h: 0.66, d: 0.4, bg: C.white, side: '#EFEDE8', logo: 'graphite', handle: C.graphite } }[kind];
  const g = new THREE.Group();
  const face = tex('bag' + kind, 512, 640, (gg, W, H) => {
    gg.fillStyle = cfg.bg; gg.fillRect(0, 0, W, H); grain(gg, W, H, 2500, 0.025);
    gg.fillStyle = 'rgba(0,0,0,0.06)'; gg.fillRect(0, 0, W, H * 0.06);
    if (cfg.gold) { gg.fillStyle = C.gold; gg.fillRect(0, H * 0.13, W, 3); }
    logo(gg, cfg.logo, W / 2, H * 0.5, W * 0.5);
    if (cfg.descr) descriptor(gg, cfg.logo === 'graphite' ? C.graphite : C.cream, W / 2, H * 0.6, W * 0.024);
  });
  const sideT = tex('bagside' + kind, 256, 640, (gg, W, H) => { gg.fillStyle = cfg.side; gg.fillRect(0, 0, W, H); grain(gg, W, H, 900, 0.025); gg.strokeStyle = 'rgba(0,0,0,0.08)'; gg.lineWidth = 2; gg.beginPath(); gg.moveTo(W / 2, 0); gg.lineTo(W / 2, H * 0.82); gg.lineTo(0, H); gg.moveTo(W / 2, H * 0.82); gg.lineTo(W, H); gg.stroke(); });
  const body = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d).translate(0, cfg.h / 2, 0), [mapped(sideT, 0.85), mapped(sideT, 0.85), HIDE, solid(cfg.side, 0.85), mapped(face, 0.8), mapped(face, 0.8)]);
  const innerG = new THREE.BoxGeometry(cfg.w * 0.99, cfg.h, cfg.d * 0.98).translate(0, cfg.h / 2 + 0.003, 0);
  const inner = new THREE.Mesh(innerG, [0, 1, 2, 3, 4, 5].map(i => i === 2 ? HIDE : solid(cfg.side, 0.9, { side: THREE.BackSide })));
  body.castShadow = body.receiveShadow = true; g.add(body, inner);
  [-1, 1].forEach(sd => { const hd = handleArc(cfg.w * 0.16, 0.011, cfg.handle, cfg.h - 0.01, 0); hd.position.z = sd * cfg.d * 0.42; g.add(hd); });
  g.userData = { top: cfg.h };
  return g;
}

/* ───────── горшечные: рукав, стикер, бирка, лоток ───────── */
export function sleeve(r0 = 0.17, r1 = 0.52, h = 0.95) {
  const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(r0 + (r1 - r0) * Math.pow(t, 1.15) + Math.sin(t * 40) * 0.003, t * h)); }
  const geo = new THREE.LatheGeometry(pts, 72);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), y = p.getY(i), k = y / h; const n = 1 + 0.035 * k * Math.sin(a * 13) + 0.02 * k * Math.sin(a * 29 + y * 8); p.setX(i, p.getX(i) * n); p.setZ(i, p.getZ(i) * n); }
  geo.computeVertexNormals();
  const t = tex('sleeve', 1024, 512, (g, W, H) => {
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); grain(g, W, H, 1500, 0.02);
    g.fillStyle = 'rgba(0,0,0,0.05)'; for (let x = 0; x < W; x += 24) for (let y = 0; y < H; y += 24) g.fillRect(x + ((y / 24) % 2) * 12, y, 3, 3);
    [0.25, 0.75].forEach(u => { logo(g, 'graphite', u * W, H * 0.42, 210); descriptor(g, C.graphite7, u * W, H * 0.52, 12); });
  });
  const m = new THREE.Mesh(geo, mat('sleeveM', () => new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.55, side: THREE.DoubleSide, transparent: true, opacity: 0.93, envMapIntensity: 0.6 })));
  m.rotation.y = -Math.PI / 2; m.castShadow = true;
  const g = new THREE.Group(); g.add(m); return g;
}
// круглые и овальные наклейки
export function stickerTex(kind) {
  return tex('stk' + kind, 512, 512, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    if (kind === 'oval') { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); text(g, 'НАПРЯМУЮ', W / 2, H * 0.38, 40, C.forest6, 700, 'center'); text(g, 'из Юньнани', W / 2, H * 0.56, 64, C.graphite, 800, 'center'); return; }
    const bg = { graphite: C.graphite, gift: C.forest, ammik: '#FFFFFF', pot: C.graphite }[kind];
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    if (kind === 'graphite') logo(g, 'silver', W / 2, H / 2, W * 0.6);
    if (kind === 'gift') { g.strokeStyle = C.gold; g.lineWidth = 4; g.beginPath(); g.arc(W / 2, H / 2, W * 0.43, 0, Math.PI * 2); g.stroke(); logo(g, 'cream', W / 2, H * 0.46, W * 0.5); descriptor(g, C.cream, W / 2, H * 0.62, 14); }
    if (kind === 'ammik') { if (IMG.joy) g.drawImage(IMG.joy, W * 0.12, H * 0.08, W * 0.76, H * 0.76); text(g, 'С любовью, АММА', W / 2, H * 0.9, 30, C.graphite, 800, 'center'); }
  });
}
export function sticker(kind = 'graphite', r = 0.2) {
  const t = stickerTex(kind), geo = new THREE.CylinderGeometry(r, r, 0.006, 64);
  const m = new THREE.Mesh(geo, [solid(kind === 'gift' ? C.forest : kind === 'graphite' ? C.graphite : '#FFFFFF', 0.6), mapped(t, 0.45), solid('#EDEBE6', 0.8)]);
  if (kind === 'oval') m.scale.set(1.9, 1, 1);
  m.castShadow = true; const g = new THREE.Group(); g.add(m); return g;
}
// стикер на горшок: графитовый, со знаком и названием сорта
export function potLabelTex(name) {
  return tex('potlbl' + name, 512, 320, (g, W, H) => {
    g.fillStyle = C.graphite; rr(g, 0, 0, W, H, 40); g.fill();
    logo(g, 'silver', W / 2, H * 0.4, W * 0.46); text(g, name, W / 2, H * 0.74, 34, '#C9CDD2', 600, 'center');
  });
}
// бирка-втыкалка: карточка на дубовой палочке
export function pickTag(name = 'Растение', care = 'Полив по мере просыхания', price = '[цена] ₽') {
  const g = new THREE.Group();
  const t = tex('pick' + name + care, 384, 512, (gg, W, H) => {
    gg.fillStyle = '#FFFFFF'; rr(gg, 0, 0, W, H, 28); gg.fill(); grain(gg, W, H, 800, 0.02);
    logo(gg, 'graphite', 100, 60, 130);
    text(gg, name, 28, 150, name.length > 12 ? 30 : 38, C.graphite, 800);
    const words = care.split(' '); let line = '', y = 205; words.forEach(wd => { if ((line + wd).length > 22) { text(gg, line, 28, y, 22, C.graphite7, 400); line = ''; y += 30; } line += wd + ' '; }); text(gg, line, 28, y, 22, C.graphite7, 400);
    text(gg, price, 28, H - 70, 36, C.graphite, 800); qr(gg, W - 130, H - 130, 100);
  });
  const card = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.28, 0.004), [solid('#fff'), solid('#fff'), solid('#fff'), solid('#fff'), mapped(t, 0.6), solid('#F4F2EE', 0.7)]);
  card.position.y = 0.42; card.castShadow = true;
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.42, 8).translate(0, 0.21, 0), solid(C.oak, 0.7));
  stick.castShadow = true; g.add(stick, card); return g;
}
export function carrier(n = 6) {
  const shape = new THREE.Shape(); const W = 0.95, D = 0.62;
  shape.moveTo(-W / 2, -D / 2); shape.lineTo(W / 2, -D / 2); shape.lineTo(W / 2, D / 2); shape.lineTo(-W / 2, D / 2); shape.lineTo(-W / 2, -D / 2);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const h = new THREE.Path(); h.absarc((i - 1) * 0.3, (j - 0.5) * 0.3, 0.11, 0, Math.PI * 2, true); shape.holes.push(h); }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, solid(C.forest, 0.8)); m.castShadow = m.receiveShadow = true;
  const lt = tex('carrierside', 512, 96, (g, Wd, H) => { g.fillStyle = C.forest; g.fillRect(0, 0, Wd, H); logo(g, 'cream', Wd / 2, H / 2, 200); });
  const side = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.11), mapped(lt, 0.7)); side.position.set(0, 0.06, D / 2 + 0.002);
  const g = new THREE.Group(); g.add(m, side); return g;
}

/* ───────── открытки, карточка ухода, ценник ───────── */
export function cardTex(kind, plant = 'Аглаонема') {
  return tex('card' + kind + plant, 600, 900, (g, W, H) => {
    if (kind === 'basic') { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); grain(g, W, H, 1500, 0.02); logo(g, 'graphite', 120, 90, 150); g.strokeStyle = C.line; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(60, 380 + i * 90); g.lineTo(W - 60, 380 + i * 90); g.stroke(); } }
    if (kind === 'ammik') { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); if (IMG.wave) g.drawImage(IMG.wave, W * 0.12, 70, W * 0.76, W * 0.86); text(g, 'Это для вас!', W / 2, H * 0.8, 56, C.graphite, 800, 'center'); logo(g, 'graphite', W / 2, H * 0.92, 120); }
    if (kind === 'care') {
      g.fillStyle = C.forest; g.fillRect(0, 0, W, H * 0.42); logo(g, 'cream', 130, 70, 160);
      text(g, 'КАРТОЧКА УХОДА', 50, H * 0.28, 24, C.mint, 700); text(g, plant, 50, H * 0.35, plant.length > 12 ? 44 : 56, C.cream, 800);
      g.fillStyle = '#FFFFFF'; g.fillRect(0, H * 0.42, W, H * 0.58);
      [['СВЕТ', 'рассеянный, без прямого солнца'], ['ПОЛИВ', 'когда подсохнет верхний слой'], ['ТЕМПЕРАТУРА', 'без сквозняков']].forEach(([a, b], i) => { text(g, a, 50, H * 0.49 + i * 95, 22, C.forest6, 700); text(g, b, 50, H * 0.49 + i * 95 + 36, 26, C.graphite, 400); });
      qr(g, W - 190, H - 190, 140); text(g, 'Подробнее — по QR', 50, H - 120, 24, C.graphite7, 400);
    }
    if (kind === 'price') { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); text(g, 'Монобукет', 50, 120, 56, C.graphite, 800); text(g, 'из 25 роз', 50, 190, 56, C.graphite, 800); text(g, 'Розы 60 см · в бумаге', 50, 270, 30, C.graphite7, 400); text(g, '[цена] ₽', 50, H - 120, 80, C.graphite, 800); logo(g, 'graphite', W - 130, H - 120, 160); }
  });
}
export function card(kind = 'basic', plant) {
  const sz = kind === 'price' ? [0.42, 0.63] : [0.4, 0.6];
  const m = new THREE.Mesh(new THREE.BoxGeometry(sz[0], sz[1], 0.006), [solid('#fff'), solid('#fff'), solid('#fff'), solid('#fff'), mapped(cardTex(kind, plant), 0.6), solid('#F4F2EE', 0.7)]);
  m.castShadow = true; m.position.y = sz[1] / 2; const g = new THREE.Group(); g.add(m); return g;
}

/* ───────── лента-скотч, рулоны бумаги ───────── */
export function tapeRoll(kind = 'graphite') {
  const t = tex('tape' + kind, 1024, 128, (g, W, H) => { g.fillStyle = kind === 'graphite' ? C.graphite : '#FFFFFF'; g.fillRect(0, 0, W, H); for (let k = 0; k < 6; k++) logo(g, kind === 'graphite' ? 'silver' : 'graphite', (k + 0.5) * W / 6, H / 2, 120); });
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 64, 1, true), mapped(t, 0.4, { side: THREE.DoubleSide }));
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.28, 64), solid(kind === 'graphite' ? '#2A2D31' : '#F1F0EC', 0.5, { side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08; const ring2 = ring.clone(); ring2.position.y = -0.08;
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.16, 48, 1, true), solid(C.kraft, 0.9, { side: THREE.DoubleSide }));
  g.add(outer, ring, ring2, core); g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.rotation.x = Math.PI / 2; g.position.y = 0.28;
  const w = new THREE.Group(); w.add(g); return w;
}
export function paperRolls() {
  const g = new THREE.Group();
  ['white', 'graphite', 'calque'].forEach((k, i) => {
    const t = wrapPaperTex(k).clone(); t.needsUpdate = true; t.repeat.set(2, 2);
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 40), [mapped(t, 0.9), solid(C.kraft, 0.9), solid(C.kraft, 0.9)]);
    roll.position.set((i - 1) * 0.26, 0.45, i === 1 ? -0.1 : 0); roll.rotation.z = (i - 1) * 0.06; roll.castShadow = true; g.add(roll);
  });
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5, 20, 1), mapped(wrapPaperTex('white'), 0.9, { side: THREE.DoubleSide }));
  const p = sheet.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 8) * 0.02); sheet.geometry.computeVertexNormals();
  sheet.rotation.x = -Math.PI / 2 + 0.05; sheet.position.set(0.05, 0.01, 0.42); sheet.receiveShadow = true; g.add(sheet);
  return g;
}

/* ───────── транспортный короб 100×40×30 ───────── */
export function shippingBox(temp = '+2…+5 °C') {
  const W = 1.0, H = 0.3, D = 0.4, g = new THREE.Group();
  const kraftT = (key, w, h, draw) => tex('ship' + key + temp, w, h, (gg, Ww, Hh) => { gg.fillStyle = C.kraft; gg.fillRect(0, 0, Ww, Hh); grain(gg, Ww, Hh, 4000, 0.04); gg.strokeStyle = 'rgba(80,55,25,0.08)'; gg.lineWidth = 2; for (let x = 0; x < Ww; x += 9) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, Hh); gg.stroke(); } if (draw) draw(gg, Ww, Hh); });
  const front = kraftT('front', 1000, 300, (gg, Ww, Hh) => {
    logo(gg, 'graphite', 150, 70, 210); text(gg, 'ЖИВЫЕ РАСТЕНИЯ', 40, 160, 46, C.graphite, 800); text(gg, 'Не бросать · Хранить в прохладе', 40, 210, 22, C.graphite, 700);
    gg.strokeStyle = C.graphite; gg.lineWidth = 4; rr(gg, 40, 238, 170, 46, 8); gg.stroke(); text(gg, temp, 125, 261, 24, C.graphite, 800, 'center');
    gg.fillStyle = '#FFFFFF'; gg.fillRect(Ww - 330, 30, 290, 240);
    [['Клиент', '[клиент]'], ['Заказ', '[№]'], ['Короб', '[12] из [48]']].forEach(([a, b], i) => { text(gg, a, Ww - 315, 62 + i * 38, 18, C.graphite7, 400); text(gg, b, Ww - 60, 62 + i * 38, 18, C.graphite, 800, 'right'); });
    qr(gg, Ww - 315, 170, 90); text(gg, 'Состав по QR', Ww - 210, 215, 16, C.graphite7, 400);
  });
  const side = kraftT('side', 400, 300, (gg, Ww, Hh) => { logo(gg, 'graphite', Ww / 2, Hh * 0.45, 200); text(gg, temp, Ww / 2, Hh * 0.75, 30, C.graphite, 800, 'center'); });
  const top = kraftT('top', 1000, 400, (gg, Ww, Hh) => { gg.fillStyle = 'rgba(0,0,0,0.12)'; gg.fillRect(0, Hh / 2 - 1, Ww, 2); gg.fillStyle = C.graphite; gg.fillRect(0, Hh / 2 - 48, Ww, 96); for (let k = 0; k < 6; k++) logo(gg, 'silver', (k + 0.5) * Ww / 6, Hh / 2, 110); });
  const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D).translate(0, H / 2, 0), [mapped(side), mapped(side), mapped(top), solid(C.kraft, 0.9), mapped(front), mapped(front)]);
  box.castShadow = box.receiveShadow = true; g.add(box); return g;
}

/* ───────── кашпо ───────── */
// pot: технический горшок, белое, графитовое или зелёное кашпо. r — радиус по верху (в единицах сцены)
export function pot(style = 'white', r = 0.2, label = null) {
  const h = r * 1.05, g = new THREE.Group();
  const prof = style === 'tech' ? [[r * 0.72, 0], [r * 0.95, h * 0.94], [r, h * 0.95], [r, h]] : [[r * 0.7, 0], [r * 0.86, h * 0.08], [r * 0.98, h * 0.75], [r, h]];
  const pts = prof.map(p => new THREE.Vector2(p[0], p[1]));
  const color = { tech: '#2A2C30', white: '#F4F3EF', graphite: '#2E3136', forest: C.forest }[style];
  const m = style === 'tech' ? solid(color, 0.55) : mat('cer' + style, () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color), roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.7 }));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mat('pot2' + style, () => { const c = m.clone(); c.side = THREE.DoubleSide; return c; }));
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(prof[0][0], 48).rotateX(Math.PI / 2), m);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(r * 0.97, 48).rotateX(-Math.PI / 2), mat('soil', () => new THREE.MeshStandardMaterial({ color: '#3B2E25', roughness: 1 })));
  soil.position.y = h * 0.9;
  body.castShadow = body.receiveShadow = bottom.receiveShadow = true;
  g.add(body, bottom, soil);
  if (label) {
    const lt = potLabelTex(label), lw = Math.min(r * 1.1, 0.24), lh = lw * 0.625;
    const rAt = y => { for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) { const a = prof[i - 1], b = prof[i], t = (y - a[1]) / (b[1] - a[1] || 1); return a[0] + (b[0] - a[0]) * t; } return r; };
    const yc = h * 0.5, rTop = rAt(yc + lh / 2) * 1.012 + 0.002, rBot = rAt(yc - lh / 2) * 1.012 + 0.002;
    const ang = lw / ((rTop + rBot) / 2);
    const lg = new THREE.CylinderGeometry(rTop, rBot, lh, 24, 1, true, -ang / 2, ang).translate(0, yc, 0);
    const lm = new THREE.Mesh(lg, mapped(lt, 0.5, { transparent: true }));
    g.add(lm);
  }
  g.userData = { h, r, soilY: h * 0.9 };
  return g;
}

/* ───────── открытка с текстом покупателя («подпишем от руки») ───────── */
export function messageCard(message) {
  const W = 640, H = 440, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); grain(g, W, H, 1600, 0.02);
  g.strokeStyle = '#E2E0DC'; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
  logo(g, 'graphite', W - 90, H - 40, 110);
  g.fillStyle = C.graphite; g.textAlign = 'center'; g.textBaseline = 'middle';
  let size = 64; const words = String(message).trim().split(/\s+/); let lines = [];
  for (; size >= 30; size -= 4) {
    g.font = `500 ${size}px Caveat, "Segoe Script", "Comic Sans MS", cursive`;
    lines = []; let line = '';
    words.forEach(wd => { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > W - 90 && line) { lines.push(line); line = wd; } else line = t; });
    if (line) lines.push(line);
    if (lines.length * size * 1.15 <= H - 120) break;
  }
  lines = lines.slice(0, 7);
  const y0 = (H - 50) / 2 - (lines.length - 1) * size * 0.575;
  lines.forEach((ln, i) => g.fillText(ln, W / 2, y0 + i * size * 1.15));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const face = new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 }), edge = solid('#FFFFFF', 0.7);
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.004), [edge, edge, edge, edge, face, solid('#F4F2EE', 0.75)]);
  m.castShadow = true; m.userData.dispose = () => { t.dispose(); face.dispose(); m.geometry.dispose(); };
  return m;
}
// бант спереди коробки: петли и хвосты в плоскости XY, смотрит на +Z
export function frontBow(hex, s = 1) {
  const g = new THREE.Group(), m = ribbonMat(hex);
  const knot = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.014, 10, 24), m); knot.scale.set(1, 1.2, 0.8); g.add(knot);
  [-1, 1].forEach(sd => {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 36), m);
    loop.scale.set(1.5, 0.75, 0.5); loop.position.set(sd * 0.072, 0.008, -0.004); loop.rotation.z = sd * -0.25; g.add(loop);
    const tg = new THREE.PlaneGeometry(0.035, 0.16, 1, 10), tp = tg.attributes.position;
    for (let i = 0; i < tp.count; i++) { const y = tp.getY(i); tp.setZ(i, Math.sin(y * 18 + sd) * 0.006); }
    tg.computeVertexNormals(); const tail = new THREE.Mesh(tg, m); tail.position.set(sd * 0.03, -0.085, 0.004); tail.rotation.z = sd * 0.3; g.add(tail);
  });
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.scale.setScalar(s); return g;
}

/* ───────── коробка для горшечного растения: высокая, с окном, крышка закрывается ───────── */
export const PLANT_BOXES = [
  { id: 'S', cm: [20, 20, 20], note: 'суккуленты, кактусы' },
  { id: 'M', cm: [25, 25, 35], note: 'растения до 30 см' },
  { id: 'L', cm: [30, 30, 50], note: 'растения до 45 см' },
  { id: 'XL', cm: [35, 35, 70], note: 'крупные растения' }
];
// подобрать размер: внутрь должны войти горшок и растение по высоте, листья могут чуть сложиться
export function pickPlantBox(potDia, totalH, plantW) {
  return PLANT_BOXES.find(b => b.cm[0] / 30 >= potDia * 1.15 && b.cm[0] / 30 >= plantW * 0.7 && b.cm[2] / 30 >= totalH * 1.03) || PLANT_BOXES[PLANT_BOXES.length - 1];
}
export function plantBox(sizeId = 'M', { closed = false, ribbon = '#C9A96E' } = {}) {
  const B = PLANT_BOXES.find(b => b.id === sizeId) || PLANT_BOXES[1], w = B.cm[0] / 30, h = B.cm[2] / 30, g = new THREE.Group();
  const bgT = tex('pbside', 256, 256, (gg, W, H) => { gg.fillStyle = C.forest; gg.fillRect(0, 0, W, H); grain(gg, W, H, 700, 0.025); });
  const side = mapped(bgT, 0.7, { side: THREE.DoubleSide });
  const ratio = h / w;
  const frontT = tex('pbfront' + sizeId, 512, Math.round(512 * ratio), (gg, W, H) => {
    gg.fillStyle = C.forest; gg.fillRect(0, 0, W, H); grain(gg, W, H, 1500, 0.025);
    const wx = W * 0.14, wy = H * 0.1, ww = W * 0.72, wh = H - wy - Math.max(W * 0.3, H * 0.22);
    gg.strokeStyle = C.gold; gg.lineWidth = 3; rr(gg, wx - 8, wy - 8, ww + 16, wh + 16, 26); gg.stroke();
    gg.globalCompositeOperation = 'destination-out'; rr(gg, wx, wy, ww, wh, 20); gg.fill(); gg.globalCompositeOperation = 'source-over';
    const by = wy + wh + (H - wy - wh) * 0.42;
    logo(gg, 'cream', W / 2, by, W * 0.42); descriptor(gg, C.cream, W / 2, by + W * 0.085, W * 0.021);
  });
  const front = mat('pbfrontM' + sizeId, () => new THREE.MeshStandardMaterial({ map: frontT, roughness: 0.7, side: THREE.DoubleSide }));
  // передняя стенка — настоящая геометрия с вырезом под окно (а не прозрачность текстуры)
  const PX = 512, PH = Math.round(512 * ratio), wwx = PX * 0.14, wwy = PH * 0.1, www = PX * 0.72, wwh = PH - wwy - Math.max(PX * 0.3, PH * 0.22);
  const toX = px => (px / PX - 0.5) * w, toY = py => (0.5 - py / PH) * h, cr = (20 / PX) * w;
  const x0 = toX(wwx), x1 = toX(wwx + www), y1 = toY(wwy), y0 = toY(wwy + wwh);
  const shp = new THREE.Shape(); shp.moveTo(-w / 2, -h / 2); shp.lineTo(w / 2, -h / 2); shp.lineTo(w / 2, h / 2); shp.lineTo(-w / 2, h / 2); shp.closePath();
  const hole = new THREE.Path(); hole.moveTo(x0 + cr, y0); hole.lineTo(x1 - cr, y0); hole.quadraticCurveTo(x1, y0, x1, y0 + cr); hole.lineTo(x1, y1 - cr); hole.quadraticCurveTo(x1, y1, x1 - cr, y1); hole.lineTo(x0 + cr, y1); hole.quadraticCurveTo(x0, y1, x0, y1 - cr); hole.lineTo(x0, y0 + cr); hole.quadraticCurveTo(x0, y0, x0 + cr, y0); shp.holes.push(hole);
  const frontG = new THREE.ShapeGeometry(shp, 8), fuv = frontG.attributes.uv, fpos = frontG.attributes.position;
  for (let i = 0; i < fuv.count; i++) fuv.setXY(i, fpos.getX(i) / w + 0.5, fpos.getY(i) / h + 0.5);
  const winH = y1 - y0, winW = x1 - x0, winY = (y0 + y1) / 2 + h / 2;
  const wall = (mt, ww, x, z, ry, geo) => { const m = new THREE.Mesh(geo || new THREE.PlaneGeometry(ww, h), mt); m.position.set(x, h / 2, z); m.rotation.y = ry; m.castShadow = false; m.receiveShadow = false; m.userData.noShadow = true; g.add(m); };
  wall(front, w, 0, w / 2, 0, frontG); wall(side, w, 0, -w / 2, Math.PI); wall(side, w, w / 2, 0, Math.PI / 2); wall(side, w, -w / 2, 0, -Math.PI / 2);
  const bottom = new THREE.Mesh(new THREE.PlaneGeometry(w, w).rotateX(-Math.PI / 2), solid('#183325', 0.85)); bottom.position.y = 0.002; g.add(bottom);
  // плёнка в окне
  const film = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), mat('pbfilm', () => new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: 0.05, transparent: true, opacity: 0.08, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })));
  film.position.set(0, winY, w / 2 - 0.004); g.add(film);
  // мятая бумага-наполнитель на дне
  const fg = new THREE.PlaneGeometry(w * 0.98, w * 0.98, 30, 30).rotateX(-Math.PI / 2), fp = fg.attributes.position;
  for (let i = 0; i < fp.count; i++) { const x = fp.getX(i), z = fp.getZ(i); fp.setY(i, 0.03 + Math.abs(Math.sin(x * 37) * Math.sin(z * 29)) * 0.035); }
  fg.computeVertexNormals();
  const fillT = tex('filler', 256, 256, (gg, W, H) => { gg.fillStyle = C.cream; gg.fillRect(0, 0, W, H); grain(gg, W, H, 2500, 0.06); });
  g.add(new THREE.Mesh(fg, mapped(fillT, 0.95, { side: THREE.DoubleSide })));
  // крышка с тиснением и лентой
  const lw = w * 1.03, lh = 0.07;
  const lidT = tex('pblid', 512, 512, (gg, W, H) => { gg.fillStyle = C.forest; gg.fillRect(0, 0, W, H); grain(gg, W, H, 1500, 0.025); gg.strokeStyle = C.gold; gg.lineWidth = 3; gg.strokeRect(W * 0.07, H * 0.07, W * 0.86, H * 0.86); logo(gg, 'cream', W / 2, H * 0.47, W * 0.46); descriptor(gg, C.cream, W / 2, H * 0.6, W * 0.022); });
  const lidG = new THREE.Group();
  const lid = new THREE.Mesh(new THREE.BoxGeometry(lw, lh, lw), [side, side, mapped(lidT, 0.6), solid('#183325', 0.85), side, side]); lid.userData.noShadow = true; lidG.add(lid);
  const rm = ribbonMat(ribbon);
  const band = new THREE.Mesh(new THREE.BoxGeometry(lw * 1.004, lh * 0.55, lw * 1.004), [rm, rm, HIDE, HIDE, rm, rm]); lidG.add(band);
  const bow = frontBow(ribbon, 0.9 + w * 0.5); bow.position.set(0, 0, lw / 2 + 0.01); lidG.add(bow);
  if (closed) lidG.position.y = h + lh / 2 - 0.02;
  else { const tilt = 0.2; lidG.rotation.z = -(Math.PI / 2 - tilt); lidG.position.set(w / 2 + lh / 2 + (lw / 2) * Math.sin(tilt) + 0.03, (lw / 2) * Math.cos(tilt) + 0.01, -w * 0.05); lidG.rotation.y = -0.25; }
  lidG.traverse(o => { o.userData.noShadow = true; });
  // мягкий свет внутри, чтобы растение было видно через окно
  const glow = new THREE.PointLight(0xfff4e6, 0.9, h * 2.2, 1.5); glow.position.set(0, h * 0.75, w * 0.2); g.add(glow);
  g.add(lidG);
  g.userData = { w, h, size: B };
  return g;
}
