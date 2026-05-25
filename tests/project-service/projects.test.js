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

        it("harus berhasil membuat proyek tipe design", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .post("/api/projects")
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                    projectName: "Proyek Design Mocha",
                    projectType: "design",
                    customerName: "Client Design Test",
                    customerAddress: "Jl. Design No. 1, Surabaya",
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
    // Milestone-Based Progress Synchronization Tests
    // ========================================
    describe("Milestone-Based Progress Synchronization", function () {
        it("harus otomatis mengupdate progress proyek berdasarkan status milestone", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            // 1. Create milestone 1 (PENDING)
            const addRes1 = await request
                .post(`/api/projects/${createdProjectCode}/milestones`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Pondasi Awal",
                    status: "PENDING",
                    targetDate: new Date().toISOString()
                });
            expect(addRes1.status).to.be.oneOf([200, 201]);
            const milestoneId1 = addRes1.body.data.milestone.id;

            // Check project progress (should be 0%)
            const projRes1 = await request
                .get(`/api/projects/${createdProjectCode}`)
                .set("Authorization", `Bearer ${token}`);
            expect(projRes1.body.data.progress).to.equal(0);

            // 2. Update milestone 1 to ON_PROGRESS / berjalan
            const updateRes1 = await request
                .patch(`/api/projects/${createdProjectCode}/milestones/${milestoneId1}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "berjalan"
                });
            expect(updateRes1.status).to.equal(200);

            // Check project progress (should be 50% because milestone 1 is ON_PROGRESS = 50%)
            const projRes2 = await request
                .get(`/api/projects/${createdProjectCode}`)
                .set("Authorization", `Bearer ${token}`);
            expect(projRes2.body.data.progress).to.equal(50);

            // 3. Update milestone 1 to selesai / COMPLETED
            const updateRes2 = await request
                .patch(`/api/projects/${createdProjectCode}/milestones/${milestoneId1}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "selesai"
                });
            expect(updateRes2.status).to.equal(200);

            // Check project progress (should be 100% because 1/1 completed = 100%)
            const projRes3 = await request
                .get(`/api/projects/${createdProjectCode}`)
                .set("Authorization", `Bearer ${token}`);
            expect(projRes3.body.data.progress).to.equal(100);

            // 4. Add milestone 2 (PENDING / menunggu)
            const addRes2 = await request
                .post(`/api/projects/${createdProjectCode}/milestones`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Struktur Rangka",
                    status: "menunggu",
                    targetDate: new Date().toISOString()
                });
            expect(addRes2.status).to.be.oneOf([200, 201]);
            const milestoneId2 = addRes2.body.data.milestone.id;

            // Check project progress (should be 50% because (100 + 0) / 2 = 50%)
            const projRes4 = await request
                .get(`/api/projects/${createdProjectCode}`)
                .set("Authorization", `Bearer ${token}`);
            expect(projRes4.body.data.progress).to.equal(50);

            // 5. Update milestone 2 to berjalan (ON_PROGRESS = 50%)
            const updateRes3 = await request
                .patch(`/api/projects/${createdProjectCode}/milestones/${milestoneId2}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "berjalan"
                });
            expect(updateRes3.status).to.equal(200);

            // Check project progress (should be 75% because (100 + 50) / 2 = 75%)
            const projRes5 = await request
                .get(`/api/projects/${createdProjectCode}`)
                .set("Authorization", `Bearer ${token}`);
            expect(projRes5.body.data.progress).to.equal(75);

            // Cleanup: Delete milestone 1 and 2
            await request
                .delete(`/api/projects/${createdProjectCode}/milestones/${milestoneId1}`)
                .set("Authorization", `Bearer ${token}`);
            await request
                .delete(`/api/projects/${createdProjectCode}/milestones/${milestoneId2}`)
                .set("Authorization", `Bearer ${token}`);
        });
    });

    // ========================================
    // POST/GET/DELETE /api/projects/:projectCode/photos
    // ========================================
    describe("Project Photos", function () {
        let uploadedPhotoUrl = null;

        it("POST - harus berhasil upload foto dokumentasi proyek", async function () {
            if (!createdProjectCode) this.skip();
            this.timeout(15000); // upload bisa lambat

            const token = await getAdminToken();

            // Create a valid 1x1 transparent PNG for testing (Cloudinary friendly)
            const testImage = Buffer.from(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
                "base64"
            );

            const res = await timeRequest(
                request
                    .post(`/api/projects/${createdProjectCode}/photos`)
                    .set("Authorization", `Bearer ${token}`)
                    .attach("photos", testImage, "test-photo.jpg"),
                'POST',
                `/api/projects/${createdProjectCode}/photos`
            );

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property("uploadedPhotos");
            expect(res.body.data.uploadedPhotos).to.be.an("array").that.is.not.empty;

            // Save photo URL for DELETE test
            uploadedPhotoUrl = res.body.data.uploadedPhotos[0];
        });

        it("POST - harus gagal upload tanpa file", async function () {
            if (!createdProjectCode) this.skip();

            const token = await getAdminToken();

            // Send proper multipart with no file attached
            const res = await timeRequest(
                request
                    .post(`/api/projects/${createdProjectCode}/photos`)
                    .set("Authorization", `Bearer ${token}`)
                    .field("dummy", "no-file"),
                'POST',
                `/api/projects/${createdProjectCode}/photos`
            );

            expect(res.status).to.be.oneOf([400, 500]);
            expect(res.body.success).to.be.false;
        });

        it("GET - harus berhasil mengambil foto proyek (termasuk yang baru diupload)", async function () {
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

        it("DELETE - harus berhasil hapus foto dokumentasi proyek", async function () {
            if (!createdProjectCode || !uploadedPhotoUrl) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .delete(`/api/projects/${createdProjectCode}/photos`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ url: uploadedPhotoUrl }),
                'DELETE',
                `/api/projects/${createdProjectCode}/photos`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
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
