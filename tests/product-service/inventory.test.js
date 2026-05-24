/**
 * ============================================
 * PRODUCT SERVICE — Inventory Tests
 * ============================================
 * Black-box testing untuk endpoint inventory:
 * - GET  /api/inventory          (admin)
 * - GET  /api/inventory/low-stock (admin)
 * - GET  /api/inventory/:productId
 * - POST /api/inventory/update-stock (admin)
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Product Service — Inventory", function () {
    const request = createRequest();

    // ========================================
    // GET /api/inventory (Admin Only)
    // ========================================
    describe("GET /api/inventory", function () {
        it("harus berhasil mengambil semua inventory (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/inventory")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/inventory'
            );
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal tanpa token", async function () {
            const res = await timeRequest(
                request.get("/api/inventory"),
                'GET',
                '/api/inventory'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal dengan role user biasa", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .get("/api/inventory")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/inventory'
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/inventory/low-stock (Admin Only)
    // ========================================
    describe("GET /api/inventory/low-stock", function () {
        it("harus berhasil mengambil produk stok rendah (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/inventory/low-stock")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/inventory/low-stock'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
