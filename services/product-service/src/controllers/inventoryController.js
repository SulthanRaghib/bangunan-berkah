const prisma = require("../config/prisma");
const { updateStockSchema } = require("../utils/validation");
const {
  asyncHandler,
  validate,
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  getPaginationParams,
  buildPaginatedResponse,
} = require("../../../shared");

/**
 * Get all inventory with pagination
 * @route GET /api/inventory
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search term (optional)
 * @param {boolean} lowStock - Filter low stock items (optional)
 * @returns {Object} { success, message, data, pagination }
 */
exports.getAllInventory = asyncHandler(async (req, res) => {
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

  return sendSuccess(res, {
    data: inventories,
    pagination: buildPaginatedResponse(total, page, limit),
  }, "Inventory berhasil diambil");
});

/**
 * Get products with low stock
 * @route GET /api/inventory/low-stock/list
 * @returns {Object} { success, message, data, count }
 */
exports.getLowStock = asyncHandler(async (req, res) => {
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

  return sendSuccess(res, lowStockProducts, "Produk dengan stock rendah");
});

/**
 * Get inventory by product ID
 * @route GET /api/inventory/product/:productId
 * @param {number} productId - Product ID
 * @returns {Object} { success, message, data }
 */
exports.getInventoryByProduct = asyncHandler(async (req, res) => {
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
    return sendNotFound(res, "Inventory tidak ditemukan");
  }

  return sendSuccess(res, inventory, "Inventory berhasil diambil");
});

/**
 * Update stock with transaction history
 * @route POST /api/inventory/update-stock
 * @param {number} productId - Product ID
 * @param {string} type - "in" or "out"
 * @param {number} quantity - Quantity to add/reduce
 * @param {string} description - Transaction description (optional)
 * @returns {Object} { success, message, data }
 */
exports.updateStock = asyncHandler(async (req, res) => {
  const { productId, type, quantity, description } = req.body;

  // Validate input using shared validate
  const value = await validate(updateStockSchema, {
    type,
    quantity,
    description,
  });

  if (!productId) {
    return sendBadRequest(res, "productId wajib diisi");
  }

  // Get current inventory
  const inventory = await prisma.inventory.findUnique({
    where: { productId: parseInt(productId) },
  });

  if (!inventory) {
    return sendNotFound(res, "Inventory tidak ditemukan");
  }

  // Calculate new stock
  let newStock = inventory.stock;
  if (value.type === "in") {
    newStock += parseInt(value.quantity);
  } else if (value.type === "out") {
    newStock -= parseInt(value.quantity);

    if (newStock < 0) {
      return sendBadRequest(
        res,
        `Stock tidak mencukupi. Stok saat ini: ${inventory.stock}`
      );
    }
  }

  // Update inventory  
  const updated = await prisma.inventory.update({
    where: { productId: parseInt(productId) },
    data: {
      stock: newStock,
      lastRestockDate:
        value.type === "in" ? new Date() : inventory.lastRestockDate,
      lastRestockQty:
        value.type === "in" ? parseInt(value.quantity) : inventory.lastRestockQty,
    },
  });

  // Create stock history
  await prisma.stockHistory.create({
    data: {
      productId: parseInt(productId),
      type: value.type,
      quantity: parseInt(value.quantity),
      description: value.description,
      createdBy: req.user.id,
    },
  });

  return sendSuccess(res, updated, "Stock berhasil diperbarui");
});

/**
 * Get stock history for a product
 * @route GET /api/inventory/history/:productId
 * @param {number} productId - Product ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Object} { success, message, data, pagination }
 */
exports.getStockHistory = asyncHandler(async (req, res) => {
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

  return sendSuccess(res, {
    data: history,
    pagination: buildPaginatedResponse(total, page, limit),
  }, "Riwayat stock berhasil diambil");
});

/**
 * Update inventory settings (minStock, maxStock, location)
 * @route PUT /api/inventory/:productId/settings
 * @param {number} productId - Product ID
 * @param {number} minStock - Minimum stock level (optional)
 * @param {number} maxStock - Maximum stock level (optional)
 * @param {string} warehouseLocation - Warehouse location (optional)
 * @returns {Object} { success, message, data }
 */
exports.updateInventorySettings = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { minStock, maxStock, warehouseLocation } = req.body;

  // Check inventory exists
  const inventory = await prisma.inventory.findUnique({
    where: { productId: parseInt(productId) },
  });

  if (!inventory) {
    return sendNotFound(res, "Inventory tidak ditemukan");
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

  return sendSuccess(res, updated, "Pengaturan inventory berhasil diperbarui");
});
