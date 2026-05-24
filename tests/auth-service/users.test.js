/**
 * ============================================
 * AUTH SERVICE — Update User Tests (Admin)
 * ============================================
 * Black-box testing untuk endpoint update user:
 * - PUT /api/users/:id (admin)
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Auth Service — Update User (Admin)", function () {
    const request = createRequest();
    let testUserId = null;

    // Setup: Get a user ID to test with
    before(async function () {
        const token = await getAdminToken();

        const res = await timeRequest(
            request
                .get("/api/users")
                .set("Authorization", `Bearer ${token}`),
            "GET",
            "/api/users [SETUP]"
        );

        if (res.status === 200 && res.body.data?.data?.length > 0) {
            testUserId = res.body.data.data[0].id || res.body.data.data[0]._id;
            console.log(`    ✅ Test user ID: ${testUserId}`);
        }
    });

    // ========================================
    // PUT /api/users/:id
    // ========================================
    describe("PUT /api/users/:id", function () {
        it("harus berhasil update nama user (admin)", async function () {
            if (!testUserId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .put(`/api/users/${testUserId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ name: "Updated Name Mocha" }),
                "PUT",
                `/api/users/${testUserId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal update tanpa token", async function () {
            if (!testUserId) this.skip();

            const res = await timeRequest(
                request
                    .put(`/api/users/${testUserId}`)
                    .send({ name: "Should Fail" }),
                "PUT",
                `/api/users/${testUserId}`
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal update dengan ID tidak valid", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .put("/api/users/000000000000000000000000")
                    .set("Authorization", `Bearer ${token}`)
                    .send({ name: "Invalid ID" }),
                "PUT",
                "/api/users/000000000000000000000000"
            );

            expect(res.status).to.be.oneOf([404, 400]);
            expect(res.body.success).to.be.false;
        });
    });
});
