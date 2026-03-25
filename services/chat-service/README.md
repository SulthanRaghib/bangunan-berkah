# 💬 Chat Service

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Status](https://img.shields.io/badge/Service-Basic_Ready-blue?style=for-the-badge)

</div>

Chat Service saat ini berfungsi sebagai service dasar (bootstrap) untuk domain chat: menyediakan endpoint root dan Swagger JSON placeholder yang sudah terintegrasi ke gateway.

---

## ✨ Kapabilitas Saat Ini

- Basic Express service + logging + CORS.
- Root endpoint untuk health/info singkat.
- Swagger JSON endpoint untuk agregasi docs di API Gateway.
- Siap dikembangkan ke fitur chat conversation/message berikutnya.

---

## 🧱 Teknologi

- Node.js + Express
- morgan
- cors
- dotenv

---

## ⚙️ Environment Variables

```bash
cp .env.example .env
```

```env
PORT=8003
SERVICE_NAME=chat-service
NODE_ENV=development
```

> Catatan: file `.env.example` lama berisi `DATABASE_URL` format MySQL, namun implementasi saat ini belum memakai database aktif di kode.

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

## 📡 Endpoint

Base URL: `http://localhost:8003`

- `GET /` → status service
- `GET /api/chat/api-docs.json` → Swagger JSON placeholder

---

## 📘 Integrasi Gateway

Service ini diproxy oleh API Gateway pada path:

- `/api/chat/*` → `chat-service:8003`

---

<div align="center">
  <sub>© 2026 Sulthan Raghib Fillah</sub>
</div>
