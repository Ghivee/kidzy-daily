import { h, $ } from '../core/dom.js';
import { t, apply, onLang } from '../core/i18n.js';
import { shell } from '../core/shell.js';
import { SOURCES } from '../data/sources.js';

shell('sources');

function render() {
  $('#list').replaceChildren(...SOURCES.map((s) => h('li.src', { id: `s${s.n}` },
    h('span.src-n.mono', `[${s.n}]`),
    h('div.src-body',
      h('span.tag.mute', t(`src.used.${s.used}`)),
      h('p.src-fact', s.fact),
      h('p.src-cite', s.cite),
      h('a.src-link', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, t('src.open'), ' ↗')))));
  apply(document);
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) { el.classList.add('hit'); el.scrollIntoView({ block: 'center' }); }
  }
}

onLang(render);
render();
