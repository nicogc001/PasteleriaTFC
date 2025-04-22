const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const Mensaje = require('../models/Mensaje');

// Middleware de autenticación para empleados
const verificarTokenEmpleado = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requerido' });

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.rol !== 'empleado') return res.status(403).json({ error: 'No autorizado' });

    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// GET /api/chats/abiertos
router.get('/abiertos', verificarTokenEmpleado, async (req, res) => {
  try {
    const chats = await Chat.find({ estado: 'abierto' });
    res.json(chats);
  } catch (err) {
    console.error('Error al obtener chats abiertos:', err);
    res.status(500).json({ error: 'Error al cargar los chats abiertos' });
  }
});

// GET /api/chats/:chatId/mensajes
router.get('/:chatId/mensajes', verificarTokenEmpleado, async (req, res) => {
  try {
    const { chatId } = req.params;
    const mensajes = await Mensaje.find({ chatId }).sort({ timestamp: 1 });
    res.json(mensajes);
  } catch (err) {
    console.error('Error al obtener mensajes del chat:', err);
    res.status(500).json({ error: 'Error al cargar los mensajes' });
  }
});

module.exports = router;
