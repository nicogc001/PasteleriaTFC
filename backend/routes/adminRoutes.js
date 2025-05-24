const express = require('express');
const router = express.Router();
const { Pedidos, Productos, Usuario } = require('../models');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/admin/resumen
router.get('/resumen', async (req, res) => {
  try {
    const totalPedidos = await Pedidos.count();
    const totalUsuarios = await Usuario.count();
    const totalProductos = await Productos.count();

    const facturacionHoy = await Pedidos.sum('total', {
      where: {
        fecha: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

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
    console.error('Error en /admin/resumen:', error);
    res.status(500).json({ error: 'Error obteniendo resumen' });
  }
});

// GET /api/admin/usuarios → Solo admins
router.get('/usuarios', authMiddleware, async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol']
    });

    res.json(usuarios);
  } catch (err) {
    console.error('Error en /admin/usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;
