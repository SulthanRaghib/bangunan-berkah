/**
 * ============================================
 * PRODUCT SERVICE — Public Category Tests
 * ============================================
 * Black-box testing untuk endpoint publik kategori:
 * - GET /api/categories
 * - GET /api/categories/:id
 */

const { createRequest } = require("../helpers/request.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Product Service — Public Categories", function () {
    const request = createRequest();
    let categoryId = null;

    // ========================================
    // GET /api/categories
    // ========================================
    describe("GET /api/categories", function () {
        it("harus berhasil mengambil daftar kategori", async function () {
            const res = await timeRequest(
                request.get("/api/categories"),
                'GET',
                '/api/categories'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;

            // Response bisa berupa array atau object dengan pagination
            const items = Array.isArray(res.body.data)
                ? res.body.data
                : (res.body.data?.data || []);

            if (items.length > 0) {
                categoryId = items[0].id || items[0]._id;
            }
        });
    });

    // ========================================
    // GET /api/categories/:id
    // ========================================
    describe("GET /api/categories/:id", function () {
        it("harus berhasil mengambil detail kategori", async function () {
            if (!categoryId) this.skip();

            const res = await timeRequest(
                request.get(`/api/categories/${categoryId}`),
                'GET',
                `/api/categories/${categoryId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal dengan ID yang tidak valid", async function () {
            const res = await timeRequest(
                request.get("/api/categories/000000000000000000000000"),
                'GET',
                '/api/categories/000000000000000000000000'
            );

            expect(res.status).to.be.oneOf([404, 400]);
            expect(res.body.success).to.be.false;
        });
    });
});
