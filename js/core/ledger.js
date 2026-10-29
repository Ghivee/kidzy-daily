// The check-in ledger. Runs fully in the browser, no server.
//
// Each check-in is sealed into a hash chain:
//   h = SHA-256(PEPPER | salt | prev | canonical(entry))
// On every load the chain is re-verified. An entry that was edited, inserted,
// back-dated, or whose stored count does not match its items breaks the chain;
// it and everything after it are marked unverified and never count toward a streak.
// The streak itself is never stored — it is always recomputed from verified entries.
//
// Honest limit: without a server, someone who reads this source can still forge
// data on their own device. This closes the everyday tricks (editing storage,
// changing the clock, filling past days, editing a backup file).

import { sha256 } from './sha256.js';
import { readCopies, writeCopies, requestPersistence } from './store.js';
import { cleanItems, flagsFor, countOf } from '../data/menu.js';
import { dayKey, addDays } from './dom.js';

const PEPPER = 'kidzy-daily/ledger/v1/ask-them-today';
const SCHEMA = 1;
const CLOCK_SLACK = 10 * 60 * 1000; // 10 minutes
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('kidzy-daily') : null;
const listeners = new Set();

let state = null;   // raw persisted object
let view = null;    // verified view
let persisted = { idb: false, ls: false };

const canon = (v) => {
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`;
  return JSON.stringify(v);
};

const sealOf = (salt, prev, e) => sha256(`${PEPPER}|${salt}|${prev}|${canon({ date: e.date, ts: e.ts, items: e.items, swaps: e.swaps, count: e.count })}`);
const genesisOf = (salt) => sha256(`${PEPPER}|genesis|${salt}`);
const randomSalt = () => {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
};

function blank() {
  return { schema: SCHEMA, salt: randomSalt(), created: Date.now(), entries: [], quarantine: [], profile: { name: '', age: null, shares: [], booked: null, risks: { ht: false, dm: false } } };
}

function shapeOk(s) {
  return s && s.schema === SCHEMA && typeof s.salt === 'string' && /^[0-9a-f]{32}$/.test(s.salt) && Array.isArray(s.entries);
}

function cleanProfile(p) {
  const name = typeof p?.name === 'string' ? p.name.replace(/[\u0000-\u001f]/g, '').slice(0, 16) : '';
  const age = [0, 1, 2].includes(p?.age) ? p.age : null;
  const shares = Array.isArray(p?.shares) ? p.shares.filter((t) => Number.isFinite(t)).slice(-3) : [];
  const booked = Number.isFinite(p?.booked) ? p.booked : null;
  const risks = { ht: !!p?.risks?.ht, dm: !!p?.risks?.dm };
  return { name, age, shares, booked, risks };
}

/** Verify a chain. Returns {good, bad, reasons} without mutating. */
export async function verifyChain(salt, entries, now = Date.now()) {
  const good = [];
  const bad = [];
  let prev = await genesisOf(salt);
  let lastDate = '';
  let lastTs = 0;
  let broken = null;
  const today = dayKey(new Date(now));
  for (const e of entries) {
    if (broken) { bad.push({ e, why: broken }); continue; }
    let why = null;
    const items = e && cleanItems(e.items);
    if (!e || typeof e.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !Number.isFinite(e.ts) || !items) why = 'shape';
    else if (canon(items) !== canon(e.items)) why = 'items';
    else if (!Number.isInteger(e.swaps) || e.swaps < 0 || e.swaps > 99) why = 'shape';
    else if (e.count !== countOf(flagsFor(items))) why = 'count';
    else if (e.prev !== prev) why = 'link';
    else if (e.date <= lastDate || e.ts < lastTs) why = 'order';
    else if (Math.abs(dateDiff(dayKey(new Date(e.ts)), e.date)) > 1) why = 'time';
    else if (e.h !== await sealOf(salt, prev, e)) why = 'seal';
    if (why) { broken = why; bad.push({ e, why }); continue; }
    if (e.date > today) { bad.push({ e, why: 'future' }); broken = 'future'; continue; }
    good.push(e);
    prev = e.h; lastDate = e.date; lastTs = e.ts;
  }
  return { good, bad, head: prev };
}

const dateDiff = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);

function streakFrom(dates, today) {
  const set = new Set(dates);
  let start = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(start)) { n++; start = addDays(start, -1); }
  let best = 0, run = 0, prev = null;
  for (const d of [...set].sort()) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { streak: n, best };
}

async function buildView() {
  const now = Date.now();
  const today = dayKey(new Date(now));
  const { good, bad, head } = await verifyChain(state.salt, state.entries, now);
  const last = state.entries[state.entries.length - 1];
  let lock = null;
  if (last && Number.isFinite(last.ts) && now < last.ts - CLOCK_SLACK) lock = 'clock';
  if (bad.some((b) => b.why === 'future')) lock = 'clock';
  const { streak, best } = streakFrom(good.map((e) => e.date), today);
  const byDate = Object.fromEntries(good.map((e) => [e.date, { ...e, flags: flagsFor(e.items) }]));
  view = {
    today,
    entries: good.map((e) => byDate[e.date]),
    byDate,
    todayEntry: byDate[today] || null,
    unverified: bad,
    quarantined: state.quarantine?.length || 0,
    lock,
    streak,
    best,
    total: good.length,
    code: good.length ? head.slice(0, 8).toUpperCase() : null,
    profile: state.profile,
    persisted,
  };
  return view;
}

async function scoreCopy(copy) {
  if (!shapeOk(copy)) return -1;
  const { good } = await verifyChain(copy.salt, copy.entries);
  return good.length * 1e13 + (good.length ? good[good.length - 1].ts : 0);
}

/** Load both storage copies, keep the one with the longest verified chain, heal the other. */
export async function load() {
  if (view) return view;
  const { idb, ls } = await readCopies();
  const [si, sl] = await Promise.all([scoreCopy(idb.value), scoreCopy(ls.value)]);
  if (si < 0 && sl < 0) {
    // Nothing usable. If something WAS stored but is unreadable, keep it aside instead of silently erasing.
    state = blank();
    const junk = idb.value || ls.value;
    if (junk) state.quarantine = [{ at: Date.now(), raw: JSON.stringify(junk).slice(0, 20000) }];
  } else {
    state = si >= sl ? idb.value : ls.value;
    state.quarantine = Array.isArray(state.quarantine) ? state.quarantine : [];
  }
  state.profile = cleanProfile(state.profile);
  persisted = await writeCopies(state);
  requestPersistence();
  return buildView();
}

export const current = () => view;

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

async function commitState() {
  persisted = await writeCopies(state);
  await buildView();
  listeners.forEach((fn) => fn(view));
  channel?.postMessage({ type: 'changed' });
}

channel?.addEventListener('message', async (ev) => {
  if (ev.data?.type !== 'changed') return;
  view = null;
  await load();
  listeners.forEach((fn) => fn(view));
});

/** Save today's check-in. Back-dating is impossible: the date is always "now". */
export async function checkIn(rawItems, swaps = 0) {
  await load();
  if (view.lock) return { ok: false, reason: view.lock };
  const items = cleanItems(rawItems);
  if (!items || !Object.keys(items).length) return { ok: false, reason: 'empty' };
  const now = Date.now();
  const today = dayKey(new Date(now));

  // Move any unverified tail aside so the new entry links to the last verified one.
  const { good, bad } = await verifyChain(state.salt, state.entries, now);
  if (bad.length) state.quarantine.push(...bad.map((b) => ({ at: now, why: b.why, entry: b.e })));
  let chain = good;
  if (chain.length && chain[chain.length - 1].date === today) chain = chain.slice(0, -1); // same-day redo replaces
  const prev = chain.length ? chain[chain.length - 1].h : await genesisOf(state.salt);
  const lastTs = chain.length ? chain[chain.length - 1].ts : 0;
  if (now < lastTs) return { ok: false, reason: 'clock' };

  const entry = { date: today, ts: now, items, swaps: Math.min(99, Math.max(0, swaps | 0)), count: countOf(flagsFor(items)), prev };
  entry.h = await sealOf(state.salt, prev, entry);
  state.entries = [...chain, entry];
  await commitState();
  return { ok: true, entry: view.todayEntry };
}

export async function updateProfile(patch) {
  await load();
  state.profile = cleanProfile({ ...state.profile, ...patch });
  await commitState();
  return view.profile;
}

export async function logShare() {
  await load();
  const shares = [...state.profile.shares, Date.now()].slice(-3);
  return updateProfile({ shares });
}

// ---------- backup / restore ----------

const sealBackup = (b) => sha256(`${PEPPER}|backup|${b.salt}|${b.entries.length}|${b.entries.length ? b.entries[b.entries.length - 1].h : '-'}|${canon(b.profile)}|${b.exportedAt}`);

export async function exportBackup() {
  await load();
  const { good } = await verifyChain(state.salt, state.entries);
  const b = { kind: 'kidzy-daily-backup', schema: SCHEMA, exportedAt: Date.now(), salt: state.salt, entries: good, profile: state.profile };
  b.seal = await sealBackup(b);
  return new Blob([JSON.stringify(b, null, 1)], { type: 'application/json' });
}

/** Check a backup file. Any edit to it (even one character) makes it fail. */
export async function inspectBackup(text) {
  let b;
  try { b = JSON.parse(text); } catch { return { ok: false, reason: 'parse' }; }
  if (!b || b.kind !== 'kidzy-daily-backup' || !shapeOk(b) || !Number.isFinite(b.exportedAt)) return { ok: false, reason: 'format' };
  if (b.exportedAt > Date.now() + CLOCK_SLACK) return { ok: false, reason: 'clock' };
  const profile = cleanProfile(b.profile);
  if (canon(profile) !== canon(b.profile)) return { ok: false, reason: 'tampered' };
  if (b.seal !== await sealBackup(b)) return { ok: false, reason: 'tampered' };
  const { good, bad } = await verifyChain(b.salt, b.entries);
  if (bad.length) return { ok: false, reason: 'tampered' };
  return { ok: true, backup: b, count: good.length, streak: streakFrom(good.map((e) => e.date), dayKey()).streak };
}

export async function restoreBackup(b) {
  await load();
  if (state.entries.length) state.quarantine.push({ at: Date.now(), why: 'replaced-by-restore', salt: state.salt, entries: state.entries });
  state.salt = b.salt;
  state.entries = b.entries;
  state.profile = cleanProfile(b.profile);
  await commitState();
  return view;
}
