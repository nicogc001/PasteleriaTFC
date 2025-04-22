const authMiddleware = require('./authMiddleware');

const verificarTokenEmpleado = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.rol !== 'empleado') {
      return res.status(403).json({ error: 'Acceso denegado: solo para empleados' });
    }
    next();
  });
};

const verificarTokenCliente = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.rol !== 'cliente') {
      return res.status(403).json({ error: 'Acceso denegado: solo para clientes' });
    }
    next();
  });
};

module.exports = {
  verificarTokenEmpleado,
  verificarTokenCliente
};
