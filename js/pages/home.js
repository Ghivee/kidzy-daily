import { h, $, svgFrag, roll, reduceMotion } from '../core/dom.js';
import { t, apply, onLang, fmtNum } from '../core/i18n.js';
import { shell, onVisible, reveal, url } from '../core/shell.js';
import { mountKidzy, makePettable, lookAt } from '../kidzy.js';
import { item, props, C } from '../art.js';

shell('home');

// ---------------------------------------------------------------- Scene 1.1: feed Kidzy
const FEED = [
  { k: 'water', kind: 'clean', mood: 'happy' },
  { k: 'esteh', kind: 'sugar', mood: 'ok' },
  { k: 'soda', kind: 'sugar', mood: 'sweaty' },
  { k: 'mie', kind: 'salt', mood: 'sweaty' },
  { k: 'gor', kind: 'salt', mood: 'ok' },
  { k: 'ibu', kind: 'pill', mood: 'tired' },
];
const stage = $('#stage');
const kz = mountKidzy($('#feedKidzy'), { mood: 'happy', arms: true, label: t('mood.happy') });
const say = $('#say');
const tray = $('#tray');
const filteredEl = $('#filtered');
let filtered = 0;
let moodTimer = 0;

for (const f of FEED) {
  const b = h('button.token', { type: 'button', dataset: { k: f.k }, 'aria-label': t(`m.${f.k}`) }, svgFrag(item(f.k)));
  tray.append(b);
  dragOrTap(b, f);
}
onLang(() => tray.querySelectorAll('.token').forEach((b) => b.setAttribute('aria-label', t(`m.${b.dataset.k}`))));

function dragOrTap(btn, f) {
  let ghost = null, sx = 0, sy = 0, moved = false, id = null;
  btn.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
    btn.setPointerCapture(id);
  });
  btn.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) > 8) {
      moved = true;
      const r = btn.getBoundingClientRect();
      ghost = h('div.drag-ghost', { 'aria-hidden': 'true' }, svgFrag(item(f.k)));
      Object.assign(ghost.style, { width: `${r.width}px`, height: `${r.height}px`, left: `${r.left}px`, top: `${r.top}px` });
      document.body.append(ghost);
      btn.classList.add('lifted');
    }
    if (ghost) {
      ghost.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 12}deg) scale(1.15)`;
      kz.sniff(e.clientX, e.clientY); // the closer the food, the wider the mouth
    }
  });
  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    btn.classList.remove('lifted');
    if (!moved) return; // a tap is handled by click
    const m = kz.mouthPoint();
    const reach = kz.host.getBoundingClientRect().width * 0.5;
    const hit = Math.hypot(e.clientX - m.x, e.clientY - m.y) < reach;
    const g = ghost; ghost = null;
    if (hit) {
      g.animate([{ transform: g.style.transform }, { transform: `translate(${m.x - sx}px, ${m.y - sy}px) scale(.1)`, opacity: 0.3 }], { duration: 160, easing: 'ease-in' }).onfinish = () => { g.remove(); feed(f); };
    } else {
      kz.openTo(0);
      g.style.transition = 'transform .35s cubic-bezier(.3,1.5,.5,1)'; g.style.transform = 'none'; setTimeout(() => g.remove(), 360);
    }
  };
  btn.addEventListener('pointerup', end);
  btn.addEventListener('pointercancel', end);
  btn.addEventListener('click', () => { if (!moved) flyIn(btn, f); moved = false; });
}

function flyIn(btn, f) {
  const a = btn.getBoundingClientRect();
  const m = kz.mouthPoint();
  if (reduceMotion()) { feed(f); return; }
  const g = h('div.drag-ghost', { 'aria-hidden': 'true' }, svgFrag(item(f.k)));
  Object.assign(g.style, { width: `${a.width}px`, height: `${a.height}px`, left: `${a.left}px`, top: `${a.top}px` });
  document.body.append(g);
  const dx = m.x - (a.left + a.width / 2);
  const dy = m.y - (a.top + a.height / 2);
  const anim = g.animate([
    { transform: 'none' },
    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) rotate(160deg) scale(1.2)`, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) rotate(330deg) scale(.2)`, opacity: 0.4 },
  ], { duration: 680, easing: 'cubic-bezier(.4,0,.3,1)' });
  // Kidzy watches the food and opens up as it arrives
  (function watch() {
    if (anim.playState !== 'running') return;
    const r = g.getBoundingClientRect();
    lookAt(r.left + r.width / 2, r.top + r.height / 2);
    kz.sniff(r.left + r.width / 2, r.top + r.height / 2, 320);
    requestAnimationFrame(watch);
  })();
  anim.onfinish = () => { g.remove(); feed(f); };
}

const CRUMB = { clean: C.teal2, sugar: C.amber2, salt: '#f7f2ea', pill: C.rose2 };

function speak(text) {
  say.replaceChildren(text);
  say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
}

async function feed(f) {
  speak(t('home.feed.nom'));
  filtered += 1;
  roll(filteredEl, filtered, { dur: 300 });
  burst(f.kind);
  clearTimeout(moodTimer);
  await kz.chew({ crumbs: CRUMB[f.kind] });
  kz.setMood(f.mood);
  kz.setLabel(t(`mood.${f.mood}`));
  speak(t(`home.feed.say.${f.k}`));
  if (f.k === 'soda') setTimeout(() => { kz.giggle(700); speak(t('home.feed.burp')); }, 1500);
  moodTimer = setTimeout(() => { kz.setMood('happy'); kz.setLabel(t('mood.happy')); }, 3200);
}

let pokes = 0;
makePettable(kz, {
  onPoke: () => speak(t(`home.pet.poke${(pokes++ % 3) + 1}`)),
  onTickle: () => speak(t('home.pet.tickle')),
  onYawn: () => speak(t('home.pet.yawn')),
});

// particle filter: everything enters Kidzy; clean water exits left-bottom, waste right-bottom
const fx = $('#fx');
const ctx = fx.getContext('2d');
let parts = [];
let W = 0, H = 0, dpr = 1;
function sizeFx() {
  const r = stage.getBoundingClientRect();
  dpr = Math.min(2, devicePixelRatio || 1);
  W = r.width; H = r.height;
  fx.width = W * dpr; fx.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
new ResizeObserver(sizeFx).observe(stage);
sizeFx();

function center() {
  const s = stage.getBoundingClientRect();
  const k = kz.host.getBoundingClientRect();
  return { x: k.left - s.left + k.width * 0.48, y: k.top - s.top + k.height * 0.5, w: k.width };
}
const KIND = {
  clean: { waste: 0, col: C.amber },
  sugar: { waste: 0.55, col: C.amber2 },
  salt: { waste: 0.55, col: C.white },
  pill: { waste: 0.65, col: C.rose2 },
};
function spawn(kind, n) {
  const c = center();
  for (let i = 0; i < n; i++) {
    const waste = Math.random() < KIND[kind].waste;
    parts.push({
      x: c.x + (Math.random() - 0.5) * c.w * 0.5, y: c.y + (Math.random() - 0.5) * c.w * 0.35,
      vx: (waste ? 1 : -1) * (0.6 + Math.random() * 1.4), vy: 0.6 + Math.random() * 1.6,
      r: waste ? 2.2 + Math.random() * 2.4 : 2.6 + Math.random() * 3,
      col: waste ? (kind === 'salt' ? '#f7f2ea' : kind === 'pill' ? C.rose2 : C.amber) : C.teal2,
      life: 0, max: 70 + Math.random() * 50, waste,
    });
  }
}
function burst(kind) { if (!reduceMotion()) spawn(kind, 46); }
let ambient = 0;
function tick() {
  ctx.clearRect(0, 0, W, H);
  if (!reduceMotion() && ++ambient % 14 === 0) spawn('clean', 1);
  parts = parts.filter((p) => p.life < p.max);
  for (const p of parts) {
    p.life++;
    p.vy += 0.035;
    p.x += p.vx; p.y += p.vy;
    const a = 1 - p.life / p.max;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.col;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (p.waste) ctx.rect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    else ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------------------------------------------------------------- Scene 1.2–1.3: meet Kidzy
const meetKz = mountKidzy($('#meetKidzy'), { mood: 'happy', arms: true, label: 'Kidzy' });
const meetSay = $('#meetSay');
const meetSpeak = (key) => { meetSay.replaceChildren(t(key)); meetSay.classList.remove('pop'); void meetSay.offsetWidth; meetSay.classList.add('pop'); };
let meetPokes = 0;
makePettable(meetKz, {
  onPoke: () => meetSpeak(`home.pet.poke${(meetPokes++ % 3) + 1}`),
  onTickle: () => meetSpeak('home.pet.tickle'),
  onYawn: () => meetSpeak('home.pet.yawn'),
  idleMs: 20000,
});
const clockEl = $('#clock');
function clock() {
  const n = new Date();
  const s = n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
  const z = (x) => String(x).padStart(2, '0');
  clockEl.textContent = `${z(Math.floor(s / 3600))}:${z(Math.floor((s % 3600) / 60))}:${z(s % 60)}`;
}
clock();
setInterval(clock, 1000);

const notes = $('#notes');
const TILT = [-4, 3, -2, 5];
for (let i = 1; i <= 4; i++) {
  const b = h('button.note', { type: 'button', 'aria-pressed': 'false', style: { '--tilt': `${TILT[i - 1]}deg`, '--d': `${i * 0.08}s` }, 'data-reveal': '' },
    h('span.note-in',
      h('span.note-face.front', h('span', { 'data-i18n': `home.room.n${i}` }), h('em', { 'data-i18n': 'home.room.sign' })),
      h('span.note-face.back', h('span', { 'data-i18n': `home.room.r${i}` }))));
  b.addEventListener('click', () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')));
  notes.append(b);
}

// ---------------------------------------------------------------- Scene 1.4: quiet numbers
const deaths = $('#deaths');
deaths.dataset.v = 0; deaths.textContent = '0';
onVisible(deaths, () => roll(deaths, 42000, { dur: 1600, fmt: (n) => `${fmtNum(Math.round(n / 100) * 100)}+` }));

const dots = $('#dots');
onVisible(dots, () => drawDots(true), 0.2);
new ResizeObserver(() => drawDots(false)).observe(dots);
let dotsShown = false;
function drawDots(animate) {
  if (animate) dotsShown = true;
  if (!dotsShown) return;
  const N = 420;
  const w = dots.clientWidth;
  const cols = w < 520 ? 21 : 42;
  const rows = Math.ceil(N / cols);
  const cell = w / cols;
  const r = Math.max(2.4, cell * 0.3);
  const d = Math.min(2, devicePixelRatio || 1);
  dots.height = rows * cell * d; dots.width = w * d;
  dots.style.height = `${rows * cell}px`;
  const c = dots.getContext('2d');
  c.setTransform(d, 0, 0, d, 0, 0);
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
  let i = 0;
  const paint = (upTo) => {
    for (; i < upTo; i++) {
      const x = (i % cols) * cell + cell / 2, y = Math.floor(i / cols) * cell + cell / 2;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
      c.fillStyle = i % 37 === 0 ? C.rose : ink;
      c.globalAlpha = i % 37 === 0 ? 1 : 0.78;
      c.fill();
    }
  };
  if (!animate || reduceMotion()) { paint(N); return; }
  const t0 = performance.now();
  const step = (tm) => { paint(Math.min(N, Math.floor(((tm - t0) / 1800) * N))); if (i < N) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// ---------------------------------------------------------------- Scene 2
const WHAT = [['sieve', 1], ['scale', 2], ['gauge', 3]];
$('#whatGrid').append(...WHAT.map(([p, i]) => h('article.what-card.card', { 'data-reveal': '', style: { '--d': `${i * 0.08}s` } },
  h('div.what-art', { class: `art-${p}` }, svgFrag(props[p]())),
  h('h3', { 'data-i18n': `home.what.${i}.t` }),
  h('p', { 'data-i18n': `home.what.${i}.p` }),
  h('a.cite', { href: url('/sources#sD') }, '[D]'))));

const hd = $('#hd');
hd.dataset.v = 0; hd.textContent = '0';
onVisible(hd, () => roll(hd, 134057, { dur: 1600, fmt: (n) => fmtNum(Math.round(n)) }));
const cost = $('#cost');
cost.dataset.v = 0; cost.textContent = '0';
onVisible(cost, () => roll(cost, 11, { dur: 1200 }));
onVisible($('#young'), () => $('#young').classList.add('grow'));

// ---------------------------------------------------------------- Scene 3: steps rail
const STEPS = [
  ['checkin', '/check-in', 'bottle'], ['checkin', '/check-in', 'esteh'], ['checkin', '/check-in', 'printer'],
  ['checkin', '/check-in', 'fruit'], ['me', '/me#silent', 'note'], ['me', '/me#checkup', 'doctor'], ['me', '/me#streak', 'friends'],
];
$('#rail').append(...STEPS.map(([, href, art], i) => h('a.step', { href: url(href) },
  h('span.step-n.mono', String(i + 1).padStart(2, '0')),
  h('span.step-art', svgFrag(props[art] ? props[art]() : item(art))),
  h('b', { 'data-i18n': `home.step.${i + 1}.t` }),
  h('span', { 'data-i18n': `home.step.${i + 1}.p` }))));

// ---------------------------------------------------------------- Scene 7–8
const ACTIONS = [['phone', 'home.end.a1', '/check-in', 'home.end.go'], ['doctor', 'home.end.a2', '/me#checkup', 'home.end.book'], ['friends', 'home.end.a3', '/me#streak', 'home.end.share']];
$('#actions').append(...ACTIONS.map(([art, key, href, cta], i) => h('li.action', { 'data-reveal': '', style: { '--d': `${i * 0.1}s` } },
  h('span.action-art', svgFrag(props[art]())),
  h('span.action-text', h('b', { 'data-i18n': key }), h('a', { href: url(href), 'data-i18n': cta })))));

mountKidzy($('#endKidzy'), { mood: 'happy', arms: true, label: 'Kidzy' });

function drawQr() {
  const host = $('#qr');
  if (typeof window.qrcode !== 'function') { setTimeout(drawQr, 200); return; }
  const target = (location.protocol.startsWith('http') ? location.origin : 'https://kidzy-daily.vercel.app') + '/check-in';
  const q = window.qrcode(0, 'M');
  q.addData(target);
  q.make();
  const n = q.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  host.replaceChildren(svgFrag(`<svg viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="${C.ink}"/></svg>`));
  host.title = target;
}
drawQr();

// translate nodes created after shell() and observe their reveals
apply(document);
reveal();
