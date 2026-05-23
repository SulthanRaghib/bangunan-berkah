/**
 * ============================================
 * GLOBAL TEST SETUP
 * ============================================
 * Loaded before all test files via .mocharc.yml
 * Sets up global variables and configuration
 */

const { expect } = require("chai");

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

console.log("\n" + "=".repeat(60));
console.log("  🧪 PT Solusi Bangunan Berkah — Black-Box Testing");
console.log("  📡 Target: " + global.BASE_URL);
console.log("=".repeat(60) + "\n");
