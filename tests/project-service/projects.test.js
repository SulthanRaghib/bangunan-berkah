/**
 * ============================================
 * PROJECT SERVICE — Admin Project Tests
 * ============================================
 * Black-box testing untuk endpoint admin proyek:
 * - POST   /api/projects
 * - GET    /api/projects
 * - GET    /api/projects/:projectCode
 * - PUT    /api/projects/:projectCode
 * - PATCH  /api/projects/:projectCode/status
 * - PATCH  /api/projects/:projectCode/progress
 * - POST   /api/projects/:projectCode/photos
 * - GET    /api/projects/:projectCode/photos
 * - DELETE /api/projects/:projectCode/photos
 * - DELETE /api/projects/:projectCode
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Project Service — Admin Projects", function () {
    const request = createRequest();
    let createdProjectCode = null;

    // Create a project before running other tests
    before(async function () {
        const token = await getAdminToken();

        const res = await timeRequest(
            request
                .post("/api/projects")
                .set("Authorization", `Bearer ${token}`)
                .send({
                projectName: `Proyek Testing Mocha ${Date.now()}`,
                description: "Proyek untuk pengujian otomatis",
                projectType: "konstruksi",
                customerName: `Client Mocha Test ${Date.now()}`,
                customerAddress: "Jl. Testing No. 1, Jakarta Selatan",
            }),
            'POST',
            '/api/projects'
        );

        if (res.status === 201 || res.status === 200) {
            createdProjectCode = res.body.data?.projectCode;
            console.log(`✅ Test project created: ${createdProjectCode}`);
        } else {
            console.error(`❌ Project creation failed (${res.status}):`, res.body);
        }
    });

    // ========================================
    // POST /api/projects
    // ========================================
    describe("POST /api/projects", function () {
        it("harus berhasil membuat proyek baru (admin) — minimal fields", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                    projectName: "Proyek Testing Mocha Minimal",
                    projectType: "konstruksi",
                    customerName: "Client Mocha Test",
                    customerAddress: "Jl. Testing No. 2, Bandung",
                }),
                'POST',
                '/api/projects'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;
        });

        it("harus berhasil membuat proyek tipe furniture", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                    projectName: "Proyek Furniture Mocha",
                    projectType: "furniture",
                    customerName: "Client Furniture Test",
                    customerAddress: "Jl. Furniture No. 1, Surabaya",
                }),
                'POST',
                '/api/projects'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;
        });

        it("harus berhasil membuat proyek tipe design_and_build", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                    projectName: "Proyek Design and Build Mocha",
                    projectType: "design_and_build",
                    customerName: "Client DAB Test",
                    customerAddress: "Jl. Design No. 1, Jakarta Pusat",
                    budget: 100000000,
                    startDate: new Date().toISOString(),
                    estimatedEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                }),
                'POST',
                '/api/projects'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;
        });

        it("harus berhasil membuat proyek dengan progress awal", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                    projectName: "Proyek Dengan Progress Awal",
                    projectType: "konstruksi",
                    customerName: "Client Progress Test",
                    customerAddress: "Jl. Progress No. 1, Semarang",
                    progress: 25,
                }),
                'POST',
                '/api/projects'
            );

            expect(res.status).to.be.oneOf([200, 201]);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal membuat proyek tanpa token", async function () {
            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .send({ projectName: "Gagal" }),
                'POST',
                '/api/projects'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal membuat proyek dengan role user", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .set("Authorization", `Bearer ${token}`)
                    .send({ projectName: "Gagal" }),
                'POST',
                '/api/projects'
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal membuat proyek tanpa customerAddress", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                    projectName: "Proyek Tanpa Alamat",
                    projectType: "konstruksi",
                    customerName: "Client Test",
                    // customerAddress missing — should fail
                }),
                'POST',
                '/api/projects'
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal membuat proyek dengan projectType tidak valid", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                    projectName: "Proyek Tipe Tidak Valid",
                    projectType: "invalid_type",
                    customerName: "Client Test",
                    customerAddress: "Jl. Invalid No. 1, Jakarta",
                }),
                'POST',
                '/api/projects'
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/projects
    // ========================================
    describe("GET /api/projects", function () {
        it("harus berhasil mengambil daftar proyek (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/projects")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/projects'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.data).to.be.an("array");
        });
    });

    // ========================================
    // GET /api/projects/:projectCode
    // ========================================
    describe("GET /api/projects/:projectCode", function () {
        it("harus berhasil mengambil detail proyek", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get(`/api/projects/${createdProjectCode}`)
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                `/api/projects/${createdProjectCode}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property("photos");
        });

        it("harus gagal dengan kode proyek tidak valid", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/projects/INVALID-CODE-999")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/projects/INVALID-CODE-999'
            );

            expect(res.status).to.be.oneOf([404, 400]);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // PUT /api/projects/:projectCode
    // ========================================
    describe("PUT /api/projects/:projectCode", function () {
        it("harus berhasil update proyek (admin)", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .put(`/api/projects/${createdProjectCode}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                    projectName: "Proyek Updated Mocha",
                    description: "Deskripsi sudah di-update oleh Mocha",
                }),
                'PUT',
                `/api/projects/${createdProjectCode}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PATCH /api/projects/:projectCode/status
    // ========================================
    describe("PATCH /api/projects/:projectCode/status", function () {
        it("harus berhasil update status proyek", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/projects/${createdProjectCode}/status`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ status: "in_progress" }),
                'PATCH',
                `/api/projects/${createdProjectCode}/status`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PATCH /api/projects/:projectCode/progress
    // ========================================
    describe("PATCH /api/projects/:projectCode/progress", function () {
        it("harus berhasil update progress proyek langsung", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/projects/${createdProjectCode}/progress`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ progress: 45 }),
                'PATCH',
                `/api/projects/${createdProjectCode}/progress`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal update progress di luar range 0-100", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/projects/${createdProjectCode}/progress`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ progress: 150 }),
                'PATCH',
                `/api/projects/${createdProjectCode}/progress`
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal update progress tanpa field progress", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/projects/${createdProjectCode}/progress`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({}),
                'PATCH',
                `/api/projects/${createdProjectCode}/progress`
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // POST/GET/DELETE /api/projects/:projectCode/photos
    // ========================================
    describe("Project Photos", function () {
        it("GET - harus berhasil mengambil foto proyek (awalnya kosong)", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get(`/api/projects/${createdProjectCode}/photos`)
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                `/api/projects/${createdProjectCode}/photos`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property("photos");
        });
    });

    // ========================================
    // DELETE /api/projects/:projectCode
    // ========================================
    describe("DELETE /api/projects/:projectCode", function () {
        it("harus berhasil hapus proyek (admin)", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .delete(`/api/projects/${createdProjectCode}`)
                    .set("Authorization", `Bearer ${token}`),
                'DELETE',
                `/api/projects/${createdProjectCode}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
