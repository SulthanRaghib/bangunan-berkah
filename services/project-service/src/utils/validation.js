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
    description: Joi.string().max(5000).optional().allow("").messages({
        "string.max": "Deskripsi maksimal 5000 karakter",
    }),
    projectType: Joi.string().valid("konstruksi", "furniture").required().messages({
        "any.only": "Tipe proyek harus 'konstruksi' atau 'furniture'",
        "any.required": "Tipe proyek wajib diisi",
    }),
    customerName: Joi.string().min(3).max(255).required().messages({
        "string.empty": "Nama customer tidak boleh kosong",
        "string.min": "Nama customer minimal 3 karakter",
        "string.max": "Nama customer maksimal 255 karakter",
        "any.required": "Nama customer wajib diisi",
    }),
    customerEmail: Joi.string().email().required().messages({
        "string.empty": "Email customer tidak boleh kosong",
        "string.email": "Format email tidak valid",
        "any.required": "Email customer wajib diisi",
    }),
    customerPhone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
            "string.empty": "Nomor telepon tidak boleh kosong",
            "string.pattern.base": "Nomor telepon harus 10-15 digit angka",
            "any.required": "Nomor telepon customer wajib diisi",
        }),
    customerAddress: Joi.string().min(10).max(500).optional().allow("").messages({
        "string.min": "Alamat customer minimal 10 karakter",
        "string.max": "Alamat customer maksimal 500 karakter",
    }),
    budget: Joi.number().positive().optional().messages({
        "number.base": "Budget harus berupa angka",
        "number.positive": "Budget harus lebih dari 0",
    }),
    startDate: Joi.date().required().messages({
        "date.base": "Tanggal mulai harus berupa tanggal valid",
        "any.required": "Tanggal mulai wajib diisi",
    }),
    estimatedEndDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
        "date.base": "Estimasi tanggal selesai harus berupa tanggal valid",
        "date.greater": "Estimasi tanggal selesai harus setelah tanggal mulai",
        "any.required": "Estimasi tanggal selesai wajib diisi",
    }),
    notes: Joi.string().max(5000).optional().allow("").messages({
        "string.max": "Catatan maksimal 5000 karakter",
    }),
});

const updateProjectSchema = Joi.object({
    projectName: Joi.string().min(5).max(255).optional().messages({
        "string.min": "Nama proyek minimal 5 karakter",
        "string.max": "Nama proyek maksimal 255 karakter",
    }),
    description: Joi.string().max(5000).optional().allow("").messages({
        "string.max": "Deskripsi maksimal 5000 karakter",
    }),
    projectType: Joi.string().valid("konstruksi", "furniture").optional().messages({
        "any.only": "Tipe proyek harus 'konstruksi' atau 'furniture'",
    }),
    customerName: Joi.string().min(3).max(255).optional().messages({
        "string.min": "Nama customer minimal 3 karakter",
        "string.max": "Nama customer maksimal 255 karakter",
    }),
    customerEmail: Joi.string().email().optional().messages({
        "string.email": "Format email tidak valid",
    }),
    customerPhone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .optional()
        .messages({
            "string.pattern.base": "Nomor telepon harus 10-15 digit angka",
        }),
    customerAddress: Joi.string().min(10).max(500).optional().allow("").messages({
        "string.min": "Alamat customer minimal 10 karakter",
        "string.max": "Alamat customer maksimal 500 karakter",
    }),
    budget: Joi.number().positive().optional().messages({
        "number.base": "Budget harus berupa angka",
        "number.positive": "Budget harus lebih dari 0",
    }),
    startDate: Joi.date().optional().messages({
        "date.base": "Tanggal mulai harus berupa tanggal valid",
    }),
    estimatedEndDate: Joi.date().optional().messages({
        "date.base": "Estimasi tanggal selesai harus berupa tanggal valid",
    }),
    status: Joi.string()
        .valid("pending", "in_progress", "on_hold", "completed", "cancelled")
        .optional()
        .messages({
            "any.only": "Status harus 'pending', 'in_progress', 'on_hold', 'completed', atau 'cancelled'",
        }),
    notes: Joi.string().max(5000).optional().allow("").messages({
        "string.max": "Catatan maksimal 5000 karakter",
    }),
}).min(1).messages({
    "object.min": "Minimal satu field harus diperbarui",
});

// ========================================
// EXPORTS
// ========================================
// Export only schemas - validation logic is handled by shared validate utility
module.exports = {
    createProjectSchema,
    updateProjectSchema,
};