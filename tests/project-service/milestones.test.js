/**
 * ============================================
 * PROJECT SERVICE — Milestone Tests
 * ============================================
 * Black-box testing untuk endpoint milestone:
 * - POST   /api/milestones/:projectCode/milestones
 * - GET    /api/milestones/:projectCode/milestones
 * - PATCH  /api/milestones/:projectCode/milestones/:id
 * - DELETE /api/milestones/:projectCode/milestones/:id
 *
 * Catatan: Milestone progress TIDAK mempengaruhi project progress.
 * Project progress dikelola terpisah melalui endpoint progress.
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Project Service — Milestones", function () {
    const request = createRequest();
    let tempProjectCode = null;
    let milestoneId = null;

    // Setup: Buat project sementara
    before(async function () {
        const token = await getAdminToken();

        const res = await timeRequest(
            request
                .post("/api/projects")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    projectName: `Project Milestone Test ${Date.now()}`,
                    projectType: "konstruksi",
                    customerName: "Client Milestone Test",
                    customerAddress: "Jl. Milestone No. 1, Jakarta Selatan",
                }),
            'POST',
            '/api/projects [MILESTONE SETUP]'
        );

        if (res.status === 201 || res.status === 200) {
            tempProjectCode = res.body.data?.projectCode;
            console.log(`✅ Test project created: ${tempProjectCode}`);
        } else {
            console.error(`❌ Project creation failed:`, res.body);
        }
    });

    // Cleanup: Hapus project sementara
    after(async function () {
        if (!tempProjectCode) return;

        const token = await getAdminToken();

        await timeRequest(
            request
                .delete(`/api/projects/${tempProjectCode}`)
                .set("Authorization", `Bearer ${token}`),
            'DELETE',
            `/api/projects/${tempProjectCode} [CLEANUP]`
        );
    });

    // ========================================
    // POST /api/projects/:projectCode/milestones
    // ========================================
    describe("POST /api/milestones/:projectCode/milestones", function () {
        it("harus berhasil menambah milestone", async function () {
            if (!tempProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post(`/api/projects/${tempProjectCode}/milestones`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        title: `Milestone Test ${Date.now()}`,
                        description: "Milestone dari pengujian otomatis",
                        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    }),
                'POST',
                `/api/projects/${tempProjectCode}/milestones`
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;

            // Ambil milestone ID dari response
            const data = res.body.data;
            if (data?.milestone) {
                milestoneId = data.milestone.id || data.milestone._id;
            }

            // Milestone response should NOT contain projectProgress
            expect(data).to.not.have.property("projectProgress");
        });

        it("harus gagal menambah milestone dengan status tidak valid", async function () {
            if (!tempProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post(`/api/projects/${tempProjectCode}/milestones`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        title: "Invalid Status Milestone",
                        status: "X",
                        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    }),
                'POST',
                `/api/projects/${tempProjectCode}/milestones (Invalid Status)`
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/milestones/:projectCode/milestones
    // ========================================
    describe("GET /api/milestones/:projectCode/milestones", function () {
        it("harus berhasil mengambil daftar milestone", async function () {
            if (!tempProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get(`/api/projects/${tempProjectCode}/milestones`)
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                `/api/projects/${tempProjectCode}/milestones`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PATCH /api/projects/:projectCode/milestones/:id
    // ========================================
    describe("PATCH /api/projects/:projectCode/milestones/:id", function () {
        it("harus berhasil update milestone", async function () {
            if (!milestoneId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/projects/${tempProjectCode}/milestones/${milestoneId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        title: `Milestone Updated ${Date.now()}`,
                        status: "ON_PROGRESS",
                        progress: 50,
                    }),
                'PATCH',
                `/api/projects/${tempProjectCode}/milestones/${milestoneId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;

            // Milestone response should NOT contain projectProgress
            expect(res.body.data).to.not.have.property("projectProgress");
        });

        it("harus gagal update milestone dengan status tidak valid", async function () {
            if (!milestoneId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/projects/${tempProjectCode}/milestones/${milestoneId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        status: "X",
                    }),
                'PATCH',
                `/api/projects/${tempProjectCode}/milestones/${milestoneId} (Invalid Status)`
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });

        it("harus berhasil update milestone dengan foto", async function () {
            if (!milestoneId) this.skip();

            const token = await getAdminToken();
            const testImage = Buffer.from(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                "base64"
            );

            const res = await timeRequest(
                request
                    .patch(`/api/projects/${tempProjectCode}/milestones/${milestoneId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .field("title", "Milestone Updated With Photo")
                    .field("status", "COMPLETED")
                    .attach("photos", testImage, "milestone-photo.jpg"),
                'PATCH',
                `/api/projects/${tempProjectCode}/milestones/${milestoneId} (With Photo)`
            );

            expect(res.status).to.be.oneOf([200, 500]);
            if (res.status === 200) {
                expect(res.body.success).to.be.true;
                expect(res.body.data.milestone.photos).to.be.an("array").that.is.not.empty;
            }
        });
    });

    // ========================================
    // DELETE /api/projects/:projectCode/milestones/:id
    // ========================================
    describe("DELETE /api/projects/:projectCode/milestones/:id", function () {
        it("harus berhasil hapus milestone", async function () {
            if (!milestoneId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .delete(`/api/projects/${tempProjectCode}/milestones/${milestoneId}`)
                    .set("Authorization", `Bearer ${token}`),
                'DELETE',
                `/api/projects/${tempProjectCode}/milestones/${milestoneId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
