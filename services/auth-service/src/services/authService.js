/**
 * ============================================
 * AUTH SERVICE
 * ============================================
 * Business logic layer untuk Authentication
 * 
 * Responsibility:
 * - Register logic
 * - Login logic
 * - Token generation & validation
 * - Password hashing
 * 
 * Uses:
 * - UserRepository untuk database access
 * - Bcrypt untuk password hashing
 * - JWT untuk token generation
 */

const userRepository = require("../repositories/userRepository");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const {
    generateToken,
    generateRefreshToken,
    verifyRefreshToken,
    getTokenExpiration,
} = require("../utils/jwt");
const {
    storeRefreshToken,
    isRefreshTokenActive,
    isRefreshTokenRevoked,
    rotateRefreshToken,
} = require("../../../../shared/src/utils/token-blacklist.util");

class AuthService {
    /**
     * Register new user
     * @param {Object} registerData - { name, email, password, role }
     * @returns {Promise<Object>} { user, token, refreshToken }
     * @throws Error jika email sudah terdaftar atau error lainnya
     */
    async register(registerData) {
        try {
            const { name, email, password, role = "user" } = registerData;

            // Cek email sudah terdaftar
            const emailExists = await userRepository.emailExists(email);
            if (emailExists) {
                const error = new Error("Email sudah terdaftar");
                error.statusCode = 400;
                throw error;
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Create user in database
            const user = await userRepository.create({
                name,
                email,
                password: hashedPassword,
                role
            });

            // Generate tokens
            const tokenPayload = {
                id: user.id,
                email: user.email,
                role: user.role,
            };

            const token = generateToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);
            const refreshTokenExp = getTokenExpiration(refreshToken);

            await storeRefreshToken(refreshToken, refreshTokenExp);

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
                refreshToken,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Login user
     * @param {Object} loginData - { email, password }
     * @returns {Promise<Object>} { user, token, refreshToken }
     * @throws Error jika email/password salah atau error lainnya
     */
    async login(loginData) {
        try {
            const { email, password } = loginData;

            // Find user by email
            const user = await userRepository.findByEmail(email);
            if (!user) {
                const error = new Error("Email atau password salah");
                error.statusCode = 401;
                throw error;
            }

            // Verify password
            const isValidPassword = await comparePassword(password, user.password);
            if (!isValidPassword) {
                const error = new Error("Email atau password salah");
                error.statusCode = 401;
                throw error;
            }

            // Generate tokens
            const userId = user._id.$oid || user._id;
            const tokenPayload = {
                id: userId,
                email: user.email,
                role: user.role,
            };

            const token = generateToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);
            const refreshTokenExp = getTokenExpiration(refreshToken);

            await storeRefreshToken(refreshToken, refreshTokenExp);

            return {
                user: {
                    id: userId,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
                refreshToken,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Refresh access token using refresh token
     * @param {string} refreshToken - Refresh token dari user
     * @returns {Promise<Object>} { token }
     * @throws Error jika token invalid atau expired
     */
    async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = verifyRefreshToken(refreshToken);

            if (!decoded) {
                const error = new Error("Refresh token tidak valid");
                error.statusCode = 401;
                throw error;
            }

            const [isActive, isRevoked] = await Promise.all([
                isRefreshTokenActive(refreshToken),
                isRefreshTokenRevoked(refreshToken),
            ]);

            if (!isActive || isRevoked) {
                const error = new Error("Refresh token sudah tidak berlaku");
                error.statusCode = 401;
                throw error;
            }

            // Get user data
            const user = await userRepository.findById(decoded.id);
            if (!user) {
                const error = new Error("User tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Generate new access token
            const tokenPayload = {
                id: decoded.id,
                email: user.email,
                role: user.role,
            };

            const newToken = generateToken(tokenPayload);
            const newRefreshToken = generateRefreshToken(tokenPayload);
            const newRefreshTokenExp = getTokenExpiration(newRefreshToken);

            await rotateRefreshToken(
                refreshToken,
                decoded.exp,
                newRefreshToken,
                newRefreshTokenExp
            );

            return {
                token: newToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify token validity (untuk internal use)
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Decoded token payload
     * @throws Error jika token invalid
     */
    async verifyToken(token) {
        try {
            const { verifyToken } = require("../utils/jwt");
            return verifyToken(token);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthService();
