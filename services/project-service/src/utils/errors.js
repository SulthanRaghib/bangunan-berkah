/**
 * Custom Error Classes for Project Service
 * Provides structured error handling with consistent HTTP status codes
 */

class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.timestamp = new Date();
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
        };
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400);
        this.details = details;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            ...(this.details && { details: this.details }),
        };
    }
}

class NotFoundError extends AppError {
    constructor(resource = "Resource") {
        super(`${resource} tidak ditemukan`, 404);
        this.resource = resource;
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = "Tidak terautentikasi") {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = "Akses ditolak") {
        super(message, 403);
    }
}

class DuplicateError extends AppError {
    constructor(field) {
        super(`${field} sudah terdaftar`, 409);
        this.field = field;
    }
}

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    ConflictError,
    UnauthorizedError,
    ForbiddenError,
    DuplicateError,
};
