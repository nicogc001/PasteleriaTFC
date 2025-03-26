const express = require('express');
const router = express.Router();
const { Pedidos, Productos, Usuario } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/resumen
router.get('/resumen', async (req, res) => {
  try {
    // Total de pedidos
    const totalPedidos = await Pedidos.count();

    // Total de usuarios
    const totalUsuarios = await Usuario.count();

    // Total de productos
    const totalProductos = await Productos.count();

    // Facturación total del día (desde las 00:00)
    const facturacionHoy = await Pedidos.sum('total', {
      where: {
        fecha: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Productos con stock < 5
    const stockCritico = await Productos.count({
      where: {
        stock: {
          [Op.lt]: 5
        }
      }
    });

    res.json({
      totalPedidos,
      totalUsuarios,
      totalProductos,
      facturacionHoy: facturacionHoy || 0,
      stockCritico
    });

  } catch (error) {
    console.error('❌ Error en /admin/resumen:', error);
    res.status(500).json({ error: 'Error obteniendo resumen' });
  }
});

module.exports = router;
