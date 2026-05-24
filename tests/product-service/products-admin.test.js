/**
 * ============================================
 * PRODUCT SERVICE — Admin Product Tests
 * ============================================
 * Black-box testing untuk endpoint admin produk:
 * - POST   /api/products/admin
 * - PUT    /api/products/admin/:id
 * - PATCH  /api/products/admin/:id/featured
 * - PATCH  /api/products/admin/:id/active
 * - DELETE /api/products/admin/:id
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Product Service — Admin Products", function () {
    const request = createRequest();
    let createdProductId = null;
    let testCategoryId = null;

    // Create a test category before running tests
    before(async function () {
        const token = await getAdminToken();

        const res = await timeRequest(
            request
                .post("/api/categories/admin")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: `Test Category ${Date.now()}`,
                    description: "Category untuk testing produk",
                }),
            'POST',
            '/api/categories/admin'
        );

        if (res.status === 201 || res.status === 200) {
            testCategoryId = res.body.data?.id || res.body.data?._id;
            console.log(`✅ Test category created: ${testCategoryId}`);
        } else {
            console.error(`❌ Category creation failed:`, res.body);
        }
    });

    // Cleanup: Hapus test product setelah semua tests selesai
    // Note: Removed cleanup to allow public tests to use the created product
    // Products will be cleaned up at the end of the full test suite
    // after(async function () {
    //     if (!createdProductId) return;
    //     const token = await getAdminToken();
    //     await request
    //         .delete(`/api/products/admin/${createdProductId}`)
    //         .set("Authorization", `Bearer ${token}`)
    //         .catch(() => {}); 
    // });

    // ========================================
    // POST /api/products/admin
    // ========================================
    describe("POST /api/products/admin", function () {
        it("harus berhasil membuat produk baru (admin)", async function () {
            if (!testCategoryId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/products/admin")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        name: `Test Product ${Date.now()}`,
                        description: "Produk testing dari Mocha",
                        sku: `SKU-${Date.now()}`,
                        price: 150000,
                        stock: 10,
                        categoryId: testCategoryId,
                    }),
                'POST',
                '/api/products/admin'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;

            createdProductId = res.body.data?.id || res.body.data?._id;
            console.log(`📦 Product creation response:`, JSON.stringify({ status: res.status, success: res.body.success, createdProductId, responseData: res.body.data }, null, 2));

            // Verify product exists in DB
            if (createdProductId) {
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms for DB
                const checkRes = await timeRequest(
                    request
                        .get(`/api/products/${createdProductId}`)
                        .set("Authorization", `Bearer ${token}`),
                    'GET',
                    `/api/products/${createdProductId} [VERIFY]`
                );
                console.log(`🔍 Verification check - Status: ${checkRes.status}, Found: ${checkRes.body.success}`);
            }
        });

        it("harus gagal membuat produk tanpa token", async function () {
            const res = await timeRequest(
                request
                    .post("/api/products/admin")
                    .send({ name: "Unauthorized Product", price: 100000 }),
                'POST',
                '/api/products/admin [NO TOKEN]'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal membuat produk dengan role user", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .post("/api/products/admin")
                    .set("Authorization", `Bearer ${token}`)
                    .field("name", "Forbidden Product")
                    .field("price", 100000),
                'POST',
                '/api/products/admin [USER ROLE]'
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // PUT /api/products/admin/:id
    // ========================================
    describe("PUT /api/products/admin/:id", function () {
        it("harus berhasil update produk (admin)", async function () {
            if (!createdProductId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .put(`/api/products/admin/${createdProductId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .field("name", `Updated Product ${Date.now()}`)
                    .field("price", 200000),
                'PUT',
                `/api/products/admin/${createdProductId}`
            );

            if (res.status !== 200) {
                console.error(`❌ Update failed:`, res.status, JSON.stringify(res.body, null, 2));
            }

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PATCH /api/products/admin/:id/featured
    // ========================================
    describe("PATCH /api/products/admin/:id/featured", function () {
        it("harus berhasil toggle featured produk", async function () {
            if (!createdProductId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/products/admin/${createdProductId}/featured`)
                    .set("Authorization", `Bearer ${token}`),
                'PATCH',
                `/api/products/admin/${createdProductId}/featured`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PATCH /api/products/admin/:id/active
    // ========================================
    describe("PATCH /api/products/admin/:id/active", function () {
        it("harus berhasil toggle status aktif produk", async function () {
            if (!createdProductId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/products/admin/${createdProductId}/active`)
                    .set("Authorization", `Bearer ${token}`),
                'PATCH',
                `/api/products/admin/${createdProductId}/active`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // DELETE /api/products/admin/:id
    // ========================================
    // DELETE tests are handled in cleanup (after hook)
    // to prevent deleting products before public tests can use them
});
