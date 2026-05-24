/**
 * ============================================
 * AUTH SERVICE — Login Tests (Admin)
 * ============================================
 * Black-box testing untuk endpoint login:
 * - POST /api/auth/login
 */

const { createRequest } = require("../helpers/request.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Auth Service — Login (Admin)", function () {
    const request = createRequest();

    // ========================================
    // POST /api/auth/login
    // ========================================
    describe("POST /api/auth/login", function () {
        it("harus berhasil login dengan kredensial admin", async function () {
            const res = await timeRequest(
                request.post("/api/auth/login").send(global.TEST_ADMIN),
                "POST",
                "/api/auth/login"
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
                request.post("/api/auth/login").send({
                    email: global.TEST_ADMIN.email,
                    password: "wrongpassword",
                }),
                "POST",
                "/api/auth/login"
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal login dengan email tidak terdaftar", async function () {
            const res = await timeRequest(
                request.post("/api/auth/login").send({
                    email: "notexist@example.com",
                    password: "password123",
                }),
                "POST",
                "/api/auth/login"
            );

            expect(res.status).to.be.oneOf([401, 404]);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal login tanpa field wajib", async function () {
            const res = await timeRequest(
                request.post("/api/auth/login").send({}),
                "POST",
                "/api/auth/login"
            );

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
        });
    });
});
