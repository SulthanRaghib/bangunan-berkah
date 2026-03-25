const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger");
const reviewRoutes = require("./routes/reviewRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const qaRoutes = require("./routes/qaRoutes");
const { errorHandler, notFoundHandler } = require("../../../shared");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve Swagger JSON for Gateway Aggregation
app.get('/api/reviews/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
