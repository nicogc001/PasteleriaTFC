// backend/services/pedidosNotifications.js
const { sendOrderStatusEmail } = require('../services/emailUseCases');

async function notifyPedidoEstado({ pedido, prevEstado, nuevoEstado, comentario }) {
  try {
    // Validar que haya email del cliente
    if (!pedido?.cliente?.email) {
      console.warn('⚠️ Pedido sin email de cliente, no se enviará notificación.');
      return;
    }

    // Enviar correo usando la plantilla de cambio de estado
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
  } catch (e) {
    console.error('❌ Error enviando email de pedido:', e.message);
  }
}

module.exports = { notifyPedidoEstado };
