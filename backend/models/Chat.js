// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    clienteId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Usuario' },
    empleadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado' }, // se asigna cuando responde
    estado: { type: String, enum: ['abierto', 'cerrado'], default: 'abierto' },
    creadoEn: { type: Date, default: Date.now },
    actualizadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
