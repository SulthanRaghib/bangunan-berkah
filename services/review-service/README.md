# ⭐ Review Service

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.x-blue?style=for-the-badge&logo=prisma)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb)

</div>

Review Service menangani tiga fitur utama:

1. **Project Reviews** - Review proyek oleh user terautentikasi dengan verifikasi status proyek
2. **Testimonials** - Testimoni umum dari pelanggan (tanpa login yang diperlukan)
3. **Customer Q&A** - Pertanyaan dan jawaban dari pelanggan

---

## ✨ Fitur Utama

### 1. Project Reviews

- Create review untuk project tertentu (auth required)
- 1 review per `projectCode`
- Verifikasi project harus `completed` via API internal project-service
- Public endpoint untuk membaca review berdasarkan `projectCode`

### 2. Testimonials (Non-Project)

- Penerima testimoni dari pelanggan tanpa login yang diperlukan
- Support untuk nama, email, perusahaan, posisi, dan foto
- Rating 1-5
- Admin dapat mengelola (CRUD) dan menyetujui testimonial
- Hanya testimonial yang disetujui yang ditampilkan di frontend

### 3. Customer Q&A

- Pelanggan dapat mengajukan pertanyaan tanpa login
- Admin dapat menjawab pertanyaan
- Hanya pertanyaan yang telah dijawab ditampilkan ke publik
- Admin dapat menghapus atau menutup pertanyaan

---

## 🧱 Teknologi

- Node.js + Express
- Prisma Client (`provider = mongodb`)
- MongoDB
- Axios (komunikasi antar service)
- JWT middleware (untuk admin endpoints)
- Joi (validasi input)

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
│   │   ├── reviewController.js
│   │   ├── testimonialController.js
│   │   └── qaController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── routes/
│   │   ├── reviewRoutes.js
│   │   ├── testimonialRoutes.js
│   │   └── qaRoutes.js
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

### Project Reviews

- `POST /api/reviews` (JWT required) - Create review
- `GET /api/reviews/:projectCode` (public) - Get reviews for project

### Testimonials

- `POST /api/testimonials` (public) - Submit testimonial
- `GET /api/testimonials` (public) - List approved testimonials
- `GET /api/testimonials/admin/all` (admin) - List all testimonials
- `GET /api/testimonials/admin/:id` (admin) - Get single testimonial
- `PUT /api/testimonials/admin/:id` (admin) - Update testimonial
- `DELETE /api/testimonials/admin/:id` (admin) - Delete testimonial
- `PATCH /api/testimonials/admin/:id/approve` (admin) - Approve/reject testimonial

### Customer Q&A

- `POST /api/qa` (public) - Submit question
- `GET /api/qa` (public) - List answered questions
- `GET /api/qa/admin/all` (admin) - List all questions
- `GET /api/qa/admin/:id` (admin) - Get single question
- `PATCH /api/qa/admin/:id/answer` (admin) - Answer question
- `DELETE /api/qa/admin/:id` (admin) - Delete question

### Utilities

- `GET /health` - Health check

---

## 📘 Dokumentasi API

- Swagger UI: `http://localhost:8005/api-docs`
- Swagger JSON: `http://localhost:8005/api/reviews/api-docs.json`

---

## 🧪 Contoh Request

### Project Review - Create

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

### Project Review - Get

```http
GET /api/reviews/PRJ-2026-001
```

### Testimonial - Submit

```http
POST /api/testimonials
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "PT Maju Jaya",
  "position": "Project Manager",
  "testimonialText": "Layanan Bangunan Berkah sangat profesional dan hasil kerjanya memuaskan",
  "rating": 5,
  "photos": ["photo1_base64", "photo2_base64"]
}
```

### Testimonial - Get Approved

```http
GET /api/testimonials?page=1&limit=10
```

### Testimonial - Approve (Admin)

```http
PATCH /api/testimonials/admin/{id}/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isApproved": true
}
```

### Q&A - Ask Question

```http
POST /api/qa
Content-Type: application/json

{
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "question": "Berapa biaya untuk renovasi rumah dengan luas 200m2?"
}
```

### Q&A - Get Answered

```http
GET /api/qa?page=1&limit=10
```

### Q&A - Answer Question (Admin)

```http
PATCH /api/qa/admin/{id}/answer
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "answer": "Biaya tergantung pada detail desain dan material yang digunakan. Silahkan hubungi sales kami untuk konsultasi lebih lanjut."
}
```

---

## 🔒 Role-Based Access Control

- **Public endpoints** - Tanpa autentikasi
- **Admin endpoints** - Memerlukan JWT token dengan role `admin`

Admin dapat:

- Approve/reject dan manage testimoni
- Menjawab dan manage pertanyaan dari pelanggan

---

## 📊 Database Schema

### Review Model

```prisma
model Review {
  id          String
  projectCode String (unique)
  userId      String
  userName    String
  rating      Int (1-5)
  comment     String?
  photos      String[]
  createdAt   DateTime
}
```

### Testimonial Model

```prisma
model Testimonial {
  id              String
  name            String
  email           String
  company         String?
  position        String?
  testimonialText String
  rating          Int (1-5)
  photos          String[]
  isApproved      Boolean (default: false)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### QA Model

```prisma
model QA {
  id            String
  customerName  String
  customerEmail String
  question      String
  answer        String?
  status        String (open/answered)
  createdAt     DateTime
  updatedAt     DateTime
}
```

---

<div align="center">
  <sub>© 2026 Sulthan Raghib Fillah</sub>
</div>
