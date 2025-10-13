// backend/services/emailUseCases.js
const { sendEmail } = require('../lib/mailer'); // usa el nombre real exportado por mailer.js
const { orderStatusEmail, offerActivatedEmail, passwordResetEmail, reviewRequestEmail } = require('./templates');

const euro = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(n || 0));

/**
 * Email: cambio de estado de pedido
 */
async function sendOrderStatusEmail({ user, pedido, prevEstado, nuevoEstado, comentario }) {
  // Normaliza items desde include (ProductosPedidos) o pedido.items
  const items = (pedido.ProductosPedidos || pedido.items || []).map((pp) => {
    const precio = Number(pp?.Producto?.precio ?? pp?.precio ?? 0);
    const cantidad = Number(pp?.cantidad ?? 0);
    const subtotal = precio * cantidad;
    return {
      nombre: pp?.Producto?.nombre || pp?.nombre || 'Producto',
      cantidad,
      precio: euro(precio),
      subtotal: euro(subtotal),
      subtotalRaw: subtotal
    };
  });

  const { html, text } = orderStatusEmail({
    nombre: user.nombre || user.email,
    pedidoCodigo: `#${pedido.codigo || pedido.id}`,
    prevEstado,
    nuevoEstado,
    comentario,
    fecha: new Date().toLocaleString('es-ES'),
    items,
    total: euro(pedido.total ?? items.reduce((s, i) => s + Number(i.subtotalRaw || 0), 0)),
    tipoEntrega: pedido.tipoEntrega,
    tienda: pedido.tienda,
    fechaEntrega: pedido.fechaEntrega
      ? new Date(pedido.fechaEntrega).toLocaleDateString('es-ES')
      : undefined,
    // direccion: si en el futuro la incluyes en el include, pásala aquí
    ctaUrl: `${process.env.APP_BASE_URL || 'https://pasteleriatfc.vercel.app'}/cliente/pedidos/${pedido.id}`
  });

  return sendEmail({
    to: user.email,
    subject: `Tu pedido ${pedido.codigo ? '#' + pedido.codigo : '#' + pedido.id}: ${nuevoEstado}`,
    html,
    text
  });
}

/**
 * Email: oferta activada (opcional)
 */
async function sendOfferActivatedEmail({ user, oferta }) {
  const { html, text } = offerActivatedEmail({
    nombre: user.nombre || user.email,
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    validaHasta: oferta.finVigencia
      ? new Date(oferta.finVigencia).toLocaleDateString('es-ES')
      : 'pronto',
    ctaUrl: oferta.url || `${process.env.APP_BASE_URL || ''}/ofertas`
  });

  return sendEmail({
    to: user.email,
    subject: `Nueva oferta para ti: ${oferta.titulo}`,
    html,
    text
  });
}

/**
 * Email: restablecer contraseña (opcional)
 */
async function sendPasswordResetEmail({ user, token }) {
  const resetUrl = `${process.env.APP_BASE_URL || 'https://pasteleriatfc.vercel.app'}/reset-password?token=${token}`;
  const { html, text } = passwordResetEmail({
    nombre: user.nombre || user.email,
    resetUrl
  });

  return sendEmail({
    to: user.email,
    subject: 'Restablecer contraseña',
    html,
    text
  });
}

/**
 * Email: solicitar reseña post-entrega (job)
 */
async function sendReviewRequestEmail({ user, pedido }) {
  const reviewUrl = `${process.env.APP_BASE_URL || 'https://pasteleriatfc.vercel.app'}/cliente/pedidos/${pedido.id}#reseña`;
  const { html, text } = reviewRequestEmail({
    nombre: user.nombre || user.email,
    pedidoCodigo: `#${pedido.codigo || pedido.id}`,
    reviewUrl
  });

  return sendEmail({
    to: user.email,
    subject: `¿Qué te pareció tu pedido ${pedido.codigo ? '#' + pedido.codigo : '#' + pedido.id}?`,
    html,
    text
  });
}

module.exports = {
  sendOrderStatusEmail,
  sendOfferActivatedEmail,
  sendPasswordResetEmail,
  sendReviewRequestEmail
};
