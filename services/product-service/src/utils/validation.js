const Joi = require("joi");

// ========================================
// CATEGORY VALIDATION
// ========================================
const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional().allow(""),
  icon: Joi.string().max(255).optional().allow(""),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional().allow(""),
  icon: Joi.string().max(255).optional().allow(""),
  isActive: Joi.boolean().optional(),
}).min(1);

// ========================================
// PRODUCT VALIDATION
// ========================================
const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(5000).optional().allow(""),
  sku: Joi.string().min(3).max(100).required(),
  price: Joi.number().positive().required(),
  salePrice: Joi.number().positive().optional(),
  categoryId: Joi.number().integer().positive().required(),
  unit: Joi.string().max(50).optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.string().max(100).optional().allow(""),
  tags: Joi.string().max(500).optional().allow(""),
  isFeatured: Joi.boolean().optional(),
  stock: Joi.number().integer().min(0).optional(), // Initial stock
  minStock: Joi.number().integer().min(0).optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  description: Joi.string().max(5000).optional().allow(""),
  sku: Joi.string().min(3).max(100).optional(),
  price: Joi.number().positive().optional(),
  salePrice: Joi.number().positive().optional(),
  categoryId: Joi.number().integer().positive().optional(),
  unit: Joi.string().max(50).optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.string().max(100).optional().allow(""),
  tags: Joi.string().max(500).optional().allow(""),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
}).min(1);

// ========================================
// INVENTORY VALIDATION
// ========================================
const updateStockSchema = Joi.object({
  type: Joi.string().valid("in", "out").required(),
  quantity: Joi.number().integer().positive().required(),
  description: Joi.string().max(500).optional().allow(""),
});

// ========================================
// EXPORTS
// ========================================
module.exports = {
  validateCreateCategory: (data) => createCategorySchema.validate(data),
  validateUpdateCategory: (data) => updateCategorySchema.validate(data),
  validateCreateProduct: (data) => createProductSchema.validate(data),
  validateUpdateProduct: (data) => updateProductSchema.validate(data),
  validateUpdateStock: (data) => updateStockSchema.validate(data),
};
