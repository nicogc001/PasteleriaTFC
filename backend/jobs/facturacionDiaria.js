const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Pedidos, ProductosPedidos, Productos, Usuario } = require('../models');
const enviarFacturaEmail = require('../utils/enviarFacturaEmail');

// 🕘 Todos los días a las 09:00
cron.schedule('0 9 * * *', async () => {
  try {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    ayer.setHours(0, 0, 0, 0);
    const fin = new Date(ayer);
    fin.setHours(23, 59, 59, 999);

    const pedidos = await Pedidos.findAll({
      where: {
        fecha: {
          $gte: ayer,
          $lte: fin
        },
        estado: 'confirmado'
      },
      include: [
        { model: ProductosPedidos, include: [Productos] },
        { model: Usuario }
      ],
      order: [['fecha', 'ASC']]
    });

    if (pedidos.length === 0) return console.log('📭 Sin pedidos para facturar ayer');

    const doc = new PDFDocument();
    const fileName = `facturacion_${ayer.toISOString().split('T')[0]}.pdf`;
    const filePath = path.join(__dirname, '..', 'facturas', fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(16).text('Resumen de facturación diaria', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${ayer.toLocaleDateString('es-ES')}`);
    doc.moveDown();

    let totalGlobal = 0;
    pedidos.forEach(pedido => {
      doc.text(`Pedido #${pedido.id} - Cliente: ${pedido.Usuario?.nombre || 'Desconocido'} (${pedido.Usuario?.email})`);
      pedido.ProductosPedidos.forEach(pp => {
        doc.text(`  - ${pp.Producto.nombre} x${pp.cantidad} → ${(pp.cantidad * pp.Producto.precio).toFixed(2)} €`);
      });
      doc.text(`  Total del pedido: ${pedido.total.toFixed(2)} €`);
      doc.moveDown();
      totalGlobal += pedido.total;
    });

    doc.fontSize(14).text(`TOTAL FACTURADO: ${totalGlobal.toFixed(2)} €`, { align: 'right' });

    doc.end();

    stream.on('finish', async () => {
      await enviarFacturaEmail('admin@caballogoloso.com', filePath);
      console.log('📧 Factura diaria enviada al administrador');
    });

  } catch (error) {
    console.error('❌ Error en la facturación diaria:', error);
  }
});
