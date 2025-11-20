const Joi = require("joi")

// ========================================
// PROJECT VALIDATION
// ========================================
const createProjectSchema = Joi.object({
    projectName: Joi.string().min(5).max(255).required().messages({
        "string.empty": "Nama proyek wajib diisi",
        "string.min": "Nama proyek minimal 5 karakter",
        "any.required": "Nama proyek wajib diisi",
    }),
    description: Joi.string().max(5000).optional().allow(""),
    projectType: Joi.string().valid("konstruksi", "furniture").required().messages({
        "any.only": "Tipe proyek harus konstruksi atau furniture",
        "any.required": "Tipe proyek wajib diisi",
    }),
    customerName: Joi.string().min(3).max(255).required().messages({
        "string.empty": "Nama customer wajib diisi",
        "any.required": "Nama customer wajib diisi",
    }),
    customerEmail: Joi.string().email().required().messages({
        "string.email": "Email tidak valid",
        "any.required": "Email customer wajib diisi",
    }),
    customerPhone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
            "string.pattern.base": "Nomor telepon harus 10-15 digit angka",
            "any.required": "Nomor telepon customer wajib diisi",
        }),
    customerAddress: Joi.string().min(10).optional().allow(""),
    budget: Joi.number().positive().optional(),
    startDate: Joi.date().required().messages({
        "any.required": "Tanggal mulai wajib diisi",
    }),
    estimatedEndDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
        "date.greater": "Estimasi selesai harus setelah tanggal mulai",
        "any.required": "Estimasi tanggal selesai wajib diisi",
    }),
    notes: Joi.string().max(5000).optional().allow(""),
});

const updateProjectSchema = Joi.object({
    projectName: Joi.string().min(5).max(255).optional(),
    description: Joi.string().max(5000).optional().allow(""),
    projectType: Joi.string().valid("konstruksi", "furniture").optional(),
    customerName: Joi.string().min(3).max(255).optional(),
    customerEmail: Joi.string().email().optional(),
    customerPhone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .optional(),
    customerAddress: Joi.string().min(10).optional().allow(""),
    budget: Joi.number().positive().optional(),
    startDate: Joi.date().optional(),
    estimatedEndDate: Joi.date().optional(),
    status: Joi.string()
        .valid("pending", "in_progress", "on_hold", "completed", "cancelled")
        .optional(),
    notes: Joi.string().max(5000).optional().allow(""),
}).min(1);

// ========================================
// MILESTONE VALIDATION
// ========================================
const createMilestoneSchema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(5000).optional().allow(""),
    order: Joi.number().integer().positive().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).required(),
    notes: Joi.string().max(5000).optional().allow(""),
});

const updateMilestoneProgressSchema = Joi.object({
    progress: Joi.number().integer().min(0).max(100).required(),
    status: Joi.string().valid("pending", "in_progress", "completed", "delayed").optional(),
    notes: Joi.string().max(5000).optional().allow(""),
});

// ========================================
// EXPORTS
// ========================================
module.exports = {
    validateCreateProject: (data) => createProjectSchema.validate(data),
    validateUpdateProject: (data) => updateProjectSchema.validate(data),
    validateCreateMilestone: (data) => createMilestoneSchema.validate(data),
    validateUpdateMilestoneProgress: (data) => updateMilestoneProgressSchema.validate(data),
};