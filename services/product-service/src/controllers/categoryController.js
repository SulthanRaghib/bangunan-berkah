const prisma = require("../config/prisma");
const {
  createCategorySchema,
  updateCategorySchema,
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

/**
 * Create category
 * @route POST /api/categories
 * @param {string} name - Category name
 * @param {string} description - Category description (optional)
 * @param {string} icon - Category icon (optional)
 * @returns {Object} { success, message, data }
 */
exports.createCategory = asyncHandler(async (req, res) => {
  // Validate input using shared validate
  const value = await validate(createCategorySchema, req.body);
  const { name, description, icon } = value;

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Check if slug exists
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return sendBadRequest(res, "Kategori dengan nama tersebut sudah ada");
  }

  // Create category
  const category = await prisma.category.create({
    data: { name, slug, description, icon },
  });

  return sendSuccess(res, category, "Kategori berhasil dibuat", 201);
});

/**
 * Get all categories with pagination
 * @route GET /api/categories
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search term (optional)
 * @param {boolean} isActive - Filter by active (optional)
 * @returns {Object} { success, message, data, pagination }
 */
exports.getAllCategories = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { search, isActive } = req.query;

  // Build where clause
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  // Get categories with pagination
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.count({ where }),
  ]);

  return sendSuccess(res, {
    data: categories,
    pagination: buildPaginatedResponse(total, page, limit),
  }, "Kategori berhasil diambil");
});

/**
 * Get category by ID with products
 * @route GET /api/categories/:id
 * @param {number} id - Category ID
 * @returns {Object} { success, message, data }
 */
exports.getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          isActive: true,
        },
        where: { isActive: true },
        take: 10,
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    return sendNotFound(res, "Kategori tidak ditemukan");
  }

  return sendSuccess(res, category, "Kategori berhasil diambil");
});

/**
 * Update category
 * @route PUT /api/categories/:id
 * @param {number} id - Category ID
 * @param {string} name - Category name (optional)
 * @param {string} description - Category description (optional)
 * @param {string} icon - Category icon (optional)
 * @param {boolean} isActive - Active status (optional)
 * @returns {Object} { success, message, data }
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate input using shared validate
  const value = await validate(updateCategorySchema, req.body);
  const { name, description, icon, isActive } = value;

  // Check exists
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category) {
    return sendNotFound(res, "Kategori tidak ditemukan");
  }

  // Prepare update data
  const updateData = {};
  if (name) {
    updateData.name = name;
    updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;
  if (isActive !== undefined) updateData.isActive = isActive;

  // Update
  const updated = await prisma.category.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  return sendSuccess(res, updated, "Kategori berhasil diperbarui");
});

/**
 * Delete category
 * @route DELETE /api/categories/:id
 * @param {number} id - Category ID
 * @returns {Object} { success, message }
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check exists
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    return sendNotFound(res, "Kategori tidak ditemukan");
  }

  // Check if has products
  if (category._count.products > 0) {
    return sendBadRequest(
      res,
      `Tidak dapat menghapus kategori yang memiliki ${category._count.products} produk`
    );
  }

  // Delete
  await prisma.category.delete({
    where: { id: parseInt(id) },
  });

  return sendSuccess(res, {}, "Kategori berhasil dihapus");
});
