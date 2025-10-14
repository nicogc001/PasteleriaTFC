// backend/routes/devRoutes.js
const express = require('express');
const router = express.Router();

const { Pedidos, Usuario, ProductosPedidos, Productos } = require('../models');
const { procesarResenasPendientes } = require('../jobs/postEntregaResenas');
const { sendEmail } = require('../lib/mailer');

// Seguridad mínima para dev via header
function checkToken(req, res, next) {
  if (req.headers['x-test-token'] !== process.env.TEST_EMAIL_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

/**
 * 0) Ping simple (comprobar montaje)
 * GET /api/dev/ping
 */
router.get('/ping', (req, res) => {
  res.json({ ok: true, msg: 'pong' });
});

/**
 * 1) Probar envío directo
 * POST /api/dev/test-email
 * Body: { "to": "destino@correo.com" }
 */
router.post('/test-email', checkToken, async (req, res) => {
  try {
    const to = req.body?.to || process.env.ADMIN_EMAIL;
    const info = await sendEmail({
      to,
      subject: 'Prueba Mailtrap desde backend ✅',
      text: 'Hola 👋 esto es una prueba',
      html: '<p>Hola 👋 esto es una <b>prueba</b></p>'
    });
    res.json({ ok: true, messageId: info?.messageId || null, to });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * 2) Semilla: marca un pedido como "entregado" AYER y resenaNotificada=false
 * GET /api/dev/seed-entregado?id=123
 */
router.get('/seed-entregado', checkToken, async (req, res) => {
  try {
    const id = Number(req.query.id);
    if (isNaN(id)) return res.status(400).json({ ok: false, error: 'id inválido' });

    const hoy = new Date();
    const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1);
    const yyyy = ayer.getFullYear();
    const mm = String(ayer.getMonth() + 1).padStart(2, '0');
    const dd = String(ayer.getDate()).padStart(2, '0');
    const fechaAyer = `${yyyy}-${mm}-${dd}`;

    const pedido = await Pedidos.findByPk(id, {
      include: [{ model: Usuario, as: 'cliente', attributes: ['id', 'nombre', 'email'] }]
    });
    if (!pedido) return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });

    pedido.estado = 'entregado';
    pedido.fechaEntrega = fechaAyer;     // clave: ayer
    pedido.resenaNotificada = false;     // para que entre en el job
    await pedido.save();

    res.json({
      ok: true,
      msg: `Pedido ${id} marcado como entregado en ${fechaAyer}`,
      emailCliente: pedido?.cliente?.email || null
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * 3) Ejecuta el job manualmente (en vez de esperar al cron)
 * POST /api/dev/run-review-job
 */
router.post('/run-review-job', checkToken, async (req, res) => {
  try {
    await procesarResenasPendientes();
    res.json({ ok: true, msg: 'Job ejecutado' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
