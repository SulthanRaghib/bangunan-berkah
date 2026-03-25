const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

// All routes require authentication
router.use(authMiddleware);

// ========================================
// GET ROUTES
// ========================================

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Pengambilan daftar inventori semua produk
 *     description: Endpoint admin untuk melihat status inventori lengkap semua produk termasuk stok saat ini, ambang batas stok minimum, dan status alert. Memerlukan role admin.
 *     tags: [Inventori]
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
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_stock, low_stock, out_of_stock]
 *         description: Filter berdasarkan status stok
 *     responses:
 *       200:
 *         description: Daftar inventori berhasil diambil
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       500:
 *         description: Error server
 */
router.get("/", roleMiddleware(["admin"]), inventoryController.getAllInventory);

/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Pengambilan daftar produk dengan stok rendah
 *     description: Endpoint admin untuk monitoring produk-produk yang stoknya sudah mencapai atau di bawah ambang batas minimum. Berguna untuk pemesanan ulang stok. Memerlukan role admin.
 *     tags: [Inventori]
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
 *         description: Jumlah item per halaman
 *     responses:
 *       200:
 *         description: Daftar produk low stock berhasil diambil
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       500:
 *         description: Error server
 */
router.get("/low-stock", roleMiddleware(["admin"]), inventoryController.getLowStock);

/**
 * @swagger
 * /api/inventory/{productId}:
 *   get:
 *     summary: Pengambilan detail inventori produk spesifik
 *     description: Endpoint untuk melihat detail inventori satu produk termasuk stok saat ini, minimal stok, dan informasi terkait. User dapat melihat stok produk mereka sendiri, admin bisa lihat semua.
 *     tags: [Inventori]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari produk
 *     responses:
 *       200:
 *         description: Detail inventori berhasil diambil
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.get("/:productId", inventoryController.getInventoryByProduct);

/**
 * @swagger
 * /api/inventory/history/{productId}:
 *   get:
 *     summary: Pengambilan histori perubahan stok produk
 *     description: Endpoint untuk melihat log lengkap semua perubahan stok produk termasuk tanggal, jumlah perubahan, alasan, dan admin yang melakukan perubahan. Berguna untuk audit trail dan verifikasi transaksi.
 *     tags: [Inventori]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari produk
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
 *         description: Jumlah history per halaman
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *         description: Pengurutan berdasarkan tanggal
 *     responses:
 *       200:
 *         description: Histori stok berhasil diambil
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.get("/history/:productId", inventoryController.getStockHistory);

// ========================================
// UPDATE ROUTES (Admin only)
// ========================================

/**
 * @swagger
 * /api/inventory/update-stock:
 *   post:
 *     summary: Pembaruan stok produk
 *     description: Endpoint admin untuk melakukan perubahan stok produk (penambahan atau pengurangan). Setiap perubahan akan dicatat dalam histori untuk audit trail. Memerlukan role admin.
 *     tags: [Inventori]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - type
 *             properties:
 *               productId:
 *                 type: string
 *                 description: MongoDB ObjectId dari produk
 *               quantity:
 *                 type: integer
 *                 example: 50
 *                 description: Jumlah perubahan stok (positif untuk penambahan, negatif untuk pengurangan)
 *               type:
 *                 type: string
 *                 enum: [in, out, adjustment, return]
 *                 description: Tipe perubahan stok (masuk, keluar, penyesuaian, retur)
 *               reference:
 *                 type: string
 *                 example: PO-2026-001
 *                 description: Referensi dokumen (no PO, invoice, dll) - opsional
 *               notes:
 *                 type: string
 *                 example: Restock dari supplier PT Jaya
 *                 description: Catatan atau keterangan perubahan stok
 *     responses:
 *       200:
 *         description: Stok berhasil diperbarui dan histori tercatat
 *       400:
 *         description: Validasi gagal (quantity tidak valid atau stok akan negatif)
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Produk tidak ditemukan
 *       500:
 *         description: Error server
 */
router.post(
  "/update-stock",
  roleMiddleware(["admin"]),
  inventoryController.updateStock
);

/**
 * @swagger
 * /api/inventory/{productId}:
 *   put:
 *     summary: Pembaruan setting inventori produk
 *     description: Endpoint admin untuk mengubah pengaturan inventori produk seperti minimal stok, maksimal stok, dan status tracking. Memerlukan role admin.
 *     tags: [Inventori]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *             properties:
 *               minStock:
 *                 type: integer
 *                 example: 50
 *                 description: Jumlah stok minimum sebelum alert
 *               maxStock:
 *                 type: integer
 *                 example: 1000
 *                 description: Jumlah stok maksimal (kapasitas gudang)
 *               isTracked:
 *                 type: boolean
 *                 description: Apakah stok produk ini perlu ditrack (untuk audit trail)
 *     responses:
 *       200:
 *         description: Setting inventori berhasil diperbarui
 *       400:
 *         description: Validasi gagal (min/max tidak valid)
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
  "/:productId",
  roleMiddleware(["admin"]),
  inventoryController.updateInventorySettings
);

module.exports = router;
