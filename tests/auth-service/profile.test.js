/**
 * ============================================
 * AUTH SERVICE — Profile Tests
 * ============================================
 * Black-box testing untuk endpoint profile:
 * - GET /api/auth/profile (protected)
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Auth Service — Profile", function () {
    const request = createRequest();

    // ========================================
    // GET /api/auth/profile
    // ========================================
    describe("GET /api/auth/profile", function () {
        it("harus berhasil mengambil profile admin", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/auth/profile")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/auth/profile'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.user).to.have.property("email");
            expect(res.body.data.user).to.have.property("name");
            expect(res.body.data.user).to.have.property("role");
        });

        it("harus berhasil mengambil profile user biasa", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .get("/api/auth/profile")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/auth/profile'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.user).to.have.property("role", "user");
        });

        it("harus gagal tanpa token", async function () {
            const res = await timeRequest(
                request
                    .get("/api/auth/profile"),
                'GET',
                '/api/auth/profile'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal dengan token tidak valid", async function () {
            const res = await timeRequest(
                request
                    .get("/api/auth/profile")
                    .set("Authorization", "Bearer invalidtoken123"),
                'GET',
                '/api/auth/profile'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });
    });
});
