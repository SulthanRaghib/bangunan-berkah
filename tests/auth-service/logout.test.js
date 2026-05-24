/**
 * ============================================
 * AUTH SERVICE — Logout Tests (Admin)
 * ============================================
 * Black-box testing untuk endpoint logout:
 * - POST /api/auth/logout
 */

const { createRequest } = require("../helpers/request.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Auth Service — Logout (Admin)", function () {
    const request = createRequest();

    // ========================================
    // POST /api/auth/logout
    // ========================================
    describe("POST /api/auth/logout", function () {
        it("harus berhasil logout dengan token valid", async function () {
            // Login dulu untuk dapat token baru (bukan cached)
            const loginRes = await timeRequest(
                request.post("/api/auth/login").send(global.TEST_ADMIN),
                "POST",
                "/api/auth/login [LOGIN FOR LOGOUT]"
            );

            const token = loginRes.body.data.token;

            const res = await timeRequest(
                request
                    .post("/api/auth/logout")
                    .set("Authorization", `Bearer ${token}`),
                "POST",
                "/api/auth/logout"
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal logout tanpa token", async function () {
            const res = await timeRequest(
                request.post("/api/auth/logout"),
                "POST",
                "/api/auth/logout"
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal logout dengan token tidak valid", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/logout")
                    .set("Authorization", "Bearer invalidtoken123"),
                "POST",
                "/api/auth/logout"
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });
    });
});
