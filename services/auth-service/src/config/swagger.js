const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Auth Service API",
            version: "1.0.0",
            description: `Layanan Autentikasi dan Manajemen Pengguna untuk PT Solusi Bangunan Berkah

## 🔐 Fitur Utama

### 1️⃣ Autentikasi Pengguna
- Registrasi pengguna baru dengan email unik
- Login dengan email dan password (password di-hash dengan bcryptjs)
- JWT access token + refresh token untuk session management
- Logout dan invalidate session
- Profile retrieval untuk pengguna yang sedang login

### 2️⃣ Manajemen Pengguna
- **Admin:** Dapat melihat daftar semua pengguna, update/delete user manapun
- **User:** Dapat melihat & edit profil diri sendiri
- Role-based access control (RBAC) dengan role: admin, user
- Tracking tanggal registrasi dan update

---

## 🔐 Cara Menggunakan Service Ini

### ✅ Opsi 1: Auto-Fill Token di Swagger UI (RECOMMENDED)
1. Buka endpoint **POST /api/auth/login**
2. Klik "Try it out"
3. Masukkan credentials:
   - Admin: \`admin@solusi-bangunan.com\` / \`admin123\`
   - User: \`user@solusi-bangunan.com\` / \`user123\`
4. Klik "Execute"
5. ✅ **Token OTOMATIS terisi di Authorize button!** (akan ada alert konfirmasi)
6. Sekarang gunakan protected endpoints (akan auto-include token)

### ⚙️ Opsi 2: Manual Authorization (Jika Auto-Fill Tidak Bekerja)
1. Login dulu ke endpoint **POST /api/auth/login**
2. Copy value dari field \`accessToken\` di response
3. Klik tombol **Authorize** 🔓 di bagian atas Swagger UI
4. Paste token ke field (tanpa prefix "Bearer", sistem auto-add)
5. Klik "Authorize" lalu "Close"
6. Sekarang semua protected endpoint bisa diakses

### 🔗 Opsi 3: Gunakan di Code / Postman
Setiap request ke protected endpoint, tambahkan header:
\`\`\`
Authorization: Bearer {accessToken}
\`\`\`

---

## 📊 Aturan Akses

### ✅ Public Endpoints (Tidak perlu login)
- \`POST /api/auth/register\` - Daftar akun baru
- \`POST /api/auth/login\` - Login untuk mendapat token

### 🔒 Protected Endpoints (Perlu JWT Token)
- \`POST /api/auth/refresh\` - Refresh access token
- \`GET /api/auth/profile\` - Lihat profil diri sendiri
- \`POST /api/auth/logout\` - Logout

### 👨‍💼 Admin Only Endpoints
- \`GET /api/users\` - Lihat daftar semua user
- \`DELETE /api/users/{id}\` - Hapus user
- \`PUT /api/users/{id}\` (limited edit untuk diri sendiri, full edit untuk admin terhadap user lain)

---

## 🔄 Token Lifecycle

### Access Token
- **Durasi:** 24 jam
- **Penggunaan:** Untuk authenticate API request
- **Kadaluarsa:** Perlu refresh dengan refresh token

### Refresh Token  
- **Durasi:** 7 hari (lebih lama dari access token)
- **Penggunaan:** Untuk mendapatkan access token baru tanpa login ulang
- **Endpoint:** POST /api/auth/refresh

### Logout
- Invalidate session dan refresh token
- Harus login ulang untuk mendapat token baru

---

## 📝 Test Credentials

| Role | Email | Password | Akses |
|:---|:---|:---|:---|
| **Admin** | admin@solusi-bangunan.com | admin123 | Semua endpoint |
| **User** | user@solusi-bangunan.com | user123 | Profile & protected endpoints |

---

## 🔗 Service Dependencies
- Standalone service, no dependency ke service lain
- Digunakan oleh semua services untuk authentication
- Auth token di-verify oleh shared authMiddleware
- Database (MongoDB) untuk store user data

---

## ⚠️ Security Notes
- **JANGAN** share JWT token dengan orang lain
- Token akan expire setelah 24 jam, gunakan refresh token
- Password HARUS minimal 6 karakter, recommended dengan uppercase + lowercase + angka
- Reset password belum diimplementasi - gunakan admin untuk update
`,
            contact: {
                name: "PT Solusi Bangunan Berkah",
                email: "admin@solusi-bangunan.com",
            },
        },
        servers: [
            {
                url: "/",
                description: "Current origin (gateway atau direct service)",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT access token dari endpoint POST /api/auth/login",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    required: ["_id", "name", "email", "role"],
                    properties: {
                        _id: {
                            type: "string",
                            example: "691ef08ae6f9bf4be4f77d1b",
                            description: "MongoDB ObjectId unik untuk setiap user",
                        },
                        name: {
                            type: "string",
                            example: "John Doe",
                            description: "Nama lengkap pengguna",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                            description: "Email unik untuk login",
                        },
                        role: {
                            type: "string",
                            enum: ["admin", "user"],
                            example: "user",
                            description: "Role pengguna dalam sistem",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-11-20T11:08:58.887Z",
                            description: "Tanggal pembuatan akun (UTC)",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2025-11-20T17:29:20.308Z",
                            description: "Tanggal update data terakhir (UTC)",
                        },
                    },
                },
                LoginResponse: {
                    type: "object",
                    required: ["success", "message", "data"],
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                            description: "Status operasi berhasil atau gagal",
                        },
                        message: {
                            type: "string",
                            example: "Login berhasil",
                            description: "Pesan status dari server",
                        },
                        data: {
                            type: "object",
                            properties: {
                                user_id: {
                                    type: "string",
                                    example: "691ef08ae6f9bf4be4f77d1b",
                                },
                                accessToken: {
                                    type: "string",
                                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                    description: "JWT access token untuk authenticate request (berlaku 24 jam)",
                                },
                                refreshToken: {
                                    type: "string",
                                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                    description: "Refresh token untuk mendapat access token baru tanpa login ulang (berlaku 7 hari)",
                                },
                                expiresIn: {
                                    type: "string",
                                    example: "24h",
                                    description: "Durasi kedaluwarsa access token",
                                },
                            },
                        },
                    },
                },
                ProfileResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        data: {
                            $ref: "#/components/schemas/User",
                        },
                    },
                },
                Error: {
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
                            example: "Email sudah terdaftar",
                            description: "Penjelasan detail tentang error yang terjadi",
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
