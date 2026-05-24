/**
 * ============================================
 * GLOBAL TEST SETUP
 * ============================================
 * Loaded before all test files via .mocharc.yml
 * Sets up global variables, configuration, and prints
 * the test banner with endpoint registry table
 */

const { expect } = require("chai");
const { printEndpointTable } = require("./reporter.helper");

// Make expect available globally
global.expect = expect;

// Base URL for API Gateway
global.BASE_URL = process.env.TEST_BASE_URL || "http://localhost:8080";

// Test credentials (must match seeder data)
global.TEST_ADMIN = {
    email: "admin@solusi-bangunan.com",
    password: process.env.TEST_ADMIN_PASSWORD || "admin123",
};

global.TEST_USER = {
    email: "user@solusi-bangunan.com",
    password: process.env.TEST_USER_PASSWORD || "admin123",
};

// ── Print Banner ───────────────────────────────────────────
const now = new Date();
const timestamp = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
});

console.log("\n" + "═".repeat(64));
console.log("  🧪 PT Solusi Bangunan Berkah — API Testing Suite");
console.log("  📡 Base URL: " + global.BASE_URL);
console.log("  🕐 Started: " + timestamp);
console.log("═".repeat(64));

// ── Print Endpoint Table ───────────────────────────────────
printEndpointTable();
