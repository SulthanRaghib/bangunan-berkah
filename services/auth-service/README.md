# 🔐 Auth Service

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.19-white?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.x-blue?style=for-the-badge&logo=prisma)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)

</div>

Auth Service menangani autentikasi, otorisasi, dan manajemen user untuk seluruh ekosistem microservices.

---

## ✨ Fitur Utama

- Registrasi dan login pengguna.
- JWT access token + refresh token.
- Endpoint profile user aktif.
- Manajemen user (list, detail, update, delete).
- Role-based access (`admin`, `user`).
- Health, readiness, dan liveness probe.
- Swagger UI + auto-fill token script untuk testing cepat.

---

## 🧱 Teknologi

- Node.js + Express
- Prisma Client (`provider = mongodb`)
- MongoDB
- Joi (input validation)
- bcryptjs (password hashing)
- jsonwebtoken (token)
- Swagger (swagger-jsdoc + swagger-ui-express)

---

## 📂 Struktur Folder

```bash
auth-service/
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
├── docker-entrypoint.sh
├── Dockerfile
├── package.json
└── server.js
```

---

## ⚙️ Environment Variables

Salin file contoh:

```bash
cp .env.example .env
```

Minimum konfigurasi:

```env
PORT=8001
SERVICE_NAME=auth-service
DATABASE_URL=mongodb://admin:password@mongodb:27017/auth_db?authSource=admin

JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=replace_with_strong_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

NODE_ENV=development
```

> `JWT_SECRET` harus sama di service lain yang melakukan verifikasi token.

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

Base URL: `http://localhost:8001`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout` (butuh token)
- `GET /api/auth/profile` (butuh token)

### User Management

- `GET /api/users` (admin)
- `GET /api/users/:id` (owner/admin)
- `PUT /api/users/:id` (owner/admin)
- `DELETE /api/users/:id` (admin)

### Health

- `GET /health`
- `GET /ready`
- `GET /live`

---

## 📘 Dokumentasi API

- Swagger UI: `http://localhost:8001/api-docs`
- Swagger JSON: `http://localhost:8001/api/auth/api-docs.json`

---

## 🧪 Contoh Request

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Ambil Profile

```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

---

<div align="center">
  <sub>© 2026 Sulthan Raghib Fillah</sub>
</div>
