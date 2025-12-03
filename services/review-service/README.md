# ⭐ Review Service - PT Solusi Bangunan Berkah

**Review Service** adalah microservice yang dirancang untuk menangani manajemen ulasan (_reviews_) dan penilaian (_ratings_) produk dalam ekosistem PT Solusi Bangunan Berkah. Layanan ini menyediakan infrastruktur dasar untuk membangun interaksi pengguna terkait umpan balik produk.

---

## 📋 Daftar Isi

- [Fitur & Kapabilitas](#-fitur--kapabilitas)
- [Teknologi](#-teknologi)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Struktur Project](#-struktur-project)
- [Dokumentasi API](#-dokumentasi-api)

---

## ✨ Fitur & Kapabilitas

### 🏗️ Infrastruktur Dasar

- **REST API Server**: Server HTTP berbasis Express.js yang ringan dan cepat.
- **Logging Sistem**: Integrasi dengan `morgan` untuk pencatatan request HTTP secara real-time (mode dev).
- **Cross-Origin Resource Sharing (CORS)**: Konfigurasi keamanan untuk mengizinkan akses dari domain yang berbeda.
- **Environment Configuration**: Manajemen variabel lingkungan menggunakan `dotenv` untuk fleksibilitas deployment.

### 🐳 Containerization

- **Docker Ready**: Dilengkapi dengan `Dockerfile` yang menggunakan image `node:20-slim` untuk deployment yang konsisten dan ringan.
- **Dependency Management**: Strategi instalasi dependensi yang efisien (`npm ci --only=production`) untuk image produksi.

### 🎯 Fungsionalitas (Roadmap)

_Layanan ini disiapkan untuk menangani:_

- Pembuatan ulasan produk oleh pengguna.
- Perhitungan rata-rata rating produk.
- Moderasi komentar dan ulasan.

---

## 🛠 Teknologi

Layanan ini dibangun menggunakan teknologi web modern yang stabil:

| Komponen        | Teknologi                                                      | Versi   | Deskripsi                        |
| :-------------- | :------------------------------------------------------------- | :------ | :------------------------------- |
| **Runtime**     | ![NodeJS](https://img.shields.io/badge/Node.js-20.x-green)     | v20     | Environment eksekusi JavaScript. |
| **Framework**   | ![Express](https://img.shields.io/badge/Express.js-4.18-white) | ^4.18.2 | Web framework minimalis.         |
| **Logging**     | ![Morgan](https://img.shields.io/badge/Morgan-1.10-orange)     | ^1.10.0 | HTTP request logger middleware.  |
| **Http Client** | Axios                                                          | ^1.7.3  | Promise based HTTP client.       |

---

## 📝 Prasyarat Sistem

Sebelum menjalankan layanan, pastikan sistem Anda memenuhi syarat berikut:

1.  **Node.js**: Versi 20.0 atau lebih baru.
2.  **Docker** (Opsional): Jika ingin menjalankan dalam container.
3.  **Port 8005**: Pastikan port ini tersedia pada mesin host.

---

## 🚀 Instalasi & Setup

Ikuti langkah-langkah ini untuk menjalankan service di lingkungan lokal:

### 1. Instalasi Manual

1.  **Masuk ke direktori service:**

    ```bash
    cd services/review-service
    ```

2.  **Install dependensi:**

    ```bash
    npm install
    ```

3.  **Jalankan Service:**
    - Mode Development (dengan Nodemon):
      ```bash
      npm run dev
      ```
    - Mode Production:
      ```bash
      npm start
      ```

### 2. Menggunakan Docker

1.  **Build Image:**

    ```bash
    docker build -t review-service .
    ```

2.  **Jalankan Container:**
    ```bash
    docker run -p 8005:8005 --name review-service review-service
    ```

---

## ⚙️ Konfigurasi Environment

Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasinya:

```bash
cp .env.example .env
```

**Variabel yang tersedia:**

```env
# Server Configuration
PORT=8005
NODE_ENV=development
SERVICE_NAME=review-service

# Database Configuration (Siap untuk integrasi)
DATABASE_URL="mysql://root:your_mysql_password@mysql:3306/mydb"
```

---

## 📁 Struktur Project

Struktur folder saat ini dirancang sederhana untuk inisialisasi cepat:

```
review-service/
├── Dockerfile           # Konfigurasi build Docker image
├── index.js             # Entry point aplikasi & konfigurasi server
├── package.json         # Manifest dependensi & script
├── .env.example         # Template variabel lingkungan
└── .dockerignore        # Pengecualian file untuk Docker build
```

---

## 📡 Dokumentasi API

Saat ini service menyediakan endpoint dasar untuk pengecekan status (_Health Check_).

### Base URL

`http://localhost:8005`

### Endpoints

| Method | Endpoint | Deskripsi                                           | Contoh Response                                           |
| :----- | :------- | :-------------------------------------------------- | :-------------------------------------------------------- |
| `GET`  | `/`      | Root endpoint untuk memverifikasi service berjalan. | `{ "message": "review-service is running on port 8005" }` |

---

<div align="center">
<p>Dikembangkan untuk <b>PT Solusi Bangunan Berkah</b></p>
<p><i>Microservice Backend Architecture</i></p>
</div>
````
