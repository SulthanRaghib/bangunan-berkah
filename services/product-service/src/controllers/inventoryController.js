const prisma = require("../config/prisma");
const { validateUpdateStock } = require("../utils/validation");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");

// ========================================
// GET ALL INVENTORY
// ========================================
exports.getAllInventory = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, lowStock } = req.query;

    // Build where clause
    const where = {};

    if (lowStock === "true") {
      where.stock = {
        lt: prisma.inventory.fields.minStock,
      };
    }

    if (search) {
      where.product = {
        OR: [{ name: { contains: search } }, { sku: { contains: search } }],
      };
    }

    // Get inventory
    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.inventory.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      message: "Inventory berhasil diambil",
      data: inventories,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (err) {
    console.error("Get inventory error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET LOW STOCK
// ========================================
exports.getLowStock = async (req, res) => {
  try {
    const lowStockProducts = await prisma.$queryRaw`
      SELECT 
        i.*,
        p.name,
        p.sku,
        c.name as category_name
      FROM inventories i
      JOIN products p ON i.productId = p.id
      JOIN categories c ON p.categoryId = c.id
      WHERE i.stock < i.minStock
      ORDER BY i.stock ASC
    `;

    res.status(200).json({
      success: true,
      message: "Produk dengan stock rendah",
      data: lowStockProducts,
      count: lowStockProducts.length,
    });
  } catch (err) {
    console.error("Get low stock error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET INVENTORY BY PRODUCT
// ========================================
exports.getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { productId: parseInt(productId) },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
          },
        },
      },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory berhasil diambil",
      data: inventory,
    });
  } catch (err) {
    console.error("Get inventory error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// UPDATE STOCK
// ========================================
exports.updateStock = async (req, res) => {
  try {
    const { productId, type, quantity, description } = req.body;

    // Validation
    const { error } = validateUpdateStock({ type, quantity, description });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId wajib diisi",
      });
    }

    // Get current inventory
    const inventory = await prisma.inventory.findUnique({
      where: { productId: parseInt(productId) },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory tidak ditemukan",
      });
    }

    // Calculate new stock
    let newStock = inventory.stock;
    if (type === "in") {
      newStock += parseInt(quantity);
    } else if (type === "out") {
      newStock -= parseInt(quantity);

      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock tidak mencukupi",
          currentStock: inventory.stock,
        });
      }
    }

    // Update with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update inventory
      const updated = await tx.inventory.update({
        where: { productId: parseInt(productId) },
        data: {
          stock: newStock,
          lastRestockDate:
            type === "in" ? new Date() : inventory.lastRestockDate,
          lastRestockQty:
            type === "in" ? parseInt(quantity) : inventory.lastRestockQty,
        },
      });

      // Create stock history
      await tx.stockHistory.create({
        data: {
          productId: parseInt(productId),
          type,
          quantity: parseInt(quantity),
          description,
          createdBy: req.user.id,
        },
      });

      return updated;
    });

    res.status(200).json({
      success: true,
      message: "Stock berhasil diperbarui",
      data: result,
    });
  } catch (err) {
    console.error("Update stock error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET STOCK HISTORY
// ========================================
exports.getStockHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);

    const [history, total] = await Promise.all([
      prisma.stockHistory.findMany({
        where: { productId: parseInt(productId) },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockHistory.count({ where: { productId: parseInt(productId) } }),
    ]);

    res.status(200).json({
      success: true,
      message: "Riwayat stock berhasil diambil",
      data: history,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (err) {
    console.error("Get stock history error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// UPDATE INVENTORY SETTINGS
// ========================================
exports.updateInventorySettings = async (req, res) => {
  try {
    const { productId } = req.params;
    const { minStock, maxStock, warehouseLocation } = req.body;

    // Check inventory exists
    const inventory = await prisma.inventory.findUnique({
      where: { productId: parseInt(productId) },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory tidak ditemukan",
      });
    }

    // Prepare update data
    const updateData = {};
    if (minStock !== undefined) updateData.minStock = parseInt(minStock);
    if (maxStock !== undefined) updateData.maxStock = parseInt(maxStock);
    if (warehouseLocation !== undefined)
      updateData.warehouseLocation = warehouseLocation;

    // Update
    const updated = await prisma.inventory.update({
      where: { productId: parseInt(productId) },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Pengaturan inventory berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("Update inventory settings error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
