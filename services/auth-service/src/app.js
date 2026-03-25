/**
 * ============================================
 * EXPRESS APP CONFIGURATION
 * ============================================
 * Main application setup dengan:
 * - Middleware configuration
 * - Routes mounting
 * - Global error handling (dari shared)
 * - Swagger documentation
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

// Import shared middleware
const {
  errorHandler,
  notFoundHandler,
  asyncHandler
} = require("../../../shared");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");

const PORT = process.env.PORT || 8001;
const SERVICE_NAME = process.env.SERVICE_NAME || "Auth Service";

dotenv.config();

const app = express();

/**
 * ============================================
 * MIDDLEWARE CONFIGURATION
 * ============================================
 */

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors());

/**
 * ============================================
 * SWAGGER DOCUMENTATION
 * ============================================
 */

// Serve Swagger JSON (untuk API Gateway aggregation)
app.get('/api/auth/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customJs: '/swagger-custom.js',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// Swagger custom script
app.get('/swagger-custom.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    (function() {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(response => {
          const clonedResponse = response.clone();
          
          if (args[0] && args[0].includes('/api/auth/login')) {
            clonedResponse.json().then(data => {
              if (data.data?.token) {
                const token = data.data.token;
                localStorage.setItem('jwtToken', token);
                
                setTimeout(() => {
                  try {
                    if (window.ui) {
                      window.ui.authActions.authorize({
                        bearerAuth: {
                          name: "bearerAuth",
                          schema: { type: "http", scheme: "bearer" },
                          value: token
                        }
                      });
                      console.log('✅ Token otomatis terisi!');
                    }
                  } catch (e) {
                    console.log('Token:', token);
                  }
                }, 500);
              }
            }).catch(err => console.error('Error parsing response:', err));
          }
          
          return response;
        });
      };
      
      console.log('🔐 Swagger Auto-Auth aktif!');
    })();
  `);
});

/**
 * ============================================
 * ROUTES
 * ============================================
 */

// Health check endpoint
app.use(healthRoutes);

// API endpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Root endpoint
app.get("/", asyncHandler(async (req, res) => {
  res.json({
    service: SERVICE_NAME,
    port: PORT,
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      health: "/health",
      docs: "/api-docs"
    }
  });
}));

/**
 * ============================================
 * GLOBAL MIDDLEWARE
 * ============================================
 */

// 404 handler (dari shared)
app.use(notFoundHandler);

// Global error handler (dari shared) - HARUS paling akhir
app.use(errorHandler);

module.exports = app;
