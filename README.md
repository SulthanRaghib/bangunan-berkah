# 🏗️ PT Solusi Bangunan Berkah - Microservices Backend

<div align="center">

![NodeJS](https://img.shields.io/badge/Node.js-v20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/Security-JWT-important?style=for-the-badge)
![REST API](https://img.shields.io/badge/API-REST-lightblue?style=for-the-badge)
![Swagger](https://img.shields.io/badge/Documentation-Swagger-85EA2D?style=for-the-badge&logo=swagger)

**Platform Backend Terintegrasi untuk Manajemen Proyek Konstruksi, Katalog Produk, Review Pelanggan & Komunikasi Real-time**

</div>

---

## 📑 Daftar Isi

- [📌 Ringkasan Proyek](#-ringkasan-proyek)
- [✨ Fitur Utama](#-fitur-utama)
- [🏛️ Arsitektur & Teknologi](#️-arsitektur--teknologi)
- [📂 Struktur Proyek](#-struktur-proyek)
- [🛠️ Prasyarat Instalasi](#️-prasyarat-instalasi)
- [🚀 Panduan Instalasi & Setup](#-panduan-instalasi--setup)
- [⚙️ Konfigurasi Environment](#️-konfigurasi-environment)
- [🌐 Services & Ports](#-services--ports)
- [📚 API Endpoints & Contoh Penggunaan](#-api-endpoints--contoh-penggunaan)
- [🔐 Keamanan & Autentikasi](#-keamanan--autentikasi)
- [🐛 Troubleshooting & Tips](#-troubleshooting--tips)
- [📜 Copyright & Ownership](#-copyright--ownership)

---

## 📌 Ringkasan Proyek

**PT Solusi Bangunan Berkah** adalah platform backend modern yang mengintegrasikan seluruh ekosistem bisnis konstruksi melalui arsitektur **Microservices** yang terukur. Sistem ini dirancang untuk:

| 🎯 Aspek            | Deskripsi                                                             |
| ------------------- | --------------------------------------------------------------------- |
| **Skalabilitas**    | Setiap service berjalan independen dan dapat diskala sesuai kebutuhan |
| **Maintainability** | Kode terorganisir per domain bisnis dengan struktur yang jelas        |
| **Reliability**     | Database NoSQL (MongoDB) dengan ORM type-safe (Prisma)                |
| **Security**        | Autentikasi JWT terpusat + Role-Based Access Control (RBAC)           |
| **Real-time**       | Chat service untuk komunikasi instan antar pengguna                   |
| **Dokumentasi**     | Swagger UI built-in untuk setiap service                              |

---

## ✨ Fitur Utama

### 🔐 **Autentikasi & Manajemen Pengguna** (Auth Service)

- 📝 Registrasi dan login dengan email
- 🔑 JWT access token + refresh token
- 👥 Manajemen user (list, detail, update, delete)
- 🛂 Role-based access control (admin, user)
- 📊 Profile user dengan informasi lengkap
- 🩺 Health check endpoints untuk monitoring

### 📦 **Katalog Produk & Inventori** (Product Service)

- 🏷️ CRUD kategori produk
- 📸 Upload multi-image (max 5 files per produk)
- ⭐ Featured product management
- 📊 Inventory tracking dengan low stock monitoring
- 💾 Riwayat perubahan stok
- 🔍 Public API untuk katalog, admin API untuk mutasi data

### 🏗️ **Manajemen Proyek Konstruksi** (Project Service)

- 📋 CRUD proyek dengan kode unik (PRJ-YYYY-XXX)
- 🎯 Milestone management dengan progress tracking
- 📈 Weekly progress reports dengan foto dokumentasi
- 📄 Document management (kontrak, proposal, laporan)
- 🚀 Public tracking page per proyek
- 📊 Dashboard statistik dan activity log

### ⭐ **Review & Testimonial Pelanggan** (Review Service)

- 🌟 Project reviews berdasarkan project code (public)
- 💬 Testimoni umum dari pelanggan
- ❓ Q&A pelanggan dengan sistem tanya jawab
- ✅ Admin approval untuk publikasi testimonial
- 📸 Photo upload untuk reviews dan testimonial
- 🔒 Verifikasi project untuk reviews

### 💬 **Chat & Komunikasi Real-time** (Chat Service)

- 💌 Pesan text real-time
- 👥 Group dan private chat
- ✅ Read receipts dan online status
- 🗂️ Chat history
- 🔔 Notification system

### 🚪 **API Gateway**

- 🔀 Single entry point untuk semua layanan
- ⚡ Rate limiting & DDoS protection
- 📊 Request routing & load balancing
- 🌐 CORS support
- 📝 Comprehensive logging & monitoring

---

## 🏛️ Arsitektur & Teknologi

### 🔧 Tech Stack

| Komponen             | Teknologi      | Versi  | Peran                       |
| :------------------- | :------------- | :----: | :-------------------------- |
| **Runtime**          | Node.js        |   20   | JavaScript execution engine |
| **Framework**        | Express.js     |  4.18  | Web framework & routing     |
| **Database**         | MongoDB        |  7.0   | NoSQL document database     |
| **ORM**              | Prisma         |  5.19  | Type-safe database client   |
| **Authentication**   | JWT            | 9.0.2  | Token-based security        |
| **Password Hashing** | bcryptjs       | 2.4.3  | Secure password encryption  |
| **File Upload**      | Multer         | 1.4.5  | Multipart form data handler |
| **HTTP Client**      | Axios          | 1.7.3  | Service-to-service calls    |
| **API Docs**         | Swagger/JSDoc  | 6.2.8  | Interactive documentation   |
| **Containerization** | Docker         | Latest | Application container       |
| **Orchestration**    | Docker Compose | Latest | Multi-container management  |
| **HTTP Logging**     | Morgan         | 1.10+  | Request logging middleware  |
| **Validation**       | Joi            | 17.9+  | Schema validation library   |

### 📊 Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                            │
│                  (Web / Mobile / Desktop)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST/HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         🚪 API GATEWAY (Port 8080) - Single Entry Point         │
│   Rate Limiting • Request Routing • CORS • Logging & Monitoring │
└────────┬───────────────┬──────────────┬──────────────┬──────────┘
         │               │              │              │
         ▼               ▼              ▼              ▼
    ┌─────────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐
    │   🔐    │   │   📦     │   │   🏗️    │   │   ⭐    │
    │  AUTH   │   │ PRODUCT  │   │ PROJECT │   │ REVIEW   │
    │ 8001    │   │  8002    │   │  8004   │   │  8005    │
    └────┬────┘   └────┬─────┘   └────┬────┘   └────┬─────┘
         │             │              │             │
         └─────────────┴──────────────┴─────────────┘
                       │
                       ▼
         ┌──────────────────────────┐
         │  💾 MongoDB (27017)      │
         │  Shared Database         │
         └───────────┬──────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   ┌─────────────┐      ┌──────────────────┐
   │ Collections │      │ mongo-express    │
   │ • users     │      │ (Admin GUI)      │
   │ • products  │      │ Port 8081        │
   │ • projects  │      └──────────────────┘
   │ • reviews   │
   │ • chats     │
   └─────────────┘
```

---

## 📂 Struktur Proyek

```
pt-solusi-bangunan-berkah-microservice/
│
├── 📄 README.md                    ← Dokumentasi ini
├── 📄 docker-compose.yml           ← Orkestrasi services
├── 📄 .env.example                 ← Environment template
├── 📄 DOCKER.md                    ← Docker commands
│
├── 📁 shared/                      ← Shared utilities (semua services)
│   ├── 📄 index.js
│   ├── 📄 package.json
│   └── 📁 src/
│       ├── middlewares/            ← Auth & role middlewares
│       ├── utils/                  ← Response helpers, pagination
│       └── constants/              ← Common constants
│
└── 📁 services/
    │
    ├── 🚪 api-gateway/            ← Single entry point
    │   ├── 📄 index.js
    │   ├── 📄 package.json
    │   └── 📄 Dockerfile
    │
    ├── 🔐 auth-service/           ← User management & JWT
    │   ├── 📄 server.js
    │   ├── 📄 package.json
    │   ├── 📁 src/
    │   │   ├── app.js              ← Express setup
    │   │   ├── controllers/        ← authController, userController
    │   │   ├── routes/             ← /register, /login, /profile
    │   │   ├── utils/              ← JWT, bcrypt helpers
    │   │   └── config/             ← Prisma, Swagger config
    │   └── 📁 prisma/
    │       ├── schema.prisma       ← User model
    │       └── migrations/
    │
    ├── 📦 product-service/        ← Catalog & Inventory
    │   ├── 📄 server.js
    │   ├── 📁 src/
    │   │   ├── controllers/        ← Product, Category, Inventory
    │   │   ├── routes/             ← /products, /categories
    │   │   ├── middlewares/        ← Upload middleware
    │   │   └── utils/              ← Image handler, pagination
    │   ├── 📁 uploads/             ← Product images
    │   └── 📁 prisma/
    │       └── schema.prisma
    │
    ├── 🏗️ project-service/        ← Project Management
    │   ├── 📄 server.js
    │   ├── 📁 src/
    │   │   ├── controllers/        ← Project, Milestone, Progress
    │   │   ├── routes/             ← /projects, /milestones, /tracking
    │   │   ├── services/           ← Activity logger
    │   │   └── utils/
    │   ├── 📁 uploads/
    │   │   ├── contracts/
    │   │   ├── documents/
    │   │   └── photos/
    │   └── 📁 prisma/
    │
    ├── ⭐ review-service/         ← Reviews & Testimonials
    │   ├── 📄 server.js
    │   ├── 📁 src/
    │   │   ├── controllers/        ← Review, Testimonial, Q&A
    │   │   ├── routes/
    │   │   └── utils/
    │   └── 📁 prisma/
    │
    └── 💬 chat-service/           ← Real-time Messaging
        ├── 📄 index.js
        ├── 📄 package.json
        └── 📁 src/
```

---

## 🛠️ Prasyarat Instalasi

### System Requirements

**Hardware:**

- CPU: Minimum 2-core processor
- RAM: Minimum 4 GB
- Disk: Minimum 10 GB free space
- Network: Stable internet connection

**Software:**

| Software             | Versi          | Download                                       |
| :------------------- | :------------- | :--------------------------------------------- |
| **Docker Desktop**   | Latest         | https://www.docker.com/products/docker-desktop |
| **Docker Engine**    | 20.10+         | Included dengan Docker Desktop                 |
| **Docker Compose**   | 2.0+           | Included dengan Docker Desktop                 |
| **Git**              | 2.30+          | https://www.git-scm.com                        |
| **Node.js**          | 18+ (Optional) | https://nodejs.org                             |
| **Postman/Insomnia** | Latest         | https://www.postman.com                        |

### Verifikasi Instalasi

```bash
# Cek Docker
docker --version
# Output: Docker version XX.X.X, build XXXXX

# Cek Docker Compose
docker compose version
# Output: Docker Compose version XX.X.X

# Cek Git
git --version
# Output: git version X.XX.X
```

---

## 🚀 Panduan Instalasi & Setup

### Step 1️⃣ Clone Repository

```bash
git clone https://github.com/SulthanRaghib/bangunan-berkah.git
cd pt-solusi-bangunan-berkah-microservice
```

### Step 2️⃣ Setup Environment Variables

Buat file `.env` di setiap folder service berdasarkan `.env.example`

**Root Directory `.env`:**

```env
NODE_ENV=development
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=securepassword123
MONGO_DATABASE=bangunan_berkah
TZ=Asia/Jakarta
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=admin123
COMPOSE_PROJECT_NAME=pt-solusi-bangunan-berkah
```

**`services/auth-service/.env`:**

```env
NODE_ENV=development
PORT=8001
SERVICE_NAME=Auth Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

**`services/product-service/.env`:**

```env
NODE_ENV=development
PORT=8002
SERVICE_NAME=Product Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
AUTH_SERVICE_URL=http://auth-service:8001
```

**`services/project-service/.env`:**

```env
NODE_ENV=development
PORT=8004
SERVICE_NAME=Project Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
AUTH_SERVICE_URL=http://auth-service:8001
REVIEW_SERVICE_URL=http://review-service:8005
```

**`services/review-service/.env`:**

```env
NODE_ENV=development
PORT=8005
SERVICE_NAME=Review Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
AUTH_SERVICE_URL=http://auth-service:8001
PROJECT_SERVICE_URL=http://project-service:8004
```

**`services/chat-service/.env`:**

```env
NODE_ENV=development
PORT=8003
SERVICE_NAME=Chat Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
```

### Step 3️⃣ Build & Start Containers

**Fresh Build (Pertama kali):**

```bash
docker compose up --build -d
```

**Start existing containers:**

```bash
docker compose up -d
```

### Step 4️⃣ Verifikasi Instalasi

```bash
# Cek status
docker compose ps

# Test health endpoints
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8004/health
curl http://localhost:8005/health

# Akses Mongo Express
# Browser: http://localhost:8081
# Username: admin
# Password: admin123
```

---

## ⚙️ Konfigurasi Environment

### ⚠️ JWT_SECRET - CRITICAL!

> **PENTING SEKALI:** Nilai `JWT_SECRET` di setiap `.env` file **HARUS IDENTIK**

**Generate secret yang aman:**

```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy value yang dihasilkan ke semua .env files:**

```env
JWT_SECRET=hasil_generate_diatas
```

### Environment Variables Reference

| Variable              | Service                  | Deskripsi            | Contoh                             |
| :-------------------- | :----------------------- | :------------------- | :--------------------------------- |
| `NODE_ENV`            | All                      | Mode eksekusi        | `development`, `production`        |
| `PORT`                | All                      | Port service         | `8001`, `8002`, `8004`, `8005`     |
| `DATABASE_URL`        | All                      | MongoDB connection   | `mongodb://user:pass@host:port/db` |
| `JWT_SECRET`          | All                      | JWT signing secret   | `abc123def...` (32+ chars)         |
| `JWT_EXPIRES_IN`      | Auth                     | Token expiration     | `24h`, `7d`                        |
| `BCRYPT_ROUNDS`       | Auth                     | Password hash rounds | `10`                               |
| `AUTH_SERVICE_URL`    | Product, Project, Review | Auth service URL     | `http://auth-service:8001`         |
| `PROJECT_SERVICE_URL` | Review                   | Project service URL  | `http://project-service:8004`      |

---

## 🌐 Services & Ports

### Service Allocation

|  #  | Service             | Port  | Database | Fitur                    |
| :-: | :------------------ | :---: | :------: | :----------------------- |
| 1️⃣  | **API Gateway**     | 8080  |   N/A    | Entry point, routing     |
| 2️⃣  | **Auth Service**    | 8001  | MongoDB  | User registration, login |
| 3️⃣  | **Product Service** | 8002  | MongoDB  | Catalog, inventory       |
| 4️⃣  | **Chat Service**    | 8003  | MongoDB  | Messaging, notifications |
| 5️⃣  | **Project Service** | 8004  | MongoDB  | Project management       |
| 6️⃣  | **Review Service**  | 8005  | MongoDB  | Reviews, testimonials    |
| 7️⃣  | **MongoDB**         | 27017 |   N/A    | Database                 |
| 8️⃣  | **Mongo Express**   | 8081  |   N/A    | GUI management           |

### Network Communication

**Internal (Docker Network):**

```
http://auth-service:8001
http://product-service:8002
http://project-service:8004
http://review-service:8005
mongodb://mongodb:27017
```

**External (dari Host):**

```
http://localhost:8080        (API Gateway)
http://localhost:8001        (Auth Service)
http://localhost:8002        (Product Service)
http://localhost:8004        (Project Service)
http://localhost:8005        (Review Service)
http://localhost:8081        (Mongo Express)
```

---

## 📚 API Endpoints & Contoh Penggunaan

### 🔐 Auth Service (Port 8001)

**Docs:** `http://localhost:8001/api-docs`

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "user"
}

Response 201:
{
  "success": true,
  "message": "User berhasil didaftarkan",
  "data": {
    "user_id": "uuid-xxx",
    "email": "john@example.com"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user_id": "uuid-xxx",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h"
  }
}
```

#### Get User Profile

```http
GET /api/users/profile
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "user_id": "uuid-xxx",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 📦 Product Service (Port 8002)

**Docs:** `http://localhost:8002/api-docs`

#### Get All Products (Public)

```http
GET /api/products?page=1&limit=10

Response 200:
{
  "success": true,
  "message": "Produk berhasil diambil",
  "data": {
    "data": [
      {
        "product_id": "prod-123",
        "name": "Semen Portland Type I",
        "slug": "semen-portland-type-i",
        "price": 65000,
        "stock": 500,
        "featured": true,
        "image_url": "/uploads/products/cement.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "hasNextPage": true
    }
  }
}
```

#### Create Product (Admin Only)

```http
POST /api/products
Authorization: Bearer {adminToken}
Content-Type: multipart/form-data

FormData:
- name: "Besi Beton 10mm"
- category_id: "cat-123"
- price: 8500
- stock: 1000
- images: [file1.jpg, file2.jpg]

Response 201:
{
  "success": true,
  "message": "Produk berhasil dibuat",
  "data": {
    "product_id": "prod-456",
    "name": "Besi Beton 10mm"
  }
}
```

#### Get Product by Slug (Public)

```http
GET /api/products/slug/semen-portland-type-i

Response 200:
{
  "success": true,
  "data": {
    "product_id": "prod-123",
    "name": "Semen Portland Type I",
    "price": 65000,
    "stock": 500,
    "images": [
      "/uploads/products/cement-1.jpg",
      "/uploads/products/cement-2.jpg"
    ]
  }
}
```

---

### 🏗️ Project Service (Port 8004)

**Docs:** `http://localhost:8004/api-docs`

#### Create Project (Admin Only)

```http
POST /api/projects
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "projectName": "Pembangunan Rumah Tipe 45",
  "customerName": "Budi Santoso",
  "customerEmail": "budi@example.com",
  "customerPhone": "081234567890",
  "startDate": "2026-03-20",
  "estimatedEndDate": "2026-09-20",
  "budget": 1500000000
}

Response 201:
{
  "success": true,
  "message": "Proyek berhasil dibuat",
  "data": {
    "projectCode": "PRJ-2026-001",
    "projectName": "Pembangunan Rumah Tipe 45",
    "status": "pending",
    "progress": 0
  }
}
```

#### Get Project by Code (Public Tracking)

```http
GET /api/projects/track/PRJ-2026-001

Response 200:
{
  "success": true,
  "data": {
    "projectCode": "PRJ-2026-001",
    "projectName": "Pembangunan Rumah Tipe 45",
    "status": "in_progress",
    "progress": 45,
    "milestones": [
      {
        "name": "Persiapan Lahan",
        "status": "COMPLETED",
        "progress": 100
      }
    ]
  }
}
```

#### Submit Progress Report

```http
POST /api/projects/{projectCode}/progress
Content-Type: multipart/form-data

FormData:
- weekNumber: 1
- progress: 25
- description: "Fondasi selesai, mulai dinding"
- photos: [photo1.jpg, photo2.jpg]

Response 201:
{
  "success": true,
  "message": "Progress report berhasil disimpan"
}
```

---

### ⭐ Review Service (Port 8005)

**Docs:** `http://localhost:8005/api-docs`

#### Submit Project Review (Public)

```http
POST /api/reviews
Content-Type: multipart/form-data

FormData:
- projectCode: "PRJ-2026-001"
- customerName: "Budi Santoso"
- email: "budi@example.com"
- rating: 5
- comment: "Hasil pembangunan sangat memuaskan!"
- photos: [photo1.jpg]

Response 201:
{
  "success": true,
  "message": "Review berhasil disimpan"
}
```

#### Get Reviews by Project (Public)

```http
GET /api/reviews/project/PRJ-2026-001

Response 200:
{
  "success": true,
  "data": {
    "data": [
      {
        "review_id": "rev-789",
        "customerName": "Budi Santoso",
        "rating": 5,
        "comment": "Hasil pembangunan sangat memuaskan!"
      }
    ],
    "averageRating": 4.8,
    "totalReviews": 5
  }
}
```

#### Submit Testimonial (Public)

```http
POST /api/testimonials
Content-Type: multipart/form-data

FormData:
- name: "Rina Wijaya"
- email: "rina@example.com"
- company: "PT Jaya Bangunan"
- position: "Project Manager"
- rating: 5
- message: "Layanan sangat profesional!"
- photo: [photo.jpg]

Response 201:
{
  "success": true,
  "message": "Testimoni berhasil dikirim"
}
```

#### Get Approved Testimonials (Public)

```http
GET /api/testimonials

Response 200:
{
  "success": true,
  "message": "Testimoni disetujui berhasil diambil",
  "data": {
    "data": [
      {
        "id": "test-123",
        "name": "Rina Wijaya",
        "company": "PT Jaya Bangunan",
        "rating": 5,
        "message": "Layanan sangat profesional!",
        "photo_url": "/uploads/testimonials/photo.jpg"
      }
    ]
  }
}
```

#### Submit Q&A (Public)

```http
POST /api/qa
Content-Type: application/json

{
  "name": "Ahmad Rizki",
  "email": "ahmad@example.com",
  "question": "Berapa estimasi waktu pengerjaan untuk rumah tipe 45?"
}

Response 201:
{
  "success": true,
  "message": "Pertanyaan berhasil dikirim"
}
```

#### Get Answered Q&A (Public)

```http
GET /api/qa

Response 200:
{
  "success": true,
  "message": "Pertanyaan terjawab berhasil diambil",
  "data": {
    "data": [
      {
        "qa_id": "qa-456",
        "name": "Ahmad Rizki",
        "question": "Berapa estimasi waktu pengerjaan untuk rumah tipe 45?",
        "answer": "Estimasi waktu adalah 6 bulan untuk rumah tipe 45 standar.",
        "answeredAt": "2026-03-20T10:30:00Z"
      }
    ]
  }
}
```

---

## 🔐 Keamanan & Autentikasi

### JWT Authentication Flow

```
1. User Register/Login
   POST /api/auth/register atau /api/auth/login
        ↓
2. Server generate JWT Token
   { "accessToken": "eyJhbGc...", "expiresIn": "24h" }
        ↓
3. Client simpan token
   localStorage.setItem('accessToken', token)
        ↓
4. Client gunakan untuk request
   Authorization: Bearer eyJhbGc...
        ↓
5. Server verify via authMiddleware
   Jika valid → proceed, invalid → 401 Unauthorized
```

### Best Practices

✅ **LAKUKAN:**

- Gunakan HTTPS di production
- Rotate JWT_SECRET secara berkala
- Set token expiration cukup (24h recommended)
- Implement refresh token
- Hash password dengan bcryptjs
- Validate semua input dengan Joi
- Use strong, unique passwords

❌ **JANGAN:**

- Upload JWT_SECRET ke git/repository
- Hardcode credentials di code
- Kirim password di query string
- Ignore validation di endpoints
- Share JWT_SECRET across teams
- Use same JWT_SECRET di berbagai project

---

## 🐛 Troubleshooting & Tips

### ❓ Frequently Asked Questions

**Q: Port sudah digunakan - "Address already in use"**

```bash
# Windows: Find dan kill process
netstat -ano | findstr :8001
taskkill /PID {PID} /F

# Atau ganti port di docker-compose.yml
ports:
  - "8010:8001"
```

**Q: Autentikasi gagal - "Invalid token"**

```bash
# Pastikan JWT_SECRET identik di semua services
grep JWT_SECRET services/*/.env

# Jika berbeda, update samakan
```

**Q: MongoDB connection error**

```bash
# Cek apakah MongoDB healthy
docker compose ps | grep mongodb

# Restart MongoDB
docker compose restart mongodb
```

**Q: Perubahan code tidak ter-update**

```bash
# Services pakai nodemon (hot reload)
# Jika tidak jalan, restart service
docker compose restart auth-service

# Atau rebuild
docker compose up --build -d auth-service
```

### 📋 Useful Docker Commands

```bash
# View logs
docker compose logs -f auth-service

# View last 50 lines
docker compose logs --tail 50 product-service

# Enter container shell
docker compose exec auth-service sh

# Copy dari container ke host
docker compose cp auth-service:/app/file.js ./file.js

# Remove semua containers & volumes
docker compose down -v

# Rebuild specific service
docker compose build --no-cache auth-service
docker compose up -d auth-service

# View all containers status
docker compose ps
```

### 🔧 Development Tips

1. **Use Postman/Insomnia untuk testing**
   - Import dari Swagger docs
   - Save environment variables untuk reuse token

2. **Monitor dengan Mongo Express**
   - URL: http://localhost:8081
   - Lihat real-time data changes
   - Debug database issues

3. **Check application logs**

   ```bash
   docker compose logs -f
   ```

4. **Database seeding**

   ```bash
   docker compose exec auth-service npm run prisma:seed
   ```

5. **Test service connectivity**
   ```bash
   docker compose exec auth-service wget http://product-service:8002/health
   ```

---

## 📜 Copyright & Ownership

```
═══════════════════════════════════════════════════════════════════════════════
  PT SOLUSI BANGUNAN BERKAH - MICROSERVICES BACKEND

  © Copyright 2026 Sulthan Raghib Fillah
  All Rights Reserved

  Project Name:    PT Solusi Bangunan Berkah
  Owner:           Sulthan Raghib Fillah
  Created:         2026
  Last Modified:   March 25, 2026
  Version:         1.0.0

  This software and all associated code, documentation, and materials
  are the exclusive property of Sulthan Raghib Fillah.

  Unauthorized use, reproduction, or distribution of this software
  is strictly prohibited without explicit written permission.
═══════════════════════════════════════════════════════════════════════════════
```

### Usage Rights & Permissions

- ✅ Project Owner: Sulthan Raghib Fillah
- ✅ License Type: Proprietary (All Rights Reserved)
- ✅ Commercial Use: Exclusive rights retained by owner
- ✅ Modification: Subject to owner approval
- ✅ Distribution: Prohibited without owner consent

### Contact for Licensing

For any inquiries regarding licensing, usage rights, or partnerships:

- 📧 Email: [raghib.smp@gmail.com](mailto:raghib.smp@gmail.com)
- 💼 Business: PT Solusi Bangunan Berkah

---

**Last Updated:** March 25, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Owner:** Sulthan Raghib Fillah
