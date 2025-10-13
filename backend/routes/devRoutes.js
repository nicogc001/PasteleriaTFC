// backend/routes/devRoutes.js
const express = require('express');
const router = express.Router();
const { Pedidos, Usuario, ProductosPedidos, Productos } = require('../models');
const { procesarResenasPendientes } = require('../jobs/postEntregaResenas');

// Seguridad mínima para dev
function checkToken(req, res, next) {
  if (req.headers['x-test-token'] !== process.env.TEST_EMAIL_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

/**
 * 1) Semilla: marca un pedido como "entregado" AYER y resenaNotificada=false
 * GET /api/dev/seed-entregado?id=123
 */
router.get('/api/dev/seed-entregado', checkToken, async (req, res) => {
  try {
    const id = Number(req.query.id);
    if (isNaN(id)) return res.status(400).json({ ok: false, error: 'id inválido' });

    const hoy = new Date();
    const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1);
    const yyyy = ayer.getFullYear();
    const mm = String(ayer.getMonth() + 1).padStart(2, '0');
    const dd = String(ayer.getDate()).padStart(2, '0');
    const fechaAyer = `${yyyy}-${mm}-${dd}`;

    const pedido = await Pedidos.findByPk(id, { include: [{ model: Usuario, as: 'cliente' }] });
    if (!pedido) return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });

    pedido.estado = 'entregado';
    pedido.fechaEntrega = fechaAyer;     // clave: ayer
    pedido.resenaNotificada = false;     // para que entre en el job
    await pedido.save();

    res.json({ ok: true, msg: `Pedido ${id} marcado entregado en ${fechaAyer}`, emailCliente: pedido?.cliente?.email });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * 2) Ejecuta el job manualmente (en vez de esperar al cron)
 * POST /api/dev/run-review-job
 */
router.post('/api/dev/run-review-job', checkToken, async (req, res) => {
  try {
    await procesarResenasPendientes();
    res.json({ ok: true, msg: 'Job ejecutado' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
