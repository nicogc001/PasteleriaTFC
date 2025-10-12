// lib/mailer.js
const nodemailer = require("nodemailer");

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 2525),
  secure: Number(process.env.SMTP_PORT) === 465, // true si TLS directo
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function verifyMailer() {
  try {
    await mailer.verify();
    console.log("📧 SMTP (Mailtrap) conectado correctamente");
  } catch (e) {
    console.error("❌ Error SMTP:", e?.message || e);
  }
}

async function sendEmail({ to, subject, html, text }) {
  return mailer.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { mailer, verifyMailer, sendEmail };
