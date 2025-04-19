const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generarFacturaPDF(pedido) {
  return new Promise((resolve, reject) => {
    try {
      const nombreCliente = pedido.Usuario?.nombre || 'Cliente';
      const fecha = new Date(pedido.fecha).toLocaleDateString('es-ES');
      const nombreArchivo = `factura_${pedido.id}.pdf`;
      const rutaFactura = path.join(__dirname, '..', 'facturas', nombreArchivo);

      // Crear carpeta si no existe
      const carpetaFacturas = path.dirname(rutaFactura);
      if (!fs.existsSync(carpetaFacturas)) fs.mkdirSync(carpetaFacturas, { recursive: true });

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(rutaFactura);
      doc.pipe(stream);

      // Encabezado
      doc.fontSize(20).text('Factura', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Factura Nº: ${pedido.id}`);
      doc.text(`Fecha: ${fecha}`);
      doc.text(`Cliente: ${nombreCliente}`);
      doc.text(`Método de pago: ${pedido.metodoPago || 'N/A'}`);
      doc.moveDown();

      // Productos
      doc.text('Productos:', { underline: true });
      pedido.ProductosPedidos.forEach(pp => {
        const nombre = pp.Producto?.nombre || 'Producto';
        const cantidad = pp.cantidad;
        const precio = pp.Producto?.precio || 0;
        const subtotal = cantidad * precio;
        doc.text(`- ${nombre} x${cantidad} → ${subtotal.toFixed(2)} €`);
      });

      doc.moveDown();
      doc.fontSize(14).text(`Total: ${pedido.total.toFixed(2)} €`, { align: 'right' });

      doc.end();

      stream.on('finish', () => resolve(rutaFactura));
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generarFacturaPDF;
