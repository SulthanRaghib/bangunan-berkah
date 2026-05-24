/**
 * ============================================
 * PROJECT SERVICE — Public Tracking Tests
 * ============================================
 * Black-box testing untuk endpoint publik tracking:
 * - GET /api/projects/track/:projectCode
 * - GET /api/projects/summary/:projectCode
 */

const { createRequest } = require("../helpers/request.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Project Service — Public Tracking", function () {
    const request = createRequest();

    // ========================================
    // GET /api/projects/track/:projectCode
    // ========================================
    describe("GET /api/projects/track/:projectCode", function () {
        it("harus gagal track project yang tidak ada", async function () {
            const res = await timeRequest(
                request.get("/api/projects/track/NONEXISTENT-999"),
                'GET',
                '/api/projects/track/NONEXISTENT-999'
            );

            expect(res.status).to.be.oneOf([404, 400]);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/projects/summary/:projectCode
    // ========================================
    describe("GET /api/projects/summary/:projectCode", function () {
        it("harus gagal get summary project yang tidak ada", async function () {
            const res = await timeRequest(
                request.get("/api/projects/summary/NONEXISTENT-999"),
                'GET',
                '/api/projects/summary/NONEXISTENT-999'
            );

            expect(res.status).to.be.oneOf([404, 400]);
            expect(res.body.success).to.be.false;
        });
    });
});
