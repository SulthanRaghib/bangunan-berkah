const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"],
});

// Connect (will reuse connection pool)
prisma
    .$connect()
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

module.exports = prisma;