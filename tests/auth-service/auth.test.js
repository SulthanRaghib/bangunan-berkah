/**
 * ============================================
 * AUTH SERVICE — Authentication Tests
 * ============================================
 * Black-box testing untuk endpoint autentikasi:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Auth Service — Authentication", function () {
    const request = createRequest();
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    let registeredToken = null;
    let registeredRefreshToken = null;

    // ========================================
    // POST /api/auth/register
    // ========================================
    describe("POST /api/auth/register", function () {
        it("harus berhasil register user baru", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/register")
                    .send({
                    name: "Test User Mocha",
                    email: uniqueEmail,
                    password: "password123",
                }),
                'POST',
                '/api/auth/register'
            );

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property("token");
            expect(res.body.data).to.have.property("refreshToken");
            expect(res.body.data.user).to.have.property("email", uniqueEmail);

            registeredToken = res.body.data.token;
            registeredRefreshToken = res.body.data.refreshToken;
        });

        it("harus gagal register dengan email yang sudah terdaftar", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/register")
                    .send({
                    name: "Duplicate User",
                    email: uniqueEmail,
                    password: "password123",
                }),
                'POST',
                '/api/auth/register'
            );

            expect(res.status).to.be.oneOf([400, 409]);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal register tanpa field wajib", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/register")
                    .send({
                    name: "Incomplete User",
                }),
                'POST',
                '/api/auth/register'
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal register dengan password terlalu pendek", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/register")
                    .send({
                    name: "Short Pass",
                    email: `short_${Date.now()}@example.com`,
                    password: "123",
                }),
                'POST',
                '/api/auth/register'
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // POST /api/auth/login
    // ========================================
    describe("POST /api/auth/login", function () {
        it("harus berhasil login dengan kredensial benar", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/login")
                    .send(global.TEST_ADMIN),
                'POST',
                '/api/auth/login'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property("token");
            expect(res.body.data).to.have.property("refreshToken");
            expect(res.body.data.user).to.have.property("email", global.TEST_ADMIN.email);
            expect(res.body.data.user).to.have.property("role", "admin");
        });

        it("harus gagal login dengan password salah", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/login")
                    .send({
                    email: global.TEST_ADMIN.email,
                    password: "wrongpassword",
                }),
                'POST',
                '/api/auth/login'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal login dengan email yang tidak terdaftar", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/login")
                    .send({
                    email: "notexist@example.com",
                    password: "password123",
                }),
                'POST',
                '/api/auth/login'
            );

            expect(res.status).to.be.oneOf([401, 404]);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal login tanpa field wajib", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/login")
                    .send({}),
                'POST',
                '/api/auth/login'
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // POST /api/auth/refresh
    // ========================================
    describe("POST /api/auth/refresh", function () {
        it("harus berhasil refresh token", async function () {
            // Login dulu untuk dapat refresh token
            const loginRes = await timeRequest(
                request
                    .post("/api/auth/login")
                    .send(global.TEST_ADMIN),
                'POST',
                '/api/auth/login'
            );

            const refreshToken = loginRes.body.data.refreshToken;

            const res = await timeRequest(
                request
                    .post("/api/auth/refresh")
                    .send({ refreshToken }),
                'POST',
                '/api/auth/refresh'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property("token");
        });

        it("harus gagal refresh tanpa token", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/refresh")
                    .send({}),
                'POST',
                '/api/auth/refresh'
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // POST /api/auth/logout
    // ========================================
    describe("POST /api/auth/logout", function () {
        it("harus berhasil logout dengan token valid", async function () {
            // Login untuk dapat token baru (bukan token cached)
            const loginRes = await timeRequest(
                request
                    .post("/api/auth/login")
                    .send(global.TEST_ADMIN),
                'POST',
                '/api/auth/login'
            );

            const token = loginRes.body.data.token;

            const res = await timeRequest(
                request
                    .post("/api/auth/logout")
                    .set("Authorization", `Bearer ${token}`),
                'POST',
                '/api/auth/logout'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it("harus gagal logout tanpa token", async function () {
            const res = await timeRequest(
                request
                    .post("/api/auth/logout"),
                'POST',
                '/api/auth/logout'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });
    });
});
