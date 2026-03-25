# 🏗️ Project Service

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-white?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.x-blue?style=for-the-badge&logo=prisma)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb)
![Swagger](https://img.shields.io/badge/API-Swagger-brightgreen?style=for-the-badge)

</div>

Project Service adalah service inti untuk lifecycle proyek: project CRUD, milestone, progress report, dokumen, dashboard, dan public tracking.

---

## ✨ Fitur Utama

- CRUD proyek dengan kode unik `PRJ-YYYY-XXX`.
- Milestone management (add/update/delete/list).
- Weekly progress report dengan upload foto.
- Public tracking (`/track/:projectCode`, `/summary/:projectCode`).
- Dokumen proyek (upload/list/delete).
- Dashboard statistik dan activity log.

---

## 🧠 Logika Progress Saat Ini

Sistem saat ini memiliki dua sumber update `project.progress`:

1. **Milestone Flow**
   - Endpoint: create/update/delete milestone.
   - Progress dihitung sebagai rata-rata progress milestone.

2. **Weekly Report Flow**
   - Endpoint: `POST /api/projects/:projectCode/progress`.
   - Progress di-set langsung dari nilai report.

Gunakan satu sumber sebagai _single source of truth_ jika ingin konsistensi yang ketat.

---

## 🧱 Teknologi

- Node.js + Express
- Prisma Client (`provider = mongodb`)
- MongoDB
- Multer (document/photos upload)
- Joi + JWT middleware
- Swagger UI + auto token fill script

---

## 📂 Struktur Folder

```bash
project-service/
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
│   ├── services/
│   └── utils/
├── uploads/
│   ├── contracts/
│   ├── documents/
│   └── photos/
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
PORT=8004
SERVICE_NAME=project-service
NODE_ENV=development

DATABASE_URL=mongodb://admin:password@mongodb:27017/project_db?authSource=admin
JWT_SECRET=replace_with_same_secret_as_auth
```

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

Base URL: `http://localhost:8004`

### Public Tracking

- `GET /api/projects/track/:projectCode`
- `GET /api/projects/summary/:projectCode`

### Projects (admin)

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:projectCode`
- `PUT /api/projects/:projectCode`
- `DELETE /api/projects/:projectCode`
- `PATCH /api/projects/:projectCode/status`
- `POST /api/projects/:projectCode/progress`

### Milestones (admin)

- `POST /api/projects/:projectCode/milestones`
- `GET /api/projects/:projectCode/milestones`
- `PATCH /api/projects/:projectCode/milestones/:milestoneId`
- `DELETE /api/projects/:projectCode/milestones/:milestoneId`

### Documents (admin)

- `POST /api/:projectCode/documents`
- `GET /api/:projectCode/documents`
- `DELETE /api/:projectCode/documents/:documentId`

### Dashboard (admin)

- `GET /api/dashboard/stats`
- `GET /api/dashboard/activities/:projectCode`

### Health

- `GET /api/health/health`
- `GET /api/health/ready`
- `GET /api/health/live`

---

## 📘 Dokumentasi API

- Swagger UI: `http://localhost:8004/api-docs`
- Swagger JSON: `http://localhost:8004/api/projects/api-docs.json`

---

## 🧪 Contoh Request

### Public Tracking

```http
GET /api/projects/track/PRJ-2026-001
```

### Tambah Milestone (admin)

```http
POST /api/projects/PRJ-2026-001/milestones
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pondasi",
  "targetDate": "2026-05-15",
  "progress": 0
}
```

---

<div align="center">
  <sub>© 2026 Sulthan Raghib Fillah</sub>
</div>
