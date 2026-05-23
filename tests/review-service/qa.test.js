/**
 * ============================================
 * REVIEW SERVICE — Public Q&A Tests
 * ============================================
 * Black-box testing untuk endpoint publik Q&A:
 * - POST /api/qa
 * - GET  /api/qa
 */

const { createRequest } = require("../helpers/request.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Review Service — Public Q&A", function () {
    const request = createRequest();

    // ========================================
    // POST /api/qa
    // ========================================
    describe("POST /api/qa", function () {
        it("harus berhasil mengirim pertanyaan", async function () {
            const res = await timeRequest(
                request
                    .post("/api/qa")
                    .send({
                    customerName: "Penanya Mocha",
                    customerEmail: `penanya_${Date.now()}@example.com`,
                    question: "Berapa lama waktu pengerjaan renovasi rumah tipe 36?",
                }),
                'POST',
                '/api/qa'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal tanpa field wajib", async function () {
            const res = await timeRequest(
                request
                    .post("/api/qa")
                    .send({}),
                'POST',
                '/api/qa'
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/qa
    // ========================================
    describe("GET /api/qa", function () {
        it("harus berhasil mengambil pertanyaan yang sudah dijawab", async function () {
            const res = await timeRequest(
                request.get("/api/qa"),
                'GET',
                '/api/qa'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            // Response: { data: { data: [...], pagination: {...} } }
            expect(res.body.data).to.be.an("object");
        });
    });
});
