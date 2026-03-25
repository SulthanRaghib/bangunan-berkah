const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../../../../shared");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Pendaftaran pengguna baru
 *     description: Endpoint untuk mendaftarkan akun pengguna baru ke dalam sistem. Setiap pengguna harus memiliki email unik. Password akan di-hash menggunakan bcryptjs untuk keamanan. Role default adalah "user" jika tidak dispesifikasikan.
 *     tags: [Autentikasi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *                 description: Nama lengkap pengguna
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *                 description: Email unik untuk login, harus valid dan belum terdaftar
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *                 description: Password (minimal 6 karakter, recommended dengan uppercase, lowercase, & angka)
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 default: user
 *                 example: user
 *                 description: Role pengguna dalam sistem
 *     responses:
 *       201:
 *         description: Pengguna berhasil terdaftar dan siap untuk login
 *       400:
 *         description: Validasi gagal (email sudah ada, format tidak valid, atau field kurang) atau email sudah terdaftar
 *       500:
 *         description: Error server saat memproses pendaftaran
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna dengan kredensial
 *     description: Endpoint untuk login dan mendapatkan JWT access token. Token ini harus disimpan di client dan dikirimkan dalam header Authorization untuk mengakses protected endpoints. Token berlaku selama 24 jam sebelum perlu di-refresh.
 *     tags: [Autentikasi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@solusi-bangunan.com
 *                 description: Email akun pengguna
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *                 description: Password akun pengguna
 *     responses:
 *       200:
 *         description: Login berhasil, access token dan refresh token dikembalikan
 *       401:
 *         description: Kredensial tidak valid (email tidak terdaftar atau password salah)
 *       400:
 *         description: Validasi gagal atau field tidak lengkap
 *       500:
 *         description: Error server saat memproses login
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Pembaruan access token menggunakan refresh token
 *     description: Endpoint untuk mendapatkan access token baru tanpa harus login ulang menggunakan refresh token yang dimiliki. Gunakan ini ketika access token sudah expired (24 jam). Refresh token berlaku lebih lama (biasanya 7 hari).
 *     tags: [Autentikasi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: Refresh token yang didapat dari login sebelumnya
 *     responses:
 *       200:
 *         description: Token berhasil di-refresh, access token baru dikembalikan
 *       401:
 *         description: Refresh token tidak valid, expired, atau tidak cocok
 *       400:
 *         description: Validasi gagal atau field tidak lengkap
 *       500:
 *         description: Error server saat memproses refresh token
 */
router.post("/refresh", authController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Pengambilan profil pengguna saat ini
 *     description: Endpoint terlindungi untuk mengambil informasi profil dari pengguna yang sedang login. Data yang dikembalikan berdasarkan JWT token yang dikirim di header Authorization. Memerlukan access token yang valid.
 *     tags: [Autentikasi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diambil dengan informasi lengkap (nama, email, role, created_at)
 *       401:
 *         description: Token tidak valid, expired, atau tidak dikirimkan
 *       500:
 *         description: Error server saat mengambil data profil
 */
router.get("/profile", authMiddleware, authController.getProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout pengguna
 *     description: Endpoint terlindungi untuk logout dan invalidate session pengguna. Setelah logout, token akan kehilangan validasinya dan pengguna harus login ulang untuk mengakses protected endpoints. Memerlukan access token yang valid.
 *     tags: [Autentikasi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil, session telah dihapus
 *       401:
 *         description: Token tidak valid atau sudah kadaluarsa
 *       500:
 *         description: Error server saat memproses logout
 */
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
