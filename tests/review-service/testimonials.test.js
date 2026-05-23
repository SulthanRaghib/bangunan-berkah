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
