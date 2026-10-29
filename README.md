# Kidzy Daily

*Your kidney's daily check-in.* Website pendamping video lomba. Semua fitur yang disebut di VO (Scene 1–8) ada dan berfungsi.

Situs statis murni (HTML, CSS, ES modules) tanpa langkah build, tanpa backend, dan tanpa database. Tersedia dua bahasa (EN default, ID lewat tombol atau `?lang=id`), mode terang/gelap, serta tampilan desktop dan mobile.

## Halaman

| URL | Isi | Scene |
|---|---|---|
| `/` | Cerita: hook "What did you eat & drink today?" + seret makanan ke Kidzy, Meet Kidzy, jam kerja ginjal, catatan teman serumah, 42.000 kematian, fungsi ginjal, data dialisis, 7 langkah app, QR, tagline | 1, 2, 3, 7, 8 |
| `/check-in` | Kafe (Minuman, Makanan, Konter apotek) → Kidney Receipt → Swap → "You counted X of 4" → disimpan & disegel | 3, 4 |
| `/habits` | 4 kebiasaan: narasi skrip, *The fix*, status hari ini, data card bersumber [n], gejala | 4, 5 |
| `/me` | Silent Tab (30 hari), Check-Up (umur + faktor risiko + langkah SATUSEHAT), Streak Card (PNG 1080×1350, share/unduh, 3 teman), Data (backup/restore) | 3, 6, 7 |
| `/sources` | Daftar sumber bernomor sesuai data card video | 8 |

## Menjalankan lokal

```bash
npm run dev      # http://localhost:4173 (pakai `serve`, clean URLs aktif)
npm run check    # cek kunci terjemahan EN/ID, link lokal, dan aturan hitungan
```

Membuka file HTML langsung (`file://`) tidak bisa, karena browser memblokir ES modules dari file lokal. Pakai `npm run dev`.

## Deploy ke Vercel

1. Push folder ini ke GitHub, lalu di Vercel pilih **Add New → Project → Import**.
   Atau dari terminal di folder ini: `npx vercel` lalu `npx vercel --prod`.
2. Pengaturan proyek:
   - **Framework Preset:** Other
   - **Build Command:** kosongkan
   - **Output Directory:** `.` (root)
3. `vercel.json` sudah mengatur:
   - clean URLs (`/check-in`, bukan `/check-in.html`)
   - header keamanan (CSP hanya mengizinkan file sendiri + Google Fonts)
   - cache
   - halaman `404.html`
4. QR di halaman utama dibuat otomatis dari domain yang sedang dibuka. Setelah deploy, QR langsung mengarah ke `https://<domain-kamu>/check-in`. Gunakan QR yang sama di video (screenshot dari web yang sudah live).

## Penyimpanan & anti-curang

Data disimpan di perangkat pengguna: IndexedDB sebagai salinan utama dan localStorage sebagai cermin. Saat aplikasi dibuka, kedua salinan dicocokkan, dan salinan yang hilang dipulihkan dari salinan yang lain. Aplikasi juga meminta `navigator.storage.persist()` supaya data tidak dibersihkan otomatis oleh browser.

| Trik | Yang terjadi |
|---|---|
| Mengedit isi storage (DevTools) | Rantai hash SHA-256 putus. Entri itu dan semua entri sesudahnya ditandai "tidak terverifikasi" dan tidak dihitung |
| Mengisi hari kemarin | Tidak mungkin dari aplikasi. Kalau disisipkan manual, rantai putus |
| Memundurkan jam perangkat | Check-in dikunci sampai jam perangkat menyusul |
| Memajukan jam lalu mengembalikannya | Entri "masa depan" tidak dihitung, dan check-in dikunci |
| Mengubah angka streak | Streak tidak pernah disimpan, selalu dihitung ulang dari entri tersegel |
| Mengedit file backup | Ditolak saat restore, karena segel backup ikut dicek |
| Nama berisi HTML/skrip | Ditampilkan sebagai teks biasa, karena semua data pengguna lewat `textContent` |

**Batas yang jujur:** tanpa server, orang yang mempelajari kode JS tetap bisa memalsukan data di perangkatnya sendiri. Lapisan di atas menutup trik yang umum. Batas ini juga ditulis di tab Data supaya tidak menjadi klaim berlebihan.

## Struktur

```
index.html  check-in.html  habits.html  me.html  sources.html  404.html
css/        tokens.css (warna, font, dark mode) · base.css · components.css · pages.css
js/boot.js  set tema & bahasa sebelum render (tanpa kedip)
js/core/    dom.js · i18n.js · store.js (IndexedDB + localStorage) · ledger.js (rantai hash) · sha256.js · shell.js (nav, footer)
js/data/    menu.js (item kafe, batas, aturan 4 kebiasaan) · sources.js
js/lang/    en.js · id.js
js/pages/   satu modul per halaman
js/art.js   semua ilustrasi SVG buatan tangan (Kidzy, menu, ikon); tidak memakai icon library
js/streak-card.js  render Streak Card ke canvas
vendor/     qrcode-generator 1.4.4 (MIT), disalin lokal
assets/     favicon.svg · icon-512.png · og.png
_lama/      versi satu-file sebelumnya (tidak ikut di-deploy)
```

Cara mengubah konten:

- **Teks:** ubah `js/lang/en.js` dan `js/lang/id.js`. Kuncinya harus sama di kedua file; `npm run check` akan memberi tahu kalau ada yang beda.
- **Menu dan nilai gizi:** `js/data/menu.js`.
- **Sumber:** `js/data/sources.js`.

## Aturan hitungan (sesuai skrip)

| Kebiasaan | Dihitung bila | Dasar |
|---|---|---|
| 1. Air | < 8 gelas | Target simulasi; skrip hanya bilang "sip all day" |
| 2. Minuman manis | gula > 50 g **atau** > 1 minuman manis/diet | [5], [10] |
| 3. Makanan asin | natrium > 2.000 mg | [21] |
| 4. Pereda nyeri | ada OAINS diminum | [9], [22], [23] |

Nilai gizi per porsi adalah perkiraan untuk simulasi, dan hal ini disebutkan di halaman check-in.

## Catatan sumber

Kebanyakan sumber sudah dicek dengan publikasi aslinya:

- [9] Soliman 2025: 40 studi, 1.757.118 orang, HR 1,6
- [10] Dai 2024: n = 191.956, HR 1,45
- [12] Laksmi 2018 (survei 2016): 33% orang dewasa
- [13] Fink 2009
- [18] He 2013: 34 uji coba, 3.230 peserta
- [23] Zhang 2017: OR 1,73
- [B] BPJS: 134.057 pasien hemodialisis dan Rp11 T

Ada dua yang perlu dicocokkan dengan guidebook:

- **[A] 42.000 kematian/tahun.** Angka ini hanya ditemukan di sumber sekunder. Ganti rujukannya dengan sumber yang dipakai di guidebook (misalnya tabel GBD/IHME).
- **[C] 19% → 31% (usia 25–34).** Angka ini tidak ditemukan di sumber yang bisa diakses online. Pastikan dengan tabel kelompok umur di Riskesdas 2018 dan SKI 2023.

Nomor A–E adalah huruf sementara. Ganti dengan nomor dari daftar pustaka guidebook di `js/data/sources.js`, lalu sesuaikan link `/sources#s…` di `index.html`, `habits.html`, `js/pages/home.js`, dan `js/pages/me.js`.
