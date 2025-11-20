const prisma = require("../src/config/prisma");
const { seedProjects } = require("./seeders/projectSeeder");

async function main() {
    console.log("🚀 Starting project-service database seeding...\n");

    try {
        await seedProjects();

        console.log("✅ Project-service seeding completed successfully!");
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

