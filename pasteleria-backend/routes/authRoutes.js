const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Verifica que la ruta sea correcta

// Middleware de autenticación con JWT
router.use(authController.verifyToken);

// 📌 **Ruta para obtener datos del Dashboard del Empleado**
router.get('/empleado/dashboard', authController.obtenerDashboardEmpleado);

// 📌 **Ruta para obtener estadísticas del Empleado**
router.get('/empleado/estadisticas', authController.obtenerEstadisticasEmpleado);

// 📌 **Ruta para registrar el horario del empleado**
router.post('/empleado/registroHorario', authController.registrarHorario);

// 📌 **Ruta para obtener los horarios registrados por el empleado**
router.get('/empleado/horarios', authController.obtenerHorarios);

module.exports = router;
