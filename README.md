# Dafara — Portfolio (Monochrome, Simple & Clean)

Ringkasan: landing page portofolio desktop-first, rapi, dengan tema monokrom (hitam, putih, abu-abu) dan globe 3D interaktif.

Fitur utama
- Tema monokrom (grayscale) untuk tampilan profesional dan minimal.
- Toggle Dark / Light (ikon matahari / bulan sesuai template; animasi tombol asli dipertahankan).
- 3D Globe interaktif dibangun dengan Three.js (pointer drag rotation + wheel zoom).
- Struktur file rapi: css/, js/, assets/.
- Komentar "TAG:" pada file untuk menjelaskan fungsi tiap blok kode.

Struktur file penting
- index.html — markup utama, header, sections, dan container globe (#globe-container).
- css/style.css — styling dan variabel tema (monokrom).
- js/globe.js — implementasi globe Three.js (plain JS, tidak memerlukan React). TAG pada bagian atas menjelaskan fungsinya.
- js/*.js — file JS lain untuk navigasi, theme toggle, dll.

Menjalankan (lokal)
1. Buka `index.html` di browser desktop.
2. Untuk hasil paling konsisten (CORS / CDN), jalankan server lokal (mis. Live Server di VS Code).

Catatan teknis singkat
- Globe dibuat tanpa React: memanfaatkan three.module.js via CDN; fokus pada interaksi (drag + zoom) dan performa desktop.
- Geo-data dan elaborate land outlines dari versi React tidak disertakan demi kesederhanaan; bila perlu, versi yang memproses GeoJSON bisa ditambahkan.

Kustomisasi
- Warna: ubah variabel di `:root` pada `css/style.css`.
- Jumlah titik/bintang pada globe: atur `dotCount` di `js/globe.js`.
- Rentang zoom: atur `minCameraZ` / `maxCameraZ` di `js/globe.js`.

Butuh perubahan lebih lanjut (mis. memasukkan peta benua, marker, atau meningkatkan detail)? Beri tahu preferensi — akan ditambahkan.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>