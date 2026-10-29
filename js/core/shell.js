// Shared page chrome: top bar, phone dock, footer, language + theme toggles, scroll reveals.

import { h, $, $$, svgFrag } from './dom.js';
import { t, apply, getLang, setLang, onLang } from './i18n.js';
import { getPrefs, setPrefs } from './store.js';
import { brandMark, glyph } from '../art.js';

const LINKS = [
  { href: '/', key: 'nav.story', g: 'story', page: 'home' },
  { href: '/check-in', key: 'nav.checkin', g: 'checkin', page: 'checkin' },
  { href: '/habits', key: 'nav.habits', g: 'habits', page: 'habits' },
  { href: '/me', key: 'nav.me', g: 'me', page: 'me' },
  { href: '/sources', key: 'nav.sources', g: 'sources', page: 'sources' },
];

// Clean URLs work on Vercel; when opened from disk, fall back to *.html files.
export const url = (href) => {
  if (location.protocol !== 'file:') return href;
  const [path, hash = ''] = href.split('#');
  const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
  return file + (hash ? `#${hash}` : '');
};

const THEMES = ['auto', 'light', 'dark'];

function applyTheme(theme) {
  if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
}

function themeButton() {
  const b = h('button.theme-btn', { type: 'button' });
  const paint = () => {
    const th = getPrefs().theme || 'auto';
    b.replaceChildren(svgFrag(glyph[th === 'light' ? 'sun' : th === 'dark' ? 'moon' : 'auto']()));
    b.setAttribute('aria-label', t(`theme.${th}`));
    b.title = t(`theme.${th}`);
  };
  b.addEventListener('click', () => {
    const cur = getPrefs().theme || 'auto';
    const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
    setPrefs({ theme: next });
    applyTheme(next);
    paint();
  });
  onLang(paint);
  paint();
  return b;
}

function langToggle() {
  const wrap = h('div.pill-toggle', { role: 'group', 'data-i18n-attr': 'aria-label:a11y.lang' });
  const mk = (code) => h('button', { type: 'button', 'aria-pressed': String(getLang() === code), lang: code, onclick: () => setLang(code) }, code.toUpperCase());
  const en = mk('en');
  const id = mk('id');
  wrap.append(en, id);
  onLang((l) => { en.setAttribute('aria-pressed', String(l === 'en')); id.setAttribute('aria-pressed', String(l === 'id')); });
  return wrap;
}

export function shell(page) {
  const top = $('[data-shell="top"]');
  if (top) {
    top.classList.add('topbar');
    top.replaceChildren(
      h('a.skip', { href: '#main', 'data-i18n': 'a11y.skip' }),
      h('div.wrap',
        h('a.brand', { href: url('/'), 'aria-label': 'Kidzy Daily' }, svgFrag(brandMark()), h('span', 'Kidzy ', h('b', 'Daily'))),
        h('nav.nav', { 'data-i18n-attr': 'aria-label:a11y.nav' },
          LINKS.map((l) => h('a', { href: url(l.href), 'aria-current': l.page === page ? 'page' : null, 'data-i18n': l.key }))),
        h('div.tools', langToggle(), themeButton()),
      ),
    );
    const dock = h('nav.dock', { 'data-i18n-attr': 'aria-label:a11y.nav' },
      LINKS.map((l) => h('a', { href: url(l.href), 'aria-current': l.page === page ? 'page' : null }, svgFrag(glyph[l.g]()), h('span', { 'data-i18n': `dock.${l.g}` }))));
    document.body.append(dock);
    const onScroll = () => top.classList.toggle('is-stuck', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const foot = $('[data-shell="foot"]');
  if (foot) {
    foot.classList.add('foot');
    foot.replaceChildren(h('div.wrap',
      h('div',
        h('p.tag', { 'data-i18n': 'foot.tag' }),
        h('p', { 'data-i18n': 'foot.note' }),
        h('p', { 'data-i18n': 'foot.privacy' })),
      h('nav', { 'data-i18n-attr': 'aria-label:a11y.footnav' },
        LINKS.map((l) => h('a', { href: url(l.href), 'data-i18n': l.key }))),
    ));
  }

  // Fix in-page links for file:// usage
  if (location.protocol === 'file:') {
    for (const a of $$('a[href^="/"]')) a.setAttribute('href', url(a.getAttribute('href')));
  }

  apply(document);
  reveal();
}

export function reveal(root = document) {
  const els = $$('[data-reveal]:not(.in)', root);
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

/** Run fn once when el scrolls into view. */
export function onVisible(el, fn, threshold = 0.35) {
  if (!('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { threshold });
  io.observe(el);
}
