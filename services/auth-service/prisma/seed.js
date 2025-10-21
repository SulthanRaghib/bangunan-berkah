const { PrismaClient } = require("@prisma/client");
const { seedUsers, seedSpecificUsers } = require("./seeders/userSeeder");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...\n");

  try {
    // Clean existing data (optional - comment jika tidak mau hapus data lama)
    console.log("🗑️  Cleaning existing users...");
    await prisma.user.deleteMany({});
    console.log("✅ Existing users cleaned!\n");

    // Seed specific users (admin & test users)
    await seedSpecificUsers();
    console.log("");

    // Seed random users
    await seedUsers(50); // Generate 50 random users
    console.log("");

    // Get statistics
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
    const totalRegularUsers = await prisma.user.count({
      where: { role: "user" },
    });

    console.log("📊 Seeding Statistics:");
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Admins: ${totalAdmins}`);
    console.log(`   Regular Users: ${totalRegularUsers}`);
    console.log("\n✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
