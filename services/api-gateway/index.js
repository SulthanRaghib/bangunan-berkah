const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
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

// Rate Limiter (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} running on port ${PORT}`);
});

module.exports = app;
