const express = require('express');
const Productos = require('../models/Productos');
const Pedidos = require('../models/Pedidos');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ IMPORTADO
const router = express.Router();

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;

        if (!nombre || !descripcion || !precio || stock === undefined || !imagen || !categoria) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const nuevoProducto = await Productos.create({
            nombre, descripcion, precio, stock, imagen, categoria
        });

        res.status(201).json({
            message: 'Producto creado correctamente',
            producto: nuevoProducto
        });
    } catch (error) {
        console.error('❌ Error al crear producto:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener productos (con filtro opcional por categoría)
router.get('/', async (req, res) => {
    try {
        const { categoria } = req.query;

        const whereClause = categoria ? { categoria: categoria.toLowerCase() } : {};

        const productos = await Productos.findAll({
            where: whereClause,
            attributes: ['id', 'nombre', 'descripcion', 'precio', 'stock', 'imagen', 'categoria']
        });

        if (productos.length === 0) {
            return res.status(404).json({ error: 'No hay productos registrados' });
        }

        res.json(productos);
    } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar stock de un producto
router.put('/:id', async (req, res) => {
    try {
        const { stock } = req.body;
        const { id } = req.params;

        const producto = await Productos.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        if (stock < 0) {
            return res.status(400).json({ error: 'El stock no puede ser negativo' });
        }

        producto.stock = stock;
        await producto.save();

        res.json({ message: 'Stock actualizado correctamente', producto });

    } catch (error) {
        console.error('❌ Error al actualizar stock:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});



module.exports = router;
