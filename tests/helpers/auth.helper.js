/**
 * ============================================
 * AUTH HELPER
 * ============================================
 * Provides authentication tokens for test suites
 * Caches tokens to avoid repeated login calls
 */

const { createRequest } = require("./request.helper");

// Token cache
let adminToken = null;
let userToken = null;
let loginFailed = false;

/**
 * Login and get access token
 * @param {Object} credentials - { email, password }
 * @returns {Promise<string>} JWT access token
 */
async function login(credentials) {
    const res = await createRequest()
        .post("/api/auth/login")
        .send(credentials);

    if (res.status !== 200 || !res.body.success || !res.body.data?.token) {
        loginFailed = true;
        throw new Error(
            `Login gagal untuk ${credentials.email} (status: ${res.status}): ${res.body.message || "Unknown error"}. ` +
            `Pastikan: 1) docker-compose up -d --force-recreate api-gateway, 2) docker exec -it auth-service npm run prisma:seed`
        );
    }

    return res.body.data.token;
}

/**
 * Get admin token (cached)
 * @returns {Promise<string>} Admin JWT token
 */
async function getAdminToken() {
    if (loginFailed) {
        throw new Error("Login sebelumnya gagal. Periksa kredensial dan seeder.");
    }
    if (!adminToken) {
        adminToken = await login(global.TEST_ADMIN);
    }
    return adminToken;
}

/**
 * Get regular user token (cached)
 * @returns {Promise<string>} User JWT token
 */
async function getUserToken() {
    if (loginFailed) {
        throw new Error("Login sebelumnya gagal. Periksa kredensial dan seeder.");
    }
    if (!userToken) {
        userToken = await login(global.TEST_USER);
    }
    return userToken;
}

/**
 * Clear cached tokens (useful after logout tests)
 */
function clearTokenCache() {
    adminToken = null;
    userToken = null;
    loginFailed = false;
}

module.exports = {
    login,
    getAdminToken,
    getUserToken,
    clearTokenCache,
};
