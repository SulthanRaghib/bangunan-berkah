// Load environment variables for seeding (SEED_PASSWORD)
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Plain password to seed users with. Prefer to set via `.env` as `SEED_PASSWORD`.
const SEED_PASSWORD = process.env.SEED_PASSWORD || "password123";

/**
 * Generate random user data
 */
function generateUser(index) {
  const roles = ["user", "admin"];
  const firstNames = [
    "Budi",
    "Andi",
    "Siti",
    "Dewi",
    "Agus",
    "Rini",
    "Joko",
    "Maya",
    "Hendra",
    "Sri",
    "Bambang",
    "Putri",
    "Dedi",
    "Lina",
    "Eko",
    "Rina",
    "Fajar",
    "Ani",
    "Yudi",
    "Sari",
    "Rahman",
    "Wati",
    "Teguh",
    "Indah",
    "Arif",
    "Nina",
    "Wahyu",
    "Ratna",
    "Hadi",
    "Yuni",
    "Irfan",
    "Dian",
  ];

  const lastNames = [
    "Santoso",
    "Wijaya",
    "Pratama",
    "Kusuma",
    "Saputra",
    "Permana",
    "Suharto",
    "Hidayat",
    "Firmansyah",
    "Nugroho",
    "Setiawan",
    "Gunawan",
    "Ramadhan",
    "Hakim",
    "Rizki",
    "Adiputra",
    "Maulana",
    "Suryanto",
  ];

  const randomFirstName =
    firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName =
    lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${randomFirstName} ${randomLastName}`;

  // Generate email from name
  const emailName = fullName.toLowerCase().replace(/ /g, ".");
  const email = `${emailName}${index}@example.com`;

  // Random role (90% user, 10% admin)
  const role = Math.random() < 0.9 ? "user" : "admin";

  return {
    name: fullName,
    email: email,
    password: SEED_PASSWORD, // Will be hashed
    role: role,
  };
}

/**
 * Seed users
 */
async function seedUsers(count = 50) {
  console.log(`🌱 Seeding ${count} users...`);

  try {
    // Hash password once (same for all users for simplicity)
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    // Generate user data
    const usersData = [];
    for (let i = 1; i <= count; i++) {
      const user = generateUser(i);
      usersData.push({
        ...user,
        password: hashedPassword,
      });
    }

    // Avoid using createMany with skipDuplicates because it's not supported
    // for the MongoDB provider in this environment. Instead, check which
    // emails already exist and insert only the missing users via raw
    // MongoDB insert command.
    const emails = usersData.map((u) => u.email);
    const existing = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    });
    const existingEmails = existing.map((e) => e.email);
    const toInsert = usersData.filter((u) => !existingEmails.includes(u.email));

    if (toInsert.length === 0) {
      console.log("✅ No new users to insert (all emails already exist).");
      return { count: 0 };
    }

    // Use raw insert to avoid transaction/replica-set requirements
    const insertResult = await prisma.$runCommandRaw({ insert: "users", documents: toInsert });
    // insertResult may vary; report number inserted using our list length
    console.log(`✅ Successfully seeded ${toInsert.length} users!`);
    return { count: toInsert.length };
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

/**
 * Seed specific admin and test users
 */
async function seedSpecificUsers() {
  console.log("🌱 Seeding specific admin and test users...");

  try {
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    const specificUsers = [
      {
        name: "Super Admin",
        email: "admin@solusi-bangunan.com",
        password: hashedPassword,
        role: "admin",
      },
      {
        name: "Test User",
        email: "user@solusi-bangunan.com",
        password: hashedPassword,
        role: "user",
      },
      {
        name: "Raghib Admin",
        email: "raghib@gmail.com",
        password: hashedPassword,
        role: "admin",
      },
    ];

    // Insert if not exists (avoid upsert because it may require transactions on standalone MongoDB)
    for (const user of specificUsers) {
      const existing = await prisma.user.findUnique({ where: { email: user.email } }).catch(() => null);
      if (!existing) {
        // Use raw insert to avoid Prisma transaction requirements on standalone MongoDB
        await prisma.$runCommandRaw({ insert: "users", documents: [user] });
      }
    }

    console.log("✅ Successfully seeded specific users!");
  } catch (error) {
    console.error("❌ Error seeding specific users:", error);
    throw error;
  }
}

module.exports = {
  seedUsers,
  seedSpecificUsers,
};
