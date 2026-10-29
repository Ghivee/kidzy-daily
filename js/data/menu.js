// The café menu. Nutrient values are per-serving ESTIMATES for the simulation,
// not lab measurements. Limits come from the sources cited in the video.
//   sugar  g per serving         sodium mg per serving
//   water  glasses (≈250 ml)     sweet  counts as one sweetened drink (sugary OR diet)
//   nsaid  painkiller doses
// `swap` points at the kidney-friendlier item offered on the Kidney Receipt.

export const LIMITS = {
  sugar: 50,      // g/day  [5]
  sodium: 2000,   // mg/day [21]
  water: 8,       // glasses — simulation target, not a medical prescription
  sweet: 1,       // more than 1 sweetened drink a day was the risk group in [10]
  nsaid: 0,       // any regular use without advice gets flagged
};

export const MAX_QTY = 20;

export const COUNTERS = ['drinks', 'food', 'pharmacy'];

export const MENU = [
  // drinks
  { id: 'water',  counter: 'drinks', art: 'water',  water: 1 },
  { id: 'esteh',  counter: 'drinks', art: 'esteh',  sugar: 20, sweet: 1, swap: 'water' },
  { id: 'kopsu',  counter: 'drinks', art: 'kopsu',  sugar: 28, sweet: 1, swap: 'water' },
  { id: 'soda',   counter: 'drinks', art: 'soda',   sugar: 35, sweet: 1, swap: 'water' },
  { id: 'boba',   counter: 'drinks', art: 'boba',   sugar: 40, sweet: 1, swap: 'water' },
  { id: 'diet',   counter: 'drinks', art: 'diet',   sugar: 0,  sweet: 1, swap: 'water' },
  // food
  { id: 'mie',    counter: 'food', art: 'mie',    sodium: 1600, swap: 'mieh' },
  { id: 'bakso',  counter: 'food', art: 'bakso',  sodium: 1400, swap: 'baksoh' },
  { id: 'nasgor', counter: 'food', art: 'nasgor', sodium: 1100, swap: 'nasyur' },
  { id: 'gor',    counter: 'food', art: 'gor',    sodium: 450,  swap: 'fruit' },
  { id: 'chips',  counter: 'food', art: 'chips',  sodium: 500,  swap: 'nuts' },
  // pharmacy counter
  { id: 'ibu',    counter: 'pharmacy', art: 'ibu',  nsaid: 1, swap: 'ask' },
  { id: 'mef',    counter: 'pharmacy', art: 'mef',  nsaid: 1, swap: 'ask' },
  // swap-only (not shown on the board)
  { id: 'mieh',   counter: 'food', art: 'mie',    sodium: 800, hidden: true },
  { id: 'baksoh', counter: 'food', art: 'bakso',  sodium: 700, hidden: true },
  { id: 'nasyur', counter: 'food', art: 'nasyur', sodium: 400, hidden: true },
  { id: 'fruit',  counter: 'food', art: 'fruit',  hidden: true },
  { id: 'nuts',   counter: 'food', art: 'nuts',   sodium: 5, hidden: true },
  { id: 'ask',    counter: 'pharmacy', art: 'ask', hidden: true },
];

export const BY_ID = Object.fromEntries(MENU.map((m) => [m.id, m]));

/** Accept only known item ids with integer quantities 1..MAX_QTY. Returns a clean, key-sorted copy or null. */
export function cleanItems(items) {
  if (!items || typeof items !== 'object' || Array.isArray(items)) return null;
  const out = {};
  for (const k of Object.keys(items).sort()) {
    const q = items[k];
    if (!BY_ID[k] || !Number.isInteger(q) || q < 1 || q > MAX_QTY) return null;
    out[k] = q;
  }
  return out;
}

export function totals(items) {
  const t = { sugar: 0, sodium: 0, water: 0, sweet: 0, nsaid: 0, n: 0 };
  for (const [k, q] of Object.entries(items)) {
    const m = BY_ID[k];
    if (!m) continue;
    t.sugar += (m.sugar || 0) * q;
    t.sodium += (m.sodium || 0) * q;
    t.water += (m.water || 0) * q;
    t.sweet += (m.sweet || 0) * q;
    t.nsaid += (m.nsaid || 0) * q;
    t.n += q;
  }
  return t;
}

/** The four habits, in script order: water, sugary drinks, salty food, painkillers.
    true = the habit showed up today (counts toward "how many did you count?"). */
export function flagsFor(items) {
  const t = totals(items);
  return [
    t.water < LIMITS.water,
    t.sugar > LIMITS.sugar || t.sweet > LIMITS.sweet,
    t.sodium > LIMITS.sodium,
    t.nsaid > LIMITS.nsaid,
  ];
}

export const countOf = (flags) => flags.filter(Boolean).length;
