# IMPLEMENTASI PLAN & TASK: PORTO-CMS TEMPLATE CLEANUP
> **Mode / Filosofi:** `ponytail: full` (YAGNI, Deletion-First, Native/Stdlib, Minimum Viable Code, No Over-Engineering)  
> **Pendekatan Terpilih:** **Opsi 2 – Clean Starter Kit**  
> **Status:** COMPLETED (ALL TASKS VERIFIED)  
> **File Utama:** `c:\xzavis\implementasi-plan-and-task.md`

---

## 1. Ringkasan & Hasil Keputusan Diskusi

### 1.1. Keputusan Strategis: Opsi 2 (Clean Starter Kit)
Berdasarkan diskusi arsitektur dan kebutuhan template publik:
- **Alasan Pemilihan:** Mengosongkan data secara total (Zero-Data) membuat halaman portofolio terlihat "rusak" atau kosong melompong bagi pengguna baru yang baru pertama kali meng-clone template. Dengan **Clean Starter Kit**:
  - Halaman landing langsung tampil estetis, lengkap dengan 1 contoh proyek ("Sample Project Showcase"), 1 contoh pengalaman ("Tech Company Inc."), dan profil starter netral ("Your Name").
  - Pengguna baru langsung memahami bagaimana tags, link demo/repo, modal preview, dan timeline bekerja sebelum mereka menggantinya melalui Admin CMS (`/admin`).
  - Modul sekunder yang bersifat spesifik personal (`awards.json`, `certifications.json`, `publications.json`, `gallery.json`, `blog.json`) di-reset bersih menjadi array kosong `[]`.

### 1.2. Prinsip & Best Practice `/ponytail` yang Diterapkan
1. **Deletion before Addition (Eliminasi Kode & Aset yang Tidak Perlu)**:
   - Hapus 33 subdirektori sampah hasil testing di `public/projects/` (`a/`, `ada/`, `qa-test-...`).
   - Hapus seluruh foto dan media personal milik pengembang lama (`profile.webp`, `btng.webp`, `basee.webp`, dll.).
   - Hapus 13 file JSON proyek lama dan 7 file pengalaman lama yang membebani repository.
2. **YAGNI (You Aren't Gonna Need It)**:
   - Jangan menambahkan dependensi baru, database external, atau layer abstraksi yang rumit.
   - Cukup gunakan Node.js native filesystem (`fs/promises`) dan `LocalContentRepository` yang sudah ada untuk pembacaan konten dinamis.
3. **Native & One-Liner Solutions**:
   - Fungsi `decodeEmail` dibuat aman menggunakan conditional sederhana tanpa melempar crash browser (`atob` aman atau kembalikan plain text jika format sudah standar).
   - Pembersihan ordering array: jika `order.json` kosong, urutkan berdasarkan file yang ada tanpa hardcoded order constants.
4. **Mark intentional simplifications with `ponytail:` comment**:
   - Setiap penyederhanaan kode diberi tanda komentar `// ponytail: <alasan>`.

---

## 2. Arsitektur Target & Pemetaan Komponen

```
c:\xzavis/
├── content/
│   ├── profile.json            <- Profil starter netral ("Your Name", role starter)
│   ├── settings.json           <- SEO title & meta description netral
│   ├── skills.json             <- Kumpulan tech stack umum (Frontend, Backend, Tools)
│   ├── social-links.json       <- Link sosial media starter (GitHub, LinkedIn)
│   ├── awards.json             <- [] (Array kosong bersih)
│   ├── certifications.json     <- [] (Array kosong bersih)
│   ├── publications.json       <- [] (Array kosong bersih)
│   ├── gallery.json            <- [] (Array kosong bersih)
│   ├── blog.json               <- [] (Array kosong bersih)
│   ├── projects/
│   │   ├── order.json          <- ["starter-project"]
│   │   └── starter-project.json<- 1 Project showcase starter
│   └── experiences/
│       ├── order.json          <- ["sample-experience"]
│       └── sample-experience.json <- 1 Experience timeline starter
├── public/
│   ├── image/
│   │   ├── default-avatar.svg  <- [NEW] Avatar default SVG modern & netral
│   │   ├── banner.webp         <- Banner umum
│   │   └── og.png              <- OG social card netral
│   └── projects/               <- DIBERSIHKAN: 33 folder sampah dihapus total
└── src/
    ├── lib/
    │   ├── portfolio-chat-context.ts <- [REFACTOR] Dinamis baca via LocalContentRepository
    │   ├── portfolio-chat-prompt.ts  <- [DYNAMIC] Prompt nama/role mengikuti profile.json
    │   └── content/local-repo.ts     <- [CLEANUP] Hapus hardcoded zickrian fallback
    └── ...
```

---

## 3. Matriks Tugas & Subtask Iterasi Agent

Status legend:
- `[ ]` : Belum dikerjakan (PENDING)
- `[/]` : Sedang dikerjakan (IN_PROGRESS)
- `[x]` : Selesai dan terverifikasi (COMPLETED)

---

### [x] TASK-01: Decoupling Arsitektur & Perbaikan Ketergantungan Statis
**Tujuan:** Mencegah build error saat file JSON lama dihapus, dan memastikan semua komponen adaptif terhadap data dinamis.

- [x] **Subtask 1.1: Refactor Dynamic Retrieval di Chat Context**
  - **File:** `src/lib/portfolio-chat-context.ts`
  - **Aksi:** Hapus static import individual 13 file `content/projects/*.json` dan 7 file `content/experiences/*.json`. Ganti dengan pembacaan dinamis menggunakan `LocalContentRepository.getProjects()` dan `LocalContentRepository.getExperiences()`, atau pembacaan filesystem asinkron runtime Node.js.
  - **Acceptance Criteria:** Tidak ada lagi statik import file `.json` dari `projects/` atau `experiences/`. Chat context tetap mengembalikan format search index yang valid.

- [x] **Subtask 1.2: Dinamisasi AI Chatbot Prompt & Refusals**
  - **File:** `src/lib/portfolio-chat-prompt.ts` dan `src/app/api/chat/route.ts`
  - **Aksi:** Ganti identitas hardcoded *"You are Firdaus Khotibul Zickrian..."* dengan nama dan peran yang dibaca dari parameter konteks/profil (`profile.displayName`, `profile.jobTitle`). Perbaiki pesan penolakan (*out-of-scope refusals*) agar netral dan profesional tanpa menyebut nama developer lama secara statis.
  - **Acceptance Criteria:** AI Chatbot memperkenalkan diri sesuai dengan `displayName` di `profile.json`.

- [x] **Subtask 1.3: Pembersihan Hardcoded Fallbacks di Local Repository**
  - **File:** `src/lib/content/local-repo.ts`
  - **Aksi:**
    - Hapus konstanta hardcoded `PROJECT_ORDER` (13 ID lama) dan `EXPERIENCE_ORDER` (7 ID lama).
    - Ubah fallback ordering: jika `order.json` tidak ada, gunakan urutan natural file yang ditemukan.
    - Ubah fallback `companyLogo` dari `"/logos/custompedia.webp"` menjadi string kosong atau logo default.
    - Ubah fallback `link` proyek dari `"https://github.com/zickrian"` menjadi link dinamis atau string kosong.
    - Ubah default `githubRepo` dari `"zickrian/portfolio"` menjadi `"yourusername/portfolio"`.
  - **Acceptance Criteria:** Penghapusan file JSON proyek/pengalaman lama tidak menyebabkan error fallback.

- [x] **Subtask 1.4: Perbaikan Keamanan `decodeEmail` & String Utils**
  - **File:** `src/utils/string.ts` dan `src/utils/string.test.ts`
  - **Aksi:** Bungkus `decodeEmail` dengan logic aman: jika input kosong kembalikan `""`, jika input sudah berupa email biasa (mengandung `@`), kembalikan langsung; jika base64, dekode dengan try-catch tanpa melempar `DOMException`. Perbarui test unit agar mencakup kasus email biasa dan email base64.
  - **Acceptance Criteria:** `npm test` lulus dan tidak ada unhandled exception saat email kosong atau plain text.

- [x] **Subtask 1.5: Dinamisasi Tautan Website di Profile Header & Blog**
  - **File:** `src/features/portfolio/components/profile-header.tsx`, `src/features/blog/lib/fetch-medium-posts.ts`, `src/features/blog/components/blog-page-content.tsx`
  - **Aksi:**
    - Di `profile-header.tsx`, ubah teks tautan website agar menggunakan `urlToName(profile.website)` dan hanya dirender jika `profile.website` terisi.
    - Di `blog-page-content.tsx`, ganti author hardcoded dengan data dari profil.
    - Di `fetch-medium-posts.ts`, buat fetch Medium aman jika username tidak diset.
  - **Acceptance Criteria:** Tidak ada teks `zickrian.dev` yang terkunci mati di header publik.

- [x] **Subtask 1.6: Netralisasi Branding & Admin Auth Guard**
  - **File:** `src/features/admin/components/admin-auth-guard.tsx`, `src/config/site.ts`, `src/components/footer-contact-list.tsx`
  - **Aksi:** Ganti branding "Zickrian Admin" menjadi "PortoCMS Admin", ganti handle fallback `@zickrian` menjadi `@yourusername` atau dinamis dari `profile.username`.
  - **Acceptance Criteria:** Tampilan login admin netral dan siap pakai.

---

### [x] TASK-02: Pembersihan & Restrukturisasi Data JSON (Clean Starter Kit)
**Tujuan:** Mengganti data personal lama dengan starter kit netral yang bersih dan siap diedit via CMS.

- [x] **Subtask 2.1: Buat Profil Starter Netral di `content/profile.json`**
  - **File:** `content/profile.json`
  - **Aksi:** Masukkan data starter netral:
    - `displayName: "Your Name"`
    - `username: "yourusername"`
    - `jobTitle: "Full Stack Developer"`
    - `bio: "I am a passionate developer building modern web applications and impactful software solutions."`
    - `email: "yourname@example.com"`
    - `avatar: "/image/default-avatar.svg"`
    - `sameAs: ["https://github.com/yourusername", "https://linkedin.com/in/yourusername"]`
  - **Acceptance Criteria:** File JSON valid dan terhubung dengan schema `Profile`.

- [x] **Subtask 2.2: Buat Konfigurasi SEO Netral di `content/settings.json`**
  - **File:** `content/settings.json`
  - **Aksi:** Ubah `seoTitle`, `seoDescription`, dan `keywords` menjadi nilai umum ("Developer Portfolio", "Full Stack Developer", dll.).
  - **Acceptance Criteria:** Metadata SEO bersih dari nama pengembang lama.

- [x] **Subtask 2.3: Bersihkan & Buat Starter Project di `content/projects/`**
  - **File:** `content/projects/*`
  - **Aksi:**
    - Hapus seluruh 13 file JSON proyek lama (`naratioai.json`, `custora.json`, dll.).
    - Buat 1 file starter: `content/projects/starter-project.json` dengan detail proyek contoh profesional (Tech stack: Next.js, React, Tailwind, TypeScript).
    - Perbarui `content/projects/order.json` menjadi `["starter-project"]`.
  - **Acceptance Criteria:** Hanya ada 1 proyek starter dan `order.json` yang sinkron.

- [x] **Subtask 2.4: Bersihkan & Buat Starter Experience di `content/experiences/`**
  - **File:** `content/experiences/*`
  - **Aksi:**
    - Hapus seluruh file pengalaman kerja lama (`custompedia.json`, `pijak-ibm.json`, dll.).
    - Buat 1 file starter: `content/experiences/sample-experience.json` (Perusahaan: "Tech Company Inc.", Posisi: "Software Engineer").
    - Perbarui `content/experiences/order.json` menjadi `["sample-experience"]`.
  - **Acceptance Criteria:** Hanya ada 1 pengalaman starter dan `order.json` yang sinkron.

- [x] **Subtask 2.5: Reset Modul Sekunder Menjadi Array Kosong Bersih**
  - **Files:**
    - `content/awards.json` → `[]`
    - `content/certifications.json` → `[]`
    - `content/publications.json` → `[]`
    - `content/gallery.json` → `[]`
    - `content/blog.json` → `[]`
  - **Aksi:** Kosongkan array JSON agar user dapat memulai dari data bersih.
  - **Acceptance Criteria:** Semua file berisi array kosong valid `[]`.

- [x] **Subtask 2.6: Sinkronisasi Social Links di `content/social-links.json`**
  - **File:** `content/social-links.json`
  - **Aksi:** Sediakan 2 tautan default: GitHub (`https://github.com/yourusername`) dan LinkedIn (`https://linkedin.com/in/yourusername`).
  - **Acceptance Criteria:** Social links menampilkan icon dan tautan starter.

---

### [x] TASK-03: Pembersihan Aset Fisik & Penyediaan Default Media
**Tujuan:** Menghapus sampah folder hasil testing dan foto personal, serta menyediakan avatar netral.

- [x] **Subtask 3.1: Hapus 33 Folder Sampah di `public/projects/`**
  - **Direktori:** `public/projects/`
  - **Aksi:** Hapus folder: `a/`, `ad/`, `ada/`, `ada-a/`, `ada-aj/`, `ada-aja/`, `ada-aja-t/`, `ada-aja-te/`, `ada-aja-tes/`, `ada-aja-test/`, `ada-aja-testi/`, `ada-aja-testin/`, `ada-aja-testing/`, `base-realms/`, `custora/`, `ecomerce/`, `machine-learning-system/`, `naratioai/`, `q/`, `qa/`, `qa-/`, `qa-t/`, `qa-te/`, `qa-tes/`, `qa-test/`, `qa-test-/`, `qa-test-p/`, `qa-test-pr/`, `qa-test-pro/`, `qa-test-proj/`, `qa-test-proje/`, `qa-test-projec/`, `qa-test-project/`. Hapus file webp mockup lama.
  - **Acceptance Criteria:** Direktori `public/projects/` bersih tanpa folder sampah.

- [x] **Subtask 3.2: Hapus Foto Profil & Foto Pribadi di `public/image/`**
  - **Direktori:** `public/image/`
  - **Aksi:** Hapus `profile.webp`, `profile2.webp`, `picture1.webp`, `btng.webp`, `btng-poster-v1.webp`, `basee.webp`. Pertahankan aset umum: `day.webp`, `night.webp`.
  - **Acceptance Criteria:** Tidak ada lagi foto pribadi Zickrian di `public/image/`.

- [x] **Subtask 3.3: Buat Asset Avatar Default Modern**
  - **File:** `public/image/default-avatar.svg`
  - **Aksi:** Buat file SVG avatar netral minimalis dengan palet warna dark/light mode yang elegan.
  - **Acceptance Criteria:** File SVG tersedia dan dapat dirender dengan sempurna di header profil.

---

### [x] TASK-04: Dokumentasi & Lisensi Template
**Tujuan:** Menyiapkan panduan open-source dan atribusi legal yang jelas bagi pengguna template.

- [x] **Subtask 4.1: Perbarui `README.md` & `package.json`**
  - **Files:** `README.md`, `package.json`
  - **Aksi:**
    - Update `package.json` name: `"portocms-portfolio-template"`.
    - Tulis ulang `README.md` berfokus pada PortoCMS: Quick start (clone, pnpm install, pnpm dev), konfigurasi `.env.local`, cara deploy ke Vercel secara gratis, panduan mengakses `/admin` CMS.
    - Sertakan bagian atribusi:
      - *Original UI Design by zickrian.dev*
      - *Local-Repo CMS Engine & Template Distribution by xzavis*
  - **Acceptance Criteria:** `README.md` informatif, ramah pengguna, dan transparan.

---

### [x] TASK-05: Verifikasi Menyeluruh (Verification Gates)
**Tujuan:** Memastikan aplikasi bebas bug, tipe aman, dan sukses di-build.

- [x] **Subtask 5.1: Eksekusi Unit Test Suite**
  - **Perintah:** `npm test`
  - **Target:** 100% tests passed (15/15 passing).
- [x] **Subtask 5.2: Eksekusi TypeScript Checking**
  - **Perintah:** `npm run check-types`
  - **Target:** 0 error tipe atau broken imports.
- [x] **Subtask 5.3: Eksekusi Production Build Next.js**
  - **Perintah:** `npm run build`
  - **Target:** Build sukses tanpa error SSG/SSR atau module resolution (30/30 pages generated).
- [x] **Subtask 5.4: Uji Coba Navigasi Publik & Admin CMS di Browser**
  - **Halaman:** `/`, `/projects`, `/admin`, `/admin/profile`, `/admin/projects`
  - **Target:** Tampilan rapi, form CMS berfungsi menyimpan data starter, live preview normal.

---

## 4. Panduan Eksekusi untuk AI Agent CLI

1. **Jalankan subtask secara sekuensial:** TASK-01 (Decoupling) WAJIB dieksekusi sebelum TASK-02 (Penghapusan JSON) agar build tidak rusak di tengah jalan.
2. **Gunakan tag komentar `// ponytail:`** pada setiap simplifikasi logika kode.
3. **Validasi sesering mungkin:** Jalankan `npm test` dan `npm run check-types` setelah menyelesaikan TASK-01 dan TASK-02.
