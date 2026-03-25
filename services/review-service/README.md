# ⭐ Review Service

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.x-blue?style=for-the-badge&logo=prisma)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb)

</div>

Review Service menangani review proyek oleh user terautentikasi, sekaligus verifikasi status proyek ke `project-service` sebelum review dapat dibuat.

---

## ✨ Fitur Utama

- Create review untuk project tertentu.
- 1 review per `projectCode`.
- Verifikasi project harus `completed` via API internal project-service.
- Endpoint public untuk membaca review berdasarkan `projectCode`.
- Swagger UI + health endpoint.

---

## 🧱 Teknologi

- Node.js + Express
- Prisma Client (`provider = mongodb`)
- MongoDB
- Axios (komunikasi antar service)
- JWT middleware
- Joi

---

## 📂 Struktur Folder

```bash
review-service/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   └── utils/
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
PORT=8005
SERVICE_NAME=review-service
NODE_ENV=development

DATABASE_URL=mongodb://admin:password@mongodb:27017/review_db?authSource=admin
JWT_SECRET=replace_with_same_secret_as_auth
PROJECT_SERVICE_URL=http://project-service:8004
```

---

## 🚀 Menjalankan Service

```bash
npm install
npm run dev
```

Mode production:

```bash
npm start
```

---

## 📡 Endpoint Utama

Base URL: `http://localhost:8005`

- `POST /api/reviews` (JWT required)
- `GET /api/reviews/:projectCode` (public)
- `GET /health`

---

## 📘 Dokumentasi API

- Swagger UI: `http://localhost:8005/api-docs`
- Swagger JSON: `http://localhost:8005/api/reviews/api-docs.json`

---

## 🧪 Contoh Request

### Create Review

```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectCode": "PRJ-2026-001",
  "rating": 5,
  "comment": "Hasil proyek sangat memuaskan"
}
```

### Get Review by Project

```http
GET /api/reviews/PRJ-2026-001
```

---

<div align="center">
  <sub>© 2026 Sulthan Raghib Fillah</sub>
</div>
