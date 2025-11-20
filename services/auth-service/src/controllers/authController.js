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
    const existingUserResult = await prisma.$runCommandRaw({
      find: "users",
      filter: { email },
      limit: 1
    });

    if (existingUserResult.cursor.firstBatch.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.$runCommandRaw({
      insert: "users",
      documents: [{
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        createdAt: new Date(),
        updatedAt: new Date()
      }]
    });

    // Get the inserted user ID
    const insertedId = newUser.insertedIds[0];

    // Generate tokens
    const userId = insertedId.$oid || insertedId;
    const token = generateToken({
      id: userId,
      email: email,
      role: role || "user",
    });

    const refreshToken = generateRefreshToken({
      id: userId,
    });

    // Response
    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      token,
      refreshToken,
      user: {
        id: userId,
        name: name,
        email: email,
        role: role || "user",
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
    const userResult = await prisma.$runCommandRaw({
      find: "users",
      filter: { email },
      limit: 1,
      projection: { _id: 1, name: 1, email: 1, role: 1, password: 1, createdAt: 1, updatedAt: 1 }
    });

    const user = userResult.cursor.firstBatch[0];
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
    const userId = user._id.$oid || user._id;
    const token = generateToken({
      id: userId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: userId,
    });

    // Response
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      refreshToken,
      user: {
        id: userId,
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

    // Handle both string IDs and ObjectId format from JWT
    let refreshUserId = decoded.id;
    if (typeof refreshUserId === 'object' && refreshUserId.$oid) {
      refreshUserId = refreshUserId.$oid;
    }

    // Get user
    const userResult = await prisma.$runCommandRaw({
      find: "users",
      filter: { _id: refreshUserId },
      limit: 1
    });

    if (userResult.cursor.firstBatch.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = userResult.cursor.firstBatch[0];

    // Generate new tokens
    const refreshTokenUserId = user._id.$oid || user._id;
    const newToken = generateToken({
      id: refreshTokenUserId,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: refreshTokenUserId,
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
    // Handle both string IDs and ObjectId format from JWT
    let profileUserId = req.user.id;
    if (typeof profileUserId === 'object' && profileUserId.$oid) {
      profileUserId = profileUserId.$oid;
    }

    const userResult = await prisma.$runCommandRaw({
      find: "users",
      filter: { _id: profileUserId },
      limit: 1,
      projection: {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    });

    if (userResult.cursor.firstBatch.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = userResult.cursor.firstBatch[0];

    res.status(200).json({
      success: true,
      message: "Profile berhasil diambil",
      user: {
        id: user._id.$oid || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
