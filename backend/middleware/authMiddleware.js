const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  console.log('🔐 Authorization header:', authHeader);

  if (!authHeader) {
    console.warn('❌ Token no proporcionado');
    return res.status(403).json({ error: 'Acceso denegado, token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    console.log('✅ Token válido:', decoded);

    req.user = {
      id: decoded.id,
      rol: decoded.rol
    };

    next();
  } catch (error) {
    console.error('❌ Token inválido o expirado:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
