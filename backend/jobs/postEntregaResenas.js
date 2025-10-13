const cron = require('node-cron');
const { Pedidos, Usuario, ProductosPedidos, Productos } = require('../models');
const { sendReviewRequestEmail } = require('../services/emailUseCases');

/**
 * Ejecuta cada día a las 09:00 (hora del servidor) y envía recordatorio
 * a pedidos ENTREGADOS cuya fechaEntrega fue AYER y aún no notificados.
 */
async function procesarResenasPendientes() {
  try {
    // calcula AYER en formato YYYY-MM-DD
    const hoy = new Date();
    const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1);
    const yyyy = ayer.getFullYear();
    const mm = String(ayer.getMonth() + 1).padStart(2, '0');
    const dd = String(ayer.getDate()).padStart(2, '0');
    const fechaAyer = `${yyyy}-${mm}-${dd}`;

    const pedidos = await Pedidos.findAll({
      where: {
        estado: 'entregado',
        fechaEntrega: fechaAyer,
        resenaNotificada: false
      },
      include: [
        { model: Usuario, as: 'cliente', attributes: ['id','nombre','email'] },
        { model: ProductosPedidos, include: [Productos] }
      ],
      order: [['id', 'ASC']]
    });

    for (const pedido of pedidos) {
      try {
        if (!pedido?.cliente?.email) {
          console.warn(`Pedido ${pedido.id} sin email de cliente, se omite.`);
          continue;
        }
        await sendReviewRequestEmail({
          user: { email: pedido.cliente.email, nombre: pedido.cliente.nombre },
          pedido
        });
        // marca como notificado
        pedido.resenaNotificada = true;
        await pedido.save();
        console.log(`📧 Reseña enviada para pedido ${pedido.id} → ${pedido.cliente.email}`);
      } catch (e) {
        console.error(`Error enviando reseña pedido ${pedido?.id}:`, e.message);
      }
    }
  } catch (err) {
    console.error('Job postEntregaResenas error:', err.message);
  }
}

// Programa el job: todos los días a las 09:00
cron.schedule('0 9 * * *', procesarResenasPendientes, {
  timezone: process.env.CRON_TZ || 'Europe/Madrid'
});

// Exporta por si quieres invocarlo manualmente
module.exports = { procesarResenasPendientes };
