const { PrismaClient } = require("@prisma/client");
const { seedCategories } = require("./seeders/categorySeeder");
const { seedProducts } = require("./seeders/productSeeder");
const { seedInventory } = require("./seeders/inventorySeeder");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...\n");

  try {
    // Seed categories first
    await seedCategories();
    console.log("");

    // Then seed products
    await seedProducts();
    console.log("");

    // Finally seed inventory
    await seedInventory();
    console.log("");

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
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
