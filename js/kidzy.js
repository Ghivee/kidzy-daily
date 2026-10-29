// Kidzy controller: mounts the mascot, changes mood, and gives it a body.
// Virtual-pet behaviour: eyes follow the pointer, the mouth opens as food comes
// close, it chews (cheeks puff, crumbs fall), giggles when poked, laughs when
// tickled, and yawns when nobody has played with it for a while.
// State lives as classes on the host element, so it survives mood re-renders.

import { kidzy } from './art.js';
import { h, svgFrag, reduceMotion } from './core/dom.js';

const live = new Set();

export function mountKidzy(host, { mood = 'happy', hat = false, arms = false, float = true, label = '' } = {}) {
  host.classList.add('kz-host');
  const timers = {};
  const later = (key, ms, fn) => { clearTimeout(timers[key]); timers[key] = setTimeout(fn, ms); };

  const ctl = {
    host,
    mood,
    busy: false,
    render() {
      host.querySelector('svg.kidzy')?.remove();
      host.prepend(svgFrag(kidzy({ mood: ctl.mood, hat, arms })));
      ctl.el = host.querySelector('svg.kidzy');
      if (float) ctl.el.classList.add('float');
      if (label) { ctl.el.setAttribute('aria-label', label); ctl.el.removeAttribute('aria-hidden'); }
    },
    setMood(m) {
      if (m === ctl.mood) return;
      ctl.mood = m;
      ctl.render();
    },
    setLabel(text) { label = text; ctl.el?.setAttribute('aria-label', text); ctl.el?.removeAttribute('aria-hidden'); },

    /** Point (viewport px) where food should go. */
    mouthPoint() {
      const r = host.getBoundingClientRect();
      return { x: r.left + r.width * 0.46, y: r.top + r.height * 0.63 };
    },
    /** 0 = closed, 1 = wide open. */
    openTo(v) {
      const k = Math.max(0, Math.min(1, v));
      host.style.setProperty('--open', k.toFixed(2));
      host.classList.toggle('is-open', k > 0.04);
      if (k > 0.04) ctl.poke?.reset();
    },
    /** Open wider the closer (x, y) gets to the mouth. */
    sniff(x, y, reach = 260) {
      const m = ctl.mouthPoint();
      const d = Math.hypot(x - m.x, y - m.y);
      ctl.openTo((reach - d) / (reach * 0.7));
    },
    bump() {
      const b = ctl.el?.querySelector('.k-body');
      if (!b || reduceMotion()) return;
      b.classList.remove('squish');
      void b.getBoundingClientRect();
      b.classList.add('squish');
    },
    /** Gulp, then chew for `ms`. crumbs = colour of the bits that fall. */
    chew({ ms = 1100, crumbs = '#f0a531' } = {}) {
      ctl.openTo(0);
      ctl.bump();
      host.classList.remove('is-giggle', 'is-yawn');
      host.classList.add('is-chewing');
      if (!reduceMotion()) for (let i = 0; i < 6; i++) setTimeout(() => crumb(crumbs), 80 + i * 140);
      return new Promise((res) => later('chew', ms, () => { host.classList.remove('is-chewing'); res(); }));
    },
    giggle(ms = 900) {
      host.classList.remove('is-yawn', 'is-chewing');
      host.classList.add('is-giggle');
      ctl.bump();
      later('giggle', ms, () => host.classList.remove('is-giggle'));
    },
    laugh() {
      host.classList.add('is-laugh');
      ctl.giggle(1600);
      later('laugh', 1600, () => host.classList.remove('is-laugh'));
    },
    yawn() {
      if (host.classList.contains('is-open') || host.classList.contains('is-chewing')) return;
      host.classList.add('is-yawn');
      later('yawn', 1900, () => host.classList.remove('is-yawn'));
    },
    destroy() { live.delete(ctl); Object.values(timers).forEach(clearTimeout); },
  };

  function crumb(color) {
    const m = ctl.mouthPoint();
    const r = host.getBoundingClientRect();
    const c = h('i.kz-crumb', { 'aria-hidden': 'true' });
    c.style.left = `${m.x - r.left + (Math.random() - 0.5) * r.width * 0.18}px`;
    c.style.top = `${m.y - r.top}px`;
    c.style.background = color;
    c.style.setProperty('--dx', `${(Math.random() - 0.5) * 60}px`);
    host.append(c);
    setTimeout(() => c.remove(), 900);
  }

  ctl.render();
  live.add(ctl);
  return ctl;
}

/**
 * Make Kidzy pettable. Tap = poke (giggle), rub back and forth = tickle (laugh),
 * no interaction for a while = yawn. Callbacks let the page say something.
 */
export function makePettable(ctl, { onPoke, onTickle, onYawn, idleMs = 14000 } = {}) {
  const host = ctl.host;
  host.classList.add('pettable');
  host.setAttribute('tabindex', '0');
  host.setAttribute('role', 'button');
  let down = false, travel = 0, lx = 0, ly = 0, tickled = false, idle = 0;
  const resetIdle = () => {
    clearTimeout(idle);
    idle = setTimeout(function nap() {
      if (!host.isConnected) return; // re-rendered away: stop napping
      if (document.visibilityState === 'visible') { ctl.yawn(); onYawn?.(); }
      idle = setTimeout(nap, idleMs * 1.6);
    }, idleMs);
  };
  ctl.poke = { reset: resetIdle };
  host.addEventListener('pointerdown', (e) => {
    down = true; travel = 0; tickled = false; lx = e.clientX; ly = e.clientY;
    host.setPointerCapture?.(e.pointerId);
    resetIdle();
  });
  host.addEventListener('pointermove', (e) => {
    if (!down) return;
    travel += Math.hypot(e.clientX - lx, e.clientY - ly);
    lx = e.clientX; ly = e.clientY;
    if (!tickled && travel > 160) { tickled = true; ctl.laugh(); onTickle?.(); }
  });
  const up = () => {
    if (!down) return;
    down = false;
    if (!tickled && travel < 12) { ctl.giggle(); onPoke?.(); }
  };
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', () => { down = false; });
  host.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ctl.giggle(); onPoke?.(); resetIdle(); }
  });
  resetIdle();
}

let raf = 0;
let px = innerWidth / 2;
let py = innerHeight / 3;

function track() {
  raf = 0;
  for (const k of live) {
    if (!k.el || !k.el.isConnected) { live.delete(k); continue; }
    const r = k.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const dx = px - (r.left + r.width * 0.46);
    const dy = py - (r.top + r.height * 0.43);
    const d = Math.hypot(dx, dy) || 1;
    const m = Math.min(5.5, d / 40);
    const p = k.el.querySelector('.k-pupil');
    if (p) p.style.transform = `translate(${(dx / d) * m}px, ${(dy / d) * m}px)`;
  }
}

/** Make every Kidzy look at a point (e.g. food flying in). */
export function lookAt(x, y) { px = x; py = y; if (!raf) raf = requestAnimationFrame(track); }

addEventListener('pointermove', (e) => lookAt(e.clientX, e.clientY), { passive: true });
addEventListener('pointerdown', (e) => lookAt(e.clientX, e.clientY), { passive: true });
