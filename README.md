<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7.2-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<h1 align="center">🏗️ PT Solusi Bangunan Berkah</h1>

<p align="center">
  <b>Microservice Backend Platform</b> untuk perusahaan konstruksi & bahan bangunan
  <br />
  Manajemen proyek, produk, review, dan autentikasi — dalam arsitektur terdistribusi.
</p>

<p align="center">
  <a href="#-arsitektur">Arsitektur</a> •
  <a href="#-daftar-service">Services</a> •
  <a href="#-api-endpoints">API Endpoints</a> •
  <a href="#-instalasi--setup">Instalasi</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-testing">Testing</a>
</p>

---

## 📖 Tentang Proyek

**PT Solusi Bangunan Berkah** adalah platform backend berbasis **microservice** yang dirancang untuk mendukung operasional perusahaan konstruksi dan bahan bangunan. Sistem ini menangani seluruh siklus bisnis mulai dari manajemen user, katalog produk, pelacakan proyek konstruksi, hingga ulasan dan testimoni pelanggan.

### ✨ Fitur Utama

| Fitur                          | Deskripsi                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| 🔐 **Autentikasi & Otorisasi** | JWT-based auth dengan access & refresh token, role-based access control (RBAC)     |
| 🏗️ **Manajemen Proyek**        | CRUD proyek konstruksi, milestone tracking, upload foto & dokumen ke Cloudinary    |
| 🛒 **Katalog Produk**          | Produk, kategori, manajemen inventory & stock history                              |
| ⭐ **Review & Testimoni**      | Review proyek, testimoni pelanggan dengan approval workflow, Q&A publik            |
| 💬 **Chat Service**            | Service placeholder untuk fitur real-time chat (dalam pengembangan)                |
| 🌐 **API Gateway**             | Centralized routing, JWT verification, rate limiting, CORS, dan API documentation  |
| 🛡️ **Keamanan**                | Helmet security headers, Redis-backed rate limiting, JWT blacklist, token rotation |
| 📊 **Dashboard**               | Statistik proyek dan activity log untuk admin                                      |
| 🚀 **CI/CD**                   | Auto-deploy ke VPS via GitHub Actions + server management console                  |
| 🧪 **Testing**                 | Black-box integration test suite menggunakan Mocha + Chai + Supertest              |

---

## 🏛️ Arsitektur

```
                        ┌──────────────────┐
                        │     Nginx        │
                        │   (SSL + Proxy)  │
                        └────────┬─────────┘
                                 │ HTTPS
                        ┌────────▼─────────┐
                        │   API Gateway    │
                        │    (Port 8080)   │
                        │ ─────────────────│
                        │ • JWT Verify     │
                        │ • Rate Limiting  │
                        │ • CORS           │
                        │ • Request Proxy  │
                        └────────┬─────────┘
                                 │
          ┌──────────┬───────────┼───────────┬───────────┐
          │          │           │           │           │
   ┌──────▼──┐ ┌────▼─────┐ ┌──▼───────┐ ┌▼────────┐ ┌▼─────────┐
   │  Auth   │ │ Product  │ │ Project  │ │ Review  │ │   Chat   │
   │ Service │ │ Service  │ │ Service  │ │ Service │ │ Service  │
   │ :8001   │ │ :8002    │ │ :8004    │ │ :8005   │ │ :8003    │
   └────┬────┘ └────┬─────┘ └────┬─────┘ └───┬─────┘ └────┬─────┘
        │           │            │            │            │
        └───────────┴─────┬──────┴────────────┴────────────┘
                          │
                ┌─────────▼─────────┐
                │     MongoDB 7.0   │  ◄── Prisma ORM
                │     (Port 27017)  │
                └───────────────────┘
                ┌───────────────────┐
                │   Redis 7.2       │  ◄── Rate Limit + JWT Blacklist
                │   (Port 6379)     │
                └───────────────────┘
```

### 🔀 Alur Request

1. **Client** mengirim request ke `https://api.bangunanmu.my.id`
2. **Nginx** terminates SSL dan meneruskan ke API Gateway (port 8080)
3. **API Gateway** melakukan:
   - Verifikasi JWT token (untuk protected routes)
   - Rate limiting via Redis
   - Inject user headers (`x-user-id`, `x-user-email`, `x-user-role`)
   - Proxy request ke service yang sesuai
4. **Service** memproses request dan mengembalikan response

---

## 📦 Daftar Service

### 🔑 Auth Service — `Port 8001`

Mengelola autentikasi pengguna, registrasi, dan manajemen user.

| Fitur              | Detail                                         |
| ------------------ | ---------------------------------------------- |
| Registrasi & Login | Bcrypt hashing, JWT access + refresh token     |
| Token Management   | Refresh token rotation, Redis-backed blacklist |
| RBAC               | Role `admin` dan `user`                        |
| Profile            | Get & update user profile                      |

**Database Model:**

```
User {
  id        ObjectId @id
  name      String
  email     String   @unique
  password  String   (bcrypt hashed)
  role      String   (default: "user")
  createdAt DateTime
  updatedAt DateTime
}
```

---

### 🛒 Product Service — `Port 8002`

Mengelola katalog produk, kategori, dan inventory.

| Fitur     | Detail                                                                   |
| --------- | ------------------------------------------------------------------------ |
| Produk    | CRUD, featured toggle, active/inactive toggle, image upload (Cloudinary) |
| Kategori  | CRUD kategori dengan slug otomatis                                       |
| Inventory | Stok management, low stock alert, stock history                          |

**Database Models:**

```
Category { id, name, slug, description, icon, isActive }
Product  { id, name, slug, sku, price, salePrice, categoryId, unit, weight, dimensions, images, tags, isActive, isFeatured }
Inventory { id, productId, stock, minStock, maxStock, warehouseLocation, lastRestockDate }
StockHistory { id, productId, type (in/out), quantity, description }
```

---

### 🏗️ Project Service — `Port 8004`

Mengelola proyek konstruksi, milestone, foto dokumentasi, dan dokumen proyek.

| Fitur           | Detail                                                            |
| --------------- | ----------------------------------------------------------------- |
| Proyek          | CRUD proyek dengan kode unik (`PRJ-2026-XXXX`), status management |
| Milestones      | Tracking progress per tahap, upload foto bukti progress           |
| Foto & Dokumen  | Upload ke Cloudinary, multi-file support                          |
| Dashboard       | Statistik proyek, activity log per proyek                         |
| Tracking Publik | Pelanggan bisa lacak progress proyek via project code             |

**Database Model:**

```
Project {
  id, projectCode, projectName, description, projectType,
  customerName, customerEmail, customerPhone, customerAddress,
  budget, actualCost, startDate, estimatedEndDate, actualEndDate,
  status (pending/in_progress/on_hold/completed/cancelled),
  progress (0-100), photos[], contractDocument, notes,
  milestones[], reports[], documents[], activities[]
}

Milestone    { id, name, description, status, progress, targetDate, photos[] }
ProjectDocument { id, title, filename, fileType, fileSize, url, category }
ProjectActivity { id, userId, userName, action, description, metadata }
```

---

### ⭐ Review Service — `Port 8005`

Mengelola review proyek, testimoni pelanggan, dan Q&A.

| Fitur     | Detail                                                       |
| --------- | ------------------------------------------------------------ |
| Review    | Review proyek oleh pelanggan, termasuk rating & foto         |
| Testimoni | Submit testimonial, admin approval workflow (approve/reject) |
| Q&A       | Pertanyaan publik, admin menjawab, status (open/answered)    |

**Database Models:**

```
Review      { id, projectCode, customerName, customerEmail, rating, comment, photos[] }
Testimonial { id, name, email, company, position, testimonialText, rating, photos[], isApproved }
QA          { id, customerName, customerEmail, question, answer, status }
```

---

### 💬 Chat Service — `Port 8003`

Service placeholder untuk fitur real-time chat antara admin dan pelanggan. Saat ini menyediakan health check endpoint dan sedang dalam tahap pengembangan.

---

### 🌐 API Gateway — `Port 8080`

Gerbang utama seluruh API. Semua request dari client melewati gateway ini.

| Fitur            | Detail                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Reverse Proxy    | Route request ke service yang sesuai via `http-proxy-middleware`       |
| JWT Verification | Sentralisasi verifikasi token di gateway, inject headers ke downstream |
| Rate Limiting    | Redis-backed, 100 req/15min (API), 20 req/15min (auth endpoints)       |
| Security         | Helmet security headers, CORS whitelist                                |
| API Docs         | Stoplight Elements portal di `/docs`                                   |
| Health Check     | `/health`, `/health/ready`, `/health/live`                             |

---

## 🔗 API Endpoints

### 🔑 Auth Service (`/api/auth`, `/api/users`)

|  Method  | Endpoint             | Auth | Role  | Deskripsi                  |
| :------: | -------------------- | :--: | :---: | -------------------------- |
|  `POST`  | `/api/auth/register` |  ❌  |   —   | Registrasi user baru       |
|  `POST`  | `/api/auth/login`    |  ❌  |   —   | Login & dapatkan JWT token |
|  `POST`  | `/api/auth/refresh`  |  ❌  |   —   | Refresh access token       |
|  `GET`   | `/api/auth/profile`  |  ✅  |   —   | Ambil profil user          |
|  `POST`  | `/api/auth/logout`   |  ✅  |   —   | Logout & blacklist token   |
|  `GET`   | `/api/users`         |  ✅  | Admin | List semua user            |
|  `GET`   | `/api/users/:id`     |  ✅  |   —   | Ambil user by ID           |
|  `PUT`   | `/api/users/:id`     |  ✅  |   —   | Update user                |
| `DELETE` | `/api/users/:id`     |  ✅  | Admin | Hapus user                 |

---

### 🛒 Product Service (`/api/products`, `/api/categories`, `/api/inventory`)

|  Method  | Endpoint                            | Auth | Role  | Deskripsi                      |
| :------: | ----------------------------------- | :--: | :---: | ------------------------------ |
|  `GET`   | `/api/products`                     |  ❌  |   —   | List semua produk (public)     |
|  `GET`   | `/api/products/featured`            |  ❌  |   —   | Produk featured/unggulan       |
|  `GET`   | `/api/products/slug/:slug`          |  ❌  |   —   | Produk by slug                 |
|  `GET`   | `/api/products/:id`                 |  ❌  |   —   | Produk by ID                   |
|  `POST`  | `/api/products/admin`               |  ✅  | Admin | Tambah produk (+ image upload) |
|  `PUT`   | `/api/products/admin/:id`           |  ✅  | Admin | Update produk                  |
| `DELETE` | `/api/products/admin/:id`           |  ✅  | Admin | Hapus produk                   |
| `PATCH`  | `/api/products/admin/:id/featured`  |  ✅  | Admin | Toggle featured                |
| `PATCH`  | `/api/products/admin/:id/active`    |  ✅  | Admin | Toggle active                  |
|  `GET`   | `/api/categories`                   |  ❌  |   —   | List kategori (public)         |
|  `GET`   | `/api/categories/:id`               |  ❌  |   —   | Kategori by ID                 |
|  `POST`  | `/api/categories/admin`             |  ✅  | Admin | Tambah kategori                |
|  `PUT`   | `/api/categories/admin/:id`         |  ✅  | Admin | Update kategori                |
| `DELETE` | `/api/categories/admin/:id`         |  ✅  | Admin | Hapus kategori                 |
|  `GET`   | `/api/inventory`                    |  ✅  | Admin | List semua inventory           |
|  `GET`   | `/api/inventory/low-stock`          |  ✅  | Admin | Produk dengan stok rendah      |
|  `GET`   | `/api/inventory/:productId`         |  ✅  |   —   | Inventory by product           |
|  `GET`   | `/api/inventory/history/:productId` |  ✅  |   —   | Stock history                  |
|  `POST`  | `/api/inventory/update-stock`       |  ✅  | Admin | Update stok (in/out)           |
|  `PUT`   | `/api/inventory/:productId`         |  ✅  | Admin | Update inventory settings      |

---

### 🏗️ Project Service (`/api/projects`, `/api/dashboard`)

|  Method  | Endpoint                                    | Auth | Role  | Deskripsi                          |
| :------: | ------------------------------------------- | :--: | :---: | ---------------------------------- |
|  `GET`   | `/api/projects/track/:projectCode`          |  ❌  |   —   | 🔓 Tracking publik by project code |
|  `GET`   | `/api/projects/summary/:projectCode`        |  ❌  |   —   | 🔓 Ringkasan proyek (publik)       |
|  `POST`  | `/api/projects`                             |  ✅  | Admin | Buat proyek baru                   |
|  `GET`   | `/api/projects`                             |  ✅  | Admin | List semua proyek                  |
|  `GET`   | `/api/projects/:projectCode`                |  ✅  | Admin | Detail proyek by code              |
|  `PUT`   | `/api/projects/:projectCode`                |  ✅  | Admin | Update proyek                      |
| `DELETE` | `/api/projects/:projectCode`                |  ✅  | Admin | Hapus proyek                       |
| `PATCH`  | `/api/projects/:projectCode/status`         |  ✅  | Admin | Update status proyek               |
|  `POST`  | `/api/projects/:projectCode/photos`         |  ✅  | Admin | Upload foto dokumentasi (max 10)   |
|  `GET`   | `/api/projects/:projectCode/photos`         |  ✅  | Admin | List foto proyek                   |
| `DELETE` | `/api/projects/:projectCode/photos`         |  ✅  | Admin | Hapus foto proyek                  |
|  `POST`  | `/api/projects/:projectCode/milestones`     |  ✅  | Admin | Tambah milestone                   |
|  `GET`   | `/api/projects/:projectCode/milestones`     |  ✅  | Admin | List milestones                    |
| `PATCH`  | `/api/projects/:projectCode/milestones/:id` |  ✅  | Admin | Update milestone (+ foto)          |
| `DELETE` | `/api/projects/:projectCode/milestones/:id` |  ✅  | Admin | Hapus milestone                    |
|  `POST`  | `/api/projects/:projectCode/documents`      |  ✅  | Admin | Upload dokumen proyek              |
|  `GET`   | `/api/projects/:projectCode/documents`      |  ✅  | Admin | List dokumen proyek                |
| `DELETE` | `/api/projects/:projectCode/documents/:id`  |  ✅  | Admin | Hapus dokumen                      |
|  `GET`   | `/api/dashboard/stats`                      |  ✅  | Admin | Statistik dashboard                |
|  `GET`   | `/api/dashboard/activities/:projectCode`    |  ✅  | Admin | Activity log proyek                |

---

### ⭐ Review Service (`/api/reviews`, `/api/testimonials`, `/api/qa`)

|  Method  | Endpoint                              | Auth | Role  | Deskripsi                      |
| :------: | ------------------------------------- | :--: | :---: | ------------------------------ |
|  `POST`  | `/api/reviews`                        |  ❌  |   —   | Submit review proyek           |
|  `GET`   | `/api/reviews/:projectCode`           |  ❌  |   —   | Review by project code         |
|  `GET`   | `/api/reviews/admin`                  |  ✅  | Admin | Semua review (admin)           |
|  `GET`   | `/api/reviews/admin/:id`              |  ✅  | Admin | Review by ID                   |
|  `PUT`   | `/api/reviews/admin/:projectCode`     |  ✅  | Admin | Update review                  |
| `DELETE` | `/api/reviews/admin/:projectCode`     |  ✅  | Admin | Hapus review                   |
|  `POST`  | `/api/testimonials`                   |  ❌  |   —   | Submit testimoni               |
|  `GET`   | `/api/testimonials`                   |  ❌  |   —   | Testimoni yang sudah disetujui |
|  `GET`   | `/api/testimonials/admin`             |  ✅  | Admin | Semua testimoni                |
|  `GET`   | `/api/testimonials/admin/:id`         |  ✅  | Admin | Testimoni by ID                |
|  `PUT`   | `/api/testimonials/admin/:id`         |  ✅  | Admin | Update testimoni               |
| `DELETE` | `/api/testimonials/admin/:id`         |  ✅  | Admin | Hapus testimoni                |
| `PATCH`  | `/api/testimonials/admin/:id/approve` |  ✅  | Admin | Setujui testimoni              |
| `PATCH`  | `/api/testimonials/admin/:id/reject`  |  ✅  | Admin | Tolak testimoni                |
|  `POST`  | `/api/qa`                             |  ❌  |   —   | Kirim pertanyaan               |
|  `GET`   | `/api/qa`                             |  ❌  |   —   | Q&A yang sudah dijawab         |
|  `GET`   | `/api/qa/admin`                       |  ✅  | Admin | Semua pertanyaan               |
|  `GET`   | `/api/qa/admin/:id`                   |  ✅  | Admin | Pertanyaan by ID               |
| `PATCH`  | `/api/qa/admin/:id/answer`            |  ✅  | Admin | Jawab pertanyaan               |
| `DELETE` | `/api/qa/admin/:id`                   |  ✅  | Admin | Hapus pertanyaan               |

---

## 🛠️ Tech Stack

| Layer                   | Teknologi                                           |
| ----------------------- | --------------------------------------------------- |
| **Runtime**             | Node.js 20 (Alpine/Slim)                            |
| **Framework**           | Express.js 4.x                                      |
| **Database**            | MongoDB 7.0                                         |
| **ORM**                 | Prisma Client                                       |
| **Cache & Rate Limit**  | Redis 7.2 (Alpine)                                  |
| **Authentication**      | JWT (jsonwebtoken) + bcryptjs                       |
| **File Storage**        | Cloudinary (cloud) + Multer (upload handler)        |
| **API Gateway**         | http-proxy-middleware                               |
| **Security**            | Helmet, CORS, express-rate-limit + rate-limit-redis |
| **Containerization**    | Docker + Docker Compose                             |
| **Reverse Proxy & SSL** | Nginx + Let's Encrypt (Certbot)                     |
| **CI/CD**               | GitHub Actions (SSH deploy)                         |
| **Testing**             | Mocha + Chai + Supertest                            |
| **Database GUI**        | Mongo Express (port 8081)                           |
| **API Documentation**   | Stoplight Elements + OpenAPI YAML                   |

---

## 📁 Struktur Proyek

```
pt-solusi-bangunan-berkah-microservice/
│
├── 📄 docker-compose.yml         # Orchestrasi semua container
├── 📄 .env.example               # Template environment variables
├── 📄 init.sql                   # Inisialisasi database
│
├── 📂 services/
│   ├── 📂 api-gateway/           # 🌐 Gateway (Port 8080)
│   │   ├── index.js              # Entry point — proxy, rate limit, CORS
│   │   ├── middleware/
│   │   │   └── gatewayAuth.middleware.js  # Centralized JWT verification
│   │   └── public/docs/          # Stoplight Elements UI
│   │
│   ├── 📂 auth-service/          # 🔑 Auth (Port 8001)
│   │   ├── server.js
│   │   ├── src/
│   │   │   ├── app.js
│   │   │   ├── controllers/      # authController, userController
│   │   │   ├── services/         # authService, userService
│   │   │   ├── repositories/     # userRepository (Prisma)
│   │   │   ├── routes/           # Public & protected routes
│   │   │   ├── middlewares/
│   │   │   └── utils/            # bcrypt, jwt, validation
│   │   └── prisma/
│   │       ├── schema.prisma     # User model
│   │       └── seed.js           # Database seeder
│   │
│   ├── 📂 product-service/       # 🛒 Product (Port 8002)
│   │   ├── src/
│   │   │   ├── controllers/      # product, category, inventory
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── routes/           # Public & admin routes
│   │   │   └── middlewares/      # uploadMiddleware (Multer)
│   │   └── prisma/
│   │       └── schema.prisma     # Product, Category, Inventory, StockHistory
│   │
│   ├── 📂 project-service/       # 🏗️ Project (Port 8004)
│   │   ├── src/
│   │   │   ├── controllers/      # project, milestone, document, dashboard, tracking
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── routes/           # Project, milestone, document, dashboard, tracking
│   │   │   ├── middlewares/      # auth, role, upload
│   │   │   └── utils/            # projectCodeGenerator
│   │   └── prisma/
│   │       └── schema.prisma     # Project, Milestone, Document, Activity, Stats
│   │
│   ├── 📂 review-service/        # ⭐ Review (Port 8005)
│   │   ├── src/
│   │   │   ├── controllers/      # review, testimonial, Q&A (public & admin)
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── routes/           # Public & admin routes
│   │   └── prisma/
│   │       └── schema.prisma     # Review, Testimonial, QA
│   │
│   └── 📂 chat-service/          # 💬 Chat (Port 8003)
│       └── index.js              # Placeholder service
│
├── 📂 shared/                    # 🧰 Shared Library
│   ├── index.js                  # Central export
│   └── src/
│       ├── constants/            # App constants
│       ├── interfaces/           # Shared interfaces
│       ├── middlewares/          # authMiddleware, errorHandler, roleMiddleware
│       ├── utils/               # cloudinary, pagination, redis, response, validation, token-blacklist
│       └── validators/          # Shared validation schemas
│
├── 📂 tests/                     # 🧪 Integration Test Suite
│   ├── .mocharc.yml              # Mocha configuration
│   ├── helpers/                  # setup, request helper, reporter, timer
│   ├── auth-service/             # Auth service tests
│   ├── project-service/          # Project service tests
│   └── review-service/           # Review service tests
│
├── 📂 docs/
│   └── specs/                    # OpenAPI YAML specifications
│       ├── auth-service.yaml
│       ├── product-service.yaml
│       ├── project-service.yaml
│       ├── review-service.yaml
│       └── chat-service.yaml
│
└── 📂 .github/workflows/         # 🚀 CI/CD
    ├── deploy.yml                # Auto-deploy on push to master
    └── server-management.yml     # Remote server management console
```

---

## ⚙️ Instalasi & Setup

### 📋 Prasyarat

| Software                                           | Versi Minimum | Keterangan              |
| -------------------------------------------------- | :-----------: | ----------------------- |
| [Docker](https://docs.docker.com/get-docker/)      |      20+      | Container runtime       |
| [Docker Compose](https://docs.docker.com/compose/) |      2.x      | Container orchestration |
| [Node.js](https://nodejs.org/)                     |      20+      | Untuk development lokal |
| [Git](https://git-scm.com/)                        |      2.x      | Version control         |

### 🚀 Quick Start

**1. Clone Repository**

```bash
git clone https://github.com/SulthanRaghib/bangunan-berkah.git
cd bangunan-berkah
```

**2. Konfigurasi Environment Variables**

```bash
# Root environment (MongoDB, Redis, JWT global)
cp .env.example .env

# Setiap service memiliki .env sendiri
cp services/api-gateway/.env.example services/api-gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/product-service/.env.example services/product-service/.env
cp services/project-service/.env.example services/project-service/.env
cp services/review-service/.env.example services/review-service/.env
cp services/chat-service/.env.example services/chat-service/.env
```

> ⚠️ **Penting:** Pastikan `JWT_SECRET` di semua service dan API Gateway **nilainya sama**.

**3. Jalankan dengan Docker Compose**

```bash
# Build & start semua containers
docker compose up -d --build

# Cek status containers
docker compose ps

# Lihat logs
docker compose logs -f
```

**4. Seed Database (Data Awal)**

```bash
# Seed user data (admin + test users)
docker compose exec auth-service npm run prisma:seed

# Seed product data
docker compose exec product-service npm run prisma:seed
```

**5. Verifikasi**

```bash
# Health check
curl http://localhost:8080/health

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@solusi-bangunan.com", "password": "admin123"}'
```

> 📚 API Documentation tersedia di: `http://localhost:8080/docs`

---

### 🔧 Environment Variables

#### Root `.env`

| Variable              | Deskripsi                                        | Default |
| --------------------- | ------------------------------------------------ | ------- |
| `MONGO_ROOT_USERNAME` | MongoDB admin username                           | —       |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password                           | —       |
| `MONGO_DATABASE`      | Nama database utama                              | —       |
| `REDIS_PASSWORD`      | Password Redis                                   | —       |
| `JWT_SECRET`          | JWT signing secret (harus sama di semua service) | —       |
| `RATE_LIMIT_MAX`      | Max request per window                           | `100`   |
| `AUTH_RATE_LIMIT_MAX` | Max auth request per window                      | `20`    |

#### Per-Service `.env`

Setiap service memiliki `.env` sendiri dengan konfigurasi:

| Variable                | Contoh                                                        |
| ----------------------- | ------------------------------------------------------------- |
| `PORT`                  | `8001` (auth), `8002` (product), dll                          |
| `DATABASE_URL`          | `mongodb://admin:pass@mongodb:27017/auth_db?authSource=admin` |
| `JWT_SECRET`            | Harus sama dengan root `.env`                                 |
| `CORS_ALLOWED_ORIGINS`  | `http://localhost:5173,http://localhost:8080`                 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary credentials (project & product service)            |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                            |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                         |

---

## 🚀 Deployment

### Infrastruktur Produksi

```
Internet → DNS (bangunanmu.my.id)
   → Nginx (SSL termination via Let's Encrypt)
      → Docker Compose (API Gateway → Services)
```

### 🔄 CI/CD — Auto Deploy

Setiap **push ke branch `master`** akan otomatis trigger deployment:

1. GitHub Actions SSH ke VPS
2. Pull kode terbaru
3. Build & restart containers (`docker compose up -d --build`)
4. Health check semua service
5. Rollback otomatis jika ada service yang gagal

File: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### 🛠️ Server Management Console

Workflow manual untuk mengelola server langsung dari GitHub UI, tanpa perlu SSH:

File: [`.github/workflows/server-management.yml`](.github/workflows/server-management.yml)

| Aksi                    | Fungsi                                             |
| ----------------------- | -------------------------------------------------- |
| 🔍 `server-status`      | Cek status server, Docker, container, disk, memory |
| 🐳 `docker-start`       | Start Docker daemon                                |
| 🐳 `docker-restart`     | Restart Docker daemon                              |
| 🚀 `containers-up`      | Start containers (semua atau spesifik)             |
| ⏹️ `containers-down`    | Stop containers                                    |
| 🔄 `containers-restart` | Restart containers                                 |
| 🌱 `run-seeder`         | Jalankan database seeder di service tertentu       |
| ⚡ `exec-command`       | Jalankan custom command di container atau host     |
| 📋 `view-logs`          | Lihat logs container                               |
| 🏥 `health-check`       | Cek kesehatan semua service, database, dan HTTPS   |
| 🧹 `disk-cleanup`       | Bersihkan Docker cache dan logs                    |
| 🔑 `nginx-restart`      | Restart Nginx                                      |

**Cara pakai:** GitHub → Actions → 🛠️ Server Management Console → Run workflow

### 🔐 GitHub Secrets yang Diperlukan

| Secret         | Deskripsi                       |
| -------------- | ------------------------------- |
| `VPS_HOST`     | IP atau hostname VPS            |
| `VPS_USERNAME` | SSH username (biasanya `root`)  |
| `VPS_SSH_KEY`  | Private SSH key untuk akses VPS |

---

## 🧪 Testing

Black-box integration tests yang berjalan terhadap API Gateway:

```bash
cd tests

# Install dependencies
npm install

# Jalankan semua test
npm test

# Test per service
npm run test:auth
npm run test:project
npm run test:review
```

### Konfigurasi Test

Edit `tests/.env` untuk mengarahkan ke target API:

```env
TEST_BASE_URL=http://localhost:8080       # Lokal
# TEST_BASE_URL=https://api.bangunanmu.my.id  # Produksi

TEST_ADMIN_PASSWORD=admin123
TEST_USER_PASSWORD=admin123
```

### Test Coverage

| Service | Endpoint yang Ditest                                      |
| ------- | --------------------------------------------------------- |
| Auth    | Login, profile, update user, logout                       |
| Project | CRUD project, milestones, photos, status, dashboard       |
| Review  | Testimonials (public & admin), reviews, approval workflow |

---

## 📚 API Documentation

API documentation tersedia melalui **Stoplight Elements** yang ter-hosting di API Gateway:

| Environment | URL                                 |
| ----------- | ----------------------------------- |
| Lokal       | `http://localhost:8080/docs`        |
| Produksi    | `https://api.bangunanmu.my.id/docs` |

Spesifikasi OpenAPI dalam format YAML tersedia di folder [`docs/specs/`](docs/specs/):

- `auth-service.yaml` — Auth & User endpoints
- `product-service.yaml` — Product, Category, Inventory endpoints
- `project-service.yaml` — Project, Milestone, Document, Dashboard endpoints
- `review-service.yaml` — Review, Testimonial, Q&A endpoints
- `chat-service.yaml` — Chat Service endpoints

---

## 📝 Contoh Penggunaan API

### 🔐 Login

```bash
curl -X POST https://api.bangunanmu.my.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@solusi-bangunan.com",
    "password": "admin123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "...",
      "name": "Admin",
      "email": "admin@solusi-bangunan.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 🏗️ Buat Proyek Baru

```bash
curl -X POST https://api.bangunanmu.my.id/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "projectName": "Renovasi Rumah Pak Ahmad",
    "projectType": "konstruksi",
    "customerName": "Ahmad Suryadi",
    "customerAddress": "Jl. Merdeka No. 10, Jakarta"
  }'
```

### 🔍 Tracking Proyek (Publik)

```bash
# Pelanggan bisa cek progress tanpa login
curl https://api.bangunanmu.my.id/api/projects/track/PRJ-2026-0001
```

### ⭐ Kirim Testimoni (Publik)

```bash
curl -X POST https://api.bangunanmu.my.id/api/testimonials \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budi Santoso",
    "email": "budi@email.com",
    "testimonialText": "Pelayanan sangat memuaskan!",
    "rating": 5
  }'
```

---

## 🐳 Docker Commands

```bash
# Start semua service
docker compose up -d

# Stop semua service
docker compose down

# Rebuild specific service
docker compose up -d --build auth-service

# Lihat logs service tertentu
docker compose logs -f api-gateway

# Akses shell dalam container
docker compose exec auth-service sh

# Jalankan Prisma commands
docker compose exec auth-service npx prisma studio
docker compose exec auth-service npm run prisma:seed

# Hapus semua data (HATI-HATI!)
docker compose down -v  # Menghapus volumes (data MongoDB & Redis)
```

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/nama-fitur`)
3. Commit perubahan (`git commit -m "feat: deskripsi fitur"`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buat Pull Request

### Konvensi Commit

| Prefix      | Kegunaan      |
| ----------- | ------------- |
| `feat:`     | Fitur baru    |
| `fix:`      | Bug fix       |
| `docs:`     | Dokumentasi   |
| `refactor:` | Refaktor kode |
| `test:`     | Testing       |
| `chore:`    | Maintenance   |

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
  Last Modified:   June 30, 2026
  Version:         1.0.0

  This software and all associated code, documentation, and materials
  are the exclusive property of Sulthan Raghib Fillah.

  Unauthorized use, reproduction, or distribution of this software
  is strictly prohibited without explicit written permission.
═══════════════════════════════════════════════════════════════════════════════

```

**Last Updated:** June 30, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Owner:** Sulthan Raghib Fillah
