const express = require('express');
const router = express.Router();

// Ruta de prueba para productos
router.get('/', (req, res) => {
    res.json({ message: 'Productos API funcionando' });
});

module.exports = router;

