/**
 * ============================================
 * TIMER HELPER
 * ============================================
 * Tracks and logs response time + HTTP status code
 * for each API request during testing
 *
 * Output format:
 *   POST   /api/auth/login → 200 OK — 45ms ⚡
 *   GET    /api/auth/profile → 401 Unauthorized — 12ms ⚡
 */

// ── HTTP Status Text Map ───────────────────────────────────
const HTTP_STATUS = {
    200: "OK",
    201: "Created",
    204: "No Content",
    301: "Moved Permanently",
    302: "Found",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
};

// ── ANSI Colors ────────────────────────────────────────────
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function getStatusColor(status) {
    if (status >= 200 && status < 300) return "\x1b[32m"; // Green
    if (status >= 300 && status < 400) return "\x1b[36m"; // Cyan
    if (status >= 400 && status < 500) return "\x1b[33m"; // Yellow
    return "\x1b[31m"; // Red (5xx)
}

function getSpeedInfo(ms) {
    if (ms > 1000) return { emoji: "🐢", color: "\x1b[33m" }; // Slow — Yellow
    if (ms > 500) return { emoji: "⚠️", color: "\x1b[36m" };  // Medium — Cyan
    return { emoji: "⚡", color: "\x1b[32m" };                  // Fast — Green
}

/**
 * Wrap a supertest request to track and log response time + status code
 *
 * @param {Promise} requestPromise - The supertest request promise
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {string} endpoint - API endpoint path
 * @returns {Promise} The response object
 */
async function timeRequest(requestPromise, method, endpoint) {
    const startTime = process.hrtime.bigint();

    try {
        const response = await requestPromise;
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        const statusCode = response.status;
        const statusText = HTTP_STATUS[statusCode] || "Unknown";
        const statusColor = getStatusColor(statusCode);
        const speed = getSpeedInfo(durationMs);

        const baseUrl = global.BASE_URL || "http://localhost:8080";
        const methodStr = method.padEnd(6);
        const arrow = `${DIM}→${RESET}`;
        const statusStr = `${statusColor}${BOLD}${statusCode}${RESET} ${statusColor}${statusText}${RESET}`;
        const timeStr = `${speed.color}${durationMs.toFixed(0)}ms${RESET}`;
        const fullUrl = `${DIM}${baseUrl}${RESET}${endpoint}`;

        console.log(
            `      ${methodStr} ${fullUrl} ${arrow} ${statusStr} ${DIM}—${RESET} ${timeStr} ${speed.emoji}`
        );

        return response;
    } catch (error) {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        const baseUrl = global.BASE_URL || "http://localhost:8080";
        console.log(
            `      ${method.padEnd(6)} ${DIM}${baseUrl}${RESET}${endpoint} ${DIM}→${RESET} \x1b[31m${BOLD}ERROR${RESET} ${DIM}—${RESET} ${durationMs.toFixed(0)}ms ❌ (${error.message})`
        );
        throw error;
    }
}

/**
 * Simple version: Just log time for any promise
 * Usage: await logTime(() => request.get('/api/endpoint'), 'GET /api/endpoint')
 */
async function logTime(requestFn, label) {
    const startTime = process.hrtime.bigint();

    try {
        const response = await requestFn();
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;
        const speed = getSpeedInfo(durationMs);

        console.log(
            `      ${label} ${DIM}—${RESET} ${speed.color}${durationMs.toFixed(0)}ms${RESET} ${speed.emoji}`
        );
        return response;
    } catch (error) {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;
        console.log(
            `      ${label} ${DIM}—${RESET} \x1b[31m${durationMs.toFixed(0)}ms${RESET} ❌`
        );
        throw error;
    }
}

module.exports = { timeRequest, logTime };
