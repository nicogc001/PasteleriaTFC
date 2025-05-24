const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { Chat, Mensaje } = require("../models");

function iniciarSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5500",
        "https://pasteleriatfc.vercel.app"
      ],
      credentials: true
    }
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Token no proporcionado"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.usuario = decoded;
      next();
    } catch (err) {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket) => {
    const usuario = socket.usuario;
    const usuarioId = usuario.id;

    console.log(`🟢 Usuario conectado: ${usuarioId} (${usuario.rol})`);

    // Cliente: sala individual
    socket.join(usuarioId.toString());

    // Empleado: sala común
    if (usuario.rol === "empleado") {
      socket.join("sala-empleados");
      console.log(`👨‍💻 Empleado ${usuarioId} unido a sala-empleados`);
    }

    // Evento de mensaje
    socket.on("mensaje", async ({ paraId, contenido }) => {
      try {
        if (!contenido) return;

        // Buscar o crear el chat
        let chat = await Chat.findOne({
          where: {
            clienteId: usuario.rol === 'cliente' ? usuarioId : paraId,
            estado: 'abierto'
          }
        });

        if (!chat) {
          chat = await Chat.create({
            clienteId: usuario.rol === 'cliente' ? usuarioId : paraId,
            empleadoId: null,
            estado: 'abierto'
          });
        }

        // Si es empleado y no está asignado aún
        if (usuario.rol === 'empleado' && !chat.empleadoId) {
          chat.empleadoId = usuarioId;
          await chat.save();
        }

        // Crear mensaje
        const mensaje = await Mensaje.create({
          chatId: chat.id,
          de: usuarioId,
          para: paraId,
          contenido,
          timestamp: new Date()
        });

        // Emitir al destinatario
        io.to(paraId.toString()).emit("mensaje", mensaje);

        // Si es cliente, mandar a la sala de empleados
        if (usuario.rol === 'cliente') {
          io.to("sala-empleados").emit("mensaje", mensaje);
        }

        // Echo para el remitente
        socket.emit("mensaje", mensaje);

      } catch (err) {
        console.error("Error al procesar mensaje:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${usuarioId}`);
    });
  });
}

module.exports = iniciarSockets;
