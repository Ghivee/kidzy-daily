// npm run check — static sanity checks, no dependencies.
//  1. EN and ID dictionaries have exactly the same keys
//  2. every t('…') / data-i18n key used in code exists
//  3. every local href/src in the HTML points at a real file
//  4. the ledger rules (menu flags) behave as the script describes
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let fail = 0;
const bad = (m) => { fail++; console.error('✗', m); };
const ok = (m) => console.log('✓', m);

const en = (await import(join(root, 'js/lang/en.js'))).default;
const id = (await import(join(root, 'js/lang/id.js'))).default;
const ke = Object.keys(en), ki = Object.keys(id);
ke.filter((k) => !(k in id)).forEach((k) => bad(`id.js missing ${k}`));
ki.filter((k) => !(k in en)).forEach((k) => bad(`en.js missing ${k}`));
if (!fail) ok(`i18n: ${ke.length} keys in both languages`);

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  if (f.startsWith('.') || f === '_lama' || f === 'node_modules' || f === 'vendor') return [];
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(root);
const used = new Set();
for (const f of files.filter((f) => /\.(js|html)$/.test(f))) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\bt\('([a-z0-9.]+)'/gi)) used.add(m[1]);
  for (const m of s.matchAll(/data-i18n="([a-z0-9.]+)"/gi)) used.add(m[1]);
  for (const m of s.matchAll(/'data-i18n': '([a-z0-9.]+)'/gi)) used.add(m[1]);
  for (const m of s.matchAll(/content="([a-z]+\.title)"/g)) used.add(m[1]);
}
const missing = [...used].filter((k) => !(k in en) && !k.endsWith('.'));
missing.forEach((k) => bad(`key used but not defined: ${k}`));
if (!missing.length) ok(`i18n: ${used.size} literal keys used, all defined`);

let links = 0;
for (const f of files.filter((f) => f.endsWith('.html'))) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    let p = m[1];
    if (p === '/') p = '/index.html';
    else if (!/\.[a-z0-9]+$/.test(p)) p += '.html';
    links++;
    if (!existsSync(join(root, p))) bad(`${f.replace(root, '')}: broken link ${m[1]}`);
  }
}
ok(`links: ${links} local references checked`);

const { flagsFor, countOf } = await import(join(root, 'js/data/menu.js'));
const cases = [
  [{ soda: 2, mie: 1, bakso: 1, ibu: 1 }, 4],
  [{ water: 8 }, 0],
  [{ water: 8, diet: 2 }, 1],
  [{ water: 8, esteh: 1 }, 0],
  [{ water: 2, ask: 1 }, 1],
];
for (const [items, want] of cases) {
  const got = countOf(flagsFor(items));
  if (got !== want) bad(`rules: ${JSON.stringify(items)} → ${got}, expected ${want}`);
}
ok(`rules: ${cases.length} scenarios`);

if (fail) { console.error(`\n${fail} problem(s)`); process.exit(1); }
console.log('\nAll checks passed.');
