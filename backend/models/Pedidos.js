// backend/models/Pedidos.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Pedidos = db.define('Pedidos', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
    // referencias y asociaciones se definen en models/index.js
  },

  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

  total: { type: DataTypes.FLOAT, allowNull: false },

  estado: {
    type: DataTypes.STRING, // si quieres, cámbialo a ENUM con tus estados
    allowNull: false,
    defaultValue: 'pendiente_pago'
  },

  metodoPago: { type: DataTypes.STRING, allowNull: true },

  tipoEntrega: { type: DataTypes.STRING, allowNull: false }, // 'enviar' | 'recoger'

  tienda: { type: DataTypes.STRING, allowNull: true },

  aprobadorId: { type: DataTypes.INTEGER, allowNull: true },

  aprobadoPorEmpleado: { type: DataTypes.BOOLEAN, defaultValue: false },

  segundoAprobadorId: { type: DataTypes.INTEGER, allowNull: true },

  aprobadoPorAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },

  fechaEntrega: { type: DataTypes.DATEONLY, allowNull: false },

  direccionId: { type: DataTypes.INTEGER, allowNull: true },

  // flag para job de reseñas (lo añadimos antes)
  resenaNotificada: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'Pedidos',
  timestamps: false
});

module.exports = Pedidos;
