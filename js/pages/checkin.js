import { h, $, $$, svgFrag, roll, toast, reduceMotion, clear } from '../core/dom.js';
import { t, apply, onLang, fmtNum, fmtDate } from '../core/i18n.js';
import { shell, url } from '../core/shell.js';
import * as ledger from '../core/ledger.js';
import { MENU, BY_ID, COUNTERS, LIMITS, MAX_QTY, totals, flagsFor, countOf } from '../data/menu.js';
import { mountKidzy, makePettable, lookAt } from '../kidzy.js';
import { item, glyph, props, arrow } from '../art.js';

shell('checkin');

const app = $('#app');
const notices = $('#notices');
const S = { stage: 'order', cart: {}, swaps: 0, counter: 'drinks', view: null, printed: false, saving: false };
let kz = null;

// ---------------------------------------------------------------- helpers
const MOODS = ['happy', 'ok', 'sweaty', 'tired', 'tired'];
const name = (id) => t(`m.${id}`);
const unit = (id) => t(`m.${id}.u`);

function chipFor(m) {
  if (m.nsaid) return t('chip.nsaid');
  if (m.id === 'diet') return t('chip.diet');
  if (m.sugar) return t('chip.sugar', { v: m.sugar });
  if (m.sodium) return t('chip.sodium', { v: fmtNum(m.sodium) });
  if (m.water) return t('chip.water');
  return '';
}

/** Mood while ordering: ignore the water habit until there is enough on the tray to judge. */
function liveMood() {
  const f = flagsFor(S.cart);
  const n = countOf(f.slice(1));
  return MOODS[n] || 'happy';
}

function liveLine(tt) {
  if (!tt.n) return t('ci.say.empty');
  if (tt.nsaid > 0) return t('ci.say.pill');
  if (tt.sodium > LIMITS.sodium) return t('ci.say.salt');
  if (tt.sugar > LIMITS.sugar) return t('ci.say.sugar');
  if (tt.sweet > LIMITS.sweet) return t('ci.say.sweet');
  if (tt.water < 4) return t('ci.say.water');
  return t('ci.say.good');
}

function noticeEl(kind, title, body, art = 'warn') {
  return h('div.notice', { class: kind === 'info' ? 'info' : '', role: kind === 'info' ? 'status' : 'alert' },
    svgFrag(glyph[art]()), h('div', h('strong', title), h('p', body)));
}

function renderNotices() {
  clear(notices);
  const v = S.view;
  if (!v) return;
  if (v.lock === 'clock') notices.append(noticeEl('warn', t('lock.clock.t'), t('lock.clock.p'), 'lock'));
  if (v.unverified.length) notices.append(noticeEl('warn', t('int.t'), t('int.p', { n: v.unverified.length })));
  if (!v.persisted.idb && !v.persisted.ls) notices.append(noticeEl('info', t('lock.err.t'), t('store.mem')));
}

// ---------------------------------------------------------------- stage: order (the café)
function renderOrder() {
  const tt = totals(S.cart);
  const board = h('section.board', { 'aria-labelledby': 'boardTabs' },
    h('div.tabs#boardTabs', { role: 'tablist' }, COUNTERS.map((c) => h('button', {
      type: 'button', role: 'tab', 'aria-selected': String(S.counter === c), id: `tab-${c}`, 'aria-controls': 'menuGrid',
      onclick: () => { S.counter = c; render(); },
    }, t(`ci.counter.${c}`)))),
    h('div.menu-grid#menuGrid', { role: 'tabpanel', 'aria-labelledby': `tab-${S.counter}` },
      MENU.filter((m) => !m.hidden && m.counter === S.counter).map((m, i) => menuCard(m, i))),
    h('p.estimate', t('ci.estimate')));

  const counter = h('aside.counter', { 'aria-label': t('ci.tray') },
    h('div.counter-top',
      h('div.counter-kidzy#ckz'),
      h('p.say#csay', liveLine(tt))),
    tubes(tt),
    h('div.tray-list',
      h('div.tray-head', h('b', t('ci.tray')), h('span.mono#trayCount', t('ci.tray.count', { n: tt.n }))),
      trayList()),
    h('button.btn.print-btn#printBtn', { type: 'button', onclick: toReceipt, disabled: S.view?.lock ? true : null },
      svgFrag(props.printer()), h('span', t('ci.print'))));

  const bar = h('div.order-bar',
    h('span.order-bar-n', h('b#barN', String(tt.n)), ' ', h('span', t('ci.tray'))),
    h('button.btn#barPrint', { type: 'button', onclick: toReceipt, disabled: S.view?.lock ? true : null }, h('span', t('ci.print'))));

  app.replaceChildren(h('div.cafe', board, counter), bar);
  kz = mountKidzy($('#ckz'), { mood: liveMood(), hat: true, float: true, label: t(`mood.${liveMood()}`) });
  makePettable(kz, { onPoke: () => { const el = $('#csay'); el.textContent = t('ci.pet.poke'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } });
  updateTubes(tt, false);
}

function menuCard(m, i) {
  const q = S.cart[m.id] || 0;
  const card = h('div.menu-item', { style: { '--i': i }, dataset: { id: m.id }, class: q ? 'has' : '' },
    h('button.mi-add', { type: 'button', 'aria-label': t('ci.add', { item: name(m.id) }), onclick: (e) => add(m.id, e.currentTarget) },
      h('span.mi-art', svgFrag(item(m.art))),
      h('span.mi-name', name(m.id)),
      h('span.mi-unit', unit(m.id)),
      h('span.mi-chip', { class: m.nsaid ? 'hot' : m.water ? 'teal' : '' }, chipFor(m))),
    h('span.mi-q', { 'aria-hidden': 'true' }, q ? `×${q}` : ''),
    h('button.mi-minus', { type: 'button', 'aria-label': t('ci.remove', { item: name(m.id) }), onclick: () => remove(m.id), hidden: !q }, '−'));
  return card;
}

function tubes(tt) {
  const list = [
    ['sugar', `${tt.sugar}/${LIMITS.sugar} g`, '--amber'],
    ['sodium', `${fmtNum(tt.sodium)}/${fmtNum(LIMITS.sodium)}`, '--amber'],
    ['water', `${tt.water}/${LIMITS.water}`, '--teal'],
    ['sweet', `${tt.sweet}/${LIMITS.sweet}`, '--rose'],
    ['nsaid', `${tt.nsaid}`, '--rose'],
  ];
  return h('div.tubes', list.map(([k, v, c]) => h('div.tube', { dataset: { k }, style: { '--c': `var(${c})` } },
    h('div.tube-top', h('span', t(`ci.tube.${k}`)), h('b', v)),
    h('div.glass', h('i')))));
}

function updateTubes(tt, animate = true) {
  const pct = {
    sugar: tt.sugar / LIMITS.sugar, sodium: tt.sodium / LIMITS.sodium, water: tt.water / LIMITS.water,
    sweet: tt.sweet / 2, nsaid: tt.nsaid ? 1 : 0,
  };
  const over = { sugar: tt.sugar > LIMITS.sugar, sodium: tt.sodium > LIMITS.sodium, water: false, sweet: tt.sweet > LIMITS.sweet, nsaid: tt.nsaid > 0 };
  const label = {
    sugar: `${tt.sugar}/${LIMITS.sugar} g`, sodium: `${fmtNum(tt.sodium)}/${fmtNum(LIMITS.sodium)}`,
    water: `${tt.water}/${LIMITS.water}`, sweet: `${tt.sweet}/${LIMITS.sweet}`, nsaid: `${tt.nsaid}`,
  };
  for (const el of $$('.tube', app)) {
    const k = el.dataset.k;
    const wasOver = el.classList.contains('over');
    el.classList.toggle('over', over[k]);
    if (over[k] && !wasOver && animate) { el.classList.remove('over'); void el.offsetWidth; el.classList.add('over'); }
    el.querySelector('i').style.width = `${Math.min(100, pct[k] * 100)}%`;
    if (over[k]) el.querySelector('i').style.background = 'var(--hot)';
    else el.querySelector('i').style.background = '';
    el.querySelector('b').textContent = label[k];
    if (k === 'sweet') el.style.setProperty('--limit', '50%');
  }
}

function trayList() {
  const ids = Object.keys(S.cart);
  if (!ids.length) return h('p.tray-empty', t('ci.tray.empty'));
  return h('ul.tray-items', ids.map((id) => h('li',
    h('span.ti-art', svgFrag(item(BY_ID[id].art))),
    h('span.ti-name', name(id)),
    h('b.mono', `×${S.cart[id]}`))));
}

function refreshOrder(changedId) {
  const tt = totals(S.cart);
  const card = $(`.menu-item[data-id="${changedId}"]`, app);
  if (card) card.replaceWith(menuCard(BY_ID[changedId], 0));
  $('.tray-list', app).replaceChildren(
    h('div.tray-head', h('b', t('ci.tray')), h('span.mono#trayCount', t('ci.tray.count', { n: tt.n }))), trayList());
  $('#barN').textContent = String(tt.n);
  const sayEl = $('#csay');
  const line = liveLine(tt);
  if (sayEl.textContent !== line) { sayEl.textContent = line; sayEl.classList.remove('pop'); void sayEl.offsetWidth; sayEl.classList.add('pop'); }
  const mood = liveMood();
  kz.setMood(mood); kz.setLabel(t(`mood.${mood}`));
  updateTubes(tt);
}

function add(id, fromEl) {
  if ((S.cart[id] || 0) >= MAX_QTY) return;
  S.cart[id] = (S.cart[id] || 0) + 1;
  fly(fromEl, BY_ID[id].art, () => kz?.chew({ ms: 650, crumbs: crumbOf(BY_ID[id]) }));
  refreshOrder(id);
}

function remove(id) {
  if (!S.cart[id]) return;
  if (--S.cart[id] <= 0) delete S.cart[id];
  refreshOrder(id);
  $(`.menu-item[data-id="${id}"] .mi-add`, app)?.focus();
}

const crumbOf = (m) => (m.water ? '#7fd6cf' : m.nsaid ? '#f88d98' : m.sodium ? '#f7f2ea' : '#ffd27a');

function fly(fromEl, art, done) {
  const target = $('#ckz');
  if (!fromEl || !target || !kz || reduceMotion()) { done(); return; }
  const a = fromEl.querySelector('.mi-art')?.getBoundingClientRect() || fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (b.bottom < 0 || b.top > innerHeight) { done(); return; }
  const m = kz.mouthPoint();
  const g = h('div.drag-ghost', { 'aria-hidden': 'true' }, svgFrag(item(art)));
  Object.assign(g.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
  document.body.append(g);
  const dx = m.x - (a.left + a.width / 2);
  const dy = m.y - (a.top + a.height / 2);
  const anim = g.animate([
    { transform: 'none' },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) rotate(140deg) scale(1.15)`, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) rotate(320deg) scale(.15)`, opacity: 0.3 },
  ], { duration: 580, easing: 'cubic-bezier(.4,0,.3,1)' });
  (function watch() {
    if (anim.playState !== 'running') return;
    const r = g.getBoundingClientRect();
    lookAt(r.left + r.width / 2, r.top + r.height / 2);
    kz.sniff(r.left + r.width / 2, r.top + r.height / 2, 300);
    requestAnimationFrame(watch);
  })();
  anim.onfinish = () => { g.remove(); done(); };
}

function toReceipt() {
  if (!Object.keys(S.cart).length) {
    for (const b of [$('#printBtn'), $('#barPrint')]) { b?.classList.remove('shake'); void b?.offsetWidth; b?.classList.add('shake'); }
    toast(t('ci.need'));
    return;
  }
  S.stage = 'receipt';
  S.printed = false;
  render();
  scrollTo({ top: $('#app').getBoundingClientRect().top + scrollY - 90, behavior: reduceMotion() ? 'auto' : 'smooth' });
}

// ---------------------------------------------------------------- stage: receipt
function renderReceipt() {
  const first = !S.printed;
  S.printed = true;
  const wrap = h('div.receipt-stage',
    h('div.printer', { 'aria-hidden': 'true' }, h('span.printer-slot'), h('span.printer-led')),
    h('div.receipt-roll', { class: first && !reduceMotion() ? 'feeding' : '' }, receiptEl(first)),
    h('aside.receipt-side',
      h('div.side-kidzy#rkz'),
      h('p.say#rsay', ''),
      h('p.side-hint', t('rc.hint.swap')),
      h('div.side-actions',
        h('button.btn#saveBtn', { type: 'button', onclick: save, disabled: S.view?.lock ? true : null }, svgFrag(glyph.seal()), h('span', t('rc.save'))),
        h('button.btn.ghost', { type: 'button', onclick: () => { S.stage = 'order'; render(); } }, t('rc.back'))),
    ));
  app.replaceChildren(wrap);
  kz = mountKidzy($('#rkz'), { mood: 'happy', hat: true, float: true });
  makePettable(kz);
  updateReceipt(first);
}

function receiptEl(first) {
  const date = fmtDate(new Date(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  let i = 0;
  const lines = Object.keys(S.cart).map((id) => receiptLine(id, i++));
  return h('div.receipt', { class: first ? 'rc-print' : '', id: 'receipt' },
    h('h3', t('rc.title')),
    h('p.rc-meta', t('rc.shop'), h('br'), t('rc.table', { date })),
    h('hr.rc-rule'),
    h('div#rcLines', lines),
    h('hr.rc-rule'),
    h('p.rc-meta', { style: { textAlign: 'left', margin: '0 0 4px', '--i': i++ } }, t('rc.totals')),
    h('div#rcTotals', [0, 1, 2, 3].map((k) => h('div.rc-total', { style: { '--i': i + k }, dataset: { k } },
      h('span.rc-hname', h('i', String(k + 1)), h('span.rc-hlabel')), h('span.rc-stamp-slot')))),
    h('div.rc-count', { style: { '--i': i + 4 } },
      h('div', h('small', t('rc.count')), h('b#rcN', '0'), h('small', t('rc.of'))),
      h('div.rc-mini#rcMini')),
    h('p.rc-thanks', t('rc.thanks')),
    h('div.barcode', { 'aria-hidden': 'true' }));
}

function receiptLine(id, i) {
  const m = BY_ID[id];
  const q = S.cart[id];
  const parts = [];
  if (m.sugar) parts.push(`${m.sugar * q} g`);
  if (m.sodium) parts.push(`${fmtNum(m.sodium * q)} mg Na`);
  if (m.water) parts.push(`${m.water * q} × 250 ml`);
  if (m.nsaid) parts.push(`${q} × NSAID`);
  if (m.sweet && !m.sugar) parts.push('0 g');
  return h('div.rc-line', { style: { '--i': i }, dataset: { id } },
    h('span.rc-name', `${name(id)} ×${q}`),
    h('span.rc-sub', parts.join(' · ') || '—'),
    m.swap ? h('button.rc-swap', { type: 'button', onclick: () => swap(id), 'aria-label': `${t('rc.swap')}: ${name(id)} → ${name(m.swap)}` }, t('rc.swap')) : null);
}

function updateReceipt(first) {
  const tt = totals(S.cart);
  const f = flagsFor(S.cart);
  const n = countOf(f);
  const labels = [
    t('rc.line.water', { v: tt.water, l: LIMITS.water }),
    t('rc.line.sugar', { v: tt.sugar, l: LIMITS.sugar, s: tt.sweet }),
    t('rc.line.salt', { v: fmtNum(tt.sodium), l: fmtNum(LIMITS.sodium) }),
    t('rc.line.pill', { v: tt.nsaid }),
  ];
  const bad = [t('rc.low'), t('rc.over'), t('rc.over'), t('rc.taken')];
  for (const row of $$('.rc-total', app)) {
    const k = +row.dataset.k;
    row.classList.toggle('flag', f[k]);
    row.querySelector('.rc-hlabel').textContent = labels[k];
    const slot = row.querySelector('.rc-stamp-slot');
    const prev = slot.dataset.s;
    const next = f[k] ? 'bad' : 'ok';
    if (prev !== next) {
      slot.replaceChildren(h('span.stamp', { class: f[k] ? '' : 'ok', style: { '--sd': first ? `${0.9 + k * 0.15}s` : '0s' } }, f[k] ? bad[k] : t('rc.ok')));
      slot.dataset.s = next;
    }
  }
  const nEl = $('#rcN');
  if (first && !reduceMotion()) setTimeout(() => roll(nEl, n, { dur: 500 }), 1500);
  else roll(nEl, n, { dur: 400 });
  const mood = MOODS[n];
  kz.setMood(mood); kz.setLabel(t(`mood.${mood}`));
  const say = $('#rsay');
  say.textContent = t(`rc.say.${n}`);
  say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
}

function swap(id) {
  const m = BY_ID[id];
  if (!m?.swap || !S.cart[id]) return;
  const to = m.swap;
  const merged = Math.min(MAX_QTY, (S.cart[to] || 0) + S.cart[id]);
  const next = {};
  for (const [k, q] of Object.entries(S.cart)) {
    if (k === id) next[to] = merged;
    else if (k !== to) next[k] = q;
  }
  S.cart = next;
  S.swaps += 1;
  const line = $(`.rc-line[data-id="${id}"]`, app);
  const existing = $(`.rc-line[data-id="${to}"]`, app);
  const fresh = receiptLine(to, 0);
  fresh.classList.add('morph');
  if (existing) { existing.replaceWith(fresh); line?.remove(); }
  else line?.replaceWith(fresh);
  updateReceipt(false);
  toast(t('rc.swapped', { item: name(to) }));
}

async function save() {
  if (S.saving) return;
  S.saving = true;
  const btn = $('#saveBtn');
  btn.disabled = true;
  btn.querySelector('span').textContent = t('rc.saving');
  const res = await ledger.checkIn(S.cart, S.swaps);
  S.saving = false;
  if (!res.ok) {
    S.view = ledger.current();
    renderNotices();
    btn.disabled = false;
    btn.querySelector('span').textContent = t('rc.save');
    toast(res.reason === 'clock' ? t('lock.clock.t') : t('lock.err.p'));
    return;
  }
  S.view = ledger.current();
  S.stage = 'done';
  render();
  scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
}

// ---------------------------------------------------------------- stage: done
function renderDone() {
  const e = S.view.todayEntry;
  const f = e.flags;
  const n = e.count;
  const card = h('section.done.card',
    h('div.done-art#dkz'),
    h('div.done-body',
      h('p.kicker', svgFrag(glyph.seal()), t('done.kicker')),
      h('h2', t('done.h2')),
      h('div.done-count', h('b', String(n)), h('span', t('rc.of'))),
      h('ul.done-flags', f.map((on, i) => h('li', { class: on ? 'on' : '' }, h('i', String(i + 1)), t(`habit.${i + 1}`)))),
      h('p.done-meta.mono', `${t('done.code')}: ${S.view.code} · ${t('done.streak', { n: S.view.streak })}`),
      h('div.done-next',
        h('a.btn', { href: url('/me#silent') }, h('span', t('done.next.tab')), svgFrag(arrow())),
        h('a.btn.ghost', { href: url('/me#streak') }, h('span', t('done.next.card'))),
        h('a.btn.ghost', { href: url('/habits') }, h('span', t('done.next.habits')))),
      h('p.done-redo', h('span', t('done.already')), ' ',
        h('button.linkish', { type: 'button', onclick: redo, disabled: S.view.lock ? true : null }, t('done.redo')))));
  app.replaceChildren(card);
  mountKidzy($('#dkz'), { mood: MOODS[n], arms: n === 0, label: t(`mood.${MOODS[n]}`) });
}

function redo() {
  S.cart = { ...S.view.todayEntry.items };
  S.swaps = 0;
  S.stage = 'order';
  render();
}

// ---------------------------------------------------------------- boot
function render() {
  $('#ciKicker').replaceChildren(t('ci.kicker', { date: fmtDate(new Date()) }));
  renderNotices();
  if (S.stage === 'done' && S.view?.todayEntry) renderDone();
  else if (S.stage === 'receipt') renderReceipt();
  else renderOrder();
}

onLang(() => { S.printed = true; render(); });
ledger.subscribe((v) => { S.view = v; renderNotices(); });

(async () => {
  S.view = await ledger.load();
  if (S.view.todayEntry) S.stage = 'done';
  render();
  apply(document);
})();
