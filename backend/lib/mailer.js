// backend/lib/mailer.js
const dotenv = require('dotenv');
dotenv.config(); // garantiza .env cargado SIEMPRE aquí

const nodemailer = require('nodemailer');

let _mailer = null;
function getMailer() {
  if (!_mailer) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 2525);
    const secure = port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.error('❌ SMTP env incompletas:', {
        host,
        port,
        secure,
        user: user ? '***' : '(vacío)',
        pass: pass ? '***' : '(vacío)',
        from: process.env.SMTP_FROM || '(vacío)'
      });
    }

    _mailer = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      logger: process.env.MAIL_DEBUG === 'true',
      debug: process.env.MAIL_DEBUG === 'true'
    });
  }
  return _mailer;
}

async function verifyMailer() {
  try {
    await getMailer().verify();
    console.log(`📧 SMTP conectado: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} (from=${process.env.SMTP_FROM})`);
  } catch (e) {
    console.error('❌ Error SMTP (verify):', e?.message || e);
  }
}

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || '"El Caballo Goloso" <no-reply@caballogoloso.com>';
  try {
    const info = await getMailer().sendMail({ from, to, subject, text, html });
    // Nodemailer suele devolver messageId
    if (info?.messageId) {
      console.log(`✉️  Enviado a ${to} :: ${subject} :: messageId=${info.messageId}`);
    } else {
      console.log(`✉️  Enviado a ${to} :: ${subject}`);
    }
    return info;
  } catch (e) {
    console.error(`❌ Error enviando a ${to} :: ${subject} ->`, e?.message || e);
    throw e;
  }
}

module.exports = { verifyMailer, sendEmail };
