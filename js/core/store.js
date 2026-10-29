// Persistence: IndexedDB is the primary copy, localStorage is a mirror.
// Both are read on boot and the ledger decides which one is trustworthy.
// Every access is wrapped: private windows, blocked storage or quota errors
// degrade to "memory only" instead of breaking the page.

const LS_KEY = 'kidzy:v1';
const PREFS_KEY = 'kidzy:prefs';
const DB_NAME = 'kidzy-daily';
const STORE = 'state';

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbPromise;
}

async function idbGet() {
  const db = await openDb();
  if (!db) return { ok: false, value: null };
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get('main');
      req.onsuccess = () => resolve({ ok: true, value: parse(req.result) });
      req.onerror = () => resolve({ ok: false, value: null });
    } catch { resolve({ ok: false, value: null }); }
  });
}

async function idbPut(text) {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(text, 'main');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch { resolve(false); }
  });
}

function lsGet() {
  try { return { ok: true, value: parse(localStorage.getItem(LS_KEY)) }; }
  catch { return { ok: false, value: null }; }
}
function lsPut(text) {
  try { localStorage.setItem(LS_KEY, text); return true; } catch { return false; }
}

function parse(text) {
  if (typeof text !== 'string' || !text) return null;
  try { const v = JSON.parse(text); return v && typeof v === 'object' ? v : null; } catch { return null; }
}

export async function readCopies() {
  const [idb, ls] = await Promise.all([idbGet(), Promise.resolve(lsGet())]);
  return { idb, ls };
}

/** Writes both copies. Returns which ones succeeded. */
export async function writeCopies(state) {
  const text = JSON.stringify(state);
  const ls = lsPut(text);
  const idb = await idbPut(text);
  return { idb, ls };
}

export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch { /* not supported */ }
  return false;
}

// Small, unsigned view preferences (language, theme). Read synchronously at boot
// so the page does not flash in the wrong language or theme.
export function getPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {}; } catch { return {}; }
}
export function setPrefs(patch) {
  const next = { ...getPrefs(), ...patch };
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* memory only */ }
  return next;
}
