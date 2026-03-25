# 📦 Product Service

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.x-blue?style=for-the-badge&logo=prisma)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb)
![Multer](https://img.shields.io/badge/File_Upload-Multer-yellow?style=for-the-badge)

</div>

Product Service menangani domain katalog produk, kategori, inventori, dan histori stok.

---

## ✨ Fitur Utama

- CRUD kategori produk.
- CRUD produk + upload multi-image (`max 5`).
- Produk featured & active toggle.
- Inventori terpusat + low stock monitoring.
- Riwayat stok per produk.
- Public endpoint untuk katalog, endpoint admin untuk mutasi data.

---

## 🧱 Teknologi

- Node.js + Express
- Prisma Client (`provider = mongodb`)
- MongoDB
- Multer
- Joi
- JWT middleware (integrasi auth-service)

---

## 📂 Struktur Folder

```bash
product-service/
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── seeders/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   └── utils/
├── uploads/
├── docker-entrypoint.sh
├── Dockerfile
├── package.json
└── server.js
```

---

## ⚙️ Environment Variables

```bash
cp .env.example .env
```

Minimum konfigurasi:

```env
PORT=8002
SERVICE_NAME=product-service
NODE_ENV=development

DATABASE_URL=mongodb://admin:password@mongodb:27017/product_db?authSource=admin
JWT_SECRET=replace_with_same_secret_as_auth
```

> Catatan: `schema.prisma` menggunakan MongoDB. Jika `.env.example` lama masih berisi format MySQL, sesuaikan ke MongoDB.

---

## 🚀 Menjalankan Service

```bash
npm install
npm run prisma:generate
npm run prisma:seed   # opsional
npm run dev
```

Mode production:

```bash
npm run start:prod
```

---

## 📡 Endpoint Utama

Base URL: `http://localhost:8002`

### Public

- `GET /health`
- `GET /ready`
- `GET /live`
- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/slug/:slug`
- `GET /api/products/:id`
- `GET /api/categories`
- `GET /api/categories/:id`

### Protected (JWT)

#### Kategori (admin)

- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

#### Produk (admin)

- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `PATCH /api/products/:id/featured`
- `PATCH /api/products/:id/active`

#### Inventori

- `GET /api/inventory/:productId` (JWT)
- `GET /api/inventory/history/:productId` (JWT)
- `GET /api/inventory` (admin)
- `GET /api/inventory/low-stock` (admin)
- `POST /api/inventory/update-stock` (admin)
- `PUT /api/inventory/:productId` (admin)

---

## 📘 Dokumentasi API

- Swagger JSON: `http://localhost:8002/api/products/api-docs.json`

---

## 🧪 Contoh Request

### Ambil Produk

```http
GET /api/products?page=1&limit=10
```

### Create Produk (admin)

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form-data contoh:

- `name`, `sku`, `price`, `categoryId`, `stock`
- `images` (file)

---

<div align="center">
  <sub>© 2026 Sulthan Raghib Fillah</sub>
</div>
