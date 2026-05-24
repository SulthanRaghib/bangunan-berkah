const Joi = require("joi")

// ========================================
// PROJECT VALIDATION
// ========================================
const createProjectSchema = Joi.object({
    projectName: Joi.string().min(5).max(255).required().messages({
        "string.empty": "Nama proyek tidak boleh kosong",
        "string.min": "Nama proyek minimal 5 karakter",
        "string.max": "Nama proyek maksimal 255 karakter",
        "any.required": "Nama proyek wajib diisi",
    }),
    description: Joi.string().max(5000).optional().allow("", null).messages({
        "string.max": "Deskripsi maksimal 5000 karakter",
    }),
    projectType: Joi.string().valid("konstruksi", "design", "design_and_build").required().messages({
        "any.only": "Tipe proyek harus 'konstruksi', 'design', atau 'design_and_build'",
        "any.required": "Tipe proyek wajib diisi",
    }),
    customerName: Joi.string().min(3).max(255).required().messages({
        "string.empty": "Nama customer tidak boleh kosong",
        "string.min": "Nama customer minimal 3 karakter",
        "string.max": "Nama customer maksimal 255 karakter",
        "any.required": "Nama customer wajib diisi",
    }),
    customerEmail: Joi.string().email().optional().allow("", null).messages({
        "string.email": "Format email tidak valid",
    }),
    customerPhone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .optional()
        .allow("", null)
        .messages({
            "string.pattern.base": "Nomor telepon harus 10-15 digit angka",
        }),
    customerAddress: Joi.string().min(10).max(500).required().messages({
        "string.empty": "Alamat proyek tidak boleh kosong",
        "string.min": "Alamat proyek minimal 10 karakter",
        "string.max": "Alamat proyek maksimal 500 karakter",
        "any.required": "Alamat proyek wajib diisi",
    }),
    budget: Joi.number().positive().optional().allow(null).messages({
        "number.base": "Budget harus berupa angka",
        "number.positive": "Budget harus lebih dari 0",
    }),
    startDate: Joi.date().optional().allow(null).messages({
        "date.base": "Tanggal mulai harus berupa tanggal valid",
    }),
    estimatedEndDate: Joi.date().optional().allow(null).messages({
        "date.base": "Estimasi tanggal selesai harus berupa tanggal valid",
    }),
    notes: Joi.string().max(5000).optional().allow("", null).messages({
        "string.max": "Catatan maksimal 5000 karakter",
    }),
});

const updateProjectSchema = Joi.object({
    projectName: Joi.string().min(5).max(255).optional().messages({
        "string.min": "Nama proyek minimal 5 karakter",
        "string.max": "Nama proyek maksimal 255 karakter",
    }),
    description: Joi.string().max(5000).optional().allow("", null).messages({
        "string.max": "Deskripsi maksimal 5000 karakter",
    }),
    projectType: Joi.string().valid("konstruksi", "design", "design_and_build").optional().messages({
        "any.only": "Tipe proyek harus 'konstruksi', 'design', atau 'design_and_build'",
    }),
    customerName: Joi.string().min(3).max(255).optional().messages({
        "string.min": "Nama customer minimal 3 karakter",
        "string.max": "Nama customer maksimal 255 karakter",
    }),
    customerEmail: Joi.string().email().optional().allow("", null).messages({
        "string.email": "Format email tidak valid",
    }),
    customerPhone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .optional()
        .allow("", null)
        .messages({
            "string.pattern.base": "Nomor telepon harus 10-15 digit angka",
        }),
    customerAddress: Joi.string().min(10).max(500).optional().allow("", null).messages({
        "string.min": "Alamat proyek minimal 10 karakter",
        "string.max": "Alamat proyek maksimal 500 karakter",
    }),
    budget: Joi.number().positive().optional().allow(null).messages({
        "number.base": "Budget harus berupa angka",
        "number.positive": "Budget harus lebih dari 0",
    }),
    startDate: Joi.date().optional().allow(null).messages({
        "date.base": "Tanggal mulai harus berupa tanggal valid",
    }),
    estimatedEndDate: Joi.date().optional().allow(null).messages({
        "date.base": "Estimasi tanggal selesai harus berupa tanggal valid",
    }),
    status: Joi.string()
        .valid("pending", "in_progress", "on_hold", "completed", "cancelled")
        .optional()
        .messages({
            "any.only": "Status harus 'pending', 'in_progress', 'on_hold', 'completed', atau 'cancelled'",
        }),
    notes: Joi.string().max(5000).optional().allow("", null).messages({
        "string.max": "Catatan maksimal 5000 karakter",
    }),
}).min(1).messages({
    "object.min": "Minimal satu field harus diperbarui",
});

// ========================================
// PHOTOS VALIDATION
// ========================================
const deletePhotoSchema = Joi.object({
    url: Joi.string().uri().required().messages({
        "string.empty": "URL foto tidak boleh kosong",
        "string.uri": "URL foto harus berupa URL yang valid",
        "any.required": "URL foto wajib diisi",
    }),
});

// ========================================
// EXPORTS
// ========================================
// Export only schemas - validation logic is handled by shared validate utility
module.exports = {
    createProjectSchema,
    updateProjectSchema,
    deletePhotoSchema,
};