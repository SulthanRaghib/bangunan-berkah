const Joi = require("joi");

/**
 * Review Validation Schema
 */
const reviewSchema = Joi.object({
    projectCode: Joi.string().required().trim().messages({
        "string.empty": "Kode proyek tidak boleh kosong",
        "any.required": "Kode proyek wajib diisi",
    }),
    customerName: Joi.string().required().min(3).max(100).messages({
        "string.empty": "Nama tidak boleh kosong",
        "string.min": "Nama minimal 3 karakter",
        "string.max": "Nama maksimal 100 karakter",
        "any.required": "Nama wajib diisi",
    }),
    customerEmail: Joi.string().email().required().messages({
        "string.empty": "Email tidak boleh kosong",
        "string.email": "Format email tidak valid",
        "any.required": "Email wajib diisi",
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        "number.base": "Rating harus berupa angka",
        "number.integer": "Rating harus berupa bilangan bulat",
        "number.min": "Rating minimal 1",
        "number.max": "Rating maksimal 5",
        "any.required": "Rating wajib diisi",
    }),
    comment: Joi.string().optional().max(2000).messages({
        "string.max": "Komentar maksimal 2000 karakter",
    }),
    photos: Joi.array().items(Joi.string()).optional().messages({
        "array.base": "Foto harus berupa array",
    }),
});

/**
 * QA Validation Schemas
 */
const qaSchema = Joi.object({
    customerName: Joi.string().required().min(3).max(100).messages({
        "string.empty": "Nama tidak boleh kosong",
        "string.min": "Nama minimal 3 karakter",
        "string.max": "Nama maksimal 100 karakter",
        "any.required": "Nama wajib diisi",
    }),
    customerEmail: Joi.string().email().required().messages({
        "string.empty": "Email tidak boleh kosong",
        "string.email": "Format email tidak valid",
        "any.required": "Email wajib diisi",
    }),
    question: Joi.string().required().min(10).max(2000).messages({
        "string.empty": "Pertanyaan tidak boleh kosong",
        "string.min": "Pertanyaan minimal 10 karakter",
        "string.max": "Pertanyaan maksimal 2000 karakter",
        "any.required": "Pertanyaan wajib diisi",
    }),
});

const answerSchema = Joi.object({
    answer: Joi.string().required().min(10).max(5000).messages({
        "string.empty": "Jawaban tidak boleh kosong",
        "string.min": "Jawaban minimal 10 karakter",
        "string.max": "Jawaban maksimal 5000 karakter",
        "any.required": "Jawaban wajib diisi",
    }),
});

/**
 * Testimonial Validation Schema
 */
const testimonialSchema = Joi.object({
    name: Joi.string().required().min(3).max(100).messages({
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
    company: Joi.string().optional().max(100).messages({
        "string.max": "Nama perusahaan maksimal 100 karakter",
    }),
    position: Joi.string().optional().max(100).messages({
        "string.max": "Posisi maksimal 100 karakter",
    }),
    testimonialText: Joi.string().min(10).max(5000).messages({
        "string.empty": "Testimoni tidak boleh kosong",
        "string.min": "Testimoni minimal 10 karakter",
        "string.max": "Testimoni maksimal 5000 karakter",
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        "number.base": "Rating harus berupa angka",
        "number.integer": "Rating harus berupa bilangan bulat",
        "number.min": "Rating minimal 1",
        "number.max": "Rating maksimal 5",
        "any.required": "Rating wajib diisi",
    }),
    photos: Joi.array().items(Joi.string()).optional().messages({
        "array.base": "Foto harus berupa array",
    }),
}).required().messages({
    "any.required": "Body testimoni wajib diisi",
});

// Export only schemas - validation logic is handled by shared validate utility
module.exports = {
    reviewSchema,
    qaSchema,
    answerSchema,
    testimonialSchema,
};
