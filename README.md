# Kidzy Daily

*Your kidney's daily check-in.* Kidzy Daily is a companion website built for a competition video about kidney health in children: everything the video's voice-over promises (scenes 1 to 8) is a real, working feature here, not a mockup. It is a fully static site: plain HTML, CSS and ES modules, no build step, no backend server and no database, available in English (the default) and Indonesian through a language toggle.

[Baca dalam Bahasa Indonesia di bawah](#bahasa-indonesia)

## Pages

| URL | What it does | Matches video scene |
| --- | --- | --- |
| `/` | The story: a hook question ("What did you eat and drink today?"), a drag-and-drop interaction feeding food to the mascot Kidzy, a "meet Kidzy" introduction, a look at how the kidneys work, and a note from a housemate character | 1, 2 |
| `/check-in` | A cafe-style flow: pick drinks, food and pharmacy-counter items, see a "Kidney Receipt" summarizing the choices, a swap suggestion, a "you counted X of 4" result, and the entry is then saved and sealed | 3, 4 |
| `/habits` | Four habits to track, each with a short script, "the fix" (what to do instead), today's status, a sourced data card, and related symptoms | 4, 5 |
| `/me` | A 30-day history view, a check-up (age plus risk factors and the suggested next step through Indonesia's SATUSEHAT health platform), a shareable Streak Card rendered as a 1080x1350 PNG (download or share, shown alongside up to 3 friends), and a data section for backup and restore | |
| `/sources` | A numbered source list matching the data cards shown throughout the video | 8 |

## Storage and tamper resistance

There is no server, so all data lives on the visitor's own device: IndexedDB is the primary copy and localStorage mirrors it, and on load the two copies are compared against each other. Every entry is chained to the one before it with a SHA-256 hash (the "ledger"), so the design deliberately makes a handful of common cheats either impossible or detectable rather than relying on a server to police them:

| Attempted trick | What happens |
| --- | --- |
| Editing stored data directly in DevTools | Breaks the SHA-256 hash chain; that entry and everything after it is marked "unverified" and excluded from the streak |
| Backdating yesterday's entry | Not possible from inside the app; inserting one manually still breaks the chain |
| Turning the device clock back | Check-in stays locked until the device clock catches back up to the last sealed entry |
| Turning the clock forward, then back | The "future" entry it created is excluded, and check-in locks the same way |
| Directly editing the streak number | The streak is never stored as a number; it is always recomputed from sealed, verified entries |
| Editing an exported backup file | Rejected on restore, because the backup carries its own seal that is checked before any data is restored from it |
| A display name containing HTML or a script tag | Rendered as plain text everywhere, because every piece of user-entered data goes through `textContent`, never `innerHTML` |

**An honest limit:** without a server, someone who reads the JavaScript can still fabricate data on their own single device if they are determined enough. These mechanisms close the easy, casual tricks (accidental or opportunistic tampering), not a deliberate, informed attacker working against their own local copy.

## Running it locally

```bash
npm run dev      # http://localhost:4173, served with clean URLs (serve package)
npm run check    # checks EN/ID translation keys are in sync, local links resolve, and counting rules are consistent
```

Opening the HTML files directly from the filesystem (`file://`) does not work, because browsers block ES module imports from local files for security reasons; `npm run dev` serves the site over `http://` instead, which works normally.

## Deploying to Vercel

Push this folder to GitHub, then in Vercel choose Add New, Project, Import (or from this folder's terminal: `npx vercel`, then `npx vercel --prod`). Project settings: Framework Preset "Other", an empty Build Command, and Output Directory `.` (the repository root, since there is no build step). `vercel.json` already configures clean URLs (`/check-in` rather than `/check-in.html`), security headers (a Content Security Policy that only allows the site's own files plus Google Fonts), caching, and the `404.html` page. The QR code shown on the home page is generated automatically from whichever domain the page is currently open on, so after deploying it it points to `https://<your-domain>/check-in` with no manual configuration needed.

## Structure

```
index.html  check-in.html  habits.html  me.html  sources.html  404.html
css/        tokens.css (colors, fonts, dark mode) · base.css · components.css · pages.css
js/boot.js  sets the theme and language before the first paint, to avoid a flash of the wrong one
js/core/    dom.js · i18n.js · store.js (IndexedDB + localStorage) · ledger.js (the hash chain) · sha256.js · shell.js (nav, footer)
js/data/    menu.js (cafe items, limits, the four habits' rules) · sources.js
js/lang/    en.js · id.js
js/pages/   one module per page
js/art.js   every illustration, as hand-made SVG (Kidzy, menu items, icons); no external icon library
js/streak-card.js   renders the Streak Card to a canvas, then exports it as a PNG
vendor/     qrcode-generator 1.4.4 (MIT license), copied in locally rather than fetched from a CDN
assets/     favicon.svg · icon-512.png · og.png
```

---

## Bahasa Indonesia

*Your kidney's daily check-in.* Kidzy Daily adalah situs pendamping yang dibuat untuk video lomba tentang kesehatan ginjal anak: semua yang dijanjikan narasi video itu (Scene 1 sampai 8) benar-benar fitur yang berfungsi di sini, bukan sekadar tampilan contoh. Ini situs statis sepenuhnya: HTML, CSS, dan ES modules biasa, tanpa langkah build, tanpa server backend, dan tanpa database, tersedia dalam bahasa Inggris (default) dan Indonesia lewat tombol ganti bahasa.

### Halaman

| URL | Fungsi | Sesuai scene video |
| --- | --- | --- |
| `/` | Cerita: pertanyaan pembuka ("Apa yang kamu makan dan minum hari ini?"), interaksi seret-dan-lepas memberi makan maskot Kidzy, perkenalan "kenalan dengan Kidzy", penjelasan cara kerja ginjal, dan catatan dari karakter teman serumah | 1, 2 |
| `/check-in` | Alur bergaya kafe: pilih minuman, makanan, dan item konter apotek, lihat "Kidney Receipt" yang merangkum pilihan, saran tukar, hasil "kamu menghitung X dari 4", lalu entrinya disimpan dan disegel | 3, 4 |
| `/habits` | Empat kebiasaan yang dilacak, masing-masing dengan skrip singkat, "perbaikannya" (apa yang sebaiknya dilakukan), status hari ini, kartu data bersumber, dan gejala terkait | 4, 5 |
| `/me` | Tampilan riwayat 30 hari, check-up (umur ditambah faktor risiko dan langkah lanjutan yang disarankan lewat platform kesehatan SATUSEHAT), Streak Card yang bisa dibagikan, dirender sebagai PNG 1080x1350 (unduh atau bagikan, ditampilkan bersama hingga 3 teman), dan bagian data untuk backup dan restore | |
| `/sources` | Daftar sumber bernomor yang sesuai dengan kartu data di sepanjang video | 8 |

### Penyimpanan dan ketahanan terhadap kecurangan

Karena tidak ada server, semua data disimpan di perangkat pengunjung sendiri: IndexedDB sebagai salinan utama dan localStorage sebagai cerminnya, dan saat halaman dimuat, kedua salinan dicocokkan satu sama lain. Setiap entri dirantai ke entri sebelumnya dengan hash SHA-256 ("ledger"), sehingga desainnya secara sengaja membuat sejumlah trik curang umum menjadi mustahil atau terdeteksi, bukan mengandalkan server untuk mengawasinya:

| Trik yang dicoba | Yang terjadi |
| --- | --- |
| Mengedit data tersimpan langsung lewat DevTools | Rantai hash SHA-256 putus; entri itu dan semua entri sesudahnya ditandai "tidak terverifikasi" dan tidak dihitung dalam streak |
| Mengisi hari kemarin secara mundur | Tidak mungkin dilakukan dari dalam aplikasi; menyisipkannya secara manual tetap memutus rantai |
| Memundurkan jam perangkat | Check-in tetap terkunci sampai jam perangkat kembali menyusul entri tersegel terakhir |
| Memajukan jam lalu mengembalikannya | Entri "masa depan" yang dibuatnya dikeluarkan dari hitungan, dan check-in terkunci dengan cara yang sama |
| Mengubah angka streak secara langsung | Streak tidak pernah disimpan sebagai angka; selalu dihitung ulang dari entri yang tersegel dan terverifikasi |
| Mengedit berkas backup yang diekspor | Ditolak saat restore, karena backup membawa segelnya sendiri yang diperiksa sebelum data apa pun dipulihkan darinya |
| Nama tampilan berisi HTML atau tag skrip | Ditampilkan sebagai teks biasa di mana saja, karena setiap data yang diisi pengguna lewat `textContent`, bukan `innerHTML` |

**Batas yang jujur:** tanpa server, orang yang membaca kode JavaScript-nya tetap bisa memalsukan data di perangkatnya sendiri kalau cukup bertekad. Mekanisme ini menutup trik yang mudah dan oportunistik (kecurangan tidak sengaja atau asal coba), bukan penyerang yang sengaja dan paham betul melawan salinan lokal miliknya sendiri.

### Menjalankan lokal

```bash
npm run dev      # http://localhost:4173, disajikan dengan clean URL (paket serve)
npm run check    # cek kunci terjemahan EN/ID sinkron, tautan lokal valid, dan aturan hitungan konsisten
```

Membuka berkas HTML langsung dari filesystem (`file://`) tidak bisa, karena peramban memblokir impor ES module dari berkas lokal demi keamanan; `npm run dev` menyajikan situs lewat `http://` sehingga berjalan normal.

### Deploy ke Vercel

Push folder ini ke GitHub, lalu di Vercel pilih Add New, Project, Import (atau dari terminal di folder ini: `npx vercel`, lalu `npx vercel --prod`). Pengaturan proyek: Framework Preset "Other", Build Command dikosongkan, dan Output Directory `.` (root repositori, karena tidak ada langkah build). `vercel.json` sudah mengatur clean URL (`/check-in`, bukan `/check-in.html`), header keamanan (Content Security Policy yang hanya mengizinkan berkas situs sendiri plus Google Fonts), cache, dan halaman `404.html`. Kode QR di halaman utama dibuat otomatis dari domain yang sedang dibuka, sehingga setelah dideploy, kode itu langsung mengarah ke `https://<domain-anda>/check-in` tanpa perlu konfigurasi manual.

### Struktur

```
index.html  check-in.html  habits.html  me.html  sources.html  404.html
css/        tokens.css (warna, font, mode gelap) · base.css · components.css · pages.css
js/boot.js  mengatur tema dan bahasa sebelum render pertama, agar tidak ada kedipan salah tema
js/core/    dom.js · i18n.js · store.js (IndexedDB + localStorage) · ledger.js (rantai hash) · sha256.js · shell.js (nav, footer)
js/data/    menu.js (item kafe, batas, aturan empat kebiasaan) · sources.js
js/lang/    en.js · id.js
js/pages/   satu modul per halaman
js/art.js   semua ilustrasi, berupa SVG buatan tangan (Kidzy, item menu, ikon); tanpa library ikon eksternal
js/streak-card.js   merender Streak Card ke canvas, lalu mengekspornya sebagai PNG
vendor/     qrcode-generator 1.4.4 (lisensi MIT), disalin lokal, bukan diambil dari CDN
assets/     favicon.svg · icon-512.png · og.png
```
