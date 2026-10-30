// АММА · 3D-каталог: карточки с вращением 360° по кадрам · design & code: Дария Кромберг
import { GROUPS, CATALOG } from './catalog-items.js';
import { priceOf, fmt } from './prices.js';
const FR = 24;
const list = document.getElementById('cat-list'), tabs = document.getElementById('cat-tabs');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (t, a = {}, html = '') => { const e = document.createElement(t); for (const k in a) e.setAttribute(k, a[k]); if (html) e.innerHTML = html; return e; };
const linkFor = it => it.sc ? 'packaging.html#' + it.sc : 'builder.html#cfg=' + encodeURIComponent(JSON.stringify(it.cfg));
const linkText = it => it.sc ? 'Смотреть в 3D' : it.cfg.mode === 'potted' ? 'Изменить в 3D' : 'Изменить состав';
function toast(msg) { const t = document.getElementById('cat-toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 3000); }

// вращение: кадр = позиция фона в спрайте
function spinner(box, it) {
  let f = 0, playing = null, drag = null, loaded = false;
  const set = n => { f = ((Math.round(n) % FR) + FR) % FR; box.style.backgroundPosition = (f / (FR - 1) * 100) + '% 0'; };
  const load = () => { if (loaded) return; loaded = true; box.style.backgroundImage = `url(${it.id}.webp)`; };
  const play = () => { if (reduce || playing) return; let last = 0; const tick = t => { if (!playing) return; if (t - last > 70) { set(f + 1); last = t; } playing = requestAnimationFrame(tick); }; playing = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(playing); playing = null; };
  box.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') play(); });
  box.addEventListener('pointerleave', () => { stop(); });
  box.addEventListener('pointerdown', e => { stop(); drag = { x: e.clientX, f, id: e.pointerId, moved: false }; });
  box.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; box.setPointerCapture(e.pointerId); box.classList.add('is-drag'); }
    if (drag.moved) set(drag.f - dx / (box.clientWidth / FR) * 0.9);
  });
  const end = () => { drag = null; box.classList.remove('is-drag'); };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  box.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { set(f + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { set(f - 1); e.preventDefault(); } });
  return { load };
}
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target._sp.load(); io.unobserve(e.target); } }), { rootMargin: '300px' }) : null;

const sections = {};
GROUPS.forEach(g => {
  const sec = el('section', { class: 'cat-sec', id: 'g-' + g.id });
  sec.append(el('div', {}, `<h2>${g.name}</h2><p style="margin-top:8px">${g.lead}</p>`));
  const grid = el('div', { class: 'cat-grid' });
  CATALOG.filter(it => it.group === g.id).forEach(it => {
    const card = el('article', { class: 'cat-card glass' });
    const spin = el('div', { class: 'cat-spin', role: 'img', tabindex: '0', 'aria-label': `${it.name} — 3D, поверните стрелками или потяните` }, '<span class="cat-360" aria-hidden="true">↻ 360°</span>');
    spin._sp = spinner(spin, it); if (io) io.observe(spin); else spin._sp.load();
    const body = el('div', { class: 'cat-body' }, `<span class="cat-name">${it.name}</span><span class="cat-comp">${it.comp}</span><span class="cat-price">${it.priceText ? it.priceText.replace(/ (?=₽)/, '\u00A0') : fmt(priceOf(it.cfg))}</span>`);
    const act = el('div', { class: 'cat-act' });
    const a = el('a', { class: 'cat-btn cat-btn--line', href: linkFor(it) }, linkText(it));
    const buy = el('button', { type: 'button', class: 'cat-btn cat-btn--dark' }, 'В корзину');
    buy.onclick = () => toast(`«${it.name}» — в корзине.`);
    act.append(a, buy); card.append(spin, body, act); grid.append(card);
  });
  sec.append(grid); list.append(sec); sections[g.id] = sec;
});
// вкладки: «Все» и разделы
const all = [{ id: 'all', name: 'Все' }, ...GROUPS];
const show = id => { all.forEach(g => tabs.querySelector(`[data-g="${g.id}"]`).classList.toggle('is-on', g.id === id)); GROUPS.forEach(g => { sections[g.id].hidden = id !== 'all' && id !== g.id; }); tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('is-on')))); };
all.forEach(g => { const b = el('button', { type: 'button', class: 'cat-tab', 'data-g': g.id }, g.name); b.onclick = () => { show(g.id); try { history.replaceState(null, '', g.id === 'all' ? location.pathname : '#' + g.id); } catch (e) {} }; tabs.append(b); });
const start = (location.hash || '').slice(1);
show(GROUPS.find(g => g.id === start) ? start : 'all');
