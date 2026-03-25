const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// ========================================
// PUBLIC ROUTES
// ========================================

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Pengambilan daftar kategori produk
 *     description: Endpoint public untuk menampilkan semua kategori produk yang tersedia. Digunakan untuk filtering dan organisasi produk.
 *     tags: [Kategori]
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
 *         description: Jumlah kategori per halaman
 *     responses:
 *       200:
 *         description: Daftar kategori berhasil diambil
 *       500:
 *         description: Error server
 */
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Pengambilan detail kategori dan produk-produknya
 *     description: Endpoint public untuk mengambil detail kategori termasuk semua produk yang terdapat dalam kategori tersebut.
 *     tags: [Kategori]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari kategori
 *     responses:
 *       200:
 *         description: Detail kategori dan daftar produk berhasil diambil
 *       404:
 *         description: Kategori tidak ditemukan
 *       500:
 *         description: Error server
 */
router.get("/:id", categoryController.getCategoryById);

// ========================================
// PROTECTED ROUTES (Admin only)
// ========================================

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Pembuatan kategori produk baru
 *     description: Endpoint admin untuk membuat kategori baru. Kategori digunakan untuk mengorganisir dan mengklasifikasikan produk. Memerlukan role admin dan JWT token.
 *     tags: [Kategori]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Semen & Pasir
 *                 description: Nama kategori
 *               description:
 *                 type: string
 *                 example: Kategori untuk material semen dan pasir konstruksi
 *                 description: Deskripsi kategori (opsional)
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       400:
 *         description: Validasi gagal (nama kategori diperlukan)
 *       401:
 *         description: Token tidak valid atau expired
 *       403:
 *         description: User bukan admin
 *       409:
 *         description: Kategori dengan nama yang sama sudah ada
 *       500:
 *         description: Error server
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryController.createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Pembaruan data kategori
 *     description: Endpoint admin untuk memperbarui informasi kategori. Memerlukan role admin dan JWT token.
 *     tags: [Kategori]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari kategori
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nama kategori baru
 *               description:
 *                 type: string
 *                 description: Deskripsi kategori baru
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Kategori tidak ditemukan
 *       500:
 *         description: Error server
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Penghapusan kategori
 *     description: Endpoint admin untuk menghapus kategori secara permanen. Pastikan tidak ada produk dalam kategori sebelum menghapus. Memerlukan role admin dan JWT token.
 *     tags: [Kategori]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari kategori
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Kategori tidak ditemukan
 *       409:
 *         description: Kategori masih memiliki produk dan tidak dapat dihapus
 *       500:
 *         description: Error server
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  categoryController.deleteCategory
);

module.exports = router;
