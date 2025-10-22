const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Anda tidak memiliki akses",
        requiredRole: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = checkRole;
