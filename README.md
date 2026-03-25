# 🏗️ PT Solusi Bangunan Berkah - Microservices Backend

<div align="center">

![NodeJS](https://img.shields.io/badge/Node.js-v20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)
![Prisma](https://img.shields.io/badge/ORM-Prisma-white?style=for-the-badge&logo=prisma)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/Security-JWT-important?style=for-the-badge)
![REST API](https://img.shields.io/badge/API-REST-lightblue?style=for-the-badge)

**Sistem Backend Terpadu untuk Manajemen Proyek Konstruksi, Penjualan Material, dan Komunikasi Pelanggan**

</div>

---

## 📑 Daftar Isi

- [📌 Ringkasan Proyek](#-ringkasan-proyek)
- [✨ Fitur Utama](#-fitur-utama)
- [🏛️ Arsitektur & Teknologi](#️-arsitektur--teknologi)
- [📂 Struktur Proyek & Layanan](#-struktur-proyek--layanan)
- [🛠️ Prasyarat Instalasi](#️-prasyarat-instalasi)
- [🚀 Panduan Instalasi & Setup](#-panduan-instalasi--setup)
- [⚙️ Konfigurasi Environment](#️-konfigurasi-environment)
- [🌐 Daftar Services & Port](#-daftar-services--port)
- [📚 API Endpoints & Dokumentasi](#-api-endpoints--dokumentasi)
- [🔑 Enkripsi & Keamanan](#-enkripsi--keamanan)
- [🚨 Troubleshooting](#-troubleshooting)
- [📞 Informasi Kontak](#-informasi-kontak)

---

## 📌 Ringkasan Proyek

**PT Solusi Bangunan Berkah** adalah platform backend yang mengintegrasikan seluruh kebutuhan bisnis konstruksi modern melalui arsitektur **Microservices**. Sistem ini dirancang dengan fokus pada:

✅ **Skalabilitas** - Setiap service dapat diskala secara independen  
✅ **Maintainability** - Kode terorganisir dengan jelas per domain bisnis  
✅ **Reliability** - Menggunakan database NoSQL dengan ORM yang type-safe  
✅ **Security** - Autentikasi JWT terpusat dan kontrol akses berbasis role  
✅ **Real-time** - Mendukung komunikasi instan antara pengguna

---

## ✨ Fitur Utama

### 🔐 **Layanan Autentikasi & Manajemen Pengguna**

- Registrasi & login pengguna dengan validasi ketat
- Role-based Access Control (RBAC) untuk Admin dan Customer
- Token JWT dengan refresh mechanism
- Password hashing menggunakan bcryptjs
- Health check untuk monitoring status service

### 📦 **Katalog Produk & Manajemen Inventaris**

- CRUD lengkap untuk produk material bangunan
- Kategori produk yang terstruktur
- Upload gambar produk dengan multiple media support
- Stock tracking & inventory management real-time
- Featured products untuk promosi
- Public listing dan private admin management

### 🏗️ **Manajemen Proyek Konstruksi**

- Pembuatan & tracking proyek konstruksi
- Milestone management dengan progress tracking
- Weekly progress reports dengan foto dokumentasi
- Project dashboard dengan analytics
- Customer-facing project tracking endpoint
- Document management untuk kontrak & blueprint
- Activity logging untuk audit trail

### 💬 **Layanan Chat Real-time**

- Messaging antara admin dan customer
- Notification system
- Chat history & persistence

### ⭐ **Sistem Review, Rating, Testimoni & Q&A**

#### Project Reviews

- Submit review untuk proyek yang selesai
- Rating agregasi (1-5 stars)
- Review verification dengan project status check
- One review per project tracking

#### Testimonials (Non-Project)

- Pelanggan dapat submit testimoni tanpa login
- Support foto/media dokumentasi
- Rating 1-5 untuk kepuasan umum
- Admin approval workflow sebelum published
- Admin dapat edit, delete, atau moderate testimoni

#### Customer Q&A

- Pelanggan dapat mengajukan pertanyaan tanpa login
- Admin dapat menjawab pertanyaan
- Status tracking (open/answered)
- Public view hanya untuk pertanyaan yang sudah dijawab
- Full CRUD untuk admin management

### 🚪 **API Gateway**

- Single entry point untuk semua layanan
- Rate limiting & DDoS protection
- Request routing & load balancing
- Cross-Origin Resource Sharing (CORS) support
- Comprehensive logging & monitoring

---

## 🏛️ Arsitektur & Teknologi

### Tech Stack

| Layer                 | Teknologi      | Versi  | Fungsi                           |
| :-------------------- | :------------- | :----- | :------------------------------- |
| **Frontend Gateway**  | Express.js     | 4.18   | HTTP Server & Routing            |
| **Runtime**           | Node.js        | 20     | JavaScript Execution Engine      |
| **Database**          | MongoDB        | 7.0    | NoSQL Data Storage               |
| **ORM/Query Builder** | Prisma         | 5.19   | Type-safe Database Access        |
| **Authentication**    | JWT            | 9.0.2  | Token-based Security             |
| **Hashing**           | bcryptjs       | 2.4.3  | Password Encryption              |
| **File Upload**       | Multer         | 1.4.5  | Middleware File Handling         |
| **HTTP Client**       | Axios          | 1.7.3  | Service-to-Service Communication |
| **API Documentation** | Swagger/JSDoc  | 6.2.8  | Interactive API Docs             |
| **Container**         | Docker         | Latest | Application Containerization     |
| **Orchestration**     | Docker Compose | Latest | Multi-container Management       |
| **Logging**           | Morgan         | 1.10   | HTTP Request Logging             |
| **Validation**        | Joi            | 17.9+  | Schema Validation                |

### Arsitektur Microservices

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT / FRONTEND                         │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              🚪 API GATEWAY (Port 8080)                       │
│  - Rate Limiting  - Request Routing  - CORS  - Logging       │
└──────┬────────────────┬─────────────────┬────────────────┬───┘
       │                │                 │                │
       ▼                ▼                 ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  🔐 AUTH     │ │  📦 PRODUCT  │ │  🏗️ PROJECT  │ │  ⭐ REVIEW   │
│  Service     │ │  Service     │ │  Service     │ │  Service     │
│  Port 8001   │ │  Port 8002   │ │  Port 8004   │ │  Port 8005   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                 │                │
       └────────────────┴─────────────────┴────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │      💾 MongoDB (Port 27017)      │
        │ Shared Database (All Services)    │
        └───────────────────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        ▼                                ▼
  ┌───────────────┐          ┌──────────────────┐
  │  collections  │          │  mongo-express  │
  │  • users      │          │  (GUI Monitor)   │
  │  • products   │          │  Port 8081       │
  │  • projects   │          └──────────────────┘
  │  • reviews    │
  │  • testimonials│
  │  • qas        │
  │  • chats      │
  └───────────────┘
```

---

## 📂 Struktur Proyek & Layanan

### Organisasi Direktori

```
pt-solusi-bangunan-berkah-microservice/
├── 📄 docker-compose.yml          ← Orkestrasi seluruh services
├── 📄 init.sql                    ← Inisialisasi database (optional)
├── 📄 README.md                   ← Dokumentasi (file ini)
├── 📄 PROGRESS_SYSTEM_ANALYSIS.md ← Analisis sistem progress
│
└── 📁 services/                   ← Folder semua microservices
    │
    ├── 🚪 api-gateway/
    │   ├── 📄 index.js            ← Entry point gateway
    │   ├── 📄 package.json
    │   └── 📄 Dockerfile
    │
    ├── 🔐 auth-service/
    │   ├── 📄 server.js
    │   ├── 📄 package.json
    │   ├── 📄 Dockerfile
    │   ├── 📄 docker-entrypoint.sh
    │   ├── 📁 src/
    │   │   ├── 📄 app.js          ← Express configuration
    │   │   ├── 📁 config/         ← Database & Security config
    │   │   ├── 📁 controllers/    ← Business logic
    │   │   ├── 📁 middlewares/    ← Auth & role middlewares
    │   │   ├── 📁 routes/         ← API endpoints
    │   │   └── 📁 utils/          ← Helper functions
    │   └── 📁 prisma/
    │       ├── 📄 schema.prisma   ← Database schema
    │       ├── 📄 seed.js         ← Sample data
    │       └── 📁 migrations/
    │
    ├── 📦 product-service/
    │   ├── 📄 server.js
    │   ├── 📄 package.json
    │   ├── 📄 Dockerfile
    │   ├── 📄 docker-entrypoint.sh
    │   ├── 📁 src/
    │   │   ├── 📄 app.js
    │   │   ├── 📁 config/
    │   │   ├── 📁 controllers/    ← Product, Category, Inventory
    │   │   ├── 📁 middlewares/
    │   │   ├── 📁 routes/
    │   │   └── 📁 utils/
    │   ├── 📁 prisma/
    │   │   ├── 📄 schema.prisma
    │   │   └── 📄 seed.js
    │   ├── 📁 uploads/            ← Product images
    │   └── 📄 .env
    │
    ├── 🏗️ project-service/
    │   ├── 📄 server.js
    │   ├── 📄 package.json
    │   ├── 📄 Dockerfile
    │   ├── 📄 docker-entrypoint.sh
    │   ├── 📁 src/
    │   │   ├── 📄 app.js
    │   │   ├── 📁 config/
    │   │   ├── 📁 controllers/    ← Project, Milestone, Progress, Document
    │   │   ├── 📁 middlewares/
    │   │   ├── 📁 routes/
    │   │   ├── 📁 services/       ← Activity Logger
    │   │   └── 📁 utils/
    │   ├── 📁 prisma/
    │   │   ├── 📄 schema.prisma
    │   │   └── 📄 seed.js
    │   ├── 📁 uploads/            ← Project documents & photos
    │   │   ├── contracts/
    │   │   ├── documents/
    │   │   └── photos/
    │   └── 📄 .env
    │
    ├── ⭐ review-service/
    │   ├── 📄 server.js
    │   ├── 📄 package.json
    │   ├── 📄 Dockerfile
    │   ├── 📁 src/
    │   │   ├── 📄 app.js
    │   │   ├── 📁 controllers/
    │   │   ├── 📁 routes/
    │   │   └── 📁 middlewares/
    │   ├── 📁 prisma/
    │   │   └── 📄 schema.prisma
    │   └── 📄 .env
    │
    └── 💬 chat-service/
        ├── 📄 index.js
        ├── 📄 package.json
        ├── 📄 Dockerfile
        └── 📄 .env
```

---

## 🛠️ Prasyarat Instalasi

Pastikan sistem Anda memenuhi requirement minimum sebelum setup:

### Hardware Requirements

- **CPU**: Minimum Dual-core processor
- **RAM**: Minimum 4 GB
- **Disk Space**: Minimum 10 GB (untuk Docker images & database)
- **Network**: Stable internet connection

### Software Requirements

| Software             | Versi          | Link                                               |
| :------------------- | :------------- | :------------------------------------------------- |
| **Docker Desktop**   | Latest         | https://www.docker.com/products/docker-desktop     |
| **Docker Engine**    | 20.10+         | Included dengan Docker Desktop                     |
| **Docker Compose**   | 2.0+           | Included dengan Docker Desktop                     |
| **Git**              | 2.30+          | https://www.git-scm.com                            |
| **Node.js**          | 18+ (Optional) | https://nodejs.org                                 |
| **Postman/Insomnia** | Latest         | https://www.postman.com atau https://insomnia.rest |

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

**Format:** Buat file `.env` di setiap folder service

#### Root Directory `.env` (Optional - untuk MongoDB credentials)

```bash
# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=securepassword123
MONGO_DATABASE=bangunan_berkah
TZ=Asia/Jakarta

# Mongo Express
MONGO_EXPRESS_USERNAME=admin_express
MONGO_EXPRESS_PASSWORD=express_password
```

#### `services/auth-service/.env`

```env
NODE_ENV=development
PORT=8001
SERVICE_NAME=Auth Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_12345
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

#### `services/product-service/.env`

```env
NODE_ENV=development
PORT=8002
SERVICE_NAME=Product Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_12345
AUTH_SERVICE_URL=http://auth-service:8001
```

#### `services/project-service/.env`

```env
NODE_ENV=development
PORT=8004
SERVICE_NAME=Project Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_12345
AUTH_SERVICE_URL=http://auth-service:8001
REVIEW_SERVICE_URL=http://review-service:8005
```

#### `services/review-service/.env`

```env
NODE_ENV=development
PORT=8005
SERVICE_NAME=Review Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_12345
AUTH_SERVICE_URL=http://auth-service:8001
PROJECT_SERVICE_URL=http://project-service:8004
```

#### `services/chat-service/.env`

```env
NODE_ENV=development
PORT=8003
SERVICE_NAME=Chat Service
DATABASE_URL=mongodb://admin:securepassword123@mongodb:27017/bangunan_berkah?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_12345
```

### Step 3️⃣ Build & Start Containers

**Opsi A: Fresh Build (Pertama kali)**

```bash
# Build semua services & start
docker compose up --build

# Atau dengan detached mode (background)
docker compose up --build -d

# Output: Tunggu hingga semua services healthy
# ✅ auth-service listening on port 8001
# ✅ product-service listening on port 8002
# ✅ project-service listening on port 8004
# ✅ review-service listening on port 8005
# ✅ mongodb initialized
```

**Opsi B: Start yang Ada (Sudah di-build sebelumnya)**

```bash
docker compose up -d
```

### Step 4️⃣ Verifikasi Instalasi

```bash
# Cek status semua containers
docker compose ps

# Output:
# CONTAINER ID  IMAGE              STATUS
# xxx           mongodb            Up 2 minutes (healthy)
# xxx           auth-service       Up 2 minutes (healthy)
# xxx           product-service    Up 2 minutes (healthy)
# xxx           project-service    Up 2 minutes (healthy)
# xxx           review-service     Up 2 minutes (healthy)
# xxx           mongo-express      Up 1 minute
```

**Test Health Endpoints:**

```bash
# Auth Service
curl http://localhost:8001/health

# Product Service
curl http://localhost:8002/health

# Project Service
curl http://localhost:8004/health

# API Gateway
curl http://localhost:8080

# Mongo Express (GUI)
# Buka browser: http://localhost:8081
# Username: admin_express
# Password: express_password
```

### Step 5️⃣ Seed Database (Optional)

```bash
# Untuk auth-service
docker compose exec auth-service npm run prisma:seed

# Untuk product-service
docker compose exec product-service npm run prisma:seed

# Untuk project-service
docker compose exec project-service npm run prisma:seed
```

---

## ⚙️ Konfigurasi Environment

### 🔑 JWT_SECRET (CRITICAL - HARUS SAMA DI SEMUA SERVICES!)

> ⚠️ **PENTING SEKALI**
>
> Nilai `JWT_SECRET` di file `.env` setiap service **HARUS IDENTIK**. Jika berbeda, autentikasi antar service akan gagal.

**Cara Generate Secret yang Aman:**

```bash
# Menggunakan OpenSSL
openssl rand -base64 32

# Atau menggunakan Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: abc123def456ghi789jkl012mno345pqr678stu
```

**Update di semua `.env` files:**

```env
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu
```

### 📝 Environment Variables Reference

| Variable              | Service                  | Deskripsi                 | Contoh                                    |
| :-------------------- | :----------------------- | :------------------------ | :---------------------------------------- |
| `NODE_ENV`            | All                      | Mode eksekusi             | `development` atau `production`           |
| `PORT`                | All                      | Port service              | `8001`, `8002`, `8004`, `8005`            |
| `DATABASE_URL`        | All                      | MongoDB connection string | `mongodb://user:pass@host:port/db`        |
| `JWT_SECRET`          | All                      | Secret untuk signing JWT  | `abc123def456ghi789jkl012mno345pqr678stu` |
| `JWT_EXPIRES_IN`      | Auth                     | Token expiration time     | `24h`, `7d`, `30d`                        |
| `BCRYPT_ROUNDS`       | Auth                     | Password hashing rounds   | `10` (default)                            |
| `AUTH_SERVICE_URL`    | Product, Project, Review | Base URL auth service     | `http://auth-service:8001`                |
| `PROJECT_SERVICE_URL` | Review                   | Base URL project service  | `http://project-service:8004`             |

---

## 🌐 Daftar Services & Port

### Service Allocation

|  #  | Service             |  Port   | Container Name  | Database | Fitur                                    |
| :-: | :------------------ | :-----: | :-------------: | :------: | :--------------------------------------- |
| 1️⃣  | **API Gateway**     | `8080`  |   api-gateway   |   N/A    | Entry point, routing, rate limiting      |
| 2️⃣  | **Auth Service**    | `8001`  |  auth-service   | MongoDB  | User registration, login, JWT token      |
| 3️⃣  | **Product Service** | `8002`  | product-service | MongoDB  | Product catalog, inventory, stock        |
| 4️⃣  | **Chat Service**    | `8003`  |  chat-service   | MongoDB  | Real-time messaging, notifications       |
| 5️⃣  | **Project Service** | `8004`  | project-service | MongoDB  | Project management, milestones, progress |
| 6️⃣  | **Review Service**  | `8005`  | review-service  | MongoDB  | Reviews, ratings, feedback               |
| 7️⃣  | **MongoDB**         | `27017` |     mongodb     |   N/A    | Database storage                         |
| 8️⃣  | **Mongo Express**   | `8081`  |  mongo-express  |   N/A    | GUI database management                  |

### Network Communication

```
Host:Port Format untuk Internal Communication (Docker Network):
- http://auth-service:8001
- http://product-service:8002
- http://chat-service:8003
- http://project-service:8004
- http://review-service:8005
- mongodb://mongodb:27017

Host:Port Format untuk External Access (dari Host/Client):
- http://localhost:8080        (API Gateway)
- http://localhost:8001        (Auth Service)
- http://localhost:8002        (Product Service)
- http://localhost:8003        (Chat Service)
- http://localhost:8004        (Project Service)
- http://localhost:8005        (Review Service)
- http://localhost:27017       (MongoDB)
- http://localhost:8081        (Mongo Express)
```

---

## 📚 API Endpoints & Dokumentasi

### 🔐 Authentication Service (`Port 8001`)

**Swagger Docs:** `http://localhost:8001/api-docs`

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}

Response 201:
{
  "success": true,
  "message": "User berhasil didaftarkan",
  "data": {
    "user_id": "user-uuid",
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
  "password": "securePassword123"
}

Response 200:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user_id": "user-uuid",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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
    "user_id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2026-03-20T10:30:00Z"
  }
}
```

#### Health Check

```http
GET /health

Response 200:
{
  "status": "OK",
  "service": "Auth Service",
  "timestamp": "2026-03-20T10:30:00Z"
}
```

---

### 📦 Product Service (`Port 8002`)

#### Get All Products (Public)

```http
GET /api/products?page=1&limit=10&category=cement

Response 200:
{
  "success": true,
  "data": [
    {
      "product_id": "prod-123",
      "name": "Semen Portland Type I",
      "slug": "semen-portland-type-i",
      "description": "Semen berkualitas tinggi untuk konstruksi",
      "price": 65000,
      "stock": 500,
      "category": "Semen",
      "image_url": "/uploads/products/cement.jpg",
      "featured": true,
      "rating": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
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
    "description": "...",
    "price": 65000,
    "stock": 500,
    "images": [
      "/uploads/products/cement-1.jpg",
      "/uploads/products/cement-2.jpg"
    ],
    "specifications": {
      "weight": "50kg",
      "strength": "450 MPa"
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
- name: "Besi Beton Ukuran 10mm"
- description: "Besi beton berkualitas tinggi dengan sertifikat SNI"
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
    "name": "Besi Beton Ukuran 10mm",
    "slug": "besi-beton-ukuran-10mm"
  }
}
```

#### Update Product Stock

```http
PATCH /api/inventory/{inventory_id}/stock
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "quantity": 100,
  "operation": "add"
}

Response 200:
{
  "success": true,
  "message": "Stock berhasil diperbarui",
  "data": {
    "product_id": "prod-456",
    "quantity": 1100,
    "lastUpdated": "2026-03-20T10:30:00Z"
  }
}
```

---

### 🏗️ Project Service (`Port 8004`)

#### Create Project (Admin Only)

```http
POST /api/projects
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "projectName": "Pembangunan Rumah Tinggal Tipe 45",
  "description": "Proyek konstruksi rumah tinggal modern 2 lantai",
  "projectType": "konstruksi",
  "customerName": "Budi Santoso",
  "customerEmail": "budi@example.com",
  "customerPhone": "081234567890",
  "customerAddress": "Jl. Sudirman No. 1, Jakarta Selatan",
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
    "projectName": "Pembangunan Rumah Tinggal Tipe 45",
    "progress": 0,
    "status": "planning"
  }
}
```

#### Get Projects List (Admin)

```http
GET /api/projects?page=1&limit=10&status=in_progress

Response 200:
{
  "success": true,
  "data": [
    {
      "projectCode": "PRJ-2026-001",
      "projectName": "Pembangunan Rumah Tinggal Tipe 45",
      "customerName": "Budi Santoso",
      "status": "in_progress",
      "progress": 45,
      "startDate": "2026-03-20",
      "estimatedEndDate": "2026-09-20",
      "createdAt": "2026-03-20T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 27,
    "totalPages": 3
  }
}
```

#### Add Milestone to Project

```http
POST /api/projects/PRJ-2026-001/milestones
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "name": "Pekerjaan Pondasi",
  "description": "Penggalian & pengecoran basic pondasi",
  "targetDate": "2026-04-20",
  "status": "PENDING",
  "progress": 0
}

Response 201:
{
  "success": true,
  "message": "Milestone berhasil ditambahkan",
  "data": {
    "milestone": {
      "id": "milestone-uuid",
      "name": "Pekerjaan Pondasi",
      "progress": 0,
      "targetDate": "2026-04-20"
    },
    "projectProgress": 0
  }
}
```

#### Update Milestone Progress

```http
PATCH /api/projects/PRJ-2026-001/milestones/{milestoneId}
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "progress": 65,
  "status": "ON_PROGRESS"
}

Response 200:
{
  "success": true,
  "message": "Milestone berhasil diperbarui",
  "data": {
    "projectProgress": 45
  }
}
```

#### Submit Weekly Progress Report

```http
POST /api/projects/PRJ-2026-001/progress
Authorization: Bearer {adminToken}
Content-Type: multipart/form-data

FormData:
- weekNumber: 5
- progress: 50
- description: "Foundation 80% complete, ready for structural work"
- photos: [week5_photo1.jpg, week5_photo2.jpg]

Response 201:
{
  "success": true,
  "message": "Weekly progress report berhasil ditambahkan",
  "data": {
    "weekNumber": 5,
    "progress": 50,
    "createdAt": "2026-03-20T10:30:00Z"
  }
}
```

#### Get Public Project Tracking

```http
GET /api/projects/track/PRJ-2026-001

Response 200:
{
  "success": true,
  "data": {
    "projectCode": "PRJ-2026-001",
    "projectName": "Pembangunan Rumah Tinggal Tipe 45",
    "progress": 50,
    "status": "in_progress",
    "timeline": {
      "startDate": "2026-03-20",
      "estimatedEndDate": "2026-09-20",
      "daysElapsed": 5,
      "daysRemaining": 180
    },
    "milestones": [
      {
        "name": "Pekerjaan Pondasi",
        "progress": 80,
        "status": "ON_PROGRESS",
        "targetDate": "2026-04-20"
      }
    ],
    "recentReports": [
      {
        "weekNumber": 5,
        "progress": 50,
        "description": "Foundation 80% complete",
        "photos": [...]
      }
    ]
  }
}
```

---

### ⭐ Review Service (`Port 8005`)

#### Submit Project Review

```http
POST /api/reviews
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "projectCode": "PRJ-2026-001",
  "rating": 5,
  "title": "Layanan Luar Biasa!",
  "comment": "Tim konstruksi sangat profesional dan tepat waktu. Hasil pembangunan memuaskan.",
  "wouldRecommend": true
}

Response 201:
{
  "success": true,
  "message": "Review berhasil ditambahkan",
  "data": {
    "review_id": "review-uuid",
    "projectCode": "PRJ-2026-001",
    "rating": 5,
    "createdAt": "2026-09-20T10:30:00Z"
  }
}
```

#### Get Project Reviews

```http
GET /api/reviews?projectCode=PRJ-2026-001&sort=latest

Response 200:
{
  "success": true,
  "data": [
    {
      "review_id": "review-uuid",
      "projectCode": "PRJ-2026-001",
      "customerName": "Budi Santoso",
      "rating": 5,
      "title": "Layanan Luar Biasa!",
      "comment": "Tim konstruksi sangat profesional dan tepat waktu...",
      "createdAt": "2026-09-20T10:30:00Z"
    }
  ],
  "aggregates": {
    "averageRating": 4.8,
    "totalReviews": 12,
    "ratingDistribution": {
      "5": 10,
      "4": 2,
      "3": 0,
      "2": 0,
      "1": 0
    }
  }
}
```

---

### 💬 Chat Service (`Port 8003`)

#### Send Message

```http
POST /api/chat/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "to_user_id": "user-uuid-admin",
  "message": "Berapa biaya untuk material tambahan?"
}

Response 201:
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "data": {
    "message_id": "msg-uuid",
    "timestamp": "2026-03-20T10:30:00Z"
  }
}
```

#### Get Chat History

```http
GET /api/chat/messages/{user_id}?limit=50

Response 200:
{
  "success": true,
  "data": [
    {
      "message_id": "msg-uuid-1",
      "from_user": "user-uuid",
      "to_user": "admin-uuid",
      "message": "Berapa biaya untuk material tambahan?",
      "timestamp": "2026-03-20T10:30:00Z",
      "read": true
    }
  ]
}
```

---

### 🚪 API Gateway (`Port 8080`)

Gateway mengarahkan request ke service yang sesuai:

```
Gateway Routing Rules:

- /api/auth/**           → auth-service:8001
- /api/users/**          → auth-service:8001
- /api/products/**       → product-service:8002
- /api/categories/**     → product-service:8002
- /api/inventory/**      → product-service:8002
- /api/chat/**           → chat-service:8003
- /api/projects/**       → project-service:8004
- /api/dashboard/**      → project-service:8004
- /api/milestones/**     → project-service:8004
- /api/reviews/**        → review-service:8005
```

#### Gateway Health

```http
GET http://localhost:8080

Response 200:
{
  "status": "OK",
  "gateway": "API Gateway",
  "services": {
    "auth-service": "http://auth-service:8001",
    "product-service": "http://product-service:8002",
    "chat-service": "http://chat-service:8003",
    "project-service": "http://project-service:8004",
    "review-service": "http://review-service:8005"
  }
}
```

---

### 📊 Accessing API Documentation

Setiap service menyediakan dokumentasi Swagger interaktif:

| Service         | Swagger URL                    | Port |
| :-------------- | :----------------------------- | :--- |
| Auth Service    | http://localhost:8001/api-docs | 8001 |
| Product Service | http://localhost:8002/api-docs | 8002 |
| Project Service | http://localhost:8004/api-docs | 8004 |
| Review Service  | http://localhost:8005/api-docs | 8005 |

Buka URL di browser untuk dokumentasi lengkap dengan Try It Out feature!

---

## 🔑 Enkripsi & Keamanan

### 🛡️ Authentication & Authorization

#### JWT Token Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. POST /api/auth/login
     │ {email, password}
     ▼
┌─────────────────────┐
│   Auth Service      │
│ 1. Verify password  │  2. Response:
│ 2. Create JWT token │ {accessToken, expiresIn}
│ 3. Hash + compare   │
└────┬────────────────┘
     │
     │ 3. Store token (localStorage/cookie)
     ▼
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 4. POST /api/projects
     │ Header: Authorization: Bearer {token}
     ▼
┌─────────────────────┐
│ Project Service     │
│ 1. Verify JWT token │  5. Response: {data}
│ 2. Check role/scope │
│ 3. Execute endpoint │
└─────────────────────┘
```

#### JWT Secret Management

```javascript
// Dalam auth-service:

// Generate Token
const token = jwt.sign(
  {
    user_id: user.id,
    email: user.email,
    role: user.role,
  },
  process.env.JWT_SECRET, // ← Rahasia!
  { expiresIn: "24h" },
);

// Verify Token (di semua services)
jwt.verify(token, process.env.JWT_SECRET); // ← HARUS sama di semua!
```

⚠️ **CRITICAL:** Pastikan `JWT_SECRET` identik di semua service `.env` files!

### 🔒 Password Security

```javascript
// Bcryptjs dengan 10 rounds (salt)
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password saat login
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Password Requirements:**

- Minimum 8 karakter
- Kombinasi huruf besar, kecil, angka, dan simbol (recommended)
- Tidak boleh sama dengan email atau username

### 🚫 Role-Based Access Control (RBAC)

```javascript
// Middleware untuk memverifikasi role
router.post(
  "/api/projects",
  authMiddleware, // Verify JWT exists
  checkRole(["admin"]), // Verify user is admin
  projectController.createProject,
);
```

**Roles yang Didukung:**

- `admin` - Full akses, create/edit/delete resources
- `user` - Limited akses, hanya read + submit review

### 📮 Data Protection

| Data                  | Protection              | Method                             |
| :-------------------- | :---------------------- | :--------------------------------- |
| **Password**          | Encrypted at Rest       | bcryptjs (10 rounds)               |
| **JWT Secret**        | Protected               | Environment variable               |
| **API Communication** | Encrypted in Transit    | HTTPS (recommended for production) |
| **Database**          | Authentication Required | MongoDB credentials                |
| **File Uploads**      | Path Validation         | Multer middleware                  |

---

## 🚨 Troubleshooting

### 🔴 Masalah Umum & Solusi

#### 1️⃣ "Connection refused" saat startup

**Penyebab:** MongoDB belum siap atau belum selesai initialize

**Solusi:**

```bash
# Cek status containers
docker compose ps

# Lihat logs MongoDB
docker compose logs mongodb

# Restart hanya MongoDB
docker compose restart mongodb

# Tunggu 30 detik, lalu cek health
docker compose ps
```

#### 2️⃣ "Database connection timeout"

**Penyebab:** DATABASE_URL salah atau credentials salah

**Solusi:**

```bash
# Verify MongoDB credentials di .env
cat .env | grep MONGO_ROOT_USERNAME

# Test connection string
docker compose exec auth-service node -e "
  const { MongoClient } = require('mongodb');
  const uri = process.env.DATABASE_URL;
  MongoClient.connect(uri, {}, (err, client) => {
    if (err) console.error('❌ Connection Error:', err.message);
    else console.log('✅ Connection Success');
    process.exit();
  });
"
```

#### 3️⃣ "JWT token invalid/expired"

**Penyebab:** JWT_SECRET tidak sama di services atau token sudah expired

**Solusi:**

```bash
# Verifikasi JWT_SECRET di semua .env
grep JWT_SECRET services/*/. env

# Generate token baru (login ulang)
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Gunakan token baru di request selanjutnya
```

#### 4️⃣ "Service not found" / "Proxy error"

**Penyebab:** Service tidak running atau port salah

**Solusi:**

```bash
# Cek semua containers running
docker compose ps

# Lihat logs service yang error
docker compose logs auth-service -f

# Rebuild service tertentu
docker compose up --build auth-service -d
```

#### 5️⃣ "Multer: File upload error"

**Penyebab:** Upload folder tidak ada atau permission issue

**Solusi:**

```bash
# Buat upload directories
mkdir -p services/product-service/uploads
mkdir -p services/project-service/uploads/{contracts,documents,photos}

# Set permissions
chmod 777 services/product-service/uploads
chmod 777 services/project-service/uploads/*
```

#### 6️⃣ "Port already in use"

**Penyebab:** Port sudah digunakan aplikasi lain

**Solusi:**

```bash
# Linux/Mac - Kill process di port
lsof -i :8001
kill -9 <PID>

# Atau ubah port di docker-compose.yml
# ports:
#   - "9001:8001"  # Gunakan port 9001 di host
```

#### 7️⃣ "Out of memory" / Container crash

**Penyebab:** Docker resources terbatas

**Solusi:**

```bash
# Allocate lebih banyak memory ke Docker Desktop
# Settings > Resources > Memory: set ke 6-8 GB

# Atau cleanup dangling images
docker system prune -a

# Restart Docker
docker compose restart
```

---

### 🔍 Debugging Tools & Commands

#### View Service Logs

```bash
# Real-time logs (all services)
docker compose logs -f

# Logs untuk service specific
docker compose logs -f auth-service

# Last 100 lines
docker compose logs --tail=100 auth-service

# Filter by time
docker compose logs --since 10m auth-service
```

#### Database Inspection

```bash
# Open MongoDB shell via Docker
docker compose exec mongodb mongosh -u admin -p securepassword123 --authenticationDatabase admin

# Dalam MongoDB shell:
use bangunan_berkah
db.collections()
db.users.find()
db.projects.find().pretty()
```

#### API Testing dengan cURL

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pass"}' \
  | jq -r '.data.accessToken')

# Use token di request
curl -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/users/profile
```

#### Performance Monitoring

```bash
# Check memory usage
docker stats

# Check image sizes
docker images

# Prune unused data
docker system prune
```

---

## 📞 Informasi Kontak

### Developer Support

Untuk pertanyaan, bug report, atau feature request:

- **Developer:** Sulthan Raghib Fillah (Solo Developer)
- **GitHub:** [@SulthanRaghib](https://github.com/SulthanRaghib)
- **Repository:** [bangunan-berkah](https://github.com/SulthanRaghib/bangunan-berkah)
- **Issues:** [GitHub Issues](https://github.com/SulthanRaghib/bangunan-berkah/issues)

---

<div align="center">
<p>Dibuat dengan ❤️ oleh <b>Sulthan Raghib Fillah</b></p>
<p><b>Copyright © 2026 Sulthan Raghib Fillah. All Rights Reserved.</b></p>
</div>
