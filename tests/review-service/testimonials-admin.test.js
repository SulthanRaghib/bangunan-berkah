/**
 * ============================================
 * REVIEW SERVICE — Admin Testimonial Tests
 * ============================================
 * Black-box testing untuk endpoint admin testimonial:
 * - GET    /api/testimonials/admin
 * - GET    /api/testimonials/admin/:id
 * - PUT    /api/testimonials/admin/:id
 * - PATCH  /api/testimonials/admin/:id/approve
 * - PATCH  /api/testimonials/admin/:id/reject
 * - DELETE /api/testimonials/admin/:id
 */

const { createRequest } = require("../helpers/request.helper");
const { getAdminToken, getUserToken } = require("../helpers/auth.helper");
const { timeRequest } = require("../helpers/timer.helper");

describe("Review Service — Admin Testimonials", function () {
    const request = createRequest();
    let testimonialId = null;

    // ========================================
    // GET /api/testimonials/admin
    // ========================================
    describe("GET /api/testimonials/admin", function () {
        it("harus berhasil mengambil semua testimonial (admin)", async function () {
            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get("/api/testimonials/admin")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/testimonials/admin'
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;

            // Response format: {data: {data: [...], pagination: {...}}}
            const items = res.body.data?.data || res.body.data;
            if (Array.isArray(items) && items.length > 0) {
                testimonialId = items[0].id || items[0]._id;
            }
        });

        it("harus gagal tanpa token", async function () {
            const res = await timeRequest(
                request.get("/api/testimonials/admin"),
                'GET',
                '/api/testimonials/admin [NO TOKEN]'
            );

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it("harus gagal dengan role user biasa", async function () {
            const token = await getUserToken();

            const res = await timeRequest(
                request
                    .get("/api/testimonials/admin")
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                '/api/testimonials/admin [USER ROLE]'
            );

            expect(res.status).to.equal(403);
            expect(res.body.success).to.be.false;
        });
    });

    // ========================================
    // GET /api/testimonials/admin/:id
    // ========================================
    describe("GET /api/testimonials/admin/:id", function () {
        it("harus berhasil mengambil detail testimonial (admin)", async function () {
            if (!testimonialId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .get(`/api/testimonials/admin/${testimonialId}`)
                    .set("Authorization", `Bearer ${token}`),
                'GET',
                `/api/testimonials/admin/${testimonialId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PUT /api/testimonials/admin/:id
    // ========================================
    describe("PUT /api/testimonials/admin/:id", function () {
        it("harus berhasil update testimonial (admin)", async function () {
            if (!testimonialId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .put(`/api/testimonials/admin/${testimonialId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        content: "Testimonial updated oleh Mocha testing",
                    }),
                'PUT',
                `/api/testimonials/admin/${testimonialId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PATCH /api/testimonials/admin/:id/approve
    // ========================================
    describe("PATCH /api/testimonials/admin/:id/approve", function () {
        it("harus berhasil approve testimonial (admin)", async function () {
            if (!testimonialId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/testimonials/admin/${testimonialId}/approve`)
                    .set("Authorization", `Bearer ${token}`),
                'PATCH',
                `/api/testimonials/admin/${testimonialId}/approve`
            );

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ========================================
    // PATCH /api/testimonials/admin/:id/reject
    // ========================================
    describe("PATCH /api/testimonials/admin/:id/reject", function () {
        it("harus berhasil reject testimonial (admin)", async function () {
            if (!testimonialId) this.skip();

            const token = await getAdminToken();

            const res = await timeRequest(
                request
                    .patch(`/api/testimonials/admin/${testimonialId}/reject`)
                    .set("Authorization", `Bearer ${token}`),
                'PATCH',
                `/api/testimonials/admin/${testimonialId}/reject`
            );
        });
    });
});
