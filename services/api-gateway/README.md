# 🚪 API Gateway

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Proxy](https://img.shields.io/badge/http--proxy--middleware-3.x-blue?style=for-the-badge)
![Rate Limit](https://img.shields.io/badge/Rate_Limit-Enabled-red?style=for-the-badge)

</div>

API Gateway adalah pintu masuk tunggal seluruh microservices. Service ini melakukan routing request, rate limiting, dan agregasi dokumentasi Swagger.

---

## ✨ Fitur Utama

- Reverse proxy ke seluruh service backend.
- Rate limiting global (`100 req / 15 menit`).
- Aggregated Swagger UI di `/docs`.
- Health endpoint yang menampilkan mapping service internal.
- Logging request via morgan.

---

## 🧱 Teknologi

- Node.js + Express
- http-proxy-middleware
- express-rate-limit
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

## 🧭 Routing Matrix

- `/api/auth`, `/api/users` → Auth Service
- `/api/products`, `/api/categories`, `/api/inventory` → Product Service
- `/api/chat` → Chat Service
- `/api/projects`, `/api/dashboard`, `/api/milestones` → Project Service
- `/api/reviews` → Review Service

---

## 📘 Dokumentasi API

- Gateway docs aggregator: `http://localhost:8080/docs`

Swagger docs akan menggabungkan JSON docs dari masing-masing service.

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
