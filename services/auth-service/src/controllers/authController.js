const prisma = require("../config/prisma");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateToken, generateRefreshToken } = require("../utils/jwt");
const { validateRegister, validateLogin } = require("../utils/validation");

// ========================================
// REGISTER
// ========================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi input
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // Cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      },
    });

    // Generate tokens
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = generateRefreshToken({
      id: newUser.id,
    });

    // Response
    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      token,
      refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// LOGIN
// ========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // Cek user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Verify password
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    // Response
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// LOGOUT
// ========================================
exports.logout = async (req, res) => {
  try {
    // Untuk stateless JWT, logout dilakukan di client side (hapus token)
    // Jika pakai Redis/database untuk blacklist token, tambahkan di sini

    res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// REFRESH TOKEN
// ========================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token tidak tersedia",
      });
    }

    // Verify refresh token
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Generate new tokens
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: user.id,
    });

    res.status(200).json({
      success: true,
      message: "Token berhasil diperbarui",
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({
      success: false,
      message: "Refresh token tidak valid atau expired",
    });
  }
};

// ========================================
// GET PROFILE (dari token)
// ========================================
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile berhasil diambil",
      user,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
