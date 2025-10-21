const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

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
    password: "password123", // Will be hashed
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
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Generate user data
    const usersData = [];
    for (let i = 1; i <= count; i++) {
      const user = generateUser(i);
      usersData.push({
        ...user,
        password: hashedPassword,
      });
    }

    // Insert users using createMany (faster)
    const result = await prisma.user.createMany({
      data: usersData,
      skipDuplicates: true, // Skip if email already exists
    });

    console.log(`✅ Successfully seeded ${result.count} users!`);
    return result;
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
    const hashedPassword = await bcrypt.hash("password123", 10);

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

    // Use upsert to avoid duplicates
    for (const user of specificUsers) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {}, // Don't update if exists
        create: user,
      });
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
