const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const RegistroHorario = require('../models/RegistroHorarios');
const router = express.Router();

// Registrar entrada
router.post('/entrada', authMiddleware, async (req, res) => {
    try {
        const empleadoId = req.user.id;
        const fecha = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

        // Verificar si ya hay un registro de entrada para hoy
        const registroExistente = await RegistroHorario.findOne({ where: { empleadoId, fecha } });
        if (registroExistente) {
            return res.status(400).json({ error: 'Ya has registrado tu entrada hoy' });
        }

        // Crear nuevo registro de entrada
        const nuevoRegistro = await RegistroHorario.create({
            empleadoId,
            fecha,
            horaEntrada: new Date().toTimeString().split(' ')[0] // Hora actual en formato HH:MM:SS
        });

        res.status(201).json({ message: 'Entrada registrada correctamente', registro: nuevoRegistro });

    } catch (error) {
        console.error('❌ Error al registrar entrada:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Registrar salida
router.put('/salida', authMiddleware, async (req, res) => {
    try {
        const empleadoId = req.user.id;
        const fecha = new Date().toISOString().split('T')[0];

        // Buscar el registro del día
        const registro = await RegistroHorario.findOne({ where: { empleadoId, fecha } });

        if (!registro) {
            return res.status(400).json({ error: 'No hay registro de entrada para hoy' });
        }
        if (registro.horaSalida) {
            return res.status(400).json({ error: 'Ya has registrado tu salida hoy' });
        }

        // Actualizar la hora de salida
        registro.horaSalida = new Date().toTimeString().split(' ')[0]; // Hora actual en formato HH:MM:SS
        await registro.save();

        res.json({ message: 'Salida registrada correctamente', registro });

    } catch (error) {
        console.error('❌ Error al registrar salida:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener todos los registros de horario de un empleado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const empleadoId = req.user.id;

        const registros = await RegistroHorario.findAll({
            where: { empleadoId },
            attributes: ['fecha', 'horaEntrada', 'horaSalida'],
            order: [['fecha', 'DESC']]
        });

        if (registros.length === 0) {
            return res.status(404).json({ error: 'No hay registros de horario' });
        }

        res.json(registros);

    } catch (error) {
        console.error('❌ Error al obtener registros de horario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
