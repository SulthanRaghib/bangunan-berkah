const prisma = require("../config/prisma");
const { ObjectId } = require("mongodb");
const { hashPassword } = require("../utils/bcrypt");
const { validateUpdateUser } = require("../utils/validation");

// ========================================
// GET ALL USERS (Admin only)
// ========================================
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      filter.role = role;
    }

    // Get users with pagination using aggregation
    const usersResult = await prisma.$runCommandRaw({
      aggregate: "users",
      pipeline: [
        { $match: filter },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            createdAt: 1,
            updatedAt: 1,
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) }
      ],
      cursor: {}
    });

    // Get total count
    const countResult = await prisma.$runCommandRaw({
      aggregate: "users",
      pipeline: [
        { $match: filter },
        { $count: "total" }
      ],
      cursor: {}
    });

    const users = usersResult.cursor.firstBatch.map(user => ({
      id: user._id.$oid || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt?.$date ? new Date(user.createdAt.$date) : new Date(user.createdAt),
      updatedAt: user.updatedAt?.$date ? new Date(user.updatedAt.$date) : new Date(user.updatedAt),
    }));

    const total = countResult.cursor.firstBatch[0]?.total || 0;

    res.status(200).json({
      success: true,
      message: "Users berhasil diambil",
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// GET USER BY ID
// ========================================
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Use aggregate with $toString to match _id as string
    const userResult = await prisma.$runCommandRaw({
      aggregate: "users",
      pipeline: [
        {
          $addFields: {
            idString: { $toString: "$_id" }
          }
        },
        { $match: { idString: id } },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            createdAt: 1,
            updatedAt: 1,
          }
        },
        { $limit: 1 }
      ],
      cursor: {}
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
      message: "User berhasil diambil",
      user: {
        id: user._id.$oid || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt?.$date ? new Date(user.createdAt.$date) : new Date(user.createdAt),
        updatedAt: user.updatedAt?.$date ? new Date(user.updatedAt.$date) : new Date(user.updatedAt),
      },
    });
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// UPDATE USER
// ========================================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Validasi input
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Cek user exists using $toString for ID matching
    const userResult = await prisma.$runCommandRaw({
      aggregate: "users",
      pipeline: [
        {
          $addFields: {
            idString: { $toString: "$_id" }
          }
        },
        { $match: { idString: id } },
        { $limit: 1 }
      ],
      cursor: {}
    });

    if (userResult.cursor.firstBatch.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = userResult.cursor.firstBatch[0];

    // Check authorization (user hanya bisa update dirinya sendiri, kecuali admin)
    let tokenUserId = req.user.id;
    if (typeof tokenUserId === 'object' && tokenUserId.$oid) {
      tokenUserId = tokenUserId.$oid;
    }

    if (req.user.role !== "admin" && tokenUserId !== id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengubah user ini",
      });
    }

    // Check jika email sudah digunakan user lain
    if (email && email !== user.email) {
      const existingUserResult = await prisma.$runCommandRaw({
        find: "users",
        filter: { email },
        limit: 1,
      });
      if (existingUserResult.cursor.firstBatch.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan",
        });
      }
    }

    // Prepare update data
    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);

    // Only admin can change role
    if (role) {
      if (req.user.role === "admin") {
        updateData.role = role;
      } else {
        return res.status(400).json({
          success: false,
          message: "Anda tidak memiliki akses untuk mengubah role",
        });
      }
    }

    // Get the actual _id ObjectId from the found user
    const actualUserId = user._id;

    // Update user
    await prisma.$runCommandRaw({
      update: "users",
      updates: [{
        q: { _id: actualUserId },
        u: { $set: updateData }
      }]
    });

    // Get updated user
    const updatedUserResult = await prisma.$runCommandRaw({
      aggregate: "users",
      pipeline: [
        {
          $addFields: {
            idString: { $toString: "$_id" }
          }
        },
        { $match: { idString: id } },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            createdAt: 1,
            updatedAt: 1,
          }
        },
        { $limit: 1 }
      ],
      cursor: {}
    });

    if (updatedUserResult.cursor.firstBatch.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan setelah update",
      });
    }

    const updatedUser = updatedUserResult.cursor.firstBatch[0];

    res.status(200).json({
      success: true,
      message: "User berhasil diperbarui",
      user: {
        id: updatedUser._id.$oid || updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt?.$date ? new Date(updatedUser.updatedAt.$date) : new Date(updatedUser.updatedAt),
      },
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// ========================================
// DELETE USER (Admin only)
// ========================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek user exists using $toString for ID matching
    const userResult = await prisma.$runCommandRaw({
      aggregate: "users",
      pipeline: [
        {
          $addFields: {
            idString: { $toString: "$_id" }
          }
        },
        { $match: { idString: id } },
        { $limit: 1 }
      ],
      cursor: {}
    });

    if (userResult.cursor.firstBatch.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Prevent deleting yourself
    let tokenUserId = req.user.id;
    if (typeof tokenUserId === 'object' && tokenUserId.$oid) {
      tokenUserId = tokenUserId.$oid;
    }

    if (tokenUserId === id) {
      return res.status(400).json({
        success: false,
        message: "Anda tidak dapat menghapus akun sendiri",
      });
    }

    // Get the actual _id ObjectId from the found user
    const user = userResult.cursor.firstBatch[0];
    const actualUserId = user._id;

    // Delete user
    await prisma.$runCommandRaw({
      delete: "users",
      deletes: [{
        q: { _id: actualUserId },
        limit: 1
      }]
    });

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
