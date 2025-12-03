const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Swagger Documentation with auto-fill token
const swaggerUiOptions = {
    customJs: '/swagger-custom.js',
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    swaggerOptions: {
        persistAuthorization: true,
    },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerUiOptions));

// Serve custom JavaScript for Swagger auto-fill token
app.get('/swagger-custom.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        // Auto-fill JWT token - detects token from localStorage or Auth Service
        (function() {
            // Check if token exists in localStorage from Auth Service
            const checkAndFillToken = () => {
                try {
                    // Try to get token from localStorage (if Auth Service saved it)
                    let token = localStorage.getItem('jwtToken');
                    
                    // If token exists, auto-fill authorization
                    if (token && window.ui) {
                        window.ui.authActions.authorize({
                            bearerAuth: {
                                name: "bearerAuth",
                                schema: {
                                    type: "http",
                                    scheme: "bearer"
                                },
                                value: token
                            }
                        });
                        console.log('✅ Token otomatis terisi dari Auth Service!');
                    }
                } catch (e) {
                    console.log('Belum ada token dari Auth Service');
                }
            };
            
            // Check token on page load
            setTimeout(checkAndFillToken, 1000);
            
            // Intercept fetch to capture responses with tokens
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                return originalFetch.apply(this, args).then(response => {
                    const clonedResponse = response.clone();
                    
                    // Try to capture any accessToken in responses
                    clonedResponse.json().then(data => {
                        if (data.accessToken || data.token) {
                            const token = data.accessToken || data.token;
                            localStorage.setItem('jwtToken', token);
                            
                            setTimeout(() => {
                                if (window.ui) {
                                    window.ui.authActions.authorize({
                                        bearerAuth: {
                                            name: "bearerAuth",
                                            schema: {
                                                type: "http",
                                                scheme: "bearer"
                                            },
                                            value: token
                                        }
                                    });
                                    console.log('✅ Token berhasil terisi!');
                                }
                            }, 500);
                        }
                    }).catch(() => {});
                    
                    return response;
                });
            };
            
            console.log('🔐 Swagger Auto-Auth aktif! Token dari Auth Service akan otomatis terdeteksi.');
        })();
    `);
});

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Routes
const projectRoutes = require("./routes/projectRoutes");
const documentRoutes = require("./routes/documentRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const healthRoutes = require("./routes/healthRoutes");

app.use("/api/projects", trackingRoutes); // Public routes must come first
app.use("/api/projects", projectRoutes);
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
