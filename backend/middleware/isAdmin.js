module.exports = (req, res, next) => {
    if (req.user?.rol === 'admin' || req.user?.rol === 'administrador') {
      return next();
    }
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
  };
  