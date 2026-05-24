const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

const parseAllowedOrigins = (value) => {
    if (!value) {
        return [];
    }

    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins(
    process.env.CORS_ALLOWED_ORIGINS ||
    "http://localhost:5173,http://localhost:8080,http://localhost:8004"
);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Routes
const projectRoutes = require("./routes/projectRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const documentRoutes = require("./routes/documentRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const healthRoutes = require("./routes/healthRoutes");

// ─── Public routes (NO auth) ───────────────────
app.use("/api/projects", trackingRoutes);

// ─── Admin routes ──────────────────────────────
// Mount with SPECIFIC sub-paths to prevent route bleed:
// Without this, milestoneRoutes' router.use(authMiddleware) runs
// for ALL /api/projects/* requests, even photo uploads that should
// only go to projectRoutes. This causes ECONNRESET on multipart
// uploads when the auth middleware responds before the body finishes streaming.
app.use("/api/projects", projectRoutes);    // handles: /, /:code, /:code/photos, /:code/progress, etc.
app.use("/api/projects", milestoneRoutes);  // handles: /:code/milestones/*
app.use("/api", documentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(healthRoutes);

// Root route
app.get("/", (req, res) => {
    const SERVICE_NAME = process.env.SERVICE_NAME || "Project Service";
    const PORT = process.env.PORT || 8004;
    res.json({
        success: true,
        message: `${SERVICE_NAME} is running on port ${PORT}`,
        health: `${req.protocol}://${req.get("host")}/api/health`,
    });
});

// Handle 404
const { errorHandler, notFoundHandler } = require("../../../shared");

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
