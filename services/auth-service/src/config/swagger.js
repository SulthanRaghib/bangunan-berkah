const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Auth Service API",
            version: "1.0.0",
            description: `Authentication and User Management Service for PT Solusi Bangunan Berkah
                ## 🔐 Cara Menggunakan Authentication:

                ### Opsi 1: Auto-Fill Token (Recommended)
                1. Buka endpoint **POST /api/auth/login**
                2. Klik "Try it out"
                3. Masukkan credentials (contoh: admin@solusi-bangunan.com / admin123)
                4. Klik "Execute"
                5. ✅ **Token akan otomatis terisi!** Anda akan melihat alert konfirmasi
                6. Sekarang Anda bisa menggunakan semua protected endpoints

                ### Opsi 2: Manual Authorization
                1. Login terlebih dahulu di endpoint **POST /api/auth/login**
                2. Copy \`accessToken\` dari response
                3. Klik tombol **Authorize** 🔓 di bagian atas
                4. Paste token (tanpa prefix "Bearer")
                5. Klik "Authorize" dan "Close"

                ### Test Credentials:
                - **Admin:** admin@solusi-bangunan.com / admin123
                - **User:** user@solusi-bangunan.com / user123
                `,
            contact: {
                name: "PT Solusi Bangunan Berkah",
                email: "admin@solusi-bangunan.com",
            },
        },
        servers: [
            {
                url: "http://localhost:8001",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "691ef08ae6f9bf4be4f77d1b",
                        },
                        name: {
                            type: "string",
                            example: "John Doe",
                        },
                        email: {
                            type: "string",
                            example: "john@example.com",
                        },
                        role: {
                            type: "string",
                            enum: ["admin", "user"],
                            example: "user",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-11-20T11:08:58.887Z",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-11-20T17:29:20.308Z",
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
    apis: ["./src/routes/*.js"], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
