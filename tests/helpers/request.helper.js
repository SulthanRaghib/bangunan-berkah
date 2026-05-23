/**
 * ============================================
 * REQUEST HELPER
 * ============================================
 * Pre-configured supertest instance pointing to API Gateway
 */

const supertest = require("supertest");

/**
 * Create a supertest request agent targeting the API Gateway
 * @returns {supertest.SuperTest} Configured supertest instance
 */
function createRequest() {
    return supertest(global.BASE_URL);
}

module.exports = { createRequest };
