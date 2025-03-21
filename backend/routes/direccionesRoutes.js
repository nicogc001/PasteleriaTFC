const express = require('express');
const router = express.Router();
const { Direccion } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener todas las direcciones del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const direcciones = await Direccion.findAll({
      where: { usuarioId: req.user.id }
    });
    res.json(direcciones);
  } catch (error) {
    console.error('❌ Error obteniendo direcciones:', error);
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
});

// Crear una nueva dirección
router.post('/', authMiddleware, async (req, res) => {
  const { calle, cp, provincia, localidad, notas } = req.body;
  if (!calle || !cp || !provincia || !localidad) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const direccion = await Direccion.create({
      calle,
      cp,
      provincia,
      localidad,
      notas,
      usuarioId: req.user.id
    });
    res.status(201).json(direccion);
  } catch (error) {
    console.error('❌ Error creando dirección:', error);
    res.status(500).json({ error: 'Error al crear dirección' });
  }
});

// Actualizar una dirección
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { calle, cp, provincia, localidad, notas } = req.body;

  try {
    const direccion = await Direccion.findOne({
      where: { id, usuarioId: req.user.id }
    });

    if (!direccion) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    direccion.calle = calle;
    direccion.cp = cp;
    direccion.provincia = provincia;
    direccion.localidad = localidad;
    direccion.notas = notas;

    await direccion.save();
    res.json(direccion);
  } catch (error) {
    console.error('❌ Error actualizando dirección:', error);
    res.status(500).json({ error: 'Error al actualizar dirección' });
  }
});

// Eliminar una dirección
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const direccion = await Direccion.findOne({
      where: { id, usuarioId: req.user.id }
    });

    if (!direccion) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    await direccion.destroy();
    res.json({ message: 'Dirección eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando dirección:', error);
    res.status(500).json({ error: 'Error al eliminar dirección' });
  }
});

module.exports = router;
