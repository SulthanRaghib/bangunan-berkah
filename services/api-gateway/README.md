# 🚪 API Gateway

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Proxy](https://img.shields.io/badge/http--proxy--middleware-3.x-blue?style=for-the-badge)
![Rate Limit](https://img.shields.io/badge/Rate_Limit-Enabled-red?style=for-the-badge)

</div>

API Gateway adalah pintu masuk tunggal seluruh microservices. Service ini melakukan routing request, rate limiting, hardening keamanan HTTP, verifikasi JWT terpusat, dan agregasi dokumentasi Swagger.

---

## ✨ Fitur Utama

- Reverse proxy ke seluruh service backend.
- Rate limiting global (`100 req / 15 menit`).
- Security headers via `helmet()`.
- CORS whitelist berbasis `FRONTEND_URL`.
- Centralized JWT verification di gateway.
- Forward user context ke downstream via header `x-user-*`.
- Aggregated Swagger UI di `/docs`.
- Health endpoint yang menampilkan mapping service internal.
- Logging request via morgan.

---

## 🧱 Teknologi

- Node.js + Express
- http-proxy-middleware
- express-rate-limit
- helmet
- jsonwebtoken
- swagger-ui-express

---

## ⚙️ Environment Variables

```bash
cp .env.example .env
```

```env
PORT=8080
SERVICE_NAME=api-gateway
NODE_ENV=development

AUTH_SERVICE_URL=http://auth-service:8001
PRODUCT_SERVICE_URL=http://product-service:8002
CHAT_SERVICE_URL=http://chat-service:8003
PROJECT_SERVICE_URL=http://project-service:8004
REVIEW_SERVICE_URL=http://review-service:8005

FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_change_in_production

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_strong_redis_password_here
REDIS_DB=0

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
```

Catatan penting:

- `JWT_SECRET` di gateway harus sama dengan `JWT_SECRET` di `auth-service`.
- `FRONTEND_URL` dipakai untuk whitelist CORS browser.

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

## 🧭 Routing Matrix

- `/api/auth`, `/api/users` → Auth Service
- `/api/products`, `/api/categories`, `/api/inventory` → Product Service
- `/api/chat` → Chat Service
- `/api/projects`, `/api/dashboard`, `/api/milestones` → Project Service
- `/api/reviews` → Review Service

### Public vs Protected Flow

- Public routes (contoh): `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, endpoint health/docs.
- Protected routes: diverifikasi JWT lebih dulu di gateway.
- Jika token valid, gateway menambahkan header berikut ke request proxied:
  - `x-user-id`
  - `x-user-email`
  - `x-user-role`
  - `x-user-token`

Downstream service membaca header tersebut untuk mengisi `req.user` tanpa verifikasi JWT ulang.

---

## 📘 Dokumentasi API

- Gateway docs aggregator: `http://localhost:8080/docs`

Swagger docs akan menggabungkan JSON docs dari masing-masing service.

---

## 🔐 CORS Behavior

- Gateway menggunakan konfigurasi:
  - `origin: FRONTEND_URL || "http://localhost:3000"`
  - `credentials: true`
- Jika request berasal dari browser dengan origin di luar whitelist, browser akan memblokir akses.
- Testing backend tanpa frontend (Postman/cURL/insomnia/server-to-server) tetap bisa dilakukan.

---

## 🧪 Contoh Request

```http
GET /
```

Response akan mengembalikan status gateway dan URL internal tiap service.

---

<div align="center">
  <sub>© 2026 Sulthan Raghib Fillah</sub>
</div>
