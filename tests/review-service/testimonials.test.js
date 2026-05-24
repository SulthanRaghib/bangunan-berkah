/**
 * ============================================
 * REVIEW SERVICE — Public Testimonial Tests
 * ============================================
 * Black-box testing untuk endpoint publik testimonial:
 * - POST /api/testimonials
 * - GET  /api/testimonials
 */

const { createRequest } = require("../helpers/request.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Review Service — Public Testimonials", function () {
    const request = createRequest();

    // ========================================
    // POST /api/testimonials
    // ========================================
    describe("POST /api/testimonials", function () {
        it("harus berhasil mengirim testimonial", async function () {
            const res = await timeRequest(
                request
                    .post("/api/testimonials")
                    .send({
                    name: "Pelanggan Mocha",
                    email: `pelanggan_${Date.now()}@example.com`,
                    position: "Pemilik Rumah",
                    testimonialText: "Hasil renovasi sangat memuaskan, terima kasih atas kerjanya yang profesional!",
                    rating: 5,
                }),
                'POST',
                '/api/testimonials'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;
        });

        it("harus berhasil mengirim testimonial dengan foto base64 dan otomatis terupload ke Cloudinary", async function () {
            const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
            const res = await timeRequest(
                request
                    .post("/api/testimonials")
                    .send({
                        name: "Pelanggan Media",
                        email: `pelanggan_media_${Date.now()}@example.com`,
                        position: "Manajer Proyek",
                        testimonialText: "Ulasan yang sangat baik dengan bukti foto!",
                        rating: 5,
                        photos: [base64Image]
                    }),
                'POST',
                '/api/testimonials'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;
            expect(res.body.data.photos).to.be.an("array").that.is.not.empty;
            expect(res.body.data.photos[0]).to.include("cloudinary.com");
        });

        it("harus gagal tanpa field wajib", async function () {
            const res = await timeRequest(
                request
                    .post("/api/testimonials")
                    .send({}),
                'POST',
                '/api/testimonials'
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/testimonials
    // ========================================
    describe("GET /api/testimonials", function () {
        it("harus berhasil mengambil testimonial yang disetujui", async function () {
            const res = await timeRequest(
                request.get("/api/testimonials"),
                'GET',
                '/api/testimonials'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            // Response: { data: { data: [...], pagination: {...} } }
            expect(res.body.data).to.be.an("object");
        });
    });
});
