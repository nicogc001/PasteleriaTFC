const express = require('express');
const router = express.Router();

// Ruta de prueba para autenticación
router.get('/', (req, res) => {
    res.json({ message: 'Auth API funcionando' });
});

module.exports = router;
