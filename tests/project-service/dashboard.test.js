/**
 * ============================================
 * PROJECT SERVICE — Dashboard Tests
 * ============================================
 * Black-box testing untuk endpoint dashboard:
 * - GET /api/dashboard/stats
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Project Service — Dashboard", function () {
    const request = createRequest();

    // ========================================
    // GET /api/dashboard/stats
    // ========================================
    describe("GET /api/dashboard/stats", function () {
        it("harus berhasil mengambil statistik dashboard (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/dashboard/stats")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/dashboard/stats'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal tanpa token", async function () {
            const res = await timeRequest(
                request.get("/api/dashboard/stats"),
                'GET',
                '/api/dashboard/stats'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal dengan role user biasa", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .get("/api/dashboard/stats")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/dashboard/stats'
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });
    });
});
