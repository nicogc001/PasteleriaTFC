// backend/services/emailUseCases.js
const { sendMail } = require('../lib/mailer'); // o sendEmail, según tu export
const { orderStatusEmail, offerActivatedEmail, passwordResetEmail } = require('./templates');

const euro = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0);

async function sendOrderStatusEmail({ user, pedido, prevEstado, nuevoEstado, comentario }) {
  const items = (pedido.ProductosPedidos || pedido.items || []).map(pp => {
    const precio = Number(pp.Producto?.precio || pp.precio || 0);
    const cantidad = Number(pp.cantidad || 0);
    const subtotal = precio * cantidad;
    return {
      nombre: pp.Producto?.nombre || pp.nombre || 'Producto',
      cantidad,
      precio: euro(precio),
      subtotal: euro(subtotal)
    };
  });

  const total = euro(Number(pedido.total || items.reduce((s, i) => s + (Number(i.subtotalRaw) || 0), 0)));

  const { html, text } = orderStatusEmail({
    nombre: user.nombre || user.email,
    pedidoCodigo: `#${pedido.codigo || pedido.id}`,
    prevEstado,
    nuevoEstado,
    comentario,
    fecha: new Date().toLocaleString('es-ES'),
    items,
    total: euro(Number(pedido.total || 0)),
    tipoEntrega: pedido.tipoEntrega,
    tienda: pedido.tienda,
    fechaEntrega: pedido.fechaEntrega ? new Date(pedido.fechaEntrega).toLocaleDateString('es-ES') : undefined,
    direccion: pedido.direccion || undefined, // si la añades en el include
    ctaUrl: `${process.env.APP_BASE_URL || 'https://pasteleriatfc.vercel.app'}/cliente/pedidos/${pedido.id}`
  });

  return sendMail({
    to: user.email,
    subject: `Tu pedido ${pedido.codigo ? '#' + pedido.codigo : '#' + pedido.id}: ${nuevoEstado}`,
    html, text
  });
}

module.exports = {
  sendOrderStatusEmail,
  // y si usas las demás:
  // sendOfferActivatedEmail: (...) => { const { html, text } = offerActivatedEmail(...); return sendMail({ ... }); },
  // sendPasswordResetEmail: (...) => { const { html, text } = passwordResetEmail(...); return sendMail({ ... }); },
};

const { sendMail } = require('../lib/mailer'); // o sendEmail si así lo exportas
const { reviewRequestEmail } = require('./templates');

async function sendReviewRequestEmail({ user, pedido }) {
  const reviewUrl = `${process.env.APP_BASE_URL || 'https://pasteleriatfc.vercel.app'}/cliente/pedidos/${pedido.id}#reseña`;
  const { html, text } = reviewRequestEmail({
    nombre: user.nombre || user.email,
    pedidoCodigo: `#${pedido.codigo || pedido.id}`,
    reviewUrl
  });

  return sendMail({
    to: user.email,
    subject: `¿Qué te pareció tu pedido ${pedido.codigo ? '#' + pedido.codigo : '#' + pedido.id}?`,
    html,
    text
  });
}

module.exports = {
  sendOrderStatusEmail,
  // ...otras funciones que ya tengas
  sendReviewRequestEmail // 👈 exporta esto
};

