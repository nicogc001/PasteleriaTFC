const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Ofertas = require('../models/Ofertas');
const Productos = require('../models/Productos');

router.get('/', async (req, res) => {
  const hoy = new Date();
  try {
    const ofertas = await Ofertas.findAll({
      where: {
        fechaInicio: { [Op.lte]: hoy },
        fechaFin: { [Op.gte]: hoy }
      },
      include: {
        model: Productos,
        required: true
      }
    });

    res.json(ofertas);
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
});

module.exports = router;
