const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.status(403).json({ error: "Acceso denegado. Debes iniciar sesión." });
    }
    next();
};

module.exports = authMiddleware;
