const Joi = require("joi")

// ========================================
// HELPER FUNCTIONS FOR VALIDATION
// ========================================

/**
 * Validasi cross-field untuk timeline proyek
 * Memastikan: startDate <= estimatedEndDate
 */
const validateProjectTimeline = (value) => {
    if (!value.startDate || !value.estimatedEndDate) {
        return; // Skip validation jika salah satu tidak ada
    }

    const startDate = new Date(value.startDate);
    const estimatedEndDate = new Date(value.estimatedEndDate);

    // Check if startDate is in far past (more than 1 year back)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (startDate < oneYearAgo) {
        throw new Error("Tanggal mulai tidak boleh lebih dari 1 tahun yang lalu. Gunakan tanggal yang realistis untuk proyek aktif");
    }

    // Check if estimatedEndDate is more than 10 years in future
    const tenYearsFromNow = new Date();
    tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
    if (estimatedEndDate > tenYearsFromNow) {
        throw new Error("Tanggal selesai estimasi tidak boleh lebih dari 10 tahun ke depan");
    }

    // Main validation: estimatedEndDate must be >= startDate
    if (estimatedEndDate < startDate) {
        throw new Error("Tanggal selesai estimasi harus lebih besar atau sama dengan tanggal mulai proyek");
    }
};

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
}).external(validateProjectTimeline);

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
}).external(validateProjectTimeline);

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
// MILESTONE VALIDATION
// ========================================

/**
 * Validasi untuk milestone - standardisasi status format
 * Menerima berbagai format tapi akan disimpan dalam format standard
 */
const normalizeMilestoneStatus = (status) => {
    if (!status) return status;

    const statusMap = {
        "menunggu": "PENDING",
        "berjalan": "IN_PROGRESS",
        "selesai": "COMPLETED",
        "pending": "PENDING",
        "PENDING": "PENDING",
        "on_progress": "IN_PROGRESS",
        "in_progress": "IN_PROGRESS",
        "IN_PROGRESS": "IN_PROGRESS",
        "menunggu": "PENDING",
        "MENUNGGU": "PENDING",
        "completed": "COMPLETED",
        "COMPLETED": "COMPLETED",
        "selesai": "COMPLETED",
        "SELESAI": "COMPLETED",
    };

    return statusMap[status.toLowerCase()] || status.toUpperCase();
};

const addMilestoneSchema = Joi.object({
    title: Joi.string().min(3).max(255).optional().messages({
        "string.min": "Judul milestone minimal 3 karakter",
        "string.max": "Judul milestone maksimal 255 karakter",
    }),
    name: Joi.string().min(3).max(255).optional().messages({
        "string.min": "Nama milestone minimal 3 karakter",
        "string.max": "Nama milestone maksimal 255 karakter",
    }),
    description: Joi.string().max(5000).optional().allow("", null).messages({
        "string.max": "Deskripsi maksimal 5000 karakter",
    }),
    detail: Joi.string().max(5000).optional().allow("", null).messages({
        "string.max": "Detail maksimal 5000 karakter",
    }),
    targetDate: Joi.date().required().messages({
        "date.base": "Tanggal target harus berupa tanggal yang valid",
        "any.required": "Tanggal target wajib diisi",
    }),
    status: Joi.string()
        .valid(
            "menunggu", "berjalan", "selesai",
            "PENDING", "ON_PROGRESS", "COMPLETED",
            "MENUNGGU", "IN_PROGRESS", "BERJALAN", "SELESAI", "in_progress", "pending", "completed"
        )
        .optional()
        .messages({
            "any.only": "Status milestone harus 'pending', 'in_progress', atau 'completed'",
        })
        .default("PENDING"),
    progress: Joi.number().min(0).max(100).optional().messages({
        "number.min": "Progress minimal 0",
        "number.max": "Progress maksimal 100",
    }),
    photos: Joi.array().items(Joi.string().uri()).optional().messages({
        "array.base": "Photos harus berupa array",
    }),
}).or("title", "name").messages({
    "object.missing": "Salah satu dari judul (title) atau nama (name) milestone wajib diisi",
});

/**
 * Validasi cross-field untuk milestone timeline
 * Memastikan: actualCompletionDate >= targetDate
 */
const validateMilestoneTimeline = (value) => {
    if (!value.targetDate || !value.actualCompletionDate) {
        return; // Skip validation jika salah satu tidak ada
    }

    const targetDate = new Date(value.targetDate);
    const actualCompletionDate = new Date(value.actualCompletionDate);

    // actualCompletionDate tidak boleh sebelum targetDate
    if (actualCompletionDate < targetDate) {
        throw new Error("Tanggal penyelesaian aktual tidak boleh lebih awal dari tanggal target milestone");
    }
};

const updateMilestoneSchema = Joi.object({
    title: Joi.string().min(3).max(255).optional().messages({
        "string.min": "Judul milestone minimal 3 karakter",
        "string.max": "Judul milestone maksimal 255 karakter",
    }),
    name: Joi.string().min(3).max(255).optional().messages({
        "string.min": "Nama milestone minimal 3 karakter",
        "string.max": "Nama milestone maksimal 255 karakter",
    }),
    description: Joi.string().max(5000).optional().allow("", null).messages({
        "string.max": "Deskripsi maksimal 5000 karakter",
    }),
    detail: Joi.string().max(5000).optional().allow("", null).messages({
        "string.max": "Detail maksimal 5000 karakter",
    }),
    targetDate: Joi.date().optional().messages({
        "date.base": "Tanggal target harus berupa tanggal yang valid",
    }),
    status: Joi.string()
        .valid(
            "menunggu", "berjalan", "selesai",
            "PENDING", "ON_PROGRESS", "COMPLETED",
            "MENUNGGU", "IN_PROGRESS", "BERJALAN", "SELESAI", "in_progress", "pending", "completed"
        )
        .optional()
        .messages({
            "any.only": "Status milestone harus 'pending', 'in_progress', atau 'completed'",
        }),
    progress: Joi.number().min(0).max(100).optional().messages({
        "number.min": "Progress minimal 0",
        "number.max": "Progress maksimal 100",
    }),
    actualCompletionDate: Joi.date().optional().allow(null).messages({
        "date.base": "Tanggal penyelesaian harus berupa tanggal yang valid",
    }),
}).min(1).messages({
    "object.min": "Minimal satu field harus diperbarui",
}).external(validateMilestoneTimeline);

// ========================================
// EXPORTS
// ========================================
// Export only schemas - validation logic is handled by shared validate utility
module.exports = {
    createProjectSchema,
    updateProjectSchema,
    deletePhotoSchema,
    addMilestoneSchema,
    updateMilestoneSchema,
    // Helper functions untuk validasi dan normalisasi
    validateProjectTimeline,
    validateMilestoneTimeline,
    normalizeMilestoneStatus,
};