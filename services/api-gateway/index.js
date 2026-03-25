const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const SERVICE_NAME = process.env.SERVICE_NAME || "API Gateway";

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());
app.use(morgan("dev"));
app.set("trust proxy", 1);

// Distributed Rate Limiter via Redis
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT || 6379),
    connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT || 5000),
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: Number(process.env.REDIS_DB || 0),
});

redisClient.on("error", (error) => {
  console.error("Redis Gateway Error:", error.message);
});

redisClient.connect().catch((error) => {
  console.error("Gagal koneksi Redis di API Gateway:", error.message);
});

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "rl:api-gateway:",
  }),
  skip: (req) =>
    req.path.startsWith("/health") ||
    req.path.startsWith("/docs") ||
    req.path.startsWith("/api/auth/login") ||
    req.path.startsWith("/api/auth/refresh") ||
    req.path.startsWith("/api/auth/register"),
});

const strictAuthLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  message: {
    success: false,
    message: "Terlalu banyak percobaan autentikasi. Silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "rl:api-gateway:auth:",
  }),
});

app.use("/api/auth/login", strictAuthLimiter);
app.use("/api/auth/refresh", strictAuthLimiter);
app.use("/api/auth/register", strictAuthLimiter);
app.use("/api", limiter);

// ========================================
// SERVICE URLS
// ========================================
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:8001";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://product-service:8002";
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || "http://chat-service:8003";
const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL || "http://project-service:8004";
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || "http://review-service:8005";

// ========================================
// PROXY ROUTES
// ========================================

// Helper function for creating proxy
const createProxy = (pathFilter, target) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter, // v3 uses pathFilter instead of context
    onProxyReq: (proxyReq, req, res) => {
      // Optional: Add custom headers or logging
    },
    onError: (err, req, res) => {
      console.error("Proxy Error:", err);
      res.status(500).json({
        success: false,
        message: "Service unavailable",
      });
    },
  });
};

// Auth Service
app.use(createProxy(["/api/auth", "/api/users"], AUTH_SERVICE_URL));

// Product Service
app.use(createProxy(["/api/products", "/api/categories", "/api/inventory"], PRODUCT_SERVICE_URL));

// Chat Service
app.use(createProxy("/api/chat", CHAT_SERVICE_URL));

// Project Service
app.use(createProxy(["/api/projects", "/api/dashboard", "/api/milestones"], PROJECT_SERVICE_URL));

// Review Service
app.use(createProxy("/api/reviews", REVIEW_SERVICE_URL));

// ========================================
// SWAGGER UI AGGREGATOR
// ========================================
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      { url: "/api/auth/api-docs.json", name: "Auth Service" },
      { url: "/api/products/api-docs.json", name: "Product Service" },
      { url: "/api/projects/api-docs.json", name: "Project Service" },
      { url: "/api/chat/api-docs.json", name: "Chat Service" },
      { url: "/api/reviews/api-docs.json", name: "Review Service" },
    ],
  },
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

// ========================================
// HEALTH CHECK
// ========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `${SERVICE_NAME} is running on port ${PORT}`,
    services: {
      auth: AUTH_SERVICE_URL,
      product: PRODUCT_SERVICE_URL,
      chat: CHAT_SERVICE_URL,
      project: PROJECT_SERVICE_URL,
      review: REVIEW_SERVICE_URL,
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/ready", (req, res) => {
  res.status(200).json({ ready: true });
});

app.get("/health/live", (req, res) => {
  res.status(200).json({ alive: true });
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} running on port ${PORT}`);
});

module.exports = app;
