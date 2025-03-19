const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // ✅ Verifica esta ruta

// ✅ Middleware de autenticación con JWT
router.use(authController.verifyToken);

// ✅ Definir la ruta POST para registrar horario
router.post('/registro-horario', authController.registrarHorario);

// ✅ Definir la ruta GET para obtener los horarios registrados
router.get('/horarios', authController.obtenerHorarios);

module.exports = router;
