/**
 * ============================================
 * CHAT SERVICE — Health Check Tests
 * ============================================
 * Black-box testing untuk chat service health:
 * - GET /health
 */

const { createRequest } = require("../helpers/request.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Chat Service — Health Check", function () {
    const request = createRequest();

    describe("GET /health (via Gateway)", function () {
        it("harus berhasil mengecek health API Gateway", async function () {
            const res = await timeRequest(
                request.get("/health"),
                'GET',
                '/health'
            );

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("status", "healthy");
        });
    });
});
