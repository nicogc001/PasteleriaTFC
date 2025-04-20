const { DataTypes } = require('sequelize');
const db = require('../config/db');

const SolicitudEmpleo = db.define('SolicitudEmpleo', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT
  },
  cv_url: {
    type: DataTypes.STRING
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'solicitudes_empleo',
  timestamps: false
});

module.exports = SolicitudEmpleo;
