const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger Config
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Review Service API",
            version: "1.0.0",
            description: "API for managing project reviews",
        },
        servers: [
            {
                url: "http://localhost:8005",
                description: "Local server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Serve Swagger JSON for Gateway Aggregation
app.get('/api/reviews/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/reviews", reviewRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", service: "review-service" });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found" });
});

module.exports = app;
