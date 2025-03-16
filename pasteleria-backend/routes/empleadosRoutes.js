const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware de autenticación con JWT
router.use(authController.verifyToken);

// 📌 Ruta para registrar el horario del empleado
router.post('/registroHorario', authController.registrarHorario);

// 📌 Ruta para obtener los horarios registrados por el empleado
router.get('/horarios', authController.obtenerHorarios);

module.exports = router;
