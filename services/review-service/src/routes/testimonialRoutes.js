const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { authMiddleware, roleMiddleware } = require("../../../../shared");

/**
 * @swagger
 * /api/testimonials:
 *   post:
 *     summary: Pengajuan testimoni pelanggan baru
 *     description: Endpoint public untuk pelanggan mengajukan testimoni tentang layanan 
 *                  perusahaan. Testimoni akan menunggu persetujuan admin sebelum ditampilkan 
 *                  secara publik. Tidak memerlukan login, cukup input data pribadi dan pesan 
 *                  testimoni dengan rating 1-5 bintang.
 *     tags: [Testimoni]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *               - rating
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rina Wijaya
 *                 description: Nama lengkap pemberi testimoni
 *               email:
 *                 type: string
 *                 format: email
 *                 example: rina@example.com
 *                 description: Email untuk konfirmasi dan follow-up dari admin
 *               company:
 *                 type: string
 *                 example: PT Jaya Bangunan
 *                 description: Nama perusahaan pemberi testimoni (opsional)
 *               position:
 *                 type: string
 *                 example: Project Manager
 *                 description: Jabatan atau posisi pemberi testimoni (opsional)
 *               message:
 *                 type: string
 *                 example: Layanan sangat profesional dan tepat waktu
 *                 description: Isi testimoni - pengalaman dan kesan tentang layanan perusahaan
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Rating kepuasan pelanggan (1 bintang terendah, 5 bintang tertinggi)
 *     responses:
 *       201:
 *         description: Testimoni berhasil diterima dan sedang menunggu persetujuan admin
 *       400:
 *         description: Validasi gagal - field required tidak lengkap, format email tidak valid, atau rating di luar range 1-5
 *       500:
 *         description: Error server saat memproses pengajuan testimoni
 */
router.post("/", testimonialController.createTestimonial);

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     summary: Pengambilan daftar testimoni yang sudah disetujui
 *     description: Endpoint public untuk menampilkan testimoni-testimoni dari pelanggan yang 
 *                  sudah di-approve oleh admin. Hanya testimoni dengan status approved yang 
 *                  akan ditampilkan di public. Data di-paginate untuk performa optimal dan 
 *                  bisa disort berdasarkan tanggal terbaru atau rating tertinggi.
 *     tags: [Testimoni]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman hasil daftar testimoni
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah testimoni per halaman (untuk pagination)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, topRated]
 *         description: Pengurutan hasil - terbaru atau rating tertinggi
 *     responses:
 *       200:
 *         description: Daftar testimoni approved berhasil diambil dengan informasi pagination
 *       500:
 *         description: Error server saat mengambil daftar testimoni
 */
router.get("/", testimonialController.getApprovedTestimonials);

/**
 * @swagger
 * /api/testimonials/admin/all:
 *   get:
 *     summary: Pengambilan semua testimoni untuk admin (termasuk pending)
 *     description: Endpoint admin untuk melihat daftar lengkap semua testimoni yang masuk, 
 *                  baik yang sudah di-approve maupun masih pending (menunggu review). Admin 
 *                  dapat filter berdasarkan status untuk prioritas review. Memerlukan role 
 *                  admin dan JWT token yang valid.
 *     tags: [Testimoni]
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
 *           default: 10
 *         description: Jumlah testimoni per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, approved, pending]
 *           default: all
 *         description: Filter berdasarkan status approval testimoni
 *     responses:
 *       200:
 *         description: Daftar semua testimoni berhasil diambil sesuai filter status
 *       401:
 *         description: Token tidak valid atau sudah expired, login ulang di Auth Service
 *       403:
 *         description: User bukan admin, tidak memiliki akses ke endpoint ini
 *       500:
 *         description: Error server saat mengambil data testimoni
 */
router.get("/admin/all", authMiddleware, roleMiddleware(["admin"]), testimonialController.getAllTestimonials);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   get:
 *     summary: Pengambilan detail testimoni spesifik
 *     description: Endpoint admin untuk melihat detail lengkap satu testimoni termasuk 
 *                  informasi pemberi, isi pesan, rating, status approval, dan tanggal submit. 
 *                  Berguna sebelum melakukan approve/reject atau untuk quality control. 
 *                  Memerlukan role admin dan JWT token.
 *     tags: [Testimoni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari testimoni yang akan dilihat detailnya
 *     responses:
 *       200:
 *         description: Detail testimoni lengkap berhasil diambil dengan semua informasi
 *       401:
 *         description: Token tidak valid atau sudah expired
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Testimoni dengan ID tersebut tidak ditemukan
 *       500:
 *         description: Error server
 */
router.get("/admin/:id", authMiddleware, roleMiddleware(["admin"]), testimonialController.getTestimonialById);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   put:
 *     summary: Pembaruan data dan status testimoni
 *     description: Endpoint admin untuk mengubah status approval atau melakukan editing pada 
 *                  testimoni jika diperlukan. Admin bisa approve testimoni untuk publikasi, 
 *                  mengedit konten yang perlu perbaikan, atau menambahkan catatan internal. 
 *                  Memerlukan role admin dan JWT token.
 *     tags: [Testimoni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari testimoni yang akan diperbarui
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 example: true
 *                 description: Status approval - true untuk publikasikan, false untuk tolak/draft
 *               message:
 *                 type: string
 *                 example: "Testimoni yang sudah diedit untuk grammar dan clarity"
 *                 description: Isi testimoni yang sudah diedit (opsional, hanya jika perlu perbaikan)
 *               adminNotes:
 *                 type: string
 *                 example: "Grammar OK, approved for publication"
 *                 description: Catatan internal admin tentang review testimoni ini (opsional)
 *     responses:
 *       200:
 *         description: Testimoni berhasil diperbarui dan status approval berubah
 *       400:
 *         description: Validasi gagal - field tidak valid atau format tidak sesuai
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Testimoni tidak ditemukan
 *       500:
 *         description: Error server saat memproses update
 */
router.put("/admin/:id", authMiddleware, roleMiddleware(["admin"]), testimonialController.updateTestimonial);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   delete:
 *     summary: Penghapusan testimoni
 *     description: Endpoint admin untuk menghapus testimoni secara permanen dan tidak dapat 
 *                  dibatalkan. Biasanya digunakan untuk menghapus testimoni yang tidak sesuai 
 *                  standar, mengandung informasi sensitif, atau sudah obsolete. Setelah dihapus, 
 *                  testimoni tidak bisa dipulihkan. Memerlukan role admin dan JWT token.
 *     tags: [Testimoni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari testimoni yang akan dihapus selamanya
 *     responses:
 *       200:
 *         description: Testimoni berhasil dihapus sepenuhnya dari sistem
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Testimoni tidak ditemukan
 *       500:
 *         description: Error server saat menghapus testimoni
 */
router.delete("/admin/:id", authMiddleware, roleMiddleware(["admin"]), testimonialController.deleteTestimonial);

/**
 * @swagger
 * /api/testimonials/admin/{id}/approve:
 *   patch:
 *     summary: Perubahan status approval testimoni
 *     description: Endpoint admin untuk quick approve atau reject testimoni tanpa perlu 
 *                  melakukan update data lengkap. Endpoint ini spesifik untuk mengubah status 
 *                  approval saja, cocok untuk workflow approval yang cepat. Memerlukan role 
 *                  admin dan JWT token.
 *     tags: [Testimoni]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId dari testimoni yang ingin di-approve/reject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 example: true
 *                 description: Status approval baru (true=approved, false=rejected/draft)
 *     responses:
 *       200:
 *         description: Status approval testimoni berhasil diubah dan langsung aktif
 *       400:
 *         description: Body request tidak valid atau field isApproved tidak ada
 *       401:
 *         description: Token tidak valid
 *       403:
 *         description: User bukan admin
 *       404:
 *         description: Testimoni tidak ditemukan
 *       500:
 *         description: Error server saat mengubah status
 */
router.patch("/admin/:id/approve", authMiddleware, roleMiddleware(["admin"]), testimonialController.approveTestimonial);

module.exports = router;
