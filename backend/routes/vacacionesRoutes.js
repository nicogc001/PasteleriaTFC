const express = require('express');
const router = express.Router();
const VacasSolicitud = require('../models/VacasSolicitud');
const Usuario = require('../models/Usuario');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// ===================== EMPLEADOS =====================

// 1. Solicitar vacaciones
router.post('/solicitar', authMiddleware, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, motivo } = req.body;
    const empleado_id = req.usuario.id;

    const nueva = await VacasSolicitud.create({
      empleado_id,
      fecha_inicio,
      fecha_fin,
      motivo
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'No se pudo crear la solicitud' });
  }
});

// 2. Ver mis solicitudes
router.get('/mis-solicitudes/:empleadoId', authMiddleware, async (req, res) => {
  try {
    const { empleadoId } = req.params;
    if (parseInt(empleadoId) !== req.usuario.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const solicitudes = await VacasSolicitud.findAll({
      where: { empleado_id: empleadoId },
      order: [['fecha_solicitud', 'DESC']]
    });

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// 3. Ver calendario global de vacaciones aprobadas
router.get('/calendario', authMiddleware, async (req, res) => {
  try {
    const solicitudes = await VacasSolicitud.findAll({
      where: { estado: 'aprobado' },
      include: [{ model: Usuario, as: 'empleado', attributes: ['id', 'nombre', 'apellidos'] }],
      order: [['fecha_inicio', 'ASC']]
    });

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener calendario:', error);
    res.status(500).json({ error: 'Error al recuperar calendario' });
  }
});

// 4. Aceptar sugerencia del administrador
router.post('/aceptar-sugerencia/:id', authMiddleware, async (req, res) => {
  try {
    const solicitud = await VacasSolicitud.findByPk(req.params.id);
    if (!solicitud || solicitud.empleado_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const nueva = await VacasSolicitud.create({
      empleado_id: solicitud.empleado_id,
      fecha_inicio: solicitud.fecha_sugerida_inicio,
      fecha_fin: solicitud.fecha_sugerida_fin,
      motivo: 'Aceptación de sugerencia del administrador'
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al aceptar sugerencia:', error);
    res.status(500).json({ error: 'No se pudo aceptar la sugerencia' });
  }
});


// ===================== ADMINISTRADOR =====================

// 5. Ver todas las solicitudes pendientes
router.get('/pendientes', authMiddleware, isAdmin, async (req, res) => {
  try {
    const solicitudes = await VacasSolicitud.findAll({
      where: { estado: 'pendiente' },
      include: [{ model: Usuario, as: 'empleado', attributes: ['id', 'nombre', 'apellidos', 'email'] }],
      order: [['fecha_solicitud', 'ASC']]
    });

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener pendientes:', error);
    res.status(500).json({ error: 'No se pudieron obtener las solicitudes' });
  }
});

// 6. Aprobar solicitud
router.put('/:id/aprobar', authMiddleware, isAdmin, async (req, res) => {
  try {
    const solicitud = await VacasSolicitud.findByPk(req.params.id);
    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

    solicitud.estado = 'aprobado';
    await solicitud.save();

    res.json({ mensaje: 'Solicitud aprobada', solicitud });
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ error: 'No se pudo aprobar la solicitud' });
  }
});

// 7. Rechazar o rechazar con sugerencia
router.put('/:id/rechazar', authMiddleware, isAdmin, async (req, res) => {
  try {
    const solicitud = await VacasSolicitud.findByPk(req.params.id);
    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

    solicitud.estado = 'rechazado';
    solicitud.fecha_sugerida_inicio = req.body.fecha_sugerida_inicio || null;
    solicitud.fecha_sugerida_fin = req.body.fecha_sugerida_fin || null;
    solicitud.comentario_admin = req.body.comentario || null;

    await solicitud.save();

    res.json({ mensaje: 'Solicitud rechazada', solicitud });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ error: 'No se pudo rechazar la solicitud' });
  }
});

module.exports = router;
