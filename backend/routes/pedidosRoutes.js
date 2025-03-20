const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Pedidos = require('../models/Pedidos');
const ProductosPedidos = require('../models/ProductosPedidos');
const Productos = require('../models/Productos');
const router = express.Router();

// Crear un nuevo pedido
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { productos } = req.body; // Array de productos con id y cantidad
        const usuarioId = req.user.id;

        if (!productos || productos.length === 0) {
            return res.status(400).json({ error: 'No se han proporcionado productos para el pedido' });
        }

        // Calcular el total del pedido
        let total = 0;
        for (const item of productos) {
            const producto = await Productos.findByPk(item.productoId);
            if (!producto) {
                return res.status(404).json({ error: `Producto con ID ${item.productoId} no encontrado` });
            }
            total += producto.precio * item.cantidad;
        }

        // Crear el pedido en la base de datos
        const nuevoPedido = await Pedidos.create({ usuarioId, total });

        // Guardar los productos asociados al pedido
        for (const item of productos) {
            await ProductosPedidos.create({
                pedidoId: nuevoPedido.id,
                productoId: item.productoId,
                cantidad: item.cantidad
            });
        }

        res.status(201).json({
            message: 'Pedido creado correctamente',
            pedido: nuevoPedido
        });

    } catch (error) {
        console.error('❌ Error al crear el pedido:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
