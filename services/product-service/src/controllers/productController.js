const prisma = require("../config/prisma");
const {
  createProductSchema,
  updateProductSchema,
} = require("../utils/validation");
const {
  asyncHandler,
  validate,
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  getPaginationParams,
  buildPaginatedResponse,
} = require("../../../shared");
const { getImageUrl, deleteImage } = require("../utils/imageHandler");

/**
 * Create product
 * @route POST /api/products
 * @param {string} name - Product name
 * @param {string} sku - Product SKU
 * @param {number} price - Product price
 * @param {number} categoryId - Category ID
 * @param {string} description - Product description (optional)
 * @param {number} salePrice - Sale price (optional)
 * @returns {Object} { success, message, data }
 */
exports.createProduct = asyncHandler(async (req, res) => {
  // Validate input using shared validate
  const value = await validate(createProductSchema, req.body);
  const {
    name,
    description,
    sku,
    price,
    salePrice,
    categoryId,
    unit,
    weight,
    dimensions,
    tags,
    isFeatured,
    stock,
    minStock,
  } = value;

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Check slug exists
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) {
    return sendBadRequest(res, "Produk dengan nama tersebut sudah ada");
  }

  // Check SKU exists
  const existingSku = await prisma.product.findUnique({ where: { sku } });
  if (existingSku) {
    return sendBadRequest(res, "SKU sudah digunakan");
  }

  // Handle image uploads
  const images = req.files ? req.files.map((file) => file.filename) : [];

  // Create product with inventory
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      sku,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      categoryId,
      unit: unit || "pcs",
      weight: weight ? parseFloat(weight) : null,
      dimensions,
      images: images.length > 0 ? images : undefined,
      tags,
      isFeatured: isFeatured === "true" || isFeatured === true,
      createdBy: req.user.id,
    },
    include: {
      category: true,
    },
  });

  // Create inventory separately
  await prisma.inventory.create({
    data: {
      productId: product.id,
      stock: stock ? parseInt(stock) : 0,
      minStock: minStock ? parseInt(minStock) : 10,
    },
  });

  // Create stock history if stock > 0
  if (stock && parseInt(stock) > 0) {
    await prisma.stockHistory.create({
      data: {
        productId: product.id,
        type: "in",
        quantity: parseInt(stock),
        description: "Initial stock",
        createdBy: req.user.id,
      },
    });
  }

  return sendSuccess(res, product, "Produk berhasil dibuat", 201);
});

/**
 * Get all products with filters and pagination
 * @route GET /api/products
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search term (optional)
 * @param {number} categoryId - Filter by category (optional)
 * @param {number} minPrice - Minimum price (optional)
 * @param {number} maxPrice - Maximum price (optional)
 * @param {boolean} isFeatured - Filter by featured (optional)
 * @param {boolean} isActive - Filter by active (optional)
 * @returns {Object} { success, message, data, pagination }
 */
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { search, categoryId, minPrice, maxPrice, isFeatured, isActive } =
    req.query;

  // Build where clause
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId);
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured === "true";
  }

  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  // Get products
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        inventory: {
          select: {
            stock: true,
            minStock: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return sendSuccess(res, {
    data: products,
    pagination: buildPaginatedResponse(total, page, limit),
  }, "Produk berhasil diambil");
});

/**
 * Get product by ID
 * @route GET /api/products/:id
 * @param {number} id - Product ID
 * @returns {Object} { success, message, data }
 */
exports.getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      inventory: true,
    },
  });

  if (!product) {
    return sendNotFound(res, "Produk tidak ditemukan");
  }

  return sendSuccess(res, product, "Produk berhasil diambil");
});

/**
 * Get product by slug
 * @route GET /api/products/slug/:slug
 * @param {string} slug - Product slug
 * @returns {Object} { success, message, data }
 */
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      inventory: true,
    },
  });

  if (!product) {
    return sendNotFound(res, "Produk tidak ditemukan");
  }

  return sendSuccess(res, product, "Produk berhasil diambil");
});

/**
 * Get featured products
 * @route GET /api/products/featured/list
 * @param {number} limit - Limit results (default: 10)
 * @returns {Object} { success, message, data }
 */
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isActive: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      inventory: {
        select: {
          stock: true,
        },
      },
    },
    take: parseInt(limit),
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, products, "Produk featured berhasil diambil");
});

/**
 * Update product
 * @route PUT /api/products/:id
 * @param {number} id - Product ID
 * @returns {Object} { success, message, data }
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate input using shared validate
  const value = await validate(updateProductSchema, updateData);

  // Check product exists
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    return sendNotFound(res, "Produk tidak ditemukan");
  }

  // Prepare update data
  const data = {};

  if (value.name) {
    data.name = value.name;
    data.slug = value.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  if (value.description !== undefined) data.description = value.description;
  if (value.sku) data.sku = value.sku;
  if (value.price) data.price = parseFloat(value.price);
  if (value.salePrice !== undefined)
    data.salePrice = value.salePrice ? parseFloat(value.salePrice) : null;
  if (value.categoryId) data.categoryId = parseInt(value.categoryId);
  if (value.unit) data.unit = value.unit;
  if (value.weight !== undefined)
    data.weight = value.weight ? parseFloat(value.weight) : null;
  if (value.dimensions !== undefined) data.dimensions = value.dimensions;
  if (value.tags !== undefined) data.tags = value.tags;
  if (value.isActive !== undefined)
    data.isActive = value.isActive === "true" || value.isActive === true;
  if (value.isFeatured !== undefined)
    data.isFeatured = value.isFeatured === "true" || value.isFeatured === true;

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => file.filename);
    const existingImages = product.images || [];
    data.images = [...existingImages, ...newImages];
  }

  // Update product
  const updated = await prisma.product.update({
    where: { id: parseInt(id) },
    data,
    include: {
      category: true,
      inventory: true,
    },
  });

  return sendSuccess(res, updated, "Produk berhasil diperbarui");
});

/**
 * Delete product
 * @route DELETE /api/products/:id
 * @param {number} id - Product ID
 * @returns {Object} { success, message }
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check product exists
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    return sendNotFound(res, "Produk tidak ditemukan");
  }

  // Delete images
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      await deleteImage(image);
    }
  }

  // Delete product (cascade delete inventory & stock history)
  await prisma.product.delete({
    where: { id: parseInt(id) },
  });

  return sendSuccess(res, {}, "Produk berhasil dihapus");
});

/**
 * Toggle featured status
 * @route PATCH /api/products/:id/toggle-featured
 * @param {number} id - Product ID
 * @returns {Object} { success, message, data }
 */
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    return sendNotFound(res, "Produk tidak ditemukan");
  }

  const updated = await prisma.product.update({
    where: { id: parseInt(id) },
    data: { isFeatured: !product.isFeatured },
  });

  return sendSuccess(res, updated, `Produk ${updated.isFeatured ? "ditandai" : "dihapus"} sebagai featured`);
});

/**
 * Toggle active status
 * @route PATCH /api/products/:id/toggle-active
 * @param {number} id - Product ID
 * @returns {Object} { success, message, data }
 */
exports.toggleActive = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    return sendNotFound(res, "Produk tidak ditemukan");
  }

  const updated = await prisma.product.update({
    where: { id: parseInt(id) },
    data: { isActive: !product.isActive },
  });

  return sendSuccess(res, updated, `Produk ${updated.isActive ? "diaktifkan" : "dinonaktifkan"}`);
});
