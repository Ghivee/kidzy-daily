// Every illustration in Kidzy Daily is drawn here by hand as SVG.
// No icon fonts, no icon libraries. One line weight, one ink, flat colour blocks.
// Colours are fixed (not theme tokens) so the drawings read the same in light and dark.

const S = '#2a0f1c';
const W = 2.6;
const st = `stroke="${S}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round"`;

export const C = {
  ink: S, rose: '#ee5b6c', rose2: '#f88d98', blush: '#ff9fae', teal: '#1c9c96', teal2: '#7fd6cf', aqua: '#c9f1ec',
  amber: '#f0a531', amber2: '#ffd27a', cream: '#fbf6ea', white: '#ffffff', brown: '#8a4b2a', coffee: '#b97a4f',
  milk: '#f3dcc0', leaf: '#4c9a52', leaf2: '#8fd28f', hot: '#e2412f', grey: '#d8d0d6', rice: '#fffaf0', egg: '#ffd25a',
};

const svg = (inner, vb = '0 0 64 64', extra = '') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" ${extra}>${inner}</svg>`;

// ---------------- menu items (64×64) ----------------
const ITEMS = {
  water: `<path d="M18 12h28l-3.5 42a4 4 0 0 1-4 3.6H25.5a4 4 0 0 1-4-3.6z" fill="${C.white}" ${st}/>
    <path d="M20.6 28h22.8l-2.2 25.5a2.5 2.5 0 0 1-2.5 2.2H25.3a2.5 2.5 0 0 1-2.5-2.2z" fill="${C.teal2}"/>
    <path d="M20.6 28c4-2.6 7.6 2.6 11.4 0s7.6 2.6 11.4 0" fill="none" ${st}/>
    <circle cx="28" cy="40" r="2.2" fill="${C.white}"/><circle cx="35" cy="47" r="1.6" fill="${C.white}"/>
    <path d="M18 12h28" ${st}/>`,
  esteh: `<path d="M17 14h30l-4 41a4 4 0 0 1-4 3.5H25a4 4 0 0 1-4-3.5z" fill="${C.white}" ${st}/>
    <path d="M19.4 24h25.2l-3 31a2.4 2.4 0 0 1-2.4 2H24.8a2.4 2.4 0 0 1-2.4-2z" fill="#c8742b"/>
    <rect x="23" y="27" width="9" height="9" rx="2" fill="${C.aqua}" ${st} transform="rotate(-12 27 31)"/>
    <rect x="33" y="33" width="8" height="8" rx="2" fill="${C.aqua}" ${st} transform="rotate(10 37 37)"/>
    <path d="M40 4l-6 46" stroke="${C.rose}" stroke-width="5" stroke-linecap="round"/><path d="M40 4l-6 46" fill="none" ${st} stroke-width="1.4"/>`,
  kopsu: `<path d="M16 22h32l-4 34a3 3 0 0 1-3 2.6H23a3 3 0 0 1-3-2.6z" fill="${C.white}" ${st}/>
    <path d="M17.6 34h28.8l-2.4 21.7a2 2 0 0 1-2 1.8H22a2 2 0 0 1-2-1.8z" fill="${C.coffee}"/>
    <path d="M18.4 28h27.2l-.7 6H19.1z" fill="${C.milk}"/>
    <path d="M17.6 48h28.8" stroke="${C.brown}" stroke-width="5"/>
    <path d="M14 22c2-9 34-9 36 0z" fill="${C.white}" ${st}/>
    <path d="M37 15l5-12" ${st} stroke-width="4" stroke="${C.ink}"/><path d="M37 15l5-12" stroke="${C.amber2}" stroke-width="1.6" stroke-linecap="round"/>`,
  soda: `<rect x="19" y="9" width="26" height="48" rx="6" fill="${C.hot}" ${st}/>
    <path d="M19 15h26M19 51h26" ${st}/>
    <path d="M19 30c6-6 14 6 26-2v10c-12 8-20-4-26 2z" fill="${C.white}"/>
    <path d="M28 11.5h8" ${st} stroke-width="2"/><circle cx="25" cy="22" r="1.8" fill="${C.white}"/>`,
  boba: `<path d="M16 20h32l-4 36a3 3 0 0 1-3 2.6H23a3 3 0 0 1-3-2.6z" fill="#e9c8a4" ${st}/>
    <circle cx="24" cy="51" r="3" fill="${S}"/><circle cx="31" cy="53" r="3" fill="${S}"/><circle cx="38" cy="51" r="3" fill="${S}"/><circle cx="28" cy="46" r="3" fill="${S}"/><circle cx="35" cy="46" r="3" fill="${S}"/>
    <path d="M17.2 30c8 5 22-4 29.6 0" stroke="#8a4b2a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M14 20h36" ${st}/><path d="M36 20l4-17" stroke="${S}" stroke-width="6" stroke-linecap="round"/>`,
  diet: `<rect x="19" y="9" width="26" height="48" rx="6" fill="${C.grey}" ${st}/>
    <path d="M19 15h26M19 51h26" ${st}/>
    <circle cx="32" cy="33" r="9" fill="${C.white}" ${st}/>
    <text x="32" y="37.5" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="13" fill="${S}">0</text>
    <path d="M28 11.5h8" ${st} stroke-width="2"/>`,
  mie: `<path d="M6 30h52a26 22 0 0 1-52 0z" fill="${C.rose2}" ${st}/>
    <path d="M14 30c2-6 5 6 8 0s5 6 8 0 5 6 8 0 5 6 8 0 5 6 6 0" fill="none" stroke="${C.amber}" stroke-width="3.4" stroke-linecap="round"/>
    <ellipse cx="40" cy="25" rx="7" ry="5" fill="${C.white}" ${st}/><circle cx="40" cy="25" r="2.6" fill="${C.egg}"/>
    <path d="M22 22c-2-5 2-7 0-12M30 21c-2-5 2-7 0-12" fill="none" ${st} stroke-width="2" opacity=".6"/>
    <path d="M24 56h16" ${st}/>`,
  bakso: `<path d="M6 32h52a26 22 0 0 1-52 0z" fill="${C.teal2}" ${st}/>
    <circle cx="22" cy="29" r="6.5" fill="#a0715a" ${st}/><circle cx="34" cy="27" r="7" fill="#a0715a" ${st}/><circle cx="45" cy="30" r="5.5" fill="#a0715a" ${st}/>
    <path d="M14 32h36" stroke="${C.leaf}" stroke-width="2.4" stroke-dasharray="2 4" stroke-linecap="round"/>
    <path d="M24 58h16" ${st}/>`,
  nasgor: `<ellipse cx="32" cy="44" rx="27" ry="10" fill="${C.white}" ${st}/>
    <path d="M12 42c0-12 9-20 20-20s20 8 20 20z" fill="#d98a3d" ${st}/>
    <circle cx="22" cy="36" r="1.6" fill="${C.hot}"/><circle cx="36" cy="32" r="1.6" fill="${C.leaf}"/><circle cx="42" cy="38" r="1.6" fill="${C.hot}"/>
    <path d="M22 26c4-6 16-6 20 0-2 4-18 4-20 0z" fill="${C.white}" ${st}/><circle cx="32" cy="25" r="3" fill="${C.egg}"/>`,
  nasyur: `<ellipse cx="32" cy="44" rx="27" ry="10" fill="${C.white}" ${st}/>
    <path d="M10 42c0-10 7-16 15-16s13 6 13 16z" fill="${C.rice}" ${st}/>
    <path d="M36 42c0-9 6-14 11-14s9 5 9 14z" fill="${C.leaf2}" ${st}/>
    <path d="M42 36c2-3 5-3 6 0M46 40c2-3 4-2 5 0" fill="none" stroke="${C.leaf}" stroke-width="2.2" stroke-linecap="round"/>`,
  gor: `<rect x="7" y="22" width="17" height="30" rx="8" fill="#e8a33c" ${st} transform="rotate(-16 15 37)"/>
    <rect x="23" y="15" width="18" height="34" rx="8.5" fill="${C.amber2}" ${st}/>
    <rect x="40" y="22" width="17" height="30" rx="8" fill="#e8a33c" ${st} transform="rotate(16 48 37)"/>
    <path d="M28 25l3 3M34 34l3 3M27 40l3 2" ${st} stroke-width="2"/>`,
  chips: `<path d="M14 8h36l-3 6 3 6-3 26 3 10H14l3-10-3-26 3-6z" fill="${C.amber}" ${st}/>
    <circle cx="32" cy="31" r="9" fill="${C.amber2}" ${st}/><path d="M27 31h10" ${st} stroke-width="2"/>
    <path d="M18 14h28M18 46h28" ${st} stroke-width="2"/>`,
  fruit: `<path d="M8 26a24 24 0 0 0 48 0z" fill="${C.leaf}" ${st}/>
    <path d="M12 26a20 18 0 0 0 40 0z" fill="#ff7f6e"/>
    <path d="M20 32l1 2M28 36l1 2M37 36l-1 2M44 32l-1 2M32 31l0 2" ${st} stroke-width="2.4"/>
    <path d="M8 26h48" ${st}/>`,
  nuts: `<ellipse cx="22" cy="38" rx="10" ry="14" fill="#d8a06a" ${st} transform="rotate(-28 22 38)"/>
    <ellipse cx="41" cy="30" rx="10" ry="14" fill="#e8b884" ${st} transform="rotate(22 41 30)"/>
    <path d="M17 33c3 2 6 2 9 1M37 26c2 2 6 3 9 1" fill="none" ${st} stroke-width="2"/>`,
  ibu: `<rect x="10" y="14" width="44" height="36" rx="7" fill="${C.grey}" ${st}/>
    <circle cx="23" cy="26" r="6" fill="${C.white}" ${st}/><circle cx="41" cy="26" r="6" fill="${C.white}" ${st}/>
    <circle cx="23" cy="40" r="6" fill="${C.white}" ${st}/><circle cx="41" cy="40" r="6" fill="${C.rose2}" ${st}/>
    <path d="M18 26h10M36 26h10" ${st} stroke-width="1.8"/>`,
  mef: `<g transform="rotate(-35 32 32)"><rect x="12" y="24" width="40" height="16" rx="8" fill="${C.white}" ${st}/><path d="M32 24h12a8 8 0 0 1 0 16H32z" fill="${C.amber}" ${st}/></g>
    <g transform="rotate(25 40 46)"><rect x="28" y="40" width="26" height="11" rx="5.5" fill="${C.white}" ${st}/><path d="M41 40h7.5a5.5 5.5 0 0 1 0 11H41z" fill="${C.teal2}" ${st}/></g>`,
  ask: `<path d="M8 12h48v30H30l-12 10V42H8z" fill="${C.aqua}" ${st}/>
    <path d="M26 22a6 6 0 1 1 8.5 5.4c-1.6.8-2.5 1.8-2.5 3.6" fill="none" ${st} stroke-width="3"/>
    <circle cx="32" cy="36" r="1.8" fill="${S}"/>`,
};

export const item = (key) => svg(ITEMS[key] || ITEMS.water);

// ---------------- Kidzy ----------------
export const MOUTHS = {
  happy: 'M76 116 Q92 134 108 116',
  ok: 'M80 120 Q92 124 104 120',
  tired: 'M78 127 Q92 114 106 127',
  sweaty: 'M79 124 Q92 116 105 124',
  sleepy: 'M84 121 Q92 127 100 121',
  wow: 'M86 117 Q92 134 98 117',
};

/**
 * Kidzy the kidney. opts: { mood, hat, arms }
 * Moods: happy, ok, tired, sweaty, sleepy, wow
 * The open mouth, squint eyes and cheeks are always drawn; kidzy.js shows them
 * through classes on the host (is-open, is-chewing, is-giggle, is-yawn).
 */
export function kidzy({ mood = 'happy', hat = false, arms = false } = {}) {
  const lidTired = mood === 'tired' || mood === 'sweaty';
  const sleepy = mood === 'sleepy';
  return svg(`
    <ellipse cx="98" cy="186" rx="58" ry="7" fill="${S}" opacity=".14"/>
    ${arms ? `<g class="k-arm k-arm-l"><path d="M26 118 C8 116 -2 100 2 84" fill="none" stroke="${S}" stroke-width="9" stroke-linecap="round"/><path d="M26 118 C8 116 -2 100 2 84" fill="none" stroke="${C.rose}" stroke-width="4" stroke-linecap="round"/></g>
    <g class="k-arm k-arm-r"><path d="M176 102 C194 96 200 78 194 62" fill="none" stroke="${S}" stroke-width="9" stroke-linecap="round"/><path d="M176 102 C194 96 200 78 194 62" fill="none" stroke="${C.rose}" stroke-width="4" stroke-linecap="round"/></g>` : ''}
    <g class="k-body">
      <path d="M122 140 C126 156 120 168 130 180" fill="none" stroke="${S}" stroke-width="10" stroke-linecap="round"/>
      <path d="M122 140 C126 156 120 168 130 180" fill="none" stroke="${C.amber2}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M98 20 C152 14 192 56 182 106 C176 136 150 150 138 128 C131 113 117 116 109 134 C95 166 28 166 18 112 C9 62 46 25 98 20Z" fill="${C.rose}" stroke="${S}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M46 62 Q58 40 84 34" fill="none" stroke="${C.white}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
      <path d="M160 60 Q168 72 168 86" fill="none" stroke="${C.white}" stroke-width="5" stroke-linecap="round" opacity=".35"/>
      <ellipse class="k-cheek" cx="48" cy="108" rx="10" ry="6" fill="${C.blush}" opacity=".9"/>
      <ellipse class="k-cheek" cx="136" cy="104" rx="10" ry="6" fill="${C.blush}" opacity=".9"/>
      <path class="k-squint" opacity="0" d="M55 90 Q68 74 81 90 M101 90 Q114 74 127 90" fill="none" stroke="${S}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${sleepy
        ? `<path d="M56 88 Q68 96 80 88 M102 88 Q114 96 126 88" fill="none" stroke="${S}" stroke-width="5" stroke-linecap="round"/>`
        : `<g class="k-eyes">
            <circle cx="68" cy="86" r="15" fill="${C.white}" stroke="${S}" stroke-width="4"/>
            <circle cx="114" cy="86" r="15" fill="${C.white}" stroke="${S}" stroke-width="4"/>
            <g class="k-pupil"><circle cx="68" cy="87" r="7.5" fill="${S}"/><circle cx="114" cy="87" r="7.5" fill="${S}"/>
            <circle cx="71" cy="84" r="2.4" fill="${C.white}"/><circle cx="117" cy="84" r="2.4" fill="${C.white}"/></g>
            ${lidTired ? `<path d="M52 82 Q68 70 84 82 L84 74 L52 74Z M98 82 Q114 70 130 82 L130 74 L98 74Z" fill="${C.rose}" stroke="${S}" stroke-width="4" stroke-linejoin="round"/>` : ''}
          </g>`}
      ${mood === 'wow' ? `<path d="M56 62 l12 -6 M126 62 l-12 -6" stroke="${S}" stroke-width="4" stroke-linecap="round"/>` : ''}
      <path class="k-mouth" d="${MOUTHS[mood] || MOUTHS.happy}" fill="none" stroke="${S}" stroke-width="5" stroke-linecap="round"/>
      <g class="k-open" opacity="0">
        <path d="M75 113 Q92 108 109 113 Q108 139 92 141 Q76 139 75 113Z" fill="#4a0f22" stroke="${S}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M82 131 Q92 123 102 131 Q99 139 92 139.5 Q85 139 82 131Z" fill="#ff8b9c"/>
        <path d="M86 112.5 h12 v3.5 a6 3.4 0 0 1 -12 0z" fill="${C.white}"/>
      </g>
      ${hat ? `<g class="k-hat" transform="rotate(-9 96 20)"><path d="M66 30 L75 4 H121 L128 26 C108 18 86 20 66 30Z" fill="${C.white}" stroke="${S}" stroke-width="4.5" stroke-linejoin="round"/><path d="M71 17 H124" stroke="${C.teal}" stroke-width="6"/><path d="M71 17 H124" stroke="${S}" stroke-width="1.6" opacity=".5"/></g>` : ''}
      ${lidTired ? `<path class="k-sweat" d="M164 46 q-10 16 0 22 q10 -6 0 -22z" fill="${C.teal2}" stroke="${S}" stroke-width="3"/>` : ''}
      ${sleepy ? `<text class="k-zz" x="168" y="26" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="28" fill="${S}">z</text>` : ''}
    </g>`, '0 0 200 200', `class="kidzy" data-mood="${mood}" role="img"`);
}

// ---------------- brand mark & glyphs ----------------
export const brandMark = () => svg(`
  <path d="M25 4 C39 2 49 13 47 26 C45.5 34 39 37 36 31.5 C34 27.5 30.5 28.5 28.5 33 C25 41 8 41 5.5 28 C3 15 12 5 25 4Z" fill="${C.rose}" stroke="${S}" stroke-width="2.8" stroke-linejoin="round"/>
  <circle cx="18" cy="20" r="2.6" fill="${S}"/><circle cx="29" cy="20" r="2.6" fill="${S}"/>
  <path d="M18.5 27 Q23.5 31.5 28.5 27" fill="none" stroke="${S}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M32 38 C33 42 31.5 44 34 47" fill="none" stroke="${S}" stroke-width="2.8" stroke-linecap="round"/>`, '0 0 52 52');

const G = (d) => svg(d, '0 0 32 32');
export const glyph = {
  story: () => G(`<path d="M16 4 C24 3.5 29 9.5 28 16 C27.4 20 24.4 21.6 23 19 C22 17 20.2 17.6 19.2 19.8 C17.4 23.8 8.5 23.8 7.2 17 C6 10 9.6 4.5 16 4Z" fill="${C.rose}" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="13" cy="12.5" r="1.6" fill="${S}"/><circle cx="19" cy="12.5" r="1.6" fill="${S}"/><path d="M8 27h16" stroke="${S}" stroke-width="2.2" stroke-linecap="round"/>`),
  checkin: () => G(`<path d="M8 10h16l-2 17a2 2 0 0 1-2 1.8h-8a2 2 0 0 1-2-1.8z" fill="${C.amber2}" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/><path d="M6 10c1-5 19-5 20 0z" fill="${C.white}" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 6l3-4" stroke="${S}" stroke-width="2.2" stroke-linecap="round"/><path d="M12 18l2.5 2.5L20 15" fill="none" stroke="${S}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`),
  habits: () => G(`<circle cx="10" cy="10" r="5" fill="${C.teal2}" stroke="${S}" stroke-width="2.2"/><circle cx="22" cy="10" r="5" fill="${C.amber2}" stroke="${S}" stroke-width="2.2"/><circle cx="10" cy="22" r="5" fill="${C.white}" stroke="${S}" stroke-width="2.2"/><circle cx="22" cy="22" r="5" fill="${C.rose2}" stroke="${S}" stroke-width="2.2"/>`),
  me: () => G(`<path d="M8 3h16v26l-2.7-2-2.6 2-2.7-2-2.7 2-2.6-2L8 29z" fill="${C.cream}" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 10h8M12 15h8M12 20h5" stroke="${S}" stroke-width="2.2" stroke-linecap="round"/>`),
  sources: () => G(`<path d="M7 6h14l4 4v17H7z" fill="${C.white}" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/><path d="M21 6v4h4" fill="none" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/><text x="16" y="23" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="9.5" fill="${S}">[n]</text>`),
  sun: () => G(`<path d="M16 6 C22 5.6 26 10 25.2 15.4 C24.7 18.6 22.3 19.8 21.2 17.8 C20.4 16.2 19 16.7 18.2 18.4 C16.7 21.6 9.6 21.6 8.5 16 C7.6 10.5 10.6 6.3 16 6Z" fill="${C.rose}" stroke="${S}" stroke-width="2" stroke-linejoin="round"/><circle cx="13.5" cy="12.5" r="1.4" fill="${S}"/><circle cx="18.5" cy="12.5" r="1.4" fill="${S}"/><path d="M4 26h24" stroke="${S}" stroke-width="2" stroke-linecap="round"/><path d="M16 1.5v2M5 5l1.4 1.4M27 5l-1.4 1.4" stroke="${C.amber}" stroke-width="2.4" stroke-linecap="round"/>`),
  moon: () => G(`<path d="M16 8 C22 7.6 26 12 25.2 17.4 C24.7 20.6 22.3 21.8 21.2 19.8 C20.4 18.2 19 18.7 18.2 20.4 C16.7 23.6 9.6 23.6 8.5 18 C7.6 12.5 10.6 8.3 16 8Z" fill="${C.rose2}" stroke="${S}" stroke-width="2" stroke-linejoin="round"/><path d="M12 15.5 q1.5 1.4 3 0 M17 15.5 q1.5 1.4 3 0" fill="none" stroke="${S}" stroke-width="1.6" stroke-linecap="round"/><text x="22" y="9" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="8" fill="${C.teal}">z</text>`),
  auto: () => G(`<path d="M16 6 C22 5.6 26 10 25.2 15.4 C24.7 18.6 22.3 19.8 21.2 17.8 C20.4 16.2 19 16.7 18.2 18.4 C16.7 21.6 9.6 21.6 8.5 16 C7.6 10.5 10.6 6.3 16 6Z" fill="${C.rose}" stroke="${S}" stroke-width="2" stroke-linejoin="round"/><path d="M16 6 C22 5.6 26 10 25.2 15.4 C24.7 18.6 22.3 19.8 21.2 17.8 C20.4 16.2 19 16.7 18.2 18.4 C17.6 19.7 16.3 20.5 16 20.7Z" fill="${C.rose2}"/><circle cx="13.5" cy="12.5" r="1.4" fill="${S}"/><circle cx="18.5" cy="12.5" r="1.4" fill="${S}"/><path d="M4 26h24" stroke="${S}" stroke-width="2" stroke-linecap="round"/>`),
  warn: () => svg(`<path d="M20 3 C31 2 39 11 37 21 C36 28 30.6 30.5 28.4 26.4 C27 23.6 24.2 24.4 22.6 28 C19.8 34.4 5.2 34.4 3.2 23 C1.6 12 9 4 20 3Z" fill="${C.amber2}" stroke="${S}" stroke-width="2.6" stroke-linejoin="round"/><path d="M20 10v9" stroke="${S}" stroke-width="3.6" stroke-linecap="round"/><circle cx="20" cy="24.5" r="2.2" fill="${S}"/>`, '0 0 40 40'),
  lock: () => svg(`<rect x="7" y="17" width="26" height="19" rx="5" fill="${C.amber2}" stroke="${S}" stroke-width="2.6"/><path d="M13 17v-5a7 7 0 0 1 14 0v5" fill="none" stroke="${S}" stroke-width="2.6"/><circle cx="20" cy="26" r="2.6" fill="${S}"/><path d="M20 28v3" stroke="${S}" stroke-width="2.6" stroke-linecap="round"/>`, '0 0 40 40'),
  seal: () => svg(`<circle cx="20" cy="20" r="15" fill="${C.teal2}" stroke="${S}" stroke-width="2.6"/><path d="M20 5l3 4 5-1 1 5 4 3-2 4 2 4-4 3-1 5-5-1-3 4-3-4-5 1-1-5-4-3 2-4-2-4 4-3 1-5 5 1z" fill="none" stroke="${S}" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 20l4 4 8-8" fill="none" stroke="${S}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`, '0 0 40 40'),
};

export const arrow = () => `<svg class="arrow" viewBox="0 0 22 14" aria-hidden="true"><path d="M1 7h18M13 1.5 19.5 7 13 12.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------------- scene props ----------------
export const props = {
  sieve: () => svg(`<path d="M10 22h44l-8 22H18z" fill="${C.aqua}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
    <path d="M18 30h28M20 36h24M14 26h36" stroke="${S}" stroke-width="1.6" stroke-dasharray="2 3"/>
    <circle cx="24" cy="14" r="3" fill="${C.amber}" stroke="${S}" stroke-width="2"/><circle cx="36" cy="10" r="2.4" fill="${C.hot}" stroke="${S}" stroke-width="2"/><circle cx="44" cy="15" r="2.8" fill="${C.leaf}" stroke="${S}" stroke-width="2"/>
    <path class="drop" d="M32 48 q-4 6 0 9 q4 -3 0 -9z" fill="${C.teal2}" stroke="${S}" stroke-width="2"/>`),
  scale: () => svg(`<path d="M32 10v40M20 54h24" stroke="${S}" stroke-width="${W}" stroke-linecap="round"/>
    <g class="beam"><path d="M10 20h44" stroke="${S}" stroke-width="${W}" stroke-linecap="round"/>
    <path d="M6 20 l-4 12h16l-4-12M50 20l-4 12h16l-4-12" fill="none" stroke="${S}" stroke-width="2"/>
    <path d="M2 32a8 4 0 0 0 16 0z" fill="${C.amber2}" stroke="${S}" stroke-width="2"/><path d="M46 32a8 4 0 0 0 16 0z" fill="${C.teal2}" stroke="${S}" stroke-width="2"/></g>
    <circle cx="32" cy="10" r="4" fill="${C.rose}" stroke="${S}" stroke-width="2"/>`),
  gauge: () => svg(`<path d="M8 44a24 24 0 0 1 48 0" fill="${C.white}" stroke="${S}" stroke-width="${W}"/>
    <path d="M12 44a20 20 0 0 1 10-17" fill="none" stroke="${C.teal}" stroke-width="5"/><path d="M42 27a20 20 0 0 1 10 17" fill="none" stroke="${C.hot}" stroke-width="5"/>
    <path d="M22 27a20 20 0 0 1 20 0" fill="none" stroke="${C.amber}" stroke-width="5"/>
    <g class="needle"><path d="M32 44 L22 26" stroke="${S}" stroke-width="3.4" stroke-linecap="round"/></g><circle cx="32" cy="44" r="4" fill="${S}"/>
    <path d="M8 44h48" stroke="${S}" stroke-width="${W}" stroke-linecap="round"/>`),
  printer: () => svg(`<rect x="6" y="20" width="52" height="26" rx="6" fill="${C.grey}" stroke="${S}" stroke-width="${W}"/>
    <path d="M14 20V8h36v12" fill="${C.white}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>
    <path d="M14 38h36" stroke="${S}" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="28" r="2.4" fill="${C.leaf}"/>`),
  bottle: () => svg(`<path d="M26 4h12v8l4 6v38a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V18l4-6z" fill="${C.white}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/><path d="M23 30h18v26a3 3 0 0 1-3 3H26a3 3 0 0 1-3-3z" fill="${C.teal2}"/><path d="M24 4h16" stroke="${S}" stroke-width="5" stroke-linecap="round"/>`),
  note: () => svg(`<path d="M4 4h56v48l-10 8H4z" fill="${C.amber2}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/><path d="M50 60v-8h10" fill="${C.amber}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/>`),
  phone: () => svg(`<rect x="16" y="4" width="32" height="56" rx="7" fill="${C.white}" stroke="${S}" stroke-width="${W}"/><rect x="21" y="12" width="22" height="34" rx="3" fill="${C.aqua}" stroke="${S}" stroke-width="2"/><path d="M27 52h10" stroke="${S}" stroke-width="${W}" stroke-linecap="round"/><path d="M26 30l4 4 8-9" fill="none" stroke="${S}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  friends: () => svg(`<circle cx="16" cy="22" r="8" fill="${C.teal2}" stroke="${S}" stroke-width="${W}"/><circle cx="32" cy="18" r="9" fill="${C.rose}" stroke="${S}" stroke-width="${W}"/><circle cx="48" cy="22" r="8" fill="${C.amber2}" stroke="${S}" stroke-width="${W}"/><path d="M4 50c2-12 22-12 24 0M20 52c2-14 22-14 24 0M36 50c2-12 22-12 24 0" fill="none" stroke="${S}" stroke-width="${W}" stroke-linecap="round"/>`),
  doctor: () => svg(`<path d="M20 4h24v14a12 12 0 0 1-24 0z" fill="${C.white}" stroke="${S}" stroke-width="${W}"/><path d="M20 10h24" stroke="${S}" stroke-width="2"/><path d="M8 60c0-16 10-26 24-26s24 10 24 26" fill="${C.aqua}" stroke="${S}" stroke-width="${W}"/><path d="M26 38v10a6 6 0 0 0 12 0v-4" fill="none" stroke="${S}" stroke-width="2.4"/><circle cx="38" cy="42" r="3" fill="${C.rose}" stroke="${S}" stroke-width="2"/>`),
};

// ---------------- symptoms (Scene 5) ----------------
export const symptom = {
  tired: () => svg(`<path d="M10 40h44v10H10z" fill="${C.teal2}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/><path d="M14 40v-8a6 6 0 0 1 6-6h6" fill="${C.white}" stroke="${S}" stroke-width="${W}"/><path d="M28 26h22a4 4 0 0 1 4 4v10H28z" fill="${C.rose2}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/><path d="M38 12h8l-8 8h8" fill="none" stroke="${S}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 50v6M54 50v6" stroke="${S}" stroke-width="${W}" stroke-linecap="round"/>`),
  swollen: () => svg(`<path d="M20 58V34c-4-2-8-8-6-12 2-3 6-1 8 3V12a4 4 0 0 1 8 0v14-17a4 4 0 0 1 8 0v17-14a4 4 0 0 1 8 0v16-10a4 4 0 0 1 8 0v20c0 10-4 16-10 20v6z" fill="${C.blush}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/><path d="M8 30c-3 4-3 10 0 14M58 30c3 4 3 10 0 14" fill="none" stroke="${C.teal}" stroke-width="2.6" stroke-linecap="round"/>`),
  blood: () => svg(`<path d="M32 6c-10 14-18 24-18 34a18 18 0 0 0 36 0C50 30 42 20 32 6z" fill="${C.hot}" stroke="${S}" stroke-width="${W}" stroke-linejoin="round"/><path d="M24 40a8 8 0 0 0 6 8" fill="none" stroke="${C.white}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`),
};
