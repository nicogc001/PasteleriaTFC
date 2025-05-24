
const express = require('express');
const router = express.Router();
const { Productos } = require('../models');

// GET /api/tartas - Obtener todos los productos de categoría "tartas"
router.get('/', async (req, res) => {
  try {
    const tartas = await Productos.findAll({
      where: { categoria: 'tartas' }
    });
    res.json(tartas);
  } catch (error) {
    console.error('Error al obtener tartas:', error);
    res.status(500).json({ error: 'Error al obtener tartas' });
  }
});

module.exports = router;
