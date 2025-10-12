// backend/routes/testEmail.js
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../lib/mailer');

router.get('/api/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'test@example.com',
      subject: 'Prueba Mailtrap desde Render ✅',
      html: '<h2>Hola!</h2><p>Esto es una prueba 🍰</p>',
      html: '<h2>Hola!</h2><p>Esto es una prueba 🍰 prueba de envio prueba de envio...</p>',
    });
    res.json({ ok: true, msg: 'Correo enviado correctamente ✅' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
