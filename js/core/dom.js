// Tiny DOM helpers. Every piece of user or stored text goes through textContent,
// never innerHTML, so nothing typed into the app can become markup.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const SVG_NS = 'http://www.w3.org/2000/svg';

/** h('div.card#id', {onclick, 'aria-label': ..., dataset: {...}, style: {...}}, ...children) */
export function h(tag, props, ...kids) {
  if (props == null || typeof props !== 'object' || props instanceof Node || Array.isArray(props)) {
    if (props != null) kids.unshift(props);
    props = {};
  }
  const m = tag.match(/^([a-z0-9-]+)?((?:[.#][\w-]+)*)$/i);
  const name = (m && m[1]) || 'div';
  const isSvg = props.svg || ['svg', 'g', 'path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'defs', 'clipPath', 'use'].includes(name);
  const el = isSvg ? document.createElementNS(SVG_NS, name) : document.createElement(name);
  if (m && m[2]) {
    for (const part of m[2].match(/[.#][\w-]+/g)) {
      if (part[0] === '.') el.classList.add(part.slice(1));
      else el.id = part.slice(1);
    }
  }
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false || k === 'svg') continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith('--')) el.style.setProperty(sk, sv); // custom properties need setProperty
        else el.style[sk] = sv;
      }
    }
    else if (k === 'class') el.classList.add(...String(v).split(/\s+/).filter(Boolean));
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.append(svgFrag(v)); // trusted, app-authored SVG markup only
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  append(el, kids);
  return el;
}

function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}

/** Parse app-authored SVG/HTML strings (from js/art.js). Never pass user data here. */
export function svgFrag(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup;
  return t.content;
}

export function clear(el) { while (el.firstChild) el.firstChild.remove(); return el; }

export function toast(msg) {
  let el = $('.toast');
  if (!el) { el = h('div.toast', { role: 'status', 'aria-live': 'polite' }); document.body.append(el); }
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 2600);
}

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Count a number up/down inside an element. */
export function roll(el, to, { dur = 700, fmt = (n) => Math.round(n).toLocaleString() } = {}) {
  const from = Number(el.dataset.v || 0);
  el.dataset.v = to;
  if (reduceMotion()) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Local calendar date as YYYY-MM-DD. */
export const dayKey = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};
export const addDays = (key, n) => {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
};
export const keyToDate = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
