// АММА · 3D-каталог: состав каждой позиции. cfg открывает позицию в конструкторе, sc — в витрине упаковки
export const GROUPS = [
  { id: 'bunch', name: 'Банчи в вазе', lead: 'Моно-букеты одного сорта: пачка свежих стеблей, как приходят с плантации' },
  { id: 'bouquet', name: 'Букеты', lead: 'Авторские букеты в фирменной бумаге АММА, кальке и крафте' },
  { id: 'box', name: 'Цветы в коробке', lead: 'Композиции во влажной губке: стоят без вазы' },
  { id: 'potted', name: 'Горшечные растения', lead: 'От милых суккулентов до аглаонем — с кашпо и упаковкой' },
  { id: 'pack', name: 'Упаковка и сопутка', lead: 'Коробки, бумага, пакеты, рукава, открытки и опт' }
];
const B = (flowers, greens, wrap, ribbon = 1) => ({ mode: 'bouquet', flowers, greens, wrap, ribbon });
const X = (flowers, greens, box, ribbon = 1) => ({ mode: 'box', flowers, greens, box, ribbon });
const P = (plant, size, pot, pack, giftClosed = false) => ({ mode: 'potted', plant, size, pot, pack, giftClosed });
export const CATALOG = [
  { id: 'carn-pink-19', group: 'bunch', name: 'Гвоздика розовая, 19 шт', comp: 'Гвоздика розовая — 19', cfg: B({ 'carnation:1': 19 }, {}, 'vase') },
  { id: 'carn-cream-19', group: 'bunch', name: 'Гвоздика кремовая, 19 шт', comp: 'Гвоздика кремовая — 19', cfg: B({ 'carnation:3': 19 }, {}, 'vase') },
  { id: 'carn-white-9', group: 'bunch', name: 'Гвоздика белая, 9 шт', comp: 'Гвоздика белая — 9', cfg: B({ 'carnation:2': 9 }, {}, 'vase') },
  { id: 'peony-orange-15', group: 'bunch', name: 'Пионовидная роза оранжевая, 15 шт', comp: 'Пионовидная роза оранжевая — 15', cfg: B({ 'peony:3': 15 }, {}, 'vase') },
  { id: 'rose-red-15', group: 'bunch', name: 'Роза красная, 15 шт', comp: 'Роза красная 50 см — 15', cfg: B({ 'rose:0': 15 }, {}, 'vase') },
  { id: 'mix-orange', group: 'bunch', name: 'Микс: пионовидные розы и хризантема', comp: 'Пионовидная роза оранжевая — 7 · хризантема белая — 5 · эвкалипт — 4', cfg: B({ 'peony:3': 7, 'chrys:0': 5 }, { euca: 4 }, 'vase') },

  { id: 'hydr-garden', group: 'bouquet', name: 'Гортензия в саду', comp: 'Гортензия розовая · кустовая роза белая · роза белая · эвкалипт', cfg: B({ 'hydrangea:2': 1, 'spray:2': 4, 'rose:3': 3 }, { euca: 3 }, 'amma-white', 1) },
  { id: 'hydr-daisy', group: 'bouquet', name: 'Гортензия с ромашками', comp: 'Гортензия голубая — 2 · хризантема ромашковидная — 6 · эвкалипт', cfg: B({ 'hydrangea:0': 2, 'chrys:0': 6 }, { euca: 2 }, 'calque', 1) },
  { id: 'blue-dream', group: 'bouquet', name: 'Голубая мечта', comp: 'Гортензия голубая · эустома пудровая · кустовая роза · ковыль', cfg: B({ 'hydrangea:0': 1, 'eustoma:2': 4, 'spray:0': 3 }, { stipa: 3 }, 'blush', 4) },
  { id: 'chrys-air', group: 'bouquet', name: 'Воздушная хризантема', comp: 'Хризантема кустовая белая — 11', cfg: B({ 'chrys:0': 11 }, {}, 'calque', 1) },
  { id: 'chrys-stipa', group: 'bouquet', name: 'Хризантема и ковыль', comp: 'Хризантема белая — 9 · ковыль — 4', cfg: B({ 'chrys:0': 9 }, { stipa: 4 }, 'kraft', 2) },
  { id: 'french-5', group: 'bouquet', name: 'Французские розы, 5 шт', comp: 'Пионовидная роза розовая — 5', cfg: B({ 'peony:1': 5 }, {}, 'amma-white', 4) },
  { id: 'juliet', group: 'bouquet', name: 'Пионовидные розы «Джульетта»', comp: 'Пионовидная роза персиковая — 11 · эвкалипт — 3', cfg: B({ 'peony:4': 11 }, { euca: 3 }, 'amma-white', 4) },
  { id: 'classic-red', group: 'bouquet', name: 'Классика: 15 красных роз', comp: 'Роза красная — 15 · эвкалипт — 3', cfg: B({ 'rose:0': 15 }, { euca: 3 }, 'amma-graphite', 2) },

  { id: 'hat-french', group: 'box', name: 'Французские розы в шляпной коробке', comp: 'Пионовидная роза розовая — 7 · кустовая роза — 5 · эвкалипт', cfg: X({ 'peony:1': 7, 'spray:0': 5 }, { euca: 3 }, 'hat-white', 4) },
  { id: 'hat-blue', group: 'box', name: 'Белые розы и голубая гортензия', comp: 'Роза белая — 7 · гортензия голубая — 2 · гипсофила', cfg: X({ 'rose:3': 7, 'hydrangea:0': 2 }, { gyps: 2 }, 'hat-graphite', 1) },
  { id: 'hat-red', group: 'box', name: 'Красные розы с эвкалиптом', comp: 'Роза красная — 15 · эвкалипт — 3', cfg: X({ 'rose:0': 15 }, { euca: 3 }, 'hat-white', 0) },
  { id: 'bag-peach', group: 'box', name: 'Персиковая сумочка', comp: 'Пионовидная роза персиковая — 5 · эустома белая — 4 · кустовая роза — 3', cfg: X({ 'peony:4': 5, 'eustoma:1': 4, 'spray:1': 3 }, { pist: 2 }, 'bag-forest', 2) },
  { id: 'bag-chrys', group: 'box', name: 'Хризантемы в сумочке', comp: 'Хризантема белая, жёлтая и сиреневая — 15', cfg: X({ 'chrys:0': 6, 'chrys:1': 5, 'chrys:2': 4 }, {}, 'bag-graphite', 2) },
  { id: 'gift-mix', group: 'box', name: 'Розы и гвоздики в подарочной коробке', comp: 'Роза розовая — 9 · гвоздика розовая — 5 · эвкалипт', cfg: X({ 'rose:1': 9, 'carnation:1': 5 }, { euca: 2 }, 'gift', 2) },

  { id: 'p-echeveria', group: 'potted', name: 'Эхеверия в белом кашпо', comp: 'Горшок 12 см · белое кашпо · стикер · лента', cfg: P('echeveria', 12, 'white', ['label', 'ribbon']) },
  { id: 'p-haworthia', group: 'potted', name: 'Хавортия в подарочной коробке S', comp: 'Горшок 9 см · коробка S с окном · бирка', cfg: P('haworthia', 9, 'tech', ['gift', 'ribbon', 'tag']) },
  { id: 'p-cactus', group: 'potted', name: 'Кактус-шар', comp: 'Горшок 12 см · графитовое кашпо · стикер', cfg: P('cactus', 12, 'graphite', ['label']) },
  { id: 'p-agla-red', group: 'potted', name: 'Аглаонема красная', comp: 'Горшок 12 см · рукав-конус · бирка', cfg: P('agla-red', 12, 'white', ['sleeve', 'tag']) },
  { id: 'p-agla-silver', group: 'potted', name: 'Аглаонема серебристая', comp: 'Горшок 14 см · графитовое кашпо · стикер', cfg: P('agla-silver', 14, 'graphite', ['label']) },
  { id: 'p-calathea', group: 'potted', name: 'Калатея', comp: 'Горшок 14 см · зелёное кашпо · стикер', cfg: P('calathea', 14, 'forest', ['label']) },
  { id: 'p-monstera', group: 'potted', name: 'Монстера', comp: 'Горшок 17 см · технический горшок · бирка', cfg: P('monstera', 17, 'tech', ['tag']) },
  { id: 'p-zz', group: 'potted', name: 'Замиокулькас чёрный', comp: 'Горшок 10 см · графитовое кашпо · стикер · бирка', cfg: P('zz-black', 10, 'graphite', ['label', 'tag']) },
  { id: 'p-spath', group: 'potted', name: 'Спатифиллум', comp: 'Горшок 14 см · белое кашпо · рукав', cfg: P('spath', 14, 'white', ['sleeve']) },
  { id: 'p-anth', group: 'potted', name: 'Антуриум красный в подарок', comp: 'Горшок 12 см · белое кашпо · лента · карточка ухода', cfg: P('anth-red', 12, 'white', ['ribbon', 'care']) },
  { id: 'p-ficus', group: 'potted', name: 'Фикус пёстрый', comp: 'Горшок 15 см · белое кашпо · стикер', cfg: P('ficus-var', 15, 'white', ['label']) },
  { id: 'p-pothos', group: 'potted', name: 'Эпипремнум золотистый', comp: 'Горшок 14 см · зелёное кашпо', cfg: P('pothos', 14, 'forest', []) },

  { id: 's-hat3', group: 'pack', name: 'Шляпные коробки', comp: 'Графит, белая, зелёная · Ø 16, 20, 24 см', sc: 'hat3' },
  { id: 's-gift', group: 'pack', name: 'Подарочная коробка', comp: 'Зелёная, тиснение кремом, лента со знаком', sc: 'gift' },
  { id: 's-gift-open', group: 'pack', name: 'Коробка с тишью', comp: 'Кремовая бумага-тишью с узором из знака', sc: 'gift-open' },
  { id: 's-boxbag', group: 'pack', name: 'Коробка-сумочка', comp: 'Сужается кверху, ручка-шнур, вкладыш с губкой', sc: 'boxbag' },
  { id: 's-plantbox', group: 'pack', name: 'Коробки для растений S–XL', comp: 'С окном и крышкой · 20–70 см по высоте', sc: 'plantbox' },
  { id: 's-paper', group: 'pack', name: 'Бумага для букетов', comp: 'Белая со знаком, графитовая, калька', sc: 'paper' },
  { id: 's-sleeve', group: 'pack', name: 'Рукав-конус', comp: 'Матовый, с перфорацией · под горшки 9–17 см', sc: 'sleeve' },
  { id: 's-label', group: 'pack', name: 'Стикер на горшок и бирка', comp: 'Название сорта, уход, цена, QR', sc: 'label' },
  { id: 's-carrier', group: 'pack', name: 'Лоток-переноска', comp: 'На 6 горшков 9 см', sc: 'carrier' },
  { id: 's-bags', group: 'pack', name: 'Пакеты АММА', comp: 'Белый, подарочный зелёный, широкий для горшков', sc: 'bags' },
  { id: 's-cards', group: 'pack', name: 'Открытки и карточки ухода', comp: 'Базовая, с Аммиком, уход 10×15 см, ценник', sc: 'cards' },
  { id: 's-stickers', group: 'pack', name: 'Наклейки и скотч', comp: 'Графитовая, «на подарок», с Аммиком, скотч со знаком', sc: 'stickers' },
  { id: 's-ship', group: 'pack', name: 'Транспортный короб', comp: '100×40×30 см · плашка температуры · этикетка с QR', sc: 'ship' }
];
