// backend/models/EmailLog.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const EmailLog = db.define('EmailLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tipo: { type: DataTypes.STRING, allowNull: false },        // 'pedido_estado' | 'review' | 'oferta' | 'password_reset'
  entidadId: { type: DataTypes.INTEGER, allowNull: false },  // id del pedido/oferta/usuario relacionado
  to: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  estado: { type: DataTypes.STRING, defaultValue: 'pending' }, // 'pending' | 'ok' | 'error'
  messageId: { type: DataTypes.STRING, allowNull: true },
  error: { type: DataTypes.TEXT, allowNull: true },
  html: { type: DataTypes.TEXT, allowNull: true },
  text: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'EmailLogs',
  timestamps: true
});

module.exports = EmailLog;
