const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // ✅ Asegúrate de que esta ruta es correcta

// ✅ Verifica que los métodos existen en `authController.js`
if (!authController.register || !authController.login) {
    console.error("❌ Error: Las funciones register o login no están definidas en authController.");
}

// 📌 **Rutas de autenticación**
router.post('/register', authController.register);
router.post('/login', authController.login);

// 📌 **Revisar si estás usando un método incorrecto**
// Si tienes algo como esto y `authController.algunMetodo` no existe, coméntalo o corrígelo:
router.get('/perfil', authController.getUserProfile); // ✅ Asegúrate de que `getUserProfile` está en `authController.js`

module.exports = router;
