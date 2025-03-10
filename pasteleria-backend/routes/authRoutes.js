const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Verifica que esta ruta es correcta

// Asegúrate de que authController tiene las funciones definidas
if (!authController.register || !authController.login) {
  console.error("❌ Error: Las funciones register o login no están definidas en authController.");
}

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
