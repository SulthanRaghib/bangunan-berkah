const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Project Service API",
            version: "1.0.0",
            description: `Project Management Service for PT Solusi Bangunan Berkah
            
            ## 🔐 Cara Menggunakan Authentication:

            ### Auto-Fill Token dari Auth Service
            1. Login di **Auth Service** (http://localhost:8001/api-docs)
            2. Setelah login, copy \`accessToken\` dari response
            3. Kembali ke Project Service Swagger ini
            4. Token akan **otomatis terdeteksi dan terisi** jika Anda sudah login di Auth Service (sama-sama localhost)
            5. Atau klik tombol **Authorize** 🔓 dan paste token manual

            ### Test Credentials (Login di Auth Service):
            - **Admin:** admin@solusi-bangunan.com / admin123
            - **User:** user@solusi-bangunan.com / user123

            ### Public Endpoints (Tanpa Auth):
            - \`GET /api/projects/track/:projectCode\` - Track project progress
            - \`GET /api/projects/summary/:projectCode\` - Get project summary

            ### Protected Endpoints (Butuh Admin Token):
            - Semua CRUD operations untuk projects, milestones, photos, documents
            - Dashboard statistics dan activities
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
                    description: "Masukkan JWT token dari Auth Service (login di http://localhost:8001/api-docs)",
                },
            },
            schemas: {
                Project: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "673e1234abcd5678ef901234",
                        },
                        projectCode: {
                            type: "string",
                            example: "PRJ-2025-001",
                        },
                        name: {
                            type: "string",
                            example: "Pembangunan Rumah Tinggal Tipe 45",
                        },
                        description: {
                            type: "string",
                            example: "Proyek pembangunan rumah tinggal di Jakarta Selatan",
                        },
                        clientName: {
                            type: "string",
                            example: "Budi Santoso",
                        },
                        location: {
                            type: "string",
                            example: "Jakarta Selatan",
                        },
                        startDate: {
                            type: "string",
                            format: "date-time",
                            example: "2025-01-15T00:00:00.000Z",
                        },
                        endDate: {
                            type: "string",
                            format: "date-time",
                            example: "2025-06-15T00:00:00.000Z",
                        },
                        status: {
                            type: "string",
                            enum: ["planning", "in_progress", "completed", "on_hold", "cancelled"],
                            example: "in_progress",
                        },
                        budget: {
                            type: "number",
                            example: 500000000,
                        },
                        progress: {
                            type: "number",
                            example: 45.5,
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                Milestone: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "673e5678abcd1234ef905678",
                        },
                        name: {
                            type: "string",
                            example: "Pondasi",
                        },
                        description: {
                            type: "string",
                            example: "Pekerjaan pondasi dan struktur bawah",
                        },
                        targetDate: {
                            type: "string",
                            format: "date-time",
                            example: "2025-02-15T00:00:00.000Z",
                        },
                        progress: {
                            type: "number",
                            example: 75.0,
                        },
                        status: {
                            type: "string",
                            enum: ["pending", "in_progress", "completed"],
                            example: "in_progress",
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
                            example: "Error message",
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
