# CONTEXT.md — Konteks Project (untuk sesi AI berikutnya)

> Dibuat karena history chat hilang. Baca ini dulu sebelum mengubah apa pun.
> Terakhir dianalisis: 2026-08-24.

## Identitas
- **Nama:** Daffa — Portfolio (brand topbar: "Daffa • Frontend")
- **Owner:** Daffa / "DaffaDev" — GitHub `Dappzzz-Dev`, LinkedIn `dappdev-dafara`, IG `@dafara__`, TikTok `@dafaraaaa`
- **Email publik:** daffafarash@gmail.com
- **Asal:** Sukoharjo, Jawa Tengah, Indonesia (WIB) — marker globe `js/globe.js` CONFIG.birthPlace (-7.68, 110.84) sudah sesuai
- **Profil:** pelajar SMK Muhammadiyah 1 Sukoharjo; mulai ngoding 2023; fokus frontend web apps + AI enthusiast; stack nyata: HTML/CSS, JS/TS, React/Vite, PHP/MySQL, Node.js
- **Jenis:** Landing page portfolio pribadi, **desktop-first**, tema **monokrom** (hitam/putih/abu) + glassmorphism, clean & minimal

## Stack
- Vanilla HTML/CSS/JS — **tanpa build step**, buka via server lokal (Live Server)
- Three.js 0.154.0 (ESM via unpkg CDN) + GSAP 3.12.2 (cdnjs CDN)
- Font Inter (Google Fonts)
- `@langchain/anthropic` di package.json TIDAK dipakai web (sisa eksperimen AI)

## Alur halaman
1. Topbar fixed kaca blur: brand + nav radio-input custom (Home/About/Projects/Contact) dengan indikator geser `.selection`
2. Hero (#home): kiri teks + CTA + social; kanan stage globe 3D interaktif
3. About: bio + list skill
4. Project History: **GrainyCarousel** (endless strip, drag/klik/auto-advance, grain fbm WebGL di tepi) dari `data/projects.json`; klik gambar tengah → modal detail (deskripsi + tombol Live Demo/GitHub)
5. Contact: dua panel glass — kiri baris info (Email/Lokasi/Status), kanan kartu CTA mailto + social pill (GitHub/LinkedIn/Instagram/TikTok). Form demo sudah DIHAPUS.
6. Footer tahun otomatis

## File utama
| File | Isi |
|---|---|
| `js/globe.js` | Globe dot-matrix Three.js dari data lokal `assets/ne_50m_land.json` (~450KB, tanpa API eksternal). Drag rotate + wheel zoom. Semua tuning di objek `CONFIG` atas file (speed, warna, dotDensity, zoom range, `birthPlace`). |
| `js/carousel.js` | GrainyCarousel vanilla port dari Originkit (React). Class `window.GrainyCarousel(host, opts)` — `setImages(urls)`, `setPaused(v)`, `destroy()`, `onOpen(i)` callback. Shader VERT/FRAG fbm di dalam file. |
| `js/projects.js` | Fetch `data/projects.json` → isi carousel + wire modal detail. XSS-safe (textContent). |
| `js/click-effects.js` | "Originkit", hasil translate React → vanilla. 6 mode efek klik: rings/burst/particles/crosshair/wavy/sniper (**sniper aktif**). Pakai GSAP, config di atas file. |
| `js/sections.js` | v2: nav radio ↔ scroll dua arah, settle-based (scrollend + timeout), clamp maxScroll, koreksi snap, user-interrupt aware. Offset header = 112px. |
| `js/app.js` | Tahun footer |
| `admin.html` + `js/admin.js` + `css/admin.css` | Halaman admin CRUD project (noindex, CSP ketat). Draf = localStorage; Publish = commit `data/projects.json` + upload gambar ke `assets/projects/` via GitHub Contents API dengan PAT fine-grained yang hanya di sessionStorage (tidak ada password di kode — token adalah kredensialnya). Tanpa token: Export/Import JSON manual. |
| `data/projects.json` | Sumber data project publik: `{version, updatedAt, projects:[{id,title,description,image,demoUrl,repoUrl}]}`. Image bisa path repo-relative atau dataURL (belum publish). |
| `css/style.css` | Variabel tema monokrom di `:root`, glass card, CTA gradient, `.carousel-stage`, `.modal-*`, guard `[hidden]` global |

## Konvensi penting
- **Setiap update wajib menambah entri di `UPDATE.md`** (entri baru di atas) — riwayat perubahan bersama
- Komentar **`TAG:`** menjelaskan tiap blok kode — pertahankan gaya ini saat edit
- Struktur wajib: `css/`, `js/`, `assets/`, `data/`
- README.md co-authored Copilot; klik-effects & nav radio berasal dari template eksternal yang diadaptasi
- Admin tidak ditautkan dari halaman publik; akses langsung via `/admin.html`

## Skills lokal yang relevan

Index terpusat ada di `.skills_ai/README.md` dan `.skills_ai/manifest.json`.
Implementasi tetap berada di folder vendor (`.agents/skills`, `.github/skills`,
dan `.opencode/skills`) agar loader masing-masing tool tidak putus.
- **threejs-*** (fundamentals/interaction/shaders/postprocessing) → globe
- **gsap-*** (core/scrolltrigger/timeline) → animasi
- **impeccable / frontend-design / redesign-existing-projects / ui-ux-pro-max** → polish visual
- **animate / find-animation-opportunities / review-animations** → motion audit
- **web-design-guidelines / security-review** → audit aksesibilitas & keamanan

## Gap / arah next update (kandidat)
1. **Responsive mobile** — hero grid kolom kanan fix 560px; carousel sudah responsive tapi sisanya belum dioptimalkan penuh
2. **Toggle dark/light** — disebut di README tapi CSS menulis "light theme removed" (belum ada)
3. Form contact sudah dihapus — kontak via mailto; jika ingin form sungguhan, sambungkan email service (mis. Formspree) tanpa ubah desain
4. Detail outline benua globe bisa dinaikkan (pemrosesan GeoJSON belum ada)
5. Edit gambar project yang sudah terpublish menimpa file lama dengan nama berbeda (id sama, ekstensi bisa beda) — orphan cleanup otomatis belum ada

## Catatan lingkungan repo
- Bukan git repo (per cek 2026-08-24) — pertimbangkan `git init`
- Ada banyak folder config agent AI (`.claude/ .codex/ .cursor/` dll) — jangan diubah kecuali diminta
