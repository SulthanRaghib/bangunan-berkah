const Joi = require("joi");

// ========================================
// CATEGORY VALIDATION
// ========================================
const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Nama kategori tidak boleh kosong",
    "string.min": "Nama kategori minimal 3 karakter",
    "string.max": "Nama kategori maksimal 100 karakter",
    "any.required": "Nama kategori wajib diisi",
  }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Deskripsi maksimal 500 karakter",
  }),
  icon: Joi.string().max(255).optional().allow("").messages({
    "string.max": "Icon maksimal 255 karakter",
  }),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.min": "Nama kategori minimal 3 karakter",
    "string.max": "Nama kategori maksimal 100 karakter",
  }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Deskripsi maksimal 500 karakter",
  }),
  icon: Joi.string().max(255).optional().allow("").messages({
    "string.max": "Icon maksimal 255 karakter",
  }),
  isActive: Joi.boolean().optional().messages({
    "boolean.base": "Status harus boolean (true/false)",
  }),
}).min(1).messages({
  "object.min": "Minimal satu field harus diperbarui",
});

// ========================================
// PRODUCT VALIDATION
// ========================================
const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Nama produk tidak boleh kosong",
    "string.min": "Nama produk minimal 3 karakter",
    "string.max": "Nama produk maksimal 255 karakter",
    "any.required": "Nama produk wajib diisi",
  }),
  description: Joi.string().max(5000).optional().allow("").messages({
    "string.max": "Deskripsi maksimal 5000 karakter",
  }),
  sku: Joi.string().min(3).max(100).required().messages({
    "string.empty": "SKU tidak boleh kosong",
    "string.min": "SKU minimal 3 karakter",
    "string.max": "SKU maksimal 100 karakter",
    "any.required": "SKU wajib diisi",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Harga harus berupa angka",
    "number.positive": "Harga harus lebih dari 0",
    "any.required": "Harga wajib diisi",
  }),
  salePrice: Joi.number().positive().optional().messages({
    "number.base": "Harga diskon harus berupa angka",
    "number.positive": "Harga diskon harus lebih dari 0",
  }),
  categoryId: Joi.string().length(24).hex().required().messages({
    "string.base": "ID kategori harus berupa string",
    "string.length": "ID kategori harus 24 karakter",
    "string.hex": "ID kategori harus format ObjectId valid",
    "any.required": "ID kategori wajib diisi",
  }),
  unit: Joi.string().max(50).optional().messages({
    "string.max": "Satuan maksimal 50 karakter",
  }),
  weight: Joi.number().positive().optional().messages({
    "number.base": "Berat harus berupa angka",
    "number.positive": "Berat harus lebih dari 0",
  }),
  dimensions: Joi.string().max(100).optional().allow("").messages({
    "string.max": "Dimensi maksimal 100 karakter",
  }),
  tags: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Tag maksimal 500 karakter",
  }),
  isFeatured: Joi.boolean().optional().messages({
    "boolean.base": "Status featured harus boolean (true/false)",
  }),
  stock: Joi.number().integer().min(0).optional().messages({
    "number.base": "Stok harus berupa angka",
    "number.integer": "Stok harus berupa bilangan bulat",
    "number.min": "Stok minimal 0",
  }),
  minStock: Joi.number().integer().min(0).optional().messages({
    "number.base": "Stok minimal harus berupa angka",
    "number.integer": "Stok minimal harus berupa bilangan bulat",
    "number.min": "Stok minimal minimal 0",
  }),
}).unknown(true);

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional().messages({
    "string.min": "Nama produk minimal 3 karakter",
    "string.max": "Nama produk maksimal 255 karakter",
  }),
  description: Joi.string().max(5000).optional().allow("").messages({
    "string.max": "Deskripsi maksimal 5000 karakter",
  }),
  sku: Joi.string().min(3).max(100).optional().messages({
    "string.min": "SKU minimal 3 karakter",
    "string.max": "SKU maksimal 100 karakter",
  }),
  price: Joi.number().positive().optional().messages({
    "number.base": "Harga harus berupa angka",
    "number.positive": "Harga harus lebih dari 0",
  }),
  salePrice: Joi.number().positive().optional().messages({
    "number.base": "Harga diskon harus berupa angka",
    "number.positive": "Harga diskon harus lebih dari 0",
  }),
  categoryId: Joi.string().length(24).hex().optional().messages({
    "string.base": "ID kategori harus berupa string",
    "string.length": "ID kategori harus 24 karakter",
    "string.hex": "ID kategori harus format ObjectId valid",
  }),
  unit: Joi.string().max(50).optional().messages({
    "string.max": "Satuan maksimal 50 karakter",
  }),
  weight: Joi.number().positive().optional().messages({
    "number.base": "Berat harus berupa angka",
    "number.positive": "Berat harus lebih dari 0",
  }),
  dimensions: Joi.string().max(100).optional().allow("").messages({
    "string.max": "Dimensi maksimal 100 karakter",
  }),
  tags: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Tag maksimal 500 karakter",
  }),
  isActive: Joi.boolean().optional().messages({
    "boolean.base": "Status aktif harus boolean (true/false)",
  }),
  isFeatured: Joi.boolean().optional().messages({
    "boolean.base": "Status featured harus boolean (true/false)",
  }),
})
  .min(1).messages({
    "object.min": "Minimal satu field harus diperbarui",
  })
  .unknown(true);

// ========================================
// INVENTORY VALIDATION
// ========================================
const updateStockSchema = Joi.object({
  type: Joi.string().valid("in", "out").required().messages({
    "any.only": "Tipe harus berupa 'in' atau 'out'",
    "string.empty": "Tipe tidak boleh kosong",
    "any.required": "Tipe wajib diisi",
  }),
  quantity: Joi.number().integer().positive().required().messages({
    "number.base": "Jumlah harus berupa angka",
    "number.integer": "Jumlah harus berupa bilangan bulat",
    "number.positive": "Jumlah harus lebih dari 0",
    "any.required": "Jumlah wajib diisi",
  }),
  description: Joi.string().max(500).optional().allow("").messages({
    "string.max": "Deskripsi maksimal 500 karakter",
  }),
});

// ========================================
// EXPORTS
// ========================================
// Export only schemas - validation logic is handled by shared validate utility
module.exports = {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
};
