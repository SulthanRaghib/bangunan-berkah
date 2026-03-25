const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: User not found",
                });
            }

            if (req.user.role !== requiredRole) {
                return res.status(403).json({
                    success: false,
                    message: `Forbidden: Requires ${requiredRole} role`,
                });
            }

            next();
        } catch (err) {
            res.status(500).json({
                success: false,
                message: "Error verifying role",
            });
        }
    };
};

module.exports = roleMiddleware;
