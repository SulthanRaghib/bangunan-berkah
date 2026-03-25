const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Pengambilan daftar semua pengguna
 *     description: Endpoint admin untuk melihat daftar lengkap semua pengguna terdaftar dalam sistem. Menampilkan informasi dasar setiap pengguna seperti nama, email, role, dan tanggal registrasi. Memerlukan role admin dan access token yang valid.
 *     tags: [Pengguna]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Jumlah pengguna per halaman
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *         description: Filter berdasarkan role pengguna
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama atau email
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil dengan pagination
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       500:
 *         description: Error server
 */
router.get("/", roleMiddleware(["admin"]), userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Pengambilan detail pengguna spesifik
 *     description: Endpoint untuk mengambil informasi detail pengguna berdasarkan ID. User biasa hanya bisa melihat profil diri sendiri, admin bisa melihat profil user manapun. Memerlukan access token yang valid.
 *     tags: [Pengguna]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari pengguna
 *     responses:
 *       200:
 *         description: Detail pengguna berhasil diambil
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: Tidak memiliki akses ke data pengguna lain (non-admin)
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Error server
 */
router.get("/:id", userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Pembaruan data pengguna
 *     description: Endpoint untuk memperbarui informasi profil pengguna seperti nama. User biasa hanya bisa update profil diri sendiri, admin bisa update profil user manapun. Password tidak bisa diubah melalui endpoint ini (gunakan change-password endpoint terpisah untuk security). Memerlukan access token yang valid.
 *     tags: [Pengguna]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe Updated
 *                 description: Nama lengkap pengguna yang baru
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email baru (harus unique dan belum terdaftar)
 *               phone:
 *                 type: string
 *                 description: Nomor telepon (opsional)
 *               address:
 *                 type: string
 *                 description: Alamat pengguna (opsional)
 *     responses:
 *       200:
 *         description: Data pengguna berhasil diperbarui
 *       400:
 *         description: Validasi gagal (email sudah ada, format tidak valid)
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: Tidak memiliki akses untuk update data pengguna lain (non-admin)
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Error server
 */
router.put("/:id", userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Penghapusan pengguna
 *     description: Endpoint admin untuk menghapus akun pengguna secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait pengguna. Memerlukan role admin dan access token yang valid.
 *     tags: [Pengguna]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari pengguna yang akan dihapus
 *     responses:
 *       200:
 *         description: Pengguna berhasil dihapus sepenuhnya dari sistem
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Error server
 */
router.delete("/:id", roleMiddleware(["admin"]), userController.deleteUser);

module.exports = router;
