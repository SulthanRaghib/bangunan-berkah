/**
 * ============================================
 * SHARED CONSTANTS
 * ============================================
 * Menghilangkan magic strings dan hardcoded values
 * Satu sumber truth untuk semua services
 */

// ========== HTTP STATUS CODES ==========
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

// ========== USER ROLES ==========
const USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
    MANAGER: "manager",
    VIEWER: "viewer",
};

// ========== PROJECT TYPES ==========
const PROJECT_TYPE = {
    KONSTRUKSI: "konstruksi",
    FURNITURE: "furniture",
};

// ========== PROJECT STATUS ==========
const PROJECT_STATUS = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    ON_HOLD: "on_hold",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

// ========== MILESTONE STATUS ==========
const MILESTONE_STATUS = {
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
};

// ========== INVENTORY TYPES ==========
const INVENTORY_TYPE = {
    IN: "in",
    OUT: "out",
};

// ========== APPROVAL STATUS ==========
const APPROVAL_STATUS = {
    APPROVED: "approved",
    REJECTED: "rejected",
    PENDING: "pending",
};

// ========== QA STATUS ==========
const QA_STATUS = {
    OPEN: "open",
    ANSWERED: "answered",
    CLOSED: "closed",
};

// ========== PAGINATION ==========
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
};

// ========== VALIDATION LIMITS ==========
const VALIDATION_LIMITS = {
    NAME_MIN: 3,
    NAME_MAX: 255,
    EMAIL_MAX: 255,
    PASSWORD_MIN: 6,
    PASSWORD_MAX: 128,
    DESCRIPTION_MAX: 5000,
    PHONE_MIN_DIGITS: 10,
    PHONE_MAX_DIGITS: 15,
    SKU_MIN: 3,
    SKU_MAX: 100,
};

// ========== ERROR MESSAGES ==========
const ERROR_MESSAGES = {
    // Validation errors
    VALIDATION_FAILED: "Validasi data gagal",
    FIELD_REQUIRED: (field) => `${field} wajib diisi`,
    FIELD_INVALID: (field) => `${field} tidak valid`,
    FIELD_ALREADY_EXISTS: (field, value) =>
        `${field} '${value}' sudah terdaftar`,
    FIELD_NOT_FOUND: (field) => `${field} tidak ditemukan`,

    // Auth errors
    UNAUTHORIZED: "Unauthorized",
    INVALID_TOKEN: "Token tidak valid",
    TOKEN_EXPIRED: "Token expired: Silakan login kembali",
    INVALID_CREDENTIALS: "Email atau password salah",
    FORBIDDEN: "Anda tidak memiliki akses untuk mengakses resource ini",

    // Resource errors
    RESOURCE_NOT_FOUND: (resource) => `${resource} tidak ditemukan`,
    RESOURCE_ALREADY_EXISTS: (resource) => `${resource} sudah ada`,

    // Server errors
    INTERNAL_ERROR: "Terjadi kesalahan server",
    DATABASE_ERROR: "Terjadi kesalahan database",
    FILE_UPLOAD_ERROR: "Gagal upload file",
    FILE_DELETE_ERROR: "Gagal menghapus file",
};

// ========== SUCCESS MESSAGES ==========
const SUCCESS_MESSAGES = {
    CREATED: (resource) => `${resource} berhasil dibuat`,
    UPDATED: (resource) => `${resource} berhasil diperbarui`,
    DELETED: (resource) => `${resource} berhasil dihapus`,
    RETRIEVED: (resource) => `${resource} berhasil diambil`,
    SUBMITTED: (resource) => `${resource} berhasil dikirimkan`,
    APPROVED: (resource) => `${resource} berhasil disetujui`,
    REJECTED: (resource) => `${resource} berhasil ditolak`,
};

// ========== FILE UPLOADS ==========
const FILE_UPLOAD = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
    ALLOWED_DOCUMENT_TYPES: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    UPLOAD_TIMEOUT: 30000, // 30 seconds
};

// ========== REGEX PATTERNS ==========
const REGEX_PATTERNS = {
    PHONE: /^[0-9]{10,15}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    MONGODB_OBJECT_ID: /^[a-f\d]{24}$/i,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

module.exports = {
    HTTP_STATUS,
    USER_ROLES,
    PROJECT_TYPE,
    PROJECT_STATUS,
    MILESTONE_STATUS,
    INVENTORY_TYPE,
    APPROVAL_STATUS,
    QA_STATUS,
    PAGINATION,
    VALIDATION_LIMITS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    FILE_UPLOAD,
    REGEX_PATTERNS,
};
