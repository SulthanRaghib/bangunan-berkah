const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");

const PORT = process.env.PORT || 8002;
const SERVICE_NAME = process.env.SERVICE_NAME || "Auth Service";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Swagger JSON for Gateway Aggregation
app.get('/api/auth/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// Swagger Documentation with custom options
const swaggerUiOptions = {
  customJs: '/swagger-custom.js',
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  swaggerOptions: {
    persistAuthorization: true, // Persist authorization data after page refresh
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerUiOptions));

// Serve custom JavaScript for Swagger
app.get('/swagger-custom.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    // Auto-fill JWT token from login response
    (function() {
      // Intercept fetch requests to capture login response
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(response => {
          // Clone response to read body without consuming it
          const clonedResponse = response.clone();
          
          // Check if this is a login request
          if (args[0] && args[0].includes('/api/auth/login')) {
            clonedResponse.json().then(data => {
              if (data.accessToken) {
                // Auto-fill the authorization
                const token = data.accessToken;
                
                // Save token to localStorage for cross-service access
                localStorage.setItem('jwtToken', token);
                
                // Use Swagger UI's authorization method
                setTimeout(() => {
                  try {
                    // Try to access Swagger UI instance
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
                      
                      // Show success message
                      console.log('✅ Token otomatis terisi!');
                      console.log('💾 Token disimpan ke localStorage untuk digunakan di Project Service');
                      alert('✅ Token berhasil terisi otomatis! Token juga disimpan untuk digunakan di Project Service Swagger (http://localhost:8004/api-docs)');
                    }
                  } catch (e) {
                    console.log('Token dari login:', token);
                  }
                }, 500);
              }
            }).catch(err => {
              console.error('Error parsing login response:', err);
            });
          }
          
          return response;
        });
      };
      
      console.log('🔐 Swagger Auto-Auth aktif! Login untuk auto-fill token.');
    })();
  `);
});

// Routes
app.use(healthRoutes); // Health check routes
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/users", userRoutes); // User management routes

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: `${SERVICE_NAME} is running on port ${PORT}`,
    version: "1.0.0",
    status: "running",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
  });
});

module.exports = app;
