/**
 * ============================================
 * REVIEW SERVICE — Admin Q&A Tests
 * ============================================
 * Black-box testing untuk endpoint admin Q&A:
 * - GET    /api/qa/admin
 * - GET    /api/qa/admin/:id
 * - PATCH  /api/qa/admin/:id/answer
 * - DELETE /api/qa/admin/:id
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Review Service — Admin Q&A", function () {
    const request = createRequest();
    let questionId = null;

    // ========================================
    // GET /api/qa/admin
    // ========================================
    describe("GET /api/qa/admin", function () {
        it("harus berhasil mengambil semua pertanyaan (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/qa/admin")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/qa/admin'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;

            // Response format: {data: {data: [...], pagination: {...}}}
            const items = res.body.data?.data || res.body.data;
            if (Array.isArray(items) && items.length > 0) {
                questionId = items[0].id || items[0]._id;
            }
        });

        it("harus gagal tanpa token", async function () {
            const res = await timeRequest(
                request.get("/api/qa/admin"),
                'GET',
                '/api/qa/admin [NO TOKEN]'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal dengan role user biasa", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .get("/api/qa/admin")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/qa/admin [USER ROLE]'
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/qa/admin/:id
    // ========================================
    describe("GET /api/qa/admin/:id", function () {
        it("harus berhasil mengambil detail pertanyaan (admin)", async function () {
            if (!questionId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get(`/api/qa/admin/${questionId}`)
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                `/api/qa/admin/${questionId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PATCH /api/qa/admin/:id/answer
    // ========================================
    describe("PATCH /api/qa/admin/:id/answer", function () {
        it("harus berhasil menjawab pertanyaan (admin)", async function () {
            if (!questionId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/qa/admin/${questionId}/answer`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        answer: "Estimasi pengerjaan renovasi rumah tipe 36 adalah 2-3 bulan.",
                    }),
                'PATCH',
                `/api/qa/admin/${questionId}/answer`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // DELETE /api/qa/admin/:id
    // ========================================
    describe("DELETE /api/qa/admin/:id", function () {
        it("harus gagal delete tanpa role admin", async function () {
            if (!questionId) this.skip();

            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .delete(`/api/qa/admin/${questionId}`)
                    .set("Authorization", `Bearer ${token}`),
                'DELETE',
                `/api/qa/admin/${questionId} [USER ROLE]`
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });

        it("harus berhasil delete pertanyaan (admin)", async function () {
            if (!questionId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .delete(`/api/qa/admin/${questionId}`)
                    .set("Authorization", `Bearer ${token}`),
                'DELETE',
                `/api/qa/admin/${questionId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
