const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const reviewRoutes = require("./routes/reviewRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const qaRoutes = require("./routes/qaRoutes");
const { errorHandler, notFoundHandler } = require("../../../shared");

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

// Middleware
const allowedOrigins = parseAllowedOrigins(
    process.env.CORS_ALLOWED_ORIGINS ||
    "http://localhost:3000,http://localhost:8080,http://localhost:8005"
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
app.use(morgan("dev"));

// Routes
app.use("/api/reviews", reviewRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/qa", qaRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "review-service",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health/ready", (req, res) => {
    res.status(200).json({ ready: true });
});

app.get("/health/live", (req, res) => {
    res.status(200).json({ alive: true });
});

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
