import { h, $, svgFrag, clear } from '../core/dom.js';
import { t, apply, onLang } from '../core/i18n.js';
import { shell, reveal, url } from '../core/shell.js';
import * as ledger from '../core/ledger.js';
import { mountKidzy } from '../kidzy.js';
import { item, props, symptom } from '../art.js';

shell('habits');

// Script order. Each data card carries the source number shown in the video.
const HABITS = [
  { n: 1, art: 'bottle', prop: true, mood: 'happy', cards: [['d1', '13']], stamp: 'rc.low', color: 'teal' },
  { n: 2, art: 'soda', mood: 'sweaty', cards: [['d1', '12'], ['d2', '10'], ['d3', '5']], stamp: 'rc.over', color: 'amber' },
  { n: 3, art: 'mie', mood: 'sweaty', cards: [['d1', '18'], ['d2', '3'], ['d3', '21']], stamp: 'rc.over', color: 'rose' },
  { n: 4, art: 'ibu', mood: 'tired', cards: [['d1', '9'], ['d2', '22'], ['d3', '23']], stamp: 'rc.taken', color: 'ink' },
];

let view = null;

function renderToday() {
  const el = $('#today');
  const e = view?.todayEntry;
  clear(el);
  const kz = h('div.today-kz');
  el.append(kz,
    h('div',
      h('p.today-line', e ? t('hb.today.done', { n: e.count }) : t('hb.today.none')),
      h('div.today-dots', [0, 1, 2, 3].map((i) => h('span', { class: e ? (e.flags[i] ? 'on' : 'off') : 'unk', title: t(`habit.${i + 1}`) }, String(i + 1)))),
      h('a.btn.small', { href: url('/check-in') }, h('span', e ? t('done.redo') : t('hb.today.cta')))));
  const mood = e ? ['happy', 'ok', 'sweaty', 'tired', 'tired'][e.count] : 'ok';
  mountKidzy(kz, { mood, float: false, label: t(`mood.${mood}`) });
}

function renderJump() {
  $('#jump').replaceChildren(...HABITS.map((hb) => h('a', { href: `#h${hb.n}` }, h('b.mono', `0${hb.n}`), h('span', t(`hb.${hb.n}.t`)))));
}

function chapter(hb) {
  const e = view?.todayEntry;
  const flagged = e ? e.flags[hb.n - 1] : null;
  const flip = h('div.flip', { 'aria-pressed': 'false' },
    h('div.flip-in',
      h('div.flip-face.flip-front',
        h('div.data-tiles', hb.cards.map(([k, src]) => h('div.data-tile',
          h('b', t(`hb.${hb.n}.${k}`)),
          h('span', t(`hb.${hb.n}.${k}s`)),
          h('span.mono.tile-src', `[${src}]`)))),
        h('button.flip-btn', { type: 'button', onclick: () => toggle(flip) }, t('hb.flip'))),
      h('div.flip-face.flip-back',
        h('p', t(`hb.${hb.n}.back`)),
        h('p.src-links', h('span', `${t('hb.source')}: `), hb.cards.map(([, src]) => h('a.cite', { href: url(`/sources#s${src}`) }, `[${src}]`))),
        h('button.flip-btn', { type: 'button', onclick: () => toggle(flip) }, t('hb.flipback')))));

  return h('section.habit', { id: `h${hb.n}`, class: `c-${hb.color}` },
    h('div.wrap.habit-grid',
      h('div.habit-side', { 'data-reveal': '' },
        h('span.habit-num', `0${hb.n}`),
        h('div.habit-art',
          h('span.habit-item', svgFrag(hb.prop ? props[hb.art]() : item(hb.art))),
          h('span.habit-kz', { 'data-mood': hb.mood }))),
      h('div.habit-body',
        h('p.kicker', { 'data-reveal': '' }, t(`habit.short.${hb.n}`)),
        h('h2', { 'data-reveal': '' }, t(`hb.${hb.n}.t`)),
        h('p.habit-p', { 'data-reveal': '' }, t(`hb.${hb.n}.p`)),
        h('div.fix', { 'data-reveal': '' }, h('b', t('hb.fix')), h('p', t(`hb.${hb.n}.fix`))),
        h('div.ask', { 'data-reveal': '' },
          h('span.ask-q', h('b', `${t('hb.ask')}: `), t(`hb.${hb.n}.q`)),
          flagged == null
            ? h('a.tag.mute', { href: url('/check-in') }, t('hb.ans.unknown'))
            : h('span.tag', { class: flagged ? 'hot' : 'ok' }, flagged ? t(hb.stamp) : t('rc.ok'))),
        h('div', { 'data-reveal': '' }, flip))));
}

function toggle(flip) {
  const on = flip.getAttribute('aria-pressed') !== 'true';
  flip.setAttribute('aria-pressed', String(on));
  const face = flip.querySelector(on ? '.flip-back .flip-btn' : '.flip-front .flip-btn');
  setTimeout(() => face?.focus({ preventScroll: true }), 50);
}

function renderChapters() {
  $('#chapters').replaceChildren(...HABITS.map(chapter));
  for (const el of document.querySelectorAll('.habit-kz')) mountKidzy(el, { mood: el.dataset.mood, float: true });
}

function renderSymptoms() {
  $('#sym').replaceChildren(...['tired', 'swollen', 'blood'].map((k, i) => h('div.sym.card', { 'data-reveal': '', style: { '--d': `${i * 0.08}s` } },
    h('span.sym-art', svgFrag(symptom[k]())), h('b', t(`hb.sym.${i + 1}`)))));
}

function render() {
  renderToday();
  renderJump();
  renderChapters();
  renderSymptoms();
  apply(document);
  reveal();
}

onLang(render);
ledger.subscribe((v) => { view = v; render(); });

(async () => {
  view = await ledger.load();
  render();
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
})();
