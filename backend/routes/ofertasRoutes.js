const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Ofertas = require('../models/Ofertas');
const Productos = require('../models/Productos');
const Usuario = require('../models/Usuario');
const OfertasCliente = require('../models/OfertasCliente'); // ✅ Añadir esta línea

/**
 * GET /api/ofertas
 * Devuelve todas las ofertas activas (públicas)
 */
router.get('/', async (req, res) => {
    try {
        const hoy = new Date();
        const ofertas = await Ofertas.findAll({
            where: {
                fechaInicio: { [Op.lte]: hoy },
                fechaFin: { [Op.gte]: hoy }
            },
            include: { model: Productos, as: 'producto' }
        });
        res.json(ofertas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener ofertas activas' });
    }
});

/**
 * GET /api/ofertas/cliente/:id
 * Devuelve las ofertas activas aplicables a un cliente específico
 */
router.get('/cliente/:id', async (req, res) => {
    const { id } = req.params;
    const hoy = new Date();

    try {
        // 1. Ofertas generales
        const ofertasGenerales = await Ofertas.findAll({
            where: {
                fechaInicio: { [Op.lte]: hoy },
                fechaFin: { [Op.gte]: hoy }
            },
            include: { model: Productos, as: 'producto' }
        });

        // 2. Ofertas asignadas al cliente
        const usuario = await Usuario.findByPk(id, {
            include: {
                model: Ofertas,
                as: 'ofertas',
                where: {
                    fechaInicio: { [Op.lte]: hoy },
                    fechaFin: { [Op.gte]: hoy }
                },
                include: { model: Productos, as: 'producto' }
            }
        });

        const ofertasPersonalizadas = usuario ? usuario.ofertas : [];

        // 3. Combinar y evitar duplicados
        const idsVistos = new Set();
        const todas = [...ofertasGenerales, ...ofertasPersonalizadas].filter(o => {
            if (idsVistos.has(o.id)) return false;
            idsVistos.add(o.id);
            return true;
        });

        res.json(todas);
    } catch (err) {
        console.error('❌ Error al obtener ofertas del cliente:', err);
        res.status(500).json({ error: 'Error al obtener ofertas del cliente' });
    }
});

/**
 * POST /api/ofertas/manual
 * Crea una nueva oferta manual (para todos o clientes específicos)
 */
router.post('/manual', async (req, res) => {
    const { productoId, descuento, fechaInicio, fechaFin, motivo, userIds = [] } = req.body;

    try {
        const nuevaOferta = await Ofertas.create({
            productoId,
            descuento,
            fechaInicio,
            fechaFin
        });

        // Si hay usuarios concretos
        for (const userId of userIds) {
            await OfertasCliente.create({ ofertaId: nuevaOferta.id, userId });
        }

        res.status(201).json({ msg: 'Oferta creada correctamente', oferta: nuevaOferta });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear la oferta' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await OfertasCliente.destroy({ where: { ofertaId: id } }); // eliminar relaciones
        const borradas = await Ofertas.destroy({ where: { id } }); // eliminar oferta
        if (borradas === 0) return res.status(404).json({ error: 'Oferta no encontrada' });
        res.json({ msg: '✅ Oferta eliminada correctamente' });
    } catch (err) {
        console.error('❌ Error al eliminar oferta:', err);
        res.status(500).json({ error: 'Error al eliminar la oferta' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { productoId, descuento, fechaInicio, fechaFin, motivo } = req.body;

    try {
        const oferta = await Ofertas.findByPk(id);
        if (!oferta) return res.status(404).json({ error: 'Oferta no encontrada' });

        oferta.productoId = productoId ?? oferta.productoId;
        oferta.descuento = descuento ?? oferta.descuento;
        oferta.fechaInicio = fechaInicio ?? oferta.fechaInicio;
        oferta.fechaFin = fechaFin ?? oferta.fechaFin;

        await oferta.save();
        res.json({ msg: '✅ Oferta actualizada correctamente', oferta });
    } catch (err) {
        console.error('❌ Error al actualizar oferta:', err);
        res.status(500).json({ error: 'Error al actualizar la oferta' });
    }
});



module.exports = router;
