/**
 * ============================================
 * VALIDATION WRAPPER UTILITY
 * ============================================
 * Wrap Joi validation dengan error handling yang konsisten
 * Menghilangkan duplikasi validasi logic
 */

/**
 * Validate request body dengan Joi schema
 * @param {Object} schema - Joi schema untuk validasi
 * @param {Object} data - Data yang akan divalidasi
 * @param {Object} options - Joi validation options (optional)
 * @throws {ValidationError} Jika validation gagal
 */
const validateData = (schema, data, options = { abortEarly: false }) => {
    const { error, value } = schema.validate(data, options);

    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
        }));

        const validationError = new Error("Validation failed");
        validationError.name = "ValidationError";
        validationError.statusCode = 400;
        validationError.details = errors;

        throw validationError;
    }

    return value;
};

/**
 * Middleware factory untuk validasi request body
 * @param {Object} schema - Joi schema
 * @param {string} source - 'body', 'query', atau 'params' (default: 'body')
 */
const validateRequest = (schema, source = "body") => {
    return (req, res, next) => {
        try {
            const data = req[source];
            const validatedData = validateData(schema, data);
            req[source] = validatedData; // Replace dengan validated data
            next();
        } catch (err) {
            const errors = err.details || [];
            return res.status(400).json({
                success: false,
                message: "Validasi data gagal",
                errors: errors.map((e) => e.message),
            });
        }
    };
};

/**
 * Utility untuk validate data dalam controller
 * Throw ValidationError yang bisa di-catch oleh error handler
 * @param {Object} schema - Joi schema
 * @param {Object} data - Data yang akan divalidasi
 */
const validate = (schema, data) => {
    return validateData(schema, data);
};

module.exports = {
    validateData,
    validateRequest,
    validate,
};
