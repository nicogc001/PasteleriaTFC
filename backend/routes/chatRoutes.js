// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const Mensaje = require('../models/Mensaje');
const { verificarTokenEmpleado, verificarTokenCliente } = require('../middleware/rolCheck');

// ==============================
// EMPLEADO
// ==============================

// GET /api/chats/abiertos
router.get('/abiertos', verificarTokenEmpleado, async (req, res) => {
  try {
    const chats = await Chat.find({
      estado: 'abierto',
      $or: [
        { empleadoId: req.user.id },
        { empleadoId: null }
      ]
    });
    res.json(chats);
  } catch (err) {
    console.error('Error al obtener chats abiertos:', err);
    res.status(500).json({ error: 'Error al cargar los chats abiertos' });
  }
});

// GET /api/chats/:chatId/mensajes (empleado)
router.get('/:chatId/mensajes', verificarTokenEmpleado, async (req, res, next) => {
  req._rol = 'empleado';
  next();
}, obtenerMensajes);

// ==============================
// CLIENTE
// ==============================

// GET /api/chats/mis-chats
router.get('/mis-chats', verificarTokenCliente, async (req, res) => {
  try {
    const chats = await Chat.find({ clienteId: req.user.id });
    res.json(chats);
  } catch (err) {
    console.error('Error al obtener los chats del cliente:', err);
    res.status(500).json({ error: 'Error al cargar los chats del cliente' });
  }
});

// GET /api/chats/cliente/:chatId/mensajes (cliente)
router.get('/cliente/:chatId/mensajes', verificarTokenCliente, async (req, res, next) => {
  req._rol = 'cliente';
  next();
}, obtenerMensajes);

// ==============================
// FUNCION COMPARTIDA
// ==============================

async function obtenerMensajes(req, res) {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByPk(chatId);

    if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });

    if (req._rol === 'empleado') {
      if (chat.empleadoId && chat.empleadoId !== req.user.id) {
        return res.status(403).json({ error: 'No autorizado para este chat' });
      }
    } else if (req._rol === 'cliente') {
      if (chat.clienteId !== req.user.id) {
        return res.status(403).json({ error: 'No autorizado para este chat' });
      }
    }

    const mensajes = await Mensaje.findAll({
      where: { chatId },
      order: [['timestamp', 'ASC']]
    });

    res.json(mensajes);
  } catch (err) {
    console.error('Error al obtener mensajes:', err);
    res.status(500).json({ error: 'Error al cargar los mensajes' });
  }
}

// POST /api/chats/:chatId/mensajes - guardar mensaje nuevo
router.post('/:chatId/mensajes', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token requerido' });
  
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { chatId } = req.params;
      const { contenido, paraId } = req.body;
  
      if (!contenido) return res.status(400).json({ error: 'Mensaje vacío' });
  
      const nuevo = await Mensaje.create({
        chatId,
        de: decoded.id,
        para: paraId,
        contenido,
        timestamp: new Date()
      });
  
      res.status(201).json(nuevo);
    } catch (err) {
      console.error('❌ Error al guardar mensaje:', err);
      res.status(500).json({ error: 'No se pudo guardar el mensaje' });
    }
  });
  

module.exports = router;