# 🧪 QA Testing & Quality Assurance Plan
**Proyek:** Firdaus Khotibul Zickrian Portfolio & Admin CMS (`Xzavis/dev`)  
**Dokumen:** Rencana Pengujian, Checklist Fitur, dan Catatan Hasil Pengujian  
**Versi:** 1.0.0  
**Terakhir Diperbarui:** 2026-09-06  

---

## 📌 1. Petunjuk Penggunaan & Standar Pengisian

Gunakan dokumen ini untuk mencatat hasil pengetesan manual (manual testing) maupun otomatis sebelum melakukan rilis/deploy ke production.

### Konvensi Status Pengujian
| Simbol | Status | Keterangan |
| :---: | :--- | :--- |
| `[x]` | **PASS** | Fitur berfungsi persis sesuai ekspektasi tanpa kendala. |
| `[!]` | **FAIL / BUG** | Ditemukan kesalahan logika, error tampilan, atau kendala fungsional. |
| `[-]` | **SKIPPED / N/A** | Dilewati sementara atau tidak relevan untuk platform pengujian saat ini. |
| `[ ]` | **UNTESTED** | Belum diuji / dalam antrean pengetesan. |

### Tingkat Keparahan Bug (Severity Level)
- **P0 (Blocker / Critical):** Aplikasi crash, layar putih (white screen), data hilang, fitur utama tidak berfungsi sama sekali.
- **P1 (Major):** Fitur penting terganggu namun masih ada workaround sementara.
- **P2 (Minor / Visual):** Tampilan berantakan di resolusi tertentu, typo teks, glitch animasi minor, alignment tidak presisi.
- **P3 (Trivial / Improvement):** Usulan peningkatan performa, kemudahan navigasi (UX), atau perubahan kosmetik kecil.

---

## 💡 2. Contoh Nyata Cara Pengisian (Reference Example)

> *Berikut adalah contoh nyata pengisian test case dan pelaporan bug sebagai acuan sebelum Anda mengisi checklist fitur di bawah:*

### Contoh Tabel Eksekusi Test Case

| ID Kasus | Modul / Fitur | Skenario Uji | Langkah Pengujian (Steps) | Ekspektasi Hasil | Hasil Aktual | Status | Catatan / Bukti |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `TC-PUB-001` | Profile Header | Banner video WebM looping autoplay | 1. Buka halaman utama `/`<br>2. Perhatikan area banner atas | Video `.webm` diputar otomatis tanpa audio (*muted*), *looping* mulus tanpa patah-patah | Video terputar otomatis, looping mulus, responsive di mobile & desktop | `[x]` | Lolos di Chrome & Firefox |
| `TC-ADM-012` | Media Library | Deduplikasi file saat upload aset baru | 1. Masuk dashboard `/admin/projects`<br>2. Buka modal *Media Library*<br>3. Upload gambar dengan nama yang sudah ada (`hero.webp`) | Sistem tidak membuat duplikasi nama baru, melainkan mendeteksi dan menggunakan file yang sudah ada | Sistem menampilkan notifikasi file sudah ada dan langsung memilih file tersebut tanpa duplikasi | `[x]` | Disk space aman, tidak ada duplikat |
| `TC-ADM-005` | Auth Admin | Validasi PIN salah | 1. Akses `/admin`<br>2. Masukkan PIN acak `999999`<br>3. Klik submit | Sistem menolak akses, menampilkan pesan error, tidak mengizinkan masuk dashboard | Pesan error "PIN Salah" muncul, input dibersihkan, akses dashboard tetap diblokir | `[x]` | Proteksi berjalan |
| `TC-PRJ-004` | Projects | Tombol Reorder Urutan Proyek | 1. Buka `/admin/projects`<br>2. Klik panah bawah pada proyek urutan 1 | Proyek bertukar posisi dengan urutan 2 dan file `order.json` terupdate | Posisi bertukar di admin dan seketika berubah di halaman publik `/projects` | `[x]` | `order.json` tersinkronisasi |
| `TC-MOB-002` | Mobile Nav | Responsivitas Chat Widget di HP | 1. Buka situs di layar 375px (iPhone SE)<br>2. Buka widget chat | Widget chat terbuka full-screen atau modal yang proporsional tanpa menggeser layout utama | Konten terhalang navbar bawah sebesar 10px saat keyboard virtual muncul | `[!]` | Dibuatkan tiket bug `BUG-001` |

---

## 📋 3. Checklist Fitur Menyeluruh (Feature Testing Matrix)

### Informasi Sesi Pengujian Anda:
- **Tanggal Uji:** `[2026-09-06]` (Contoh: 2026-09-06)
- **Tester / Penguji:** `[xza]`
- **Environment:** Localhost (`http://localhost:3000`) / Staging / Production
- **Perangkat & Browser:** Windows 11 (Chrome 130, Firefox 125, Edge) & iOS Safari / Android Chrome

---

### BAGIAN A: Public Portfolio (Frontend Pengunjung)

#### A.1 Hero & Profile Header
- [x] **Nama & Headline:** Nama lengkap, headline profesional, dan bio singkat tampil jelas dan sesuai data `profile.json`.
- [x] **Avatar Profil:** Gambar avatar termuat tajam, posisi simetris, dan rasio aspek lingkaran/kotak terjaga.
- [x] **Banner Hero (Image / Video):**
  - [x] Mendukung gambar statis (`.webp`, `.png`, `.jpg`).
  - [x] Mendukung video animasi (`.webm`, `.mp4`) yang diputar otomatis (autoplay), tanpa suara (muted), dan berulang (loop).
  - [x] Mendukung file `.gif` jika digunakan.
- [x] **Social Links:** Tautan GitHub, LinkedIn, Email, X, dll. menampilkan ikon yang tepat dan membuka tab baru (`target="_blank"`).
- [x] **Status Badge (Availability):** Menampilkan badge status ketersediaan (misal: "Available for Hire" / "Open to Work").

#### A.2 Navigasi & Tata Letak (Layout & Global UX)
- [x] **Sticky Navbar:** Navbar melayang dengan rapi saat digulir ke bawah (*smooth sticky effect*).
- [x] **Tautan Navigasi:** Navigasi cepat berfungsi menuju section terkait (`#experience`, `#projects`, `#skills`, dll.) atau rute baru.
- [x] **Tombol "Skip to Content":** Aksesibilitas keyboard (tombol Tab pertama memunculkan skip link).
- [x] **Interactive Background (Dots Field):** Efek titik-titik interaktif bergerak responsif tanpa membebani pemakaian CPU/GPU.
- [x] **Dark / Light Mode Toggle:** Perubahan tema warna instan tanpa *flash of unstyled content* (FOUC).

#### A.3 Riwayat Pengalaman (Experience Section)
- [x] **Daftar Perusahaan:** Semua riwayat kerja tampil urut dari yang paling baru ke lama.
- [x] **Logo Perusahaan:** Logo perusahaan muncul di samping nama perusahaan tanpa pecah.
- [x] **Multi-Peran / Posisi Bersarang:** Jika 1 perusahaan memiliki beberapa peran/posisi promosi, hierarki tampil rapi.
- [x] **Skill Badges:** Daftar teknologi yang digunakan di setiap pekerjaan tampil dalam bentuk badge/tagar.
- [x] **Collapsible / Expandable Details:** Teks deskripsi pekerjaan dan pencapaian dapat dibaca dengan jelas.

#### A.4 Proyek & Showcase (Projects Section)
- [x] **Daftar Proyek Unggulan:** Menampilkan proyek-proyek sesuai urutan `order.json`.
- [x] **Cover Proyek & Thumbnail:** Gambar thumbnail proyek teroptimasi (Next Image) dan terisi rapi.
- [x] **Tagar Teknologi:** Badge teknologi yang dipakai pada proyek dapat diklik atau memiliki gaya seragam.
- [x] **Tautan Luar (Live Demo & Source Code):** Tombol menuju repositori GitHub atau live preview berfungsi.
- [x] **Halaman Detail Proyek (`/projects/[slug]`):**
  - [x] Routing dinamis bekerja untuk semua slug proyek (tidak ada 404 pada proyek yang aktif).
  - [x] Markdown / konten deskripsi lengkap proyek ter-render dengan baik (list, heading, code block).
  - [x] Galeri proyek menampilkan foto-foto tambahan proyek dalam modal/lightbox atau slider yang halus.
- [x] **Halaman Indeks Semua Proyek (`/projects`):** Menampilkan arsip lengkap semua proyek.

#### A.5 Keahlian Teknis (Tech Stack & Skills)
- [x] **Kategori Skill:** Pengelompokan keahlian (Frontend, Backend, AI/ML, DevOps, Tools) sesuai data.
- [x] **Ikon Teknologi:** Ikon teknologi tampil presisi (Phosphor/Lucide/Brand icons) tanpa ada ikon kosong (*broken icon*).
- [x] **Tooltip / Interaktivitas:** Efek hover pada item keahlian menampilkan nama atau level dengan jelas.

#### A.6 Aktivitas GitHub & Kontribusi
- [x] **Grafik Kontribusi GitHub:** Grafik matriks kontribusi termuat dan menampilkan data publik GitHub yang valid (Terverifikasi menggunakan profil `xzavis` dengan 76 kontribusi dalam kalender 12 bulan terakhir).
- [x] **Tooltip Kontribusi:** Arahkan kursor ke kotak aktivitas menampilkan jumlah kontribusi dan tanggal.
- [x] **Penanganan Offline / Fallback:** Jika API GitHub dibatasi (*rate limit*), tampilan tetap elegan dan tidak merusak layout.

#### A.7 Penghargaan & Publikasi (Awards & Publications)
- [x] **Awards:** Daftar penghargaan menampilkan nama lomba/award, penyelenggara, dan tahun perolehan. *(TestSprite 2026-09-06: 3 item ter-render di `/` — judul, prize, grade, tanggal `MM.yyyy` + expandable description EN/ID terverifikasi live. Real TestSprite run `70e9a16c`/`174bf0e3` vs prod: **passed** 10/10 steps. Catatan minor: `referenceLink` 2 award Pijak/IBM mengarah ke `dicoding.com` generik, bukan URL kredensial spesifik — lihat `BUG-004`.)*
- [x] **Publications:** Daftar publikasi artikel ilmiah atau riset menampilkan judul, penerbit, dan tautan tautan DOI/PDF jika ada. *(TestSprite 2026-09-06: 1 publikasi JUTISI ter-render — judul, `@journal`, tanggal, link outbound `ojs.stmik-banjarbaru.ac.id/.../3476/1658` dengan `target=_blank rel=noopener nofollow` terverifikasi live.)*

#### A.8 Sertifikasi (Certifications)
- [x] **Daftar Sertifikat:** Sertifikasi tampil lengkap dengan tanggal kedaluwarsa/terbit. *(TestSprite 2026-09-06: 29 sertifikat, semua punya `issueDate` valid, format render `dd.MM.yyyy` terverifikasi live.)*
- [x] **Logo Penerbit (Issuer Logo):** Logo lembaga (Coursera, Google, AWS, Dicoding, dll.) muncul dengan rapi dari folder `/logos/`. *(TestSprite 2026-09-06: 7 file logo unik — semua ada di `public/logos/`: `dicoding.webp`, `mckinsey.webp`, `asah.webp`, `pijak.webp`, `anthropic.webp`, `ibm.webp`, `dncc.webp`.)*
- [x] **Tautan Kredensial:** Tombol verifikasi kredensial membuka tautan valid ke situs penerbit sertifikat. *(TestSprite 2026-09-06: 29/29 `credentialURL` non-kosong & format URL valid; 2 item dengan `credentialID` kosong — Machine Learning Cohort & DNCC Basic Training — tetap punya URL fallback LinkedIn, acceptable.)*

#### A.9 Galeri Foto & Media (`/gallery`)
- [x] **Grid / Masonry Galeri:** Tata letak foto responsif di layar mobile, tablet, dan monitor lebar. *(TestSprite 2026-09-06: `/gallery` live 200 — `grid-cols-1 sm:grid-cols-2`, 4 item: 3 lokal + 1 video Cloudinary; video punya kontrol play/pause + `prefers-reduced-motion`. Belum diuji di perangkat fisik — baru via render HTML.)*
- [x] **Rasio Aspek Gambar:** Gambar potret maupun lanskap menyesuaikan rasio tanpa terpotong (*distortion-free*). *(TestSprite 2026-09-06: varian `aspect-square` / `aspect-2/1` (`wide`) terverifikasi di kode + render live, `object-cover` tanpa distorsi.)*
- [!] **Lightbox / Preview:** Klik pada gambar memunculkan tampilan layar penuh dengan keterangan/caption. *(TestSprite 2026-09-06: FAIL — tidak ada lightbox/dialog di `gallery/page.tsx` maupun HTML live (`lightbox|<dialog` = 0 hit); `item.title` hanya dipakai sebagai `alt`/aria-label, tidak tampil sebagai caption. Lihat `BUG-003`.)*

#### A.10 Blog & Artikel (`/blog`)
- [!] **Daftar Artikel:** Menampilkan judul artikel, tanggal rilis, ringkasan (excerpt), dan estimasi waktu baca. *(TestSprite 2026-09-06: PARTIAL — judul + `<time pubDate>` + excerpt + thumbnail + kategori + link Medium terverifikasi live (3 post lokal + dedup RSS Medium, ISR 30 mnt, fallback `BlogEmptyState` ada). Namun estimasi waktu baca tidak ada di kode maupun render (`min read` = 0 hit). Lihat `BUG-005`.)*
- [x] **Integrasi Medium / Internal:** Tautan ke Medium atau detail artikel berfungsi dengan lancar. *(TestSprite 2026-09-06: link `medium.com/@zickriann/...` dengan `target=_blank rel=noopener noreferrer` + `aria-label Read "..."` terverifikasi live; post lokal fallback ke `/blog#slug`.)*

#### A.11 Chatbot & Interaksi Kontak (Chat Widget)
- [ ] **Tombol Toggle Chat:** Tombol mengambang (*floating button*) di pojok kanan bawah mudah ditekan.
- [ ] **Panel Chat:** Panel terbuka di samping atau melayang tanpa menggeser konten artikel/halaman utama.
- [ ] **Kirim Pesan:** Input pesan merespon tombol Enter atau klik kirim.
- [ ] **Respons Asisten:** Jawaban balasan terkirim dan tampil dengan bubble teks yang rapi.
- [ ] **Tombol Tutup / Minimize:** Panel dapat ditutup kembali dengan cepat.

#### A.12 Tampilan Mobile & Cross-Browser Compatibility
- [ ] **Mobile (Viewport 375px - 430px):** Tidak ada overflow horizontal (layar tidak bisa digeser ke kanan/kiri tak beraturan).
- [ ] **Tablet (Viewport 768px - 1024px):** Layout kartu dan kolom menyesuaikan dengan proporsional.
- [ ] **Browser Chrome:** Berfungsi penuh.
- [ ] **Browser Firefox:** Berfungsi penuh.
- [ ] **Browser Safari (iOS / macOS):** Font dan video autoplay berjalan lancar tanpa kendala format.
- [ ] **Browser Edge:** Berfungsi penuh.

#### A.13 SEO, Metadata, & PWA
- [ ] **Favicon & App Icon:** Favicon muncul di tab browser (`/icon`, `/apple-icon`).
- [ ] **OpenGraph / Social Share Preview:** Uji tautan di Twitter Card / LinkedIn Card validator (gambar OG `/opengraph-image` muncul).
- [ ] **Sitemap (`/sitemap.xml`):** XML sitemap menghasilkan daftar URL yang valid dan mutakhir.
- [ ] **Robots (`/robots.txt`):** File robots mengizinkan crawling halaman publik dan membatasi `/admin`.
- [ ] **Web Manifest (`/manifest.webmanifest`):** Metadata PWA terdefinisi dengan nama, tema warna, dan ikon yang benar.

---

### BAGIAN B: Admin CMS Dashboard (`/admin`)

#### B.1 Autentikasi & Keamanan (PIN Gatekeeper)
- [ ] **Proteksi Akses:** Masuk ke `/admin` tanpa login langsung memunculkan layar PIN.
- [ ] **Validasi PIN Sukses:** Memasukkan PIN yang benar (`zickrian2026`) berhasil membuka dashboard.
- [ ] **Validasi PIN Gagal:** PIN yang salah menampilkan notifikasi penolakan dan input dikosongkan.
- [ ] **Logout / Lock:** Tombol keluar/kunci admin mengembalikan ke status terkunci.

#### B.2 Dashboard Utama & Navigasi Admin
- [ ] **Menu Cepat:** Akses ke semua modul (Profile, Projects, Experience, Skills, Certifications, Awards, Publications, Gallery, Blog, Settings).
- [ ] **Tombol Kembali (Back Navigation):** Tombol `← Back` dan navigasi mobile di setiap halaman admin berfungsi dengan intuitif.
- [ ] **Statistik / Ringkasan:** Ringkasan jumlah konten tampil akurat.

#### B.3 Manajemen Profil (`/admin/profile`)
- [ ] **Edit Bio & Display Name:** Perubahan nama dan teks bio tersimpan ke `content/profile.json`.
- [ ] **Upload Avatar:** Upload foto profil baru langsung tersimpan ke `public/image/` dan preview terupdate.
- [ ] **Upload Banner Hero:**
  - [ ] Upload gambar banner atau video WebM/MP4 langsung tersimpan di root folder `public/`.
  - [ ] Preview banner langsung menampilkan video berulang jika file bertipe video.
- [ ] **Simpan Perubahan:** Tombol Save memicu Server Action dan menampilkan pesan sukses (toast/alert).

#### B.4 Manajemen Proyek (`/admin/projects`)
- [ ] **Tambah Proyek Baru:** Form pembuatan proyek baru dengan input title, slug, description, tags, url, dan repo.
- [ ] **Folder Khusus Proyek Otomatis:** Sistem membuatkan direktori `public/projects/[slug]/` secara otomatis.
- [ ] **Edit Proyek Eksisting:** Memuat data awal proyek ke form tanpa ada data yang hilang.
- [ ] **Pengelola Galeri Proyek (Showcase Gallery Manager):**
  - [ ] Menambah gambar ke galeri proyek.
  - [ ] Mengatur urutan gambar (naik/turun / reorder).
  - [ ] Menghapus foto dari galeri proyek.
- [ ] **Reorder Urutan Proyek:** Tombol naik/turun memperbarui file `content/projects/order.json`.
- [ ] **Hapus Proyek:** Konfirmasi dialog hapus bekerja dan menghapus file JSON terkait.

#### B.5 Manajemen Pengalaman Kerja (`/admin/experience`)
- [x] **Tambah & Edit Pengalaman:** Input nama perusahaan, website, lokasi, periode kerja.
- [x] **Upload Logo Perusahaan:** Mengunggah logo langsung ke target folder `public/logos/`.
- [x] **Peran Bersarang (Nested Roles):** Menambah lebih dari 1 posisi dalam 1 riwayat perusahaan.
- [x] **Skill Tagging:** Memilih atau mengetik tag keahlian untuk setiap peran.
- [x] **Opsi Ikon Profesional:** Menampilkan pilihan ikon khusus dunia kerja (Briefcase, AI, Code, Laptop, Network, Data, Users, Rocket, Building, Lab) terpisah dari ikon edukasi.
- [x] **Reorder & Hapus Pengalaman:** Urutan pengalaman kerja tersimpan di `content/experiences/order.json`.

#### B.5b Manajemen Riwayat Pendidikan (`/admin/education`)
- [x] **Navigasi Sidebar Baru:** Menu "Education" dengan ikon `GraduationCap` di kelompok MANAGEMENT sidebar admin.
- [x] **Tambah & Edit Pendidikan:** Input nama institusi/universitas, gelar/jurusan, tipe program (Sarjana, Magister, dll.), website institusi, periode studi.
- [x] **Upload Logo Institusi:** Upload logo atau pilih preset institusi (Udinus, Dicoding, Coursera, IBM, Asah, dll.).
- [x] **Opsi Ikon Akademik:** Pilihan ikon terfokus pada ranah akademik (Graduation Cap, School, Book Open, Library, Award, Medal, Scroll, Code/Bootcamp, Research/Lab).
- [x] **Coursework & Skill Badges:** Tagging mata kuliah dan kompetensi relevan.
- [x] **Toggle Sedang Studi:** Switch "Currently Studying Here" otomatis menampilkan durasi dan status "Present".
- [x] **Reorder & Hapus:** Urutan tersimpan di `content/education/order.json` dan delete dialog konfirmasi aman.
- [x] **Integrasi Halaman Utama:** Data pendidikan otomatis ter-render di panel `Education` di homepage publik lengkap dengan dukungan dwibahasa (EN & ID).

#### B.6 Manajemen Keahlian (`/admin/skills`)
- [ ] **Tambah Skill Baru:** Menambahkan skill dari katalog atau kustom.
- [ ] **Kategori Skill:** Menetapkan kategori (Frontend, Backend, dll.).
- [ ] **Hapus Skill:** Menghapus item skill dari `content/skills.json`.

#### B.7 Manajemen Sertifikasi, Penghargaan, & Publikasi
- [ ] **Certifications (`/admin/certifications`):** CRUD sertifikat, upload logo issuer ke `public/logos/`, link verifikasi.
- [ ] **Awards (`/admin/awards`):** CRUD penghargaan, judul, penyelenggara, tanggal.
- [ ] **Publications (`/admin/publications`):** CRUD publikasi riset, link penerbit.

#### B.8 Manajemen Galeri Showcase (`/admin/gallery`)
- [ ] **Upload Media Galeri:** Upload foto/video ke showcase galeri publik.
- [ ] **Pengaturan Aspek Rasio:** Memilih opsi rasio (1:1, 16:9, 4:3, dll.).
- [ ] **Caption & Alt Text:** Menambahkan deskripsi teks aksesibilitas.

#### B.9 Pengaturan Situs & SEO (`/admin/settings`)
- [ ] **SEO Metadata:** Mengubah Title, Description, Keywords, dan OpenGraph Image.
- [ ] **Simpan Pengaturan:** File `content/settings.json` terupdate tanpa merusak struktur file.

#### B.10 Modal Media Library Terpadu (Unified Media Library UX)
- [ ] **Penyasaran Direktori Kontekstual (Contextual Folder Targeting):**
  - [ ] Modul Profil mengarah ke folder `public/image/` atau root `public/` (banner).
  - [ ] Modul Proyek mengarah ke `public/projects/[slug]/` atau `public/projects/`.
  - [ ] Modul Pengalaman & Sertifikasi mengarah ke `public/logos/`.
- [ ] **Pencarian Cepat File (Instant Search):** Ketik nama file di kolom cari langsung memfilter thumbnail secara instan.
- [ ] **Deduplikasi Otomatis:** Upload file dengan nama yang sama tidak menciptakan duplikat atau timestamp berlebih.
- [ ] **Hapus Aset Permanen:**
  - [ ] Menampilkan modal dialog konfirmasi peringatan sebelum menghapus.
  - [ ] File fisik terhapus dari disk server.
  - [ ] Proteksi file sistem utama agar tidak terhapus sembarangan.

---

### BAGIAN C: Pengecekan Kualitas Kode Otomatis (Code & Build Health)

Jalankan perintah berikut di terminal sebelum menandai rilis:

| Jenis Tes | Perintah CLI | Ekspektasi | Hasil Pengujian Anda | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Type Check** | `npm run check-types` | `0 errors` (TypeScript valid) | `...` | [ ] |
| **Linter** | `npm run lint` | `0 errors / 0 warnings` | `...` | [ ] |
| **Unit Testing** | `npm run test` | Semua unit test lulus (Vitest) | `...` | [ ] |
| **Icon Verification** | `npm run verify:icons` | Semua ikon terpetakan valid | `...` | [ ] |
| **Production Build** | `npm run build` | Sukses build static & routes | `...` | [ ] |

---

## 🐛 4. Tabel Pelacakan Bug & Isu (Bug Tracking Log)

Gunakan tabel ini setiap kali Anda menemukan kegagalan uji (*FAIL*):

| Bug ID | Modul Terkait | Severity | Deskripsi Masalah | Langkah Reproduksi | Status Solusi | Assigned / Catatan |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| *BUG-001* | *Chat Widget Mobile* | *P2* | *Chat tertutup keyboard di iOS Safari* | *Buka chat di iPhone, klik input teks* | *Resolved* | *Sudah ditambahkan padding-bottom dinamis* |
| `BUG-002` | `[Nama Modul]` | `P1` | `[Jelaskan masalahnya di sini]` | `1. ... 2. ...` | `Open` | `[Catatan penanganan]` |
| `BUG-003` | Galeri `/gallery` — Lightbox / Caption | `P3` | Tidak ada lightbox/preview fullscreen; klik gambar tidak memunculkan apa-apa dan `item.title` tidak tampil sebagai caption (hanya `alt`). Ditemukan via TestSprite-style QA A.9 (2026-09-06): 0 hit `lightbox|<dialog` di kode & HTML live. | 1. Buka `/gallery` 2. Klik gambar mana pun | `Open` | Opsi lazy: tampilkan `item.title` sebagai caption overlay + bungkus `<dialog>` native; full lightbox lib hanya bila diminta |
| `BUG-004` | Awards — `referenceLink` generik | `P3` | 2 award Pijak/IBM (`best-capstone`, `lulusan-terbaik`) memakai `referenceLink: https://www.dicoding.com/` generik, bukan URL kredensial/sertifikat spesifik. | 1. Buka `/` section Awards 2. Klik ikon paperclip | `Open` | Ganti dengan URL verifikasi sertifikat spesifik bila tersedia |
| `BUG-005` | Blog `/blog` — estimasi waktu baca | `P3` | Checklist A.10 mensyaratkan estimasi waktu baca, tapi `blog-page-content.tsx` tidak me-render-nya (0 hit `min read` di kode & HTML live). | 1. Buka `/blog` 2. Perhatikan tiap item artikel | `Open` | Tambahkan estimasi (±200 wpm dari panjang excerpt) hanya bila checklist dipertahankan; jika tidak, coret syarat dari checklist |

---

## 📝 5. Catatan Rilis & Kesimpulan Akhir (Sign-Off)

- **Tanggal Selesai Pengujian:** 
- **Total Test Case Dieksekusi:** `... / ...`
- **Total Bug Ditemukan:** 
- **Keputusan:**
  - [ ] **READY FOR DEPLOYMENT** (Semua tes penting lolos)
  - [ ] **NEEDS REVISION** (Masih terdapat bug P0/P1 yang belum terselesaikan)

**Tanda Tangan Penguji (Sign-Off):**  
*(Nama / Inisial Tester)*
