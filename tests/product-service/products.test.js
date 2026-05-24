/**
 * ============================================
 * PRODUCT SERVICE — Public Product Tests
 * ============================================
 * Black-box testing untuk endpoint publik produk:
 * - GET /api/products
 * - GET /api/products/featured
 * - GET /api/products/:id
 */

const { createRequest } = require("../helpers/request.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Product Service — Public Products", function () {
    const request = createRequest();
    let productId = null;

    // ========================================
    // GET /api/products
    // ========================================
    describe("GET /api/products", function () {
        it("harus berhasil mengambil daftar produk", async function () {
            const res = await timeRequest(
                request.get("/api/products"),
                'GET',
                '/api/products'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.be.an("object");

            // Response: { data: { data: [...], pagination: {...} } }
            const items = res.body.data.data || res.body.data;
            console.log(`📦 Products list: ${items?.length || 0} items`, items?.length === 0 ? "⚠️ EMPTY!" : "");
            if (items?.length > 0) {
                console.log(`📦 First product:`, JSON.stringify(items[0], null, 2).substring(0, 300));
            }
            if (Array.isArray(items) && items.length > 0) {
                productId = items[0].id || items[0]._id;
                console.log(`✅ Captured productId: ${productId}`);
            }
        });

        it("harus support pagination", async function () {
            const res = await timeRequest(
                request
                    .get("/api/products")
                    .query({ page: 1, limit: 5 }),
                'GET',
                '/api/products [WITH PAGINATION]'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // GET /api/products/featured
    // ========================================
    describe("GET /api/products/featured", function () {
        it("harus berhasil mengambil produk unggulan", async function () {
            const res = await timeRequest(
                request.get("/api/products/featured"),
                'GET',
                '/api/products/featured'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // GET /api/products/:id
    // ========================================
    describe("GET /api/products/:id", function () {
        it("harus berhasil mengambil detail produk", async function () {
            if (!productId) this.skip();

            const res = await timeRequest(
                request.get(`/api/products/${productId}`),
                'GET',
                `/api/products/${productId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal dengan ID yang tidak valid", async function () {
            const res = await timeRequest(
                request.get("/api/products/000000000000000000000000"),
                'GET',
                '/api/products/:id [INVALID ID]'
            );

            expect(res.status).to.be.oneOf([404, 400]);
            expect(res.body.success).to.be.false;
        });
    });
});
