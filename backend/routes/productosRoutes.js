const express = require('express');
const Productos = require('../models/Productos');
const Pedidos = require('../models/Pedidos');
const authMiddleware = require('../middleware/authMiddleware'); 
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
const HistorialStock = require('../models/HistorialStock'); // 👈 Asegúrate de importar esto también

// Actualizar stock de un producto y registrar historial
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

        const stockAnterior = producto.stock;
        const diferencia = stock - stockAnterior;

        if (diferencia !== 0) {
            await producto.update({ stock });

            await HistorialStock.create({
                productoId: producto.id,
                stockAnterior,
                stockNuevo: stock,
                diferencia
            });

            res.json({ message: 'Stock actualizado y registrado en historial', producto });
        } else {
            res.json({ message: 'El stock no ha cambiado', producto });
        }

    } catch (error) {
        console.error('❌ Error al actualizar stock:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// GET /api/productos/:id/historial
router.get('/:id/historial', async (req, res) => {
    try {
      const producto = await Productos.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
  
      const historial = await HistorialStock.findAll({
        where: { productoId: req.params.id },
        order: [['fecha', 'DESC']]
      });
  
      res.json({
        producto: {
          id: producto.id,
          nombre: producto.nombre
        },
        historial
      });
    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
  

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Productos.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error('❌ Error al obtener producto por ID:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

  

// Eliminar un producto por ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Productos.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await producto.destroy();

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


  

module.exports = router;
