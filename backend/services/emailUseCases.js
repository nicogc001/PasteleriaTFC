// backend/services/emailUseCases.js
const { orderStatusEmail, offerActivatedEmail, passwordResetEmail, reviewRequestEmail } = require('./templates');
const { sendAndLog } = require('./sendAndLog');

// ---- helpers ----
const euro = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(n || 0));

const SUBJECTS_ESTADO = {
  pendiente_pago: 'pendiente de pago',
  pendiente: 'pendiente',
  confirmado: 'confirmado',
  en_preparacion: 'en preparación',
  enviado: 'enviado',
  listo_para_recogida: 'listo para recogida',
  en_reparto: 'en reparto',
  entregado: 'entregado',
  cancelado: 'cancelado'
};

const appBaseUrl = process.env.APP_BASE_URL || 'https://pasteleriatfc.vercel.app';

// Normaliza items desde include (ProductosPedidos) o desde pedido.items
function mapItems(pedido) {
  const source = pedido?.ProductosPedidos || pedido?.items || [];
  return source.map((pp) => {
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
}

// =======================
// 1) Cambio de estado
// =======================
async function sendOrderStatusEmail({ user, pedido, prevEstado, nuevoEstado, comentario }) {
  const items = mapItems(pedido);
  const subjectEstado = SUBJECTS_ESTADO[nuevoEstado] || nuevoEstado;
  const pedidoCodigo = `#${pedido?.codigo || pedido?.id}`;

  const { html, text } = orderStatusEmail({
    nombre: user.nombre || user.email,
    pedidoCodigo,
    prevEstado,
    nuevoEstado: subjectEstado,
    comentario,
    fecha: new Date().toLocaleString('es-ES'),
    items,
    total: euro(pedido?.total ?? items.reduce((s, i) => s + Number(i.subtotalRaw || 0), 0)),
    tipoEntrega: pedido?.tipoEntrega,
    tienda: pedido?.tienda,
    fechaEntrega: pedido?.fechaEntrega
      ? new Date(pedido.fechaEntrega).toLocaleDateString('es-ES')
      : undefined,
    // Si incluyes dirección en el include, puedes pasarla aquí:
    // direccion: { linea1: ..., ciudad: ..., provincia: ..., cp: ... },
    ctaUrl: `${appBaseUrl}/cliente/pedidos/${pedido?.id}`
  });

  return sendAndLog({
    tipo: 'pedido_estado',
    entidadId: pedido.id,
    to: user.email,
    subject: `Tu pedido ${pedidoCodigo}: ${subjectEstado}`,
    html,
    text
  });
}

// =======================
// 2) Oferta activada
// =======================
async function sendOfferActivatedEmail({ user, oferta }) {
  const { html, text } = offerActivatedEmail({
    nombre: user.nombre || user.email,
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    validaHasta: oferta.finVigencia
      ? new Date(oferta.finVigencia).toLocaleDateString('es-ES')
      : 'pronto',
    ctaUrl: oferta.url || `${appBaseUrl}/ofertas`
  });

  return sendAndLog({
    tipo: 'oferta_activada',
    entidadId: oferta.id,
    to: user.email,
    subject: `Nueva oferta para ti: ${oferta.titulo}`,
    html,
    text
  });
}

// =======================
// 3) Restablecer contraseña
// =======================
async function sendPasswordResetEmail({ user, token }) {
  const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;
  const { html, text } = passwordResetEmail({
    nombre: user.nombre || user.email,
    resetUrl
  });

  return sendAndLog({
    tipo: 'password_reset',
    entidadId: user.id || 0,
    to: user.email,
    subject: 'Restablecer contraseña',
    html,
    text
  });
}

// =======================
// 4) Solicitud de reseña (job post-entrega)
// =======================
async function sendReviewRequestEmail({ user, pedido }) {
  const pedidoCodigo = `#${pedido?.codigo || pedido?.id}`;
  const reviewUrl = `${appBaseUrl}/cliente/pedidos/${pedido?.id}#reseña`;

  const { html, text } = reviewRequestEmail({
    nombre: user.nombre || user.email,
    pedidoCodigo,
    reviewUrl
  });

  return sendAndLog({
    tipo: 'review',
    entidadId: pedido.id,
    to: user.email,
    subject: `¿Qué te pareció tu pedido ${pedidoCodigo}?`,
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
