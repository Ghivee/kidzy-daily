# Kidzy Daily

*Your kidney's daily check-in.* A companion website for a competition video. Every feature mentioned in the voice-over (scenes 1 to 8) exists and works.

[Bahasa Indonesia](README.id.md)

A static site (HTML, CSS, ES modules) with no build step, no backend and no database. It is available in English (default) and Indonesian through a toggle.

## Pages

| URL | What it holds |
| --- | --- |
| `/` | The story: a hook question, dragging food onto Kidzy, a look at how the kidneys work, and more |
| `/check-in` | A cafe (drinks, food, pharmacy counter), then a Kidney Receipt, a swap step, a result, and a saved and sealed entry |
| `/habits` | Four habits, each with a short script, the fix, today's status and numbered sources |
| `/me` | A 30-day history, a check-up, a shareable streak card (PNG) and a data section with backup and restore |
| `/sources` | Numbered list of sources matching the data cards in the video |

## Running locally

```bash
npm run dev      # http://localhost:4173, served with clean URLs
npm run check    # translation keys EN/ID, local links and counting rules
```

Opening the HTML files directly (`file://`) does not work because browsers block ES modules from local files. Use `npm run dev`.

## Deploying to Vercel

Framework preset Other, empty build command, output directory `.`. `vercel.json` sets clean URLs, security headers (the CSP only allows the site's own files and Google Fonts), caching and the `404.html` page. The QR code on the home page is generated from the current domain.

## Storage and tamper detection

Data stays on the user's device: IndexedDB is the main copy and localStorage mirrors it. On start the two copies are compared. Each entry is chained to the previous one with SHA-256, so editing stored data breaks the chain and marks that entry and everything after it as unverified. The streak is never stored; it is recomputed from sealed entries. Backups carry a seal that is checked on restore.

Without a server this has a limit: someone who studies the JavaScript can still forge data on their own device. The layers above stop casual tricks, not a determined one.

## Structure

```
index.html  check-in.html  habits.html  me.html  sources.html  404.html
css/        tokens, base, components, pages
js/core/    dom, i18n, store (IndexedDB + localStorage), ledger (hash chain), sha256, shell
js/data/    menu and habit rules, sources
js/lang/    en.js, id.js
js/pages/   one module per page
js/art.js   hand-made SVG illustrations (no icon library)
vendor/     qrcode-generator 1.4.4 (MIT), copied locally
```
