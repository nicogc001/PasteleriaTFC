const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Chat, Mensaje } = require('../models');
const { verificarTokenEmpleado, verificarTokenCliente } = require('../middleware/rolCheck');

console.log("Chat model disponible:", typeof Chat?.findOne === "function");

// ==============================
// CLIENTE
// ==============================

// GET /api/chats/mis-chats (cliente)
router.get('/mis-chats', verificarTokenCliente, async (req, res) => {
  try {
    console.log("Buscando chat del cliente:", req.user.id);
    let chat = await Chat.findOne({ where: { clienteId: req.user.id } });

    if (!chat) {
      console.log("🆕 No existe chat, creando nuevo...");
      chat = await Chat.create({
        clienteId: req.user.id,
        estado: 'abierto',
        empleadoId: null
      });
    }

    res.json([chat]);
  } catch (err) {
    console.error('Error al obtener/crear chat del cliente:', err);
    res.status(500).json({ error: 'Error al procesar el chat del cliente' });
  }
});

// GET /api/chats/cliente/:chatId/mensajes
router.get('/cliente/:chatId/mensajes', verificarTokenCliente, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByPk(chatId);

    if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
    if (chat.clienteId !== req.user.id) return res.status(403).json({ error: 'No autorizado para este chat' });

    const mensajes = await Mensaje.findAll({
      where: { chatId },
      order: [['timestamp', 'ASC']]
    });

    console.log(`📨 Cliente ${req.user.id} cargó ${mensajes.length} mensajes`);
    res.json(mensajes);
  } catch (err) {
    console.error('Error al obtener mensajes (cliente):', err);
    res.status(500).json({ error: 'Error al cargar los mensajes' });
  }
});


// ==============================
// EMPLEADO
// ==============================

// GET /api/chats/abiertos
router.get('/abiertos', verificarTokenEmpleado, async (req, res) => {
  try {
    const chats = await Chat.findAll({
      where: { estado: 'abierto' },
      include: [{ association: 'cliente' }]
    });

    console.log(`📡 Empleado ${req.user.id} cargó ${chats.length} chats abiertos`);
    res.json(chats);
  } catch (err) {
    console.error('Error al obtener chats abiertos:', err);
    res.status(500).json({ error: 'Error al cargar los chats abiertos' });
  }
});

// GET /api/chats/:chatId/mensajes (empleado)
router.get('/:chatId/mensajes', verificarTokenEmpleado, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });

    const mensajes = await Mensaje.findAll({
      where: { chatId },
      order: [['timestamp', 'ASC']]
    });

    console.log(`Empleado ${req.user.id} cargó ${mensajes.length} mensajes de chat ${chatId}`);
    res.json(mensajes);
  } catch (err) {
    console.error('Error al obtener mensajes (empleado):', err);
    res.status(500).json({ error: 'Error al cargar los mensajes' });
  }
});


// ==============================
// ENVIAR MENSAJE (ambos roles)
// ==============================

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
      para: paraId || null,
      contenido,
      timestamp: new Date()
    });

    console.log(`Nuevo mensaje en chat ${chatId} de ${decoded.id} a ${paraId || "desconocido"}`);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al guardar mensaje:', err);
    res.status(500).json({ error: 'No se pudo guardar el mensaje' });
  }
});

module.exports = router;
