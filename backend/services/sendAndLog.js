const EmailLog = require('../models/EmailLog');
const { sendEmail } = require('../lib/mailer');

async function sendAndLog({ tipo, entidadId, to, subject, html, text }) {
  // 1️⃣ Crea el registro base
  const log = await EmailLog.create({
    tipo,
    entidadId,
    to,
    subject,
    html,
    text,
    estado: 'pending'
  });

  try {
    // 2️⃣ Envía el correo
    const info = await sendEmail({ to, subject, html, text });

    // 3️⃣ Actualiza el log con resultado
    await log.update({
      estado: 'ok',
      messageId: info?.messageId || null
    });

    return info;
  } catch (e) {
    // 4️⃣ Si falla, registra el error
    await log.update({
      estado: 'error',
      error: e?.message?.slice(0, 500) || 'Error desconocido'
    });
    throw e;
  }
}

module.exports = { sendAndLog };
