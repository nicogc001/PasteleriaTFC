const nodemailer = require('nodemailer');

async function enviarFacturaEmail(clienteEmail, filePath) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tuemail@gmail.com',         // 👈 Cambia esto por tu correo real
      pass: 'tu-contraseña-o-clave-app'  // 👈 Usa una contraseña de aplicación si tienes 2FA
    }
  });

  const mailOptions = {
    from: '"El Caballo Goloso" <tuemail@gmail.com>',
    to: clienteEmail,
    subject: 'Factura de tu pedido - El Caballo Goloso 🧁',
    text: 'Gracias por tu compra. Te adjuntamos la factura en PDF. ¡Esperamos que disfrutes nuestros productos!',
    attachments: [
      {
        filename: 'factura.pdf',
        path: filePath
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}

module.exports = enviarFacturaEmail;
