const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Tidak terautentikasi",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak: Anda tidak memiliki hak akses",
                requiredRole: allowedRoles,
                yourRole: req.user.role,
            });
        }

        next();
    };
};

module.exports = checkRole;
