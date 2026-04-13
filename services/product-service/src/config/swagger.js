const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Product Service API",
            version: "1.0.0",
            description: `Layanan Manajemen Produk, Kategori, dan Inventori untuk PT Solusi Bangunan Berkah

## 📦 Fitur Utama

### 1️⃣ Manajemen Produk
- **Public:** Pengambilan daftar produk, pencarian, filter featured
- **Admin:** CRUD lengkap dengan multi-image upload (max 5 files)
- Featured product management untuk highlight produk pilihan
- Slug-based URL untuk SEO-friendly

### 2️⃣ Kategori Produk
- CRUD kategori dengan tree structure
- Kategorisasi otomatis untuk organisasi produk
- Hanya admin yang bisa mengelola

### 3️⃣ Tracking Inventori
- Real-time inventory status untuk setiap produk
- Low stock monitoring dan alerts
- History perubahan stok untuk auditing
- Admin only visibility

---

## 🔐 Aturan Akses

### ✅ Public Endpoints (Tanpa Login)
- \`GET /api/products\` - Daftar semua produk
- \`GET /api/products/:id\` - Detail produk
- \`GET /api/products/slug/:slug\` - Produk by slug
- \`GET /api/products/featured\` - Produk featured
- \`GET /api/categories\` - Daftar kategori

### 🔐 Admin Only Endpoints (JWT Token Required)
- \`POST /api/products\` - Buat produk baru
- \`PUT /api/products/:id\` - Update produk
- \`DELETE /api/products/:id\` - Hapus produk
- \`PATCH /api/products/:id/featured\` - Toggle featured status
- \`PATCH /api/products/:id/active\` - Toggle active status
- \`GET /api/inventory\` - Inventory tracking
- Semua endpoints kategori CRUD

---

## 📋 Workflow

### Produk Public Flow:
1. Customer browse daftar produk atau cari by kategori
2. Lihat detail produk dengan gambar dan harga
3. Tracking inventori untuk ketersediaan stok

### Produk Admin Flow:
1. Admin create kategori untuk organisasi
2. Admin upload produk dengan gambar (max 5)
3. Admin kelola featured & active status
4. Monitor inventory dan stock changes
5. Update atau hapus produk sesuai kebutuhan

---

## 🔗 Service Dependencies
- **Auth Service (http://localhost:8001)** - Untuk JWT authentication
- **Shared Utilities** - Response formatting, middleware

### Test Credentials (Login di Auth Service):
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
                    description: "JWT token dari Auth Service (http://localhost:8001/api-docs)",
                },
            },
            schemas: {
                Product: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        slug: { type: "string" },
                        description: { type: "string" },
                        price: { type: "number" },
                        stock: { type: "number" },
                        featured: { type: "boolean" },
                        images: { type: "array", items: { type: "string" } },
                    },
                },
                Category: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
