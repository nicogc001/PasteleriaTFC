// backend/services/templates.js
const Handlebars = require('handlebars');

// ===== Helpers útiles =====
Handlebars.registerHelper('ifEq', function (a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this);
});

// ===== Utilidad de render =====
function render(template, data) {
  const compiled = Handlebars.compile(template);
  return compiled(data);
}

/**
 * Email: Cambio de estado de pedido con desglose
 */
function orderStatusEmail(data) {
  const html = `
  <div style="background:#f8fafc;padding:24px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06)">
      <!-- Header -->
      <div style="padding:20px 24px;border-bottom:1px solid #eef2f7;display:flex;align-items:center;gap:12px">
        <img src="https://res.cloudinary.com/dmn3wuy2r/image/upload/v1720000000/logo_caballo_goloso.png" alt="El Caballo Goloso" width="40" height="40" style="display:block;border-radius:8px;object-fit:cover" onerror="this.style.display='none'"/>
        <div>
          <div style="font-size:16px;color:#0f172a;font-weight:700">Actualización de tu pedido {{pedidoCodigo}}</div>
          <div style="font-size:13px;color:#64748b">{{fecha}}</div>
        </div>
      </div>

      <!-- Saludo y estado -->
      <div style="padding:24px 24px 8px">
        <p style="margin:0 0 8px;color:#0f172a;font-size:16px">Hola {{nombre}},</p>
        <p style="margin:0;color:#0f172a;font-size:15px;line-height:1.5">
          Tu pedido ha cambiado de estado: 
          <span style="font-weight:600">{{prevEstado}}</span> → 
          <span style="font-weight:700">{{nuevoEstado}}</span>.
        </p>
        {{#if comentario}}
          <p style="margin:12px 0 0;color:#334155;font-size:14px;line-height:1.5">
            Nota: {{comentario}}
          </p>
        {{/if}}
      </div>

      <!-- Datos logísticos -->
      <div style="padding:8px 24px 0">
        <div style="display:flex;flex-wrap:wrap;gap:12px">
          {{#if tipoEntrega}}
          <div style="flex:1 1 220px;background:#f1f5f9;border-radius:10px;padding:12px">
            <div style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.04em">Tipo de entrega</div>
            <div style="color:#0f172a;font-weight:600;margin-top:4px">{{tipoEntrega}}</div>
          </div>
          {{/if}}

          {{#if tienda}}
          <div style="flex:1 1 220px;background:#f1f5f9;border-radius:10px;padding:12px">
            <div style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.04em">Tienda</div>
            <div style="color:#0f172a;font-weight:600;margin-top:4px">{{tienda}}</div>
          </div>
          {{/if}}

          {{#if fechaEntrega}}
          <div style="flex:1 1 220px;background:#f1f5f9;border-radius:10px;padding:12px">
            <div style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.04em">Fecha de entrega</div>
            <div style="color:#0f172a;font-weight:600;margin-top:4px">{{fechaEntrega}}</div>
          </div>
          {{/if}}
        </div>

        {{#if direccion}}
        <div style="margin-top:12px;background:#f1f5f9;border-radius:10px;padding:12px">
          <div style="color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.04em">Dirección de entrega</div>
          <div style="color:#0f172a;font-weight:600;margin-top:4px">
            {{direccion.linea1}}{{#if direccion.ciudad}}, {{direccion.ciudad}}{{/if}}{{#if direccion.provincia}}, {{direccion.provincia}}{{/if}}{{#if direccion.cp}} ({{direccion.cp}}){{/if}}
          </div>
        </div>
        {{/if}}
      </div>

      <!-- Tabla de artículos -->
      <div style="padding:20px 24px">
        <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
            <thead>
              <tr style="background:#f8fafc">
                <th align="left" style="padding:12px 16px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Producto</th>
                <th align="right" style="padding:12px 16px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Precio</th>
                <th align="right" style="padding:12px 16px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Cant.</th>
                <th align="right" style="padding:12px 16px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {{#each items}}
              <tr>
                <td style="padding:12px 16px;border-top:1px solid #e2e8f0;color:#0f172a">{{this.nombre}}</td>
                <td align="right" style="padding:12px 16px;border-top:1px solid #e2e8f0;color:#0f172a">{{this.precio}}</td>
                <td align="right" style="padding:12px 16px;border-top:1px solid #e2e8f0;color:#0f172a">{{this.cantidad}}</td>
                <td align="right" style="padding:12px 16px;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:600">{{this.subtotal}}</td>
              </tr>
              {{/each}}
              <tr>
                <td colspan="3" align="right" style="padding:14px 16px;border-top:1px solid #e2e8f0;color:#475569;font-size:13px">Total</td>
                <td align="right" style="padding:14px 16px;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:800">{{total}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CTA -->
      <div style="padding:0 24px 24px">
        {{#if ctaUrl}}
        <a href="{{ctaUrl}}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:700;border-radius:10px;padding:12px 16px">Ver pedido</a>
        {{/if}}
      </div>

      <!-- Footer -->
      <div style="padding:18px 24px;border-top:1px solid #eef2f7;color:#94a3b8;font-size:12px">
        Este es un mensaje automático de <strong style="color:#334155">El Caballo Goloso</strong>. No respondas a este correo.
      </div>
    </div>
  </div>
  `;

  const text = `
Tu pedido ${data.pedidoCodigo} ha cambiado de estado: ${data.prevEstado} -> ${data.nuevoEstado}
${data.comentario ? 'Nota: ' + data.comentario + '\n' : ''}

Resumen:
${(data.items || []).map(i => `- ${i.nombre} x${i.cantidad} = ${i.subtotal}`).join('\n')}
Total: ${data.total}

${data.ctaUrl ? 'Ver pedido: ' + data.ctaUrl : ''}
`.trim();

  return { html: render(html, data), text };
}

/**
 * Email: Solicitud de reseña tras la entrega
 */
function reviewRequestEmail(data) {
  const html = `
    <div style="background:#f8fafc;padding:24px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.06)">
        <div style="padding:20px 24px;border-bottom:1px solid #eef2f7">
          <div style="font-size:16px;color:#0f172a;font-weight:700">¿Te ha gustado tu pedido {{pedidoCodigo}}?</div>
        </div>
        <div style="padding:20px 24px">
          <p style="margin:0 0 8px;color:#0f172a;font-size:16px">Hola {{nombre}},</p>
          <p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.5">
            ¡Esperamos que lo disfrutaras! ¿Nos dejas una valoración? Tu opinión nos ayuda a mejorar.
          </p>
          <div style="margin-top:16px">
            <a href="{{reviewUrl}}" style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;padding:12px 16px">Dejar reseña</a>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #eef2f7;color:#94a3b8;font-size:12px">
          Gracias por confiar en <strong style="color:#334155">El Caballo Goloso</strong>.
        </div>
      </div>
    </div>`;
  const text = `¿Te ha gustado tu pedido ${data.pedidoCodigo}? Deja tu reseña: ${data.reviewUrl}`;
  return { html: render(html, data), text };
}

/**
 * Email: Oferta activada
 */
function offerActivatedEmail(data) {
  const html = `
    <div style="font-family:system-ui">
      <h2>¡Tienes una oferta activa!</h2>
      <p>Hola {{nombre}}, hemos activado una oferta especial para ti:</p>
      <p><b>{{titulo}}</b></p>
      <p>{{descripcion}}</p>
      {{#if validaHasta}}<p>Válida hasta: <b>{{validaHasta}}</b></p>{{/if}}
      {{#if ctaUrl}}<a href="{{ctaUrl}}">Ver oferta</a>{{/if}}
    </div>
  `;
  const text = `Oferta: ${data.titulo}${data.validaHasta ? ' (válida hasta ' + data.validaHasta + ')' : ''}${data.ctaUrl ? '\n' + data.ctaUrl : ''}`;
  return { html: render(html, data), text };
}

/**
 * Email: Restablecer contraseña
 */
function passwordResetEmail(data) {
  const html = `
    <div style="font-family:system-ui">
      <h2>Restablecer contraseña</h2>
      <p>Hola {{nombre}}, pulsa el botón para crear una nueva contraseña:</p>
      <p><a href="{{resetUrl}}">Restablecer contraseña</a></p>
      <p>Si no lo solicitaste, ignora este correo.</p>
    </div>
  `;
  const text = `Restablece tu contraseña: ${data.resetUrl}`;
  return { html: render(html, data), text };
}

// ✅ Export único con TODAS las funciones
module.exports = {
  orderStatusEmail,
  reviewRequestEmail,
  offerActivatedEmail,
  passwordResetEmail
};
