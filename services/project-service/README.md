# 🏗️ Project Service - PT Solusi Bangunan Berkah

**Project Service** adalah microservice yang bertanggung jawab untuk manajemen siklus hidup proyek konstruksi dan furniture. Layanan ini memungkinkan admin untuk mengelola proyek, memantau _milestone_ (tahapan pengerjaan), mengunggah dokumentasi foto/dokumen, serta menyediakan fitur pelacakan (_tracking_) publik bagi pelanggan.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Instalasi & Menjalankan](#-instalasi--menjalankan)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Struktur Folder](#-struktur-folder)
- [Dokumentasi API](#-dokumentasi-api)
- [Alur Kerja & Logika](#-alur-kerja--logika)

---

## ✨ Fitur Utama

### 🏢 Manajemen Proyek

- **CRUD Proyek**: Membuat, membaca, memperbarui, dan menghapus data proyek.
- **Project Code Generator**: Pembuatan kode proyek unik otomatis (Format: `PRJ-YYYY-XXX`) untuk identifikasi mudah.
- **Status Management**: Mengelola status proyek (`pending`, `in_progress`, `on_hold`, `completed`, `cancelled`).

### 📈 Milestone & Progress Tracking

- **Manajemen Tahapan**: Membagi proyek menjadi beberapa _milestone_ (misal: Pondasi, Struktur, Finishing).
- **Progress Calculation**: Perhitungan persentase progress proyek secara otomatis berdasarkan bobot milestone yang selesai.
- **Timeline**: Estimasi durasi, tanggal mulai, dan tanggal selesai.

### 📂 Dokumentasi Digital

- **Upload Foto**: Mengunggah foto progres pengerjaan ke dalam milestone spesifik.
- **Manajemen Dokumen**: Menyimpan dokumen kontrak, blueprint, atau perizinan terkait proyek.
- **File Handling**: Validasi tipe file dan manajemen penyimpanan lokal.

### 🔍 Public Tracking (Fitur Unggulan)

- **Customer Access**: Endpoint publik yang memungkinkan pelanggan memantau progres proyek mereka hanya dengan menggunakan `projectCode`.
- **Real-time Updates**: Pelanggan dapat melihat status terkini, sisa hari pengerjaan, dan foto progres terbaru.

### 📊 Dashboard & Activity Log

- **Activity Logging**: Mencatat setiap aktivitas (pembuatan, update status, upload) untuk audit trail.
- **Statistik**: Ringkasan jumlah proyek aktif, selesai, dan pendapatan untuk dashboard admin.

---

## 🛠 Arsitektur & Teknologi

Service ini dibangun menggunakan teknologi modern yang berfokus pada performa dan skalabilitas:

| Komponen        | Teknologi                                                      | Keterangan                                                                |
| :-------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **Runtime**     | ![NodeJS](https://img.shields.io/badge/Node.js-20.x-green)     | Environment eksekusi JavaScript server-side.                              |
| **Framework**   | ![Express](https://img.shields.io/badge/Express.js-4.18-white) | Web framework minimalis untuk routing API.                                |
| **Database**    | ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)     | NoSQL Database untuk fleksibilitas schema (dokumen & milestone embedded). |
| **ORM**         | ![Prisma](https://img.shields.io/badge/Prisma-5.19-blue)       | Type-safe database client & modeling.                                     |
| **Auth**        | JWT (JSON Web Token)                                           | Validasi token untuk endpoint yang dilindungi (Admin).                    |
| **File Upload** | Multer                                                         | Middleware untuk menangani `multipart/form-data`.                         |

---

## 📝 Prasyarat Sistem

Sebelum menjalankan service ini, pastikan sistem Anda memiliki:

1.  **Node.js** (v20.x atau lebih baru)
2.  **MongoDB** (Local atau Atlas Cluster)
3.  **Docker & Docker Compose** (Opsional, untuk deployment container)

---

## 🚀 Instalasi & Menjalankan

### Metode 1: Menjalankan Secara Lokal (Development)

1.  **Masuk ke direktori service:**

    ```bash
    cd services/project-service
    ```

2.  **Install dependensi:**

    ```bash
    npm install
    ```

3.  **Setup Environment:**
    Salin file `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL` dengan koneksi MongoDB Anda.

    ```bash
    cp .env.example .env
    ```

4.  **Generate Prisma Client:**

    ```bash
    npx prisma generate
    ```

5.  **Jalankan Seeder (Opsional):**
    Untuk mengisi database dengan data dummy proyek.

    ```bash
    npm run seed
    ```

6.  **Jalankan Service:**
    ```bash
    npm run dev
    ```
    Service akan berjalan di `http://localhost:8004`.

### Metode 2: Menggunakan Docker

Dari root direktori proyek utama (tempat `docker-compose.yml` berada):

```bash
docker-compose up -d --build project-service
```

---

## ⚙️ Konfigurasi & Environment

Pastikan file `.env` Anda memiliki konfigurasi berikut:

```env
# Server Configuration
PORT=8004
NODE_ENV=development
SERVICE_NAME=project-service

# Database (MongoDB Connection String)
# Contoh format: mongodb://username:password@host:port/database_name?authSource=admin
DATABASE_URL="mongodb://root:password@localhost:27017/project_db?authSource=admin"

# Security (Harus sama dengan Auth Service)
JWT_SECRET=supersecretjwtkey
```

---

## 📁 Struktur Folder

Struktur proyek disusun secara modular untuk memudahkan _maintenance_:

```
project-service/
├── prisma/
│   ├── schema.prisma        # Definisi Model Database (MongoDB)
│   ├── seed.js              # Entry point seeding
│   └── seeders/             # Data dummy logic
├── src/
│   ├── config/              # Konfigurasi DB & Prisma
│   ├── controllers/         # Logika bisnis (Project, Milestone, Photo, dll)
│   ├── middlewares/         # Auth, Role Check, Upload Handler
│   ├── routes/              # Definisi Endpoint API
│   ├── services/            # Shared services (Activity Logger)
│   └── utils/               # Helper functions (Format tanggal, Validasi)
├── uploads/                 # Direktori penyimpanan file (Local)
├── Dockerfile               # Konfigurasi Image Docker
├── server.js                # Entry point aplikasi
└── package.json
```

---

## 📡 Dokumentasi API

Berikut adalah endpoint utama yang tersedia.
_(🔒 = Memerlukan Token JWT & Role Admin)_

### 🏗️ Projects

| Method  | Endpoint                     | Deskripsi                                        | Akses    |
| :------ | :--------------------------- | :----------------------------------------------- | :------- |
| `GET`   | `/api/projects`              | Ambil semua proyek (filter, search, pagination). | 🔒 Admin |
| `GET`   | `/api/projects/:code`        | Ambil detail proyek berdasarkan kode.            | 🔒 Admin |
| `POST`  | `/api/projects`              | Buat proyek baru.                                | 🔒 Admin |
| `PUT`   | `/api/projects/:code`        | Update data proyek.                              | 🔒 Admin |
| `PATCH` | `/api/projects/:code/status` | Update status proyek saja.                       | 🔒 Admin |

### ⛳ Milestones (Tahapan)

| Method  | Endpoint                             | Deskripsi                           | Akses    |
| :------ | :----------------------------------- | :---------------------------------- | :------- |
| `GET`   | `/api/:code/milestones`              | List semua milestone proyek.        | 🔒 Admin |
| `POST`  | `/api/:code/milestones`              | Tambah milestone baru.              | 🔒 Admin |
| `PATCH` | `/api/:code/milestones/:id/progress` | Update progress & status milestone. | 🔒 Admin |

### 📷 Photos & Documents

| Method   | Endpoint                           | Deskripsi                        | Akses    |
| :------- | :--------------------------------- | :------------------------------- | :------- |
| `POST`   | `/api/:code/milestones/:id/photos` | Upload foto ke milestone.        | 🔒 Admin |
| `POST`   | `/api/:code/documents`             | Upload dokumen proyek (PDF/Doc). | 🔒 Admin |
| `DELETE` | `/api/:code/documents/:id`         | Hapus dokumen.                   | 🔒 Admin |

### 🔍 Public Tracking (Customer)

| Method | Endpoint                      | Deskripsi                                | Akses     |
| :----- | :---------------------------- | :--------------------------------------- | :-------- |
| `GET`  | `/api/projects/track/:code`   | Melacak detail, progress, & foto proyek. | 🌍 Public |
| `GET`  | `/api/projects/summary/:code` | Ringkasan singkat status proyek.         | 🌍 Public |

### 📊 Dashboard

| Method | Endpoint                          | Deskripsi                               | Akses    |
| :----- | :-------------------------------- | :-------------------------------------- | :------- |
| `GET`  | `/api/dashboard/stats`            | Statistik total proyek, status, & tipe. | 🔒 Admin |
| `GET`  | `/api/dashboard/activities/:code` | Log aktivitas/history proyek.           | 🔒 Admin |

---

## 💡 Alur Kerja & Logika

### 1\. Perhitungan Progress Otomatis

Progress proyek dihitung berdasarkan rata-rata progress dari semua milestone yang ada.
_Logic:_ Jika Milestone A (100%) dan Milestone B (50%), maka Progress Proyek = (100+50)/2 = 75%. Logika ini dijalankan setiap kali milestone diupdate.

### 2\. Penyimpanan File

File yang diupload (foto/dokumen) disimpan secara lokal di folder `uploads/photos` atau `uploads/documents`. Nama file digenerate secara unik (`timestamp-random`) untuk menghindari duplikasi nama.

### 3\. Activity Logger

Setiap tindakan krusial (Create Project, Update Status, Upload Foto) akan memicu fungsi `logProjectActivity` yang menyimpan riwayat ke dalam array `activities` di dalam dokumen Proyek di MongoDB. Ini memudahkan tracking "siapa melakukan apa dan kapan".

### 4\. Database MongoDB

Berbeda dengan service lain yang mungkin menggunakan SQL, service ini menggunakan **MongoDB** karena struktur data proyek yang bersifat _nested_ (Proyek memiliki banyak Milestone, Milestone memiliki banyak Foto) lebih efisien disimpan sebagai dokumen JSON yang tertanam (_embedded documents_).

---
