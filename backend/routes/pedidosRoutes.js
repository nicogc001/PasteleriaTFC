const express = require('express');
const router = express.Router();
const { Pedidos, ProductosPedidos, Productos, Usuario } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const generarFacturaPDF = require('../utils/generarFacturaPDF');
const enviarFacturaEmail = require('../utils/enviarFacturaEmail');

// 🔹 Obtener los pedidos del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const esCliente = req.user.rol === 'cliente';

    const pedidos = await Pedidos.findAll({
      where: esCliente ? { usuarioId: req.user.id } : {},
      include: [
        { model: ProductosPedidos, include: [Productos] },
        ...(esCliente ? [] : [{ model: Usuario, attributes: ['id', 'nombre', 'email'] }])
      ],
      order: [['fecha', 'DESC']]
    });

    res.json(pedidos);
  } catch (err) {
    console.error('❌ Error al obtener pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// 🔹 Crear un nuevo pedido
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // items: [{ productoId, cantidad }]
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El pedido no contiene productos.' });
    }

    let total = 0;
    const productosParaActualizar = [];

    for (const item of items) {
      const producto = await Productos.findByPk(item.productoId);

      if (!producto) {
        return res.status(404).json({ error: `Producto con ID ${item.productoId} no encontrado` });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({ error: `No hay suficiente stock de ${producto.nombre}` });
      }

      total += producto.precio * item.cantidad;
      productosParaActualizar.push({ producto, cantidad: item.cantidad });
    }

    const pedido = await Pedidos.create({
      usuarioId: req.user.id,
      fecha: new Date(),
      estado: 'pendiente',
      total
    });

    for (const { producto, cantidad } of productosParaActualizar) {
      await ProductosPedidos.create({
        pedidoId: pedido.id,
        productoId: producto.id,
        cantidad
      });

      producto.stock -= cantidad;
      await producto.save();
    }

    res.status(201).json({ message: 'Pedido creado exitosamente', pedidoId: pedido.id });
  } catch (err) {
    console.error('❌ Error creando pedido:', err);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// 🔹 Confirmar un pedido (marcar como pagado, generar factura y enviarla)
router.put('/:id/confirmar', authMiddleware, async (req, res) => {
  try {
    const { metodoPago } = req.body;
    console.log('🔁 Confirmando pedido...');
    console.log('🧾 Método de pago recibido:', metodoPago);

    const pedido = await Pedidos.findOne({
      where: { id: req.params.id, usuarioId: req.user.id },
      include: [{ model: ProductosPedidos, include: [Productos] }, { model: Usuario }]
    });

    if (!pedido) {
      console.log('❌ Pedido no encontrado');
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    console.log('✅ Pedido encontrado:', pedido.id);

    pedido.estado = 'confirmado';
    pedido.metodoPago = metodoPago || 'N/A';
    await pedido.save();
    console.log('✅ Estado del pedido actualizado a confirmado');

    // 🧾 Generar factura PDF
    const rutaFactura = await generarFacturaPDF(pedido);
    console.log('✅ Factura generada en:', rutaFactura);

    // 📧 Enviar la factura al cliente
    await enviarFacturaEmail(pedido.Usuario.email, rutaFactura);
    console.log('📧 Factura enviada a:', pedido.Usuario.email);

    res.json({ message: 'Pedido confirmado, factura generada y enviada', factura: rutaFactura });

  } catch (err) {
    console.error('❌ Error confirmando pedido:', err);
    res.status(500).json({ error: 'Error al confirmar pedido o enviar factura' });
  }
});


// 🔹 Obtener detalle de un pedido por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const condicion = req.user.rol === 'cliente'
      ? { id: req.params.id, usuarioId: req.user.id }
      : { id: req.params.id };

    const pedido = await Pedidos.findOne({
      where: condicion,
      include: [{
        model: ProductosPedidos,
        include: [Productos]
      }]
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const productos = pedido.ProductosPedidos.map(item => ({
      nombre: item.Producto.nombre,
      cantidad: item.cantidad,
      subtotal: item.Producto.precio * item.cantidad
    }));

    res.json({
      id: pedido.id,
      fecha: pedido.fecha,
      estado: pedido.estado,
      total: pedido.total,
      productos
    });
  } catch (err) {
    console.error('❌ Error al obtener detalle del pedido:', err);
    res.status(500).json({ error: 'Error al obtener el detalle del pedido' });
  }
});


// ✅ Cambiar el estado de un pedido
router.put('/:id/estado', authMiddleware, async (req, res) => {
  try {
      const pedido = await Pedidos.findByPk(req.params.id);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

      pedido.estado = req.body.estado;
      await pedido.save();

      res.json({ message: 'Estado actualizado correctamente', pedido });
  } catch (err) {
      console.error("❌ Error actualizando estado:", err);
      res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
