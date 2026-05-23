/**
 * ============================================
 * REVIEW SERVICE — Admin Review Tests
 * ============================================
 * Black-box testing untuk endpoint admin review:
 * - GET    /api/reviews/admin
 * - GET    /api/reviews/admin/:id
 * - PUT    /api/reviews/admin/:projectCode
 * - DELETE /api/reviews/admin/:projectCode
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Review Service — Admin Reviews", function () {
    const request = createRequest();
    let reviewId = null;

    // Create test project and review before running tests
    before(async function () {
        // First create a project
        const adminToken = await getAdminToken();
        const projectRes = await timeRequest(
            request
                .post("/api/projects")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    projectName: `Review Test Project ${Date.now()}`,
                    projectType: "konstruksi",
                    customerName: "Review Test Customer",
                    customerEmail: `customer${Date.now()}@test.com`,
                    customerPhone: "08123456789",
                    customerAddress: "Jl. Test No. 1",
                    startDate: new Date().toISOString(),
                    estimatedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    budget: 50000000,
                }),
            'POST',
            '/api/projects'
        );

        let projectCode = projectRes.body.data?.projectCode;
        console.log(`📌 Project for review test - Status: ${projectRes.status}, ProjectCode: ${projectCode}`);

        if (!projectCode) {
            console.error(`❌ Project creation failed:`, projectRes.body);
            return;
        }

        // Update project status to completed
        const statusRes = await timeRequest(
            request
                .patch(`/api/projects/${projectCode}/status`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "completed" }),
            'PATCH',
            `/api/projects/${projectCode}/status`
        );

        console.log(`📝 Project status update - Status: ${statusRes.status}`);

        // Then create a review for that project
        const res = await timeRequest(
            request
                .post("/api/reviews")
                .send({
                    projectCode: projectCode,
                    customerName: "Test Customer",
                    customerEmail: `customer${Date.now()}@test.com`,
                    rating: 5,
                    comment: "Test review untuk admin test",
                }),
            'POST',
            '/api/reviews'
        );

        console.log(`📝 Review creation - Status: ${res.status}, Success: ${res.body.success}, Message: ${res.body.message}`);
        if (res.status === 201 || res.status === 200) {
            reviewId = res.body.data?.id || res.body.data?._id;
            console.log(`✅ Test review created: ${reviewId}`);
        } else {
            console.error(`❌ Review creation failed:`, res.body);
        }
    });

    // ========================================
    // GET /api/reviews/admin
    // ========================================
    describe("GET /api/reviews/admin", function () {
        it("harus berhasil mengambil semua review (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/reviews/admin")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/reviews/admin'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;

            // Simpan ID untuk test selanjutnya
            // Response format: {data: {data: [...], pagination: {...}}}
            const items = res.body.data?.data || res.body.data;
            if (Array.isArray(items) && items.length > 0) {
                reviewId = items[0].id || items[0]._id;
            }
        });

        it("harus gagal tanpa token", async function () {
            const res = await timeRequest(
                request.get("/api/reviews/admin"),
                'GET',
                '/api/reviews/admin [NO TOKEN]'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal dengan role user biasa", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .get("/api/reviews/admin")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/reviews/admin [USER ROLE]'
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/reviews/admin/:id
    // ========================================
    describe("GET /api/reviews/admin/:id", function () {
        it("harus berhasil mengambil detail review (admin)", async function () {
            if (!reviewId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get(`/api/reviews/admin/${reviewId}`)
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                `/api/reviews/admin/${reviewId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
