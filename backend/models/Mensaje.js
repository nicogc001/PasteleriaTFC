// models/Mensaje.js
const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  de: { type: mongoose.Schema.Types.ObjectId, required: true },
  para: { type: mongoose.Schema.Types.ObjectId, required: true },
  contenido: { type: String, required: true },
  leido: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mensaje', mensajeSchema);
