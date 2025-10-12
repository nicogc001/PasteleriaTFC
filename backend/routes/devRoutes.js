// routes/devRoutes.js
const express = require("express");
const { sendEmail } = require("../lib/mailer");
const router = express.Router();

router.post("/send-test-email", async (req, res) => {
  try {
    if (req.header("x-test-token") !== process.env.TEST_EMAIL_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { to = "test@demomailtrap.io" } = req.body || {};

    await sendEmail({
      to,
      subject: "Prueba de correo | El Caballo Goloso",
      html: `<p>Hola 👋, este es un correo de prueba enviado desde el backend de El Caballo Goloso.</p>`,
      text: "Correo de prueba enviado correctamente.",
    });

    res.json({ ok: true, message: "Correo enviado correctamente ✅" });
  } catch (err) {
    console.error("Error al enviar correo:", err);
    res.status(500).json({ ok: false, error: err.message || "Error enviando correo" });
  }
});

module.exports = router;
