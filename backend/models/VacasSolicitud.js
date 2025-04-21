const { DataTypes } = require('sequelize');
const db = require('../config/db');

const VacasSolicitud = db.define('VacasSolicitud', {
  empleado_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
    defaultValue: 'pendiente'
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_sugerida_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_sugerida_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  comentario_admin: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_solicitud: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'vacaciones_solicitudes',
  timestamps: false
});

  
module.exports = VacasSolicitud;
