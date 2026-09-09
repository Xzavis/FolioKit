# 📄 Product Requirements Document (PRD)

**Proyek:** Firdaus Khotibul Zickrian Personal Portfolio & Admin CMS (`Xzavis/dev`)  
**Domain Publik:** [zickrian.dev](https://www.zickrian.dev)  
**Versi Dokumen:** 1.0.0  
**Tanggal:** 2026-09-07  
**Status:** Approved / In Progress  

---

## 1. Executive Summary & Visi Produk

### 1.1 Latar Belakang
Situs personal branding profesional untuk software engineer modern membutuhkan perpaduan antara **kecepatan akses tinggi (ultra-fast performance)**, **estetika interaktif kontemporer**, dan **kemudahan pembaruan konten (easy content maintenance)**. 

Banyak CMS konvensional (WordPress, Strapi, Contentful) memerlukan infrastruktur database eksternal, biaya langganan bulanan, atau konfigurasi kompleks. Proyek ini mengusung pendekatan **Local-first File-based CMS** yang terintegrasi langsung ke dalam framework modern Next.js 16, di mana data disimpan dalam file JSON kanonikal dan terlacak penuh oleh Git (*Git as a single source of truth*).

### 1.2 Visi & Nilai Utama
1. **Representasi Profesional & Interaktif**: Portofolio interaktif dengan widget AI cerdas (Groq API), toggle dwibahasa (ID/EN), audio haptic feedback, dan performa Core Web Vitals optimal.
2. **Kontrol Konten Mandiri (Self-Hosted CMS)**: Panel admin internal berproteksi PIN yang memungkinkan modifikasi profil, proyek, keahlian, pengalaman, sertifikat, dan media secara langsung tanpa menyentuh kode program.
3. **Penyimpanan Aset Terstruktur & Hemat (Ponytail Minimalist)**: Penataan direktori aset kontekstual dengan mekanisme deduplikasi otomatis untuk mencegah pemborosan ruang penyimpanan.
4. **Reliabilitas Teruji (Quality Engineering)**: Penjaminan mutu end-to-end melalui checklist pengujian manual terstruktur dan otomasi pengujian modern menggunakan **TestSprite** serta unit test **Vitest**.

---

## 2. Arsitektur Teknis & Prinsip Sistem

### 2.1 Technology Stack

| Layer | Teknologi | Rationale / Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) | Server Components (RSC), Server Actions, performa rendering tinggi, SSR/SSG instan. |
| **Bahasa** | TypeScript 5.8 | Type safety menyeluruh dari skema data JSON hingga komponen UI. |
| **Styling & UI** | Tailwind CSS v4, Radix UI | Desain modern, fleksibel, responsif, dan aksesibel (*headless components*). |
| **Penyimpanan Data** | Local Canonical JSON (`/content/**/*.json`) | Cepat, tanpa latensi koneksi database, gratis, dan ter-versioning dalam Git. |
| **AI Integration** | Groq Cloud SDK (Llama-based models) | Respons streaming ultra-cepat untuk AI chat widget dan perapian teks email kontak. |
| **Email Service** | Resend API | Pengiriman notifikasi formulir kontak yang andal dengan batas gratis memadai. |
| **Otomasi QA / Test** | TestSprite AI Suite & Vitest | Otomasi pengujian E2E frontend berbasis AI dan unit test utilitas data. |
| **Deployment** | Vercel | Kompatibilitas native Next.js, Edge Network global, dan otomatisasi CI/CD. |

### 2.2 Data Flow & Arsitektur Mutasi Konten
```
┌────────────────────────────────────────────────────────┐
│               Admin CMS Dashboard (/admin)             │
│        (Form Input, Reorder, Media Library Modal)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Server Actions (content-actions.ts)        │
│       - Validasi Schema (Zod / TypeScript Types)       │
│       - Sanitasi Path & File Security Guards           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│     Content Manager & Local Repo (atomic write FS)     │
│       - Deduplikasi Media                               │
│       - Update File Canonical: /content/**/*.json      │
│       - Invalidation: revalidatePath('/')              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              Public Website (zickrian.dev)             │
│         RSC Data Fetching ➔ Ultra Fast Delivery        │
└────────────────────────────────────────────────────────┘
```

### 2.3 Strategi Manajemen Media (Contextual Mapping)
Media disimpan langsung pada folder publik Next.js sesuai peruntukannya:
- **Logos (`/public/logos/`)**: Digunakan untuk logo perusahaan di *Experience* dan logo institusi di *Certifications*.
- **Proyek (`/public/projects/[slug]/`)**: Folder khusus per proyek untuk gambar galeri (`gallery[]`) dan gambar hero (`image`). Folder dibuat otomatis saat proyek baru ditambahkan.
- **Profil & Ilustrasi Umum (`/public/image/`)**: Foto profil personal dan visual pelengkap.
- **Banner Root (`/public/`)**: Aset media berat seperti banner video WebM dan wallpaper utama.
- **Deduplikasi Cerdas**: Jika file dengan nama yang sama diunggah ke folder tujuan, sistem langsung mengaitkan file yang sudah ada tanpa melakukan duplikasi nama atau penambahan timestamp acak.

---

## 3. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### 3.1 Frontend Portofolio Publik

#### FR-PUB-01: Hero & Profile Header
- Menampilkan nama lengkap, headline profesional, domisili, dan status ketersediaan kerja (*available for hire*).
- Menampilkan avatar berkualitas tinggi dengan rasio presisi.
- Mendukung pemutaran banner video WebM/MP4 secara otomatis (*autoplay*), tanpa suara (*muted*), berulang (*looping*), serta responsif di semua ukuran layar.

#### FR-PUB-02: Bilingual Support (ID/EN)
- Menyediakan tombol pengubah bahasa (ID ⇄ EN) yang dapat diakses secara global di navigation bar.
- Seluruh teks statis, judul proyek, ringkasan, dan pengalaman berubah secara konsisten sesuai preferensi bahasa yang dipilih.
- Preferensi tersimpan di local state / cookie.

#### FR-PUB-03: Showcase Proyek & Detail Proyek (`/projects`)
- Menampilkan daftar proyek yang dikelompokkan atau diurutkan berdasarkan `order.json`.
- Mendukung filter proyek berdasarkan kategori atau teknologi terkait.
- Halaman detail proyek (`/projects/[slug]`) menampilkan deskripsi mendalam, tantangan, solusi arsitektur, daftar teknologi, tautan langsung (Live Demo / Repository), dan galeri foto bertingkat (*gallery showcase*).

#### FR-PUB-04: AI Chat Widget
- Widget obrolan mengambang (*floating chat widget*) yang responsif (desktop popover, mobile adaptive sheet).
- Menggunakan Groq API dengan mekanisme *streaming response*.
- Dilengkapi dengan *System Prompt* khusus yang memuat pengetahuan kontekstual mengenai profil, keahlian, dan riwayat proyek Firdaus Khotibul Zickrian.
- Proteksi rate limit dan fallback penanganan error koneksi.

#### FR-PUB-05: Pengalaman Kerja & Pendidikan (Timeline)
- Menampilkan perjalanan karier dalam visualisasi linimasa (*interactive vertical timeline*).
- Setiap item pengalaman menampilkan peran, nama institusi/perusahaan, logo, rentang waktu, dan poin-poin pencapaian.

#### FR-PUB-06: Keahlian Teknis (Skills Matrix)
- Pengelompokan keahlian ke dalam kategori terstruktur (Frontend, Backend, AI/ML, DevOps, Tools).
- Ikon teknologi yang tajam dan interaktif (efek hover dan tooltip informasi tingkat kemahiran).

#### FR-PUB-07: Aktivitas GitHub & Penghargaan
- Integrasi grafik kontribusi publik GitHub yang diperbarui secara langsung.
- Penanganan fallback graceful ketika GitHub API mencapai limit.
- Daftar penghargaan (*Awards*) dan publikasi artikel ilmiah (*Publications*) dengan tautan verifikasi.

#### FR-PUB-08: Sertifikasi (`/certifications`) & Galeri Foto (`/gallery`)
- Menampilkan lisensi & sertifikasi industri dengan logo penerbit serta tautan verifikasi kredensial.
- Halaman galeri foto dengan grid masonry, penyesuaian rasio aspek natural, dan modal *Lightbox Preview*.

#### FR-PUB-09: Formulir Kontak & Feedback Suara (Sound System)
- Formulir kontak dengan validasi input (nama, email, pesan).
- Opsi bantuan AI untuk merapikan gaya penulisan email sebelum dikirim.
- Pengiriman email otomatis ke inbox pemilik situs via Resend API.
- Fitur *Sound System*: Efek audio subtil saat interaksi klik, tombol, dan navigasi (dengan opsi *mute/unmute* oleh pengguna).

---

### 3.2 Admin CMS (Panel Pengelolaan Konten)

#### FR-ADM-01: Autentikasi Admin
- Halaman login pada rute `/admin` dengan autentikasi berbasis PIN rahasia.
- Proteksi brute force, penolakan instan pada PIN salah, dan penyimpanan sesi aman via cookie HTTP-only terenkripsi.

#### FR-ADM-02: Manajemen Konten Terpadu (CRUD)
- **Profile Manager (`/admin/profile`)**: Modifikasi informasi pribadi, headline, status availability, sosial media, dan tautan resume.
- **Projects Manager (`/admin/projects`)**: Formulir tambah/ubah proyek, pemilihan thumbnail, manajemen tautan repo/demo, dan pengurutan visual urutan proyek (*reordering*).
- **Project Gallery Showcase Manager**: Antarmuka khusus pada tab media proyek untuk menambah, mengunggah ke folder proyek, memindah urutan (naik/turun), dan menghapus foto galeri.
- **Experience & Education Manager**: Kelola riwayat karier, logo perusahaan, dan sertifikasi.
- **Skills Manager**: Tambah/edit keahlian dan kategorisasi tag teknologi.

#### FR-ADM-03: Media Library Modal & File Operations
- Modal galeri aset universal yang terpasang pada seluruh formulir admin.
- Navigasi kontekstual terarah (memilih file langsung dari folder yang relevan: `/logos/`, `/image/`, atau `/projects/[slug]/`).
- Fitur pencarian instan nama file aset.
- Fitur hapus file permanen dari disk lokal dengan konfirmasi keamanan berlapis untuk mencegah penghapusan file sistem esensial.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 4.1 Kinerja (Performance)
- **Core Web Vitals**:
  - *Largest Contentful Paint (LCP)* < 1.8 detik.
  - *Cumulative Layout Shift (CLS)* = 0.
  - *Interaction to Next Paint (INP)* < 100 ms.
- Kompresi media otomatis menggunakan komponen `next/image` dan format video modern (`.webm`).
- Cache invalidation seketika via `revalidatePath` saat admin melakukan update data.

### 4.2 Keamanan (Security)
- Validasi ketat terhadap seluruh payload Server Actions menggunakan Zod.
- Proteksi terhadap *Directory Traversal Attack* (`../`) pada endpoint upload dan penghapusan file media.
- Environment variables terisolasi (`GROQ_API_KEY`, `RESEND_API_KEY`, PIN admin) dan tidak bocor ke client bundle.

### 4.3 Aksesibilitas & SEO
- Struktur heading semantik tunggal `<h1>` per halaman dengan hierarki logis.
- Tag meta OpenGraph dinamis untuk preview sosial media (Twitter Cards, LinkedIn).
- Kontras warna mematuhi standar WCAG 2.1 AA untuk mode terang dan gelap.

---

## 5. Rencana Pengujian Mutu (QA) & Otomasi TestSprite

### 5.1 Matriks Penjaminan Mutu
Pengujian dilakukan dengan mengacu pada dokumen [QA_TESTING.md](file:///c:/xzavis/QA_TESTING.md) yang mengklasifikasikan skenario berdasarkan tingkat keparahan:
- **P0 (Blocker / Critical)**: Crash, layar putih, kegagalan autentikasi PIN, kerusakan JSON.
- **P1 (Major)**: Formulir kontak gagal terkirim, upload media gagal, galeri foto error.
- **P2 (Minor / Visual)**: Glitch animasi, alignment di resolusi tertentu, typo teks.
- **P3 (Trivial)**: Peningkatan UX dan penyempurnaan kosmetik.

### 5.2 Strategi Pengujian Otomatis (TestSprite & Vitest)

```
┌────────────────────────────────────────────────────────┐
│                   TestSprite AI Agent                  │
│       - E2E Synthetic User Journey Runs                │
│       - Visual Regression & Edge Cases Testing         │
│       - Multi-viewports & Responsive Scenarios         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Vitest Unit Tests                  │
│       - LocalContentRepository Read/Write Tests        │
│       - Content Manager Atomic Locking                 │
│       - Media Deduplication Logic Verification         │
└────────────────────────────────────────────────────────┘
```

1. **TestSprite E2E Project Runs**:
   - Menjalankan skenario navigasi publik: verifikasi kelengkapan komponen hero, galeri proyek, filter, dan respons AI chat widget.
   - Menguji alur login admin, penolakan PIN tidak valid, dan alur form update tanpa crash.
2. **Vitest Unit & Integration**:
   - Pengujian terhadap helper parser di `src/lib/content/`.
   - Pengujian terhadap fungsi deduplikasi nama file dan penulisan atomik file JSON.

---

## 6. Kriteria Keberhasilan (Definition of Done)

Sebuah fitur atau rilis dinyatakan siap produksi (Production-Ready) apabila:
1. **Lolos Checklist QA**: Seluruh skenario P0 dan P1 pada [QA_TESTING.md](file:///c:/xzavis/QA_TESTING.md) berstatus `[x]` (PASS).
2. **TestSprite Passing**: Rangkaian tes frontend otomatis via `testsprite test run` berhasil tanpa kegagalan kritis.
3. **Build Bebas Error**: Perintah `pnpm build`, `pnpm check-types`, dan `pnpm lint` berjalan 100% bersih tanpa error TypeScript atau ESLint.
4. **Sinkronisasi Dokumen**: Setiap penambahan alur kerja baru terdokumentasi rapi pada [HANDOVER.md](file:///c:/xzavis/HANDOVER.md) dan [README.md](file:///c:/xzavis/README.md).
