// АММА · горшечные растения для 3D-конструктора · design & code: Дария Кромберг
// От милых суккулентов до аглаонем: каждое растение собирается из листьев-сеток
// с нарисованными в коде текстурами (пестрота, полосы, прожилки, прорези монстеры).
import * as THREE from 'three';
import { petal, Acc, leafMat, plainMat, petalMat, col, M, ringM, alongM, PRIM, stemPiece, GOLD, canvasTex, rng } from './flowers.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
// лист вдоль d, «низ» листа смотрит к земле — тогда bend изгибает его наружу и вниз дугой
function leafM(p, d, s = 1, roll = 0) {
  const Y = d.clone().normalize(), Z = V(0, -1, 0).addScaledVector(Y, Y.y);
  if (Z.lengthSq() < 1e-5) Z.set(1, 0, 0); Z.normalize();
  if (roll) Z.applyAxisAngle(Y, roll);
  const X = new THREE.Vector3().crossVectors(Y, Z).normalize();
  return new THREE.Matrix4().makeBasis(X, Y, Z).scale(V(s, s, s)).setPosition(p);
}
const mats = new Map();
const leafTexMat = (key, draw, o = {}) => {
  if (!mats.has(key)) {
    const t = canvasTex('pl' + key, draw, 256);
    mats.set(key, new THREE.MeshPhysicalMaterial(Object.assign({ map: t, side: THREE.DoubleSide, roughness: 0.45, envMapIntensity: 0.6, sheen: 0.15 }, o)));
  }
  return mats.get(key);
};
// холст листа: низ — основание, верх — кончик
function veins(g, S, color, n = 8, w = 1.4) {
  g.strokeStyle = color; g.lineWidth = 3; g.beginPath(); g.moveTo(S / 2, S); g.lineTo(S / 2, 0); g.stroke();
  g.lineWidth = w;
  for (let k = 0; k < n; k++) { const y = S * (0.95 - k * (0.9 / n)); [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(S / 2, y); g.quadraticCurveTo(S / 2 + sd * S * 0.2, y - S * 0.05, S / 2 + sd * S * 0.5, y - S * 0.14); g.stroke(); }); }
}
function speckle(g, S, color, n, size, seed = 5, mask) {
  const r = rng(seed); g.fillStyle = color;
  for (let k = 0; k < n; k++) { const x = r() * S, y = r() * S; if (mask && !mask(x / S, y / S)) continue; g.beginPath(); g.ellipse(x, y, size * (0.5 + r()), size * (0.3 + r() * 0.6), r() * 3, 0, Math.PI * 2); g.fill(); }
}

/* ───────── текстуры листьев ───────── */
const TX = {
  aglaRed: () => leafTexMat('aglaRed', (g, S) => {
    g.fillStyle = '#2E5A34'; g.fillRect(0, 0, S, S);
    const gr = g.createRadialGradient(S / 2, S * 0.55, 6, S / 2, S * 0.55, S * 0.42); gr.addColorStop(0, '#E2607A'); gr.addColorStop(0.65, '#D45A70'); gr.addColorStop(1, 'rgba(212,90,112,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    speckle(g, S, '#E87E92', 90, 6, 3, (u) => Math.abs(u - 0.5) < 0.42);
    veins(g, S, 'rgba(255,190,200,0.75)', 7, 2);
  }, { roughness: 0.38, clearcoat: 0.4 }),
  aglaSilver: () => leafTexMat('aglaSilver', (g, S) => {
    g.fillStyle = '#2C5232'; g.fillRect(0, 0, S, S);
    const gr = g.createLinearGradient(0, 0, S, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.22, '#BFD1BC'); gr.addColorStop(0.5, '#D7E3D2'); gr.addColorStop(0.78, '#BFD1BC'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(S * 0.08, S * 0.05, S * 0.84, S * 0.9);
    speckle(g, S, '#3E6A44', 70, 5, 9, (u) => Math.abs(u - 0.5) < 0.35);
    veins(g, S, 'rgba(40,80,48,0.7)', 7, 2);
  }, { roughness: 0.4, clearcoat: 0.35 }),
  sansev: () => leafTexMat('sansev', (g, S) => {
    g.fillStyle = '#2D4D2E'; g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 9) { g.strokeStyle = y % 18 ? 'rgba(160,190,140,0.45)' : 'rgba(20,40,22,0.6)'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= S; x += 8) g.lineTo(x, y + Math.sin(x * 0.12 + y) * 4); g.stroke(); }
    g.fillStyle = '#D9C85A'; g.fillRect(0, 0, S * 0.07, S); g.fillRect(S * 0.93, 0, S * 0.07, S);
  }, { roughness: 0.42, clearcoat: 0.3 }),
  monstera: (vari) => leafTexMat('monstera' + vari, (g, S) => {
    g.clearRect(0, 0, S, S);
    g.fillStyle = '#2B5A30'; g.fillRect(0, 0, S, S);
    if (vari) { const r = rng(4); for (let k = 0; k < 7; k++) { g.fillStyle = '#F2F1E6'; g.beginPath(); g.ellipse(r() * S, r() * S, 20 + r() * 50, 10 + r() * 30, r() * 3, 0, Math.PI * 2); g.fill(); } }
    veins(g, S, 'rgba(150,190,120,0.45)', 7, 1.6);
    // прорези от края к центральной жилке и дырочки
    g.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 7; k++) { const y = S * (0.88 - k * 0.12); [-1, 1].forEach(sd => { g.lineWidth = 13; g.lineCap = 'round'; g.beginPath(); g.moveTo(S / 2 + sd * S * 0.16, y); g.quadraticCurveTo(S / 2 + sd * S * 0.34, y - S * 0.04, S / 2 + sd * S * 0.62, y - S * 0.1); g.stroke(); if (k % 2) { g.beginPath(); g.ellipse(S / 2 + sd * S * 0.1, y - S * 0.05, 5, 9, 0.3 * sd, 0, Math.PI * 2); g.fill(); } }); }
    g.globalCompositeOperation = 'source-over';
  }, { roughness: 0.35, clearcoat: 0.45, alphaTest: 0.5 }),
  calathea: () => leafTexMat('calathea', (g, S) => {
    g.fillStyle = '#8FB06F'; g.fillRect(0, 0, S, S);
    g.fillStyle = '#2F5230';
    for (let k = 0; k < 9; k++) { const y = S * (0.92 - k * 0.1); [-1, 1].forEach(sd => { g.beginPath(); g.ellipse(S / 2 + sd * S * 0.18, y - S * 0.03, S * 0.16, S * 0.035, sd * -0.5, 0, Math.PI * 2); g.fill(); }); }
    g.strokeStyle = '#2F5230'; g.lineWidth = 10; g.strokeRect(0, 0, S, S);
    veins(g, S, 'rgba(230,240,210,0.5)', 9, 1);
  }, { roughness: 0.5, sheen: 0.3 }),
  pothos: () => leafTexMat('pothos', (g, S) => {
    g.fillStyle = '#3F7A3A'; g.fillRect(0, 0, S, S);
    const r = rng(12); g.strokeStyle = '#E3D46A'; g.lineCap = 'round';
    for (let k = 0; k < 16; k++) { g.lineWidth = 2 + r() * 5; g.beginPath(); const x = S / 2 + (r() - 0.5) * S * 0.6, y = r() * S; g.moveTo(S / 2, y + 20); g.quadraticCurveTo(x, y, x + (r() - 0.5) * 40, y - 30); g.stroke(); }
    veins(g, S, 'rgba(230,230,150,0.5)', 6, 1.4);
  }, { roughness: 0.32, clearcoat: 0.45 }),
  haworthia: () => leafTexMat('haworthia', (g, S) => {
    g.fillStyle = '#2F4F32'; g.fillRect(0, 0, S, S);
    const r = rng(8); g.fillStyle = '#EDEFE6';
    for (let y = 6; y < S; y += 14) { g.beginPath(); g.ellipse(S / 2, y, S * (0.3 + r() * 0.15), 3, 0, 0, Math.PI * 2); g.fill(); }
  }, { roughness: 0.5 }),
  crystal: () => leafTexMat('crystal', (g, S) => {
    g.fillStyle = '#1F3A26'; g.fillRect(0, 0, S, S);
    g.strokeStyle = '#E3EDE0'; g.lineWidth = 4; g.beginPath(); g.moveTo(S / 2, S); g.lineTo(S / 2, 0); g.stroke();
    g.lineWidth = 2.4;
    for (let k = 0; k < 6; k++) { const y = S * (0.95 - k * 0.15); [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(S / 2, y); g.bezierCurveTo(S / 2 + sd * S * 0.3, y - S * 0.05, S / 2 + sd * S * 0.42, y - S * 0.25, S / 2 + sd * S * 0.3, y - S * 0.5); g.stroke(); }); }
  }, { roughness: 0.75, sheen: 0.6, sheenColor: new THREE.Color('#9FC2AA') }),
  ficusVar: () => leafTexMat('ficusVar', (g, S) => {
    g.fillStyle = '#E8E4C8'; g.fillRect(0, 0, S, S);
    g.fillStyle = '#2F5A32'; g.beginPath(); g.ellipse(S / 2, S / 2, S * 0.33, S * 0.47, 0, 0, Math.PI * 2); g.fill();
    speckle(g, S, '#6E9A5C', 60, 9, 4, (u) => Math.abs(u - 0.5) < 0.38);
    g.strokeStyle = '#D9B4A0'; g.lineWidth = 3; g.beginPath(); g.moveTo(S / 2, S); g.lineTo(S / 2, 0); g.stroke();
  }, { roughness: 0.25, clearcoat: 0.7 })
};
const glossy = (tint) => ({ m: leafMat(0.22), t: col(tint) });

/* ───────── растения ───────── */
// эхеверия: розетка из пухлых сизых листьев с розовыми кончиками
function echeveria(acc, s, R, tint = '#9FC1B4', tip = '#E3A4B0') {
  const pm = petalMat('echev', tint, { tip, root: '#CFE0D2', veins: 0.05 }, { roughness: 0.55, sheen: 0.5 });
  const N = 30;
  for (let i = 0; i < N; i++) {
    const k = i / N, len = (0.05 + 0.085 * k) * s, a = i * GOLD;
    acc.add(pm, petal({ len, wid: len * 0.62, shape: 'obovate', cup: 0.85, bend0: 0.12 + 1.15 * k, bend: 0.25, reflex: -0.1, su: 6, sv: 8, roundTip: 0.5 }), ringM(a, 0.01 + (1 - k) * 0.035 * s, 0.004 * s), col('#FFFFFF', 0.95 + R() * 0.08));
  }
}
function haworthia(acc, s, R) {
  const m = TX.haworthia();
  for (let i = 0; i < 20; i++) {
    const k = i / 20, len = (0.06 + 0.08 * k) * s;
    acc.add(m, petal({ len, wid: len * 0.3, shape: 'lance', cup: 0.75, bend0: 0.12 + 0.75 * k, bend: 0.15, su: 5, sv: 8 }), ringM(i * GOLD, 0.005, 0.004 * s));
  }
}
// кактус-шар: рёбра и пучки колючек
function cactus(acc, s, R) {
  const rr = 0.13 * s, geo = new THREE.SphereGeometry(rr, 64, 40), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.08 * Math.pow(Math.max(0, Math.cos(a * 14)), 2) * (1 - Math.abs(y / rr) * 0.6); p.setXYZ(i, x * k, y * 0.88 + rr * 0.8, z * k); }
  geo.computeVertexNormals();
  acc.add(plainMat(0.55), geo, null, col('#4E7C45'));
  const spine = PRIM.cone, sm = plainMat(0.5);
  for (let rb = 0; rb < 14; rb++) {
    const a = rb / 14 * Math.PI * 2;
    for (let l = 0; l < 7; l++) {
      const lat = -0.55 + l * 0.27; if (lat > 1.3) continue;
      const cl = Math.cos(lat), base = V(Math.cos(a) * cl * rr * 1.08, Math.sin(lat) * rr * 0.88 + rr * 0.8, Math.sin(a) * cl * rr * 1.08);
      const n = base.clone().sub(V(0, rr * 0.8, 0)).normalize();
      for (let q = 0; q < 3; q++) { const d = n.clone().add(V((R() - 0.5) * 0.9, (R() - 0.3) * 0.6, (R() - 0.5) * 0.9)).normalize(); acc.add(sm, spine, alongM(base, d, 1).multiply(new THREE.Matrix4().makeScale(0.0035 * s, 0.035 * s, 0.0035 * s)), col('#EBD892')); }
    }
  }
  // макушка с пухом
  acc.add(plainMat(0.9), PRIM.ball, M(0, rr * 1.68, 0).multiply(new THREE.Matrix4().makeScale(rr * 0.25, rr * 0.08, rr * 0.25)), col('#E9DFB8'));
}
// аглаонема: черешки из центра, крупные пёстрые листья
function aglaonema(acc, s, R, variant = 'red') {
  const m = variant === 'silver' ? TX.aglaSilver() : TX.aglaRed();
  const N = 11;
  for (let i = 0; i < N; i++) {
    const a = i * GOLD, k = i / N, tilt = 0.3 + 0.75 * k;
    const dir = V(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt));
    const len = (0.1 + 0.1 * (1 - k)) * s, end = dir.clone().multiplyScalar(len);
    stemPiece(acc, V(0, 0, 0), end, 0.006 * s, variant === 'silver' ? '#7FA27A' : '#D88A96');
    acc.add(m, petal({ len: 0.27 * s, wid: 0.115 * s, shape: 'ovate', cup: 0.28, fold: 0.18, bend0: -0.15, bend: 0.75 + k * 0.4, reflex: 0.15, su: 8, sv: 14 }), leafM(end, dir.clone().add(V(0, 0.15, 0)), 1, (R() - 0.5) * 0.4));
  }
}
// замиокулькас: прямые черенки с парными глянцевыми листочками
function zamioculcas(acc, s, R, dark = false) {
  const lm = leafMat(0.2), tint = col(dark ? '#1C2A1E' : '#2E5E2E');
  for (let i = 0; i < 7; i++) {
    const a = i * GOLD, tilt = 0.08 + 0.32 * (i / 7), len = (0.45 + R() * 0.15) * s;
    const dir = V(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)), end = dir.clone().multiplyScalar(len);
    stemPiece(acc, V(0, 0, 0), end, 0.012 * s, dark ? '#24331F' : '#4E7A40');
    const side = new THREE.Vector3().crossVectors(dir, V(0, 1, 0.001)).normalize();
    for (let k = 0; k < 7; k++) {
      const t = 0.32 + k * 0.1, p = dir.clone().multiplyScalar(len * t);
      [-1, 1].forEach(sd => acc.add(lm, petal({ len: 0.085 * s, wid: 0.036 * s, shape: 'ovate', cup: 0.3, fold: 0.15, bend0: 0, bend: 0.2, su: 6, sv: 8 }), alongM(p, dir.clone().multiplyScalar(0.55).addScaledVector(side, sd), 1, sd > 0 ? 0 : Math.PI), tint.clone().multiplyScalar(0.92 + R() * 0.15)));
    }
    acc.add(lm, petal({ len: 0.08 * s, wid: 0.034 * s, shape: 'ovate', cup: 0.3, bend0: 0, bend: 0.2, su: 6, sv: 8 }), alongM(end, dir), tint);
  }
}
function sansevieria(acc, s, R) {
  const m = TX.sansev();
  for (let i = 0; i < 8; i++) {
    const a = i * GOLD + R() * 0.3, h = (0.5 + R() * 0.25) * s * (i < 2 ? 0.75 : 1);
    acc.add(m, petal({ len: h, wid: 0.075 * s, shape: 'lance', cup: 0.55, fold: 0.1, bend0: 0.04 + 0.18 * (i / 8), bend: 0.1, twist: 0.6 * (R() - 0.5), su: 6, sv: 14 }), ringM(a, 0, 0.015 * s));
  }
}
function monstera(acc, s, R, vari = false) {
  const m = TX.monstera(vari);
  for (let i = 0; i < 6; i++) {
    const a = i * GOLD + 0.4, tilt = 0.25 + 0.4 * (i / 6), len = (0.32 + R() * 0.12) * s;
    const dir = V(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)), mid = dir.clone().multiplyScalar(len * 0.6).add(V(0, len * 0.15, 0)), end = dir.clone().multiplyScalar(len).add(V(0, len * 0.1, 0));
    stemPiece(acc, V(0, 0, 0), mid, 0.009 * s, '#4E7F44'); stemPiece(acc, mid, end, 0.008 * s, '#4E7F44');
    acc.add(m, petal({ len: 0.3 * s, wid: 0.27 * s, shape: 'broad', cup: 0.15, bend0: 0, bend: 0.6, reflex: 0.15, su: 12, sv: 14 }), alongM(end, dir.clone().setY(0.15).normalize(), 1, Math.PI));
  }
}
function spathiphyllum(acc, s, R) {
  const lm = leafMat(0.25), tint = col('#2A5A2C');
  for (let i = 0; i < 13; i++) {
    const a = i * GOLD, tilt = 0.12 + 0.5 * (i / 13), len = (0.13 + R() * 0.06) * s, dir = V(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)), end = dir.clone().multiplyScalar(len);
    stemPiece(acc, V(0, 0, 0), end, 0.005 * s, '#4A7C42');
    acc.add(lm, petal({ len: 0.25 * s, wid: 0.075 * s, shape: 'lance', cup: 0.3, fold: 0.3, bend0: -0.1, bend: 0.7, su: 6, sv: 12 }), leafM(end, dir.clone().add(V(0, 0.35, 0)), 1, (R() - 0.5) * 0.5), tint.clone().multiplyScalar(0.9 + R() * 0.2));
  }
  const spm = petalMat('spathe', '#FBFBF5', { veins: 0.25, root: '#E3EFD9' }, { roughness: 0.45, sheen: 0.4 });
  for (let f = 0; f < 3; f++) {
    const a = f * 2.1 + 0.3, top = V(Math.cos(a) * 0.08 * s, (0.48 + f * 0.04) * s, Math.sin(a) * 0.08 * s);
    stemPiece(acc, V(0, 0, 0), top, 0.004 * s, '#5C8C50');
    acc.add(spm, petal({ len: 0.13 * s, wid: 0.065 * s, shape: 'ovate', cup: 0.65, bend0: 0.15, bend: 0.25, reflex: 0.2, su: 8, sv: 10 }), M(top.x, top.y, top.z, 0, a + Math.PI / 2, 0));
    acc.add(plainMat(0.7), PRIM.cyl, M(top.x, top.y, top.z).multiply(new THREE.Matrix4().makeScale(0.007 * s, 0.05 * s, 0.007 * s)), col('#F1E7C8'));
  }
}
function anthurium(acc, s, R, kind = 'red') {
  const crystal = kind === 'crystal', lm = crystal ? TX.crystal() : leafMat(0.22), tint = col(crystal ? '#FFFFFF' : '#24502A');
  const N = crystal ? 6 : 9;
  for (let i = 0; i < N; i++) {
    const a = i * GOLD, tilt = 0.25 + 0.5 * (i / N), len = (0.24 + R() * 0.08) * s, dir = V(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)), end = dir.clone().multiplyScalar(len);
    stemPiece(acc, V(0, 0, 0), end, 0.005 * s, '#4A7C42');
    acc.add(lm, petal({ len: (crystal ? 0.24 : 0.19) * s, wid: (crystal ? 0.17 : 0.13) * s, shape: 'broad', cup: 0.2, bend0: 0.1, bend: 0.5, reflex: 0.1, su: 8, sv: 12 }), leafM(end, dir.clone().add(V(0, 0.2, 0)), 1), tint);
  }
  if (crystal) return;
  const red = { red: '#A8102A', pink: '#E07898', white: '#F5F2EA' }[kind] || '#A8102A';
  const sm = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(red), roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1, side: THREE.DoubleSide, envMapIntensity: 0.55 });
  for (let f = 0; f < 4; f++) {
    const a = f * 1.7 + 0.6, top = V(Math.cos(a) * 0.16 * s, (0.36 + (f % 2) * 0.06) * s, Math.sin(a) * 0.16 * s);
    stemPiece(acc, V(0, 0, 0), top, 0.004 * s, '#4A7C42');
    acc.add(sm, petal({ len: 0.15 * s, wid: 0.135 * s, shape: 'broad', cup: 0.12, bend0: 0.95, bend: 0.25, su: 10, sv: 10 }), M(top.x, top.y, top.z, 0, a + Math.PI / 2, 0));
    acc.add(plainMat(0.6), PRIM.cone, alongM(top, V(Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3)).multiply(new THREE.Matrix4().makeScale(0.009 * s, 0.07 * s, 0.009 * s)), col('#E8C24A'));
  }
}
function ficus(acc, s, R, vari = false) {
  const m = vari ? TX.ficusVar() : leafMat(0.18), tint = col(vari ? '#FFFFFF' : '#1F3B1E');
  const H = 0.62 * s;
  stemPiece(acc, V(0, 0, 0), V(0.01, H, 0), 0.012 * s, '#6B5A48');
  for (let i = 0; i < 10; i++) {
    const t = 0.22 + i * 0.075, a = i * 2.4, p = V(0.01 * t, H * t, 0);
    const dir = V(Math.cos(a), 0.5 + t * 0.5, Math.sin(a)).normalize(), petEnd = p.clone().addScaledVector(dir, 0.04 * s);
    stemPiece(acc, p, petEnd, 0.004 * s, '#7A5E4A');
    acc.add(m, petal({ len: 0.2 * s, wid: 0.1 * s, shape: 'ovate', cup: 0.25, fold: 0.1, bend0: -0.1, bend: 0.45, su: 8, sv: 12 }), alongM(petEnd, dir.clone().setY(0.2).normalize(), 1, Math.PI), tint);
  }
  acc.add(plainMat(0.4), PRIM.cone, M(0.01, H, 0).multiply(new THREE.Matrix4().makeScale(0.008 * s, 0.035 * s, 0.008 * s)), col('#B04A4A'));
}
function calathea(acc, s, R) {
  const m = TX.calathea();
  for (let i = 0; i < 10; i++) {
    const a = i * GOLD, tilt = 0.15 + 0.4 * (i / 10), len = (0.2 + R() * 0.08) * s, dir = V(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)), end = dir.clone().multiplyScalar(len);
    stemPiece(acc, V(0, 0, 0), end, 0.004 * s, '#6C8E52');
    acc.add(m, petal({ len: 0.2 * s, wid: 0.1 * s, shape: 'ovate', cup: 0.2, wave: 0.02, waveF: 7, bend0: -0.1, bend: 0.45, su: 8, sv: 12 }), leafM(end, dir.clone().add(V(0, 0.5, 0)), 1, (R() - 0.5) * 0.4));
  }
}
function pothos(acc, s, R, potR) {
  const m = TX.pothos();
  for (let v = 0; v < 5; v++) {
    const a = v * 1.35 + 0.3, pts = [V(0, 0.02, 0), V(Math.cos(a) * potR * 0.7, 0.07 * s, Math.sin(a) * potR * 0.7), V(Math.cos(a) * potR * 1.15, 0.02, Math.sin(a) * potR * 1.15), V(Math.cos(a) * potR * 1.25, -0.12 * s, Math.sin(a) * potR * 1.25), V(Math.cos(a + 0.2) * potR * 1.3, -0.24 * s * (0.6 + R() * 0.5), Math.sin(a + 0.2) * potR * 1.3)];
    const curve = new THREE.CatmullRomCurve3(pts), n = 12;
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n, p0 = curve.getPoint(t0), p1 = curve.getPoint(t1);
      stemPiece(acc, p0, p1, 0.004 * s, '#5D8A45');
      if (k > 0) { const out = V(Math.cos(a), 0, Math.sin(a)), d = out.clone().multiplyScalar(0.8).add(V(0, k % 2 ? 0.5 : 0.1, 0)).add(V(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(k % 2 ? 0.6 : -0.6)); acc.add(m, petal({ len: (0.09 - k * 0.003) * s, wid: (0.07 - k * 0.002) * s, shape: 'broad', cup: 0.2, bend0: 0, bend: 0.4, su: 6, sv: 8 }), alongM(p1, d, 1, R() * 6)); }
    }
  }
  for (let i = 0; i < 11; i++) { const a = i * GOLD, d = V(Math.cos(a) * (0.4 + i * 0.06), 1, Math.sin(a) * (0.4 + i * 0.06)); acc.add(m, petal({ len: 0.11 * s, wid: 0.085 * s, shape: 'broad', cup: 0.2, bend0: 0, bend: 0.5, su: 6, sv: 8 }), alongM(V(0, 0.01, 0), d, 1, a)); }
}

/* ───────── каталог ───────── */
export const PLANTS = [
  { id: 'echeveria', name: 'Эхеверия', group: 'Суккуленты', note: 'Розетка, почти не требует полива', sizes: [9, 12], care: 'Полив раз в 2 недели, яркий свет', build: (a, s, R) => echeveria(a, s, R) },
  { id: 'echeveria-pink', name: 'Эхеверия розовая', group: 'Суккуленты', note: 'Пудрово-розовая', sizes: [9], care: 'Полив раз в 2 недели, яркий свет', build: (a, s, R) => echeveria(a, s, R, '#D9B3B8', '#B86A80') },
  { id: 'haworthia', name: 'Хавортия', group: 'Суккуленты', note: 'Полосатая, для подоконника', sizes: [9], care: 'Полив раз в 2–3 недели, полутень', build: haworthia },
  { id: 'cactus', name: 'Кактус-шар', group: 'Кактусы', note: 'Золотые колючки', sizes: [9, 12], care: 'Полив раз в месяц, солнце', build: cactus },
  { id: 'agla-red', name: 'Аглаонема красная', group: 'Декоративно-лиственные', note: 'Хит сезона, розовая пестрота', sizes: [12, 14, 17], care: 'Рассеянный свет, полив по мере просыхания', build: (a, s, R) => aglaonema(a, s, R, 'red') },
  { id: 'agla-silver', name: 'Аглаонема серебристая', group: 'Декоративно-лиственные', note: 'Светлый узор на листе', sizes: [12, 14], care: 'Полутень, полив по мере просыхания', build: (a, s, R) => aglaonema(a, s, R, 'silver') },
  { id: 'calathea', name: 'Калатея', group: 'Декоративно-лиственные', note: 'Рисунок «пёрышки»', sizes: [11, 14], care: 'Высокая влажность, без прямого солнца', build: calathea },
  { id: 'monstera', name: 'Монстера', group: 'Декоративно-лиственные', note: 'Резные листья', sizes: [12, 17], care: 'Рассеянный свет, полив раз в неделю', build: (a, s, R) => monstera(a, s, R, false) },
  { id: 'monstera-var', name: 'Монстера пёстрая', group: 'Декоративно-лиственные', note: 'Вариегатная, коллекционная', sizes: [17], care: 'Яркий рассеянный свет, без сквозняков', build: (a, s, R) => monstera(a, s, R, true) },
  { id: 'ficus', name: 'Фикус каучуконосный', group: 'Декоративно-лиственные', note: 'Глянцевые листья', sizes: [15, 17], care: 'Светлое место, полив раз в неделю', build: (a, s, R) => ficus(a, s, R, false) },
  { id: 'ficus-var', name: 'Фикус пёстрый', group: 'Декоративно-лиственные', note: 'Кремовая кайма', sizes: [15], care: 'Яркий свет, полив раз в неделю', build: (a, s, R) => ficus(a, s, R, true) },
  { id: 'pothos', name: 'Эпипремнум золотистый', group: 'Ампельные', note: 'Свисающие плети', sizes: [11, 14], care: 'Неприхотлив, полутень', build: pothos },
  { id: 'zz', name: 'Замиокулькас', group: 'Неприхотливые', note: 'Переживёт отпуск', sizes: [12, 14, 15], care: 'Полив раз в 2–3 недели', build: (a, s, R) => zamioculcas(a, s, R, false) },
  { id: 'zz-black', name: 'Замиокулькас чёрный', group: 'Неприхотливые', note: 'Почти чёрный глянец', sizes: [10], care: 'Полив раз в 2–3 недели', build: (a, s, R) => zamioculcas(a, s, R, true) },
  { id: 'sansev', name: 'Сансевиерия', group: 'Неприхотливые', note: 'С жёлтой каймой', sizes: [11, 14], care: 'Полив раз в 3 недели, любой свет', build: sansevieria },
  { id: 'spath', name: 'Спатифиллум', group: 'Цветущие', note: 'Белые цветы круглый год', sizes: [10, 12, 14], care: 'Полутень, обильный полив', build: spathiphyllum },
  { id: 'anth-red', name: 'Антуриум красный', group: 'Цветущие', note: 'Глянцевые цветы', sizes: [12, 17], care: 'Рассеянный свет, опрыскивание', build: (a, s, R) => anthurium(a, s, R, 'red') },
  { id: 'anth-pink', name: 'Антуриум розовый', group: 'Цветущие', note: 'Нежно-розовый', sizes: [12], care: 'Рассеянный свет, опрыскивание', build: (a, s, R) => anthurium(a, s, R, 'pink') },
  { id: 'anth-crystal', name: 'Антуриум «Кристалл»', group: 'Декоративно-лиственные', note: 'Бархатный лист с белыми жилками', sizes: [9, 12], care: 'Тепло и влажность, без солнца', build: (a, s, R) => anthurium(a, s, R, 'crystal') }
];
// размер горшка в см → радиус кашпо и масштаб растения в единицах сцены
export const potR = cm => cm / 2 / 30 * 1.0;
export function plantScale(cm, id) { const base = /echeveria|haworthia|cactus/.test(id) ? 9 : 12; return Math.pow(cm / base, 0.85); }
const cache = new Map();
export function makePlant(id, cm) {
  const key = id + cm;
  if (!cache.has(key)) {
    const p = PLANTS.find(x => x.id === id), acc = new Acc(), R = rng(id.length * 31 + cm);
    p.build(acc, plantScale(cm, id) * (/echeveria|haworthia|cactus/.test(id) ? 1.3 : 1.8), R, potR(cm));
    cache.set(key, acc.build());
  }
  return cache.get(key).clone();
}
