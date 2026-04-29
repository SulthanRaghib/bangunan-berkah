const {
  createCategorySchema,
  updateCategorySchema,
} = require("../utils/validation");
const {
  isValidObjectId,
  toObjectIdExt,
  escapeRegex,
  findOne,
  count,
  aggregate,
  insertOne,
  getRawById,
  updateOneById,
  deleteOneById,
} = require("../utils/mongoRaw");
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
  const existing = await findOne({
    collection: "categories",
    filter: { slug },
  });

  if (existing) {
    return sendBadRequest(res, "Kategori dengan nama tersebut sudah ada");
  }

  // Create category
  await insertOne({
    collection: "categories",
    document: {
      name,
      slug,
      description: description || null,
      icon: icon || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const category = await findOne({
    collection: "categories",
    filter: { slug },
    sort: { createdAt: -1 },
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

  // Build Mongo match clause
  const match = {};
  if (search) {
    const safe = escapeRegex(search);
    match.$or = [
      { name: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
    ];
  }

  if (isActive !== undefined) {
    match.isActive = isActive === "true";
  }

  // Get categories with pagination
  const [categories, total] = await Promise.all([
    aggregate({
      collection: "categories",
      pipeline: [
        { $match: match },
        {
          $lookup: {
            from: "products",
            let: { categoryId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$categoryId", "$$categoryId"] } } },
              { $count: "count" },
            ],
            as: "productCountDocs",
          },
        },
        {
          $addFields: {
            _count: {
              products: {
                $ifNull: [{ $arrayElemAt: ["$productCountDocs.count", 0] }, 0],
              },
            },
          },
        },
        { $project: { productCountDocs: 0 } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
    }),
    count({
      collection: "categories",
      filter: match,
    }),
  ]);

  return sendSuccess(
    res,
    {
      data: categories,
      pagination: buildPaginatedResponse(total, page, limit),
    },
    "Kategori berhasil diambil"
  );
});

/**
 * Get category by ID with products
 * @route GET /api/categories/:id
 * @param {string} id - Category ID (ObjectId)
 * @returns {Object} { success, message, data }
 */
exports.getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendBadRequest(res, "ID kategori tidak valid");
  }

  const rows = await aggregate({
    collection: "categories",
    pipeline: [
      {
        $addFields: {
          idString: { $toString: "$_id" },
        },
      },
      { $match: { idString: id } },
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$categoryId", "$$categoryId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
                price: 1,
                images: 1,
                isActive: 1,
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
          ],
          as: "products",
        },
      },
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$categoryId", "$$categoryId"] } } },
            { $count: "count" },
          ],
          as: "productCountDocs",
        },
      },
      {
        $addFields: {
          _count: {
            products: {
              $ifNull: [{ $arrayElemAt: ["$productCountDocs.count", 0] }, 0],
            },
          },
        },
      },
      { $project: { productCountDocs: 0, idString: 0 } },
      { $limit: 1 },
    ],
  });

  const category = rows[0];

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

  if (!isValidObjectId(id)) {
    return sendBadRequest(res, "ID kategori tidak valid");
  }

  // Validate input using shared validate
  const value = await validate(updateCategorySchema, req.body);
  const { name, description, icon, isActive } = value;

  // Check exists
  const category = await getRawById({ collection: "categories", id });

  if (!category) {
    return sendNotFound(res, "Kategori tidak ditemukan");
  }

  // Prepare update data
  const updateData = {};
  if (name) {
    const newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existingBySlug = await findOne({
      collection: "categories",
      filter: {
        slug: newSlug,
        _id: { $ne: toObjectIdExt(id) },
      },
    });

    if (existingBySlug) {
      return sendBadRequest(res, "Kategori dengan nama tersebut sudah ada");
    }

    updateData.name = name;
    updateData.slug = newSlug;
  }

  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;
  if (isActive !== undefined) updateData.isActive = isActive;
  updateData.updatedAt = new Date();

  // Update
  await updateOneById({
    collection: "categories",
    id,
    update: updateData,
  });

  const updated = await findOne({
    collection: "categories",
    filter: { _id: toObjectIdExt(id) },
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

  if (!isValidObjectId(id)) {
    return sendBadRequest(res, "ID kategori tidak valid");
  }

  // Check exists
  const category = await getRawById({ collection: "categories", id });

  if (!category) {
    return sendNotFound(res, "Kategori tidak ditemukan");
  }

  const productCount = await count({
    collection: "products",
    filter: { categoryId: category._id },
  });

  // Check if has products
  if (productCount > 0) {
    return sendBadRequest(
      res,
      `Tidak dapat menghapus kategori yang memiliki ${productCount} produk`
    );
  }

  // Delete
  await deleteOneById({
    collection: "categories",
    id,
  });

  return sendSuccess(res, {}, "Kategori berhasil dihapus");
});
