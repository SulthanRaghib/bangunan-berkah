/**
 * Middleware untuk cek role user
 * Usage: router.get('/admin', authMiddleware, checkRole(['admin']), controller)
 */

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Pastikan user sudah diverifikasi oleh authMiddleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User tidak terautentikasi",
      });
    }

    // Cek apakah role user termasuk dalam allowedRoles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Anda tidak memiliki akses ke resource ini",
        requiredRole: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = checkRole;
