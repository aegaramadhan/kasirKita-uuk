const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // Check if session and user exist
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        const userRole = req.session.user.role;
        
        // Check if user role is in allowed roles
        if (Array.isArray(allowedRoles)) {
            if (allowedRoles.includes(userRole)) {
                return next();
            }
        } else if (userRole === allowedRoles) {
            return next();
        }

        // If role doesn't match, redirect to login
        return res.redirect('/auth/login');
    };
};

module.exports = checkRole;