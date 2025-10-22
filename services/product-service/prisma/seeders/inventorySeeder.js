const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedInventory() {
  console.log("🌱 Seeding inventory and stock history...");

  // Get all products
  const products = await prisma.product.findMany({
    include: {
      inventory: true,
    },
  });

  if (products.length === 0) {
    console.log("⚠️ No products found. Please run product seeder first.");
    return;
  }

  let inventoryCount = 0;
  let stockHistoryCount = 0;

  for (const product of products) {
    // Skip if inventory already exists
    if (product.inventory) {
      console.log(`⏭️ Inventory already exists for: ${product.name}`);
      continue;
    }

    // Determine initial stock based on product SKU prefix
    let initialStock = 0;
    let minStock = 10;

    // Set stock levels based on SKU patterns
    if (product.sku.startsWith("SEM-")) {
      // Semen - high stock
      initialStock = Math.floor(Math.random() * (200 - 100 + 1)) + 100; // 100-200
      minStock = 30;
    } else if (
      product.sku.startsWith("PSR-") ||
      product.sku.startsWith("KRK-")
    ) {
      // Pasir & Kerikil - medium stock (m3)
      initialStock = Math.floor(Math.random() * (50 - 20 + 1)) + 20; // 20-50
      minStock = 10;
    } else if (
      product.sku.startsWith("BAT-") ||
      product.sku.startsWith("BTK-")
    ) {
      // Bata & Batako - very high stock
      initialStock = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000; // 3000-10000
      minStock = 1000;
    } else if (product.sku.startsWith("HBL-")) {
      // Hebel - high stock
      initialStock = Math.floor(Math.random() * (1500 - 500 + 1)) + 500; // 500-1500
      minStock = 150;
    } else if (product.sku.startsWith("CAT-")) {
      // Cat - medium stock
      initialStock = Math.floor(Math.random() * (150 - 50 + 1)) + 50; // 50-150
      minStock = 20;
    } else if (product.sku.startsWith("PLM-")) {
      // Plamir - medium stock
      initialStock = Math.floor(Math.random() * (120 - 60 + 1)) + 60; // 60-120
      minStock = 25;
    } else if (
      product.sku.startsWith("KRM-") ||
      product.sku.startsWith("GRN-")
    ) {
      // Keramik & Granit - medium to high stock
      initialStock = Math.floor(Math.random() * (200 - 80 + 1)) + 80; // 80-200
      minStock = 30;
    } else if (
      product.sku.startsWith("BSI-") ||
      product.sku.startsWith("BJR-")
    ) {
      // Besi & Baja - high stock
      initialStock = Math.floor(Math.random() * (500 - 200 + 1)) + 200; // 200-500
      minStock = 50;
    } else if (product.sku.startsWith("WRM-")) {
      // Wiremesh - medium stock
      initialStock = Math.floor(Math.random() * (200 - 100 + 1)) + 100; // 100-200
      minStock = 30;
    } else if (
      product.sku.startsWith("KYU-") ||
      product.sku.startsWith("TPK-") ||
      product.sku.startsWith("PLY-")
    ) {
      // Kayu & Plywood - medium stock
      initialStock = Math.floor(Math.random() * (150 - 80 + 1)) + 80; // 80-150
      minStock = 25;
    } else if (product.sku.startsWith("PIP-")) {
      // Pipa - high stock
      initialStock = Math.floor(Math.random() * (400 - 200 + 1)) + 200; // 200-400
      minStock = 50;
    } else if (product.sku.startsWith("FIT-")) {
      // Fitting - very high stock (small items)
      initialStock = Math.floor(Math.random() * (600 - 300 + 1)) + 300; // 300-600
      minStock = 80;
    } else if (product.sku.startsWith("KBL-")) {
      // Kabel - medium stock
      initialStock = Math.floor(Math.random() * (100 - 50 + 1)) + 50; // 50-100
      minStock = 15;
    } else if (
      product.sku.startsWith("SKL-") ||
      product.sku.startsWith("STK-")
    ) {
      // Saklar & Stop Kontak - high stock
      initialStock = Math.floor(Math.random() * (400 - 200 + 1)) + 200; // 200-400
      minStock = 60;
    } else if (product.sku.startsWith("KLS-")) {
      // Kloset - low stock (expensive items)
      initialStock = Math.floor(Math.random() * (40 - 20 + 1)) + 20; // 20-40
      minStock = 5;
    } else if (
      product.sku.startsWith("WST-") ||
      product.sku.startsWith("SHW-")
    ) {
      // Wastafel & Shower - medium stock
      initialStock = Math.floor(Math.random() * (60 - 30 + 1)) + 30; // 30-60
      minStock = 10;
    } else if (
      product.sku.startsWith("PNT-") ||
      product.sku.startsWith("JND-")
    ) {
      // Pintu & Jendela - low stock (custom items)
      initialStock = Math.floor(Math.random() * (30 - 15 + 1)) + 15; // 15-30
      minStock = 5;
    } else if (product.sku.startsWith("GTG-")) {
      // Genteng - very high stock
      initialStock = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000; // 1000-3000
      minStock = 300;
    } else if (product.sku.startsWith("ASB-")) {
      // Asbes - high stock
      initialStock = Math.floor(Math.random() * (400 - 200 + 1)) + 200; // 200-400
      minStock = 60;
    } else if (
      product.sku.startsWith("PLU-") ||
      product.sku.startsWith("MTR-")
    ) {
      // Alat Tukang - medium stock
      initialStock = Math.floor(Math.random() * (120 - 60 + 1)) + 60; // 60-120
      minStock = 20;
    } else if (
      product.sku.startsWith("PKU-") ||
      product.sku.startsWith("BAU-")
    ) {
      // Paku & Baut - high stock
      initialStock = Math.floor(Math.random() * (300 - 150 + 1)) + 150; // 150-300
      minStock = 40;
    } else if (
      product.sku.startsWith("GYP-") ||
      product.sku.startsWith("RGK-")
    ) {
      // Gypsum & Rangka - high stock
      initialStock = Math.floor(Math.random() * (500 - 250 + 1)) + 250; // 250-500
      minStock = 60;
    } else if (product.sku.startsWith("WLP-")) {
      // Wallpaper - medium stock
      initialStock = Math.floor(Math.random() * (180 - 100 + 1)) + 100; // 100-180
      minStock = 30;
    } else if (product.sku.startsWith("LEM-")) {
      // Lem - medium to high stock
      initialStock = Math.floor(Math.random() * (200 - 80 + 1)) + 80; // 80-200
      minStock = 30;
    } else {
      // Default stock for uncategorized items
      initialStock = Math.floor(Math.random() * (100 - 50 + 1)) + 50; // 50-100
      minStock = 20;
    }

    // Create inventory
    await prisma.inventory.create({
      data: {
        productId: product.id,
        stock: initialStock,
        minStock: minStock,
      },
    });
    inventoryCount++;

    // Create initial stock history
    if (initialStock > 0) {
      await prisma.stockHistory.create({
        data: {
          productId: product.id,
          type: "in",
          quantity: initialStock,
          description: "Initial stock from seeder",
          createdBy: 1, // Default admin user
        },
      });
      stockHistoryCount++;
    }

    console.log(
      `✅ ${product.name} - Stock: ${initialStock} ${product.unit}, Min: ${minStock} ${product.unit}`
    );
  }

  console.log(`\n✅ ${inventoryCount} inventory records created!`);
  console.log(`✅ ${stockHistoryCount} stock history records created!`);
}

module.exports = { seedInventory };
