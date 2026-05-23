/**
 * ============================================
 * TIMER HELPER
 * ============================================
 * Tracks and logs response time for each API request
 */

/**
 * Wrap a supertest request to track and log response time
 * Usage: await timeRequest(request.get('/api/endpoint'), 'GET', '/api/endpoint')
 * Output: [GET] /api/endpoint - 45ms ✓
 * 
 * @param {Promise} requestPromise - The supertest request promise
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {string} endpoint - API endpoint path
 * @returns {Promise} The response object
 */
async function timeRequest(requestPromise, method, endpoint) {
    const startTime = process.hrtime.bigint(); // More precise than Date.now()

    try {
        const response = await requestPromise;
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds

        // Color code based on response time
        let emoji = "✓";
        let timeColor = "";

        if (durationMs > 1000) {
            emoji = "🐢"; // Slow
            timeColor = "\x1b[33m"; // Yellow
        } else if (durationMs > 500) {
            emoji = "⚠️"; // Medium
            timeColor = "\x1b[36m"; // Cyan
        } else {
            emoji = "⚡"; // Fast
            timeColor = "\x1b[32m"; // Green
        }

        const reset = "\x1b[0m";
        console.log(`  [${method}] ${endpoint} - ${timeColor}${durationMs.toFixed(2)}ms${reset} ${emoji}`);

        return response;
    } catch (error) {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;
        console.log(`  [${method}] ${endpoint} - \x1b[31m${durationMs.toFixed(2)}ms\x1b[0m ❌ (Error: ${error.message})`);
        throw error;
    }
}

/**
 * Create a timed request wrapper for all HTTP methods
 * Usage in tests:
 *   const timedRequest = createTimedRequest(request);
 *   await timedRequest.get('/api/endpoint');
 * 
 * @param {SuperTest} request - The supertest instance
 * @returns {Object} Object with wrapped HTTP methods
 */
function createTimedRequest(request) {
    return {
        get: (endpoint) => ({
            send: () => timeRequest(request.get(endpoint), 'GET', endpoint),
            set: (header, value) => {
                request.get(endpoint).set(header, value);
                return {
                    send: () => timeRequest(request.get(endpoint).set(header, value), 'GET', endpoint),
                    end: (cb) => timeRequest(request.get(endpoint).set(header, value), 'GET', endpoint).then(cb).catch(cb),
                };
            },
            expect: (status) => timeRequest(request.get(endpoint).expect(status), 'GET', endpoint),
            then: (onFulfilled, onRejected) => timeRequest(request.get(endpoint), 'GET', endpoint).then(onFulfilled, onRejected),
            catch: (onRejected) => timeRequest(request.get(endpoint), 'GET', endpoint).catch(onRejected),
        }),
        post: (endpoint) => ({
            send: (data) => timeRequest(request.post(endpoint).send(data), 'POST', endpoint),
            set: (header, value) => {
                request.post(endpoint).set(header, value);
                return {
                    send: (data) => timeRequest(request.post(endpoint).set(header, value).send(data), 'POST', endpoint),
                };
            },
        }),
        put: (endpoint) => ({
            send: (data) => timeRequest(request.put(endpoint).send(data), 'PUT', endpoint),
            set: (header, value) => {
                request.put(endpoint).set(header, value);
                return {
                    send: (data) => timeRequest(request.put(endpoint).set(header, value).send(data), 'PUT', endpoint),
                };
            },
        }),
        patch: (endpoint) => ({
            send: (data) => timeRequest(request.patch(endpoint).send(data), 'PATCH', endpoint),
            set: (header, value) => {
                request.patch(endpoint).set(header, value);
                return {
                    send: (data) => timeRequest(request.patch(endpoint).set(header, value).send(data), 'PATCH', endpoint),
                };
            },
        }),
        delete: (endpoint) => ({
            set: (header, value) => {
                request.delete(endpoint).set(header, value);
                return {
                    send: (data) => timeRequest(request.delete(endpoint).set(header, value).send(data), 'DELETE', endpoint),
                    end: (cb) => timeRequest(request.delete(endpoint).set(header, value), 'DELETE', endpoint).then(cb).catch(cb),
                };
            },
            send: (data) => timeRequest(request.delete(endpoint).send(data), 'DELETE', endpoint),
        }),
    };
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
        console.log(`  ${label} - \x1b[32m${durationMs.toFixed(2)}ms\x1b[0m ⚡`);
        return response;
    } catch (error) {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;
        console.log(`  ${label} - \x1b[31m${durationMs.toFixed(2)}ms\x1b[0m ❌`);
        throw error;
    }
}

module.exports = { timeRequest, createTimedRequest, logTime };
