const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { Pedidos } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/facturas - Listar facturas del cliente autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Solo facturas del cliente autenticado y confirmadas
    const pedidos = await Pedidos.findAll({
      where: {
        usuarioId: req.user.id,
        estado: 'confirmado'
      },
      order: [['fecha', 'DESC']]
    });

    const facturas = pedidos.map(p => {
      const archivo = `factura_${p.id}.pdf`;
      const rutaAbsoluta = path.join(__dirname, '..', 'facturas', archivo);
      const existe = fs.existsSync(rutaAbsoluta);

      return {
        id: p.id,
        fecha: p.fecha,
        total: p.total,
        archivo: existe ? `/facturas/${archivo}` : null
      };
    });

    res.json(facturas);
  } catch (err) {
    console.error('Error obteniendo facturas:', err);
    res.status(500).json({ error: 'Error al obtener las facturas' });
  }
});

module.exports = router;
