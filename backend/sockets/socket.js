const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat");
const Mensaje = require("../models/Mensaje");

function iniciarSockets(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // Middleware para autenticar al conectar
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Token no proporcionado"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.usuario = decoded; // Guardamos el usuario autenticado
      next();
    } catch (error) {
      return next(new Error("Token inválido"));
    }
  });

  // Conexión
  io.on("connection", (socket) => {
    const usuario = socket.usuario;
    const usuarioId = usuario.id;
    console.log(`🟢 Usuario conectado: ${usuarioId}`);

    // Entrar a una sala personal para recibir mensajes
    socket.join(usuarioId);

    // Recibir mensaje
    socket.on("mensaje", async ({ paraId, contenido }) => {
      try {
        // Buscar si ya existe un chat entre estas personas
        let chat = await Chat.findOne({
          clienteId: usuario.rol === 'cliente' ? usuarioId : paraId,
          empleadoId: usuario.rol === 'empleado' ? usuarioId : paraId,
          estado: 'abierto',
        });

        // Si no existe, crearlo
        if (!chat) {
          chat = await Chat.create({
            clienteId: usuario.rol === 'cliente' ? usuarioId : paraId,
            empleadoId: usuario.rol === 'empleado' ? usuarioId : null,
          });
        }

        // Si el empleado responde y el chat no tenía asignado uno, lo asignamos
        if (usuario.rol === 'empleado' && !chat.empleadoId) {
          chat.empleadoId = usuarioId;
          await chat.save();
        }

        // Guardar mensaje en DB
        const mensaje = await Mensaje.create({
          chatId: chat._id,
          de: usuarioId,
          para: paraId,
          contenido,
        });

        // Emitir al destinatario (si está conectado)
        io.to(paraId).emit("mensaje", mensaje);

        // Emitir también al remitente para mostrar el eco
        socket.emit("mensaje", mensaje);
      } catch (err) {
        console.error("❌ Error al enviar mensaje:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Usuario desconectado: ${usuarioId}`);
    });
  });
}

module.exports = iniciarSockets;
