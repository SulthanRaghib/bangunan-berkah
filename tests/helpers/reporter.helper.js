/**
 * ============================================
 * REPORTER HELPER
 * ============================================
 * Displays registered endpoints table at test start
 * Shows service name, HTTP method, path, and access level
 */

// ── Endpoint Registry ──────────────────────────────────────
const ENDPOINTS = {
    "Auth Service": [
        { method: "POST", path: "/api/auth/login", access: "Admin" },
        { method: "GET", path: "/api/auth/profile", access: "Admin" },
        { method: "PUT", path: "/api/users/:id", access: "Admin" },
        { method: "POST", path: "/api/auth/logout", access: "Admin" },
    ],
    "Project Service": [
        { method: "POST", path: "/api/projects", access: "Admin" },
        { method: "GET", path: "/api/projects", access: "Admin" },
        { method: "GET", path: "/api/projects/:code", access: "Admin" },
        { method: "PUT", path: "/api/projects/:code", access: "Admin" },
        { method: "DELETE", path: "/api/projects/:code", access: "Admin" },
        { method: "POST", path: "/api/projects/:code/milestones", access: "Admin" },
        { method: "GET", path: "/api/projects/:code/milestones", access: "Admin" },
        { method: "PATCH", path: "/api/projects/:code/milestones/:id", access: "Admin" },
        { method: "DELETE", path: "/api/projects/:code/milestones/:id", access: "Admin" },
        { method: "PATCH", path: "/api/projects/:code/progress", access: "Admin" },
        { method: "GET", path: "/api/projects/:code/photos", access: "Admin" },
        { method: "POST", path: "/api/projects/:code/photos", access: "Admin" },
        { method: "DELETE", path: "/api/projects/:code/photos", access: "Admin" },
    ],
    "Review Service": [
        { method: "GET", path: "/api/testimonials", access: "Public" },
        { method: "POST", path: "/api/testimonials", access: "Public" },
        { method: "GET", path: "/api/testimonials/admin", access: "Admin" },
        { method: "GET", path: "/api/testimonials/admin/:id", access: "Admin" },
        { method: "PUT", path: "/api/testimonials/admin/:id", access: "Admin" },
        { method: "DELETE", path: "/api/testimonials/admin/:id", access: "Admin" },
        { method: "PATCH", path: "/api/testimonials/admin/:id/approve", access: "Admin" },
        { method: "PATCH", path: "/api/testimonials/admin/:id/reject", access: "Admin" },
    ],
};

// ── ANSI Colors ────────────────────────────────────────────
const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    red: "\x1b[31m",
    white: "\x1b[37m",
};

const METHOD_COLORS = {
    GET: c.green,
    POST: c.yellow,
    PUT: c.cyan,
    PATCH: c.magenta,
    DELETE: c.red,
};

/**
 * Print a formatted table of all registered endpoints
 */
function printEndpointTable() {
    console.log(`\n  ${c.dim}📋 Registered Test Endpoints:${c.reset}\n`);

    let totalEndpoints = 0;

    for (const [serviceName, endpoints] of Object.entries(ENDPOINTS)) {
        totalEndpoints += endpoints.length;

        console.log(`  ${c.cyan}${c.bold}┌── ${serviceName} ${c.dim}(${endpoints.length} endpoints)${c.reset}`);

        endpoints.forEach((ep, i) => {
            const isLast = i === endpoints.length - 1;
            const prefix = isLast ? "└" : "├";
            const mColor = METHOD_COLORS[ep.method] || c.white;
            const accessTag =
                ep.access === "Public"
                    ? `${c.green}[Public]${c.reset}`
                    : `${c.yellow}[Admin]${c.reset}`;

            const methodPadded = ep.method.padEnd(6);
            console.log(
                `  ${c.dim}│  ${prefix}─${c.reset} ${mColor}${c.bold}${methodPadded}${c.reset} ${ep.path} ${accessTag}`
            );
        });

        console.log(`  ${c.dim}│${c.reset}`);
    }

    console.log(`  ${c.dim}── Total: ${totalEndpoints} endpoints${c.reset}\n`);
}

module.exports = { ENDPOINTS, printEndpointTable };
