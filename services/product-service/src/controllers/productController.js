const prisma = require("../config/prisma");
const {
  validateCreateProduct,
  validateUpdateProduct,
} = require("../utils/validation");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../utils/pagination");
const { getImageUrl, deleteImage } = require("../utils/imageHandler");

// ========================================
// CREATE PRODUCT
// ========================================
exports.createProduct = async (req, res) => {
  try {
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
    } = req.body;

    // Validation
    const { error } = validateCreateProduct(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check slug exists
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Produk dengan nama tersebut sudah ada",
      });
    }

    // Check SKU exists
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: "SKU sudah digunakan",
      });
    }

    // Handle image uploads
    const images = req.files ? req.files.map((file) => file.filename) : [];

    // Create product with transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description,
          sku,
          price: parseFloat(price),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          categoryId: parseInt(categoryId),
          unit: unit || "pcs",
          weight: weight ? parseFloat(weight) : null,
          dimensions,
          images,
          tags,
          isFeatured: isFeatured === "true" || isFeatured === true,
          createdBy: req.user.id,
        },
        include: {
          category: true,
        },
      });

      // Create inventory
      await tx.inventory.create({
        data: {
          productId: newProduct.id,
          stock: stock ? parseInt(stock) : 0,
          minStock: minStock ? parseInt(minStock) : 10,
        },
      });

      // Create stock history
      if (stock && parseInt(stock) > 0) {
        await tx.stockHistory.create({
          data: {
            productId: newProduct.id,
            type: "in",
            quantity: parseInt(stock),
            description: "Initial stock",
            createdBy: req.user.id,
          },
        });
      }

      return newProduct;
    });

    res.status(201).json({
      success: true,
      message: "Produk berhasil dibuat",
      data: product,
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET ALL PRODUCTS
// ========================================
exports.getAllProducts = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      message: "Produk berhasil diambil",
      data: products,
      pagination: getPaginationMeta(total, page, limit),
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET PRODUCT BY ID
// ========================================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        inventory: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produk berhasil diambil",
      data: product,
    });
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET PRODUCT BY SLUG
// ========================================
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        inventory: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produk berhasil diambil",
      data: product,
    });
  } catch (err) {
    console.error("Get product by slug error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET FEATURED PRODUCTS
// ========================================
exports.getFeaturedProducts = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      message: "Produk featured berhasil diambil",
      data: products,
    });
  } catch (err) {
    console.error("Get featured products error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// UPDATE PRODUCT
// ========================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validation
    const { error } = validateUpdateProduct(updateData);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // Prepare update data
    const data = {};

    if (updateData.name) {
      data.name = updateData.name;
      data.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    if (updateData.description !== undefined)
      data.description = updateData.description;
    if (updateData.sku) data.sku = updateData.sku;
    if (updateData.price) data.price = parseFloat(updateData.price);
    if (updateData.salePrice !== undefined)
      data.salePrice = updateData.salePrice
        ? parseFloat(updateData.salePrice)
        : null;
    if (updateData.categoryId)
      data.categoryId = parseInt(updateData.categoryId);
    if (updateData.unit) data.unit = updateData.unit;
    if (updateData.weight !== undefined)
      data.weight = updateData.weight ? parseFloat(updateData.weight) : null;
    if (updateData.dimensions !== undefined)
      data.dimensions = updateData.dimensions;
    if (updateData.tags !== undefined) data.tags = updateData.tags;
    if (updateData.isActive !== undefined)
      data.isActive =
        updateData.isActive === "true" || updateData.isActive === true;
    if (updateData.isFeatured !== undefined)
      data.isFeatured =
        updateData.isFeatured === "true" || updateData.isFeatured === true;

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

    res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: updated,
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan server, mohon periksa kembali data yang dikirimkan",
    });
  }
};

// ========================================
// DELETE PRODUCT
// ========================================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
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

    res.status(200).json({
      success: true,
      message: "Produk berhasil dihapus",
    });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// TOGGLE FEATURED
// ========================================
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isFeatured: !product.isFeatured },
    });

    res.status(200).json({
      success: true,
      message: `Produk ${
        updated.isFeatured ? "ditandai" : "dihapus"
      } sebagai featured`,
      data: updated,
    });
  } catch (err) {
    console.error("Toggle featured error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// TOGGLE ACTIVE
// ========================================
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: !product.isActive },
    });

    res.status(200).json({
      success: true,
      message: `Produk ${updated.isActive ? "diaktifkan" : "dinonaktifkan"}`,
      data: updated,
    });
  } catch (err) {
    console.error("Toggle active error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
