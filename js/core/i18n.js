// Two languages, English first (matches the video's VO), Indonesian on toggle.
// Strings may use two tiny inline marks, rendered safely as DOM (never innerHTML):
//   **text** → highlighted marker      __text__ → rose accent
// and {placeholders} filled from vars.

import en from '../lang/en.js';
import id from '../lang/id.js';
import { getPrefs, setPrefs } from './store.js';

const DICTS = { en, id };
const listeners = new Set();

function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && DICTS[q]) { setPrefs({ lang: q }); return q; }
  const p = getPrefs().lang;
  return DICTS[p] ? p : 'en';
}

let lang = initialLang();
document.documentElement.lang = lang;

export const getLang = () => lang;

export function setLang(next) {
  if (!DICTS[next] || next === lang) return;
  lang = next;
  setPrefs({ lang });
  document.documentElement.lang = lang;
  apply(document);
  listeners.forEach((fn) => fn(lang));
}

export const onLang = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function t(key, vars) {
  let s = DICTS[lang][key];
  if (s == null) s = DICTS.en[key];
  if (s == null) { console.warn('[i18n] missing', key); return key; }
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  return s;
}

/** Build a DocumentFragment from a translated string with ** and __ marks. */
export function rich(key, vars) {
  const s = t(key, vars);
  const frag = document.createDocumentFragment();
  for (const part of s.split(/(\*\*[^*]+\*\*|__[^_]+__|\n)/)) {
    if (!part) continue;
    if (part === '\n') { frag.append(document.createElement('br')); continue; }
    if (part.startsWith('**')) { const m = document.createElement('span'); m.className = 'mark'; m.textContent = part.slice(2, -2); frag.append(m); }
    else if (part.startsWith('__')) { const m = document.createElement('span'); m.className = 'hl-rose'; m.textContent = part.slice(2, -2); frag.append(m); }
    else frag.append(document.createTextNode(part));
  }
  return frag;
}

/** Fill [data-i18n] (rich text) and [data-i18n-attr="attr:key;attr:key"] under root. */
export function apply(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.replaceChildren(rich(el.dataset.i18n));
  }
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map((x) => x.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
  const title = document.querySelector('meta[name="kidzy-title"]');
  if (title) document.title = t(title.content);
}

export function fmtNum(n, opts) {
  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', opts).format(n);
}

export function fmtDate(d, opts = { weekday: 'long', day: 'numeric', month: 'long' }) {
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', opts).format(d);
}
