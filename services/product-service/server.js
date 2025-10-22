const app = require("./src/app");

const PORT = process.env.PORT || 8002;
const SERVICE_NAME = process.env.SERVICE_NAME || "Product Service";
const ENVIRONMENT = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} running on port ${PORT}`);
  console.log(`📦 Environment: ${ENVIRONMENT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});
