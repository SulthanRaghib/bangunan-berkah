const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Routes
const projectRoutes = require("./routes/projectRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const photoRoutes = require("./routes/photoRoutes");
const documentRoutes = require("./routes/documentRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const healthRoutes = require("./routes/healthRoutes");

app.use("/api/projects", trackingRoutes); // Public routes must come first
app.use("/api/projects", projectRoutes);
app.use("/api", milestoneRoutes);
app.use("/api", photoRoutes);
app.use("/api", documentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/health", healthRoutes);

// Root route: basic service info (helps quick checks at http://localhost:PORT/)
app.get("/", (req, res) => {
    const SERVICE_NAME = process.env.SERVICE_NAME || "Project Service";
    const PORT = process.env.PORT || 8004;
    res.json({
        success: true,
        message: `${SERVICE_NAME} is running on port ${PORT}`,
        health: `${req.protocol}://${req.get("host")}/api/health`,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

module.exports = app;
