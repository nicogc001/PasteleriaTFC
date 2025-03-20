const jwt = require('jsonwebtoken');

env = process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], env); // ✅ Se usa SECRET_KEY de .env
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = authMiddleware;
