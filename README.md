# 🏗️ PT Solusi Bangunan Berkah - Microservices Backend

![NodeJS](https://img.shields.io/badge/Node.js-20-green?style=flat&logo=node.js) ![Express](https://img.shields.io/badge/Express-4.18-white?style=flat&logo=express) ![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat&logo=docker) ![Prisma](https://img.shields.io/badge/ORM-Prisma-white?style=flat&logo=prisma) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=flat&logo=mongodb)

Selamat datang di repositori backend **PT Solusi Bangunan Berkah**. Proyek ini adalah sistem backend berbasis arsitektur _Microservices_ yang dirancang untuk skalabilitas tinggi, memfasilitasi manajemen konstruksi, penjualan material bangunan, pelacakan proyek, serta komunikasi antara pelanggan dan penyedia jasa.

---

## 📋 Daftar Isi

- [🌟 Fitur Utama](#-fitur-utama)
- [🏛️ Arsitektur & Teknologi](#️-arsitektur--teknologi)
- [📂 Struktur Proyek](#-struktur-proyek)
- [🛠️ Prasyarat Instalasi](#️-prasyarat-instalasi)
- [🚀 Panduan Instalasi & Penggunaan](#-panduan-instalasi--penggunaan)
- [⚠️ Konfigurasi Penting (JWT)](#️-konfigurasi-penting-jwt)
- [🌐 Layanan & Port](#-layanan--port)
- [🧪 Contoh Penggunaan API](#-contoh-penggunaan-api)

---

## 🌟 Fitur Utama

Sistem ini terbagi menjadi beberapa layanan terisolasi yang menangani domain bisnis spesifik:

- **🔐 Otentikasi & Otorisasi**: Manajemen pengguna (Admin, Customer), registrasi, login, dan keamanan berbasis JWT (JSON Web Token).
- **📦 Katalog Produk & Inventaris**: Manajemen stok material bangunan, kategori produk, harga, dan gambar produk.
- **🏗️ Manajemen Proyek**: Pelacakan status proyek konstruksi, _milestone_ pengerjaan, timeline, dan dokumentasi progres.
- **💬 Layanan Chat**: Fitur komunikasi _real-time_ antara pelanggan dan admin/kontraktor.
- **⭐ Ulasan & Rating**: Sistem penilaian untuk produk dan layanan jasa.
- **🚪 API Gateway**: Gerbang tunggal untuk mengakses seluruh layanan, menangani _routing_ dan _rate limiting_.

---

## 🏛️ Arsitektur & Teknologi

Proyek ini dibangun menggunakan tumpukan teknologi modern yang berfokus pada kinerja dan kemudahan pengembangan:

| Komponen          | Teknologi          | Deskripsi                                                                            |
| :---------------- | :----------------- | :----------------------------------------------------------------------------------- |
| **Runtime**       | **Node.js** (v20)  | Environment eksekusi JavaScript server-side.                                         |
| **Framework**     | **Express.js**     | Framework web minimalis untuk membangun REST API.                                    |
| **Database**      | **MongoDB**        | Database NoSQL utama untuk penyimpanan data yang fleksibel dan scalable.             |
| **ORM**           | **Prisma**         | _Object-Relational Mapping_ untuk interaksi database yang aman dan _type-safe_.      |
| **Container**     | **Docker**         | Kontainerisasi aplikasi untuk konsistensi lingkungan _development_ dan _production_. |
| **Orchestration** | **Docker Compose** | Manajemen multi-kontainer untuk menjalankan seluruh layanan sekaligus.               |

---

## 📂 Struktur Proyek

Struktur direktori diatur secara modular berdasarkan layanan (_service-based architecture_):

```bash
bangunan-berkah/
├── docker-compose.yml      # Konfigurasi orkestrasi seluruh layanan
├── init.sql                # Skrip inisialisasi database (jika diperlukan)
├── services/               # Folder utama microservices
│   ├── api-gateway/        # Entry point utama untuk client
│   ├── auth-service/       # Layanan User & Auth
│   ├── chat-service/       # Layanan Pesan Instan
│   ├── product-service/    # Layanan Produk & Stok
│   ├── project-service/    # Layanan Manajemen Proyek
│   └── review-service/     # Layanan Ulasan
└── README.md               # Dokumentasi Proyek
```

---

## 🛠️ Prasyarat Instalasi

Sebelum memulai, pastikan perangkat Anda telah terpasang:

1.  **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Wajib untuk menjalankan kontainer.
2.  **[Node.js](https://nodejs.org/)** (Opsional): Jika ingin menjalankan perintah npm/npx secara lokal di luar container.
3.  **Git**: Untuk melakukan _cloning_ repositori.
4.  **API Client**: Seperti Postman atau Insomnia untuk pengujian endpoint.

---

## 🚀 Panduan Instalasi & Penggunaan

Ikuti langkah-langkah berikut untuk menjalankan seluruh sistem menggunakan Docker:

### 1\. Clone Repositori

```bash
git clone [https://github.com/username/bangunan-berkah.git](https://github.com/username/bangunan-berkah.git)
cd bangunan-berkah
```

### 2\. Konfigurasi Environment

Setiap service memiliki file konfigurasi environment sendiri. Anda perlu menyalin file contoh `.env.example` menjadi `.env` di setiap folder service (`services/auth-service`, `services/product-service`, dst).

### ⚠️ Konfigurasi Penting (JWT)

> **SANGAT PENTING:**
> Pastikan konfigurasi `JWT_SECRET` di dalam file `.env` pada **setiap service** memiliki nilai string yang **SAMA PERSIS**.
>
> Hal ini diperlukan karena `Auth Service` yang membuat token, namun service lain (`Product`, `Project`, dll) perlu memvalidasi token tersebut secara independen (_stateless_). Jika secret berbeda, validasi token akan gagal.

Contoh di `.env` setiap service:

```env
JWT_SECRET=rahasia_super_aman_dan_sama_untuk_semua_service
```

### 3\. Jalankan Docker Compose

Perintah ini akan membangun _image_, membuat _network_, dan menjalankan semua kontainer.

```bash
docker-compose up --build
```

_Tunggu hingga semua layanan menampilkan log "Server running on port..."_

### 4\. Migrasi & Seeding Database

Database MongoDB akan diinisialisasi secara otomatis. Namun, untuk mengisi data awal (seperti kategori produk dan user admin), jalankan perintah berikut pada terminal baru (saat docker sedang berjalan):

```bash
# Seeding Auth Service (User Admin & Customer)
docker exec -it auth-service npm run seed

# Seeding Product Service (Kategori & Produk)
docker exec -it product-service npm run seed

# Seeding Project Service (Sample Project)
docker exec -it project-service npm run seed
```

---

## 🌐 Layanan & Port

Berikut adalah daftar pemetaan port default untuk akses lokal:

| Layanan           | Container Name    | Port Lokal | Deskripsi                                        |
| :---------------- | :---------------- | :--------- | :----------------------------------------------- |
| **API Gateway**   | `api-gateway`     | **8080**   | **Gunakan port ini untuk akses Client/Frontend** |
| Auth Service      | `auth-service`    | 8001       | Internal Auth API                                |
| Product Service   | `product-service` | 8002       | Internal Product API                             |
| Chat Service      | `chat-service`    | 8003       | Internal Chat API                                |
| Project Service   | `project-service` | 8004       | Internal Project API                             |
| Review Service    | `review-service`  | 8005       | Internal Review API                              |
| **Mongo Express** | `mongo-express`   | **8081**   | **GUI Admin untuk Mengelola Database MongoDB**   |
| MongoDB           | `mongodb`         | 27017      | Database Dokumen                                 |

---

## 🧪 Contoh Penggunaan API

Semua request disarankan melalui **API Gateway (Port 8080)**.

### 1\. Registrasi User (Auth)

- **Endpoint**: `POST http://localhost:8080/auth/register`
- **Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password123",
    "role": "user"
  }
  ```

### 2\. Login (Auth)

- **Endpoint**: `POST http://localhost:8080/auth/login`
- **Response**: Akan mengembalikan `token` yang digunakan untuk request selanjutnya.

### 3\. Mengambil Data Produk (Product)

- **Endpoint**: `GET http://localhost:8080/products`
- **Header**: `Authorization: Bearer <YOUR_TOKEN_HERE>`

### 4\. Membuat Proyek Baru (Project - Admin Only)

- **Endpoint**: `POST http://localhost:8080/projects`
- **Header**: `Authorization: Bearer <YOUR_ADMIN_TOKEN>`
- **Body**:
  ```json
  {
    "projectName": "Renovasi Rumah Type 45",
    "description": "Pengerjaan atap dan lantai",
    "projectType": "konstruksi",
    "customerName": "Pak Budi",
    "customerEmail": "budi@example.com",
    "customerPhone": "08123456789",
    "startDate": "2023-12-01",
    "estimatedEndDate": "2024-03-01",
    "budget": 50000000
  }
  ```

---

## 🔧 Troubleshooting Umum

- **Database Connection Error**: Pastikan container `mongodb` sudah dalam status `healthy` sebelum service lain berjalan. Docker compose sudah dikonfigurasi dengan `healthcheck`, namun jika komputer lambat, mungkin perlu waktu ekstra.
- **Token Invalid**: Pastikan `JWT_SECRET` di semua file `.env` sama persis. Jika diubah, restart container dengan `docker-compose restart`.
- **Port Conflict**: Jika port 8080 atau 27017 sudah digunakan oleh aplikasi lain di komputer Anda, ubah mapping port di `docker-compose.yml`.

---

<div align="center">
<p>Dibuat dengan ❤️ oleh Tim Pengembang <b>PT Solusi Bangunan Berkah</b></p>
</div>
