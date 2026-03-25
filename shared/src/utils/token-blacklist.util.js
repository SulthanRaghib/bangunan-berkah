const crypto = require("crypto");
const { ensureRedisConnected } = require("./redis.util");

const BLACKLIST_PREFIX = "auth:blacklist:access:";
const REFRESH_ACTIVE_PREFIX = "auth:refresh:active:";
const REFRESH_REVOKED_PREFIX = "auth:refresh:revoked:";

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const getBlacklistKey = (token) => `${BLACKLIST_PREFIX}${hashToken(token)}`;
const getRefreshActiveKey = (token) => `${REFRESH_ACTIVE_PREFIX}${hashToken(token)}`;
const getRefreshRevokedKey = (token) => `${REFRESH_REVOKED_PREFIX}${hashToken(token)}`;

const calculateTtl = (expUnixSeconds) => {
    if (!expUnixSeconds) {
        return 0;
    }

    return Number(expUnixSeconds) - Math.floor(Date.now() / 1000);
};

const blacklistAccessToken = async (token, expUnixSeconds) => {
    if (!token || !expUnixSeconds) {
        return;
    }

    const ttl = calculateTtl(expUnixSeconds);

    if (ttl <= 0) {
        return;
    }

    const client = await ensureRedisConnected();
    const key = getBlacklistKey(token);

    await client.set(key, "1", {
        EX: ttl,
    });
};

const storeRefreshToken = async (token, expUnixSeconds) => {
    if (!token || !expUnixSeconds) {
        return;
    }

    const ttl = calculateTtl(expUnixSeconds);

    if (ttl <= 0) {
        return;
    }

    const client = await ensureRedisConnected();
    const activeKey = getRefreshActiveKey(token);

    await client.set(activeKey, "1", {
        EX: ttl,
    });
};

const isRefreshTokenActive = async (token) => {
    if (!token) {
        return false;
    }

    const client = await ensureRedisConnected();
    const activeKey = getRefreshActiveKey(token);
    const value = await client.get(activeKey);

    return value === "1";
};

const isRefreshTokenRevoked = async (token) => {
    if (!token) {
        return false;
    }

    const client = await ensureRedisConnected();
    const revokedKey = getRefreshRevokedKey(token);
    const value = await client.get(revokedKey);

    return value === "1";
};

const revokeRefreshToken = async (token, expUnixSeconds) => {
    if (!token) {
        return;
    }

    const client = await ensureRedisConnected();
    const activeKey = getRefreshActiveKey(token);
    await client.del(activeKey);

    const ttl = calculateTtl(expUnixSeconds);

    if (ttl > 0) {
        const revokedKey = getRefreshRevokedKey(token);
        await client.set(revokedKey, "1", {
            EX: ttl,
        });
    }
};

const rotateRefreshToken = async (
    oldToken,
    oldExpUnixSeconds,
    newToken,
    newExpUnixSeconds
) => {
    await revokeRefreshToken(oldToken, oldExpUnixSeconds);
    await storeRefreshToken(newToken, newExpUnixSeconds);
};

const isAccessTokenBlacklisted = async (token) => {
    if (!token) {
        return false;
    }

    const client = await ensureRedisConnected();
    const key = getBlacklistKey(token);
    const value = await client.get(key);

    return value === "1";
};

module.exports = {
    blacklistAccessToken,
    isAccessTokenBlacklisted,
    storeRefreshToken,
    isRefreshTokenActive,
    isRefreshTokenRevoked,
    revokeRefreshToken,
    rotateRefreshToken,
};
