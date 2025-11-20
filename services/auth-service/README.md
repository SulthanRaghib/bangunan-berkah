# 🔐 Auth Service - PT Solusi Bangunan Berkah

**Auth Service** adalah fondasi keamanan dari ekosistem microservices PT Solusi Bangunan Berkah. Layanan ini bertindak sebagai _gatekeeper_ yang menangani identitas pengguna, otentikasi, otorisasi berbasis peran (RBAC), dan manajemen data pengguna secara terpusat menggunakan database MongoDB.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Instalasi & Konfigurasi](#-instalasi--konfigurasi)
- [Struktur Project](#-struktur-project)
- [Dokumentasi API](#-dokumentasi-api)
- [Alur Kerja & Keamanan](#-alur-kerja--keamanan)

---

## ✨ Fitur Utama

### 🛡️ Otentikasi (Authentication)

- **Registrasi & Login**: Validasi input ketat menggunakan Joi dan keamanan password dengan Bcrypt.
- **JWT Standard**: Menggunakan strategi _Dual Token_ (Access Token & Refresh Token) untuk keamanan sesi yang lebih baik.
- **Token Refresh**: Mekanisme pembaruan token akses tanpa perlu login ulang selama refresh token valid.

### 👮 Otorisasi (Authorization)

- **Role-Based Access Control (RBAC)**: Membedakan hak akses antara `admin` dan `user` biasa.
- **Middleware Protection**: Middleware terintegrasi untuk memverifikasi token dan peran pengguna sebelum mengakses _protected routes_.

### 👤 Manajemen Pengguna

- **CRUD User**: Admin memiliki akses penuh untuk melihat, mengubah, dan menghapus pengguna.
- **Profile Management**: Pengguna dapat melihat dan memperbarui profil mereka sendiri.
- **Self-Protection**: Mencegah admin menghapus akunnya sendiri secara tidak sengaja.

### 🩺 Monitoring

- **Health Checks**: Endpoint khusus (`/health`, `/live`, `/ready`) untuk pemantauan status layanan dan koneksi database (Liveness & Readiness probes).

---

## 🛠 Arsitektur & Teknologi

Service ini dibangun di atas teknologi modern yang mengutamakan performa I/O dan keamanan:

| Komponen      | Teknologi                                                      | Deskripsi                                                 |
| :------------ | :------------------------------------------------------------- | :-------------------------------------------------------- |
| **Runtime**   | ![NodeJS](https://img.shields.io/badge/Node.js-20.x-green)     | Environment JavaScript server-side yang ringan dan cepat. |
| **Framework** | ![Express](https://img.shields.io/badge/Express.js-4.19-white) | Framework web minimalis untuk routing API yang efisien.   |
| **Database**  | ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)     | NoSQL Database untuk fleksibilitas skema data user.       |
| **ORM**       | ![Prisma](https://img.shields.io/badge/Prisma-5.22-blue)       | Modern ORM untuk interaksi type-safe dengan MongoDB.      |
| **Keamanan**  | ![JWT](https://img.shields.io/badge/JWT-Auth-orange)           | Standar industri untuk transmisi klaim keamanan.          |
| **Validasi**  | Joi                                                            | Schema validator untuk memastikan integritas data input.  |

---

## 📝 Prasyarat Sistem

Sebelum memulai, pastikan lingkungan pengembangan Anda memenuhi syarat berikut:

1.  **Node.js**: Versi 20.0 atau lebih baru.
2.  **MongoDB**: Instance database MongoDB yang berjalan (lokal atau cloud).
3.  **Docker** (Opsional): Untuk deployment menggunakan container.

---

## 🚀 Instalasi & Konfigurasi

### 1. Setup Environment Variables

Salin file `.env.example` menjadi `.env` di dalam direktori `services/auth-service`:

```bash
cp .env.example .env
```

Sesuaikan konfigurasi berikut (pastikan `DATABASE_URL` mengarah ke MongoDB):

```env
PORT=8001
SERVICE_NAME=auth-service
DATABASE_URL="mongodb://admin:password@localhost:27017/auth_db?authSource=admin"

# JWT Secrets (Gunakan string acak yang panjang dan aman)
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=supersecretrefreshkey
JWT_REFRESH_EXPIRES_IN=7d
```

### 2\. Instalasi Dependensi

Jalankan perintah berikut untuk menginstal paket yang dibutuhkan:

```bash
npm install
```

### 3\. Database Setup & Seeding

Generate Prisma Client dan isi database dengan data awal (Seeding):

```bash
# Generate client
npx prisma generate

# Push schema ke MongoDB (tanpa migrasi SQL)
npx prisma db push

# Jalankan seeder (Membuat Admin & User default)
npm run seed
```

> **Info Seeder:** Script ini akan membuat user default:
>
> - **Admin**: `admin@solusi-bangunan.com` / `password123`
> - **User**: `user@solusi-bangunan.com` / `password123`

### 4\. Menjalankan Service

- **Mode Development** (dengan Hot-reload):
  ```bash
  npm run dev
  ```
- **Mode Production**:
  ```bash
  npm start
  ```

---

## 📂 Struktur Project

Struktur kode diorganisir dengan pola _Separation of Concerns_ untuk kemudahan pemeliharaan:

```
auth-service/
├── prisma/
│   ├── schema.prisma       # Definisi Model Database (User)
│   ├── seed.js             # Entry point seeding
│   └── seeders/            # Logika dummy data user
├── src/
│   ├── config/             # Konfigurasi Prisma Client
│   ├── controllers/        # Logika bisnis (Auth & User Management)
│   ├── middlewares/        # Auth check, Role check, Error handling
│   ├── routes/             # Definisi Endpoint API
│   ├── utils/              # Helper: Bcrypt, JWT Generator, Validation
│   └── app.js              # Inisialisasi Express App
├── Dockerfile              # Konfigurasi Docker Image
├── docker-entrypoint.sh    # Script startup container
└── server.js               # Entry point server
```

---

## 📡 Dokumentasi API

Berikut adalah endpoint utama yang tersedia.
_(🔒 = Memerlukan Token JWT di Header Authorization)_

### 🔑 Autentikasi (Public)

| Method | Endpoint                  | Deskripsi                              | Body Request                       |
| :----- | :------------------------ | :------------------------------------- | :--------------------------------- |
| `POST` | `/api/auth/register`      | Mendaftarkan pengguna baru.            | `{ name, email, password, role? }` |
| `POST` | `/api/auth/login`         | Masuk ke sistem & dapatkan token.      | `{ email, password }`              |
| `POST` | `/api/auth/refresh-token` | Perbarui Access Token yang kadaluarsa. | `{ refreshToken }`                 |
| `POST` | `/api/auth/logout`        | Logout (Client-side clear).            | -                                  |

### 👤 Profil Pengguna

| Method | Endpoint            | Deskripsi                                     | Akses  |
| :----- | :------------------ | :-------------------------------------------- | :----- |
| `GET`  | `/api/auth/profile` | Mendapatkan data diri user yang sedang login. | 🔒 All |

### 👥 Manajemen User (Admin Area)

| Method   | Endpoint         | Deskripsi                                            | Akses          |
| :------- | :--------------- | :--------------------------------------------------- | :------------- |
| `GET`    | `/api/users`     | Melihat daftar semua pengguna (pagination & search). | 🔒 Admin       |
| `GET`    | `/api/users/:id` | Melihat detail pengguna berdasarkan ID.              | 🔒 All         |
| `PUT`    | `/api/users/:id` | Update data pengguna (Nama, Email, Password).        | 🔒 Owner/Admin |
| `DELETE` | `/api/users/:id` | Menghapus pengguna dari sistem.                      | 🔒 Admin       |

---

## 💡 Alur Kerja & Keamanan

### 1\. Password Hashing

Password tidak pernah disimpan dalam bentuk teks asli (plain text). Layanan menggunakan **Bcrypt** dengan _salt round_ standar untuk melakukan _hashing_ sebelum data disimpan ke MongoDB.

### 2\. Strategi JWT (JSON Web Token)

- **Access Token**: Berumur pendek (misal: 15 menit). Digunakan untuk mengakses resource API. Disimpan di Memory/State frontend.
- **Refresh Token**: Berumur panjang (misal: 7 hari). Digunakan hanya untuk meminta Access Token baru ketika yang lama kadaluarsa. Disimpan di HTTPOnly Cookie atau Secure Storage.

### 3\. Validasi Input

Setiap request yang masuk divalidasi menggunakan **Joi Schema**. Ini mencegah data kotor masuk ke controller dan memberikan pesan error yang bersahabat jika format data salah (misal: format email tidak valid, password terlalu pendek).

### 4\. Containerization

Dilengkapi dengan `Dockerfile` dan `docker-entrypoint.sh` yang cerdas. Script entrypoint akan otomatis menunggu database siap (`db push`) dan menjalankan migrasi/seeding jika diperlukan sebelum aplikasi dimulai, memastikan deployment yang mulus di lingkungan orkestrasi.

---
