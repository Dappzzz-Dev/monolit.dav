# UPDATE.md — Riwayat Update

> Catatan perubahan untuk manusia & AI. Setiap update: tambah entri baru di atas,
> format: tanggal, judul, apa yang berubah, kenapa, file yang disentuh.

---

## 2026-09-04 — Menghaluskan gerakan static layar TV

- Penyebab patah ditemukan pada animasi `background-position` gradient 2500px dengan `steps(2)`, yang memaksa repaint besar dan menghasilkan lompatan frame.
- Noise dipindahkan ke pseudo-element layar dan digerakkan memakai `transform: translate3d` dengan timing `linear`, sehingga perpindahan lebih kontinu dan ringan.
- Bentuk TV, ukuran layar, tekstur monochrome, dan label error tetap dipertahankan.
- Mode reduced-motion tetap menampilkan static dengan kecepatan lebih lembut, bukan menghilangkannya.

**File:** `404.html`, `UPDATE.md`.

---

## 2026-09-04 — Memperkuat gerakan semut tanpa mengubah desain TV

- Static layar tetap memakai gradient template, tetapi perpindahan layer conic diperbesar agar butiran terlihat benar-benar berjalan.
- `steps(2,end)` menjaga karakter gerak seperti TV rusak, bukan animasi blur yang halus.
- `background-repeat: repeat` ditegaskan agar pola tetap mengisi seluruh layar pada setiap frame.
- Pada `prefers-reduced-motion`, animasi tidak dihapus total; kecepatannya diperlambat menjadi versi yang lebih lembut.

**File:** `404.html`, `UPDATE.md`.

---

## 2026-09-03 — Mengaktifkan kembali gerakan semut layar TV

- Background layar dikembalikan ke shorthand dua-layer persis pola template: radial noise + conic noise.
- Keyframe menggunakan nama dan gerakan template (`b`, posisi layer kedua `60% 60%` ke `60% 50%`) supaya semut benar-benar berjalan, bukan hanya tampak sebagai pola statis.
- `will-change: background-position` ditambahkan hanya pada layar untuk menjaga perpindahan noise tetap halus.

**File:** `404.html`, `UPDATE.md`.

---

## 2026-09-03 — Memperbaiki animasi static TV error

- Lapisan noise layar dikembalikan ke dua `background-image` terpisah seperti template agar parsing browser lebih stabil.
- `background-position` dan `background-size` dibuat eksplisit lalu digerakkan dengan `steps(2)` sehingga efek static/semut TV rusak terlihat jelas.
- Animasi diterapkan ke layar desktop dan mobile, tetap dihentikan saat `prefers-reduced-motion` aktif.

**File:** `404.html`, `UPDATE.md`.

---

## 2026-09-03 — Mengembalikan struktur TV error ke template asli

- Menemukan bug markup pada perbaikan sebelumnya: elemen `.bottom`/kaki TV berada di dalam `.tv`, bukan setelah `</div>` TV seperti template asli.
- Struktur dikembalikan mengikuti urutan template: antenna, TV (curve, screen, lines, controls), lalu bottom di luar TV.
- Elemen template yang sempat hilang (`curve_svg`, `screen_out`, `a_base`, dan inner control button) dikembalikan.
- Animasi static screen dikembalikan ke dua-layer radial/conic noise dengan keyframe background-position milik template, tetap dalam warna monochrome.

**File:** `404.html`, `UPDATE.md`.

---

## 2026-09-03 — Memperbaiki halaman error hosting

- Menemukan bahwa screenshot lama berasal dari `404.html` standalone yang langsung disajikan GitHub Pages; overlay error di `index.html` memang tidak pernah dimuat pada route yang tidak ditemukan.
- `404.html` sekarang memakai konstruksi TV dari template yang diberikan, dengan palet monochrome/dark dan teks putih agar tetap satu tema dengan portfolio.
- State standalone mendukung 404, offline, unreachable, dan error melalui `?error=`; detail teknis aman dapat diteruskan melalui `?msg=`.
- Tombol `Coba lagi` mengulang URL saat ini dan `Kembali ke portfolio` menuju root project.
- Layout responsif untuk mobile, tetap bekerja tanpa external CSS/JS, dan animasi mematuhi `prefers-reduced-motion`.

**File:** `404.html`, `UPDATE.md`.

---

## 2026-09-04 — Memperbaiki titik tujuan globe yang hilang

- Penyebab ditemukan pada `InstancedMesh`: lima titik tersebar di permukaan globe, tetapi bounds lokal instance dapat membuat Three.js melakukan frustum culling terhadap seluruh mesh marker.
- Frustum culling dimatikan khusus untuk mesh titik tujuan dan `renderOrder` diberi prioritas aman.
- Tidak mengubah koordinat, label, warna putih, rotasi, atau aturan titik hanya terlihat di sisi depan.

**File:** `js/globe.js`, `js/globe.min.js`, `UPDATE.md`.

---

## 2026-09-04 — Merapikan Contact section di mobile

- Baris Email, Lokasi, dan Fokus saat ini diubah menjadi susunan label lalu nilai agar tidak berhimpitan pada layar kecil.
- Teks panjang memakai wrapping yang aman, dengan line-height dan padding yang lebih lega untuk scan yang nyaman.
- Card CTA dan tampilan desktop tidak diubah.

**File:** `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-09-04 — Menyembunyikan ghost dan bubble di mobile

- Ghost mascot dan speech bubble sekarang disembunyikan hanya pada viewport `max-width: 900px`.
- Desktop tetap menampilkan ghost dan bubble seperti sebelumnya.
- Penyembunyian memakai CSS sehingga tidak mengubah markup, animasi desktop, layout section lain, atau alur navigasi.

**File:** `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-09-04 — Mobile comfort and performance pass

- Hero mobile dipadatkan menjadi satu kolom dengan margin atas, padding, heading, dan deskripsi yang lebih proporsional.
- CTA tetap dua tombol sejajar pada layar kecil, dengan tinggi touch target minimum 48px; topbar diperkecil lagi khusus layar sangat sempit.
- Globe tetap disembunyikan di mobile sesuai pilihan performa, sementara ghost tetap mengikuti aturan About-only pada mobile.
- Carousel mobile dipendekkan, gambar diberi `loading="lazy"` dan `decoding="async"`, lalu loop canvas dipause saat keluar viewport melalui `IntersectionObserver`.
- Modal project berubah menjadi bottom sheet full-width di mobile; tombol aksi menjadi full-width dan tombol close menjadi 44px.
- Skill tags sekarang wrap secara alami; social links Contact menjadi grid dua kolom dengan touch target minimum 44px.
- Overflow horizontal dikunci pada mobile agar tidak muncul scroll samping dari canvas, metadata, atau teks panjang.

**File:** `css/style.css`, `css/style.min.css`, `js/carousel.js`, `js/carousel.min.js`, `js/projects.js`, `js/projects.min.js`, `UPDATE.md`.

---

## 2026-09-03 — Universal monochrome error TV

Error surface baru ditambahkan langsung ke `index.html` tanpa membuat file halaman khusus:

- TV dari template yang diberikan dipertahankan, lalu palet orange/colorful diubah menjadi charcoal, silver, dan white agar konsisten dengan tema portfolio.
- State `offline`, `not-found`, `unreachable`, dan `error` sekarang memakai satu surface yang sama.
- Error runtime dari `window.onerror` dan `unhandledrejection` menampilkan kode serta detail singkat di layar TV dan detail teknis yang lebih lengkap di bawahnya.
- Tombol `Try again` melakukan reload; `Back to portfolio` menutup surface dan kembali ke Home.
- Jika host melakukan rewrite unknown route ke `index.html`, route yang tidak dikenal otomatis menampilkan state 404.
- State bisa dipanggil dari kode lain melalui `window.showSiteError(type, detail)` tanpa mengubah struktur halaman.
- Offline otomatis dipulihkan saat browser kembali online. Semua perubahan menghormati `prefers-reduced-motion`.

**File:** `index.html`, `css/style.css`, `css/style.min.css`, `js/app.js`, `js/app.min.js`, `UPDATE.md`.

---

## 2026-09-03 — Memperjelas label titik tujuan globe

- Label tujuan yang tidak sedang fokus sebelumnya memakai `opacity: .42`, sehingga teks, border box, dan connector line terlihat hampir hilang di atas globe.
- Opacity label nonaktif dinaikkan menjadi `.82`; label aktif tetap `100%` agar rotasi fokus tetap terasa tanpa mengorbankan keterbacaan.

---

## 2026-09-03 — Globe, project metadata, About timeline, dan CTA polish

Update terintegrasi untuk memperkuat cerita portfolio tanpa mengubah tema dark-monochrome:

**Globe**
- Label tujuan Japan, London, USA, Switzerland, dan Netherlands mendapat connector line pendek dari titik ke label.
- Label tujuan bergantian secara lembut: label aktif terbaca penuh, label lain diredupkan agar tidak bertumpuk.
- Titik kelahiran dibuat lebih jelas dengan pin yang lebih besar dan pulse putih; titik impian tetap berupa dot putih.
- Timer label dibersihkan saat globe di-unmount agar tidak meninggalkan interval.

**Project section**
- Metadata `year`, `role`, dan `tech` ditambahkan ke seluruh project aktif.
- Metadata tampil di modal detail dengan fallback `—` untuk data lama.
- Admin editor dan import JSON mendukung ketiga field tersebut, sehingga update berikutnya tetap mudah dikelola.

**About dan Contact**
- Timeline singkat ditambahkan: `2023 — Started coding`, `2024 — Frontend exploration`, `Now — Exploring with AI`.
- Email dijadikan baris utama yang lebih menonjol dan tombol email CTA dibuat full-width.

**Motion/layout polish**
- Section reveal tidak lagi menggeser seluruh section dengan translate; hanya fade singkat yang dipertahankan agar gerak halaman lebih premium.
- Metadata modal memiliki layout dua kolom di mobile supaya tetap ringkas dan tidak overflow.

**File:** `index.html`, `admin.html`, `data/projects.json`, `css/style.css`, `css/style.min.css`, `js/globe.js`, `js/globe.min.js`, `js/projects.js`, `js/projects.min.js`, `js/admin.js`, `js/admin.min.js`, `js/i18n.js`, `js/i18n.min.js`, `UPDATE.md`.

---

## 2026-09-03 — Scrollbar dark-monochrome polish

Scrollbar halaman diperbarui agar lebih menyatu dengan tema:
- Track dibuat gelap dan tipis dengan divider halus.
- Thumb memakai gradient abu-abu, rounded tactile shape, dan highlight internal.
- Hover menambah kontras serta glow ringan agar posisi scroll mudah terlihat.
- Firefox memakai `scrollbar-width: thin` dan warna native yang setara.
- Tidak menambah JavaScript atau mengubah perilaku scroll.

**File:** `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-09-03 — Tambahkan highlight readable pada label tujuan globe

Label `I want go to ...` sekarang lebih mudah dibaca tanpa mengembalikan panel legend:
- Ditambahkan background hitam transparan dengan blur ringan.
- Border putih tipis dan shadow lembut membuat label terpisah dari titik-titik daratan.
- Teks tetap putih dan tanpa warna kuning agar konsisten dengan titik tujuan.
- Ukuran label tetap compact supaya globe tetap clear.

**File:** `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-09-03 — Clear globe destination markers

Area titik tempat tujuan dirapikan:
- Panel legend/kotak daftar tempat dihapus agar globe lebih clear.
- Titik tujuan Japan, London, USA, Switzerland, dan Netherland dikembalikan ke warna putih.
- Label titik sekarang berbentuk teks langsung: `I want go to <place>`.
- Label tidak lagi memakai box, border, atau warna kuning; hanya text-shadow tipis agar terbaca di atas globe.
- Data lokasi, koordinat, visibility sisi depan, dan interaksi globe tetap dipertahankan.

**File:** `js/globe.js`, `js/globe.min.js`, `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-09-03 — Kembalikan ukuran ghost, pertahankan jarak bubble

Perubahan sebelumnya yang ikut memperbesar ghost dibatalkan karena gambar hanya dimaksudkan sebagai panduan jarak bubble:
- Skala ghost desktop dikembalikan ke `0.8`.
- Ukuran PNG bubble dikembalikan ke `224 × 122px`.
- Bubble memakai jarak kanan dan atas yang sudah disesuaikan, tanpa mengubah ukuran karakter.
- Mobile memakai offset tersendiri agar tetap rapi.

**File:** `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-09-03 — Fine-tune posisi bubble ghost

Bubble PNG digeser sedikit lebih jauh ke kanan dan ke atas agar tidak menempel pada karakter:
- Desktop: jarak horizontal dibuat sedang dengan `left: calc(100% + 14px)`.
- Posisi vertikal dinaikkan secukupnya ke `top: -52px`.
- Mobile mendapat offset lebih kecil agar tetap proporsional pada layar sempit.
- Asset PNG, ukuran bubble, teks, dan animasi tidak diubah.

**File:** `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-09-03 — Use exact supplied PNG speech bubble + repair motion

Bubble sekarang benar-benar memakai file PNG yang diberikan, bukan dibuat ulang dengan CSS:
- Asset asli disimpan sebagai `assets/ghost-speech.png`.
- Transparansi canvas PNG dipertahankan; CSS hanya melakukan crop melalui `background-size`/`background-position` agar bentuk asli tampil proporsional.
- Teks tetap memakai `data-i18n="ghost.speech"` dan ditempatkan di area putih bubble.
- Posisi bubble tetap di kanan atas ghost, dengan buntut asli mengarah ke karakter.
- Animasi diterapkan langsung ke `.ghost-speech` menggunakan keyframe `upNDown`, sehingga bubble pasti ikut naik-turun seperti ghost.
- Reduced-motion memakai tempo lebih lambat, bukan menghilangkan bubble.

**File:** `assets/ghost-speech.png`, `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-09-03 — Penataan ulang About Me: dua baris kiri + ghost kanan

Section About kini mengikuti komposisi referensi yang diminta:
- Kartu **About Me** berada di kiri atas.
- Kartu kontribusi GitHub berada di kiri bawah dengan jarak yang lebih lega.
- Ghost mascot berada di kanan atas.
- Area kanan di bawah ghost tetap kosong agar komposisi memiliki ruang napas dan tidak terasa penuh.
- Desktop memakai grid dua kolom dengan alignment ke atas; mobile tetap turun menjadi satu kolom dan mengikuti optimasi mobile yang sudah ada.

**File:** `css/style.css`, `css/style.min.css`, `UPDATE.md`.

---

## 2026-08-27 — Tampilan mobile: anti-lag + rapi (satu tema)

Situs kini responsive penuh di semua device; khusus mobile dirapikan & dihemat bobotnya.

**Anti-lag (sumber berat dimatikan di layar sempit):**
- **Globe 3D tidak di-mount di mobile** (`max-width:900px`). WebGL render loop + ribuan titik partikel adalah beban terberat di HP. `js/globe.js` kini cek `matchMedia('(max-width:900px)')` sebelum `mountGlobe()`; di layar sempit mount dilewati (desktop tetap globe). Stage yang kosong disembunyikan via CSS.
- **Ghost mascot disembunyikan** di mobile (banyak div beranimasi CSS = lag saat scroll).
- **DPR carousel dibatasi 1.25 di mobile** (daripada 2) — setengah piksel GPU di HP; desktop tetap 2x.

**Penataan mobile (hero jadi teks penuh, terpusat, jelas):**
- `.stage` (globe) hilang → hero tampil sebagai blok teks terpusat.
- Typography di-tune: nama pakai `clamp()`, role/bio dirapikan, max-lebar bio 44ch, CTA & social terpusat & wrap.
- Layar ≤640px: padding container/section dirapikan, judul & lead tidak terlalu besar.

**File:** `index.html` (tidak berubah), `js/globe.js`, `js/carousel.js`, `css/style.css` (+ `.min`).

---

## 2026-08-27 — Redesign jam WIB footer (elegant, tidak monoton)

- Jam footer didesain ulang dari teks kecil jadi **blok jam minimal yang elegan**, di kanan footer-bottom (dipisah garis halus): label `WIB` kecil, **`HH:MM` besar (20px)** + **detik `SS` kecil**, plus **tanggal** (hari, tanggal, bulan WIB) di bawahnya.
- Titik dua di antara jam & menit **berkedip halus** tiap detik via CSS `.is-odd` (transition opacity, tanpa render-DOM tiap detik — JS cuma re-render saat nilai berubah).
- Angka pakai `tabular-nums` agar tidak lompat layout; monochrome sesuai tema.
- Responsif: di layar sempit jam rata kiri, border dibuang.
- **File:** `index.html`, `js/app.js`, `css/style.css`, (`style.min.css` di-clean-css ulang).

---

## 2026-08-27 — Hapus fitur PWA (permanen GUI)

- Fitur PWA di-rollback seluruhnya: **dihapus** `sw.js`, `manifest.webmanifest`, `pwa-192x192.png`, `pwa-512x512.png`.
- `index.html`: hapus `<link rel="manifest">` + `apple-touch-icon` (icon tetap `favicon.svg`).
- `js/app.js`: hapus kode register service worker.
- Alasan: belum penting & menambah kompleksitas cache utk saat ini. Situs kembali jadi halaman web statis murni (tanpa SW).
- **File:** `index.html`, `js/app.js`, `UPDATE.md` (+ hapus 4 file PWA).

---

## 2026-08-27 — 5 fitur baru: jam WIB, status GitHub, PWA, analitik privasi, perf

**1. Jam WIB realtime (footer)**
- Footer kini menampilkan jam lokal **Asia/Jakarta (WIB)** yang update tiap detik (`HH:MM:SS`, angka tabular agar tak lompat layout). Diawali `--:--:--` (fallback jika JS mati).
- **File:** `index.html`, `js/app.js`, `css/style.css`.

**2. Status GitHub online (kartu kontribusi)**
- Indikator dot di header kartu kontribusi: **hijau ber-glow** = API GitHub tercapai (online), abu-abu = gagal (offline). Dot bahasa-netral (i18n-safe), tooltip `GitHub: online/offline`, `aria-label` dari kunci i18n baru `gh.status` (4 bahasa).
- **File:** `index.html`, `js/app.js`, `js/i18n.js`, `css/style.css`.

**3. Service Worker / PWA**
- `sw.js` baru: cache-first utk asset statis `.min`, network-first utk dokumen (update langsung), stale-while-revalidate utk gambar, versi `v1` + cleanup cache lama, `skipWaiting`/`clients.claim`.
- `manifest.webmanifest` baru (standalone, theme `#0a0a0a`, ikon 192/512), ikon PNG 192 & 512 dibuat pure-Node (rounded dark + "M" putih).
- Head index.html kini ada `<link rel="manifest">` + `apple-touch-icon`. Register SW di `app.js` (hanya di origin secure).
- **Catatan:** SW aktif hanya via `https`/`localhost` (by design). Setelah deploy, browser butuh 1x kunjungan utk "install" SW; cache lama dibersihkan otomatis saat versi baru.
- **File:** `sw.js` (baru), `manifest.webmanifest` (baru), `pwa-192x192.png`/`pwa-512x512.png` (baru), `index.html`, `js/app.js`.

**4. Analitik privasi (GoatCounter)**
- Snippet `gc.zgo.at/count.js` dipasang (cookieless, tanpa banner consent). Endpoint default `data-goatcounter="https://zgo.at/count"` langsung jalan tanpa akun.
- **Untuk melihat statistik sendiri:** daftar di goatcounter.com lalu ganti `data-goatcounter` → `https://<kode-anda>.goatcounter.com/count`.
- CSP diperluas: `script-src` + `connect-src` kini mengizinkan `https://gc.zgo.at`.
- **File:** `index.html`.

**5. Perf / Lighthouse budget**
- `preconnect` ditambah untuk `https://unpkg.com` (Three.js globe) & `https://fonts.googleapis.com`.
- `css/style.min.css` di-render ulang via `clean-css` setelah penambahan CSS jam & status (brace balance OK, 12 media query utuh).
- **File:** `index.html`, `css/style.min.css`.

---

## 2026-08-27 — Perf globe: turunkan resolusi mask darat

- Mask pembentuk titik benua di globe diturunkan dari 2048×1024 → **1024×512**. Mask ini cuma dipakai menempatkan titik-titik di atas daratan; pengurangan resolusi mempercepat pembentukan saat load tanpa beda visual berarti. Ditandai komentar `honey:`.

**File:** `js/globe.js`, `js/globe.min.js`

---

## 2026-08-27 — Security hardening + perf (dead code)

- **Eksternalisasi context-menu**: script + CSS klik-kanan "Inspect Element" dipindah dari inline `<script>`/`<style>` di `<head>` ke file baru `js/context-menu.js` (+ `.min.js`).
- **CSP diperketat**: `script-src` kini tanpa `'unsafe-inline'` (tidak ada lagi script inline yang bisa jalan). `style-src 'unsafe-inline'` dipertahankan karena GSAP/JS memakai inline style.
- **JSON-LD eksternal**: blok structured-data Person dipindah dari inline ke `structured-data.jsonld` (di root, bukan `/data/` agar tidak terblokir `robots.txt`).
- **Perf**: hapus dead code di `createSniperEffect` (duplikat `gsap.set(line,{onUpdate})` yang langsung ditimpa timeline `gsap.to` — percuma tiap klik di mode default sniper).

**File:** `index.html`, `js/context-menu.js` (baru), `js/context-menu.min.js` (baru), `structured-data.jsonld` (baru), `js/click-effects.js`, `js/click-effects.min.js`

---

## 2026-08-27 — SEO audit + fix total statis

Optimasi SEO & perbaikan bug:
- **SEO head** (`index.html`): tambah meta description, author, theme-color, canonical, Open Graph (`og:type`, `og:title`, `og:description`, `og:url`, `og:locale`), Twitter card, dan **JSON-LD schema Person** (nama, jobTitle, alamat Sukoharjo, sameAs sosial, knowsAbout skill).
- **Title** diperkaya jadi "Daffa Farash — Frontend Developer | monolit" di HTML + keempat bahasa i18n.
- **`sitemap.xml`** baru + referensi `Sitemap:` di `robots.txt`.
- **Fix bug total statis**: hapus fallback `STATIC=1787` di `js/app.js` — total cuma pernah menampilkan data asli (0 jika memang nol / gagal muat), tidak pernah angka karangan. Fallback HTML diganti "Total: —".

**File:** `index.html`, `js/app.js`, `js/app.min.js`, `js/i18n.js`, `js/i18n.min.js`, `sitemap.xml`, `robots.txt`

> **Catatan penting — SSR:** situs ini statis di GitHub Pages (tanpa server runtime), jadi SSR sungguhan tidak mungkin di sana. Lihat pembahasan berikutnya untuk opsi (SSG/ISR lewat Vercel/Netlify, atau tetap statis + prerender).

---

## 2026-08-26 — Fix total statis + bulan terpotong

- **Bug total**: jalur cache `loadData` return lebih awal & tidak mengisi `counts`, jadi `counts` selalu kosong → total jatuh ke `STATIC (1787)` & tidak sinkron data. Diperbaiki: cache kini menyimpan `mapped` + `counts` sekaligus; key naik ke v4 (muat ulang). Total sekarang akurat per tahun: 2026=66, 2025=34, 2024=12, 2023=1 (sesuai data GitHub asli).
- **Bug bulan terpotong**: label JAN..DEC tadinya diklip `overflow:hidden` di sel 12px → "JAN" jadi "ja". Diperbaiki: label bulan kini `position:absolute` di atas kolom minggu, tidak dipotong, tampil penuh.
- Hari: tetap Sen/Rab/Jum (7 baris tersedia, teks label hanya 3 hari ala GitHub — diterima).

**File:** `js/app.js`, `js/app.min.js`, `css/style.css`, `css/style.min.css`

---

## 2026-08-26 — Responsetrap bulan/hari & scroll heatmap

Perbaiki letak & kelapangan chart kontribusi:
- **Year chip pindah ke header card** (kanan, sejajar badge) → tidak lagi menimpa label Sen/Januari di dalam chart.
- **Label bulan** diindent sejajar heatmap (ikut gutter hari 30px) dan pakai `grid-auto-columns` yang sama dengan heatmap → posisi JAN..DEC presisi di atas kolom minggu, tidak tertutup.
- **Desain scrollbar** dirapikan: tipis (6px), track transparan, thumb hijau transparan — scroll tetap ada tapi tidak mengganggu kerapian.
- **Sel heatmap diperkecil** 13px→12px biar chart lebih ringkas; tetap pakai scroll horizontal di dalam `.gh-timeline` (bukan scroll halaman).

**File:** `index.html`, `css/style.css`, `css/style.min.css`, `js/app.js`, `js/app.min.js`

---

## 2026-08-26 — GH heatmap lengkap: label bulan + label hari + year chip

Kembalikan & lengkapi fitur waktu di chart kontribusi agar ala GitHub penuh:
- **Year chip** (`#gh-year`) dipulihkan di pojok kiri atas panel — menampilkan tahun yang sedang dipilih, berubah saat navigasi.
- **Label bulan** (`#gh-months`): JAN..DEC diletakkan di atas kolom minggu tempat tanggal 1 tiap bulan (terverifikasi posisi benar untuk 2023 & 2026).
- **Label hari** (`#gh-days`): Sen/Rab/Jum di gutter kiri ala GitHub.
- **Heatmap** 7 baris hari × 53 kolom minggu, warna hijau level 1-4.
- Layout: `.gh-timeline` panel + `.gh-body` (flex: gutter hari + heatmap). Bulan diindent sejajar heatmap.
- Semua tetap dikendalikan tombol kiri/kanan; total per tahun akurat.

**File:** `index.html`, `css/style.css`, `css/style.min.css`, `js/app.js`, `js/app.min.js`

---

## 2026-08-26 — Fix heatmap tidak render (bug gate `!mapped` + deklarasi ganda)

Sel hijau tidak pernah muncul. Root cause:
- `showYear` mengecek `if(!mapped)` untuk memicu `loadData()`, TAPI `mapped` diinisialisasi `{}` (truthy) → `!mapped` selalu false → data tidak pernah di-fetch → `mapped` tetap kosong → tidak ada sel hijau.
- Terdapat deklarasi ganda `let counts` (duplikat) yang bisa error.
- Dua fetch terpisah (mapped + counts) padahal satu fetch cukup.

Fix: pakai flag `loaded` (boolean) untuk mengontrol load; hapus deklarasi counts ganda; gabung mapped+counts dalam satu fetch API; cache key naik ke v3 (browser yang sudah simpan cache v2 kosong tidak terpakai). Verifikasi syntax + minify.

**File:** `js/app.js`, `js/app.min.js`

---

## 2026-08-26 — Fix GH heatmap selalu tahun 2026 (render chart custom per tahun)

Masalah: `ghchart.rshah.org` tidak bisa render grafik per tahun, jadi apapun tahun yang dipilih, visual selalu sama (2026).

Fix: ganti `<img>` ghchart dengan **heatmap CSS custom** yang dirender dari data jogruber v4 (`contributions` array harian, field `level` 0-4):
- Grid 7 baris (hari) × kolom (minggu), warna hijau level 1-4 (pakai palette GitHub: #0e4429/#006d32/#26a641/#39d353).
- Render ulang penuh tiap ganti tahun → setiap tahun menampilkan pola sel hijau-nya sendiri.
- Total = sum count per tahun (bukan dari level).
- Timezone-safe: format tanggal pakai getFullYear/getMonth/getDate lokal (bukan toISOString UTC yang bisa geser 1 hari).
- Dua popoh cache (level map + count map) 30 menit.
- Verifikasi via node dengan data asli: 2023=1 sel, 2024=4, 2025=15, 2026=20 sel hijau.

**File:** `index.html`, `css/style.css`, `css/style.min.css`, `js/app.js`, `js/app.min.js`

---

## 2026-08-26 — Fix globe 3D tidak muncul (CSP blokir three.js + geojson)

Root cause: CSP `script-src` & `connect-src` yang ditambah saat security hardening tidak mencantumkan domain yang dipakai globe:
- `js/globe.js` import Three.js dari `https://unpkg.com/three@0.154.0/...` → diblokir `script-src` → canvas kosong/tidak muncul.
- globe.js juga fetch data landmark geojson dari `https://raw.githubusercontent.com/...` → diblokir `connect-src` → landmark gagal.

Fix: tambahkan `https://unpkg.com` ke `script-src` dan `https://raw.githubusercontent.com` ke `connect-src` di meta CSP index.html. GSAP (cdnjs) & fonts sudah benar sejak awal.

**File:** `index.html`

---

## 2026-08-26 — Fix GH navigator: layout + total live (bug CSP & counting)

Perbaikan 3 bug pada fitur navigator tahun kontribusi:
- **Layout:** `.gh-nav` diganti dari flex ke grid `auto 1fr auto` → tombol kiri/kanan SELALU di samping chart (bukan numpuk atas/bawah).
- **Total 0 / stuck (root cause):** CSP `connect-src` hanya mengizinkan `jogruber.github.io`, sedangkan API yang dipakai `github-contributions-api.jogruber.de`. Semua `fetch` diblokir browser → selalu fallback ke 1787 (2026) / 0 (2023/2024). Tambahkan domain API ke CSP.
- **Total per tahun tidak akurat:** ganti dari `data.total[year]` → hitung langsung menjumlahkan `count` setiap entry `contributions` di tahun tsb. Terverifikasi: 2023=1, 2024=12, 2025=34, 2026=60. Cache 30 menit per seluruh tahun (satu fetch).

**File:** `index.html`, `css/style.css`, `css/style.min.css`, `js/app.js`, `js/app.min.js`

---

## 2026-08-26 — GitHub contribution year navigator

Fitur navigasi tahun untuk bagian kontribusi GitHub:
- **Tombol panah kiri/kanan** di samping chart kontribusi
- **Klik kiri:** lihat tahun sebelumnya (minimal 2023, tahun mulai coding)
- **Klik kanan:** lihat tahun sesudahnya (maksimal tahun ini, 2026)
- **Disabled state:** tombol tidak bisa diklik kalau sudah di batas tahun
- **Total badge update:** jumlah kontribusi berubah sesuai tahun yang dipilih
- **Year chip update:** tahun di pojok chart berubah sesuai navigasi
- **Cache:** total kontribusi per tahun di-cache 30 menit di localStorage
- **Desain:** tombol glass minimalis, hover hijau (#3fb950), active scale

**Catatan:** ghchart.rshah.org tidak support parameter tahun, jadi visual chart selalu menampilkan tahun ini. Total angka sudah akurat per tahun dari jogruber API.

**File:** `index.html`, `css/style.css`, `js/app.js`, `js/app.min.js`

---

## 2026-08-26 — Security hardening (minify, CSP, 404, robots.txt)

Peningkatan keamanan ringan tanpa menyulitkan debugging:
- **Minify JS:** terser compress+mangle → 8 file .min.js (original tetap ada untuk debugging)
- **Minify CSS:** manual strip whitespace → 2 file .min.css
- **HTML:** index.html + admin.html sekarang load file .min
- **CSP meta tag:** batasi script/style/font/img/connect source hanya ke domain yang diperlukan
- **X-Frame-Options: DENY** → cegah clickjacking
- **X-Content-Type-Options: nosniff** → cegah MIME sniffing
- **Referrer-Policy: strict-origin-when-cross-origin** → batasi referrer info
- **Custom 404.html:** halaman error custom monochrome, tidak bocorkan struktur situs
- **robots.txt:** block crawler ke /admin.html, /js/, /css/, /data/, /assets/projects/
- Admin tidak ditautkan dari halaman publik (sudah sejak awal)

**File:** `index.html`, `admin.html`, `404.html`, `robots.txt`, `js/*.min.js`, `css/*.min.css`

---

## 2026-08-26 — Fix ghost bubble overflow + disable right-click

Bug fix & hardening:
- **Ghost bubble overflow:** hapus `white-space: nowrap` → text wrap natural; ganti `max-width:260px` → `220px` + `width:max-content` + `word-break:break-word`. Responsive ≤900px: `max-width:180px`.
- **Disable right-click:** tambah `document.addEventListener('contextmenu', e => e.preventDefault())` di `<head>` index.html. Klik kanan tidak memunculkan menu browser.
- Scan seluruh JS (8 file) → semua lolos syntax check. Tidak ada bug lain ditemukan.

**File:** `css/style.css`, `index.html`, `UPDATE.md`

---

## 2026-08-26 — Ghost: tambah speech bubble (i18n ×4)

Ghost di About section mendapat gelembung percakapan ("stop!! sini deh liat dulu apa yang ada di sampingku"). 
- Desain: bubble putih semi-transparan, rounded corners, tail pointer ke bawah, tilt -2deg biar playful.
- Animasi: `bubblePop` (scale 0→1 + fade) saat load, lalu `bubbleWobble` (tilt naik-turun 2.8s loop).
- I18n: `ghost.speech` ×4 bahasa (id/en/ja/es).
- Mobile ≤900px: font kecil, white-space wrap, max-width ketat.
- `#ghost` overflow:visible agar bubble tidak terpotong.

**File:** `index.html`, `css/style.css`, `js/i18n.js`

---

## 2026-08-26 — README: hapus tagline intro (user ganti nanti)

Paragraf pembuka "Satu blok solid..." + asal-usul nama Monolit.dav dihapus dari README atas permintaan user. Judul `M O N O L I T . D A V` + badge tetap ada. User akan isi tulisannya sendiri nanti.

**File:** `README.md`

---

## 2026-08-26 — Bersih-bersih em-dash di seluruh teks situs

Lanjutan kebijakan "jangan pakai — sebagai penyambung kata": seluruh copy user-facing dibersihkan di 4 bahasa sekaligus.
- Pemisah gaya judul (role line, title tab, subjek email) kini pakai `·` (middot).
- Penyambung kalimat diganti titik/koma/kata sambung natural per bahasa (id/en/ja/es).
- Rentang angka (1–2 hari) tetap memakai en-dash — itu tipografi yang benar, bukan kebiasaan AI.
- Fallback statis index.html + deskripsi Pamer.co di projects.json ikut disinkronkan.
- Verifikasi: node --check lolos; 26 key utuh di 4 kamus; grep em-dash = 0.

**File:** `js/i18n.js`, `index.html`, `data/projects.json`

---

## 2026-08-26 — README: bersihkan em-dash (gaya tulis manusiawi)

User: tanda "—" sebagai penyambung kata terasa kaku/terlihat AI. Ketujuh kemunculan di README diganti penghubung alami (kalimat pendek, kata sambung "jadi/tapi", titik). Cerita asal-usul nama Monolit.dav dipertahankan tanpa dash. Sisa em-dash: 0.

**File:** `README.md`

---

## 2026-08-26 — README: hapus struktur folder & jejak admin (keamanan)

Permintaan user: pohon folder di README berisiko keamanan. Dihapus:
- Section "anatomi folder" (tree lengkap termasuk posisi admin.html).
- Instruksi eksplisit membuka `admin.html` + penjelasan login PAT (lebih bocor daripada tree-nya) → diganti kalimat netral "detail internal tidak dipublikasikan".
- Ganti nama section jadi "anatomi kode" dengan ajakan tetap belajar dari kode yang terbuka.

**File:** `README.md`

---

## 2026-08-26 — GitHub: repo monolit.dav + README baru

- Repo lokal di-init, `.gitignore` menyaring semua folder tool + `node_modules` + `package.json` (sisa langchain, tak dipakai situs) — hanya file inti yang ter-track.
- Repo dibuat via `gh repo create` → push pertama (25 file) → di-rename dua kali sesuai pilihan user: `portfolio` → `monolit.dev` → **monolit.dav** ("dav" = plesetan Daffa). Remote origin otomatis mengikuti.
- Folder lokal masih bernama `projctt2` (rename tertahan lock proses — panduan manual sudah diberikan; setelah rename, hubungan git tidak terpengaruh).
- **README.md ditulis ulang total**: gaya terminal (blok `$ whoami`, tree folder), badge shields monokrom, tabel fitur, cara clone + Live Server, hint dashboard admin, kontak. Nada santai-humanis, tanpa emoji, identitas Monolit.dav.
- README lama diganti karena usang (nama "Dafara", fitur toggle yang tak ada lagi, jejak co-author Copilot).

**File:** `README.md`, `.gitignore`, remote repo

---

## 2026-08-24 — Admin dashboard baru (gaya Pamer.co, fitur sesuai pesanan)

**Permintaan:** halaman admin meniru struktur dashboard Pamer.co milik user — tapi hanya fitur: tambah gambar project, link Live Demo, link GitHub, deskripsi. Tanpa kategori/tahun/tech-stack.

**Diadopsi dari Pamer.co** (`Pamer.co/app/dashboard/*`): layout sidebar kiri (brand + nav ikon + user/logout di bawah), page-head bergaris bawah, Overview berupa grid kartu (gambar atas, deskripsi clamp-3, tombol GitHub/Demo, Edit/Hapus), search bar, stats bar "N project ditampilkan".

**Dibangun lokal (tetap tema monokrom gelap):**
- **Login gate** full-screen: PAT sebagai kunci (validasi live ke GitHub API; token hanya di sessionStorage). Berhasil → shell muncul; keluar/gagal → kembali ke gate.
- **Overview:** grid kartu responsif + pencarian judul/deskripsi + stats bar; kartu = pratinjau situs user.
- **Projects:** list terurut (↑↓ = urutan carousel) + Export/Import JSON + Publish ke GitHub (Contents API — mekanisme sinkron ke situs publik, tidak berubah).
- **Editor modal** sama seperti sebelumnya (judul, deskripsi, gambar terkompres, demo, repo).
- Sidebar melipat jadi top bar horizontal di ≤900px.
- Verifikasi: `node --check` lolos; audit otomatis — 41 id elemen yang dirujuk JS semuanya ada di HTML; tidak ada handler ganda (login via submit form saja).

**Rencana lanjut:** bila pindah ke Supabase — ganti lapisan simpan (draf localStorage + publish Contents API → tabel `projects` + Storage untuk gambar); UI tidak perlu berubah besar.

**File:** `admin.html`, `css/admin.css`, `js/admin.js`

---

## 2026-08-24 — Rewrite copy: hero & About tidak saling mengulang

**Masalah:** bio hero dan kartu About memuat 3 fakta yang sama (mulai ngoding/2023, fokus front-end, Indonesia) dengan kalimat berbeda — pemborosan.

**Prinsip baru:** hero = hook (apa), About = cerita (siapa & bagaimana).
- **Hero bio** dipangkas jadi satu kalimat: fokus pada apa yang dibuat + sisi ngulik AI.
- **About bio** kini berisi cerita yang belum ada di mana pun: mulai iseng 2023 → nagih → sekarang perdalamin React/JS + eksplorasi AI.
- Nada bahasa di-*humanize*: santai kekinian ("cuma buat iseng — eh, ternyata nagih", "ngulik") tapi tetap enak dibaca semua kalangan; disesuaikan natural di EN/JA/ES (bukan terjemahan kaku).
- Fallback statis HTML ikut disamakan.

**File:** `js/i18n.js`, `index.html`

---

## 2026-08-24 — Chart kontribusi kembali hijau + tahun realtime

**Laporan user:** kotak aktif vs kosong tak terbedakan, dan minta label tahun dekat sumbu chart.

**Perubahan:**
- **Warna chart:** `/ffffff/` (monokrom — penyebab semua kotak terlihat sama) diganti **hijau GitHub `40c463`**, menyatu dengan badge dashed hijau kartu; hari aktif kini jelas kontras dengan hari kosong di panel `#0d1117`.
- **Tahun realtime:** chip `#gh-year` diposisikan absolut di sudut kiri-atas chart — tepat di perpotongan label bulan (atas) dan label hari (kiri). Di-update tiap detik oleh `js/app.js` (guard: hanya menulis saat berubah), sehingga berganti tahun otomatis tepat malam tahun baru tanpa reload. Fallback statis "2026" untuk no-JS.
- Struktur HTML: img dibungkus `.gh-chart-wrap` (anchor posisi chip); margin-top pindah ke wrapper.

**File:** `index.html`, `css/style.css`, `js/app.js`

---

## 2026-08-24 — Judul kartu GitHub: "My GitHub Contributions"

Judul kartu grafik kontribusi kini memuat kata "Contributions" dan diterjemahkan di keempat bahasa (ID: Kontribusi GitHub Saya · EN: My GitHub Contributions · JA: 私のGitHubコントリビューション · ES: Mis contribuciones de GitHub). Fallback statis HTML ikut disamakan; `.dev-head` sudah `flex-wrap` sehingga judul panjang aman di layar sempit.

**File:** `js/i18n.js`, `index.html`

---

## 2026-08-24 — Fix lanjutan i18n: posisi nav & kartu About

**Laporan user:** (1) menu Home dkk. jadi aneh penempatannya, (2) teks About masih Inggris padahal bahasa Indonesia.

**Perbaikan:**
- **Posisi nav:** topbar punya 3 anak (brand, nav, globe) sehingga `justify-content:space-between` mendorong nav ke tengah. Diubah: `flex-start` + `margin-left:auto` pada `.radio-input` → brand kiri, nav+globe bergrup di kanan seperti semula; mode mobile tetap tersusun rapi.
- **Kartu About diterjemahkan** ("About Me", paragraf bio, "My GitHub") ke 4 bahasa.
- **Mekanisme baru:** `data-i18n-html` (teks ber-markup `<strong>` — string dari kamus sendiri, bukan input user) dan `data-i18n-title` (tooltip badge kontribusi).
- Audit menyeluruh: 26 key terverifikasi ada di keempat kamus; sisa teks tanpa terjemahan memang disengaja universal (chip skill, simbol ×/↑, label "Email").

**File:** `css/style.css`, `index.html`, `js/i18n.js`

---

## 2026-08-24 — Fitur multi-bahasa: deteksi otomatis + picker manual

**Permintaan:** Web mendeteksi bahasa user (Indonesia → ID, negara lain → bahasanya), plus tombol pilihan bahasa.

**Implementasi (`js/i18n.js` baru):**
- **Deteksi:** pilihan tersimpan (localStorage `dafara.lang`) > `navigator.language` (id→ID, ja→JA, es→ES, lainnya→EN) > default EN. Tanpa API eksternal — bahasa browser mencerminkan negara user.
- **4 bahasa penuh:** Indonesia, English, 日本語, Español — semua string UI diterjemahkan (nav, hero, projects, contact, footer, modal aria, mailto subject, judul dokumen).
- **Picker:** pill glass di ujung kanan topbar (ikon globe + kode bahasa) → dropdown gelap blur senada tema; klik luar/Esc menutup; fokus keyboard ditangani.
- Mekanisme: atribut `data-i18n` / `data-i18n-aria` / `data-i18n-mailto`; event `langchange` -> `sections.js` re-measure lebar pill indikator nav.
- Teks statis di HTML = fallback ID; i18n apply berjalan sinkron saat load agar tidak ada kilat bahasa salah.
- Verifikasi otomatis: 22 key yang dipakai HTML ada di keempat kamus; node --check lolos.

**Catatan:** Kartu About ("Hello world!…") sengaja tetap Inggris di semua bahasa — itu identitas visual kartu dev. Deskripsi proyek dari `data/projects.json` mengikuti isi admin (konten, bukan UI).

**File:** `js/i18n.js`, `index.html`, `css/style.css`, `js/sections.js`

---

## 2026-08-24 — Fix: animasi ghost berhenti (terlihat seperti PNG statis)

**Gejala:** Karakter ghost di About tidak beranimasi sama sekali.

**Penyebab:** Bukan kode ghost-nya (verbatim & utuh) — melainkan blok aksesibilitas tambahan `@media (prefers-reduced-motion: reduce){ ... animation:none }` yang dipasang saat redesain About. Saat OS/browser melaporkan "reduce motion" (mis. Windows: Animation Effects OFF), SEMUA animasi ghost dibekukan.

**Perubahan:** Blok freeze dihapus dari `css/style.css` — mascot kini selalu beranimasi sesuai permintaan owner. Kode verbatim Uiverse tidak disentuh.

**File:** `css/style.css`

---

## 2026-08-24 — GitHub card: total kontribusi LIVE + chart jadi monokrom

**Pertanyaan user:** Apakah kotak-kotak & total sinkron dengan GitHub asli?

**Jawaban & perubahan:**
- Kotak-kotak (ghchart) memang sudah live sejak awal — data diambil ulang tiap load halaman.
- Warna chart hijau default → **monokrom putih** via `ghchart.rshah.org/ffffff/Dappzzz-Dev`.
- Badge "Total: 1,787" tadinya DUMMY → kini **live**: `js/app.js` fetch `github-contributions-api.jogruber.de/v4/Dappzzz-Dev` (publik, tanpa token), ambil total tahun berjalan, cache localStorage 30 menit, fallback teks statis bila gagal. Terverifikasi: total 2026 = 40.
- Badge diberi atribut `data-gh-total`; angka statis tinggal sebagai fallback no-JS.

**File:** `index.html`, `js/app.js`

---

## 2026-08-24 — Redesain section About (tema hacker/dev + ghost) menimpa yang lama

**Klarifikasi:** Permintaan About Me sebelumnya ternyata untuk MENIMPA section About di `index.html`, bukan halaman standalone. File `about.html` + `css/about.css` dihapus (menganggur, tidak tertaut).

**Perubahan:**
- Section `#about` kini: dua kartu dev monospace liquid-glass — "About Me" (teks spec verbatim + baris `$ ls skills/` chips stack nyata) dan "My GitHub" (badge dashed hijau "Total: 1,787" + chart live `ghchart.rshah.org/Dappzzz-Dev`).
- Ghost piksel animasi dipindah utuh ke kolom kanan section (HTML+CSS verbatim, animasi disentuh; reduced-motion tetap dibekukan).
- CSS lama `.skills` dihapus karena tidak terpakai. Responsif <900px satu kolom.
- Sisa halaman tetap tema monokrom glass — hanya About yang bergaya baru.

**File:** `index.html`, `css/style.css` (hapus `about.html`, `css/about.css`)

---

## 2026-08-24 — Halaman About Me standalone (tema hacker/dev + ghost animasi) — SUPERSEDED

> Dibatalkan: ternyata dimaksudkan menimpa section About di `index.html` (lihat entri di atas). File `about.html` & `css/about.css` sudah dihapus; desainnya kini hidup di section About.

**Permintaan:** Halaman "About Me" tunggal dark mode monospace: card About, card GitHub dengan badge total kontribusi + chart live, karakter ghost animasi di kanan.

**Perubahan:**
- `about.html` — grid dua kolom (konten kiri, ghost kanan); ghost dipaste persis dari spec (animasi tidak disentuh).
- `css/about.css` — bg #000 murni; Space Mono/Fira Code; kartu liquid-glass (#2d2d2d alpha + blur); judul italic bold dengan prefix komentar `//`; badge kapsul dashed GitHub-green "Total: 1,787"; chart `ghchart.rshah.org/Dappzzz-Dev` (username akun asli agar sinkron — bukan DaffaFarash) dalam panel #0d1117 pixelated.
- Shadow ghost diberi glow halus agar terlihat di atas hitam murni; `prefers-reduced-motion` membekukan animasi mascot (a11y).
- Responsif <900px: satu kolom, ghost pindah ke bawah dengan scale .65.

**File:** `about.html`, `css/about.css`

---

## 2026-08-24 — De-slop pass: kurangi ciri khas AI (tema monokrom tetap)

**Permintaan:** Kurangi kesan "AI slop" tanpa keluar dari tema.

**Perubahan:**
1. **Font berkarakter:** Instrument Serif untuk display (.name hero 58px, .section h2 30px, brand topbar, judul kartu CTA & modal-ready) — Inter tetap untuk body. Bukan lagi satu font di semua tempat.
2. **Copy spesifik, bukan template:** role → "Frontend Developer — Sukoharjo, Indonesia"; bio hero cerita mulai 2023; lead Contact spesifik ("Punya ide proyek, butuh bantuan frontend…"); CTA card "Ceritakan proyekmu".
3. **Kurangi panel kaca:** info kontak kiri jadi hairline rows polos (`.contact-list`, sengaja flat) — hanya kartu CTA kanan yang berglass. Row "Status ● Terbuka…" yang template banget diganti "Fokus saat ini → Frontend web apps & eksperimen AI".

**File:** `index.html`, `css/style.css`

---

## 2026-08-24 — Bangun ulang footer

**Permintaan:** Footer copyright dibuat lebih menarik.

**Perubahan:** Footer sebelumnya tanpa CSS sama sekali (teks polos). Sekarang dua baris bergaya glass hairline senada topbar:
- Baris atas: brand "Daffa • Frontend" + tag stack (Vanilla JS · Three.js · GSAP) di kiri, quick links About/Projects/Contact di kanan.
- Baris bawah: © tahun otomatis + link "Kembali ke atas".
- Quick links pakai atribut `data-goto` — delegasi klik ke radio nav header di `js/app.js`, jadi dapat scroll halus + indikator menu yang sama seperti klik menu. Responsif: kolom di layar sempit.

**File:** `index.html`, `css/style.css`, `js/app.js`

---

## 2026-08-24 — Personalisasi info dari sumber asli (GitHub, LinkedIn, IG, TikTok, Pamer.co)

**Sumber:** github.com/Dappzzz-Dev · pamer-co.vercel.app · link sosial milik sendiri · daffafarash@gmail.com

**Diperbaiki (yang keliru):**
- Nama "Dafara" → **Daffa** (title halaman, brand topbar, hero h1, About)
- Email placeholder `dafara@example.com` → **daffafarash@gmail.com** (baris kontak + tombol mailto dengan subject)
- Lokasi Yogyakarta → **Sukoharjo, Jawa Tengah, Indonesia (WIB)** — koordinat marker globe ternyata sudah benar
- Deskripsi Pamer.co disesuaikan kenyataan ("project showcase pribadi"); repoUrl → `github.com/Dappzzz-Dev/Pamer.co`
- Bio & skill list About dicocokkan profil nyata: mulai 2023, frontend web apps + AI, HTML/CSS, JS/TS, React/Vite, PHP/MySQL, Node.js

**Ditambah:**
- Instagram (`@dafara__`) & TikTok (`@dafaraaaa`) di social hero dan Contact

**File:** `index.html`, `data/projects.json`, `CONTEXT.md`

---

## 2026-08-24 — Rapikan & bangun ulang halaman Contact

**Permintaan:** Perbagus desain Contact, hapus yang tidak perlu, tambah yang diperlukan.

**Hapus:**
- Form demo palsu (`alert('Terima kasih — form demo')` — tidak mengirim apa pun, menyesatkan) beserta CSS `.contact-form` dan handler demo di `js/app.js`.

**Tambah/ubah (tetap tema monochrome + glass):**
- Panel kiri `.contact-panel`: baris info terstruktur dengan label kecil kapital — Email (link mailto), Lokasi (Sukoharjo, WIB), Status "Terbuka untuk proyek baru" dengan dot indikator.
- Panel kanan `.contact-panel--cta`: kartu ajakan + tombol `Kirim Email` mailto sungguhan dengan subject otomatis (tanpa backend) + social pill GitHub/LinkedIn/Instagram/TikTok.
- Grid 1fr/380px, tinggi sejajar (`align-items:stretch` + `margin-top:auto` pada CTA), hover/focus-visible jelas, responsif 1 kolom di bawah 900px.

**File:** `index.html`, `css/style.css`, `js/app.js`

---

## 2026-08-24 — Fix: menu tidak ikut pindah ke Contact di dasar halaman

**Gejala:** Sampai di halaman Contact, radio nav tetap menunjuk Projects.

**Penyebab:** Garis aktivasi menu = 140px dari atas layar, tapi halaman mentok max-scroll sebelum top Contact (section pendek) sempat melewati garis itu → section terakhir yang terhitung selalu Projects.

**Perubahan:** Di `syncSelectionToPosition()`, saat `scrollY >= maxScroll - 2` section TERAKHIR langsung dianggap aktif.

**File:** `js/sections.js`

---

## 2026-08-24 — Fix: section Contact menghilang saat scroll

**Gejala:** Saat scroll manual, section Kontak tampak kosong; tapi lewat menu nav selalu muncul.

**Penyebab:** Pemunculan section (`.is-visible` / opacity) digabung dengan pelacak "section aktif" di `js/sections.js`. Klik menu menghapus status tampil semua section lain, dan scroll hanya menyalakan section yang top-nya sudah melewati garis 140px dari atas layar — section yang baru sebagian terlihat dari bawah layar tetap opacity:0. Lewat menu, class dipaksa langsung → selalu muncul.

**Perubahan (v3):** Reveal kini lewat IntersectionObserver terpisah — setiap `.section` yang masuk viewport langsung tampil **permanen** (unobserve setelah reveal). Nav click tidak lagi menghapus `.is-visible` section lain; sinkronisasi menu hanya mengurus radio aktif.

**File:** `js/sections.js`

---

## 2026-08-24 — Fade tipis di tepi carousel (pengganti efek grain)

**Permintaan:** Sisi kiri-kanan carousel jadi fade halus tipis, bukan partikel.

**Perubahan:** CSS mask gradient di `.carousel-stage.grainy-host` (lebar fade `min(64px, 7%)` per sisi). Grain WebGL tetap off (`grainWidth: 0`) — fade murni CSS alpha mask.

**File:** `css/style.css`

---

## 2026-08-24 — Matikan efek grain/partikel di tepi carousel (mode pure)

**Permintaan:** Efek partikel/noise di samping-samping carousel dianggap mengganggu.

**Perubahan:** `grainWidth` default 0 → pass WebGL fbm dilewati sepenuhnya (`hasGL` dimatikan saat init bila grain off); strip ditampilkan lewat canvas 2D polos. Carousel kini murni gambar berjalan. Ingin efek grain lagi? Set `grainWidth: 0.5` di DEFAULTS `js/carousel.js`.

**File:** `js/carousel.js`

---

## 2026-08-24 — Perbaikan tampilan carousel (kegedean + gambar tidak jelas)

**Gejala:** Carousel tampak terlalu besar; gambar sulit dilihat jelas.

**Penyebab & perbaikan:**
1. Kartu maksimal 711px → diturunkan ke **560px** (`maxWidth` di `js/carousel.js`), stage 480→420px (mobile 340px).
2. Band grain tepi = lebar 1 kartu penuh → menutupi sebagian besar gambar dengan noise/gelap. Diubah jadi **0.5 kartu** (opsi baru `grainWidth`) — tengah gambar kini bersih, efek dissolve tetap ada di pinggir.
3. Gambar seed masih thumbnail SVG 96×72 yang di-stretch → blur. Diganti **SVG vektor monokrom 1280×720** (`assets/seed1-3.svg`, tajam di ukuran apa pun, sesuai tema).

**File:** `js/carousel.js`, `css/style.css`, `data/projects.json`, `assets/seed1-3.svg`(baru)

---

## 2026-08-24 — Grainy Carousel menggantikan grid project + halaman Admin

**Gejala/kebutuhan:** Kartu project statis diganti carousel interaktif; admin bisa menambah project tanpa menyentuh kode; pengunjung klik gambar → muncul kartu detail (deskripsi + tombol Live Demo & GitHub).

### Perubahan

1. **GrainyCarousel di-port React → vanilla JS** (`js/carousel.js`)
   - Endless strip gambar di 2D canvas → satu pass WebGL (fbm/simplex warp + darken di dua band tepi, shader identik dengan referensi Originkit).
   - Interaksi: drag (gain 0.5–2.5, default 1:1), flick, klik kiri/kanan untuk geser, auto-advance tiap ±5s mode snap, zoom halus antar kartu.
   - Fallback 2D saat WebGL tidak ada; backing store DPR-capped 2; hormati `prefers-reduced-motion` (auto-advance & zoom mati).
   - Klik gambar yang tepat di tengah → callback `onOpen(index)` membuka detail; klik samping → geser seperti referensi.
2. **Modal detail project** (`index.html` + `css/style.css` + `js/projects.js`)
   - Gambar 16:9, judul, deskripsi, tombol Live Demo (primary) & GitHub (ghost) — tombol hanya tampil bila link diisi admin.
   - Tutup via ×, backdrop, atau ESC; fokus dikembalikan; scroll body dikunci; carousel pause saat modal terbuka.
3. **Data project dipindah ke `data/projects.json`** — seed berisi 3 project lama (Pamer-co, Personal Portfolio, UI Component Library).
4. **Halaman Admin** (`admin.html` + `css/admin.css` + `js/admin.js`)
   - CRUD project: judul, deskripsi, upload gambar (kompres otomatis ≤1600px JPEG q0.82; SVG <300KB lewat apa adanya), link demo/repo; urutkan naik/turun; hapus.
   - Draf tersimpan otomatis di localStorage; Export/Import JSON.
   - **Model keamanan (anti-bobol tanpa backend):** tidak ada password di kode. Publish memakai *fine-grained PAT GitHub* (Contents: Read+Write, repo ini saja) yang hanya hidup di sessionStorage tab — bisa dicabut kapan saja di GitHub. CSP ketat + `noindex`. Tanpa token: mode draf lokal murni.
   - Publish = commit `data/projects.json` + upload gambar ke `assets/projects/<id>.<ext>` via Contents API → Pages redeploy otomatis.
5. **CSS dirapikan:** blok `.projects-grid/.project-card/.proj-*` dihapus, ditambah `.carousel-stage`, `.modal-*`; guard `[hidden]` global (bug fix: `display:flex` pada kelas menimpa atribut hidden sehingga modal tampak terbuka saat load).

**File:** `js/carousel.js`(baru), `js/projects.js`(baru), `data/projects.json`(baru), `admin.html`(baru), `css/admin.css`(baru), `js/admin.js`(baru), `index.html`, `css/style.css`

**Catatan:**
- honey: hapus project tidak menghapus file gambarnya dari repo (orphan) — bersihkan manual bila perlu.
- honey: draf lokal hanya ada di browser tempat mengetik — gunakan Publish/Export agar tidak hilang.
- Buka situs via server lokal (Live Server); `fetch(data/projects.json)` diblokir di protokol `file://`.

---

## 2026-08-24 — Fix bug navigasi menu (salah section saat klik About/Projects/Contact)

**Gejala:** Klik About kadang terlempar ke Projects, klik Projects ke Contact, dst — intermittent.

**Akar masalah** (`js/sections.js` versi lama):
1. Deteksi "scroll sampai" pakai polling ±4px + timer buta 1600ms. Gagal saat:
   - klik **Contact** (posisi target tak terjangkau karena batas scroll bawah → selalu menunggu fallback penuh),
   - smooth scroll > 1,6s di jarak jauh → timer mati di tengah penerbangan,
   - user menggerakkan wheel/touch saat animasi jalan → scroll dibatalkan browser tapi state "navigasi" masih menggantung.
2. Setelah gagal, `syncSelectionToPosition()` **menimpa pilihan menu** mengikuti posisi hasil kegagalan — UI ikut salah, bukan lokasinya yang dikoreksi.

**Perbaikan** (`js/sections.js` v2):
- Sampai = event `scrollend` (+ timeout pengaman), bukan polling ±4px.
- Tujuan scroll di-clamp ke `maxScroll` → section bawah dianggap sampai.
- Setelah sampai: verifikasi + snap koreksi instan kalau meleset >48px (layout drift font/globe).
- Wheel/touchstart user saat animasi → state navigasi dibatalkan seketika, sinkronisasi posisi jujur lagi.
- Hormati `prefers-reduced-motion`.

**File:** `js/sections.js`

---
