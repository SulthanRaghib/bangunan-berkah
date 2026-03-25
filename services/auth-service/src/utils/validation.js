const Joi = require("joi");

// ========================================
// VALIDATION SCHEMAS
// ========================================

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Nama tidak boleh kosong",
    "string.min": "Nama minimal 3 karakter",
    "string.max": "Nama maksimal 100 karakter",
    "any.required": "Nama wajib diisi",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email tidak boleh kosong",
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password tidak boleh kosong",
    "string.min": "Password minimal 6 karakter",
    "any.required": "Password wajib diisi",
  }),
  role: Joi.string().valid("user", "admin").optional().messages({
    "any.only": "Role harus berupa 'user' atau 'admin'",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email tidak boleh kosong",
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password tidak boleh kosong",
    "any.required": "Password wajib diisi",
  }),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.min": "Nama minimal 3 karakter",
    "string.max": "Nama maksimal 100 karakter",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "Format email tidak valid",
  }),
  password: Joi.string().min(6).optional().messages({
    "string.min": "Password minimal 6 karakter",
  }),
  role: Joi.string().valid("user", "admin").optional().messages({
    "any.only": "Role harus berupa 'user' atau 'admin'",
  }),
}).min(1).messages({
  "object.min": "Minimal satu field harus diperbarui",
});

// ========================================
// EXPORTS
// ========================================
// Export only schemas - validation logic is handled by shared validate utility
module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
};
