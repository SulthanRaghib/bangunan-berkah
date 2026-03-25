const { createClient } = require("redis");

let redisClient = null;
let connectPromise = null;

const getRedisConfig = () => ({
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    database: Number(process.env.REDIS_DB || 0),
});

const getRedisClient = () => {
    if (redisClient) {
        return redisClient;
    }

    const config = getRedisConfig();

    redisClient = createClient({
        socket: {
            host: config.host,
            port: config.port,
            connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT || 5000),
            reconnectStrategy: (retries) => {
                if (retries > 10) {
                    return 5000;
                }
                return Math.min(retries * 200, 3000);
            },
        },
        password: config.password,
        database: config.database,
    });

    redisClient.on("error", (error) => {
        console.error("Redis error:", error.message);
    });

    redisClient.on("connect", () => {
        console.log("Redis connected");
    });

    return redisClient;
};

const ensureRedisConnected = async () => {
    const client = getRedisClient();

    if (client.isOpen) {
        return client;
    }

    if (!connectPromise) {
        connectPromise = client.connect().finally(() => {
            connectPromise = null;
        });
    }

    await connectPromise;
    return client;
};

const isRedisReady = () => {
    try {
        const client = getRedisClient();
        return client.isReady;
    } catch (error) {
        return false;
    }
};

module.exports = {
    getRedisClient,
    ensureRedisConnected,
    isRedisReady,
};
