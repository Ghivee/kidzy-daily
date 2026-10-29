import { h, $, $$, svgFrag, clear, toast, addDays, keyToDate } from '../core/dom.js';
import { t, apply, onLang, fmtDate, fmtNum } from '../core/i18n.js';
import { shell, reveal, url } from '../core/shell.js';
import * as ledger from '../core/ledger.js';
import { BY_ID } from '../data/menu.js';
import { mountKidzy } from '../kidzy.js';
import { glyph, props, item, arrow } from '../art.js';
import { drawCard, toBlob } from '../streak-card.js';

shell('me');

const TABS = ['silent', 'checkup', 'streak', 'data'];
let tab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'silent';
let view = null;
let picked = null;
const site = location.protocol.startsWith('http') ? location.host : 'kidzy-daily.vercel.app';

// ---------------------------------------------------------------- tabs
function renderTabs() {
  $('#tabs').replaceChildren(...TABS.map((k) => h('button', {
    type: 'button', role: 'tab', id: `t-${k}`, 'aria-selected': String(tab === k), 'aria-controls': `p-${k}`,
    tabindex: tab === k ? '0' : '-1',
    onclick: () => go(k),
    onkeydown: (e) => {
      const i = TABS.indexOf(k);
      if (e.key === 'ArrowRight') { go(TABS[(i + 1) % TABS.length]); $(`#t-${tab}`).focus(); }
      if (e.key === 'ArrowLeft') { go(TABS[(i + TABS.length - 1) % TABS.length]); $(`#t-${tab}`).focus(); }
    },
  }, t(`me.tab.${k}`))));
}

function go(k) {
  tab = k;
  history.replaceState(null, '', `#${k}`);
  render();
}

function noticeEl(title, body, art = 'warn', info = false) {
  return h('div.notice', { class: info ? 'info' : '' }, svgFrag(glyph[art]()), h('div', h('strong', title), h('p', body)));
}

function renderNotices() {
  const n = $('#notices');
  clear(n);
  if (view.lock === 'clock') n.append(noticeEl(t('lock.clock.t'), t('lock.clock.p'), 'lock'));
  if (view.unverified.length) n.append(noticeEl(t('int.t'), t('int.p', { n: view.unverified.length })));
  if (!view.persisted.idb && !view.persisted.ls) n.append(noticeEl(t('lock.err.t'), t('store.mem'), 'warn', true));
}

// ---------------------------------------------------------------- Silent Tab
function silentPanel() {
  const days = [...Array(30)].map((_, i) => addDays(view.today, i - 29));
  const avg = view.total ? view.entries.reduce((s, e) => s + e.count, 0) / view.total : 0;
  const stats = h('div.st-stats',
    statTile(view.streak, t('st.streak'), 'rose'),
    statTile(view.best, t('st.best')),
    statTile(view.total, t('st.total')),
    statTile(view.total ? fmtNum(avg, { maximumFractionDigits: 1 }) : '–', t('st.avg')));

  if (!view.total) {
    const kz = h('div.st-empty-kz');
    const empty = h('div.st-empty.card', kz, h('div', h('p', t('st.empty')), h('a.btn', { href: url('/check-in') }, h('span', t('st.go')), svgFrag(arrow()))));
    mountKidzy(kz, { mood: 'sleepy', float: true, label: t('mood.sleepy') });
    return h('div', h('h2', t('st.h2')), h('p.lede', t('st.p')), stats, empty);
  }

  const roll = h('div.st-roll', { role: 'listbox', 'aria-label': t('st.h2'), tabindex: '0' },
    days.map((d) => {
      const e = view.byDate[d];
      const isToday = d === view.today;
      return h('button.stub', {
        type: 'button', role: 'option', 'aria-selected': String(picked === d), class: [e ? 'has' : 'silent', isToday ? 'today' : ''].join(' '),
        dataset: { d }, onclick: () => { picked = d; render(); },
        'aria-label': e ? t('st.day.has', { date: fmtDate(keyToDate(d)), n: e.count }) : t('st.day.none', { date: fmtDate(keyToDate(d)) }),
      },
      h('span.stub-wd', isToday ? t('st.today') : fmtDate(keyToDate(d), { weekday: 'short' })),
      h('span.stub-d', fmtDate(keyToDate(d), { day: 'numeric' })),
      e ? h('span.stub-n', String(e.count)) : h('span.stub-z', 'z'),
      e ? h('span.stub-dots', e.flags.map((f) => h('i', { class: f ? 'on' : '' }))) : h('span.stub-s', t('st.silent')));
    }));

  const pd = picked || view.today;
  const pe = view.byDate[pd];
  const detail = h('div.st-detail.card',
    h('p.st-detail-h', pe ? t('st.day.has', { date: fmtDate(keyToDate(pd)), n: pe.count }) : t('st.day.none', { date: fmtDate(keyToDate(pd)) })),
    pe ? h('div.st-detail-body',
      h('ul.st-items', Object.entries(pe.items).map(([id, q]) => h('li', h('span.ti-art', svgFrag(item(BY_ID[id].art))), h('span', t(`m.${id}`)), h('b.mono', `×${q}`)))),
      h('ul.done-flags', pe.flags.map((on, i) => h('li', { class: on ? 'on' : '' }, h('i', String(i + 1)), t(`habit.${i + 1}`))))) : h('p.st-pick', t('st.pick')));

  const week = [...Array(7)].map((_, i) => view.byDate[addDays(view.today, -i)]).filter(Boolean);
  let weekLine;
  if (!week.length) weekLine = t('st.week.none');
  else {
    const counts = [0, 1, 2, 3].map((i) => week.filter((e) => e.flags[i]).length);
    const max = Math.max(...counts);
    weekLine = max === 0 ? t('st.week.clean', { c: week.length }) : t('st.week', { c: week.length, h: t(`habit.${counts.indexOf(max) + 1}`) });
  }

  const alive = view.streak > 0 && !view.todayEntry ? h('p.st-alive', svgFrag(glyph.warn()), h('span', t('st.alive')), h('a', { href: url('/check-in') }, t('hb.today.cta'))) : null;
  requestAnimationFrame(() => { roll.scrollLeft = roll.scrollWidth; });
  return h('div', h('h2', t('st.h2')), h('p.lede', t('st.p')), stats, alive, roll, h('p.st-week', weekLine), detail);
}

const statTile = (v, label, cls = '') => h('div.st-stat', { class: cls }, h('b', String(v)), h('span', label));

// ---------------------------------------------------------------- Check-Up
function checkupPanel() {
  const p = view.profile;
  const age = p.age ?? 0;
  const risk = p.risks.ht || p.risks.dm;
  return h('div.cu',
    h('div.cu-main',
      h('h2', t('cu.h2')),
      h('p.lede', t('cu.p')),
      h('fieldset.cu-field', h('legend', t('cu.age')),
        h('div.chips', { role: 'radiogroup' }, [0, 1, 2].map((i) => h('button.chip', {
          type: 'button', role: 'radio', 'aria-checked': String(age === i), onclick: () => ledger.updateProfile({ age: i }),
        }, t(`cu.age.${i}`))))),
      h('fieldset.cu-field', h('legend', t('cu.risk')),
        h('div.chips',
          h('label.switch', h('input', { type: 'checkbox', checked: p.risks.ht || null, onchange: (e) => ledger.updateProfile({ risks: { ...p.risks, ht: e.target.checked } }) }), t('cu.risk.ht')),
          h('label.switch', h('input', { type: 'checkbox', checked: p.risks.dm || null, onchange: (e) => ledger.updateProfile({ risks: { ...p.risks, dm: e.target.checked } }) }), t('cu.risk.dm')))),
      h('div.cu-result.card',
        h('span.cu-art', svgFrag(props.doctor())),
        h('div', h('b.cu-res-h', t('cu.res.h')), h('p', t(`cu.res.${age}`)), risk ? h('p.cu-risk', t('cu.res.risk')) : null, h('a.cite', { href: url('/sources#sE') }, '[E]'))),
      h('p.cu-sym', svgFrag(glyph.warn()), h('span', t('cu.sym')))),
    h('aside.cu-steps.card',
      h('div.cu-phone', svgFrag(props.phone())),
      h('h3', t('cu.steps.h')),
      h('ol', [1, 2, 3, 4].map((i) => h('li', t(`cu.step.${i}`)))),
      h('p.cu-note', t('cu.note')),
      h('button.btn', {
        type: 'button', class: p.booked ? 'teal' : '',
        onclick: () => ledger.updateProfile({ booked: p.booked ? null : Date.now() }),
        'aria-pressed': String(!!p.booked),
      }, p.booked ? svgFrag(glyph.seal()) : null, h('span', p.booked ? t('cu.marked') : t('cu.mark')))));
}

// ---------------------------------------------------------------- Streak Card
let cardCanvas = null;
let nameTimer = 0;

function streakPanel() {
  cardCanvas = h('canvas.sc-canvas', { width: 1080, height: 1350, role: 'img', 'aria-label': `${t('sc.h2')}: ${view.streak}` });
  const shares = view.profile.shares.length;
  const input = h('input#scName', { type: 'text', maxlength: '16', autocomplete: 'nickname', placeholder: t('sc.name.ph'), value: view.profile.name });
  input.addEventListener('input', () => {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(async () => { await ledger.updateProfile({ name: input.value }); }, 350);
  });
  const panel = h('div.sc',
    h('div.sc-preview', cardCanvas),
    h('div.sc-side',
      h('h2', t('sc.h2')),
      h('p.lede', t('sc.p')),
      h('label.field', h('span', t('sc.name')), input),
      h('div.sc-actions',
        h('button.btn', { type: 'button', onclick: share }, svgFrag(props.friends()), h('span', t('sc.share'))),
        h('button.btn.ghost', { type: 'button', onclick: download }, h('span', t('sc.download')))),
      h('div.friends', { 'aria-label': t('sc.friends', { n: shares }) },
        [0, 1, 2].map((i) => h('span.friend', { class: i < shares ? 'on' : '' }, String(i + 1))),
        h('span.friends-t', shares >= 3 ? t('sc.done3') : t('sc.friends', { n: shares })))));
  drawCard(cardCanvas, view, { site }).catch(() => {});
  return panel;
}

async function cardFile() {
  await drawCard(cardCanvas, view, { site });
  const blob = await toBlob(cardCanvas);
  return new File([blob], `kidzy-streak-${view.today}.png`, { type: 'image/png' });
}

async function share() {
  const file = await cardFile();
  const text = `${t('sc.text', { n: view.streak })} ${location.origin}/check-in`;
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text, title: 'Kidzy Daily' });
    } else if (navigator.share) {
      await navigator.share({ text, title: 'Kidzy Daily' });
    } else {
      saveFile(file);
      try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
      toast(t('sc.copied'));
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return; // user closed the share sheet
    saveFile(file);
  }
  await ledger.logShare();
  toast(t('sc.shared', { n: Math.min(3, ledger.current().profile.shares.length) }));
}

async function download() {
  saveFile(await cardFile());
  toast(t('sc.copied'));
}

function saveFile(file) {
  const a = h('a', { href: URL.createObjectURL(file), download: file.name });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// ---------------------------------------------------------------- Data
function dataPanel() {
  const yes = (v) => h('span.tag', { class: v ? 'ok' : 'mute' }, v ? t('dt.yes') : t('dt.no'));
  const file = h('input.sr#restoreFile', { type: 'file', accept: 'application/json,.json', onchange: restore });
  return h('div.dt',
    h('div.dt-main',
      h('h2', t('dt.h2')),
      h('p.lede', t('dt.p')),
      h('ul.dt-status.card',
        h('li', h('span', t('dt.idb')), yes(view.persisted.idb)),
        h('li', h('span', t('dt.ls')), yes(view.persisted.ls)),
        h('li', h('span', t('dt.persist')), h('span#persistTag', yes(false))),
        h('li', h('span', t('dt.code')), h('b.mono', view.code || '—'))),
      h('p', t('dt.backup.p')),
      h('div.sc-actions',
        h('button.btn', { type: 'button', onclick: backup }, h('span', t('dt.backup'))),
        h('label.btn.ghost', { for: 'restoreFile' }, h('span', t('dt.restore'))), file)),
    h('aside.dt-how.card',
      h('span.dt-seal', svgFrag(glyph.seal())),
      h('h3', t('dt.how.h')),
      h('ol', [1, 2, 3, 4].map((i) => h('li', t(`dt.how.${i}`)))),
      h('p.dt-limit', t('dt.how.limit'))));
}

async function paintPersist() {
  const el = $('#persistTag');
  if (!el) return;
  let ok = false;
  try { ok = !!(navigator.storage && await navigator.storage.persisted()); } catch { /* unsupported */ }
  el.replaceChildren(h('span.tag', { class: ok ? 'ok' : 'mute' }, ok ? t('dt.yes') : t('dt.no')));
}

async function backup() {
  const blob = await ledger.exportBackup();
  saveFile(new File([blob], `kidzy-daily-backup-${view.today}.json`, { type: 'application/json' }));
}

async function restore(e) {
  const f = e.target.files?.[0];
  e.target.value = '';
  if (!f) return;
  if (f.size > 2_000_000) { toast(t('dt.bad.format')); return; }
  const res = await ledger.inspectBackup(await f.text());
  if (!res.ok) { toast(t(`dt.bad.${res.reason}`)); return; }
  if (view.total && !confirm(t('dt.confirm', { n: view.total, m: res.count }))) return;
  await ledger.restoreBackup(res.backup);
  toast(t('dt.ok', { n: res.count, s: ledger.current().streak }));
}

// ---------------------------------------------------------------- render
function render() {
  renderTabs();
  renderNotices();
  const panel = { silent: silentPanel, checkup: checkupPanel, streak: streakPanel, data: dataPanel }[tab]();
  $('#panels').replaceChildren(h('section.me-panel', { role: 'tabpanel', id: `p-${tab}`, 'aria-labelledby': `t-${tab}` }, panel));
  if (tab === 'data') paintPersist();
  apply(document);
  reveal();
}

onLang(render);
addEventListener('hashchange', () => { const k = location.hash.slice(1); if (TABS.includes(k) && k !== tab) { tab = k; render(); } });
ledger.subscribe((v) => {
  view = v;
  // keep focus and caret in the nickname field while typing
  if (tab === 'streak' && document.activeElement?.id === 'scName') { drawCard(cardCanvas, view, { site }).catch(() => {}); return; }
  render();
});

(async () => {
  view = await ledger.load();
  render();
})();
