// backend/services/pedidosNotifications.js
const { sendOrderStatusEmail } = require('./emailUseCases');

async function notifyPedidoEstado({ pedido, prevEstado, nuevoEstado, comentario }) {
  try {
    if (!pedido?.cliente?.email) {
      console.warn('⚠️ Pedido sin email de cliente, no se enviará notificación.');
      return false;
    }

    await sendOrderStatusEmail({
      user: {
        email: pedido.cliente.email,
        nombre: pedido.cliente.nombre || pedido.cliente.email
      },
      pedido,
      prevEstado,
      nuevoEstado,
      comentario
    });

    console.log(`📧 Email de cambio de estado enviado a ${pedido.cliente.email}`);
    return true;
  } catch (e) {
    console.error('❌ Error enviando email de pedido:', e.message);
    return false;
  }
}

module.exports = { notifyPedidoEstado };
