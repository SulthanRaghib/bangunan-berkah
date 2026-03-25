const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Project Service API",
            version: "1.0.0",
            description: `Layanan Manajemen Proyek Konstruksi untuk PT Solusi Bangunan Berkah

## 🏗️ Fitur Utama

### 1️⃣ Manajemen Proyek
- Buat, lihat, update, dan hapus proyek konstruksi
- Track progress dengan persentase completion
- Manage milestone dan deliverable per proyek
- Status tracking: planning, in_progress, completed, on_hold, cancelled
- Budget management dan cost tracking

### 2️⃣ Milestone & Progress Tracking
- Buat milestone (tahapan) dalam proyek
- Track progress setiap milestone
- Automated calculation progress proyek dari milestone
- Historical tracking untuk perubahan status

### 3️⃣ Document Management
- Upload dokumen kontrak, proposal, spesifikasi
- Organize dokumen per kategori dan proyek
- File management dengan size tracking
- Organized folder structure (contracts/, documents/, photos/)

### 4️⃣ Photo/Visual Documentation
- Upload progress photos dari lapangan
- Gallery per proyek untuk dokumentasi visual
- Before-after comparison untuk tracking perubahan
- Timestamped records untuk setiap foto

### 5️⃣ Public Tracking (Transparent untuk Klien)
- Public endpoint untuk klien track progress proyek mereka
- Summary view tanpa login (optional untuk transparency)
- Project code based tracking untuk akses public

---

## 🔐 Aturan Akses & Autentikasi

### ✅ Public Endpoints (Tidak perlu login)
- \`GET /api/projects/track/:projectCode\` - Client tracking progress
- \`GET /api/projects/summary/:projectCode\` - Client lihat summary
- Klien bisa track proyek mereka dengan project code

### 🔒 Protected Endpoints - Admin Only
Semua CRUD operations membutuhkan:
- **JWT Token** dari Auth Service
- **Role: admin** (diverifikasi oleh roleMiddleware)

**Endpoints yang Protected:**
- \`GET /api/projects\` - Admin lihat semua proyek
- \`POST /api/projects\` - Admin buat proyek baru
- \`GET /api/projects/:id\` - Admin lihat detail proyek
- \`PUT /api/projects/:id\` - Admin update proyek
- \`DELETE /api/projects/:id\` - Admin hapus proyek
- Semua milestone, documents, photos endpoints (CRUD)
- Dashboard & statistics endpoints
- Activity logs & tracking endpoints

---

## 🔐 Cara Menggunakan Service Ini

### ✅ Opsi 1: Auto-Fill Token dari Auth Service (RECOMMENDED)
1. Login di **Auth Service** terlebih dahulu: \`http://localhost:8001/api-docs\`
2. Gunakan credentials:
   - **Admin:** admin@solusi-bangunan.com / admin123
3. Klik endpoint **POST /api/auth/login**
4. Setelah login, **token OTOMATIS terisi** di Swagger UI
5. Kembali ke Project Service di \`http://localhost:8004/api-docs\`
6. ✅ Token sudah tersimpan dan siap digunakan (auto-include di semua protected request)

### ⚙️ Opsi 2: Manual Authorize Jika Diperlukan
1. Copy \`accessToken\` dari response auth login
2. Klik tombol **Authorize** 🔓 di bagian atas
3. Paste token ke field
4. Klik "Authorize" lalu "Close"

### 🔗 Opsi 3: Gunakan di Code / Postman
\`\`\`
Authorization: Bearer {accessToken}
\`\`\`

---

## 📊 Struktur Data Utama

### Project
- **projectCode** (required): Kode unik proyek (contoh: PRJ-2025-001)
- **name** (required): Nama proyek
- **clientName** (required): Nama klien yang memesan
- **location** (required): Lokasi proyek
- **status**: planning, in_progress, completed, on_hold, cancelled
- **budget**: Total budget proyek
- **progress**: Persentase completion (0-100)
- **startDate**: Tanggal mulai proyek
- **endDate**: Tanggal target selesai

### Milestone
- **name**: Fase pekerjaan (contoh: Pondasi, Struktur, Arsitektur)
- **description**: Detail work scope
- **status**: pending, in_progress, completed
- **progress**: Persentase milestone completion
- **targetDate**: Target selesai fase ini

### Document
- **name**: Nama file
- **type**: contract, proposal, specification, other
- **documentUrl**: Path ke file
- **uploadedBy**: Siapa yang upload
- **createdAt**: Tanggal upload

---

## 🔄 Workflow Proyek

1. **Planning Phase**: Admin buat proyek baru dengan milestone
2. **In Progress**: Update milestone progress saat pekerjaan berlangsung
3. **Documentation**: Upload foto dan dokumen untuk tracking
4. **Monitoring**: Client bisa lihat progress via public endpoint
5. **Completion**: Finalize proyek dan update status jadi completed

---

## 📝 Test Data & Credentials

### Admin Credentials (untuk CRUD operations)
| Email | Password | Role |
|:---|:---|:---|
| admin@solusi-bangunan.com | admin123 | Admin |

### Sample Project Codes (untuk public tracking tanpa login)
- PRJ-2025-001
- PRJ-2025-002
- PRJ-2024-087

---

## 🗂️ File Organization

\`\`\`
services/project-service/uploads/
├── contracts/     (Dokumen kontrak & legal)
├── documents/     (Spesifikasi, proposal, sketsa)
└── photos/        (Progress & site photos)
\`\`\`

---

## 🔗 Service Dependencies
- **Auth Service** (Port 8001): Untuk JWT token verification
- **API Gateway** (Port 8080): Entry point ke service ini
- **MongoDB**: Database untuk store project data
- Shared Middlewares: authMiddleware, roleMiddleware, uploadMiddleware

---

## ⚠️ Important Notes
- **JANGAN** ubah project code setelah dibuat (primary identifier)
- Project progress otomatis calculated dari semua milestone
- Hapus proyek = soft delete (archive, bukan permanent delete)
- Public tracking API untuk client transparency
- Admin HARUS ada token valid untuk akses
`,
            contact: {
                name: "PT Solusi Bangunan Berkah",
                email: "admin@solusi-bangunan.com",
            },
        },
        servers: [
            {
                url: "http://localhost:8004",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT access token dari endpoint POST /api/auth/login (lihat Auth Service di http://localhost:8001/api-docs)",
                },
            },
            schemas: {
                Project: {
                    type: "object",
                    required: ["projectCode", "name", "clientName", "location"],
                    properties: {
                        _id: {
                            type: "string",
                            example: "673e1234abcd5678ef901234",
                            description: "MongoDB ObjectId unik untuk proyek",
                        },
                        projectCode: {
                            type: "string",
                            example: "PRJ-2025-001",
                            description: "Kode proyek unik (immutable, tidak bisa diubah setelah dibuat)",
                        },
                        name: {
                            type: "string",
                            example: "Pembangunan Rumah Tinggal Tipe 45",
                            description: "Nama proyek yang deskriptif",
                        },
                        description: {
                            type: "string",
                            example: "Proyek pembangunan rumah tinggal dengan desain modern di lokasi premium",
                            description: "Deskripsi detail proyek dan scope pekerjaan",
                        },
                        clientName: {
                            type: "string",
                            example: "PT Budi Santoso",
                            description: "Nama klien/customer yang memesan proyek",
                        },
                        location: {
                            type: "string",
                            example: "Jl. Senayan No. 45, Jakarta Selatan",
                            description: "Alamat lokasi proyek",
                        },
                        startDate: {
                            type: "string",
                            format: "date-time",
                            example: "2025-01-15T00:00:00.000Z",
                            description: "Tanggal mulai pekerjaan konstruksi",
                        },
                        endDate: {
                            type: "string",
                            format: "date-time",
                            example: "2025-06-15T00:00:00.000Z",
                            description: "Tanggal target selesai proyek",
                        },
                        status: {
                            type: "string",
                            enum: ["planning", "in_progress", "completed", "on_hold", "cancelled"],
                            example: "in_progress",
                            description: "Status proyesi: planning (belum mulai), in_progress (sedang berjalan), completed (selesai), on_hold (ditunda), cancelled (dibatalkan)",
                        },
                        budget: {
                            type: "number",
                            example: 500000000,
                            description: "Total budget proyek dalam Rupiah (nominal)",
                        },
                        progress: {
                            type: "number",
                            minimum: 0,
                            maximum: 100,
                            example: 45.5,
                            description: "Persentase completion proyek (0-100), auto-calculated dari milestone progress",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Tanggal proyek dibuat di sistem",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Tanggal update terakhir pada proyek",
                        },
                    },
                },
                Milestone: {
                    type: "object",
                    required: ["name", "targetDate"],
                    properties: {
                        _id: {
                            type: "string",
                            example: "673e5678abcd1234ef905678",
                            description: "MongoDB ObjectId unik untuk milestone",
                        },
                        projectId: {
                            type: "string",
                            example: "673e1234abcd5678ef901234",
                            description: "Reference ke proyek parent",
                        },
                        name: {
                            type: "string",
                            example: "Pondasi & Struktur Bawah",
                            description: "Nama fase/tahapan pekerjaan (contoh: Pondasi, Struktur, Arsitektur, Finishing)",
                        },
                        description: {
                            type: "string",
                            example: "Pekerjaan penggalian, pondasi, dan struktur beton bawah tanah",
                            description: "Detail scope pekerjaan dalam milestone ini",
                        },
                        targetDate: {
                            type: "string",
                            format: "date-time",
                            example: "2025-02-15T00:00:00.000Z",
                            description: "Target selesai fase ini",
                        },
                        progress: {
                            type: "number",
                            minimum: 0,
                            maximum: 100,
                            example: 75.0,
                            description: "Persentase completion milestone (0-100)",
                        },
                        status: {
                            type: "string",
                            enum: ["pending", "in_progress", "completed"],
                            example: "in_progress",
                            description: "Status milestone: pending (belum dimulai), in_progress (sedang dikerjakan), completed (selesai)",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Tanggal milestone dibuat",
                        },
                    },
                },
                Document: {
                    type: "object",
                    required: ["name", "type"],
                    properties: {
                        _id: {
                            type: "string",
                            example: "673e7890abcd1234ef907890",
                            description: "MongoDB ObjectId unik untuk dokumen",
                        },
                        projectId: {
                            type: "string",
                            example: "673e1234abcd5678ef901234",
                            description: "Reference ke proyek yang memiliki dokumen",
                        },
                        name: {
                            type: "string",
                            example: "Kontrak Pekerjaan Final.pdf",
                            description: "Nama file dokumen",
                        },
                        type: {
                            type: "string",
                            enum: ["contract", "proposal", "specification", "other"],
                            example: "contract",
                            description: "Kategori dokumen: contract (kontrak), proposal (penawaran), specification (spesifikasi teknis), other (lainnya)",
                        },
                        documentUrl: {
                            type: "string",
                            example: "/uploads/contracts/PRJ-2025-001-contract.pdf",
                            description: "Path relatif ke file yang di-upload",
                        },
                        uploadedBy: {
                            type: "string",
                            example: "admin@solusi-bangunan.com",
                            description: "Email user yang melakukan upload",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Tanggal file di-upload",
                        },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    required: ["success", "message"],
                    properties: {
                        success: {
                            type: "boolean",
                            example: false,
                            description: "Status operasi gagal",
                        },
                        message: {
                            type: "string",
                            example: "Proyek dengan kode ini sudah ada",
                            description: "Penjelasan detail tentang error yang terjadi",
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
