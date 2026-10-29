// Streak Card: a 1080×1350 PNG drawn on canvas, ready for stories and chats.

import { kidzy, brandMark, C } from './art.js';
import { t, fmtDate } from './core/i18n.js';
import { addDays, keyToDate } from './core/dom.js';

const W = 1080;
const H = 1350;

function svgImage(markup, size) {
  const sized = markup.replace('<svg ', `<svg width="${size}" height="${size}" `);
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function fonts() {
  try {
    await Promise.all([
      document.fonts.load('800 300px "Bricolage Grotesque"'),
      document.fonts.load('700 40px "Space Mono"'),
      document.fonts.load('700 40px "Schibsted Grotesk"'),
    ]);
  } catch { /* draw with fallbacks */ }
}

/** Draw the card into `canvas`. view = ledger view. */
export async function drawCard(canvas, view, { site }) {
  await fonts();
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const streak = view.streak;
  const name = view.profile.name;

  // background + dot grid
  ctx.fillStyle = C.rose;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(42,15,28,.13)';
  for (let y = 30; y < H; y += 44) for (let x = 30; x < W; x += 44) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }

  // header
  const mark = await svgImage(brandMark(), 84);
  ctx.drawImage(mark, 64, 58, 84, 84);
  ctx.fillStyle = C.ink;
  ctx.font = '800 54px "Bricolage Grotesque", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Kidzy Daily', 164, 102);
  ctx.font = '700 26px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(fmtDate(keyToDate(view.today), { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase(), W - 64, 102);
  ctx.textAlign = 'left';

  // Kidzy
  const mood = streak === 0 ? 'sleepy' : view.todayEntry ? ['happy', 'ok', 'sweaty', 'tired', 'tired'][view.todayEntry.count] : 'happy';
  const kz = await svgImage(kidzy({ mood, arms: streak > 0 }), 420);
  ctx.drawImage(kz, W - 470, 190, 420, 420);

  // the number
  ctx.fillStyle = C.ink;
  ctx.textBaseline = 'alphabetic';
  const big = String(streak);
  const size = big.length > 2 ? 300 : 400;
  ctx.font = `800 ${size}px "Bricolage Grotesque", sans-serif`;
  ctx.fillStyle = C.ink;
  ctx.fillText(big, 58, 560);
  ctx.fillStyle = C.cream;
  ctx.fillText(big, 50, 552);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.strokeText(big, 50, 552);

  ctx.fillStyle = C.ink;
  ctx.font = '700 44px "Space Mono", monospace';
  ctx.fillText(streak ? t('sc.c.days') : t('sc.c.zero'), 64, 640);
  ctx.font = '700 40px "Schibsted Grotesk", sans-serif';
  ctx.fillText(t('sc.c.line'), 64, 700);
  if (name) {
    ctx.font = '800 48px "Bricolage Grotesque", sans-serif';
    ctx.fillText(t('sc.c.by', { name }), 64, 770);
  }

  // last 7 days
  ctx.font = '700 26px "Space Mono", monospace';
  ctx.fillText(t('sc.c.week'), 64, 862);
  const r = 52;
  for (let i = 0; i < 7; i++) {
    const key = addDays(view.today, i - 6);
    const e = view.byDate[key];
    const cx = 64 + r + i * (r * 2 + 30);
    const cy = 950;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = e ? (e.count === 0 ? C.teal2 : e.count < 3 ? C.amber2 : C.cream) : 'rgba(255,255,255,.25)';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.setLineDash(e ? [] : [12, 10]);
    ctx.strokeStyle = C.ink;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'center';
    ctx.font = e ? '800 46px "Bricolage Grotesque", sans-serif' : '700 22px "Space Mono", monospace';
    ctx.fillText(e ? String(e.count) : '·', cx, cy + (e ? 16 : 8));
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.fillText(fmtDate(keyToDate(key), { weekday: 'narrow' }), cx, cy + r + 36);
    ctx.textAlign = 'left';
  }

  // receipt footer
  const fy = 1090;
  rr(ctx, 40, fy, W - 80, 220, 26);
  ctx.fillStyle = C.cream;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.font = '800 44px "Bricolage Grotesque", sans-serif';
  ctx.fillText('Ask them today,', 80, fy + 70);
  ctx.fillText('don\'t wait for them to say.', 80, fy + 122);
  ctx.font = '700 28px "Space Mono", monospace';
  ctx.fillText(`${t('sc.c.cta')} ${site}`, 80, fy + 182);
  if (view.code) {
    ctx.textAlign = 'right';
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.fillText(`${t('sc.c.code')} ${view.code}`, W - 80, fy + 182);
    ctx.textAlign = 'left';
  }
  return canvas;
}

export const toBlob = (canvas) => new Promise((res) => canvas.toBlob(res, 'image/png'));
