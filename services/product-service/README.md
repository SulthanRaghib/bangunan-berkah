# 🏗️ Product Service - PT Solusi Bangunan Berkah

Microservice untuk manajemen produk, kategori, dan inventori material bangunan. Service ini menyediakan API untuk mengelola katalog produk, stok inventori, dan riwayat pergerakan barang.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Database Seeding](#-database-seeding)
- [API Endpoints](#-api-endpoints)
- [Docker Build & Deploy](#-docker-build--deploy)
- [Testing](#-testing)
- [Struktur Folder](#-struktur-folder)

## ✨ Fitur Utama

### 🏷️ Manajemen Kategori

- CRUD kategori produk
- Slug otomatis dari nama kategori
- Deskripsi dan ikon kategori
- Filter dan pencarian kategori

### 📦 Manajemen Produk

- CRUD produk lengkap dengan detail
- Upload gambar produk (multiple images)
- SKU unik untuk setiap produk
- Harga normal dan harga diskon
- Produk unggulan (featured products)
- Filter berdasarkan kategori
- Pencarian produk
- Pagination

### 📊 Manajemen Inventori

- Tracking stok real-time
- Minimum stock alert
- Update stok (tambah/kurang)
- Riwayat pergerakan stok
- Low stock notification
- Integrasi otomatis saat create/update produk

### 🔐 Keamanan

- JWT Authentication middleware
- Role-based access control (Admin/User)
- Protected endpoints untuk operasi sensitif
- Input validation dengan Joi

## 🛠️ Teknologi

- **Runtime**: Node.js 20.x
- **Framework**: Express.js 4.18.2
- **Database**: MySQL 8.0 (via Prisma ORM)
- **ORM**: Prisma 5.22.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Validation**: Joi 17.9.2
- **File Upload**: Multer 1.4.5-lts.1
- **Containerization**: Docker & Docker Compose

## 📝 Prasyarat

Sebelum memulai, pastikan Anda telah menginstall:

- [Node.js](https://nodejs.org/) (v20.x atau lebih baru)
- [Docker](https://www.docker.com/) & Docker Compose
- [MySQL](https://www.mysql.com/) 8.0+ (jika development tanpa Docker)
- [Git](https://git-scm.com/)

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd pt-solusi-bangunan-berkah-microservice/services/product-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root folder product-service:

```env
# Application
PORT=8002
NODE_ENV=development

# Database
DATABASE_URL="mysql://root:my-secret-password@mysql:3306/product_db"

# JWT Secret (harus sama dengan auth-service)
JWT_SECRET=supersecretjwtkey

# Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Jalankan Migrasi Database

```bash
npx prisma migrate deploy
```

atau untuk development:

```bash
npx prisma migrate dev --name init
```

## 🌱 Database Seeding

Service ini dilengkapi dengan data dummy untuk testing dan development.

### Data yang Tersedia:

- **20 Kategori** - Kategori material bangunan lengkap
- **50 Produk** - Produk bangunan dengan detail lengkap
- **Inventori** - Stok otomatis untuk setiap produk

### Cara Menjalankan Seeder:

#### Menggunakan Docker:

```bash
# Masuk ke container product-service
docker exec -it product-service sh

# Jalankan seeder
npm run seed

# Atau langsung dari host
docker exec -it product-service npm run seed
```

#### Tanpa Docker (Local Development):

```bash
npm run seed
```

### Script Seeder:

Tambahkan script berikut ke `package.json`:

```json
{
  "scripts": {
    "seed": "node prisma/seed.js"
  }
}
```

### Isi Data Seeder:

**Kategori (20):**

1. Semen & Bahan Perekat
2. Pasir & Agregat
3. Bata & Batako
4. Cat & Finishing
5. Keramik & Granit
6. Besi & Baja
7. Kayu & Plywood
8. Pipa & Fitting
9. Listrik & Kabel
10. Sanitair & Plumbing
11. Pintu & Jendela
12. Atap & Rangka
13. Alat Tukang
14. Paku & Baut
15. Lem & Perekat
16. Gypsum & Partisi
17. Isolasi & Waterproof
18. Kunci & Engsel
19. Mesin & Power Tools
20. Material Dekoratif

**Produk (50):**

- Semen Gresik Portland
- Pasir Bangka Halus
- Bata Merah Press Jumbo
- Cat Tembok Avitex
- Keramik Roman 40x40
- Besi Beton Ulir 10mm
- Kayu Meranti Kelas A
- Pipa PVC Rucika 3"
- Kabel NYM Eterna 2x2.5mm
- Dan 41 produk lainnya...

Setiap produk dilengkapi dengan:

- Nama, SKU, deskripsi lengkap
- Harga dan harga diskon (jika ada)
- Unit, berat, kategori
- Stok awal dan minimum stok
- Status featured product
- Riwayat stok awal

## 📡 API Endpoints

### Public Endpoints (Tanpa Authentication)

#### Health Check

```http
GET /health
```

Response: `{ "status": "OK", "service": "product-service" }`

#### Products

```http
GET /api/products
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `search` (pencarian nama/deskripsi)
- `categoryId` (filter kategori)
- `minPrice` (filter harga minimum)
- `maxPrice` (filter harga maksimum)
- `isFeatured` (true/false)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Semen Gresik Portland",
      "slug": "semen-gresik-portland",
      "description": "Semen berkualitas tinggi...",
      "sku": "SEM-GRS-001",
      "price": 65000,
      "salePrice": null,
      "unit": "sak",
      "weight": 50,
      "isFeatured": true,
      "category": {
        "id": 1,
        "name": "Semen & Bahan Perekat"
      },
      "inventory": {
        "stock": 150,
        "minStock": 30
      },
      "images": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

```http
GET /api/products/:id
```

**Response:** Detail produk lengkap dengan relasi kategori dan inventori

#### Categories

```http
GET /api/categories
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `search` (pencarian nama)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Semen & Bahan Perekat",
      "slug": "semen-bahan-perekat",
      "description": "Berbagai jenis semen...",
      "icon": "🏗️",
      "createdAt": "2025-10-23T...",
      "_count": {
        "products": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 20,
    "totalPages": 1
  }
}
```

```http
GET /api/categories/:id
```

**Response:** Detail kategori dengan produk terkait

### Protected Endpoints (Memerlukan JWT Token)

**Header Required:**

```http
Authorization: Bearer <JWT_TOKEN>
```

#### Create Product (Admin Only)

```http
POST /api/products
Content-Type: multipart/form-data
```

**Form Data:**

- `name` (required)
- `description`
- `sku` (required, unique)
- `price` (required, number)
- `salePrice` (optional, number)
- `categoryId` (required, number)
- `unit` (default: "pcs")
- `weight` (number)
- `isFeatured` (boolean)
- `stock` (number, default: 0)
- `minStock` (number, default: 10)
- `images[]` (multiple files, max 5MB each)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 51,
    "name": "Product Baru",
    "sku": "PRD-NEW-001",
    "price": 100000,
    "category": { ... },
    "inventory": {
      "stock": 50,
      "minStock": 10
    },
    "images": [
      {
        "url": "/uploads/products/image1.jpg",
        "isPrimary": true
      }
    ]
  }
}
```

#### Update Product (Admin Only)

```http
PUT /api/products/:id
Content-Type: multipart/form-data
```

**Form Data:** Same as create (all fields optional)

#### Delete Product (Admin Only)

```http
DELETE /api/products/:id
```

#### Create Category (Admin Only)

```http
POST /api/categories
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Kategori Baru",
  "description": "Deskripsi kategori",
  "icon": "🏗️"
}
```

#### Update Category (Admin Only)

```http
PUT /api/categories/:id
Content-Type: application/json
```

#### Delete Category (Admin Only)

```http
DELETE /api/categories/:id
```

#### Update Stock (Admin Only)

```http
POST /api/inventory/update-stock
Content-Type: application/json
```

**Body:**

```json
{
  "productId": 1,
  "quantity": 50,
  "type": "in",
  "description": "Restocking dari supplier"
}
```

**Type:** `in` (penambahan) atau `out` (pengurangan)

#### Low Stock Alert (Admin/User)

```http
GET /api/inventory/low-stock
```

**Response:** List produk dengan stok di bawah minimum

#### Stock History (Admin/User)

```http
GET /api/inventory/history/:productId
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)

## 🐳 Docker Build & Deploy

### Build dengan Docker Compose

Dari root project:

```bash
# Build semua services
docker-compose build

# Build hanya product-service
docker-compose build product-service

# Build dan start
docker-compose up -d --build product-service
```

### Dockerfile Explanation

Product-service menggunakan multi-stage build:

1. **Install dependencies** - npm install dengan production mode
2. **Generate Prisma Client** - untuk type safety dan query builder
3. **Install OpenSSL** - untuk Prisma di environment Docker
4. **Setup Entrypoint** - untuk auto-migration saat container start

### Docker Entrypoint

File `docker-entrypoint.sh` otomatis:

- Membuat folder uploads/products
- Menjalankan `prisma migrate deploy`
- Start aplikasi

### Environment Variables di Docker

Pastikan `.env` sudah dikonfigurasi atau gunakan `docker-compose.yml`:

```yaml
product-service:
  build: ./services/product-service
  ports:
    - "8002:8002"
  environment:
    - DATABASE_URL=mysql://root:my-secret-password@mysql:3306/product_db
    - JWT_SECRET=supersecretjwtkey
    - PORT=8002
  depends_on:
    - mysql
```

### Menjalankan Seeder di Docker

```bash
# Setelah container running
docker exec -it product-service npm run seed
```

### Monitoring Logs

```bash
# Lihat logs
docker logs product-service

# Follow logs real-time
docker logs -f product-service

# Last 50 lines
docker logs product-service --tail 50
```

## 🧪 Testing

### Testing Flow Lengkap

#### 1. Register Admin (Auth Service)

```bash
curl -X POST http://localhost:8001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin Test\",\"email\":\"admin@test.com\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

**Response:** Copy `token` dari response

#### 2. Create Category

```bash
curl -X POST http://localhost:8002/api/categories ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <YOUR_TOKEN>" ^
  -d "{\"name\":\"Test Category\",\"description\":\"Category untuk testing\"}"
```

#### 3. Create Product

```bash
curl -X POST http://localhost:8002/api/products ^
  -H "Authorization: Bearer <YOUR_TOKEN>" ^
  -F "name=Produk Test" ^
  -F "sku=TEST-001" ^
  -F "price=50000" ^
  -F "categoryId=1" ^
  -F "stock=100" ^
  -F "description=Deskripsi produk test"
```

#### 4. Get Products (Public)

```bash
curl http://localhost:8002/api/products
```

#### 5. Update Stock

```bash
curl -X POST http://localhost:8002/api/inventory/update-stock ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <YOUR_TOKEN>" ^
  -d "{\"productId\":1,\"quantity\":50,\"type\":\"in\",\"description\":\"Restock\"}"
```

#### 6. Check Low Stock

```bash
curl -H "Authorization: Bearer <YOUR_TOKEN>" ^
  http://localhost:8002/api/inventory/low-stock
```

### Testing dengan Seeder Data

Setelah menjalankan seeder:

```bash
# Get all products with pagination
curl "http://localhost:8002/api/products?page=1&limit=10"

# Search products
curl "http://localhost:8002/api/products?search=semen"

# Filter by category
curl "http://localhost:8002/api/products?categoryId=1"

# Get featured products
curl "http://localhost:8002/api/products?isFeatured=true"

# Get all categories
curl "http://localhost:8002/api/categories"

# Get category detail with products
curl "http://localhost:8002/api/categories/1"
```

## 📁 Struktur Folder

```
product-service/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.js                    # Main seeder file
│   ├── seeders/
│   │   ├── categorySeeder.js      # 20 kategori
│   │   └── productSeeder.js       # 50 produk
│   │   └── inventorySeeder.js     # Inventory seeder
│   └── migrations/
│       └── 20251022182011_init/   # Initial migration
├── src/
│   ├── app.js                     # Express app setup
│   ├── config/
│   │   └── prisma.js              # Prisma client instance
│   ├── controllers/
│   │   ├── categoryController.js  # Category CRUD logic
│   │   ├── productController.js   # Product CRUD logic
│   │   └── inventoryController.js # Inventory management
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── roleMiddleware.js      # Role-based access
│   │   └── uploadMiddleware.js    # Multer configuration
│   ├── routes/
│   │   ├── categoryRoutes.js      # Category endpoints
│   │   ├── productRoutes.js       # Product endpoints
│   │   ├── inventoryRoutes.js     # Inventory endpoints
│   │   └── healthRoutes.js        # Health check
│   └── utils/
│       ├── imageHandler.js        # Image upload/delete helpers
│       ├── pagination.js          # Pagination helper
│       └── validation.js          # Joi validation schemas
├── uploads/
│   └── products/                  # Uploaded product images
├── index.js                       # Entry point
├── package.json                   # Dependencies
├── Dockerfile                     # Docker build instructions
├── docker-entrypoint.sh           # Auto-migration script
├── .env                           # Environment variables
└── README.md                      # Documentation
```

## 🔧 Troubleshooting

### Issue: Migration Error

```bash
# Reset database
docker exec -it product-service npx prisma migrate reset

# Re-run migration
docker exec -it product-service npx prisma migrate deploy
```

### Issue: JWT Invalid

Pastikan `JWT_SECRET` di product-service sama dengan auth-service:

```bash
# Check JWT_SECRET
docker exec auth-service printenv JWT_SECRET
docker exec product-service printenv JWT_SECRET
```

### Issue: Upload Folder Permission

```bash
# Fix permission
docker exec -it product-service chmod -R 777 /app/uploads
```

### Issue: Prisma Client Not Generated

```bash
docker exec -it product-service npx prisma generate
```
