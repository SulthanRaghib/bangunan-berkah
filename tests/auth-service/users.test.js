/**
 * ============================================
 * AUTH SERVICE — User Management Tests
 * ============================================
 * Black-box testing untuk endpoint user management:
 * - GET    /api/users      (admin only)
 * - GET    /api/users/:id  (authenticated)
 * - PUT    /api/users/:id  (authenticated)
 * - DELETE /api/users/:id  (admin only)
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Auth Service — User Management", function () {
    const request = createRequest();
    let testUserId = null;

    // ========================================
    // GET /api/users (Admin Only)
    // ========================================
    describe("GET /api/users", function () {
        it("harus berhasil mengambil daftar user (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/users")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/users'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.data).to.be.an("array");

            // Simpan ID user pertama untuk test selanjutnya
            if (res.body.data.data.length > 0) {
                testUserId = res.body.data.data[0].id || res.body.data.data[0]._id;
            }
        });

        it("harus gagal mengambil daftar user (role user biasa)", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .get("/api/users")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/users'
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal tanpa token", async function () {
            const res = await timeRequest(
                request.get("/api/users"),
                'GET',
                '/api/users'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/users/:id
    // ========================================
    describe("GET /api/users/:id", function () {
        it("harus berhasil mengambil detail user by ID", async function () {
            if (!testUserId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get(`/api/users/${testUserId}`)
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                `/api/users/${testUserId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.user).to.have.property("email");
        });

        it("harus gagal dengan ID yang tidak valid", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/users/000000000000000000000000")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/users/000000000000000000000000'
            );

            expect(res.status).to.be.oneOf([404, 400]);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // PUT /api/users/:id
    // ========================================
    describe("PUT /api/users/:id", function () {
        it("harus berhasil update nama user", async function () {
            if (!testUserId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .put(`/api/users/${testUserId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ name: "Updated Name Mocha" }),
                'PUT',
                `/api/users/${testUserId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // DELETE /api/users/:id (Admin Only)
    // ========================================
    describe("DELETE /api/users/:id", function () {
        it("harus gagal delete tanpa role admin", async function () {
            if (!testUserId) this.skip();

            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .delete(`/api/users/${testUserId}`)
                    .set("Authorization", `Bearer ${token}`),
                'DELETE',
                `/api/users/${testUserId}`
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });
    });
});
