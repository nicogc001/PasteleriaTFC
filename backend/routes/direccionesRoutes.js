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
    console.error("Error al obtener direcciones:", error);
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
});

// Crear nueva dirección
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { calle, cp, provincia, localidad, notas } = req.body;
    if (!calle || !cp || !provincia || !localidad) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' });
    }

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
    console.error("Error al crear dirección:", error);
    res.status(500).json({ error: 'Error al crear dirección' });
  }
});

// ✏️ Actualizar dirección
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const direccion = await Direccion.findByPk(id);

    if (!direccion || direccion.usuarioId !== req.user.id) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    const { calle, cp, provincia, localidad, notas } = req.body;
    if (!calle || !cp || !provincia || !localidad) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos' });
    }

    direccion.calle = calle;
    direccion.cp = cp;
    direccion.provincia = provincia;
    direccion.localidad = localidad;
    direccion.notas = notas;

    await direccion.save();

    res.json(direccion);
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    res.status(500).json({ error: 'Error al actualizar dirección' });
  }
});

// Eliminar dirección
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const direccion = await Direccion.findByPk(id);

    if (!direccion || direccion.usuarioId !== req.user.id) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    await direccion.destroy();
    res.json({ message: 'Dirección eliminada correctamente' });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    res.status(500).json({ error: 'Error al eliminar dirección' });
  }
});

module.exports = router;
