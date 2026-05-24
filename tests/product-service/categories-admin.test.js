/**
 * ============================================
 * PRODUCT SERVICE — Admin Category Tests
 * ============================================
 * Black-box testing untuk endpoint admin kategori:
 * - POST   /api/categories/admin
 * - PUT    /api/categories/admin/:id
 * - DELETE /api/categories/admin/:id
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Product Service — Admin Categories", function () {
    const request = createRequest();
    let createdCategoryId = null;

    // ========================================
    // POST /api/categories/admin
    // ========================================
    describe("POST /api/categories/admin", function () {
        it("harus berhasil membuat kategori baru (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/categories/admin")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        name: `Test Category ${Date.now()}`,
                        description: "Kategori testing dari Mocha",
                    }),
                'POST',
                '/api/categories/admin'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;

            createdCategoryId = res.body.data?.id || res.body.data?._id;
        });

        it("harus gagal membuat kategori tanpa token", async function () {
            const res = await timeRequest(
                request
                    .post("/api/categories/admin")
                    .send({ name: "Unauthorized" }),
                'POST',
                '/api/categories/admin'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // PUT /api/categories/admin/:id
    // ========================================
    describe("PUT /api/categories/admin/:id", function () {
        it("harus berhasil update kategori (admin)", async function () {
            if (!createdCategoryId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .put(`/api/categories/admin/${createdCategoryId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        name: "Updated Category Mocha",
                        description: "Kategori sudah di-update",
                    }),
                'PUT',
                `/api/categories/admin/${createdCategoryId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // DELETE /api/categories/admin/:id
    // ========================================
    describe("DELETE /api/categories/admin/:id", function () {
        it("harus berhasil hapus kategori (admin)", async function () {
            if (!createdCategoryId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .delete(`/api/categories/admin/${createdCategoryId}`)
                    .set("Authorization", `Bearer ${token}`),
                'DELETE',
                `/api/categories/admin/${createdCategoryId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
