/**
 * ============================================
 * VALIDATION WRAPPER UTILITY
 * ============================================
 * Wrap Joi validation dengan error handling yang konsisten
 * Menghilangkan duplikasi validasi logic
 */

const ENGLISH_VALIDATION_PATTERN =
    /(is not allowed|is required|must be|fails to match|length must be|not allowed|required)/i;

const cleanMessage = (message = "") => String(message).replace(/^"|"$/g, "").trim();

const fieldLabel = (detail) => {
    if (!detail) return "field";
    const fromPath = Array.isArray(detail.path) ? detail.path.join(".") : "";
    return fromPath || detail.context?.label || "field";
};

const translateJoiDetail = (detail) => {
    const field = fieldLabel(detail);
    const type = detail?.type;
    const limit = detail?.context?.limit;
    const valids = detail?.context?.valids;

    switch (type) {
        case "any.required":
            return `Field \"${field}\" wajib diisi`;
        case "object.unknown":
            return `Field \"${field}\" tidak diperbolehkan`;
        case "string.empty":
            return `Field \"${field}\" tidak boleh kosong`;
        case "string.min":
            return `Field \"${field}\" minimal ${limit} karakter`;
        case "string.max":
            return `Field \"${field}\" maksimal ${limit} karakter`;
        case "string.email":
            return `Format email pada field \"${field}\" tidak valid`;
        case "string.pattern.base":
            return `Format field \"${field}\" tidak valid`;
        case "number.base":
            return `Field \"${field}\" harus berupa angka`;
        case "number.integer":
            return `Field \"${field}\" harus berupa bilangan bulat`;
        case "number.min":
            return `Nilai field \"${field}\" minimal ${limit}`;
        case "number.max":
            return `Nilai field \"${field}\" maksimal ${limit}`;
        case "number.positive":
            return `Field \"${field}\" harus lebih dari 0`;
        case "boolean.base":
            return `Field \"${field}\" harus bernilai true/false`;
        case "date.base":
            return `Field \"${field}\" harus berupa tanggal yang valid`;
        case "date.greater":
            return `Field \"${field}\" harus lebih besar dari ${detail?.context?.limit?.key || "nilai acuan"}`;
        case "array.base":
            return `Field \"${field}\" harus berupa array`;
        case "object.min":
            return `Minimal ${limit} field harus diisi`;
        case "any.only": {
            const readableValids = Array.isArray(valids)
                ? valids.filter((v) => v !== "").map((v) => `\"${v}\"`).join(", ")
                : "nilai yang diizinkan";
            return `Field \"${field}\" harus salah satu dari: ${readableValids}`;
        }
        default:
            return cleanMessage(detail?.message || "Validasi data gagal");
    }
};

const localizeValidationMessage = (detail) => {
    const original = cleanMessage(detail?.message || "");

    if (!original) {
        return translateJoiDetail(detail);
    }

    if (!ENGLISH_VALIDATION_PATTERN.test(original)) {
        return original;
    }

    return translateJoiDetail(detail);
};

/**
 * Validate request body dengan Joi schema
 * @param {Object} schema - Joi schema untuk validasi
 * @param {Object} data - Data yang akan divalidasi
 * @param {Object} options - Joi validation options (optional)
 * @throws {ValidationError} Jika validation gagal
 */
const validateData = (schema, data, options = {}) => {
    const validateOptions = {
        abortEarly: false,
        errors: {
            wrap: {
                label: "",
            },
        },
        ...options,
    };

    const { error, value } = schema.validate(data, validateOptions);

    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: localizeValidationMessage(detail),
        }));

        const validationError = new Error("Validasi data gagal");
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
    localizeValidationMessage,
};
