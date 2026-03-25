const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Review Service API",
            version: "1.0.0",
            description: `Layanan Review, Testimoni & Q&A untuk PT Solusi Bangunan Berkah

## 🌟 Fitur Utama

### 1️⃣ Project Reviews (Rating Proyek)
- Customer memberikan rating & review setelah proyek selesai
- **Tidak perlu login** - hanya input project code
- Rating: 1-5 stars dengan comment dan foto
- Satu review per project (unique)
- Public view untuk semua reviews

### 2️⃣ Testimonials (Testimoni Perusahaan)
- Testimoni umum dari pelanggan tentang perusahaan
- **Tidak perlu login** - submit sebagai tamu
- Dilengkapi: nama, email, perusahaan, posisi, rating (1-5)
- Admin approval workflow (hanya approved yang ditampilkan)
- Admin dapat mengelola semua testimoni

### 3️⃣ Customer Q&A (Tanya Jawab)
- Pelanggan dapat bertanya tanpa login
- Admin menjawab melalui admin endpoints
- Hanya answered questions yang tampil di public
- Admin dapat manage semua pertanyaan

---

## 🔐 Authentication & Authorization

### Public Endpoints (✅ Tanpa Auth)
- \`POST /api/reviews\` - Submit project review
- \`GET /api/reviews/:projectCode\` - Get review untuk project
- \`POST /api/testimonials\` - Submit testimonial
- \`GET /api/testimonials\` - Lihat approved testimonials
- \`POST /api/qa\` - Submit pertanyaan
- \`GET /api/qa\` - Lihat answered questions

### Admin Endpoints (🔐 Butuh JWT Token + Admin Role)
- Semua endpoints \`/admin/*\` untuk testimonials
- Semua endpoints \`/admin/*\` untuk Q&A
- Gunakan token dari **Auth Service** (http://localhost:8001/api-docs)

### Test Credentials (Login di Auth Service):
- **Admin:** admin@solusi-bangunan.com / admin123
- **User:** user@solusi-bangunan.com / user123

---

## 📋 Workflow

### Review Flow:
1. Customer kunjungi halaman review dengan project code
2. Input: nama, email, rating, comment, optional photos
3. Sistem validasi: apakah project sudah completed
4. Review tersimpan dan langsung visible

### Testimonial Flow:
1. Customer submit testimonial form
2. Testimoni masuk dengan status \`isApproved: false\`
3. Admin review & approve di admin dashboard
4. Public hanya melihat approved testimonial

### Q&A Flow:
1. Customer submit pertanyaan
2. Pertanyaan masuk dengan status \`open\`
3. Admin jawab melalui admin endpoint
4. Status otomatis jadi \`answered\`
5. Public melihat pertanyaan yang sudah dijawab
`,
            contact: {
                name: "PT Solusi Bangunan Berkah",
                email: "admin@solusi-bangunan.com",
            },
        },
        servers: [
            {
                url: "http://localhost:8005",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT token dari Auth Service (http://localhost:8001/api-docs)",
                },
            },
            schemas: {
                Review: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "673e1234abcd5678ef901234",
                        },
                        projectCode: {
                            type: "string",
                            example: "PRJ-2026-001",
                        },
                        customerName: {
                            type: "string",
                            example: "Budi Santoso",
                        },
                        customerEmail: {
                            type: "string",
                            format: "email",
                            example: "budi@example.com",
                        },
                        rating: {
                            type: "integer",
                            minimum: 1,
                            maximum: 5,
                            example: 5,
                        },
                        comment: {
                            type: "string",
                            example: "Tim profesional, hasil memuaskan, tepat waktu dan sesuai budget!",
                        },
                        photos: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: ["photo1_url", "photo2_url"],
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-03-25T10:30:00.000Z",
                        },
                    },
                },
                Testimonial: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "673e5678abcd1234ef905678",
                        },
                        name: {
                            type: "string",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                        company: {
                            type: "string",
                            example: "PT Maju Jaya",
                        },
                        position: {
                            type: "string",
                            example: "Project Manager",
                        },
                        testimonialText: {
                            type: "string",
                            example: "Layanan Bangunan Berkah sangat profesional dan responsif. Hasil kerja melampaui ekspektasi!",
                        },
                        rating: {
                            type: "integer",
                            minimum: 1,
                            maximum: 5,
                            example: 5,
                        },
                        photos: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: [],
                        },
                        isApproved: {
                            type: "boolean",
                            example: true,
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-03-25T10:30:00.000Z",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-03-25T10:30:00.000Z",
                        },
                    },
                },
                QA: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "673e9012abcd5678ef909012",
                        },
                        customerName: {
                            type: "string",
                            example: "Jane Doe",
                        },
                        customerEmail: {
                            type: "string",
                            format: "email",
                            example: "jane@example.com",
                        },
                        question: {
                            type: "string",
                            example: "Berapa biaya untuk renovasi rumah ukuran 200m2?",
                        },
                        answer: {
                            type: "string",
                            example: "Biaya tergantung material dan detail desain. Silakan hubungi sales kami untuk konsultasi.",
                        },
                        status: {
                            type: "string",
                            enum: ["open", "answered"],
                            example: "answered",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-03-25T10:30:00.000Z",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-03-25T10:30:00.000Z",
                        },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false,
                        },
                        message: {
                            type: "string",
                            example: "Terjadi kesalahan saat memproses permintaan Anda",
                        },
                        error: {
                            type: "string",
                            example: "Detail informasi kesalahan akan ditampilkan di sini",
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
