// АММА · примерные розничные цены, Москва, ₽ (ориентир — рынок октябрь 2026). Один источник для конструктора и каталога
export const P = {
  flower: { rose: 160, peony: 330, spray: 260, eustoma: 290, tulip: 120, carnation: 100, chrys: 170, alstro: 190, hydrangea: 690 },
  green: { euca: 150, pist: 120, ruscus: 100, gyps: 250, stipa: 150 },
  wrap: { 'amma-white': 250, 'amma-graphite': 250, calque: 200, kraft: 150, blush: 200, film: 100, vase: 0, none: 0 },
  box: { 'hat-graphite': 900, 'hat-white': 900, 'hat-forest': 900, 'bag-forest': 1100, 'bag-graphite': 1100, gift: 1300 },
  assembly: { bouquet: 300, box: 400 },   // работа флориста; банч пачкой — без сборки
  card: 150,
  plant: {
    echeveria: { 9: 390, 12: 590 }, 'echeveria-pink': { 9: 450 }, haworthia: { 9: 420 }, cactus: { 9: 450, 12: 790 },
    'agla-red': { 12: 1490, 14: 1890, 17: 2690 }, 'agla-silver': { 12: 1290, 14: 1690 }, calathea: { 11: 1190, 14: 1690 },
    monstera: { 12: 1490, 17: 2990 }, 'monstera-var': { 17: 6900 }, ficus: { 15: 1790, 17: 2490 }, 'ficus-var': { 15: 2190 },
    pothos: { 11: 790, 14: 1190 }, zz: { 12: 1290, 14: 1690, 15: 1990 }, 'zz-black': { 10: 1690 }, sansev: { 11: 890, 14: 1390 },
    spath: { 10: 890, 12: 1190, 14: 1490 }, 'anth-red': { 12: 1390, 17: 2590 }, 'anth-pink': { 12: 1490 }, 'anth-crystal': { 9: 1190, 12: 1890 }
  },
  pot: { tech: 0, white: 400, graphite: 500, forest: 500 },   // + 30 ₽ за каждый см диаметра
  pack: { label: 0, sleeve: 90, tag: 60, care: 0, ribbon: 150, bag: 150 },
  giftBox: { S: 450, M: 590, L: 790, XL: 990 }
};
export const fmt = n => n.toLocaleString('ru-RU').replace(/ |\s/g, ' ') + ' ₽';
const r10 = n => Math.round(n / 10) * 10;
const retail = n => n <= 0 ? 0 : Math.max(90, Math.round(n / 100) * 100 - 10);   // розничная «красивая» цена: …90 ₽
export const potPrice = (pot, cm) => pot === 'tech' ? 0 : r10(P.pot[pot] + cm * 30);
export const plantPrice = (id, cm) => { const t = P.plant[id] || {}; return t[cm] || t[Object.keys(t)[0]] || 990; };
export const giftSizeGuess = cm => cm <= 9 ? 'S' : cm <= 12 ? 'M' : cm <= 15 ? 'L' : 'XL';
// цена позиции по составу (тот же формат, что cfg в каталоге и state в конструкторе)
export function priceOf(c, giftSize) {
  if (c.mode === 'potted') {
    const pack = c.pack instanceof Set ? [...c.pack] : c.pack || [];
    let s = plantPrice(c.plant, c.size) + potPrice(c.pot, c.size);
    pack.forEach(k => { s += k === 'gift' ? P.giftBox[giftSize || giftSizeGuess(c.size)] : P.pack[k] || 0; });
    return retail(s);
  }
  let s = 0, stems = 0;
  for (const k in c.flowers || {}) { const n = c.flowers[k]; s += (P.flower[k.split(':')[0]] || 200) * n; stems += n; }
  for (const k in c.greens || {}) { s += (P.green[k] || 120) * c.greens[k]; stems += c.greens[k]; }
  if (!stems) return 0;
  if (c.mode === 'box') s += (P.box[c.box] || 900) + P.assembly.box;
  else if (c.wrap !== 'vase') s += (P.wrap[c.wrap] || 0) + P.assembly.bouquet;
  if (c.card && String(c.card).trim()) s += P.card;
  return retail(s);
}
