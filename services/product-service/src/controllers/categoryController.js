const prisma = require("../config/prisma");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../utils/validation");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");

// ========================================
// CREATE CATEGORY
// ========================================
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    // Validation
    const { error } = validateCreateCategory(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if slug exists
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Kategori dengan nama tersebut sudah ada",
      });
    }

    // Create category
    const category = await prisma.category.create({
      data: { name, slug, description, icon },
    });

    res.status(201).json({
      success: true,
      message: "Kategori berhasil dibuat",
      data: category,
    });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET ALL CATEGORIES
// ========================================
exports.getAllCategories = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diambil",
      data: categories,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET CATEGORY BY ID
// ========================================
exports.getCategoryById = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diambil",
      data: category,
    });
  } catch (err) {
    console.error("Get category error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// UPDATE CATEGORY
// ========================================
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, isActive } = req.body;

    // Validation
    const { error } = validateUpdateCategory(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
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

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// DELETE CATEGORY
// ========================================
exports.deleteCategory = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Check if has products
    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus kategori yang memiliki ${category._count.products} produk`,
      });
    }

    // Delete
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
