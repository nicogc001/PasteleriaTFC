const express = require('express');
const router = express.Router();
const { Pedidos, ProductosPedidos, Producto } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// 🔹 Obtener los pedidos del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pedidos = await Pedidos.findAll({
      where: { usuarioId: req.user.id },
      include: [{ model: ProductosPedidos, include: [Producto] }],
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

    // Calcular total
    let total = 0;
    const productosParaActualizar = [];

    for (const item of items) {
      const producto = await Producto.findByPk(item.productoId);
      if (!producto) return res.status(404).json({ error: `Producto con ID ${item.productoId} no encontrado` });

      if (producto.stock < item.cantidad) {
        return res.status(400).json({ error: `No hay suficiente stock de ${producto.nombre}` });
      }

      total += producto.precio * item.cantidad;
      productosParaActualizar.push({ producto, cantidad: item.cantidad });
    }

    // Crear el pedido
    const pedido = await Pedidos.create({
      usuarioId: req.user.id,
      fecha: new Date(),
      estado: 'pendiente',
      total
    });

    // Crear los ProductosPedidos y actualizar stock
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

// 🔹 Confirmar un pedido (marcar como pagado)
router.put('/:id/confirmar', authMiddleware, async (req, res) => {
  try {
    const pedido = await Pedidos.findOne({
      where: { id: req.params.id, usuarioId: req.user.id }
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    pedido.estado = 'confirmado';
    await pedido.save();

    res.json({ message: 'Pedido confirmado correctamente' });
  } catch (err) {
    console.error('❌ Error confirmando pedido:', err);
    res.status(500).json({ error: 'Error al confirmar pedido' });
  }
});

module.exports = router;
