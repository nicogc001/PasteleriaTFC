const express = require('express');
const router = express.Router();

// Ruta de prueba para pedidos
router.get('/', (req, res) => {
    res.json({ message: 'Pedidos API funcionando' });
});

module.exports = router;
