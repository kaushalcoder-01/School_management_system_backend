const config = require('../config/config');


exports.isAdmin = (req, res, next) => {

    if (req.user.role === config.ADMIN_ROLE) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: "Only Admin can access"
    });
};

exports.isTeacherOrAdmin = (req, res, next) => {

    if (
        req.user.role === config.ADMIN_ROLE ||
        req.user.role === config.TEACHER_ROLE
    ) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: "Unauthorized"
    });
};