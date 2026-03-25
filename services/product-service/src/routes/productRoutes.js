const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");
const upload = require("../middlewares/uploadMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Pengambilan daftar produk aktif dengan pagination
 *     description: Endpoint public untuk menampilkan daftar semua produk yang aktif. Mendukung pagination, sorting, dan filtering.
 *     tags: [Produk]
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
 *           default: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama produk
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID kategori
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, price_asc, price_desc]
 *         description: Pengurutan hasil
 *     responses:
 *       200:
 *         description: Daftar produk berhasil diambil
 *       500:
 *         description: Error server
 */
router.get("/", productController.getAllProducts);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Pengambilan produk featured/pilihan
 *     description: Endpoint public untuk menampilkan produk-produk yang di-highlight sebagai produk unggulan.
 *     tags: [Produk]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Jumlah produk featured yang ditampilkan
 *     responses:
 *       200:
 *         description: Daftar produk featured berhasil diambil
 *       500:
 *         description: Error server
 */
router.get("/featured", productController.getFeaturedProducts);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Pengambilan detail produk berdasarkan slug
 *     description: Endpoint public untuk mengambil detail lengkap produk menggunakan slug URL (SEO-friendly). Slug berupa string unik derived dari nama produk.
 *     tags: [Produk]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: semen-portland-type-i
 *         description: URL slug produk
 *     responses:
 *       200:
 *         description: Detail produk berhasil diambil lengkap dengan gambar dan stok
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.get("/slug/:slug", productController.getProductBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Pengambilan detail produk berdasarkan ID
 *     description: Endpoint public untuk mengambil detail lengkap produk menggunakan MongoDB ObjectId.
 *     tags: [Produk]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari produk
 *     responses:
 *       200:
 *         description: Detail produk berhasil diambil
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.get("/:id", productController.getProductById);

// ========================================
// PROTECTED ROUTES (Admin only)
// ========================================

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Pembuatan produk baru
 *     description: Endpoint admin untuk membuat produk baru dengan detail lengkap dan upload multi-image. Memerlukan role admin dan JWT token.
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Semen Portland Type I
 *                 description: Nama produk
 *               slug:
 *                 type: string
 *                 description: URL slug (auto-generated jika tidak diberikan)
 *               description:
 *                 type: string
 *                 example: Semen berkualitas tinggi untuk konstruksi
 *                 description: Deskripsi produk
 *               price:
 *                 type: number
 *                 example: 65000
 *                 description: Harga produk dalam Rupiah
 *               stock:
 *                 type: integer
 *                 example: 500
 *                 description: Jumlah stok awal
 *               category_id:
 *                 type: string
 *                 description: MongoDB ObjectId dari kategori
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Upload maksimal 5 gambar produk
 *     responses:
 *       201:
 *         description: Produk berhasil dibuat
 *       400:
 *         description: Validasi gagal (field required tidak lengkap, format tidak valid)
 *       401:
 *         description: Token tidak valid atau expired
 *       403:
 *         description: User bukan admin
 *       500:
 *         description: Error server
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.array("images", 5),
  productController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Pembaruan data produk
 *     description: Endpoint admin untuk memperbarui informasi produk termasuk gambar. Memerlukan role admin dan JWT token.
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari produk
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category_id:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Produk berhasil diperbarui
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.array("images", 5),
  productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Penghapusan produk
 *     description: Endpoint admin untuk menghapus produk secara permanen dari database. Memerlukan role admin dan JWT token.
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari produk
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.deleteProduct
);

/**
 * @swagger
 * /api/products/{id}/featured:
 *   patch:
 *     summary: Pengubahan status featured produk
 *     description: Endpoint admin untuk menentukan apakah produk ditampilkan sebagai featured/unggulan atau tidak. Toggle on/off.
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari produk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - featured
 *             properties:
 *               featured:
 *                 type: boolean
 *                 example: true
 *                 description: Status featured produk
 *     responses:
 *       200:
 *         description: Status featured berhasil diubah
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.patch(
  "/:id/featured",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.toggleFeatured
);

/**
 * @swagger
 * /api/products/{id}/active:
 *   patch:
 *     summary: Pengubahan status aktif produk
 *     description: Endpoint admin untuk mengaktifkan atau menonaktifkan produk. Produk yang tidak aktif tidak akan ditampilkan di public listing.
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari produk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - active
 *             properties:
 *               active:
 *                 type: boolean
 *                 example: true
 *                 description: Status aktif produk
 *     responses:
 *       200:
 *         description: Status aktif berhasil diubah
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.patch(
  "/:id/active",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.toggleActive
);

module.exports = router;
