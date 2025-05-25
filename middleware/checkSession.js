const checkSession = (req, res, next) => {
    if (req.session.user && req.session.user) {
        next();
    } else {
        res.redirect("/auth/login");
    }
};

module.exports = checkSession;