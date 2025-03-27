const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const RegistroHorario = require('../models/RegistroHorarios');
const Usuario = require('../models/Usuario');
const router = express.Router();

// ✅ Ruta para registrar entrada del empleado
router.post('/entrada', authMiddleware, async (req, res) => {
    try {
        const empleadoId = req.user.id;
        const fecha = new Date().toISOString().split('T')[0];

        const registroExistente = await RegistroHorario.findOne({ where: { empleadoId, fecha } });
        if (registroExistente) {
            return res.status(400).json({ error: 'Ya has registrado tu entrada hoy' });
        }

        const nuevoRegistro = await RegistroHorario.create({
            empleadoId,
            fecha,
            horaEntrada: new Date().toTimeString().split(' ')[0]
        });

        res.status(201).json({ message: 'Entrada registrada correctamente', registro: nuevoRegistro });
    } catch (error) {
        console.error('❌ Error al registrar entrada:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ✅ Ruta para registrar salida del empleado
router.put('/salida', authMiddleware, async (req, res) => {
    try {
        const empleadoId = req.user.id;
        const fecha = new Date().toISOString().split('T')[0];

        const registro = await RegistroHorario.findOne({ where: { empleadoId, fecha } });

        if (!registro) {
            return res.status(400).json({ error: 'No hay registro de entrada para hoy' });
        }
        if (registro.horaSalida) {
            return res.status(400).json({ error: 'Ya has registrado tu salida hoy' });
        }

        registro.horaSalida = new Date().toTimeString().split(' ')[0];
        await registro.save();

        res.json({ message: 'Salida registrada correctamente', registro });
    } catch (error) {
        console.error('❌ Error al registrar salida:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ✅ Ruta GET para obtener todos los horarios (para administrador)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const registros = await RegistroHorario.findAll({
            include: [{ model: Usuario, attributes: ['nombre'] }],
            order: [['fecha', 'DESC']]
        });

        const result = registros.map(r => ({
            empleadoNombre: r.Usuario.nombre,
            tienda: r.tienda,
            fecha: r.fecha,
            entrada: r.horaEntrada,
            salida: r.horaSalida
        }));

        res.json(result);
    } catch (error) {
        console.error('❌ Error al obtener horarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ✅ Ruta POST para asignar horarios manualmente (por administrador)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { usuarioId, tienda, fecha, entrada, salida } = req.body;

        if (!usuarioId || !tienda || !fecha || !entrada || !salida) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const nuevoHorario = await RegistroHorario.create({
            empleadoId: usuarioId,
            tienda,
            fecha,
            horaEntrada: entrada,
            horaSalida: salida
        });

        res.status(201).json({ message: 'Horario asignado correctamente', horario: nuevoHorario });
    } catch (error) {
        console.error('❌ Error al asignar horario:', error);
        res.status(500).json({ error: 'Error al asignar horario' });
    }
});

module.exports = router;
